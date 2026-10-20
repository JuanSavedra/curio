import { useEffect, useRef, useState } from 'react';
import type { QueuedQuestion } from './Card';
import { CheckIcon, ShareIcon } from './Icons';
import { shareQuestion } from './share';

interface Props {
	question: QueuedQuestion;
	/** Says something at the foot of the screen (see Notice) */
	onNotice: (text: string) => void;
}

/** Round button on the card's head. Before or after answering it sends the same thing: the question and a link. */
export function ShareButton({ question, onNotice }: Props) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<number>(undefined);
	useEffect(() => () => window.clearTimeout(timer.current), []);

	async function share() {
		const result = await shareQuestion(question);
		if (result === 'copied') {
			onNotice('Copiado! É só colar na conversa.');
			setCopied(true);
			window.clearTimeout(timer.current);
			timer.current = window.setTimeout(() => setCopied(false), 2500);
		} else if (result === 'failed') {
			onNotice('Não consegui copiar. Tente de novo.');
		}
	}

	return (
		<button type="button" className="card__share" aria-label="Compartilhar esta pergunta" title="Compartilhar esta pergunta" onClick={() => void share()}>
			{copied ? <CheckIcon size={20} /> : <ShareIcon size={20} />}
		</button>
	);
}
