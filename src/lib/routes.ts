import { TOPICS, type Topic } from '../data/topics';

// Every site address goes through here, so the deploy's BASE_URL is respected.
// Public addresses stay in pt-BR (they are part of what people see and share).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Query parameter names the feed understands: `/?tema=astronomia`, `/?deck=<id>`, `/?rever=1`. */
export const FEED_QUERY = { topic: 'tema', deck: 'deck', review: 'rever' } as const;

interface FeedFilter {
	topic?: Topic;
	deck?: string;
	/** Forget what was seen in the topic (or deck) before starting */
	review?: boolean;
}

export function feedRoute({ topic, deck, review }: FeedFilter = {}) {
	const query = new URLSearchParams();
	if (topic) query.set(FEED_QUERY.topic, TOPICS[topic].slug);
	if (deck) query.set(FEED_QUERY.deck, deck);
	if (review) query.set(FEED_QUERY.review, '1');
	const text = query.toString();
	return `${base}/${text ? `?${text}` : ''}`;
}

export const topicsRoute = () => `${base}/temas/`;
export const topicRoute = (topic: Topic) => `${base}/temas/${TOPICS[topic].slug}/`;
export const deckJsonRoute = (id: string) => `${base}/decks/${id}.json`;
