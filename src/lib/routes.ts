import { TOPICS, type Topic } from '../data/topics';

// Every site address goes through here, so the deploy's BASE_URL is respected.
// Public addresses stay in pt-BR (they are part of what people see and share).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Query parameter names the feed understands: `/?tema=astronomia`, `/?subtema=<folder>`, `/?modo=erradas`,
 * `/?nivel=filhote`, `/?deck=<id>`, `/?rever=1`.
 */
export const FEED_QUERY = { topic: 'tema', subtopic: 'subtema', mode: 'modo', level: 'nivel', deck: 'deck', review: 'rever' } as const;

/** What the feed shows: new questions (default), the ones answered wrong, or the ones already discovered. */
export type FeedMode = 'new' | 'missed' | 'seen';

/** Public (pt-BR) value of `?modo=` for each mode. `new` has no value: it is the default. */
export const MODE_SLUGS = { missed: 'erradas', seen: 'vistas' } as const;

interface FeedFilter {
	topic?: Topic;
	subtopic?: string;
	deck?: string;
	/** Forget what was seen in the topic (or deck) before starting */
	review?: boolean;
}

export function feedRoute({ topic, subtopic, deck, review }: FeedFilter = {}) {
	const query = new URLSearchParams();
	if (topic) query.set(FEED_QUERY.topic, TOPICS[topic].slug);
	if (subtopic) query.set(FEED_QUERY.subtopic, subtopic);
	if (deck) query.set(FEED_QUERY.deck, deck);
	if (review) query.set(FEED_QUERY.review, '1');
	const text = query.toString();
	return `${base}/${text ? `?${text}` : ''}`;
}

export const albumRoute = () => `${base}/album/`;
export const sealsRoute = () => `${base}/selos/`;
export const topicsRoute = () => `${base}/temas/`;
export const topicRoute = (topic: Topic) => `${base}/temas/${TOPICS[topic].slug}/`;
export const deckJsonRoute = (id: string) => `${base}/decks/${id}.json`;
