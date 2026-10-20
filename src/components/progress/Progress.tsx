import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { albumRoute, feedRoute } from '../../lib/routes';
import type { DeckSummary } from '../../lib/types';
import { Curio } from '../feed/Curio';
import { Feathers } from '../feed/Feathers';
import { ArrowLeftIcon, CheckIcon, DownloadIcon, UploadIcon } from '../feed/Icons';
import { localDay, readProgress, readStreak, writeProgress } from '../feed/progress';
import '../feed/feed.css';
import '../topics/topics.css';
import { MAX_BYTES, buildFile, fileName, parseFile, planMerge, type FileError, type ParsedFile } from './file';
import './progress.css';

type Problem = FileError | 'blocked';

type Import =
	| { kind: 'idle' }
	| { kind: 'preview'; parsed: ParsedFile; nothingNew: boolean }
	| { kind: 'done'; added: number; total: number; days: number; ignored: number }
	| { kind: 'error'; problem: Problem };

interface Mine {
	discoveries: number;
	missed: number;
	days: number;
}

const PROBLEM_TEXT: Record<Problem, string> = {
	'not-curio': 'Esse arquivo não parece ser do Curiô. Escolha o arquivo que o Curiô guardou (termina em .json). Nada foi mudado.',
	newer: 'Esse arquivo é de uma versão mais nova do Curiô. Atualize o app e tente de novo. Nada foi mudado.',
	'too-big': 'Esse arquivo é grande demais para ser do Curiô. Nada foi mudado.',
	empty: 'Não achei descobertas deste Curiô nesse arquivo. Nada foi mudado.',
	unreadable: 'Não consegui ler esse arquivo. Nada foi mudado.',
	blocked: 'Não consegui guardar neste aparelho. O navegador pode estar bloqueando o armazenamento. Tente de novo ou use outro navegador.',
};

