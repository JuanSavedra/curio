import { useId } from 'react';
import './curio.css';

export type Humor = 'esperando' | 'feliz' | 'consolando' | 'comemorando';

interface Props {
	humor?: Humor;
	tamanho?: number;
	/** Sem animação de espera (para o logo, por exemplo) */
	parado?: boolean;
	className?: string;
}

// Silhuetas compartilhadas: desenhadas uma vez com contorno por baixo e outra vez por cima,
// para o contorno aparecer só na borda de fora.
const CAUDA = 'M23 47 8.5 61.5c-1.6 1.6-.4 4 1.8 3.2L28 56z';
const BICO = 'M60.5 22.5c6.5.3 11.5 3 13.8 6.6L61 31c-1.3-2.6-1.4-5.6-.5-8.5z';

/**
 * O Curió: macho de cabeça e dorso escuros, peito castanho-ferrugem,
 * pintinha branca na asa e bico grosso. É decorativo; o texto ao lado sempre diz o resultado.
 */
export function Curio({ humor = 'esperando', tamanho = 56, parado = false, className = '' }: Props) {
	const alegre = humor === 'feliz' || humor === 'comemorando';
	const idPeito = `curio-peito-${useId().replace(/:/g, '')}`;
	return (
		<svg
			className={`curio curio--${humor}${parado ? ' curio--parado' : ''} ${className}`}
			width={tamanho}
			height={tamanho}
			viewBox="0 0 80 80"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<radialGradient id={idPeito} cx="0.6" cy="0.35" r="0.75">
					<stop offset="0" stopColor="var(--curio-peito-luz)" />
					<stop offset="0.7" stopColor="var(--ferrugem)" />
				</radialGradient>
			</defs>
			{alegre && (
				<g className="curio__notas" fill="var(--ferrugem)" stroke="var(--ferrugem)" strokeWidth="1.6" strokeLinecap="round">
					<g className="curio__nota">
						<path d="M71 13V5.5l5-1.2V11" fill="none" />
						<ellipse cx="69.6" cy="13.2" rx="2.3" ry="1.8" stroke="none" />
						<ellipse cx="74.6" cy="11" rx="2.3" ry="1.8" stroke="none" />
					</g>
					{humor === 'comemorando' && (
						<g className="curio__nota curio__nota--2">
							<path d="M61 10V3.5" fill="none" />
							<ellipse cx="59.4" cy="10.3" rx="2.2" ry="1.7" stroke="none" />
						</g>
					)}
				</g>
			)}

			<g className="curio__ave">
				{/* Contorno */}
				<g fill="var(--curio-contorno)" stroke="var(--curio-contorno)" strokeWidth="2.6" strokeLinejoin="round">
					<path d={CAUDA} />
					<ellipse cx="38" cy="50" rx="24" ry="20" />
					<circle cx="47" cy="29" r="16" />
				</g>

				<path d={CAUDA} fill="var(--plumagem)" />
				<path d="M12 59.5 18 54" stroke="var(--curio-luz)" strokeWidth="1.4" strokeLinecap="round" />

				{/* Corpo e peito */}
				<ellipse cx="38" cy="50" rx="24" ry="20" fill="var(--plumagem)" />
				<ellipse cx="45.5" cy="55" rx="15.5" ry="13" fill={`url(#${idPeito})`} />

				{/* Asa da frente */}
				<g className="curio__asa">
					{humor === 'comemorando' ? (
						<>
							{/* Asa erguida, com as penas da ponta abertas */}
							<path
								d="M37 45c-3-8.5-9.5-17-18.5-22.5-3.5-2.1-7.5.6-6.5 4.3.4 1.4 1.2 2.6 2.2 3.5-3 .2-4.8 3.4-3.1 5.8.8 1.1 2 1.8 3.3 2-2 1.4-1.7 4.6.6 5.6C20 46.5 29 47 37 45z"
								fill="var(--curio-luz)"
								stroke="var(--curio-contorno)"
								strokeWidth="1.3"
								strokeLinejoin="round"
							/>
							<path d="M15.5 31c6 2.5 12 6.5 17 11.5M15 39c5.5.8 11 2.5 16 4.8" stroke="var(--plumagem)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
							<circle cx="26" cy="35" r="2.2" fill="var(--ninho)" />
						</>
					) : (
						<>
							<path d="M16.5 46c3-11 17-14.5 27.5-8.5-1.8 9.5-10.5 17.5-22 17.5-4.3 0-6.5-4.5-5.5-9z" fill="var(--curio-luz)" />
							<path d="M20 51.5c5 .5 11-1.5 15.5-6M19 46.5c4.5-.5 9.5-2.5 13-6" stroke="var(--plumagem)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
							<circle cx="27.5" cy="44.5" r="2.2" fill="var(--ninho)" />
						</>
					)}
				</g>

				{/* Pés */}
				<path d="M33 69.5v4.5M43 69.5v4.5M30.5 74h5M40.5 74h5" stroke="var(--curio-bico)" strokeWidth="2" strokeLinecap="round" />

				{/* Cabeça */}
				<g className="curio__cabeca">
					<circle cx="47" cy="29" r="16" fill="var(--plumagem)" />
					<path d="M33.5 24.5c2-6.5 8-11 15-11.5-5.5 2.5-9.5 7-11 12.5z" fill="var(--curio-luz)" />

					<path d={BICO} fill="var(--curio-bico)" stroke="var(--curio-contorno)" strokeWidth="1.3" strokeLinejoin="round" />
					<path d="M63 25c3.5.3 6.5 1.5 8.5 3.3" stroke="var(--curio-bico-luz)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
					<path
						className="curio__bico-baixo"
						d="M61 31l13.3-1.9c-1.8 3-6.3 5-12 4.6z"
						fill="var(--curio-bico)"
						stroke="var(--curio-contorno)"
						strokeWidth="1.3"
						strokeLinejoin="round"
					/>

					<g className="curio__olho">
						{humor === 'esperando' && (
							<>
								<circle cx="53.5" cy="25.5" r="3.8" fill="var(--ninho)" />
								<circle cx="54.4" cy="25.8" r="2.4" fill="var(--curio-contorno)" />
								<circle cx="55.3" cy="24.6" r="0.9" fill="var(--ninho)" />
							</>
						)}
						{alegre && <path d="M49.8 27.2q3.7-5.2 7.4 0" fill="none" stroke="var(--ninho)" strokeWidth="2.3" strokeLinecap="round" />}
						{humor === 'consolando' && (
							<>
								{/* Olhar para baixo e sobrancelha erguida do lado de dentro: compaixão */}
								<circle cx="53.5" cy="25.8" r="4.1" fill="var(--ninho)" />
								<circle cx="54" cy="27" r="2" fill="var(--curio-contorno)" />
								<circle cx="54.7" cy="26.2" r="0.7" fill="var(--ninho)" />
								<path d="M49.6 21.6q3.5-.2 7.2-3" fill="none" stroke="var(--curio-bico-luz)" strokeWidth="1.8" strokeLinecap="round" />
							</>
						)}
					</g>
				</g>
			</g>
		</svg>
	);
}
