import type { DeckSummary } from '../../lib/types';

// Local progress. If localStorage is blocked everything still works, it just isn't remembered.
const KEY_SEEN = 'curio:seen';
const KEY_STREAK = 'curio:streak';
const KEY_VISITED = 'curio:visited';
const KEY_MISSED = 'curio:missed';
const KEY_SIDEBAR = 'curio:sidebar-collapsed';
const KEY_LAST_TOPIC = 'curio:last-topic';
const KEY_DAILY = 'curio:daily';

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// No storage available: carry on without remembering.
	}
}

/** Ids of the questions already seen (a question counts as "discovered" once answered). */
export const readSeen = () => new Set(read<string[]>(KEY_SEEN, []));

export function markSeen(id: string) {
	const seen = readSeen();
	seen.add(id);
	write(KEY_SEEN, [...seen]);
}

/** Ids of the questions last answered wrong. Answering one right takes it off the list. */
export const readMissed = () => new Set(read<string[]>(KEY_MISSED, []));

export function markMissed(id: string) {
	const missed = readMissed();
	missed.add(id);
	write(KEY_MISSED, [...missed]);
}

export function clearMissed(id: string) {
	const missed = readMissed();
	if (missed.delete(id)) write(KEY_MISSED, [...missed]);
}

export function forgetSeen(prefixes: string[]) {
	const remaining = [...readSeen()].filter((id) => !prefixes.some((p) => id.startsWith(p)));
	write(KEY_SEEN, remaining);
}

/** How many questions of the deck were already discovered, never more than the total. */
export function discoveredInDeck(seen: Set<string>, deck: string, total: number) {
	let count = 0;
	for (const id of seen) if (id.startsWith(`${deck}/`)) count++;
	return Math.min(count, total);
}

export interface DecksProgress {
	total: number;
	discovered: number;
	complete: boolean;
}

/** Adds up the progress of a set of decks (a whole topic, for instance). */
export function decksProgress(seen: Set<string>, decks: DeckSummary[]): DecksProgress {
	const total = decks.reduce((sum, d) => sum + d.total, 0);
	const discovered = decks.reduce((sum, d) => sum + discoveredInDeck(seen, d.id, d.total), 0);
	return { total, discovered, complete: total > 0 && discovered >= total };
}

export const readSidebarCollapsed = () => read(KEY_SIDEBAR, false);
export const writeSidebarCollapsed = (collapsed: boolean) => write(KEY_SIDEBAR, collapsed);

export const readLastTopic = () => read<string | null>(KEY_LAST_TOPIC, null);
export const writeLastTopic = (topic: string) => write(KEY_LAST_TOPIC, topic);

/**
 * The last day (local, `YYYY-MM-DD`) the question of the day was dealt with: answered, or passed over.
 * Only that one date: it is not a history and not a streak, so missing days costs nothing.
 */
export const readDailyDay = () => read<string | null>(KEY_DAILY, null);
export const writeDailyDay = (day: string) => write(KEY_DAILY, day);

export const hasVisited = () => read(KEY_VISITED, false);
export const markVisited = () => write(KEY_VISITED, true);

interface Streak {
	days: number;
	lastDay: string;
}

export const localDay = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Consecutive days with at least one answer. Breaking the streak just starts over, no guilt. */
export function readStreak(): number {
	const streak = read<Streak | null>(KEY_STREAK, null);
	if (!streak) return 0;
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return streak.lastDay === localDay(new Date()) || streak.lastDay === localDay(yesterday) ? streak.days : 0;
}

/** Records today's answer. `newDay` says whether it was the day's first (when a milestone can be completed). */
export function recordDay(): { days: number; newDay: boolean } {
	const today = localDay(new Date());
	const streak = read<Streak | null>(KEY_STREAK, null);
	if (streak?.lastDay === today) return { days: streak.days, newDay: false };
	const days = readStreak() + 1;
	write(KEY_STREAK, { days, lastDay: today });
	return { days, newDay: true };
}
