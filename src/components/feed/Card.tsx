import { useEffect, useRef } from 'react';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import type { PublishedQuestion } from '../../lib/types';
import { LETTERS, correctText, daysText, runText, wrongText, type Celebration } from './copy';
import { Curio } from './Curio';
import { ArrowDownIcon, CheckIcon, CrossIcon, NoteIcon } from './Icons';
import { Feathers } from './Feathers';

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
	last: boolean;
	onAnswer: (index: number, choice: number) => void;
	onAdvance: (index: number) => void;
}

export function Card({ question, index, choice, celebration, greet, last, onAnswer, onAdvance }: Props) {
	const answered = choice !== undefined;
	const gotItRight = choice === question.correct;
	const nextRef = useRef<HTMLButtonElement>(null);
	const resultRef = useRef<HTMLDivElement>(null);
	const promptId = `prompt-${index}`;

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
					</p>
					<h2
						id={promptId}
						className="card__prompt"
						tabIndex={-1}
						dangerouslySetInnerHTML={{ __html: question.prompt }}
					/>
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
										aria-disabled={answered || undefined}
										onClick={() => !answered && onAnswer(index, i)}
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
							<div className="result" data-correct={gotItRight} ref={resultRef}>
								{celebration && <Feathers />}
								<div className="result__row">
									<Curio mood={celebration ? 'celebrating' : gotItRight ? 'happy' : 'comforting'} size={60} />
									<p className="result__title">
										{gotItRight ? <CheckIcon /> : <CrossIcon size={18} />}
										<span>
											{celebration?.kind === 'run'
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
							</div>
						) : (
							<div className="waiting">
								<Curio size={greet ? 52 : 44} />
								{greet && (
									<p className="speech">Oi! Eu sou o Curió. Responda o que souber. O que não souber, a gente descobre junto.</p>
								)}
							</div>
						)}
					</div>
				</div>

				<footer className="card__foot">
					{answered ? (
						<button type="button" className="next" ref={nextRef} onClick={() => onAdvance(index)}>
							{last ? 'Continuar' : 'Próxima'}
							<ArrowDownIcon />
						</button>
					) : (
						<button type="button" className="skip" onClick={() => onAdvance(index)}>
							Pular esta
						</button>
					)}
				</footer>
			</article>
		</section>
	);
}
