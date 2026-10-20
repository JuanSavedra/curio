import { getCollection, type CollectionEntry } from 'astro:content';
import { isTopic, type Topic } from '../data/topics';
import { BLANK_MARK } from './question';
import { richText, splitBlank } from './rich-text';
import type { DeckSummary, PublishedDeck, PublishedQuestion } from './types';

function topicOfDeck(deck: CollectionEntry<'decks'>): Topic {
	const [topic, subtopic, name] = deck.id.split('/');
	if (!subtopic || !name) {
		throw new Error(`Deck "${deck.id}" must live in content/<topic>/<subtopic>/<deck>.yaml.`);
	}
	if (!isTopic(topic)) {
		throw new Error(`Deck "${deck.id}" is in an unknown topic: "${topic}". Register it in src/data/topics.ts.`);
	}
	return topic;
}

const nameFromFolder = (folder: string) => folder.charAt(0).toUpperCase() + folder.slice(1).replace(/-/g, ' ');

export async function listDecks(): Promise<DeckSummary[]> {
	const decks = await getCollection('decks');
	return decks
		.map((deck) => ({
			id: deck.id,
			topic: topicOfDeck(deck),
			subtopicId: deck.id.split('/')[1],
			subtopic: deck.data.subtopic ?? nameFromFolder(deck.id.split('/')[1]),
			title: deck.data.title,
			total: deck.data.questions.length,
		}))
		.sort((a, b) => a.id.localeCompare(b.id));
}

type Question = CollectionEntry<'decks'>['data']['questions'][number];

function publishQuestion(deckId: string, q: Question): PublishedQuestion {
	const base = {
		id: `${deckId}/${q.id}`,
		type: q.type,
		level: q.level,
		explanation: richText(q.explanation),
		...(q.learnMore && { learnMore: q.learnMore }),
	};
	if (q.type === 'true-false') {
		// Two fixed choices, so everything that shows choices (card, progress, challenge) works as it is
		return { ...base, prompt: richText(q.prompt), choices: ['Verdadeiro', 'Falso'], correct: q.answer ? 0 : 1 };
	}
	if (q.type === 'fill-blank') {
		const [before, after] = splitBlank(q.prompt);
		return {
			...base,
			prompt: richText(before) + BLANK_MARK + richText(after),
			choices: q.choices.map(richText),
			correct: q.choices.indexOf(q.answer),
		};
	}
	return { ...base, prompt: richText(q.prompt), choices: q.choices.map(richText), correct: q.choices.indexOf(q.answer) };
}

export function publishDeck(deck: CollectionEntry<'decks'>): PublishedDeck {
	return {
		id: deck.id,
		topic: topicOfDeck(deck),
		title: deck.data.title,
		questions: deck.data.questions.map((q) => publishQuestion(deck.id, q)),
	};
}
