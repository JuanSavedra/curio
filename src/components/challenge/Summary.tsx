import { useEffect, useRef } from 'react';
import { TOPICS, topicStyle } from '../../data/topics';
import { feedRoute } from '../../lib/routes';
import { Curio } from '../feed/Curio';
import { Feathers } from '../feed/Feathers';
import { ArrowLeftIcon, CheckIcon, CrossIcon, RestartIcon, TimerIcon } from '../feed/Icons';
import type { QueuedQuestion } from '../feed/Card';
import { STATUS_TEXT, scoreText, scoreTitle, timedOutNote, type Status } from './copy';

export interface Outcome {
	/** Index of the chosen alternative (none when the time ran out) */
	choice?: number;
	timedOut?: boolean;
}

export interface RoundResult {
	question: QueuedQuestion;
	outcome: Outcome;
}

export const statusOf = ({ question, outcome }: RoundResult): Status =>
	outcome.timedOut ? 'timeout' : outcome.choice === question.correct ? 'correct' : 'wrong';

interface Props {
	results: RoundResult[];
	onAgain: () => void;
	onChange: () => void;
}

/** End of a round: how it went, and every question again with its explanation. */
export function Summary({ results, onAgain, onChange }: Props) {
	const titleRef = useRef<HTMLHeadingElement>(null);
	useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);

	const total = results.length;
	const correct = results.filter((r) => statusOf(r) === 'correct').length;
	const timedOut = results.filter((r) => statusOf(r) === 'timeout').length;
	const party = correct > 0 && correct / total >= 0.7;

	return (
		<div className="topics-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="challenge">
				<section className="summary__hero" aria-labelledby="summary-title">
					{party && (
						<div className="summary__feathers">
							<Feathers />
						</div>
					)}
					<Curio mood={party ? 'celebrating' : 'happy'} size={96} />
					<h1 id="summary-title" className="summary__title" ref={titleRef} tabIndex={-1}>
						{scoreTitle(correct, total)}
					</h1>
					<p className="summary__text">{scoreText(correct, total)}</p>
					{timedOut > 0 && <p className="summary__note">{timedOutNote(timedOut)}</p>}
				</section>

				<div className="challenge__actions">
					<button type="button" className="button" onClick={onAgain}>
						<RestartIcon size={22} />
						Outra rodada
					</button>
					<button type="button" className="button button--quiet" onClick={onChange}>
						Mudar tema ou tempo
					</button>
				</div>

				<section aria-labelledby="review-title">
					<h2 id="review-title" className="review__heading">
						As perguntas da rodada
					</h2>
					<ol className="review">
						{results.map((result) => {
							const { question, outcome } = result;
							const status = statusOf(result);
							return (
								<li key={question.id} className="review__item" style={topicStyle(question.topic)}>
									<details>
										<summary className="review__summary">
											<span className="review__mark" data-status={status} aria-hidden="true">
												{status === 'correct' ? <CheckIcon size={16} /> : status === 'wrong' ? <CrossIcon size={14} /> : <TimerIcon size={16} />}
											</span>
											<span className="review__main">
												<span className="review__topic">
													<span className="sr-only">{STATUS_TEXT[status]}. </span>
													{TOPICS[question.topic].name}
												</span>
												<span className="review__prompt" dangerouslySetInnerHTML={{ __html: question.prompt }} />
											</span>
										</summary>
										<div className="review__body">
											{status === 'wrong' && outcome.choice !== undefined && (
												<p>
													<strong>Você respondeu:</strong> <span dangerouslySetInnerHTML={{ __html: question.choices[outcome.choice] }} />
												</p>
											)}
											<p>
												<strong>Resposta certa:</strong> <span dangerouslySetInnerHTML={{ __html: question.choices[question.correct] }} />
											</p>
											<p className="review__explanation" dangerouslySetInnerHTML={{ __html: question.explanation }} />
										</div>
									</details>
								</li>
							);
						})}
					</ol>
				</section>
			</main>
		</div>
	);
}
