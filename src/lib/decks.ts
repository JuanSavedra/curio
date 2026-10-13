import { getCollection, type CollectionEntry } from 'astro:content';
import { ehTema, type Tema } from '../data/temas';
import { textoRico } from './texto-rico';
import type { DeckPublicado, ResumoDeck } from './tipos';

function temaDoDeck(deck: CollectionEntry<'decks'>): Tema {
	const [tema, subtema, nome] = deck.id.split('/');
	if (!subtema || !nome) {
		throw new Error(`O deck "${deck.id}" precisa ficar em content/<tema>/<subtema>/<deck>.yaml.`);
	}
	if (!ehTema(tema)) {
		throw new Error(`O deck "${deck.id}" está num tema desconhecido: "${tema}". Cadastre-o em src/data/temas.ts.`);
	}
	return tema;
}

export async function listarDecks(): Promise<ResumoDeck[]> {
	const decks = await getCollection('decks');
	return decks
		.map((deck) => ({
			id: deck.id,
			tema: temaDoDeck(deck),
			titulo: deck.data.titulo,
			total: deck.data.perguntas.length,
		}))
		.sort((a, b) => a.id.localeCompare(b.id));
}

export function publicarDeck(deck: CollectionEntry<'decks'>): DeckPublicado {
	return {
		id: deck.id,
		tema: temaDoDeck(deck),
		titulo: deck.data.titulo,
		perguntas: deck.data.perguntas.map((p) => ({
			id: `${deck.id}/${p.id}`,
			enunciado: textoRico(p.enunciado),
			alternativas: p.alternativas.map(textoRico),
			correta: p.alternativas.indexOf(p.resposta),
			explicacao: textoRico(p.explicacao),
		})),
	};
}
