// Microcopy do feed. Tom: amigo curioso que comemora junto e consola com uma curiosidade.
const ACERTOS = ['Isso aí!', 'Acertou em cheio!', 'Mandou bem!', 'Na mosca!', 'Exatamente!'];
const ERROS = [
	(letra: string) => `Quase! A certa é a ${letra}.`,
	(letra: string) => `Não foi dessa vez. A certa é a ${letra}.`,
	(letra: string) => `Essa engana, né? A certa é a ${letra}.`,
];

export const LETRAS = ['A', 'B', 'C', 'D'];

// Escolha estável por pergunta, para o texto não trocar a cada renderização.
function indiceEstavel(id: string, total: number) {
	let h = 0;
	for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
	return Math.abs(h) % total;
}

// ---------- Celebrações ----------

export type Celebracao = { tipo: 'seguidas'; n: number } | { tipo: 'dias'; n: number };

/** Acertos seguidos que merecem festa: 3, 5, 10 e depois a cada 10. */
export const ehMarcoDeSeguidas = (n: number) => n === 3 || n === 5 || (n >= 10 && n % 10 === 0);

export const MARCOS_DE_DIAS = [3, 7, 14, 30, 50, 100];

const SEGUIDAS: Record<number, string> = {
	3: 'Três seguidas!',
	5: 'Cinco seguidas! Que fase!',
	10: 'Dez seguidas! Você está voando.',
};

const DIAS: Record<number, string> = {
	3: '3 dias seguidos! Que bom te ver de novo.',
	7: '7 dias seguidos! Uma semana inteira de curiosidade.',
	14: 'Duas semanas seguidas! O Curió está orgulhoso.',
	30: 'Um mês inteiro! Que hábito bonito.',
	50: '50 dias seguidos! Que fôlego.',
	100: '100 dias seguidos! Isso merece um canto bem alto.',
};

export const textoSeguidas = (n: number) => SEGUIDAS[n] ?? `${n} seguidas! Que voo!`;
export const textoDias = (n: number) => DIAS[n];

export const textoAcerto =(id: string) => ACERTOS[indiceEstavel(id, ACERTOS.length)];
export const textoErro = (id: string, correta: number) => ERROS[indiceEstavel(id, ERROS.length)](LETRAS[correta]);
