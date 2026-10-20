import { useEffect, useRef } from 'react';
import { LEVELS } from '../../data/levels';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import type { PublishedQuestion } from '../../lib/types';
import { LETTERS, correctText, daysText, runText, timeUpText, wrongText, type Celebration } from './copy';
import { Curio } from './Curio';
import { ArrowDownIcon, CheckIcon, CrossIcon, ExternalIcon, NoteIcon, TimerIcon } from './Icons';
import { Feathers } from './Feathers';
import { ShareButton } from './ShareButton';

export interface QueuedQuestion extends PublishedQuestion {
	topic: Topic;
	deckTitle: string;
}

interface Props {
	question: QueuedQuestion;
	index: number;
	choice: number | undefined;
	celebration: Celebration | undefined;
	greet: boolean;
	/** Someone sent this question through a link: the Curió says so while it waits */
	invited?: boolean;
	last: boolean;
	onAnswer: (index: number, choice: number) => void;
	onAdvance: (index: number) => void;
	/** Says something at the foot of the screen (the share button uses it) */
	onNotice: (text: string) => void;
	/** Challenge only: the time ran out, so the answer and the explanation show without counting as a mistake */
	timedOut?: boolean;
	/** Challenge only: the choices can't be picked right now (paused) */
	locked?: boolean;
	/** The feed lets you skip a question; a challenge round doesn't */
	canSkip?: boolean;
	/** Label of the main button on the last card */
	lastLabel?: string;
}

export function Card({
	question,
	index,
	choice,
	celebration,
	greet,
	invited = false,
	last,
	onAnswer,
	onAdvance,
	onNotice,
	timedOut = false,
	locked = false,
	canSkip = true,
	lastLabel = 'Continuar',
}: Props) {
	const answered = choice !== undefined || timedOut;
	const gotItRight = choice === question.correct;
	const nextRef = useRef<HTMLButtonElement>(null);
	const resultRef = useRef<HTMLDivElement>(null);
	const promptId = `prompt-${index}`;
	// What the Curió says while the card waits for an answer
	const speech = invited
		? `${greet ? 'Oi! Eu sou o Curió. ' : ''}Uma pessoa separou esta pergunta para você. Será que você sabe?`
		: greet
			? 'Oi! Eu sou o Curió. Responda o que souber. O que não souber, a gente descobre junto.'
			: null;

	// After answering: shows the explanation and moves focus to "Próxima".
	useEffect(() => {
		if (!answered) return;
		nextRef.current?.focus({ preventScroll: true });
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		resultRef.current?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
	}, [answered]);

	function stateOf(i: number) {
		if (!answered) return 'open';
		if (i === question.correct) return 'correct';
		if (i === choice) return 'wrong';
		return 'dimmed';
	}

	return (
		<section className="scene" data-index={index} aria-labelledby={promptId} style={topicStyle(question.topic)}>
			<article className="card">
				<header className="card__head">
					<p className="card__topic">
						<span className="card__topic-name">{TOPICS[question.topic].name}</span>
						<span aria-hidden="true"> · </span>
						<span className="card__deck">{question.deckTitle}</span>
						<span aria-hidden="true"> · </span>
						<span className="card__level">
							<span className="card__level-dot" data-level={question.level} aria-hidden="true" />
							<span className="sr-only">Nível </span>
							{LEVELS[question.level].name}
						</span>
					</p>
					<h2
						id={promptId}
						className="card__prompt"
						tabIndex={-1}
						dangerouslySetInnerHTML={{ __html: question.prompt }}
					/>
					<ShareButton question={question} onNotice={onNotice} />
				</header>

				<div className="card__body">
					<ol className="choices" aria-label="Alternativas">
						{question.choices.map((text, i) => {
							const state = stateOf(i);
							return (
								<li key={i}>
									<button
										type="button"
										className="choice"
										data-state={state}
										aria-disabled={answered || locked || undefined}
										onClick={() => !answered && !locked && onAnswer(index, i)}
									>
										<span className="choice__mark" aria-hidden="true">
											{state === 'correct' ? <CheckIcon size={18} /> : state === 'wrong' ? <CrossIcon size={16} /> : LETTERS[i]}
										</span>
										<span className="sr-only">{LETTERS[i]}: </span>
										<span className="choice__text" dangerouslySetInnerHTML={{ __html: text }} />
										{state === 'correct' && <span className="choice__label">Certa</span>}
										{state === 'wrong' && <span className="choice__label">Sua resposta</span>}
									</button>
								</li>
							);
						})}
					</ol>

					{/* The Curió's stage, always right below the choices: he waits here and then reacts with the explanation */}
					<div role="status" aria-live="polite" className="stage">
						{answered ? (
							<div className="result" data-correct={timedOut ? 'none' : gotItRight} ref={resultRef}>
								{celebration && <Feathers />}
								<div className="result__row">
									<Curio mood={timedOut ? 'waiting' : celebration ? 'celebrating' : gotItRight ? 'happy' : 'comforting'} size={60} />
									<p className="result__title">
										{timedOut ? <TimerIcon size={20} /> : gotItRight ? <CheckIcon /> : <CrossIcon size={18} />}
										<span>
											{timedOut
												? timeUpText(question.correct)
												: celebration?.kind === 'run'
													? runText(celebration.n)
													: gotItRight
														? correctText(question.id)
														: wrongText(question.id, question.correct)}
										</span>
									</p>
								</div>
								{celebration?.kind === 'days' && (
									<p className="result__milestone">
										<NoteIcon size={18} />
										<span>{daysText(celebration.n)}</span>
									</p>
								)}
								<p className="result__explanation" dangerouslySetInnerHTML={{ __html: question.explanation }} />
								{question.learnMore && (
									<div className="result__more">
										<p className="result__more-title">Quer saber mais?</p>
										<ul>
											{question.learnMore.map(({ title, url }) => (
												<li key={url}>
													<a href={url} target="_blank" rel="noopener noreferrer">
														{title}
														<ExternalIcon size={14} />
														<span className="sr-only"> (abre em outra aba)</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						) : (
							<div className="waiting">
								<Curio size={speech ? 52 : 44} />
								{speech && <p className="speech">{speech}</p>}
							</div>
						)}
					</div>
				</div>

				<footer className="card__foot">
					{answered ? (
						<button type="button" className="button" ref={nextRef} onClick={() => onAdvance(index)}>
							{last ? lastLabel : 'Próxima'}
							<ArrowDownIcon />
						</button>
					) : canSkip ? (
						<button type="button" className="button button--quiet" onClick={() => onAdvance(index)}>
							Pular esta
						</button>
					) : (
						// Keeps the footer's height, so the card doesn't jump when "Próxima" shows up
						<span className="card__foot-space" aria-hidden="true" />
					)}
				</footer>
			</article>
		</section>
	);
}
