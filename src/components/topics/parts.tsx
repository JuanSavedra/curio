import { useEffect, useState, type CSSProperties } from 'react';
import type { Topic } from '../../data/topics';
import { TopicIcon } from '../feed/Icons';

/** Circle in the topic's color with its icon inside. Decorative: the topic name always sits next to it. */
export function TopicBadge({ topic, size = 3, light = false }: { topic: Topic; size?: number; light?: boolean }) {
	return (
		<span
			className={`topic-badge${light ? ' topic-badge--light' : ''}`}
			style={{ '--badge-size': `${size}rem` } as CSSProperties}
			aria-hidden="true"
		>
			<TopicIcon topic={topic} size={Math.round(size * 9)} />
		</span>
	);
}

/**
 * Progress bar. Decorative: the count in text next to it says the same.
 * Fills once when it appears, with transform only.
 */
export function ProgressBar({ value }: { value: number }) {
	const [on, setOn] = useState(false);
	useEffect(() => {
		const frame = requestAnimationFrame(() => setOn(true));
		return () => cancelAnimationFrame(frame);
	}, []);
	return (
		<div className="bar" aria-hidden="true">
			<div className="bar__fill" style={{ '--progress': on ? value : 0 } as CSSProperties} />
		</div>
	);
}
