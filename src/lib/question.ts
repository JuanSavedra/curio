// Helpers shared by the build (decks.ts) and the screens that show a question.

/** What the published prompt of a fill-in-the-blank question holds where the gap goes. */
export const BLANK_MARK = '<span class="blank" data-blank></span>';

/**
 * The prompt with its gap filled with `wordHtml`, or an empty slot when there is none.
 * Prompts of the other types have no gap and come back as they are.
 */
export function fillBlank(prompt: string, wordHtml?: string): string {
	const slot =
		wordHtml === undefined
			? '<span class="blank"><span class="sr-only">lacuna</span></span>'
			: `<span class="blank blank--filled">${wordHtml}</span>`;
	// A function, so a "$" in the word is never read as a replacement pattern
	return prompt.replace(BLANK_MARK, () => slot);
}
