import { TOPICS } from '../../data/topics';
import { sharedQuestionRoute } from '../../lib/routes';
import type { QueuedQuestion } from './Card';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * The message that goes with the link: the question, never the choices or the answer.
 * A question with a formula can't be turned into readable text, so it gets a generic invitation.
 */
export function shareMessage(question: QueuedQuestion): string {
	const box = document.createElement('div');
	box.innerHTML = question.prompt;
	const plain = box.querySelector('.katex') ? '' : (box.textContent ?? '').replace(/\s+/g, ' ').trim();
	return plain
		? `Será que você sabe? ${plain} Descubra no Curiô:`
		: `Será que você sabe? Tem uma pergunta de ${TOPICS[question.topic].name} esperando por você no Curiô:`;
}

/**
 * Shares a question with the device's own share sheet; where there isn't one, copies the message with the link.
 * The link only opens the question: it carries no answer.
 */
export async function shareQuestion(question: QueuedQuestion): Promise<ShareResult> {
	const text = shareMessage(question);
	const url = new URL(sharedQuestionRoute(question.id), location.origin).href;

	if (typeof navigator.share === 'function') {
		try {
			await navigator.share({ title: 'Curiô', text, url });
			return 'shared';
		} catch (error) {
			// Closing the share sheet is not a failure
			if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
			// Anything else: fall through to copying
		}
	}

	try {
		await navigator.clipboard.writeText(`${text} ${url}`);
		return 'copied';
	} catch {
		return 'failed';
	}
}
