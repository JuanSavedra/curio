import type { DeckSummary } from './types';

// The question of the day, with no server: every device runs the same fixed math on the same date, so everyone
// who shares a calendar day gets the same question. It is a "highest score wins" draw, not `date % total`, so adding
// decks or questions rarely changes the pick of a day.

/** A small fixed hash (FNV-1a plus a final mix): the same text gives the same number on every device. Result in (0, 1]. */
function unit(text: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	h ^= h >>> 16;
	h = Math.imul(h, 0x85ebca6b);
	h ^= h >>> 13;
	h = Math.imul(h, 0xc2b2ae35);
	h ^= h >>> 16;
	return ((h >>> 0) + 1) / 2 ** 32;
}

/**
 * The deck of the day. Each deck draws a score from the date and its id, scaled by its size
 * (a deck with twice the questions is twice as likely), and the lowest score wins.
 */
export function pickDailyDeck(decks: DeckSummary[], day: string): DeckSummary | undefined {
	let best: DeckSummary | undefined;
	let bestScore = Infinity;
	for (const deck of decks) {
		if (deck.total <= 0) continue;
		const score = -Math.log(unit(`${day}|${deck.id}`)) / deck.total;
		if (score < bestScore) {
			best = deck;
			bestScore = score;
		}
	}
	return best;
}

/** The question of the day inside the deck of the day: the one with the lowest score for that date. */
export function pickDailyQuestion<Q extends { id: string }>(questions: Q[], day: string): Q | undefined {
	let best: Q | undefined;
	let bestScore = Infinity;
	for (const question of questions) {
		const score = unit(`${day}|${question.id}`);
		if (score < bestScore) {
			best = question;
			bestScore = score;
		}
	}
	return best;
}
