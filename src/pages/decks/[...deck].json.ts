import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { publicarDeck } from '../../lib/decks';

// Um JSON por deck (nunca um por pergunta: limite de arquivos do Cloudflare Pages)
export const getStaticPaths = (async () => {
	const decks = await getCollection('decks');
	return decks.map((deck) => ({ params: { deck: deck.id }, props: { deck } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ deck: CollectionEntry<'decks'> }> = ({ props }) =>
	new Response(JSON.stringify(publicarDeck(props.deck)), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
