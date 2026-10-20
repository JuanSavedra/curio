import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PauseIcon, PlayIcon, PlusIcon } from '../feed/Icons';
import { EXTRA_SECONDS, LOW_SECONDS } from './copy';

interface Props {
	/** Time for this question, in seconds */
	seconds: number;
	/** False once the question was answered or the time ran out: the clock stops and the buttons go away */
	running: boolean;
	onTimeUp: () => void;
	onPausedChange: (paused: boolean) => void;
	/** Sentences for the screen reader's live region */
	onAnnounce: (text: string) => void;
}

// Circumference of the ring (radius 20 in a 48 x 48 box)
const RING = 2 * Math.PI * 20;
const TICK_MS = 100;

/**
 * The challenge's clock: a ring that empties, the seconds in numbers, "Pausar" and "Mais 15 s".
 * It never shames: it turns warm in the last seconds, and that's all. Mount it again (new `key`) per question.
 */
export function Clock({ seconds, running, onTimeUp, onPausedChange, onAnnounce }: Props) {
	const [left, setLeft] = useState(seconds * 1000);
	const [total, setTotal] = useState(seconds * 1000);
	const [paused, setPaused] = useState(false);
	// Source of truth while the interval runs: when it ends, and how much is left
	const leftRef = useRef(seconds * 1000);
	const endRef = useRef(0);
	const warned = useRef(false);
	// The latest callbacks, so the interval never restarts just because a parent re-rendered
	const onTimeUpRef = useRef(onTimeUp);
	onTimeUpRef.current = onTimeUp;
	const onAnnounceRef = useRef(onAnnounce);
	onAnnounceRef.current = onAnnounce;

	useEffect(() => {
		if (!running || paused) return;
		endRef.current = Date.now() + leftRef.current;
		const timer = setInterval(() => {
			const remaining = Math.max(0, endRef.current - Date.now());
			leftRef.current = remaining;
			setLeft(remaining);
			if (remaining > LOW_SECONDS * 1000) {
				warned.current = false;
			} else if (!warned.current && remaining > 0) {
				warned.current = true;
				onAnnounceRef.current(`Faltam ${LOW_SECONDS} segundos.`);
			}
			if (remaining === 0) {
				clearInterval(timer);
				onTimeUpRef.current();
			}
		}, TICK_MS);
		return () => clearInterval(timer);
	}, [running, paused]);

	// Someone switched to another app: pause instead of running the clock out where nobody is looking
	useEffect(() => {
		if (!running) return;
		const onHide = () => {
			if (document.hidden) setPaused(true);
		};
		document.addEventListener('visibilitychange', onHide);
		return () => document.removeEventListener('visibilitychange', onHide);
	}, [running]);

	useEffect(() => {
		onPausedChange(paused);
	}, [paused, onPausedChange]);

	// Pausing is only possible while the clock runs, so a finished question never stays "paused"
	useEffect(() => {
		if (!running) setPaused(false);
	}, [running]);

	function addTime() {
		const extra = EXTRA_SECONDS * 1000;
		leftRef.current += extra;
		endRef.current += extra;
		setLeft(leftRef.current);
		setTotal((t) => t + extra);
		onAnnounceRef.current(`Mais ${EXTRA_SECONDS} segundos.`);
	}

	// The ring moves once per second (the number's rhythm): easy to follow, and calm for reduced motion
	const shown = Math.ceil(left / 1000);
	const fraction = Math.min(1, (shown * 1000) / total);
	const low = shown <= LOW_SECONDS;

	return (
		<div className="clock" data-low={low && running} data-paused={paused} data-empty={shown === 0}>
			<div className="clock__face" role="timer">
				<svg className="clock__ring" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
					<circle className="clock__track" cx="24" cy="24" r="20" />
					<circle
						className="clock__arc"
						cx="24"
						cy="24"
						r="20"
						style={{ '--ring': RING, '--fraction': fraction } as CSSProperties}
					/>
				</svg>
				<span className="clock__number">
					{shown}
					<span className="sr-only"> {shown === 1 ? 'segundo' : 'segundos'}</span>
				</span>
			</div>

			<p className="clock__status">{paused ? 'Pausado' : <span className="clock__unit">segundos</span>}</p>

			{running && (
				<div className="clock__actions">
					<button type="button" className="chip" onClick={() => setPaused((p) => !p)}>
						{paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
						{paused ? 'Continuar' : 'Pausar'}
					</button>
					<button type="button" className="chip" onClick={addTime} disabled={paused} aria-label={`Mais ${EXTRA_SECONDS} segundos`}>
						<PlusIcon size={18} />
						{EXTRA_SECONDS} s
					</button>
				</div>
			)}
		</div>
	);
}
