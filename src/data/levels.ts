import type { CSSProperties } from 'react';

// Difficulty of a question. The id is what the YAML and the code use; `name` and `slug` are what people see.
export const LEVEL_IDS = ['easy', 'medium', 'hard'] as const;
export type Level = (typeof LEVEL_IDS)[number];

export const LEVELS: Record<Level, { name: string; slug: string }> = {
	easy: { name: 'Filhote', slug: 'filhote' },
	medium: { name: 'Curioso', slug: 'curioso' },
	hard: { name: 'Explorador', slug: 'explorador' },
};

export function levelFromSlug(slug: string | null): Level | null {
	return LEVEL_IDS.find((id) => LEVELS[id].slug === slug) ?? null;
}

/** Color variables of a level, named like the topic ones so the chip styles can be shared. */
export const levelStyle = (level: Level) =>
	({
		'--topic': `var(--level-${level})`,
		'--topic-ink': `var(--level-${level}-ink)`,
	}) as CSSProperties;
