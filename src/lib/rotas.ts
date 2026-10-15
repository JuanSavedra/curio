import type { Tema } from '../data/temas';

// Todos os endereços do site passam por aqui, para respeitar o BASE_URL do deploy.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** O feed, opcionalmente filtrado: `?tema=astronomia`, `?deck=<id>`, `?rever=1`. */
export function rotaDoFeed(filtro: Record<string, string> = {}) {
	const consulta = new URLSearchParams(filtro).toString();
	return `${base}/${consulta ? `?${consulta}` : ''}`;
}

export const rotaDosTemas = () => `${base}/temas/`;
export const rotaDoTema = (tema: Tema) => `${base}/temas/${tema}/`;
export const rotaDoDeck = (id: string) => `${base}/decks/${id}.json`;
