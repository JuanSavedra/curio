import katex from 'katex';

const escapeHtml = (text: string) =>
	text
		.replace(/\\\$/g, '$')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

// Formula between $...$, plus the punctuation stuck to it (so a comma never lands alone on the next line)
const FORMULA = /(?<!\\)\$(.+?)(?<!\\)\$([,.;:!?)]*)/gs;

/**
 * Turns question text into safe HTML, at build time.
 * Use $...$ only for real formulas (fractions, roots, powers, π); plain numbers go as text.
 * \$ writes a literal dollar sign.
 */
export function richText(text: string): string {
	let html = '';
	let last = 0;
	for (const m of text.matchAll(FORMULA)) {
		const formula = katex.renderToString(m[1], { throwOnError: true, output: 'htmlAndMathml', strict: 'error' });
		html += escapeHtml(text.slice(last, m.index)) + `<span class="formula">${formula}${escapeHtml(m[2])}</span>`;
		last = m.index + m[0].length;
	}
	return html + escapeHtml(text.slice(last));
}
