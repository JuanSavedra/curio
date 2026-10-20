// Feed microcopy. Tone: a curious friend who celebrates along and consoles with a curiosity.
const CORRECT_MESSAGES = ['Isso aí!', 'Acertou em cheio!', 'Mandou bem!', 'Na mosca!', 'Exatamente!'];
const WRONG_MESSAGES = [
	(letter: string) => `Quase! A certa é a ${letter}.`,
	(letter: string) => `Não foi dessa vez. A certa é a ${letter}.`,
	(letter: string) => `Essa engana, né? A certa é a ${letter}.`,
];

export const LETTERS = ['A', 'B', 'C', 'D'];

// Stable pick per question, so the text doesn't change on every render.
function stableIndex(id: string, total: number) {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
	return Math.abs(hash) % total;
}

// ---------- Celebrations ----------

/** `run`: correct answers in a row. `days`: day streak milestone. */
export type Celebration = { kind: 'run'; n: number } | { kind: 'days'; n: number };

/** Runs of correct answers worth a party: 3, 5, 10 and then every 10. */
export const isRunMilestone = (n: number) => n === 3 || n === 5 || (n >= 10 && n % 10 === 0);

export const DAY_MILESTONES = [3, 7, 14, 30, 50, 100];

const RUN_MESSAGES: Record<number, string> = {
	3: 'Três seguidas!',
	5: 'Cinco seguidas! Que fase!',
	10: 'Dez seguidas! Você está voando.',
};

const DAY_MESSAGES: Record<number, string> = {
	3: '3 dias seguidos! Que bom te ver de novo.',
	7: '7 dias seguidos! Uma semana inteira de curiosidade.',
	14: 'Duas semanas seguidas! O Curió está orgulhoso.',
	30: 'Um mês inteiro! Que hábito bonito.',
	50: '50 dias seguidos! Que fôlego.',
	100: '100 dias seguidos! Isso merece um canto bem alto.',
};

export const runText = (n: number) => RUN_MESSAGES[n] ?? `${n} seguidas! Que voo!`;
export const daysText = (n: number) => DAY_MESSAGES[n];

export const correctText = (id: string) => CORRECT_MESSAGES[stableIndex(id, CORRECT_MESSAGES.length)];
export const wrongText = (id: string, correctIndex: number) =>
	WRONG_MESSAGES[stableIndex(id, WRONG_MESSAGES.length)](LETTERS[correctIndex]);

/** The challenge's clock ran out: no blame, the answer comes with the explanation. */
export const timeUpText = (correctIndex: number) => `O tempo acabou, sem problema. A certa é a ${LETTERS[correctIndex]}.`;
