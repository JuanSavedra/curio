import { useCallback, useEffect, useRef, useState } from 'react';
import { TEMAS, corDoTema, ehTema, type Tema } from '../../data/temas';
import { rotaDoDeck, rotaDosTemas } from '../../lib/rotas';
import type { DeckPublicado, ResumoDeck } from '../../lib/tipos';
import { Carta, type PerguntaNaFila } from './Carta';
import { Curio } from './Curio';
import { IconeCerto, IconeNota, IconeRecomecar, IconeTemas } from './Icones';
import {
	esquecerVistas,
	gravarUltimoTema,
	jaVisitou,
	lerSequencia,
	lerVistas,
	marcarVisita,
	marcarVista,
	progressoDosDecks,
	registrarDia,
} from './progresso';
import { TemaConcluido } from './TemaConcluido';
import { MARCOS_DE_DIAS, ehMarcoDeSeguidas, type Celebracao } from './textos';
import './feed.css';

type Filtro = Tema | 'tudo';
type Status = 'carregando' | 'pronto' | 'falhou';

// Quantos decks buscar de uma vez. Mantém a página leve mesmo com muito conteúdo.
const LOTE = 3;

function embaralhar<T>(lista: T[]): T[] {
	const copia = [...lista];
	for (let i = copia.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copia[i], copia[j]] = [copia[j], copia[i]];
	}
	return copia;
}

// Intercala os decks para o feed misto não repetir o mesmo tema em sequência.
function intercalar(decks: DeckPublicado[], vistas: Set<string>): PerguntaNaFila[] {
	const pilhas = decks.map((deck) =>
		embaralhar(deck.perguntas.filter((p) => !vistas.has(p.id))).map((p) => ({ ...p, tema: deck.tema, deck: deck.titulo })),
	);
	const fila: PerguntaNaFila[] = [];
	while (pilhas.some((p) => p.length)) {
		for (const pilha of pilhas) {
			const proxima = pilha.shift();
			if (proxima) fila.push(proxima);
		}
	}
	return fila;
}

