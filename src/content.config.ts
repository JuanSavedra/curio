import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One deck = one file at content/<topic>/<subtopic>/<deck>.yaml
const question = z
	.object({
		id: z.string().regex(/^[a-z0-9-]+$/, 'Use only lowercase letters, numbers and hyphens in the id.'),
		prompt: z.string().min(5),
		choices: z.array(z.string().min(1)).min(2).max(4),
		answer: z.string().min(1),
		explanation: z.string().min(20, 'Every question needs a real explanation.'),
	})
	.refine((q) => q.choices.includes(q.answer), {
		message: 'The answer must equal (letter by letter) one of the choices.',
		path: ['answer'],
	})
	.refine((q) => new Set(q.choices).size === q.choices.length, {
		message: 'There are repeated choices.',
		path: ['choices'],
	});

const decks = defineCollection({
	loader: glob({ pattern: '**/*.{yaml,yml}', base: './content' }),
	schema: z
		.object({
			title: z.string().min(2),
			// Display name of the subtopic (folder names carry no accents). Without it, it comes from the folder name.
			subtopic: z.string().min(2).optional(),
			questions: z.array(question).min(1),
		})
		.refine((d) => new Set(d.questions.map((q) => q.id)).size === d.questions.length, {
			message: 'Two questions in this deck share the same id.',
			path: ['questions'],
		}),
});

export const collections = { decks };
