import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LEVEL_IDS } from './data/levels';
import { BLANK_TEXT, countBlanks } from './lib/rich-text';

// One deck = one file at content/<topic>/<subtopic>/<deck>.yaml

// What every kind of question has
const shared = {
	id: z.string().regex(/^[a-z0-9-]+$/, 'Use only lowercase letters, numbers and hyphens in the id.'),
	level: z.enum(LEVEL_IDS),
	prompt: z.string().min(5),
	explanation: z.string().min(20, 'Every question needs a real explanation.'),
	// Optional links to trustworthy sources, shown after the answer
	learnMore: z
		.array(
			z.object({
				title: z.string().min(2),
				url: z.string().url().startsWith('https://', 'Use an https link.'),
			}),
		)
		.max(3)
		.optional(),
};

const choices = z.array(z.string().min(1)).min(2).max(4);

/** The answer must be one of the choices, letter by letter, and no choice may repeat. */
const validChoices = <T extends { choices: string[]; answer: string }>(q: T, ctx: z.RefinementCtx) => {
	if (!q.choices.includes(q.answer)) {
		ctx.addIssue({ code: 'custom', message: 'The answer must equal (letter by letter) one of the choices.', path: ['answer'] });
	}
	if (new Set(q.choices).size !== q.choices.length) {
		ctx.addIssue({ code: 'custom', message: 'There are repeated choices.', path: ['choices'] });
	}
};

// type: choice (the default). Pick one of 2 to 4 choices.
const multipleChoice = z.object({ type: z.literal('choice'), ...shared, choices, answer: z.string().min(1) }).superRefine(validChoices);

// type: true-false. The prompt is a statement; the answer is true or false. The two choices are fixed by the site.
const trueFalse = z
	.object({ type: z.literal('true-false'), ...shared, answer: z.boolean('A true-false question needs `answer: true` or `answer: false`.') })
	.strict();

// type: fill-blank. The prompt has exactly one gap written as ___ ; the choices are the words that could fill it.
const fillBlank = z
	.object({ type: z.literal('fill-blank'), ...shared, choices, answer: z.string().min(1) })
	.superRefine(validChoices)
	.superRefine((q, ctx) => {
		if (countBlanks(q.prompt) !== 1) {
			ctx.addIssue({
				code: 'custom',
				message: `A fill-blank prompt needs exactly one "${BLANK_TEXT}" (outside formulas); found ${countBlanks(q.prompt)}.`,
				path: ['prompt'],
			});
		}
	});

// Without `type`, a question is multiple choice: every deck written before the other types keeps working.
const question = z.preprocess(
	(value) => (typeof value === 'object' && value !== null && !('type' in value) ? { ...value, type: 'choice' } : value),
	z.discriminatedUnion('type', [multipleChoice, trueFalse, fillBlank], {
		error: 'Unknown question type. Use `choice` (or leave `type` out), `true-false` or `fill-blank`.',
	}),
);

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
