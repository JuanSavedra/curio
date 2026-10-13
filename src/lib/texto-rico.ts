import katex from 'katex';

const escapar = (texto: string) =>
	texto
		.replace(/\\\$/g, '$')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

// Fórmula entre $...$, junto com a pontuação colada nela (para a vírgula não cair sozinha na linha de baixo)
const FORMULA = /(?<!\\)\$(.+?)(?<!\\)\$([,.;:!?)]*)/gs;

/**
 * Converte o texto de uma pergunta em HTML seguro, no build.
 * Use $...$ só para fórmulas de verdade (frações, raízes, potências, π); números comuns vão como texto.
 * \$ escreve um cifrão literal.
 */
export function textoRico(texto: string): string {
	let html = '';
	let ultimo = 0;
	for (const m of texto.matchAll(FORMULA)) {
		const formula = katex.renderToString(m[1], { throwOnError: true, output: 'htmlAndMathml', strict: 'error' });
		html += escapar(texto.slice(ultimo, m.index)) + `<span class="formula">${formula}${escapar(m[2])}</span>`;
		ultimo = m.index + m[0].length;
	}
	return html + escapar(texto.slice(ultimo));
}
