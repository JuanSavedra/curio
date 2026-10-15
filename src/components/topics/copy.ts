// Microcopy of the topic screens. Tone: a curious friend, never a teacher.
export const questionCount = (n: number) => (n === 1 ? '1 pergunta' : `${n} perguntas`);

export const collectionCount = (n: number) => (n === 1 ? '1 coleção' : `${n} coleções`);

export const discoveredCount = (done: number, total: number) =>
	`${done} de ${total} ${total === 1 ? 'descoberta' : 'descobertas'}`;
