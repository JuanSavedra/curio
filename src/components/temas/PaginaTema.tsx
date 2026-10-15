import { useEffect, useMemo, useState } from 'react';
import { TEMAS, corDoTema, type Tema } from '../../data/temas';
import type { ResumoDeck } from '../../lib/tipos';
import { rotaDoFeed, rotaDosTemas } from '../../lib/rotas';
import { IconeCerto, IconeRecomecar, IconeSetaDireita, IconeSetaEsquerda } from '../feed/Icones';
import { descobertasDoDeck, lerVistas, progressoDosDecks } from '../feed/progresso';
import { Barra, SeloTema } from './pecas';
import { descobertas, perguntas } from './textos';
import './temas.css';

type Situacao = 'novo' | 'andamento' | 'concluido';

const situacaoDe = (feitas: number, total: number): Situacao => (feitas >= total ? 'concluido' : feitas > 0 ? 'andamento' : 'novo');

const ROTULO: Record<Situacao, string> = { novo: 'Começar', andamento: 'Continuar', concluido: 'Rever' };

export default function PaginaTema({ tema, decks }: { tema: Tema; decks: ResumoDeck[] }) {
	// O progresso mora no aparelho. Até lê-lo, a contagem e as ações ficam reservadas (sem piscar o texto errado).
	const [vistas, setVistas] = useState<Set<string> | null>(null);
	useEffect(() => setVistas(lerVistas()), []);

	const geral = useMemo(() => progressoDosDecks(vistas ?? new Set(), decks), [vistas, decks]);
	const situacao = situacaoDe(geral.descobertas, geral.total);

	// Agrupa por subtema, mantendo a ordem em que aparecem.
	const grupos = useMemo(() => {
		const mapa = new Map<string, ResumoDeck[]>();
		for (const deck of decks) mapa.set(deck.subtema, [...(mapa.get(deck.subtema) ?? []), deck]);
		return [...mapa];
	}, [decks]);

	return (
		<div className="pagina-temas pagina-temas--tema" style={corDoTema(tema)}>
			<header className="pagina-temas__topo">
				<a className="voltar" href={rotaDosTemas()}>
					<IconeSetaEsquerda tamanho={18} />
					Todos os temas
				</a>
			</header>

			<main id="conteudo" className="tema-pagina">
				<section className="cabeca-tema" aria-labelledby="tema-titulo">
					<SeloTema tema={tema} tamanho={5} ligado />
					<h1 id="tema-titulo" className="cabeca-tema__titulo">
						{TEMAS[tema]}
					</h1>
					<div className="cabeca-tema__info" data-pronto={vistas !== null}>
						{situacao === 'concluido' ? (
							<p className="selo-concluido">
								<IconeCerto tamanho={14} />
								Concluído
							</p>
						) : null}
						<Barra valor={geral.total ? geral.descobertas / geral.total : 0} />
						<p className="destaque__contagem">
							{geral.descobertas > 0 ? descobertas(geral.descobertas, geral.total) : perguntas(geral.total)}
						</p>
					</div>
					<div className="cabeca-tema__acao" data-pronto={vistas !== null}>
						<a
							className="botao"
							href={rotaDoFeed(situacao === 'concluido' ? { tema, rever: '1' } : { tema })}
							aria-label={`${situacao === 'concluido' ? 'Rever tudo de' : ROTULO[situacao]} ${TEMAS[tema]}`}
						>
							{situacao === 'concluido' ? <IconeRecomecar /> : null}
							{situacao === 'concluido' ? 'Rever tudo' : ROTULO[situacao]}
							{situacao !== 'concluido' && <IconeSetaDireita />}
						</a>
					</div>
				</section>

				<div className="grupos">
					{grupos.map(([subtema, lista], i) => (
						<section key={subtema} className="grupo" aria-labelledby={`subtema-${i}`}>
							<h2 id={`subtema-${i}`} className="secao-titulo">
								{subtema}
							</h2>
							<ul className="decks">
								{lista.map((deck) => {
									const feitas = vistas ? descobertasDoDeck(vistas, deck.id, deck.total) : 0;
									const estado = situacaoDe(feitas, deck.total);
									return (
										<li key={deck.id} className="deck" data-estado={estado}>
											<div className="deck__texto">
												<h3 className="deck__titulo">{deck.titulo}</h3>
												<div data-pronto={vistas !== null} className="deck__estado">
													<Barra valor={feitas / deck.total} />
													<p className="deck__meta">
														{estado === 'concluido' && (
															<span className="selo-concluido">
																<IconeCerto tamanho={14} />
																Concluído
															</span>
														)}
														<span>{feitas > 0 ? descobertas(feitas, deck.total) : perguntas(deck.total)}</span>
													</p>
												</div>
											</div>
											<div className="deck__acao" data-pronto={vistas !== null}>
												<a
													className={`botao${estado === 'concluido' ? ' botao--contorno' : ''}`}
													href={rotaDoFeed(estado === 'concluido' ? { deck: deck.id, rever: '1' } : { deck: deck.id })}
													aria-label={`${ROTULO[estado]} ${deck.titulo}`}
												>
													{ROTULO[estado]}
													{estado === 'concluido' ? <IconeRecomecar /> : <IconeSetaDireita />}
												</a>
											</div>
										</li>
									);
								})}
							</ul>
						</section>
					))}
				</div>
			</main>
		</div>
	);
}
