import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVEL_IDS, LEVELS, levelFromSlug, type Level } from '../../data/levels';
import { TOPICS, TOPIC_IDS, topicFromSlug, topicStyle, type Topic } from '../../data/topics';
import { FEED_QUERY, MODE_SLUGS, deckJsonRoute, type FeedMode } from '../../lib/routes';
import { shuffle } from '../../lib/shuffle';
import type { DeckSummary, PublishedDeck, PublishedQuestion } from '../../lib/types';
import { Card, type QueuedQuestion } from './Card';
import { DAY_MILESTONES, isRunMilestone, type Celebration } from './copy';
import { Curio } from './Curio';
import { MenuIcon, NoteIcon, RestartIcon } from './Icons';
import {
	clearMissed,
	decksProgress,
	forgetSeen,
	hasVisited,
	markMissed,
	markSeen,
	markVisited,
	readMissed,
	readSeen,
	readStreak,
	recordDay,
	writeLastTopic,
} from './progress';
import { Sidebar, type SubtopicOption } from './Sidebar';
import { Skeleton } from './Skeleton';
import { TopicComplete } from './TopicComplete';
import './feed.css';

type Filter = Topic | 'all';
type Status = 'loading' | 'ready' | 'failed';

// How many decks to fetch at once. Keeps the page light even with a lot of content.
const BATCH = 3;

/** What the feed is showing: a topic (or everything), maybe one subtopic or one deck, and which kind of questions. */
interface Scope {
	topic: Filter;
	subtopic: string | null;
	deck: DeckSummary | null;
	mode: FeedMode;
	/** Only questions of this difficulty (null: all) */
	level: Level | null;
}

