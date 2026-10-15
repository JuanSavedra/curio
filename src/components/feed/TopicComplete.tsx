import { useEffect, useRef, useState } from 'react';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import { topicsRoute } from '../../lib/routes';
import { Curio } from './Curio';
import { Feathers } from './Feathers';
import { ArrowRightIcon, CheckIcon, RestartIcon } from './Icons';

interface Props {
	topic: Topic;
	total: number;
	onReview: () => void;
}

/**
 * The end of a topic: its color spreads out from the Curió until the whole screen is the topic's color.
 * The party starts when the scene shows up on screen, not when it is mounted.
 */
export function TopicComplete({ topic, total, onReview }: Props) {
	const sceneRef = useRef<HTMLElement>(null);
	const [active, setActive] = useState(false);

	useEffect(() => {
		const scene = sceneRef.current;
		if (!scene || typeof IntersectionObserver === 'undefined') {
			setActive(true);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setActive(true);
				observer.disconnect();
			},
			{ threshold: 0.6 },
		);
		observer.observe(scene);
		return () => observer.disconnect();
	}, []);

	return (
		<section
			ref={sceneRef}
			className={`scene scene--end scene--complete${active ? ' scene--active' : ''}`}
			style={topicStyle(topic)}
			aria-labelledby="end-title"
		>
			<div className="complete__color" aria-hidden="true" />
			{active && (
				<div className="complete__feathers">
					<Feathers />
				</div>
			)}
			<div className="notice complete__content">
				<Curio mood="celebrating" size={112} />
				<p className="complete__badge">
					<CheckIcon size={16} />
					{TOPICS[topic].name} concluído
				</p>
				<h2 id="end-title" className="end__title complete__title" tabIndex={-1}>
					Você descobriu tudo de {TOPICS[topic].name}!
				</h2>
				<p className="complete__text">
					Foram {total} {total === 1 ? 'pergunta' : 'perguntas'}. O Curió cantou de orgulho.
				</p>
				<div className="complete__actions">
					<a className="button" href={topicsRoute()}>
						Escolher outro tema
						<ArrowRightIcon />
					</a>
					<button type="button" className="button button--quiet" onClick={onReview}>
						<RestartIcon size={18} />
						Rever as perguntas
					</button>
				</div>
			</div>
		</section>
	);
}
