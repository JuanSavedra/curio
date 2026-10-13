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

export const textoAcerto = (id: string) => ACERTOS[indiceEstavel(id, ACERTOS.length)];
export const textoErro = (id: string, correta: number) => ERROS[indiceEstavel(id, ERROS.length)](LETRAS[correta]);
