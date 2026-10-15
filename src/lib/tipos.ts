import type { Tema } from '../data/temas';

// Formato publicado em /decks/<id>.json (o texto já vem em HTML, com KaTeX renderizado)
export interface PerguntaPublicada {
	id: string;
	enunciado: string;
	alternativas: string[];
	correta: number;
	explicacao: string;
}

export interface DeckPublicado {
	id: string;
	tema: Tema;
	titulo: string;
	perguntas: PerguntaPublicada[];
}

export interface ResumoDeck {
	id: string;
	tema: Tema;
	subtema: string;
	titulo: string;
	total: number;
}
