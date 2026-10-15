import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Um deck = um arquivo em content/<tema>/<subtema>/<deck>.yaml
const pergunta = z
	.object({
		id: z.string().regex(/^[a-z0-9-]+$/, 'Use só letras minúsculas, números e hífens no id.'),
		enunciado: z.string().min(5),
		alternativas: z.array(z.string().min(1)).min(2).max(4),
		resposta: z.string().min(1),
		explicacao: z.string().min(20, 'Toda pergunta precisa de uma explicação de verdade.'),
	})
	.refine((p) => p.alternativas.includes(p.resposta), {
		message: 'A resposta precisa ser igual (letra por letra) a uma das alternativas.',
		path: ['resposta'],
	})
	.refine((p) => new Set(p.alternativas).size === p.alternativas.length, {
		message: 'Há alternativas repetidas.',
		path: ['alternativas'],
	});

const decks = defineCollection({
	loader: glob({ pattern: '**/*.{yaml,yml}', base: './content' }),
	schema: z
		.object({
			titulo: z.string().min(2),
			// Nome de exibição do subtema (a pasta não guarda acentos). Sem ele, vem do nome da pasta.
			subtema: z.string().min(2).optional(),
			perguntas: z.array(pergunta).min(1),
		})
		.refine((d) => new Set(d.perguntas.map((p) => p.id)).size === d.perguntas.length, {
			message: 'Há perguntas com o mesmo id neste deck.',
			path: ['perguntas'],
		}),
});

export const collections = { decks };
