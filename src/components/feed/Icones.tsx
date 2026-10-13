// Ícones de traço arredondado, todos no mesmo estilo. Decorativos: o texto ao lado dá o sentido.
import type { ReactNode } from 'react';

function Icone({ children, tamanho = 20 }: { children: ReactNode; tamanho?: number }) {
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
