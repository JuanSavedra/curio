import { useCallback, useEffect, useRef, useState } from 'react';
import { TEMAS, ehTema, type Tema } from '../../data/temas';
import type { DeckPublicado, ResumoDeck } from '../../lib/tipos';
import { Carta, corDoTema, type PerguntaNaFila } from './Carta';
import { Curio } from './Curio';
import { IconeCerto, IconeNota, IconeRecomecar } from './Icones';
import { esquecerVistas, jaVisitou, lerSequencia, lerVistas, marcarVisita, marcarVista, registrarDia } from './progresso';
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
	const [status, setStatus] = useState<Status>('carregando');
	const [fila, setFila] = useState<PerguntaNaFila[]>([]);
	const [pendentes, setPendentes] = useState<ResumoDeck[]>([]);
	const [respostas, setRespostas] = useState<Record<string, number>>({});
	const [atual, setAtual] = useState(0);
	const [sequencia, setSequencia] = useState(0);
	const [saudar, setSaudar] = useState(false);

	const trilhoRef = useRef<HTMLElement>(null);
	const cache = useRef(new Map<string, DeckPublicado>());
	const carregandoMais = useRef(false);

	const buscarDecks = useCallback(async (lista: ResumoDeck[]) => {
		return Promise.all(
			lista.map(async (resumo) => {
				const guardado = cache.current.get(resumo.id);
				if (guardado) return guardado;
				const resposta = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/decks/${resumo.id}.json`);
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
		async (novoFiltro: Filtro) => {
			setStatus('carregando');
			setFiltro(novoFiltro);
			setAtual(0);
			try {
				const candidatos = embaralhar(decks.filter((d) => novoFiltro === 'tudo' || d.tema === novoFiltro));
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

	// Primeira carga: lê o progresso local e o tema da URL (?tema=astronomia).
	useEffect(() => {
		setSequencia(lerSequencia());
		setSaudar(!jaVisitou());
		const doEndereco = new URLSearchParams(location.search).get('tema') ?? '';
		void montarFila(ehTema(doEndereco) && temasComConteudo.includes(doEndereco) ? doEndereco : 'tudo');
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
			marcarVisita();
			setSaudar(false);
			setSequencia(registrarDia());
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
		if (novo === filtro && status === 'pronto') return;
		const url = new URL(location.href);
		if (novo === 'tudo') url.searchParams.delete('tema');
		else url.searchParams.set('tema', novo);
		history.replaceState(null, '', url);
		void montarFila(novo);
	}

	function verDeNovo() {
		esquecerVistas(decks.filter((d) => filtro === 'tudo' || d.tema === filtro).map((d) => `${d.id}/`));
		setRespostas({});
		void montarFila(filtro);
	}

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

				{sequencia > 0 && (
					<p className="sequencia" title="Dias seguidos respondendo perguntas">
						<IconeNota tamanho={18} />
						<span>{sequencia === 1 ? '1 dia' : `${sequencia} dias`}</span>
						<span className="so-leitor"> seguidos</span>
					</p>
				)}
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
							saudar={saudar && i === 0}
							ultima={i === fila.length - 1}
							onResponder={responder}
							onAvancar={(indice) => irPara(indice + 1)}
						/>
					))}

				{status === 'pronto' && !pendentes.length && (
					<section className="cena cena--fim" aria-labelledby="fim-titulo">
						<div className="aviso">
							<Curio humor="comemorando" tamanho={88} />
							<h2 id="fim-titulo" className="fim__titulo aviso__titulo" tabIndex={-1}>
								{filtro === 'tudo'
									? 'Você já viu todas as perguntas que temos por agora.'
									: `Você viu tudo de ${TEMAS[filtro]} por agora.`}
							</h2>
							<p>O Curió está juntando mais curiosidades. Enquanto isso:</p>
							<ul className="fim__opcoes">
								{temasComConteudo
									.filter((t) => t !== filtro)
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
