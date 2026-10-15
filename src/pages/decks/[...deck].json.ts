import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { publishDeck } from '../../lib/decks';

// One JSON per deck (never one per question: Cloudflare Pages file limit)
export const getStaticPaths = (async () => {
	const decks = await getCollection('decks');
	return decks.map((deck) => ({ params: { deck: deck.id }, props: { deck } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ deck: CollectionEntry<'decks'> }> = ({ props }) =>
	new Response(JSON.stringify(publishDeck(props.deck)), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