// Interleaves the decks so the mixed feed doesn't repeat the same topic back to back.
function interleave(decks: PublishedDeck[], include: (question: PublishedQuestion) => boolean): QueuedQuestion[] {
	const stacks = decks.map((deck) =>
		shuffle(deck.questions.filter(include)).map((q) => ({
			...q,
			topic: deck.topic,
			deckTitle: deck.title,
		})),
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

/** Which questions belong in the queue for a mode and difficulty. */
function inclusion(mode: FeedMode, level: Level | null): (question: PublishedQuestion) => boolean {
	const ids = mode === 'missed' ? readMissed() : readSeen();
	return (q) => ids.has(q.id) === (mode !== 'new') && (!level || q.level === level);
}

export default function Feed({ decks }: { decks: DeckSummary[] }) {
	const topicsWithContent = TOPIC_IDS.filter((t) => decks.some((d) => d.topic === t));

	// When the person arrives through a deck on a topic page, `deck` limits the feed to that deck
	const [scope, setScope] = useState<Scope>({
		topic: 'all',
		subtopic: null,
		deck: null,
		mode: 'new',
		level: null,
	});
	const { topic: filter, subtopic, deck: deckFilter, mode, level } = scope;
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
	// Sidebar drawer (small screens)
	const [menuOpen, setMenuOpen] = useState(false);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	// Correct answers in a row in this session. A wrong answer restarts silently; skipping doesn't count.
	const run = useRef(0);

	const railRef = useRef<HTMLElement>(null);
	const cache = useRef(new Map<string, PublishedDeck>());
	const loadingMore = useRef(false);

	const closeMenu = useCallback(() => {
		setMenuOpen(false);
		menuButtonRef.current?.focus();
	}, []);

	// Esc closes the drawer; widening the window turns it into the fixed column
	useEffect(() => {
		if (!menuOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
		const wide = matchMedia('(min-width: 48rem)');
		const onWide = () => wide.matches && setMenuOpen(false);
		window.addEventListener('keydown', onKey);
		wide.addEventListener('change', onWide);
		return () => {
			window.removeEventListener('keydown', onKey);
			wide.removeEventListener('change', onWide);
		};
	}, [menuOpen, closeMenu]);

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
		async (remaining: DeckSummary[], batchMode: FeedMode, batchLevel: Level | null) => {
			const include = inclusion(batchMode, batchLevel);
			let fresh: QueuedQuestion[] = [];
			while (!fresh.length && remaining.length) {
				const batch = remaining.slice(0, BATCH);
				remaining = remaining.slice(BATCH);
				fresh = interleave(await fetchDecks(batch), include);
			}
			return { fresh, remaining };
		},
		[fetchDecks],
	);

	const buildQueue = useCallback(
		async (next: Scope) => {
			setStatus('loading');
			setScope(next);
			setAnswers({});
			setCurrent(0);
			try {
				const inScope = next.deck
					? [next.deck]
					: decks.filter((d) => (next.topic === 'all' || d.topic === next.topic) && (!next.subtopic || d.subtopicId === next.subtopic));
				// Review modes only fetch the decks that have something to show
				const ids = next.mode === 'seen' ? readSeen() : next.mode === 'missed' ? readMissed() : null;
				const withQuestions = ids ? inScope.filter((d) => [...ids].some((id) => id.startsWith(`${d.id}/`))) : inScope;
				const { fresh, remaining } = await nextBatch(shuffle(withQuestions), next.mode, next.level);
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

	// First load: reads local progress and the URL filter (?tema=astronomia, ?subtema=<folder>, ?modo=erradas, ?nivel=filhote, ?deck=<id>, ?rever=1).
	useEffect(() => {
		setStreak(readStreak());
		setGreet(!hasVisited());
		const params = new URLSearchParams(location.search);
		const urlTopic = topicFromSlug(params.get(FEED_QUERY.topic) ?? '');
		const deck = decks.find((d) => d.id === params.get(FEED_QUERY.deck)) ?? null;
		const topic: Filter = deck ? deck.topic : urlTopic && topicsWithContent.includes(urlTopic) ? urlTopic : 'all';
		const urlSubtopic = params.get(FEED_QUERY.subtopic);
		const subtopic = !deck && topic !== 'all' && decks.some((d) => d.topic === topic && d.subtopicId === urlSubtopic) ? urlSubtopic : null;
		const urlMode = params.get(FEED_QUERY.mode);
		const mode: FeedMode = urlMode === MODE_SLUGS.missed ? 'missed' : urlMode === MODE_SLUGS.seen ? 'seen' : 'new';
		const level = levelFromSlug(params.get(FEED_QUERY.level));

		// "Rever" comes from the topic pages: forgets only what was asked, once, and cleans the address.
		if (params.get(FEED_QUERY.review) === '1' && topic !== 'all') {
			forgetSeen(prefixesOf({ topic, subtopic, deck, mode, level }));
			params.delete(FEED_QUERY.review);
			const query = params.toString();
			history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}`);
		}
		void buildQueue({ topic, subtopic, deck, mode, level });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Near the end of the queue, quietly fetches the next batch.
	useEffect(() => {
		if (status !== 'ready' || !pending.length || loadingMore.current || current < queue.length - 3) return;
		loadingMore.current = true;
		nextBatch(pending, mode, level)
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
	}, [current, queue.length, pending, status, mode, level, nextBatch]);

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
		target.scrollIntoView({
			block: 'start',
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
		});
		target.querySelector<HTMLElement>('.card__prompt, .end__title')?.focus({ preventScroll: true });
	}, []);

	const answer = useCallback(
		(index: number, choice: number) => {
			const question = queue[index];
			if (!question || answers[question.id] !== undefined) return;
			setAnswers((a) => ({ ...a, [question.id]: choice }));
			// Reviewing (missed or seen) doesn't change what was discovered, nor feeds the run of correct answers
			const reviewing = mode !== 'new';
			if (!reviewing) markSeen(question.id);
			if (choice === question.correct) clearMissed(question.id);
			else markMissed(question.id);
			writeLastTopic(question.topic);
			markVisited();
			setGreet(false);

			const { days, newDay } = recordDay();
			setStreak(days);
			if (!reviewing) run.current = choice === question.correct ? run.current + 1 : 0;

			// A day milestone is worth more than a run of correct answers (it's rarer)
			let celebration: Celebration | undefined;
			if (newDay && DAY_MILESTONES.includes(days)) {
				celebration = { kind: 'days', n: days };
				setStreakGlow((g) => g + 1);
			} else if (!reviewing && isRunMilestone(run.current)) {
				celebration = { kind: 'run', n: run.current };
			}
			if (celebration) setCelebrations((c) => ({ ...c, [question.id]: celebration }));
		},
		[queue, answers, mode],
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

	// Keeps the address in sync with what is on screen (replaceState: filters don't pile up in the history).
	function writeUrl({ topic, subtopic, deck, mode, level }: Scope) {
		const url = new URL(location.href);
		for (const name of Object.values(FEED_QUERY)) url.searchParams.delete(name);
		if (deck) url.searchParams.set(FEED_QUERY.deck, deck.id);
		else if (topic !== 'all') url.searchParams.set(FEED_QUERY.topic, TOPICS[topic].slug);
		if (!deck && subtopic) url.searchParams.set(FEED_QUERY.subtopic, subtopic);
		if (mode !== 'new') url.searchParams.set(FEED_QUERY.mode, MODE_SLUGS[mode]);
		if (level) url.searchParams.set(FEED_QUERY.level, LEVELS[level].slug);
		history.replaceState(null, '', url);
	}

	function changeScope(next: Scope) {
		writeUrl(next);
		void buildQueue(next);
	}

	function switchFilter(next: Filter) {
		if (next === filter && !deckFilter && !subtopic && status === 'ready') return;
		changeScope({ topic: next, subtopic: null, deck: null, mode, level });
	}

	function switchSubtopic(next: string | null) {
		if (next === subtopic && !deckFilter && status === 'ready') return;
		changeScope({ topic: filter, subtopic: next, deck: null, mode, level });
	}

	function switchMode(next: FeedMode) {
		if (next === mode && status === 'ready') return;
		changeScope({ ...scope, mode: next });
	}

	function switchLevel(next: Level | null) {
		if (next === level && status === 'ready') return;
		changeScope({ ...scope, level: next });
	}

	function prefixesOf({ topic, subtopic, deck }: Scope) {
		const inScope = deck ? [deck] : decks.filter((d) => (topic === 'all' || d.topic === topic) && (!subtopic || d.subtopicId === subtopic));
		return inScope.map((d) => `${d.id}/`);
	}

	function reviewAgain() {
		forgetSeen(prefixesOf(scope));
		void buildQueue(scope);
	}

	const subtopics: SubtopicOption[] = [];
	if (filter !== 'all') {
		for (const d of decks) {
			if (d.topic === filter && !subtopics.some((o) => o.id === d.subtopicId)) subtopics.push({ id: d.subtopicId, name: d.subtopic });
		}
	}
	const subtopicName = subtopics.find((o) => o.id === subtopic)?.name;

	// A topic is only complete when all of its questions were seen (skipping doesn't count).
	const topicSummary =
		status === 'ready' && !pending.length && !deckFilter && !subtopic && !level && mode === 'new' && filter !== 'all'
			? decksProgress(
					readSeen(),
					decks.filter((d) => d.topic === filter),
				)
			: null;
	const topicComplete = topicSummary?.complete ?? false;

	const currentTopic = queue[Math.min(current, queue.length - 1)]?.topic;

	const place = deckFilter ? deckFilter.title : (subtopicName ?? (filter === 'all' ? null : TOPICS[filter].name));
	const levelText = level ? `nível ${LEVELS[level].name}` : null;
	const where = place && levelText ? `${place}, ${levelText}` : (place ?? levelText);
	const endCopy = endCopyFor(mode, queue.length > 0, where);

	return (
		<div className="feed" style={currentTopic ? topicStyle(currentTopic) : undefined} data-has-topic={Boolean(currentTopic)}>
			<Sidebar
				topics={topicsWithContent}
				topic={filter}
				onTopic={switchFilter}
				mode={mode}
				onMode={switchMode}
				level={level}
				onLevel={switchLevel}
				subtopics={subtopics}
				subtopic={subtopic}
				deckActive={Boolean(deckFilter)}
				onSubtopic={switchSubtopic}
				open={menuOpen}
				onClose={closeMenu}
			/>

			{/* inert: while the drawer is open the cards behind it can't be reached by keyboard */}
			<div className="feed__main" inert={menuOpen}>
				<header className="topbar">
					<button
						ref={menuButtonRef}
						type="button"
						className="menu-button"
						aria-label="Abrir o menu"
						aria-expanded={menuOpen}
						aria-controls="sidebar"
						onClick={() => setMenuOpen(true)}
					>
						<MenuIcon size={22} />
					</button>
					<h1 className="brand">
						<Curio size={34} still />
						<span>Curiô</span>
					</h1>
					<span className="topbar__spacer" />
					{streak > 0 && (
						<p key={streakGlow} className={`streak${streakGlow ? ' streak--milestone' : ''}`} title="Dias seguidos respondendo perguntas">
							<NoteIcon size={18} />
							<span>{streak === 1 ? '1 dia' : `${streak} dias`}</span>
							<span className="sr-only"> seguidos</span>
						</p>
					)}
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
								<button type="button" className="button" onClick={() => buildQueue(scope)}>
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
								<Curio mood={endCopy.mood} size={88} />
								<h2 id="end-title" className="end__title notice__title" tabIndex={-1}>
									{endCopy.title}
								</h2>
								<p>{endCopy.text}</p>
								{mode === 'new' ? (
									<>
										<ul className="end__options">
											{topicsWithContent
												.filter((t) => t !== filter || deckFilter || subtopic)
												.map((topic) => (
													<li key={topic}>
														<button type="button" className="chip" style={topicStyle(topic)} onClick={() => switchFilter(topic)}>
															<span className="chip__dot" aria-hidden="true" />
															{TOPICS[topic].name}
														</button>
													</li>
												))}
										</ul>
										{/* Forgetting is per deck, not per difficulty, so it only shows without a difficulty filter */}
										{!level && (
											<button type="button" className="button button--quiet" onClick={reviewAgain}>
												<RestartIcon size={18} />
												Rever as que já respondi
											</button>
										)}
									</>
								) : (
									<button type="button" className="button" onClick={() => switchMode('new')}>
										Ver perguntas novas
									</button>
								)}
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
		</div>
	);
}

/** Texts of the last screen of the queue. `where` is the deck, subtopic or topic in view (null: everything). */
function endCopyFor(mode: FeedMode, hadQuestions: boolean, where: string | null) {
	const here = where ? `de ${where}` : '';
	if (mode === 'missed') {
		return hadQuestions
			? {
					mood: 'comforting' as const,
					title: `Essas eram todas as que você errou${where ? ` em ${where}` : ''}.`,
					text: 'As que você errar de novo continuam guardadas, para tentar mais tarde sem pressa.',
				}
			: {
					mood: 'celebrating' as const,
					title: `Nenhuma pergunta errada${where ? ` em ${where}` : ''}.`,
					text: 'Quando você errar uma, ela espera aqui para você tentar de novo sem pressa.',
				};
	}
	if (mode === 'seen') {
		return hadQuestions
			? {
					mood: 'happy' as const,
					title: `Você releu tudo o que descobriu${where ? ` em ${where}` : ''}.`,
					text: 'Toda curiosidade que você descobre fica guardada aqui para reler quando quiser.',
				}
			: {
					mood: 'waiting' as const,
					title: `Ainda não há nada para rever${where ? ` em ${where}` : ''}.`,
					text: 'As perguntas que você responder aparecem aqui para reler quando quiser.',
				};
	}
	return {
		mood: 'celebrating' as const,
		title: where ? `Você viu tudo ${here} por agora.` : 'Você já viu todas as perguntas que temos por agora.',
		text: 'O Curió está juntando mais curiosidades. Enquanto isso:',
	};
}

