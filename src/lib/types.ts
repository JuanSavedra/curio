import type { Level } from '../data/levels';
import type { Topic } from '../data/topics';

// Shape published at /decks/<id>.json (text already comes as HTML, with KaTeX rendered)
export interface PublishedQuestion {
	id: string;
	level: Level;
	prompt: string;
	choices: string[];
	/** Index of the right choice */
	correct: number;
	explanation: string;
	/** Optional links to learn more (open in a new tab) */
	learnMore?: { title: string; url: string }[];
}

export interface PublishedDeck {
	id: string;
	topic: Topic;
	title: string;
	questions: PublishedQuestion[];
}

export interface DeckSummary {
	id: string;
	topic: Topic;
	/** Folder name of the subtopic (used in the address) */
	subtopicId: string;
	/** Display name of the subtopic */
	subtopic: string;
	title: string;
	total: number;
}
