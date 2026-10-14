import { useMemo, type CSSProperties } from 'react';

const CORES = ['var(--ferrugem)', 'var(--curio-peito-luz)', 'var(--plumagem)', 'var(--curio-luz)'];
const QUANTIDADE = 14;

/**
 * Penas caindo sobre o palco numa celebração. Decorativas, não recebem toque
 * e somem sozinhas em até ~1,2s. Com movimento reduzido, não aparecem (ver feed.css).
 */
export function Penas() {
	const penas = useMemo(
		() =>
			Array.from({ length: QUANTIDADE }, (_, i) => ({
				x: `${(i / QUANTIDADE) * 100 + Math.random() * 6}%`,
				atraso: `${Math.round(Math.random() * 200)}ms`,
				queda: `${14 + Math.random() * 8}rem`,
				deriva: `${(Math.random() - 0.5) * 4}rem`,
				giro0: `${Math.round((Math.random() - 0.5) * 120)}deg`,
				giro1: `${Math.round((Math.random() - 0.5) * 360)}deg`,
				escala: (0.7 + Math.random() * 0.6).toFixed(2),
				cor: CORES[i % CORES.length],
			})),
		[],
	);

	return (
		<div className="penas" aria-hidden="true">
			{penas.map((p, i) => (
				<svg
					key={i}
					className="pena"
					viewBox="0 0 12 26"
					width="12"
					height="26"
					style={
						{
							left: p.x,
							color: p.cor,
							animationDelay: p.atraso,
							'--queda': p.queda,
							'--deriva': p.deriva,
							'--giro0': p.giro0,
							'--giro1': p.giro1,
							'--escala': p.escala,
						} as CSSProperties
					}
				>
					<path d="M6 .5c4.2 5 6 13 1.5 20.5H4.5C0 13.5 1.8 5.5 6 .5z" fill="currentColor" />
					<path d="M6 3.5V25.5" stroke="var(--ninho)" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
				</svg>
			))}
		</div>
	);
}
