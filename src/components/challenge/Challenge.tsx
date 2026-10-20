import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TOPIC_IDS, topicStyle } from '../../data/topics';
import { deckJsonRoute, feedRoute } from '../../lib/routes';
import { shuffle } from '../../lib/shuffle';
import type { DeckSummary, PublishedDeck } from '../../lib/types';
import { Card, type QueuedQuestion } from '../feed/Card';
import { Curio } from '../feed/Curio';
import { ArrowLeftIcon, RestartIcon } from '../feed/Icons';
import { Notice, useNotice } from '../feed/Notice';
import { clearMissed, markMissed, markSeen, markVisited, readSeen, recordDay, writeLastTopic } from '../feed/progress';
import { Skeleton } from '../feed/Skeleton';
import '../feed/feed.css';
import '../topics/topics.css';
import { Clock } from './Clock';
import { DEFAULT_SECONDS, ROUND_SIZE, type Seconds } from './copy';
import { Setup, type Choice } from './Setup';
import { Summary, type Outcome, type RoundResult } from './Summary';
import './challenge.css';

type Phase = 'setup' | 'loading' | 'failed' | 'round' | 'summary';

// How many decks to fetch at once, like the feed
const BATCH = 3;

/**
 * A round of questions with a calm clock. It's optional and never punishes: running out of time just shows
 * the answer and the explanation. Every answer feeds the same progress as the feed (discoveries, "Que errei", day streak).
 */
