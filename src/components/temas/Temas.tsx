import { useEffect, useMemo, useState } from 'react';
import { TEMAS, corDoTema, type Tema } from '../../data/temas';
import type { ResumoDeck } from '../../lib/tipos';
import { rotaDoFeed, rotaDoTema } from '../../lib/rotas';
import { Curio } from '../feed/Curio';
import { IconeCerto, IconeSetaDireita, IconeSetaEsquerda } from '../feed/Icones';
import { lerUltimoTema, lerVistas, progressoDosDecks } from '../feed/progresso';
import { Barra, SeloTema } from './pecas';
import { colecoes, descobertas, perguntas } from './textos';
import './temas.css';

const ORDEM = Object.keys(TEMAS) as Tema[];

interface InfoTema {
	tema: Tema;
	decks: ResumoDeck[];
	total: number;
	feitas: number;
	concluido: boolean;
}

/** O tema em destaque: o último que a pessoa estava respondendo, senão o mais adiantado, senão o mais cheio. */
function escolherDestaque(temas: InfoTema[], ultimo: string | null): InfoTema | undefined {
	const abertos = temas.filter((t) => t.total > 0 && !t.concluido);
	const retomavel = abertos.find((t) => t.tema === ultimo && t.feitas > 0);
	if (retomavel) return retomavel;
	const maisAdiantado = [...abertos].sort((a, b) => b.feitas - a.feitas)[0];
	if (maisAdiantado?.feitas) return maisAdiantado;
	return [...abertos].sort((a, b) => b.total - a.total)[0];
}

export default function Temas({ decks }: { decks: ResumoDeck[] }) {
	// Até o progresso local ser lido, a tela mostra um esqueleto (evita trocar o destaque na frente da pessoa).
	const [vistas, setVistas] = useState<Set<string> | null>(null);
	const [ultimo, setUltimo] = useState<string | null>(null);

	useEffect(() => {
		setVistas(lerVistas());
		setUltimo(lerUltimoTema());
	}, []);

	const temas = useMemo<InfoTema[]>(
		() =>
			ORDEM.map((tema) => {
				const doTema = decks.filter((d) => d.tema === tema);
				const { total, descobertas: feitas, concluido } = progressoDosDecks(vistas ?? new Set(), doTema);
				return { tema, decks: doTema, total, feitas, concluido };
			}),
		[decks, vistas],
	);

	const comConteudo = temas.filter((t) => t.total > 0);
	const emBreve = temas.filter((t) => t.total === 0);
	const destaque = vistas ? escolherDestaque(temas, ultimo) : undefined;
	const outros = comConteudo.filter((t) => t !== destaque);

	return (
		<div className="pagina-temas">
			<header className="pagina-temas__topo">
				<a className="voltar" href={rotaDoFeed()}>
					<IconeSetaEsquerda tamanho={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="conteudo" className="temas">
				<div className="temas__destaque">
					<h1 className="temas__titulo">Por onde você quer descobrir hoje?</h1>
					{!vistas && <Esqueleto />}
					{vistas && destaque && <Destaque info={destaque} recomecando={destaque.feitas === 0} />}
					{vistas && !destaque && comConteudo.length > 0 && (
						<section className="tudo-feito" aria-labelledby="tudo-feito-titulo">
							<Curio humor="comemorando" tamanho={96} />
							<h2 id="tudo-feito-titulo" className="tudo-feito__titulo">
								Você descobriu tudo o que temos por agora!
							</h2>
							<p>O Curió está juntando mais curiosidades. Enquanto isso, dá para rever qualquer tema.</p>
						</section>
					)}
				</div>

				<div className="temas__lista">
					{!vistas && <Esqueleto linhas />}
					{vistas && outros.length > 0 && (
						<section aria-labelledby="outros-titulo">
							<h2 id="outros-titulo" className="secao-titulo">
								{destaque ? 'Outros temas' : 'Seus temas'}
							</h2>
							<ul className="lista-temas">
								{outros.map((info) => (
									<LinhaDeTema key={info.tema} info={info} />
								))}
							</ul>
						</section>
					)}

					{emBreve.length > 0 && (
						<section aria-labelledby="embreve-titulo">
							<h2 id="embreve-titulo" className="secao-titulo">
								Em breve, o ninho vai crescer
							</h2>
							<ul className="embreve">
								{emBreve.map(({ tema }) => (
									<li key={tema} style={corDoTema(tema)}>
										<SeloTema tema={tema} tamanho={2.25} />
										<span>{TEMAS[tema]}</span>
									</li>
								))}
							</ul>
						</section>
					)}
				</div>
			</main>
		</div>
	);
}

function Destaque({ info, recomecando }: { info: InfoTema; recomecando: boolean }) {
	const { tema, total, feitas, decks } = info;
	return (
		<section className="destaque" style={corDoTema(tema)} aria-labelledby="destaque-titulo">
			<p className="destaque__rotulo">{recomecando ? 'Que tal começar por aqui?' : 'Continue de onde parou'}</p>
			<div className="destaque__cabeca">
				<SeloTema tema={tema} tamanho={4.5} ligado />
				<h2 id="destaque-titulo" className="destaque__titulo">
					{TEMAS[tema]}
				</h2>
			</div>
			{feitas > 0 ? (
				<div className="destaque__progresso">
					<Barra valor={feitas / total} />
					<p className="destaque__contagem">{descobertas(feitas, total)}</p>
				</div>
			) : (
				<p className="destaque__contagem">
					{perguntas(total)} em {colecoes(decks.length)}
				</p>
			)}
			<div className="destaque__acoes">
				<a className="botao" href={rotaDoFeed({ tema })}>
					{recomecando ? 'Começar' : 'Continuar'}
					<IconeSetaDireita />
				</a>
				<a className="botao botao--quieto" href={rotaDoTema(tema)}>
					Ver as coleções
				</a>
			</div>
		</section>
	);
}

function LinhaDeTema({ info }: { info: InfoTema }) {
	const { tema, total, feitas, concluido, decks } = info;
	const estado = concluido ? 'concluido' : feitas > 0 ? 'andamento' : 'novo';
	return (
		<li>
			<a className="linha" data-estado={estado} href={rotaDoTema(tema)} style={corDoTema(tema)}>
				<SeloTema tema={tema} ligado={estado === 'concluido'} />
				<span className="linha__texto">
					<span className="linha__nome">{TEMAS[tema]}</span>
					<span className="linha__meta">
						{estado === 'novo' && `${perguntas(total)} em ${colecoes(decks.length)}`}
						{estado === 'andamento' && descobertas(feitas, total)}
						{estado === 'concluido' && perguntas(total)}
					</span>
				</span>
				{estado === 'concluido' ? (
					<span className="selo-concluido">
						<IconeCerto tamanho={14} />
						Concluído
					</span>
				) : (
					<span className="linha__seta" aria-hidden="true">
						<IconeSetaDireita tamanho={18} />
					</span>
				)}
				{estado === 'andamento' && (
					<span className="linha__barra">
						<Barra valor={feitas / total} />
					</span>
				)}
			</a>
		</li>
	);
}

function Esqueleto({ linhas = false }: { linhas?: boolean }) {
	return (
		<div className="esqueleto-temas" aria-hidden="true">
			{linhas ? (
				<>
					<span className="osso-t osso-t--linha" />
					<span className="osso-t osso-t--linha" />
				</>
			) : (
				<span className="osso-t osso-t--destaque" />
			)}
		</div>
	);
}
