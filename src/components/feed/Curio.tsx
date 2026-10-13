export type Humor = 'neutro' | 'feliz' | 'consolando';

interface Props {
	humor?: Humor;
	tamanho?: number;
	className?: string;
}

/**
 * O Curió, versão 1: macho de cabeça e dorso escuros, peito castanho-ferrugem
 * e a pintinha branca na asa. É decorativo; o texto ao lado sempre diz o resultado.
 */
export function Curio({ humor = 'neutro', tamanho = 56, className = '' }: Props) {
	return (
		<svg
			className={`curio curio--${humor} ${className}`}
			width={tamanho}
			height={tamanho}
			viewBox="0 0 64 64"
			aria-hidden="true"
			focusable="false"
		>
			{humor === 'feliz' && (
				<g className="curio__notas" fill="var(--ferrugem)">
					<path d="M55 14v-8.5l5-1.2v7.2" fill="none" stroke="var(--ferrugem)" strokeWidth="1.6" strokeLinecap="round" />
					<ellipse cx="53.6" cy="14.2" rx="2.2" ry="1.7" />
					<ellipse cx="58.6" cy="11.6" rx="2.2" ry="1.7" />
				</g>
			)}
			<g className="curio__corpo">
				<path d="M15 41 3 51.5c-.9.8-.2 2.2 1 1.9L18 48z" fill="var(--plumagem)" />
				<ellipse cx="30" cy="39" rx="20" ry="17" fill="var(--plumagem)" />
				<ellipse cx="36.5" cy="44" rx="13" ry="10.5" fill="var(--ferrugem)" />
				<path d="M13 36c3-9 13-12 21-8-2 7-9 13-19 12-1.5-.2-2.4-2.2-2-4z" fill="oklch(0.33 0.02 40)" />
				<circle cx="22" cy="35.5" r="1.8" fill="var(--ninho)" />
				<g className="curio__cabeca">
					<circle cx="38" cy="22" r="13" fill="var(--plumagem)" />
					<path d="M49.5 18.5c4 .8 7.5 2.5 9 5-1.5 2.6-5 4-9 4.5-1.5-3-1.5-6.5 0-9.5z" fill="oklch(0.42 0.02 50)" />
					<path d="M50 23.2h7.5" stroke="var(--plumagem)" strokeWidth="1" strokeLinecap="round" />
					{humor === 'neutro' && (
						<g>
							<circle cx="42.5" cy="19.5" r="3" fill="var(--ninho)" />
							<circle cx="43.3" cy="19.6" r="1.8" fill="var(--plumagem)" />
							<circle cx="43.9" cy="18.9" r="0.6" fill="var(--ninho)" />
						</g>
					)}
					{humor === 'feliz' && (
						<path d="M39.6 20.6q2.9-3.6 5.8 0" fill="none" stroke="var(--ninho)" strokeWidth="1.8" strokeLinecap="round" />
					)}
					{humor === 'consolando' && (
						<path d="M39.6 18.8q2.9 2.8 5.8 0" fill="none" stroke="var(--ninho)" strokeWidth="1.8" strokeLinecap="round" />
					)}
				</g>
				<path d="M28 55.5v4M35 55.5v4" stroke="oklch(0.42 0.02 50)" strokeWidth="2" strokeLinecap="round" />
			</g>
		</svg>
	);
}
