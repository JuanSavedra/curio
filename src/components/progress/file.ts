import type { DeckSummary } from '../../lib/types';
import { localDay, readProgress, type ProgressData, type Streak } from '../feed/progress';

// The progress file: a readable JSON the person keeps and brings to another device. Nothing is sent anywhere.
// Importing only ever merges, so no file can take progress away.

export const FILE_APP = 'curio';
/** Bumped when the shape changes; a file with a higher number is refused ("update the app"). */
export const FILE_VERSION = 1;
export const MAX_BYTES = 2 * 1024 * 1024;
const MAX_IDS = 50_000;

export interface ProgressFile {
	app: typeof FILE_APP;
	version: number;
	exportedAt: string;
	progress: ProgressData;
}

export const buildFile = (): ProgressFile => ({
	app: FILE_APP,
	version: FILE_VERSION,
	exportedAt: new Date().toISOString(),
	progress: readProgress(),
});

export const fileName = (date = new Date()) => `curio-progresso-${localDay(date)}.json`;

export type FileError = 'not-curio' | 'newer' | 'too-big' | 'empty' | 'unreadable';

export interface ParsedFile {
	progress: ProgressData;
	/** Entries dropped: ids of decks that no longer exist, or malformed */
	ignored: number;
	/** When the file was saved (ISO), if the file says so */
	exportedAt: string | null;
}

export type ParseResult = ({ ok: true } & ParsedFile) | { ok: false; error: FileError };

// `<topic>/<subtopic>/<deck>/<question>`: lowercase letters, numbers and hyphens (see content.config.ts)
const QUESTION_ID = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** A real calendar date written as `YYYY-MM-DD`. */
function isDay(value: unknown): value is string {
	if (typeof value !== 'string' || !DAY.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Reads and checks a progress file before anything is written. `bytes` is the file's size;
 * `today` (local `YYYY-MM-DD`) keeps a file from the future from blocking the streak or the question of the day.
 */
export function parseFile(text: string, bytes: number, decks: DeckSummary[], today: string): ParseResult {
	if (bytes > MAX_BYTES) return { ok: false, error: 'too-big' };

	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return { ok: false, error: 'not-curio' };
	}
	if (!isRecord(data) || data.app !== FILE_APP || !isRecord(data.progress)) return { ok: false, error: 'not-curio' };
	if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) return { ok: false, error: 'not-curio' };
	if (data.version > FILE_VERSION) return { ok: false, error: 'newer' };

	const raw = data.progress;
	const deckIds = new Set(decks.map((d) => d.id));
	let ignored = 0;

	function ids(value: unknown): string[] | null {
		if (value === undefined) return [];
		if (!Array.isArray(value) || value.length > MAX_IDS) return null;
		const kept = new Set<string>();
		for (const id of value) {
			if (typeof id === 'string' && QUESTION_ID.test(id) && deckIds.has(id.split('/').slice(0, 3).join('/'))) kept.add(id);
			else ignored++;
		}
		return [...kept];
	}

	const seen = ids(raw.seen);
	const missed = ids(raw.missed);
	if (!seen || !missed) return { ok: false, error: 'not-curio' };

	let streak: Streak | null = null;
	if (isRecord(raw.streak) && isDay(raw.streak.lastDay) && raw.streak.lastDay <= today) {
		const days = raw.streak.days;
		if (typeof days === 'number' && Number.isInteger(days) && days >= 1 && days <= 36_500) streak = { days, lastDay: raw.streak.lastDay };
	}
	const daily = isDay(raw.daily) && raw.daily <= today ? raw.daily : null;
	const exported = typeof data.exportedAt === 'string' && !Number.isNaN(Date.parse(data.exportedAt)) ? data.exportedAt : null;

	if (!seen.length && !missed.length && !streak) return { ok: false, error: 'empty' };
	return { ok: true, progress: { seen, missed, streak, daily, visited: raw.visited === true }, ignored, exportedAt: exported };
}

export interface MergePlan {
	result: ProgressData;
	/** Discoveries the file adds that this device didn't have */
	added: number;
	/** Discoveries after merging */
	total: number;
	/** True when merging would change nothing */
	nothingNew: boolean;
}

/** The better of two streaks: the one with the most recent day (a tie goes to the longer). */
function bestStreak(a: Streak | null, b: Streak | null): Streak | null {
	if (!a || !b) return a ?? b;
	if (a.lastDay !== b.lastDay) return a.lastDay > b.lastDay ? a : b;
	return a.days >= b.days ? a : b;
}

/**
 * Joins the progress of this device with a file's. Everything adds up, and nothing is ever removed:
 * discoveries and "Que errei" are unions, the streak is the most recent one (an old file never breaks a current streak),
 * and the question of the day keeps the latest date.
 */
export function planMerge(local: ProgressData, incoming: ProgressData): MergePlan {
	const seen = new Set(local.seen);
	const added = incoming.seen.filter((id) => !seen.has(id)).length;
	for (const id of incoming.seen) seen.add(id);
	const missed = new Set([...local.missed, ...incoming.missed]);
	const streak = bestStreak(local.streak, incoming.streak);
	const daily = [local.daily, incoming.daily].filter((d): d is string => Boolean(d)).sort().pop() ?? null;
	const result: ProgressData = { seen: [...seen], missed: [...missed], streak, daily, visited: local.visited || incoming.visited };

	const nothingNew =
		added === 0 &&
		missed.size === local.missed.length &&
		streak?.days === local.streak?.days &&
		streak?.lastDay === local.streak?.lastDay &&
		daily === local.daily &&
		result.visited === local.visited;
	return { result, added, total: seen.size, nothingNew };
}
