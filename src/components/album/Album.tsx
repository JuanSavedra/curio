import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { TOPICS, TOPIC_IDS, topicStyle, type Topic } from '../../data/topics';
import { deckJsonRoute, feedRoute } from '../../lib/routes';
import type { DeckSummary, PublishedDeck, PublishedQuestion } from '../../lib/types';
import { Curio } from '../feed/Curio';
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, CrossIcon, ExternalIcon, SearchIcon } from '../feed/Icons';
import { readSeen } from '../feed/progress';
import { TopicBadge } from '../topics/parts';
import '../topics/topics.css';
import './album.css';

type Status = 'loading' | 'ready' | 'failed';

interface Find {
	question: PublishedQuestion;
	deckTitle: string;
}

interface Opened extends Find {
	topic: Topic;
}

// Columns: as many as fit with a comfortable width, at most 4 (fewer when 4 would squeeze the cards).
const COLUMN_MIN = 15 * 16;
const COLUMN_GAP = 16;
const MAX_COLUMNS = 4;

const columnsFor = (width: number) => Math.max(1, Math.min(MAX_COLUMNS, Math.floor((width + COLUMN_GAP) / (COLUMN_MIN + COLUMN_GAP))));

/** Lowercase without accents, so "historia" finds "História". */
const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

