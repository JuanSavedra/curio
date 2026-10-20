// Challenge microcopy. Tone: a friend who cheers you on. The clock is a nudge, never a threat:
// no "you lost", no "hurry", nothing about what the time cost.

/** Questions in a round (fewer when the chosen topic doesn't have that many) */
export const ROUND_SIZE = 10;

/** Seconds added by "Mais 15 s". Unlimited: the clock is a nudge, and this keeps the time adjustable (WCAG 2.2.1). */
export const EXTRA_SECONDS = 15;

/** When this many seconds are left, the clock turns warm and screen readers hear it once. */
export const LOW_SECONDS = 10;

export const TIME_OPTIONS = [
	{ seconds: 20, name: 'Ligeiro' },
	{ seconds: 30, name: 'Tranquilo' },
	{ seconds: 45, name: 'Com calma' },
] as const;

export type Seconds = (typeof TIME_OPTIONS)[number]['seconds'];

export const DEFAULT_SECONDS: Seconds = 30;

/** Under the topic choices: how many questions there are and how many the round will have. */
export function poolText(available: number, scopeIsAll: boolean) {
	const where = scopeIsAll ? 'no total' : 'neste tema';
	const size = Math.min(ROUND_SIZE, available);
	const have = available === 1 ? '1 pergunta' : `${available} perguntas`;
	return available > ROUND_SIZE ? `${have} ${where}. A rodada terá ${size}.` : `${have} ${where}, então a rodada terá ${size}.`;
}

export const scoreTitle = (correct: number, total: number) => {
	if (correct === 0) return `Nenhum acerto desta vez, mas ${total === 1 ? '1 curiosidade nova' : `${total} curiosidades novas`}.`;
	if (correct === total) return `Rodada perfeita! Você acertou ${correct} de ${total}.`;
	return `Você acertou ${correct} de ${total}.`;
};

export const scoreText = (correct: number, total: number) => {
	if (correct === total) return 'O Curió está até cantando de alegria.';
	if (correct / total >= 0.7) return 'Que rodada boa! O Curió ficou impressionado.';
	return 'Cada resposta é uma descoberta nova.';
};

export const timedOutNote = (count: number) =>
	`${count === 1 ? '1 pergunta ficou sem resposta' : `${count} perguntas ficaram sem resposta`} porque o tempo acabou. Sem problema.`;

export const STATUS_TEXT = { correct: 'Acertou', wrong: 'Errou', timeout: 'Tempo esgotado' } as const;

export type Status = keyof typeof STATUS_TEXT;
