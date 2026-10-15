import type { CSSProperties } from 'react';

// Cada tema tem exatamente uma cor (The Theme Owns Its Color Rule).
// As cores vivem em src/styles/tokens.css com o mesmo nome do slug.
export const TEMAS = {
	ciencias: 'Ciências',
	matematica: 'Matemática',
	logica: 'Raciocínio lógico',
	historia: 'História',
	geografia: 'Geografia',
	astronomia: 'Astronomia',
	linguagem: 'Linguagem',
} as const;

export type Tema = keyof typeof TEMAS;

export const ehTema = (valor: string): valor is Tema => valor in TEMAS;

/** Variáveis de cor do tema (`--tema`, `--tema-tinta`, `--tema-fundo`) para o `style` de um elemento. */
export const corDoTema = (tema: Tema) =>
	({
		'--tema': `var(--${tema})`,
		'--tema-tinta': `var(--${tema}-tinta)`,
		'--tema-fundo': `var(--${tema}-fundo)`,
	}) as CSSProperties;