/** Everything the person already discovered, by topic, with the explanations to reread. */
export default function Album({ decks }: { decks: DeckSummary[] }) {
	const [status, setStatus] = useState<Status>('loading');
	const [byTopic, setByTopic] = useState<Map<Topic, Find[]>>(new Map());
	const [query, setQuery] = useState('');
	const [columns, setColumns] = useState(1);
	const [opened, setOpened] = useState<Opened | null>(null);
	const mainRef = useRef<HTMLElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Only the decks with at least one discovery are fetched (questions live in one JSON per deck).
	const load = useCallback(async () => {
		setStatus('loading');
		try {
			const seen = readSeen();
			const withFinds = decks.filter((d) => [...seen].some((id) => id.startsWith(`${d.id}/`)));
			const loaded = await Promise.all(
				withFinds.map(async (summary) => {
					const response = await fetch(deckJsonRoute(summary.id));
					if (!response.ok) throw new Error(`Failed to fetch ${summary.id}`);
					return (await response.json()) as PublishedDeck;
				}),
			);
			const grouped = new Map<Topic, Find[]>();
			for (const deck of loaded) {
				const list = grouped.get(deck.topic) ?? [];
				for (const question of deck.questions) {
					if (seen.has(question.id)) list.push({ question, deckTitle: deck.title });
				}
				grouped.set(deck.topic, list);
			}
			setByTopic(grouped);
			setStatus('ready');
		} catch {
			setStatus('failed');
		}
	}, [decks]);

	useEffect(() => {
		void load();
	}, [load]);

	// Watches the page width to pick the number of columns
	useEffect(() => {
		const main = mainRef.current;
		if (!main) return;
		const update = () => setColumns(columnsFor(main.clientWidth));
		update();
		const observer = new ResizeObserver(update);
		observer.observe(main);
		return () => observer.disconnect();
	}, []);

	// The native dialog gives the focus trap, Esc to close and the return of focus to the card for free.
	useEffect(() => {
		const dialog = dialogRef.current;
		if (opened && dialog && !dialog.open) dialog.showModal();
	}, [opened]);

	const total = useMemo(() => [...byTopic.values()].reduce((sum, list) => sum + list.length, 0), [byTopic]);

	// The search looks at the topic name, so "mat" finds Matemática.
	const visibleTopics = useMemo(() => {
		const needle = plain(query);
		return TOPIC_IDS.filter((t) => byTopic.get(t)?.length && plain(TOPICS[t].name).includes(needle));
	}, [byTopic, query]);

	return (
		<div className="topics-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="album" ref={mainRef} aria-busy={status === 'loading'}>
				<div>
					<h1 className="album__title">Meu álbum</h1>
					{status === 'ready' && total > 0 && (
						<p className="album__intro">
							{total === 1 ? '1 descoberta guardada' : `${total} descobertas guardadas`}. Toque em uma para reler a resposta e a explicação.
						</p>
					)}
				</div>

				{status === 'ready' && total > 0 && (
					<div className="album-search">
						<label className="sr-only" htmlFor="album-search">
							Buscar tema
						</label>
						<span className="album-search__icon" aria-hidden="true">
							<SearchIcon size={20} />
						</span>
						<input
							id="album-search"
							className="album-search__input"
							type="search"
							placeholder="Buscar tema"
							autoComplete="off"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
						{query && (
							<button type="button" className="album-search__clear" aria-label="Limpar a busca" onClick={() => setQuery('')}>
								<CrossIcon size={18} />
							</button>
						)}
					</div>
				)}

				{status === 'loading' && <p className="album__intro">Abrindo o álbum…</p>}

				{status === 'failed' && (
					<section className="album-empty">
						<Curio mood="comforting" size={88} />
						<h2 className="album-empty__title">Não consegui abrir o álbum.</h2>
						<p>Confira sua conexão com a internet e tente de novo.</p>
						<button type="button" className="button" onClick={() => void load()}>
							Tentar de novo
						</button>
					</section>
				)}

				{status === 'ready' && total === 0 && (
					<section className="album-empty">
						<Curio size={88} />
						<h2 className="album-empty__title">Seu álbum ainda está vazio.</h2>
						<p>Cada pergunta que você responde fica guardada aqui, com a explicação, para reler quando quiser.</p>
						<a className="button" href={feedRoute()}>
							Começar a descobrir
							<ArrowRightIcon />
						</a>
					</section>
				)}

				{status === 'ready' && total > 0 && visibleTopics.length === 0 && (
					<p className="album-none" role="status">
						Nenhum tema do seu álbum tem esse nome.
					</p>
				)}

				{status === 'ready' && visibleTopics.length > 0 && (
					<div className="album__topics">
						{visibleTopics.map((topic) => {
							const finds = byTopic.get(topic) ?? [];
							const lists: Find[][] = Array.from({ length: columns }, () => []);
							finds.forEach((find, i) => lists[i % columns].push(find));
							return (
								<details key={topic} className="album-topic" style={topicStyle(topic)} open>
									<summary className="album-topic__summary">
										<TopicBadge topic={topic} size={2.5} light />
										<span className="album-topic__text">
											<span className="album-topic__title">{TOPICS[topic].name}</span>
											<span className="album-topic__count">{finds.length === 1 ? '1 descoberta' : `${finds.length} descobertas`}</span>
										</span>
										<span className="album-topic__chevron" aria-hidden="true">
											<ArrowDownIcon size={20} />
										</span>
									</summary>
									<div className="masonry" style={{ '--columns': columns } as CSSProperties}>
										{lists.map((list, column) => (
											<ul key={column} className="masonry__column">
												{list.map((find) => (
													<li key={find.question.id}>
														<button type="button" className="find" aria-haspopup="dialog" onClick={() => setOpened({ ...find, topic })}>
															<span className="find__deck">{find.deckTitle}</span>
															<span className="find__prompt" dangerouslySetInnerHTML={{ __html: find.question.prompt }} />
														</button>
													</li>
												))}
											</ul>
										))}
									</div>
								</details>
							);
						})}
					</div>
				)}
			</main>

			{/* Click on the backdrop (the dialog element itself) or Esc closes it */}
			<dialog
				ref={dialogRef}
				className="find-dialog"
				style={opened ? topicStyle(opened.topic) : undefined}
				aria-labelledby="find-dialog-title"
				onClose={() => setOpened(null)}
				onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
			>
				{opened && (
					<article className="find-dialog__panel">
						<header className="find-dialog__head">
							<div className="find-dialog__top">
								<p className="find-dialog__topic">
									<TopicBadge topic={opened.topic} size={1.75} light />
									<span>
										<strong>{TOPICS[opened.topic].name}</strong> · {opened.deckTitle}
									</span>
								</p>
								<button type="button" className="find-dialog__close" aria-label="Fechar" onClick={() => dialogRef.current?.close()}>
									<CrossIcon size={20} />
								</button>
							</div>
							<h2 id="find-dialog-title" className="find-dialog__prompt" dangerouslySetInnerHTML={{ __html: opened.question.prompt }} />
						</header>
						<div className="find-dialog__body">
							<p className="find__answer">
								<CheckIcon size={16} />
								<span>
									<span className="sr-only">Resposta: </span>
									<span dangerouslySetInnerHTML={{ __html: opened.question.choices[opened.question.correct] }} />
								</span>
							</p>
							<p className="find__explanation" dangerouslySetInnerHTML={{ __html: opened.question.explanation }} />
							{opened.question.learnMore && (
								<div className="find__more">
									<p className="find__more-title">Quer saber mais?</p>
									<ul>
										{opened.question.learnMore.map(({ title, url }) => (
											<li key={url}>
												<a href={url} target="_blank" rel="noopener noreferrer">
													{title}
													<ExternalIcon size={14} />
													<span className="sr-only"> (abre em outra aba)</span>
												</a>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</article>
				)}
			</dialog>
		</div>
	);
}