const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Feed({ decks }: { decks: ResumoDeck[] }) {
	const temasComConteudo = (Object.keys(TEMAS) as Tema[]).filter((t) => decks.some((d) => d.tema === t));

	const [filtro, setFiltro] = useState<Filtro>('tudo');
	// Quando a pessoa chega por uma coleção da página do tema, o feed mostra só ela
	const [deckFiltro, setDeckFiltro] = useState<ResumoDeck | null>(null);
	const [status, setStatus] = useState<Status>('carregando');
	const [fila, setFila] = useState<PerguntaNaFila[]>([]);
	const [pendentes, setPendentes] = useState<ResumoDeck[]>([]);
	const [respostas, setRespostas] = useState<Record<string, number>>({});
	const [atual, setAtual] = useState(0);
	const [sequencia, setSequencia] = useState(0);
	const [saudar, setSaudar] = useState(false);
	const [celebracoes, setCelebracoes] = useState<Record<string, Celebracao>>({});
	// Muda a cada marco de dias para a pílula brilhar de novo
	const [brilhoSequencia, setBrilhoSequencia] = useState(0);
	// Acertos seguidos nesta sessão. Errar recomeça em silêncio; pular não conta.
	const seguidas = useRef(0);

	const trilhoRef = useRef<HTMLElement>(null);
	const cache = useRef(new Map<string, DeckPublicado>());
	const carregandoMais = useRef(false);

	const buscarDecks = useCallback(async (lista: ResumoDeck[]) => {
		return Promise.all(
			lista.map(async (resumo) => {
				const guardado = cache.current.get(resumo.id);
				if (guardado) return guardado;
				const resposta = await fetch(rotaDoDeck(resumo.id));
				if (!resposta.ok) throw new Error(`Falha ao buscar ${resumo.id}`);
				const deck = (await resposta.json()) as DeckPublicado;
				cache.current.set(resumo.id, deck);
				return deck;
			}),
		);
	}, []);

	// Busca lotes até ter perguntas novas ou acabarem os decks.
	const proximoLote = useCallback(
		async (restantes: ResumoDeck[]) => {
			const vistas = lerVistas();
			let novas: PerguntaNaFila[] = [];
			while (!novas.length && restantes.length) {
				const lote = restantes.slice(0, LOTE);
				restantes = restantes.slice(LOTE);
				novas = intercalar(await buscarDecks(lote), vistas);
			}
			return { novas, restantes };
		},
		[buscarDecks],
	);

	const montarFila = useCallback(
		async (novoFiltro: Filtro, deck: ResumoDeck | null = null) => {
			setStatus('carregando');
			setFiltro(novoFiltro);
			setDeckFiltro(deck);
			setAtual(0);
			try {
				const candidatos = embaralhar(deck ? [deck] : decks.filter((d) => novoFiltro === 'tudo' || d.tema === novoFiltro));
				const { novas, restantes } = await proximoLote(candidatos);
				setFila(novas);
				setPendentes(restantes);
				setStatus('pronto');
				trilhoRef.current?.scrollTo({ top: 0 });
			} catch {
				setStatus('falhou');
			}
		},
		[decks, proximoLote],
	);

	// Primeira carga: lê o progresso local e o filtro da URL (?tema=astronomia, ?deck=<id>, ?rever=1).
	useEffect(() => {
		setSequencia(lerSequencia());
		setSaudar(!jaVisitou());
		const params = new URLSearchParams(location.search);
		const doTema = params.get('tema') ?? '';
		const deck = decks.find((d) => d.id === params.get('deck')) ?? null;
		const tema: Filtro = deck ? deck.tema : ehTema(doTema) && temasComConteudo.includes(doTema) ? doTema : 'tudo';

		// "Rever" vem das páginas de tema: esquece só o que foi pedido, uma vez, e limpa o endereço.
		if (params.get('rever') === '1' && tema !== 'tudo') {
			esquecerVistas(prefixosDe(tema, deck));
			params.delete('rever');
			const consulta = params.toString();
			history.replaceState(null, '', `${location.pathname}${consulta ? `?${consulta}` : ''}`);
		}
		void montarFila(tema, deck);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Perto do fim da fila, busca o próximo lote em silêncio.
	useEffect(() => {
		if (status !== 'pronto' || !pendentes.length || carregandoMais.current || atual < fila.length - 3) return;
		carregandoMais.current = true;
		proximoLote(pendentes)
			.then(({ novas, restantes }) => {
				setFila((f) => [...f, ...novas]);
				setPendentes(restantes);
			})
			.catch(() => {
				// Sem rede agora: o fim da fila oferece tentar de novo.
			})
			.finally(() => {
				carregandoMais.current = false;
			});
	}, [atual, fila.length, pendentes, status, proximoLote]);

	// Qual carta está no centro do trilho.
	useEffect(() => {
		const trilho = trilhoRef.current;
		if (!trilho) return;
		let quadro = 0;
		const medir = () => {
			quadro = 0;
			const meio = trilho.scrollTop + trilho.clientHeight / 2;
			const cenas = trilho.querySelectorAll<HTMLElement>('.cena[data-indice]');
			for (const cena of cenas) {
				if (cena.offsetTop <= meio && cena.offsetTop + cena.offsetHeight > meio) {
					setAtual(Number(cena.dataset.indice));
					return;
				}
			}
		};
		const aoRolar = () => {
			if (!quadro) quadro = requestAnimationFrame(medir);
		};
		trilho.addEventListener('scroll', aoRolar, { passive: true });
		return () => {
			trilho.removeEventListener('scroll', aoRolar);
			cancelAnimationFrame(quadro);
		};
	}, []);

	const irPara = useCallback((indice: number) => {
		const trilho = trilhoRef.current;
		const alvo = trilho?.querySelector<HTMLElement>(`.cena[data-indice="${indice}"]`) ?? trilho?.querySelector<HTMLElement>('.cena--fim');
		if (!alvo) return;
		alvo.scrollIntoView({ block: 'start', behavior: reduzirMovimento() ? 'auto' : 'smooth' });
		alvo.querySelector<HTMLElement>('.carta__enunciado, .fim__titulo')?.focus({ preventScroll: true });
	}, []);

	const responder = useCallback(
		(indice: number, alternativa: number) => {
			const pergunta = fila[indice];
			if (!pergunta || respostas[pergunta.id] !== undefined) return;
			setRespostas((r) => ({ ...r, [pergunta.id]: alternativa }));
			marcarVista(pergunta.id);
			gravarUltimoTema(pergunta.tema);
			marcarVisita();
			setSaudar(false);

			const { dias, novoDia } = registrarDia();
			setSequencia(dias);
			seguidas.current = alternativa === pergunta.correta ? seguidas.current + 1 : 0;

			// Marco de dias vale mais que acertos seguidos (é mais raro)
			let celebracao: Celebracao | undefined;
			if (novoDia && MARCOS_DE_DIAS.includes(dias)) {
				celebracao = { tipo: 'dias', n: dias };
				setBrilhoSequencia((b) => b + 1);
			} else if (ehMarcoDeSeguidas(seguidas.current)) {
				celebracao = { tipo: 'seguidas', n: seguidas.current };
			}
			if (celebracao) setCelebracoes((c) => ({ ...c, [pergunta.id]: celebracao }));
		},
		[fila, respostas],
	);

	// Atalhos: 1 a 4 (ou A a D) respondem, setas ou J/K trocam de carta.
	useEffect(() => {
		const aoTeclar = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey || e.metaKey || status !== 'pronto') return;
			if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
			const tecla = e.key.toLowerCase();
			const alternativa = '1234'.indexOf(tecla) >= 0 ? '1234'.indexOf(tecla) : 'abcd'.indexOf(tecla);
			const pergunta = fila[atual];
			if (alternativa >= 0 && pergunta && alternativa < pergunta.alternativas.length) {
				e.preventDefault();
				responder(atual, alternativa);
			} else if (tecla === 'arrowdown' || tecla === 'j') {
				e.preventDefault();
				irPara(atual + 1);
			} else if ((tecla === 'arrowup' || tecla === 'k') && atual > 0) {
				e.preventDefault();
				irPara(atual - 1);
			}
		};
		window.addEventListener('keydown', aoTeclar);
		return () => window.removeEventListener('keydown', aoTeclar);
	}, [atual, fila, status, responder, irPara]);

	function trocarFiltro(novo: Filtro) {
		if (novo === filtro && !deckFiltro && status === 'pronto') return;
		const url = new URL(location.href);
		url.searchParams.delete('deck');
		url.searchParams.delete('rever');
		if (novo === 'tudo') url.searchParams.delete('tema');
		else url.searchParams.set('tema', novo);
		history.replaceState(null, '', url);
		void montarFila(novo);
	}

	function prefixosDe(tema: Filtro, deck: ResumoDeck | null) {
		return (deck ? [deck] : decks.filter((d) => tema === 'tudo' || d.tema === tema)).map((d) => `${d.id}/`);
	}

	function verDeNovo() {
		esquecerVistas(prefixosDe(filtro, deckFiltro));
		setRespostas({});
		void montarFila(filtro, deckFiltro);
	}

	// O tema só está concluído quando todas as perguntas dele foram vistas (pular não conta).
	const resumoDoTema =
		status === 'pronto' && !pendentes.length && !deckFiltro && filtro !== 'tudo'
			? progressoDosDecks(
					lerVistas(),
					decks.filter((d) => d.tema === filtro),
				)
			: null;
	const temaConcluido = resumoDoTema?.concluido ?? false;

	const temaAtual = fila[Math.min(atual, fila.length - 1)]?.tema;

	return (
		<div className="feed" style={temaAtual ? corDoTema(temaAtual) : undefined} data-tem-tema={Boolean(temaAtual)}>
			<header className="topo">
				<h1 className="marca">
					<Curio tamanho={34} parado />
					<span>Curiô</span>
				</h1>

				<nav className="chips" aria-label="Temas">
					<ul>
						<li>
							<button type="button" className="chip chip--tudo" aria-pressed={filtro === 'tudo'} onClick={() => trocarFiltro('tudo')}>
								Tudo
							</button>
						</li>
						{temasComConteudo.map((tema) => (
							<li key={tema}>
								<button
									type="button"
									className="chip"
									style={corDoTema(tema)}
									aria-pressed={filtro === tema}
									onClick={() => trocarFiltro(tema)}
								>
									<span className="chip__ponto" aria-hidden="true">
										{filtro === tema && <IconeCerto tamanho={12} />}
									</span>
									{TEMAS[tema]}
								</button>
							</li>
						))}
					</ul>
				</nav>

				<div className="topo__acoes">
					<a className="temas-link" href={rotaDosTemas()}>
						<IconeTemas tamanho={18} />
						<span>Temas</span>
					</a>
					{sequencia > 0 && (
						<p
							key={brilhoSequencia}
							className={`sequencia${brilhoSequencia ? ' sequencia--marco' : ''}`}
							title="Dias seguidos respondendo perguntas"
						>
							<IconeNota tamanho={18} />
							<span>{sequencia === 1 ? '1 dia' : `${sequencia} dias`}</span>
							<span className="so-leitor"> seguidos</span>
						</p>
					)}
				</div>
			</header>

			<main id="perguntas" className="trilho" ref={trilhoRef} aria-busy={status === 'carregando'}>
				{status === 'carregando' && (
					<div className="cena">
						<p className="so-leitor">Carregando perguntas…</p>
						<Esqueleto />
					</div>
				)}

				{status === 'falhou' && (
					<section className="cena cena--aviso">
						<div className="aviso">
							<Curio humor="consolando" tamanho={72} />
							<h2 className="aviso__titulo">Não consegui carregar as perguntas.</h2>
							<p>Confira sua conexão com a internet e tente de novo.</p>
							<button type="button" className="proxima" onClick={() => montarFila(filtro)}>
								<IconeRecomecar />
								Tentar de novo
							</button>
						</div>
					</section>
				)}

				{status === 'pronto' &&
					fila.map((pergunta, i) => (
						<Carta
							key={pergunta.id}
							pergunta={pergunta}
							indice={i}
							escolha={respostas[pergunta.id]}
							celebracao={celebracoes[pergunta.id]}
							saudar={saudar && i === 0}
							ultima={i === fila.length - 1}
							onResponder={responder}
							onAvancar={(indice) => irPara(indice + 1)}
						/>
					))}

				{temaConcluido && filtro !== 'tudo' && resumoDoTema && (
					<TemaConcluido tema={filtro} total={resumoDoTema.total} onRever={verDeNovo} />
				)}

				{status === 'pronto' && !pendentes.length && !temaConcluido && (
					<section className="cena cena--fim" aria-labelledby="fim-titulo">
						<div className="aviso">
							<Curio humor="comemorando" tamanho={88} />
							<h2 id="fim-titulo" className="fim__titulo aviso__titulo" tabIndex={-1}>
								{deckFiltro
									? `Você viu tudo de ${deckFiltro.titulo} por agora.`
									: filtro === 'tudo'
										? 'Você já viu todas as perguntas que temos por agora.'
										: `Você viu tudo de ${TEMAS[filtro]} por agora.`}
							</h2>
							<p>O Curió está juntando mais curiosidades. Enquanto isso:</p>
							<ul className="fim__opcoes">
								{temasComConteudo
									.filter((t) => t !== filtro || deckFiltro)
									.map((tema) => (
										<li key={tema}>
											<button type="button" className="chip" style={corDoTema(tema)} onClick={() => trocarFiltro(tema)}>
												<span className="chip__ponto" aria-hidden="true" />
												{TEMAS[tema]}
											</button>
										</li>
									))}
							</ul>
							<button type="button" className="pular" onClick={verDeNovo}>
								<IconeRecomecar tamanho={18} />
								Rever as que já respondi
							</button>
						</div>
					</section>
				)}

				{status === 'pronto' && pendentes.length > 0 && (
					<section className="cena cena--fim" aria-label="Carregando mais perguntas">
						<Esqueleto />
					</section>
				)}
			</main>
		</div>
	);
}

function Esqueleto() {
	return (
		<div className="carta carta--esqueleto" aria-hidden="true">
			<div className="carta__topo">
				<span className="osso osso--curto" />
				<span className="osso" />
				<span className="osso osso--medio" />
			</div>
			<div className="carta__corpo">
				{[0, 1, 2, 3].map((i) => (
					<span key={i} className="osso osso--alt" />
				))}
			</div>
		</div>
	);
}
