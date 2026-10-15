import { useEffect, useMemo, useState } from 'react';
import { TOPICS, TOPIC_IDS, topicStyle, type Topic } from '../../data/topics';
import type { DeckSummary } from '../../lib/types';
import { feedRoute, topicRoute } from '../../lib/routes';
import { Curio } from '../feed/Curio';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../feed/Icons';
import { decksProgress, readLastTopic, readSeen } from '../feed/progress';
import { collectionCount, discoveredCount, questionCount } from './copy';
import { ProgressBar, TopicBadge } from './parts';
import './topics.css';

interface TopicInfo {
	topic: Topic;
	decks: DeckSummary[];
	total: number;
	discovered: number;
	complete: boolean;
}

/** The featured topic: the last one being answered, else the furthest along, else the fullest. */
function pickFeatured(topics: TopicInfo[], last: string | null): TopicInfo | undefined {
	const open = topics.filter((t) => t.total > 0 && !t.complete);
	const resumable = open.find((t) => t.topic === last && t.discovered > 0);
	if (resumable) return resumable;
	const furthest = [...open].sort((a, b) => b.discovered - a.discovered)[0];
	if (furthest?.discovered) return furthest;
	return [...open].sort((a, b) => b.total - a.total)[0];
}

export default function Topics({ decks }: { decks: DeckSummary[] }) {
	// Until local progress is read, the screen shows a skeleton (avoids swapping the featured topic in front of the person).
	const [seen, setSeen] = useState<Set<string> | null>(null);
	const [last, setLast] = useState<string | null>(null);

	useEffect(() => {
		setSeen(readSeen());
		setLast(readLastTopic());
	}, []);

	const topics = useMemo<TopicInfo[]>(
		() =>
			TOPIC_IDS.map((topic) => {
				const ofTopic = decks.filter((d) => d.topic === topic);
				const { total, discovered, complete } = decksProgress(seen ?? new Set(), ofTopic);
				return { topic, decks: ofTopic, total, discovered, complete };
			}),
		[decks, seen],
	);

	const withContent = topics.filter((t) => t.total > 0);
	const comingSoon = topics.filter((t) => t.total === 0);
	const featured = seen ? pickFeatured(topics, last) : undefined;
	const others = withContent.filter((t) => t !== featured);

	return (
		<div className="topics-page">
			<header className="topics-page__header">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Voltar às perguntas
				</a>
			</header>

			<main id="content" className="topics">
				<div className="topics__featured">
					<h1 className="topics__title">Por onde você quer descobrir hoje?</h1>
					{!seen && <Skeleton />}
					{seen && featured && <Featured info={featured} starting={featured.discovered === 0} />}
					{seen && !featured && withContent.length > 0 && (
						<section className="all-done" aria-labelledby="all-done-title">
							<Curio mood="celebrating" size={96} />
							<h2 id="all-done-title" className="all-done__title">
								Você descobriu tudo o que temos por agora!
							</h2>
							<p>O Curió está juntando mais curiosidades. Enquanto isso, dá para rever qualquer tema.</p>
						</section>
					)}
				</div>

				<div className="topics__list">
					{!seen && <Skeleton rows />}
					{seen && others.length > 0 && (
						<section aria-labelledby="others-title">
							<h2 id="others-title" className="section-title">
								{featured ? 'Outros temas' : 'Seus temas'}
							</h2>
							<ul className="topic-list">
								{others.map((info) => (
									<TopicRow key={info.topic} info={info} />
								))}
							</ul>
						</section>
					)}

					{comingSoon.length > 0 && (
						<section aria-labelledby="coming-soon-title">
							<h2 id="coming-soon-title" className="section-title">
								Em breve, o ninho vai crescer
							</h2>
							<ul className="coming-soon">
								{comingSoon.map(({ topic }) => (
									<li key={topic} style={topicStyle(topic)}>
										<TopicBadge topic={topic} size={2.25} />
										<span>{TOPICS[topic].name}</span>
									</li>
								))}
							</ul>
						</section>
					)}
				</div>
			</main>
		</div>
	);
}

function Featured({ info, starting }: { info: TopicInfo; starting: boolean }) {
	const { topic, total, discovered, decks } = info;
	return (
		<section className="featured" style={topicStyle(topic)} aria-labelledby="featured-title">
			<p className="featured__label">{starting ? 'Que tal começar por aqui?' : 'Continue de onde parou'}</p>
			<div className="featured__head">
				<TopicBadge topic={topic} size={4.5} light />
				<h2 id="featured-title" className="featured__title">
					{TOPICS[topic].name}
				</h2>
			</div>
			{discovered > 0 ? (
				<div className="featured__progress">
					<ProgressBar value={discovered / total} />
					<p className="featured__count">{discoveredCount(discovered, total)}</p>
				</div>
			) : (
				<p className="featured__count">
					{questionCount(total)} em {collectionCount(decks.length)}
				</p>
			)}
			<div className="featured__actions">
				<a className="button" href={feedRoute({ topic })}>
					{starting ? 'Começar' : 'Continuar'}
					<ArrowRightIcon />
				</a>
				<a className="button button--quiet" href={topicRoute(topic)}>
					Ver as coleções
				</a>
			</div>
		</section>
	);
}

function TopicRow({ info }: { info: TopicInfo }) {
	const { topic, total, discovered, complete, decks } = info;
	const state = complete ? 'done' : discovered > 0 ? 'in-progress' : 'new';
	return (
		<li>
			<a className="row" data-state={state} href={topicRoute(topic)} style={topicStyle(topic)}>
				<TopicBadge topic={topic} light={state === 'done'} />
				<span className="row__text">
					<span className="row__name">{TOPICS[topic].name}</span>
					<span className="row__meta">
						{state === 'new' && `${questionCount(total)} em ${collectionCount(decks.length)}`}
						{state === 'in-progress' && discoveredCount(discovered, total)}
						{state === 'done' && questionCount(total)}
					</span>
				</span>
				{state === 'done' ? (
					<span className="done-badge">
						<CheckIcon size={14} />
						Concluído
					</span>
				) : (
					<span className="row__arrow" aria-hidden="true">
						<ArrowRightIcon size={18} />
					</span>
				)}
				{state === 'in-progress' && (
					<span className="row__bar">
						<ProgressBar value={discovered / total} />
					</span>
				)}
			</a>
		</li>
	);
}

function Skeleton({ rows = false }: { rows?: boolean }) {
	return (
		<div className="topics-skeleton" aria-hidden="true">
			{rows ? (
				<>
					<span className="topics-skeleton__bar topics-skeleton__bar--row" />
					<span className="topics-skeleton__bar topics-skeleton__bar--row" />
				</>
			) : (
				<span className="topics-skeleton__bar topics-skeleton__bar--featured" />
			)}
		</div>
	);
}
