import { useEffect, useMemo, useState } from 'react';
import { TOPICS, TOPIC_IDS, topicStyle } from '../../data/topics';
import { feedRoute } from '../../lib/routes';
import type { DeckSummary } from '../../lib/types';
import { ArrowLeftIcon, CheckIcon, TopicIcon } from '../feed/Icons';
import { decksProgress, readSeen } from '../feed/progress';
import '../topics/topics.css';
import './seals.css';

/** One seal per topic with questions, earned by discovering every question of the topic. */
export default function Seals({ decks }: { decks: DeckSummary[] }) {
	// Progress lives on the device: until it is read, nothing is claimed
	const [seen, setSeen] = useState<Set<string> | null>(null);
	useEffect(() => setSeen(readSeen()), []);

	const seals = useMemo(
		() =>
			TOPIC_IDS.flatMap((topic) => {
				const ofTopic = decks.filter((d) => d.topic === topic);
				if (!ofTopic.length) return [];
				return [{ topic, ...decksProgress(seen ?? new Set(), ofTopic) }];
			}),
		[decks, seen],
	);
	const earned = seals.filter((seal) => seal.complete).length;

	return (
		<div className="topics-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="seals" aria-busy={seen === null}>
				<div>
					<h1 className="seals__heading">Meus selos</h1>
					{seen && (
						<p className="seals__intro">
							{earned === 0
								? 'Descubra todas as perguntas de um tema para ganhar o selo dele.'
								: `${earned} de ${seals.length} ${seals.length === 1 ? 'selo conquistado' : 'selos conquistados'}.`}
						</p>
					)}
				</div>

				{seen && (
					<ul className="seals__list">
						{seals.map(({ topic, discovered, total, complete }) => (
							<li key={topic} className="seal" data-earned={complete} style={topicStyle(topic)}>
								<span className="seal__medal" aria-hidden="true">
									<TopicIcon topic={topic} size={28} />
									{complete && (
										<span className="seal__check">
											<CheckIcon size={12} />
										</span>
									)}
								</span>
								<span className="seal__name">{TOPICS[topic].name}</span>
								<span className="seal__state">{complete ? 'Conquistado' : `${discovered} de ${total}`}</span>
							</li>
						))}
					</ul>
				)}
			</main>
		</div>
	);
}
