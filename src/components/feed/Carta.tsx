import { useEffect, useRef, type CSSProperties } from 'react';
import { TEMAS, type Tema } from '../../data/temas';
import type { PerguntaPublicada } from '../../lib/tipos';
import { Curio } from './Curio';
import { IconeCerto, IconeQuase, IconeSeta } from './Icones';
import { LETRAS, textoAcerto, textoErro } from './textos';

export interface PerguntaNaFila extends PerguntaPublicada {
	tema: Tema;
	deck: string;
}

interface Props {
	pergunta: PerguntaNaFila;
	indice: number;
	escolha: number | undefined;
	saudar: boolean;
	ultima: boolean;
	onResponder: (indice: number, alternativa: number) => void;
	onAvancar: (indice: number) => void;
}

export const corDoTema = (tema: Tema) =>
	({
		'--tema': `var(--${tema})`,
		'--tema-tinta': `var(--${tema}-tinta)`,
		'--tema-fundo': `var(--${tema}-fundo)`,
	}) as CSSProperties;

export function Carta({ pergunta, indice, escolha, saudar, ultima, onResponder, onAvancar }: Props) {
	const respondida = escolha !== undefined;
	const acertou = escolha === pergunta.correta;
	const proximaRef = useRef<HTMLButtonElement>(null);
	const resultadoRef = useRef<HTMLDivElement>(null);
	const idEnunciado = `enunciado-${indice}`;

	// Depois de responder: mostra a explicação e leva o foco para "Próxima".
	useEffect(() => {
		if (!respondida) return;
		proximaRef.current?.focus({ preventScroll: true });
		const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		resultadoRef.current?.scrollIntoView({ block: 'nearest', behavior: suave ? 'smooth' : 'auto' });
	}, [respondida]);

	function estadoDa(i: number) {
		if (!respondida) return 'livre';
		if (i === pergunta.correta) return 'certa';
		if (i === escolha) return 'errada';
		return 'apagada';
	}

	return (
		<section className="cena" data-indice={indice} aria-labelledby={idEnunciado} style={corDoTema(pergunta.tema)}>
			<article className="carta">
				<header className="carta__topo">
					<p className="carta__tema">
						<span className="carta__tema-nome">{TEMAS[pergunta.tema]}</span>
						<span aria-hidden="true"> · </span>
						<span className="carta__deck">{pergunta.deck}</span>
					</p>
					<h2
						id={idEnunciado}
						className="carta__enunciado"
						tabIndex={-1}
						dangerouslySetInnerHTML={{ __html: pergunta.enunciado }}
					/>
				</header>

				<div className="carta__corpo">
					<ol className="alternativas" aria-label="Alternativas">
						{pergunta.alternativas.map((alternativa, i) => {
							const estado = estadoDa(i);
							return (
								<li key={i}>
									<button
										type="button"
										className="alt"
										data-estado={estado}
										aria-disabled={respondida || undefined}
										onClick={() => !respondida && onResponder(indice, i)}
									>
										<span className="alt__marca" aria-hidden="true">
											{estado === 'certa' ? <IconeCerto tamanho={18} /> : estado === 'errada' ? <IconeQuase tamanho={16} /> : LETRAS[i]}
										</span>
										<span className="so-leitor">{LETRAS[i]}: </span>
										<span className="alt__texto" dangerouslySetInnerHTML={{ __html: alternativa }} />
										{estado === 'certa' && <span className="alt__etiqueta">Certa</span>}
										{estado === 'errada' && <span className="alt__etiqueta">Sua resposta</span>}
									</button>
								</li>
							);
						})}
					</ol>

					{/* Palco do Curió, sempre logo abaixo das alternativas: ele espera aqui e depois reage com a explicação */}
					<div role="status" aria-live="polite" className="palco">
						{respondida ? (
							<div className="resultado" data-acertou={acertou} ref={resultadoRef}>
								<div className="resultado__linha">
									<Curio humor={acertou ? 'feliz' : 'consolando'} tamanho={60} />
									<p className="resultado__titulo">
										{acertou ? <IconeCerto /> : <IconeQuase tamanho={18} />}
										<span>{acertou ? textoAcerto(pergunta.id) : textoErro(pergunta.id, pergunta.correta)}</span>
									</p>
								</div>
								<p className="resultado__explicacao" dangerouslySetInnerHTML={{ __html: pergunta.explicacao }} />
							</div>
						) : (
							<div className="espera">
								<Curio tamanho={saudar ? 52 : 44} />
								{saudar && (
									<p className="fala">Oi! Eu sou o Curió. Responda o que souber. O que não souber, a gente descobre junto.</p>
								)}
							</div>
						)}
					</div>
				</div>

				<footer className="carta__pe">
					{respondida ? (
						<button type="button" className="proxima" ref={proximaRef} onClick={() => onAvancar(indice)}>
							{ultima ? 'Continuar' : 'Próxima'}
							<IconeSeta />
						</button>
					) : (
						<button type="button" className="pular" onClick={() => onAvancar(indice)}>
							Pular esta
						</button>
					)}
				</footer>
			</article>
		</section>
	);
}