export default function Challenge({ decks }: { decks: DeckSummary[] }) {
	const [phase, setPhase] = useState<Phase>('setup');
	const [topic, setTopic] = useState<Choice>('all');
	const [seconds, setSeconds] = useState<Seconds>(DEFAULT_SECONDS);
	const [questions, setQuestions] = useState<QueuedQuestion[]>([]);
	const [outcomes, setOutcomes] = useState<(Outcome | undefined)[]>([]);
	const [position, setPosition] = useState(0);
	const [paused, setPaused] = useState(false);
	const [announcement, setAnnouncement] = useState('');
	// True after the first round: the setup screen then moves the focus to its title
	const [cameBack, setCameBack] = useState(false);

	const notice = useNotice();
	const cache = useRef(new Map<string, PublishedDeck>());
	const stageRef = useRef<HTMLElement>(null);

	const topics = useMemo(
		() =>
			TOPIC_IDS.map((id) => ({ topic: id, total: decks.filter((d) => d.topic === id).reduce((sum, d) => sum + d.total, 0) })).filter(
				(t) => t.total > 0,
			),
		[decks],
	);

	const fetchDeck = useCallback(async (summary: DeckSummary) => {
		const cached = cache.current.get(summary.id);
		if (cached) return cached;
		const response = await fetch(deckJsonRoute(summary.id));
		if (!response.ok) throw new Error(`Failed to fetch ${summary.id}`);
		const deck = (await response.json()) as PublishedDeck;
		cache.current.set(summary.id, deck);
		return deck;
	}, []);

	/** Questions not yet discovered come first; if there aren't enough, the ones already seen fill the round. */
	const pickQuestions = useCallback(
		async (scope: DeckSummary[]) => {
			const seen = readSeen();
			const queue = shuffle(scope);
			const fresh: QueuedQuestion[] = [];
			const known: QueuedQuestion[] = [];
			// Stops fetching once there are enough new ones. If the decks run out first, `known` is complete.
			while (queue.length && fresh.length < ROUND_SIZE) {
				for (const deck of await Promise.all(queue.splice(0, BATCH).map(fetchDeck))) {
					for (const q of deck.questions) (seen.has(q.id) ? known : fresh).push({ ...q, topic: deck.topic, deckTitle: deck.title });
				}
			}
			return shuffle([...shuffle(fresh), ...shuffle(known)].slice(0, ROUND_SIZE));
		},
		[fetchDeck],
	);

	const start = useCallback(async () => {
		setPhase('loading');
		try {
			const picked = await pickQuestions(decks.filter((d) => topic === 'all' || d.topic === topic));
			if (!picked.length) throw new Error('No questions for this round');
			setQuestions(picked);
			setOutcomes([]);
			setPosition(0);
			setPaused(false);
			setAnnouncement('');
			setPhase('round');
		} catch {
			setPhase('failed');
		}
	}, [decks, topic, pickQuestions]);

	/** Answers and time-outs count as a day of activity and as "discovered": the explanation was shown. */
	function recordProgress(question: QueuedQuestion, result: 'right' | 'wrong' | 'timeout') {
		markSeen(question.id);
		if (result === 'right') clearMissed(question.id);
		else if (result === 'wrong') markMissed(question.id);
		writeLastTopic(question.topic);
		markVisited();
		recordDay();
	}

	const answer = useCallback(
		(index: number, choice: number) => {
			const question = questions[index];
			if (!question || outcomes[index] || paused) return;
			setOutcomes((list) => Object.assign([...list], { [index]: { choice } }));
			recordProgress(question, choice === question.correct ? 'right' : 'wrong');
		},
		[questions, outcomes, paused],
	);

	const timeUp = useCallback(() => {
		const question = questions[position];
		if (!question || outcomes[position]) return;
		setOutcomes((list) => Object.assign([...list], { [position]: { timedOut: true } }));
		recordProgress(question, 'timeout');
	}, [questions, position, outcomes]);

	const advance = useCallback(() => {
		setPaused(false);
		setAnnouncement('');
		if (position + 1 < questions.length) setPosition(position + 1);
		else {
			setCameBack(true);
			setPhase('summary');
		}
	}, [position, questions.length]);

	// A new question: the page starts at its top and the focus goes to the question
	useEffect(() => {
		if (phase !== 'round') return;
		stageRef.current?.scrollTo({ top: 0 });
		stageRef.current?.querySelector<HTMLElement>('.card__prompt')?.focus({ preventScroll: true });
	}, [phase, position]);

	// Shortcuts: 1 to 4 (or A to D) answer
	useEffect(() => {
		if (phase !== 'round') return;
		const onKey = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
			const key = e.key.toLowerCase();
			const choice = '1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key);
			const question = questions[position];
			if (choice >= 0 && question && choice < question.choices.length) {
				e.preventDefault();
				answer(position, choice);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [phase, position, questions, answer]);

	if (phase === 'setup') {
		return (
			<Setup
				topics={topics}
				topic={topic}
				seconds={seconds}
				onTopic={setTopic}
				onSeconds={setSeconds}
				onStart={start}
				focusTitle={cameBack}
			/>
		);
	}

	if (phase === 'summary') {
		const results: RoundResult[] = questions.map((question, i) => ({ question, outcome: outcomes[i] ?? { timedOut: true } }));
		return <Summary results={results} onAgain={start} onChange={() => setPhase('setup')} />;
	}

	if (phase === 'loading' || phase === 'failed') {
		return (
			<div className="topics-page">
				<header className="topics-page__header">
					<a className="back-link" href={feedRoute()}>
						<ArrowLeftIcon size={18} />
						Voltar às perguntas
					</a>
				</header>
				<main id="content" className="challenge" aria-busy={phase === 'loading'}>
					{phase === 'loading' ? (
						<>
							<p className="sr-only">Preparando a rodada…</p>
							<div className="challenge__skeleton">
								<Skeleton />
							</div>
						</>
					) : (
						<div className="notice">
							<Curio mood="comforting" size={72} />
							<h1 className="notice__title">Não consegui preparar a rodada.</h1>
							<p>Confira sua conexão com a internet e tente de novo.</p>
							<button type="button" className="button" onClick={() => void start()}>
								<RestartIcon />
								Tentar de novo
							</button>
							<button type="button" className="button button--quiet" onClick={() => setPhase('setup')}>
								Voltar
							</button>
						</div>
					)}
				</main>
			</div>
		);
	}

	const question = questions[position];
	const outcome = outcomes[position];

	return (
		<div className="challenge-round" style={topicStyle(question.topic)}>
			<header className="challenge-round__bar">
				<a className="back-link" href={feedRoute()}>
					<ArrowLeftIcon size={18} />
					Sair<span className="narrow-hidden"> do desafio</span>
				</a>
				<h1 className="sr-only">Desafio</h1>
				<p className="challenge-round__count">
					Pergunta {position + 1} de {questions.length}
				</p>
			</header>

			<Clock
				key={question.id}
				seconds={seconds}
				running={!outcome}
				onTimeUp={timeUp}
				onPausedChange={setPaused}
				onAnnounce={setAnnouncement}
			/>
			<p className="sr-only" role="status">
				{announcement}
			</p>

			<main id="content" className="challenge-round__stage" ref={stageRef}>
				<Card
					key={question.id}
					question={question}
					index={position}
					choice={outcome?.choice}
					timedOut={outcome?.timedOut}
					locked={paused}
					celebration={undefined}
					greet={false}
					canSkip={false}
					last={position === questions.length - 1}
					lastLabel="Ver o resultado"
					onAnswer={answer}
					onAdvance={advance}
					onNotice={notice.say}
				/>
			</main>
			<Notice text={notice.text} />
		</div>
	);
}
