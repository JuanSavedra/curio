import type { CSSProperties } from 'react';

// Each topic owns exactly one color (DESIGN.md calls it "The Theme Owns Its Color Rule": "theme" there means topic).
// Colors live in src/styles/tokens.css under the same key as the topic id.
// `name` is what people read; `slug` is the public pt-BR address (/temas/<slug>).
export const TOPICS = {
	science: { name: 'Ciências', slug: 'ciencias' },
	math: { name: 'Matemática', slug: 'matematica' },
	logic: { name: 'Raciocínio lógico', slug: 'logica' },
	history: { name: 'História', slug: 'historia' },
	geography: { name: 'Geografia', slug: 'geografia' },
	astronomy: { name: 'Astronomia', slug: 'astronomia' },
	language: { name: 'Linguagem', slug: 'linguagem' },
} as const;

export type Topic = keyof typeof TOPICS;

/** Every topic id, in display order. */
export const TOPIC_IDS = Object.keys(TOPICS) as Topic[];

export const isTopic = (value: string): value is Topic => value in TOPICS;

export const topicFromSlug = (slug: string): Topic | undefined => TOPIC_IDS.find((id) => TOPICS[id].slug === slug);

/** Color variables of a topic (`--topic`, `--topic-ink`, `--topic-bg`) for an element's `style`. */
export const topicStyle = (topic: Topic) =>
	({
		'--topic': `var(--${topic})`,
		'--topic-ink': `var(--${topic}-ink)`,
		'--topic-bg': `var(--${topic}-bg)`,
	}) as CSSProperties;
