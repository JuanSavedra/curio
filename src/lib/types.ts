import type { Level } from '../data/levels';
import type { Topic } from '../data/topics';

/** How a question is answered: pick one of the choices, say true or false, or fill the gap in the sentence. */
export type QuestionType = 'choice' | 'true-false' | 'fill-blank';

// Shape published at /decks/<id>.json (text already comes as HTML, with KaTeX rendered)
export interface PublishedQuestion {
	id: string;
	type: QuestionType;
	level: Level;
	/** HTML. A fill-in-the-blank prompt holds BLANK_MARK where the gap goes (see question.ts) */
	prompt: string;
	/** A true-or-false question has two fixed choices: Verdadeiro and Falso */
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
