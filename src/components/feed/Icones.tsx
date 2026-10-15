// Ícones de traço arredondado, todos no mesmo estilo. Decorativos: o texto ao lado dá o sentido.
import type { ReactNode } from 'react';
import type { Tema } from '../../data/temas';

export function Icone({ children, tamanho = 20 }: { children: ReactNode; tamanho?: number }) {
	return (
		<svg
			width={tamanho}
			height={tamanho}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{children}
		</svg>
	);
}

export const IconeCerto = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</Icone>
);

export const IconeQuase = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="m7 7 10 10M17 7 7 17" />
	</Icone>
);

export const IconeSeta = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="M12 5v14M6 13l6 6 6-6" />
	</Icone>
);

export const IconeRecomecar = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
	</Icone>
);

export const IconeNota = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="M9 18V6l10-2v12" />
		<circle cx="6.5" cy="18" r="2.5" />
		<circle cx="16.5" cy="16" r="2.5" />
	</Icone>
);

export const IconeSetaDireita = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</Icone>
);

export const IconeSetaEsquerda = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</Icone>
);

/** Quatro cantinhos arredondados: a porta para a tela de temas. */
export const IconeTemas = (p: { tamanho?: number }) => (
	<Icone {...p}>
		<rect x="4" y="4" width="6.5" height="6.5" rx="2" />
		<rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
		<rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
		<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
	</Icone>
);

// ---------- Um ícone para cada tema (mesmo traço dos demais) ----------

const ICONES_DE_TEMA: Record<Tema, ReactNode> = {
	// Frasco com um tracinho de líquido
	ciencias: (
		<>
			<path d="M9.5 3.5h5M10 3.5v5.8L5.2 17.6A2.2 2.2 0 0 0 7.1 21h9.8a2.2 2.2 0 0 0 1.9-3.4L14 9.3V3.5" />
			<path d="M7.8 15h8.4" />
		</>
	),
	// Pi
	matematica: <path d="M4.5 7h15M9 7l-.6 10.5M15 7v9.5a1.5 1.5 0 0 0 1.5 1.5h.8" />,
	// Peça de quebra-cabeça
	logica: <path d="M4 6h6a2 2 0 1 1 4 0h6v4a2 2 0 1 1 0 4v6H4v-6a2 2 0 1 0 0-4z" />,
	// Ampulheta
	historia: (
		<>
			<path d="M6.5 3h11M6.5 21h11" />
			<path d="M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l-2.4 2.3A4 4 0 0 0 8 17.5V21M16 3v3.5a4 4 0 0 1-1.6 3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" />
		</>
	),
	// Globo
	geografia: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" />
		</>
	),
	// Planeta com anel (o anel passa na frente e some atrás do planeta)
	astronomia: (
		<g transform="rotate(-20 12 12)">
			<circle cx="12" cy="12" r="5.5" />
			<path d="M16.83 9.37A10 3 0 0 1 16.83 14.63A10 3 0 0 1 7.17 14.63A10 3 0 0 1 7.17 9.37" />
		</g>
	),
	// Balão de fala
	linguagem: (
		<>
			<path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z" />
			<path d="M8 9.5h8M8 12.5h5" />
		</>
	),
};

export const IconeTema = ({ tema, tamanho }: { tema: Tema; tamanho?: number }) => (
	<Icone tamanho={tamanho}>{ICONES_DE_TEMA[tema]}</Icone>
);
