import { useCallback, useEffect, useRef, useState } from 'react';
import { TOPICS, TOPIC_IDS, topicFromSlug, topicStyle, type Topic } from '../../data/topics';
import { FEED_QUERY, deckJsonRoute, topicsRoute } from '../../lib/routes';
import type { DeckSummary, PublishedDeck } from '../../lib/types';
import { Card, type QueuedQuestion } from './Card';
import { DAY_MILESTONES, isRunMilestone, type Celebration } from './copy';
import { Curio } from './Curio';
import { CheckIcon, NoteIcon, RestartIcon, TopicsIcon } from './Icons';
import {
	decksProgress,
	forgetSeen,
	hasVisited,
	markSeen,
	markVisited,
	readSeen,
	readStreak,
	recordDay,
	writeLastTopic,
} from './progress';
import { TopicComplete } from './TopicComplete';
import './feed.css';

type Filter = Topic | 'all';
type Status = 'loading' | 'ready' | 'failed';

// How many decks to fetch at once. Keeps the page light even with a lot of content.
const BATCH = 3;

function shuffle<T>(list: T[]): T[] {
	const copy = [...list];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

// Interleaves the decks so the mixed feed doesn't repeat the same topic back to back.
function interleave(decks: PublishedDeck[], seen: Set<string>): QueuedQuestion[] {
	const stacks = decks.map((deck) =>
		shuffle(deck.questions.filter((q) => !seen.has(q.id))).map((q) => ({ ...q, topic: deck.topic, deckTitle: deck.title })),
	);
	const queue: QueuedQuestion[] = [];
	while (stacks.some((stack) => stack.length)) {
		for (const stack of stacks) {
			const next = stack.shift();
			if (next) queue.push(next);
		}
	}
	return queue;
}

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Feed({ decks }: { decks: DeckSummary[] }) {
	const topicsWithContent = TOPIC_IDS.filter((t) => decks.some((d) => d.topic === t));

	const [filter, setFilter] = useState<Filter>('all');
	// When the person arrives through a deck on a topic page, the feed shows only that deck
	const [deckFilter, setDeckFilter] = useState<DeckSummary | null>(null);
	const [status, setStatus] = useState<Status>('loading');
	const [queue, setQueue] = useState<QueuedQuestion[]>([]);
	const [pending, setPending] = useState<DeckSummary[]>([]);
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [current, setCurrent] = useState(0);
	const [streak, setStreak] = useState(0);
	const [greet, setGreet] = useState(false);
	const [celebrations, setCelebrations] = useState<Record<string, Celebration>>({});
	// Changes at every day milestone so the pill glows again
	const [streakGlow, setStreakGlow] = useState(0);
	// Correct answers in a row in this session. A wrong answer restarts silently; skipping doesn't count.
	const run = useRef(0);

	const railRef = useRef<HTMLElement>(null);
	const cache = useRef(new Map<string, PublishedDeck>());
	const loadingMore = useRef(false);

	const fetchDecks = useCallback(async (list: DeckSummary[]) => {
		return Promise.all(
			list.map(async (summary) => {
				const cached = cache.current.get(summary.id);
				if (cached) return cached;
				const response = await fetch(deckJsonRoute(summary.id));
				if (!response.ok) throw new Error(`Failed to fetch ${summary.id}`);
				const deck = (await response.json()) as PublishedDeck;
				cache.current.set(summary.id, deck);
				return deck;
			}),
		);
	}, []);

	// Fetches batches until there are new questions or the decks run out.
	const nextBatch = useCallback(
		async (remaining: DeckSummary[]) => {
			const seen = readSeen();
			let fresh: QueuedQuestion[] = [];
			while (!fresh.length && remaining.length) {
				const batch = remaining.slice(0, BATCH);
				remaining = remaining.slice(BATCH);
				fresh = interleave(await fetchDecks(batch), seen);
			}
			return { fresh, remaining };
		},
		[fetchDecks],
	);

	const buildQueue = useCallback(
		async (newFilter: Filter, deck: DeckSummary | null = null) => {
			setStatus('loading');
			setFilter(newFilter);
			setDeckFilter(deck);
			setCurrent(0);
			try {
				const candidates = shuffle(deck ? [deck] : decks.filter((d) => newFilter === 'all' || d.topic === newFilter));
				const { fresh, remaining } = await nextBatch(candidates);
				setQueue(fresh);
				setPending(remaining);
				setStatus('ready');
				railRef.current?.scrollTo({ top: 0 });
			} catch {
				setStatus('failed');
			}
		},
		[decks, nextBatch],
	);

	// First load: reads local progress and the URL filter (?tema=astronomia, ?deck=<id>, ?rever=1).
	useEffect(() => {
		setStreak(readStreak());
		setGreet(!hasVisited());
		const params = new URLSearchParams(location.search);
		const urlTopic = topicFromSlug(params.get(FEED_QUERY.topic) ?? '');
		const deck = decks.find((d) => d.id === params.get(FEED_QUERY.deck)) ?? null;
		const topic: Filter = deck ? deck.topic : urlTopic && topicsWithContent.includes(urlTopic) ? urlTopic : 'all';

		// "Rever" comes from the topic pages: forgets only what was asked, once, and cleans the address.
		if (params.get(FEED_QUERY.review) === '1' && topic !== 'all') {
			forgetSeen(prefixesOf(topic, deck));
			params.delete(FEED_QUERY.review);
			const query = params.toString();
			history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}`);
		}
		void buildQueue(topic, deck);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Near the end of the queue, quietly fetches the next batch.
	useEffect(() => {
		if (status !== 'ready' || !pending.length || loadingMore.current || current < queue.length - 3) return;
		loadingMore.current = true;
		nextBatch(pending)
			.then(({ fresh, remaining }) => {
				setQueue((q) => [...q, ...fresh]);
				setPending(remaining);
			})
			.catch(() => {
				// No network right now: the end of the queue offers to try again.
			})
			.finally(() => {
				loadingMore.current = false;
			});
	}, [current, queue.length, pending, status, nextBatch]);

	// Which card is in the middle of the rail.
	useEffect(() => {
		const rail = railRef.current;
		if (!rail) return;
		let frame = 0;
		const measure = () => {
			frame = 0;
			const middle = rail.scrollTop + rail.clientHeight / 2;
			const scenes = rail.querySelectorAll<HTMLElement>('.scene[data-index]');
			for (const scene of scenes) {
				if (scene.offsetTop <= middle && scene.offsetTop + scene.offsetHeight > middle) {
					setCurrent(Number(scene.dataset.index));
					return;
				}
			}
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		rail.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			rail.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	}, []);

	const goTo = useCallback((index: number) => {
		const rail = railRef.current;
		const target = rail?.querySelector<HTMLElement>(`.scene[data-index="${index}"]`) ?? rail?.querySelector<HTMLElement>('.scene--end');
		if (!target) return;
		target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
		target.querySelector<HTMLElement>('.card__prompt, .end__title')?.focus({ preventScroll: true });
	}, []);

	const answer = useCallback(
		(index: number, choice: number) => {
			const question = queue[index];
			if (!question || answers[question.id] !== undefined) return;
			setAnswers((a) => ({ ...a, [question.id]: choice }));
			markSeen(question.id);
			writeLastTopic(question.topic);
			markVisited();
			setGreet(false);

			const { days, newDay } = recordDay();
			setStreak(days);
			run.current = choice === question.correct ? run.current + 1 : 0;

			// A day milestone is worth more than a run of correct answers (it's rarer)
			let celebration: Celebration | undefined;
			if (newDay && DAY_MILESTONES.includes(days)) {
				celebration = { kind: 'days', n: days };
				setStreakGlow((g) => g + 1);
			} else if (isRunMilestone(run.current)) {
				celebration = { kind: 'run', n: run.current };
			}
			if (celebration) setCelebrations((c) => ({ ...c, [question.id]: celebration }));
		},
		[queue, answers],
	);

	// Shortcuts: 1 to 4 (or A to D) answer, arrows or J/K switch cards.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey || e.metaKey || status !== 'ready') return;
			if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
			const key = e.key.toLowerCase();
			const choice = '1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key);
			const question = queue[current];
			if (choice >= 0 && question && choice < question.choices.length) {
				e.preventDefault();
				answer(current, choice);
			} else if (key === 'arrowdown' || key === 'j') {
				e.preventDefault();
				goTo(current + 1);
			} else if ((key === 'arrowup' || key === 'k') && current > 0) {
				e.preventDefault();
				goTo(current - 1);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [current, queue, status, answer, goTo]);

	function switchFilter(next: Filter) {
		if (next === filter && !deckFilter && status === 'ready') return;
		const url = new URL(location.href);
		url.searchParams.delete(FEED_QUERY.deck);
		url.searchParams.delete(FEED_QUERY.review);
		if (next === 'all') url.searchParams.delete(FEED_QUERY.topic);
		else url.searchParams.set(FEED_QUERY.topic, TOPICS[next].slug);
		history.replaceState(null, '', url);
		void buildQueue(next);
	}

	function prefixesOf(topic: Filter, deck: DeckSummary | null) {
		return (deck ? [deck] : decks.filter((d) => topic === 'all' || d.topic === topic)).map((d) => `${d.id}/`);
	}

	function reviewAgain() {
		forgetSeen(prefixesOf(filter, deckFilter));
		setAnswers({});
		void buildQueue(filter, deckFilter);
	}

	// A topic is only complete when all of its questions were seen (skipping doesn't count).
	const topicSummary =
		status === 'ready' && !pending.length && !deckFilter && filter !== 'all'
			? decksProgress(
					readSeen(),
					decks.filter((d) => d.topic === filter),
				)
			: null;
	const topicComplete = topicSummary?.complete ?? false;

	const currentTopic = queue[Math.min(current, queue.length - 1)]?.topic;

	return (
		<div className="feed" style={currentTopic ? topicStyle(currentTopic) : undefined} data-has-topic={Boolean(currentTopic)}>
			<header className="topbar">
				<h1 className="brand">
					<Curio size={34} still />
					<span>Curiô</span>
				</h1>

				<nav className="chips" aria-label="Temas">
					<ul>
						<li>
							<button type="button" className="chip chip--all" aria-pressed={filter === 'all'} onClick={() => switchFilter('all')}>
								Tudo
							</button>
						</li>
						{topicsWithContent.map((topic) => (
							<li key={topic}>
								<button
									type="button"
									className="chip"
									style={topicStyle(topic)}
									aria-pressed={filter === topic}
									onClick={() => switchFilter(topic)}
								>
									<span className="chip__dot" aria-hidden="true">
										{filter === topic && <CheckIcon size={12} />}
									</span>
									{TOPICS[topic].name}
								</button>
							</li>
						))}
					</ul>
				</nav>

				<div className="topbar__actions">
					<a className="topics-link" href={topicsRoute()}>
						<TopicsIcon size={18} />
						<span>Temas</span>
					</a>
					{streak > 0 && (
						<p
							key={streakGlow}
							className={`streak${streakGlow ? ' streak--milestone' : ''}`}
							title="Dias seguidos respondendo perguntas"
						>
							<NoteIcon size={18} />
							<span>{streak === 1 ? '1 dia' : `${streak} dias`}</span>
							<span className="sr-only"> seguidos</span>
						</p>
					)}
				</div>
			</header>

			<main id="questions" className="rail" ref={railRef} aria-busy={status === 'loading'}>
				{status === 'loading' && (
					<div className="scene">
						<p className="sr-only">Carregando perguntas…</p>
						<Skeleton />
					</div>
				)}

				{status === 'failed' && (
					<section className="scene scene--notice">
						<div className="notice">
							<Curio mood="comforting" size={72} />
							<h2 className="notice__title">Não consegui carregar as perguntas.</h2>
							<p>Confira sua conexão com a internet e tente de novo.</p>
							<button type="button" className="next" onClick={() => buildQueue(filter)}>
								<RestartIcon />
								Tentar de novo
							</button>
						</div>
					</section>
				)}

				{status === 'ready' &&
					queue.map((question, i) => (
						<Card
							key={question.id}
							question={question}
							index={i}
							choice={answers[question.id]}
							celebration={celebrations[question.id]}
							greet={greet && i === 0}
							last={i === queue.length - 1}
							onAnswer={answer}
							onAdvance={(index) => goTo(index + 1)}
						/>
					))}

				{topicComplete && filter !== 'all' && topicSummary && (
					<TopicComplete topic={filter} total={topicSummary.total} onReview={reviewAgain} />
				)}

				{status === 'ready' && !pending.length && !topicComplete && (
					<section className="scene scene--end" aria-labelledby="end-title">
						<div className="notice">
							<Curio mood="celebrating" size={88} />
							<h2 id="end-title" className="end__title notice__title" tabIndex={-1}>
								{deckFilter
									? `Você viu tudo de ${deckFilter.title} por agora.`
									: filter === 'all'
										? 'Você já viu todas as perguntas que temos por agora.'
										: `Você viu tudo de ${TOPICS[filter].name} por agora.`}
							</h2>
							<p>O Curió está juntando mais curiosidades. Enquanto isso:</p>
							<ul className="end__options">
								{topicsWithContent
									.filter((t) => t !== filter || deckFilter)
									.map((topic) => (
										<li key={topic}>
											<button type="button" className="chip" style={topicStyle(topic)} onClick={() => switchFilter(topic)}>
												<span className="chip__dot" aria-hidden="true" />
												{TOPICS[topic].name}
											</button>
										</li>
									))}
							</ul>
							<button type="button" className="skip" onClick={reviewAgain}>
								<RestartIcon size={18} />
								Rever as que já respondi
							</button>
						</div>
					</section>
				)}

				{status === 'ready' && pending.length > 0 && (
					<section className="scene scene--end" aria-label="Carregando mais perguntas">
						<Skeleton />
					</section>
				)}
			</main>
		</div>
	);
}

function Skeleton() {
	return (
		<div className="card card--skeleton" aria-hidden="true">
			<div className="card__head">
				<span className="skeleton-bar skeleton-bar--short" />
				<span className="skeleton-bar" />
				<span className="skeleton-bar skeleton-bar--medium" />
			</div>
			<div className="card__body">
				{[0, 1, 2, 3].map((i) => (
					<span key={i} className="skeleton-bar skeleton-bar--tall" />
				))}
			</div>
		</div>
	);
}
