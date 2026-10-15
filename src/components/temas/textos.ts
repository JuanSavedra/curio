// Microcopy das telas de temas. Tom: amigo curioso, nunca professor.
export const perguntas = (n: number) => (n === 1 ? '1 pergunta' : `${n} perguntas`);

export const colecoes = (n: number) => (n === 1 ? '1 coleção' : `${n} coleções`);

export const descobertas = (feitas: number, total: number) =>
	`${feitas} de ${total} ${total === 1 ? 'descoberta' : 'descobertas'}`;