/** "a", "a e b", "a, b e c" */
const joinList = (parts: string[]) => (parts.length < 2 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** What a progress holds, in words: "52 descobertas, 3 para rever e 5 dias seguidos" (only the parts that exist). */
function describe({ discoveries, missed, days }: Mine) {
	const parts: string[] = [];
	if (discoveries) parts.push(plural(discoveries, 'descoberta', 'descobertas'));
	if (missed) parts.push(`${missed} para rever`);
	if (days) parts.push(plural(days, 'dia seguido', 'dias seguidos'));
	return joinList(parts);
}

function savedOn(iso: string | null) {
	if (!iso) return '';
	const date = new Date(iso);
	const sameYear = date.getFullYear() === new Date().getFullYear();
	return `, guardado em ${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) })}`;
}

/** Saves the progress in a file and brings it back on another device. Everything stays on the device: nothing is uploaded. */
export default function Progress({ decks }: { decks: DeckSummary[] }) {
	const [mine, setMine] = useState<Mine | null>(null);
	const [savedAs, setSavedAs] = useState<string | null>(null);
	const [state, setState] = useState<Import>({ kind: 'idle' });
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	function refresh() {
		const progress = readProgress();
		setMine({ discoveries: progress.seen.length, missed: progress.missed.length, days: readStreak() });
	}
	useEffect(refresh, []);

	// A new panel (what the file has, the result, a problem): the focus goes to it, so screen readers read it
	useEffect(() => {
		if (state.kind !== 'idle') panelRef.current?.focus();
	}, [state.kind]);

	function save() {
		const file = buildFile();
		const name = fileName();
		const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = name;
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		setSavedAs(name);
	}

	async function onFile(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		// Empty the input, so choosing the same file again still counts
		input.value = '';
		if (!file) return;
		if (file.size > MAX_BYTES) return setState({ kind: 'error', problem: 'too-big' });

		let text: string;
		try {
			text = await file.text();
		} catch {
			return setState({ kind: 'error', problem: 'unreadable' });
		}
		const result = parseFile(text, file.size, decks, localDay(new Date()));
		if (!result.ok) return setState({ kind: 'error', problem: result.error });
		setState({ kind: 'preview', parsed: result, nothingNew: planMerge(readProgress(), result.progress).nothingNew });
	}

	function merge() {
		if (state.kind !== 'preview') return;
		// Planned again from what is on the device right now, not from when the file was chosen
		const plan = planMerge(readProgress(), state.parsed.progress);
		if (!writeProgress(plan.result)) return setState({ kind: 'error', problem: 'blocked' });
		refresh();
		setState({ kind: 'done', added: plan.added, total: plan.total, days: readStreak(), ignored: state.parsed.ignored });
	}

	const hasProgress = Boolean(mine && (mine.discoveries || mine.missed || mine.days));

	return (
		<div className="topics-page progress-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="progress">
				<div className="progress__hero">
					<Curio size={72} />
					<div>
						<h1 className="progress__title">Meu progresso</h1>
						<p className="progress__intro">Seu progresso fica só neste aparelho, sem cadastro. Para levar para outro, guarde um arquivo e traga lá.</p>
					</div>
				</div>

				<section className="step" aria-labelledby="save-title">
					<div className="step__head">
						<span className="step__num" aria-hidden="true">
							1
						</span>
						<h2 id="save-title" className="step__title">
							Guardar neste aparelho
						</h2>
					</div>
					{mine &&
						(hasProgress ? (
							<p className="step__text">Você tem {describe(mine)}.</p>
						) : (
							<p className="step__text">Ainda não há o que guardar. Responda algumas perguntas e volte aqui.</p>
						))}
					<div className="step__actions">
						<button type="button" className="button" onClick={save} disabled={!hasProgress}>
							<DownloadIcon size={22} />
							Guardar meu progresso
						</button>
						{mine && !hasProgress && (
							<a className="button button--quiet" href={feedRoute()}>
								Ir para as perguntas
							</a>
						)}
					</div>
					<p className="step__text step__text--soft" role="status">
						{savedAs ? `Arquivo guardado: ${savedAs}. No outro aparelho, abra Meu progresso e toque em Escolher o arquivo.` : ''}
					</p>
				</section>

				<section className="step" aria-labelledby="bring-title">
					<div className="step__head">
						<span className="step__num" aria-hidden="true">
							2
						</span>
						<h2 id="bring-title" className="step__title">
							Trazer para este aparelho
						</h2>
					</div>
					<p className="step__text">Escolha o arquivo que o Curiô guardou (termina em .json). Nada é apagado: o que vier se soma ao que você já tem.</p>
					<div className="step__actions">
						<input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={onFile} />
						<button type="button" className="button button--outline" onClick={() => inputRef.current?.click()}>
							<UploadIcon size={22} />
							Escolher o arquivo
						</button>
					</div>

					{state.kind === 'preview' && (
						<div className="panel" ref={panelRef} tabIndex={-1} aria-labelledby="panel-title">
							<h3 id="panel-title" className="panel__title">
								{state.nothingNew ? 'Você já tem tudo' : 'Encontrei isto no arquivo'}
							</h3>
							{state.nothingNew ? (
								<p>Você já tem tudo o que está nesse arquivo.</p>
							) : (
								<p>
									Este arquivo tem {describe({ discoveries: state.parsed.progress.seen.length, missed: state.parsed.progress.missed.length, days: state.parsed.progress.streak?.days ?? 0 })}
									{savedOn(state.parsed.exportedAt)}.
								</p>
							)}
							{state.parsed.ignored > 0 && (
								<p className="panel__note">
									{plural(state.parsed.ignored, 'item de uma pergunta que não existe mais foi ignorado', 'itens de perguntas que não existem mais foram ignorados')}.
								</p>
							)}
							<div className="panel__actions">
								{state.nothingNew ? (
									<button type="button" className="button" onClick={() => setState({ kind: 'idle' })}>
										Entendi
									</button>
								) : (
									<>
										<button type="button" className="button" onClick={merge}>
											Juntar ao que já tenho
										</button>
										<button type="button" className="button button--quiet" onClick={() => setState({ kind: 'idle' })}>
											Cancelar
										</button>
									</>
								)}
							</div>
						</div>
					)}

					{state.kind === 'done' && (
						<div className="panel panel--done" ref={panelRef} tabIndex={-1} aria-labelledby="panel-title">
							{state.added > 0 && (
								<div className="panel__feathers">
									<Feathers />
								</div>
							)}
							<div className="panel__row">
								<Curio mood="celebrating" size={64} />
								<h3 id="panel-title" className="panel__title">
									Pronto!
								</h3>
							</div>
							<p>
								{state.added > 0
									? `Juntei ${plural(state.added, 'descoberta nova', 'descobertas novas')}, agora são ${state.total}.`
									: 'Seu progresso foi atualizado.'}
								{state.days > 0 && ` Sua sequência é de ${plural(state.days, 'dia', 'dias')}.`}
							</p>
							{state.ignored > 0 && (
								<p className="panel__note">
									{plural(state.ignored, 'item de uma pergunta que não existe mais foi ignorado', 'itens de perguntas que não existem mais foram ignorados')}.
								</p>
							)}
							<div className="panel__actions">
								<a className="button" href={albumRoute()}>
									<CheckIcon size={22} />
									Ver meu álbum
								</a>
								<a className="button button--quiet" href={feedRoute()}>
									Voltar às perguntas
								</a>
							</div>
						</div>
					)}

					{state.kind === 'error' && (
						<div className="panel" ref={panelRef} tabIndex={-1} aria-labelledby="panel-title">
							<div className="panel__row">
								<Curio mood="comforting" size={64} />
								<h3 id="panel-title" className="panel__title">
									Não deu para trazer
								</h3>
							</div>
							<p>{PROBLEM_TEXT[state.problem]}</p>
							<div className="panel__actions">
								<button type="button" className="button button--outline" onClick={() => inputRef.current?.click()}>
									Escolher outro arquivo
								</button>
								<button type="button" className="button button--quiet" onClick={() => setState({ kind: 'idle' })}>
									Fechar
								</button>
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
