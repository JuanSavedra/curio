import { getCollection, type CollectionEntry } from 'astro:content';
import { isTopic, type Topic } from '../data/topics';
import { richText } from './rich-text';
import type { DeckSummary, PublishedDeck } from './types';

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

export function publishDeck(deck: CollectionEntry<'decks'>): PublishedDeck {
	return {
		id: deck.id,
		topic: topicOfDeck(deck),
		title: deck.data.title,
		questions: deck.data.questions.map((q) => ({
			id: `${deck.id}/${q.id}`,
			level: q.level,
			prompt: richText(q.prompt),
			choices: q.choices.map(richText),
			correct: q.choices.indexOf(q.answer),
			explanation: richText(q.explanation),
		})),
	};
}
