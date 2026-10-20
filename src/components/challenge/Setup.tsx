import { useEffect, useRef } from 'react';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import { feedRoute } from '../../lib/routes';
import { Curio } from '../feed/Curio';
import { ArrowLeftIcon, CheckIcon, TimerIcon, TopicIcon } from '../feed/Icons';
import { TIME_OPTIONS, poolText, type Seconds } from './copy';

export type Choice = Topic | 'all';

interface Props {
	/** Topics that have questions, with how many */
	topics: { topic: Topic; total: number }[];
	topic: Choice;
	seconds: Seconds;
	onTopic: (topic: Choice) => void;
	onSeconds: (seconds: Seconds) => void;
	onStart: () => void;
	/** Moves the focus to the title (when coming back from a round, not on the first visit) */
	focusTitle: boolean;
}

/** First screen: which topic, how much time per question, and "Começar". */
export function Setup({ topics, topic, seconds, onTopic, onSeconds, onStart, focusTitle }: Props) {
	const titleRef = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		if (focusTitle) titleRef.current?.focus({ preventScroll: true });
	}, [focusTitle]);

	const available = topic === 'all' ? topics.reduce((sum, t) => sum + t.total, 0) : (topics.find((t) => t.topic === topic)?.total ?? 0);

	return (
		<div className="topics-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="challenge">
				<div className="challenge__hero">
					<Curio size={72} />
					<div>
						<h1 className="challenge__title" ref={titleRef} tabIndex={-1}>
							Desafio
						</h1>
						<p className="challenge__intro">Uma rodada de 10 perguntas, no seu ritmo.</p>
					</div>
				</div>
				<p className="challenge__note">O tempo é só um empurrãozinho: dá para pausar ou pedir mais.</p>

				<fieldset className="setup__group">
					<legend className="setup__legend">Tema</legend>
					<div className="setup__options">
						<label className="pick">
							<input type="radio" name="topic" value="all" checked={topic === 'all'} onChange={() => onTopic('all')} />
							<span className="pick__face">
								<span className="pick__check" aria-hidden="true">
									<CheckIcon size={14} />
								</span>
								Tudo
							</span>
						</label>
						{topics.map(({ topic: id }) => (
							<label className="pick" key={id} style={topicStyle(id)}>
								<input type="radio" name="topic" value={id} checked={topic === id} onChange={() => onTopic(id)} />
								<span className="pick__face">
									<span className="pick__check" aria-hidden="true">
										<CheckIcon size={14} />
									</span>
									<span className="pick__dot" aria-hidden="true">
										<TopicIcon topic={id} size={14} />
									</span>
									{TOPICS[id].name}
								</span>
							</label>
						))}
					</div>
					<p className="setup__count" role="status">
						{poolText(available, topic === 'all')}
					</p>
				</fieldset>

				<fieldset className="setup__group">
					<legend className="setup__legend">Tempo por pergunta</legend>
					<div className="setup__options setup__options--time">
						{TIME_OPTIONS.map((option) => (
							<label className="pick pick--time" key={option.seconds}>
								<input
									type="radio"
									name="seconds"
									value={option.seconds}
									checked={seconds === option.seconds}
									onChange={() => onSeconds(option.seconds)}
								/>
								<span className="pick__face">
									<span className="pick__check" aria-hidden="true">
										<CheckIcon size={14} />
									</span>
									<span className="pick__time">{option.seconds} s</span>
									<span className="pick__name">{option.name}</span>
								</span>
							</label>
						))}
					</div>
				</fieldset>

				<div className="challenge__actions">
					<button type="button" className="button" onClick={onStart} disabled={available === 0}>
						<TimerIcon size={22} />
						Começar
					</button>
				</div>
			</main>
		</div>
	);
}
