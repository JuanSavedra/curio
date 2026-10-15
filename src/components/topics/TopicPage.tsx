import { useEffect, useMemo, useState } from 'react';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import type { DeckSummary } from '../../lib/types';
import { feedRoute, topicsRoute } from '../../lib/routes';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RestartIcon } from '../feed/Icons';
import { decksProgress, discoveredInDeck, readSeen } from '../feed/progress';
import { discoveredCount, questionCount } from './copy';
import { ProgressBar, TopicBadge } from './parts';
import './topics.css';

type Status = 'new' | 'in-progress' | 'done';

const statusOf = (discovered: number, total: number): Status =>
	discovered >= total ? 'done' : discovered > 0 ? 'in-progress' : 'new';

const ACTION_LABEL: Record<Status, string> = { new: 'Começar', 'in-progress': 'Continuar', done: 'Rever' };

export default function TopicPage({ topic, decks }: { topic: Topic; decks: DeckSummary[] }) {
	// Progress lives on the device. Until it is read, the count and actions stay reserved (no flash of the wrong text).
	const [seen, setSeen] = useState<Set<string> | null>(null);
	useEffect(() => setSeen(readSeen()), []);

	const overall = useMemo(() => decksProgress(seen ?? new Set(), decks), [seen, decks]);
	const status = statusOf(overall.discovered, overall.total);

	// Groups by subtopic, keeping the order in which they appear.
	const groups = useMemo(() => {
		const map = new Map<string, DeckSummary[]>();
		for (const deck of decks) map.set(deck.subtopic, [...(map.get(deck.subtopic) ?? []), deck]);
		return [...map];
	}, [decks]);

	return (
		<div className="topics-page topics-page--topic" style={topicStyle(topic)}>
			<header className="topics-page__header">
				<a className="back-link" href={topicsRoute()}>
					<ArrowLeftIcon size={18} />
					Todos os temas
				</a>
			</header>

			<main id="content" className="topic-detail">
				<section className="topic-hero" aria-labelledby="topic-title">
					<TopicBadge topic={topic} size={5} light />
					<h1 id="topic-title" className="topic-hero__title">
						{TOPICS[topic].name}
					</h1>
					<div className="topic-hero__info" data-ready={seen !== null}>
						{status === 'done' ? (
							<p className="done-badge">
								<CheckIcon size={14} />
								Concluído
							</p>
						) : null}
						<ProgressBar value={overall.total ? overall.discovered / overall.total : 0} />
						<p className="featured__count">
							{overall.discovered > 0 ? discoveredCount(overall.discovered, overall.total) : questionCount(overall.total)}
						</p>
					</div>
					<div className="topic-hero__action" data-ready={seen !== null}>
						<a
							className="button"
							href={feedRoute(status === 'done' ? { topic, review: true } : { topic })}
							aria-label={`${status === 'done' ? 'Rever tudo de' : ACTION_LABEL[status]} ${TOPICS[topic].name}`}
						>
							{status === 'done' ? <RestartIcon /> : null}
							{status === 'done' ? 'Rever tudo' : ACTION_LABEL[status]}
							{status !== 'done' && <ArrowRightIcon />}
						</a>
					</div>
				</section>

				<div className="groups">
					{groups.map(([subtopic, list], i) => (
						<section key={subtopic} className="group" aria-labelledby={`subtopic-${i}`}>
							<h2 id={`subtopic-${i}`} className="section-title">
								{subtopic}
							</h2>
							<ul className="decks">
								{list.map((deck) => {
									const discovered = seen ? discoveredInDeck(seen, deck.id, deck.total) : 0;
									const deckStatus = statusOf(discovered, deck.total);
									return (
										<li key={deck.id} className="deck" data-state={deckStatus}>
											<div className="deck__text">
												<h3 className="deck__title">{deck.title}</h3>
												<div data-ready={seen !== null} className="deck__state">
													<ProgressBar value={discovered / deck.total} />
													<p className="deck__meta">
														{deckStatus === 'done' && (
															<span className="done-badge">
																<CheckIcon size={14} />
																Concluído
															</span>
														)}
														<span>{discovered > 0 ? discoveredCount(discovered, deck.total) : questionCount(deck.total)}</span>
													</p>
												</div>
											</div>
											<div className="deck__action" data-ready={seen !== null}>
												<a
													className={`button${deckStatus === 'done' ? ' button--outline' : ''}`}
													href={feedRoute(deckStatus === 'done' ? { deck: deck.id, review: true } : { deck: deck.id })}
													aria-label={`${ACTION_LABEL[deckStatus]} ${deck.title}`}
												>
													{ACTION_LABEL[deckStatus]}
													{deckStatus === 'done' ? <RestartIcon /> : <ArrowRightIcon />}
												</a>
											</div>
										</li>
									);
								})}
							</ul>
						</section>
					))}
				</div>
			</main>
		</div>
	);
}
