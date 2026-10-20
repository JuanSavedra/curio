import { useCallback, useEffect, useRef, useState } from 'react';

// How long a notice stays on screen (the fade in feed.css lasts the same)
const NOTICE_MS = 2500;

/** A short message at the foot of the screen, e.g. "Copiado!". It never asks for anything and goes away on its own. */
export function useNotice() {
	const [text, setText] = useState('');
	const timer = useRef<number>(undefined);

	const say = useCallback((message: string) => {
		window.clearTimeout(timer.current);
		setText(message);
		timer.current = window.setTimeout(() => setText(''), NOTICE_MS);
	}, []);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	return { text, say };
}

/** The region is always mounted so screen readers announce the message when it appears. */
export function Notice({ text }: { text: string }) {
	return (
		<div className="toast-region" role="status">
			{text && (
				<p className="toast" key={text}>
					{text}
				</p>
			)}
		</div>
	);
}
