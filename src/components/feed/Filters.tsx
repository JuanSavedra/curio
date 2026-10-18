import type { CSSProperties } from 'react';
import { LEVEL_IDS, LEVELS, levelStyle, type Level } from '../../data/levels';
import { topicStyle, type Topic } from '../../data/topics';
import type { FeedMode } from '../../lib/routes';
import { CheckIcon } from './Icons';

export interface SubtopicOption {
	id: string;
	name: string;
}

interface Props {
	mode: FeedMode;
	onMode: (mode: FeedMode) => void;
	/** Subtopics of the selected topic. Empty when "Tudo" is selected or the topic has a single one. */
	subtopics: SubtopicOption[];
	topic: Topic | 'all';
	subtopic: string | null;
	/** A single deck is selected (arrived from a topic page): no subtopic is highlighted */
	deckActive: boolean;
	onSubtopic: (subtopic: string | null) => void;
	level: Level | null;
	onLevel: (level: Level | null) => void;
}

const MODES: { id: FeedMode; label: string }[] = [
	{ id: 'new', label: 'Novas' },
	{ id: 'missed', label: 'Que errei' },
	{ id: 'seen', label: 'Que já vi' },
];

/** Color variables of a mode, named like the topic ones so the chip styles can be shared. */
const modeStyle = (mode: FeedMode) =>
	({ '--topic': `var(--mode-${mode})`, '--topic-ink': `var(--mode-${mode}-ink)` }) as CSSProperties;

/** Second row under the topic chips: what to show (new, missed, seen), the difficulty and, inside a topic, which subtopic. */
export function Filters({ mode, onMode, subtopics, topic, subtopic, deckActive, onSubtopic, level, onLevel }: Props) {
	return (
		<div className="filters">
			<div className="filters__group" role="group" aria-label="Mostrar">
				<span className="filters__label" aria-hidden="true">
					Mostrar
				</span>
				{MODES.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						className="chip chip--tag"
						style={modeStyle(id)}
						aria-pressed={mode === id}
						onClick={() => onMode(id)}
					>
						<span className="chip__dot" aria-hidden="true">
							{mode === id && <CheckIcon size={12} />}
						</span>
						{label}
					</button>
				))}
			</div>

			<div className="filters__group" role="group" aria-label="Dificuldade">
				<span className="filters__label" aria-hidden="true">
					Dificuldade
				</span>
				<button type="button" className="chip chip--all" aria-pressed={!level} onClick={() => onLevel(null)}>
					Todas
				</button>
				{LEVEL_IDS.map((id) => (
					<button
						key={id}
						type="button"
						className="chip chip--tag"
						style={levelStyle(id)}
						aria-pressed={level === id}
						onClick={() => onLevel(id)}
					>
						<span className="chip__dot" aria-hidden="true">
							{level === id && <CheckIcon size={12} />}
						</span>
						{LEVELS[id].name}
					</button>
				))}
			</div>

			{topic !== 'all' && subtopics.length > 1 && (
				<div className="filters__group" role="group" aria-label="Subtemas" style={topicStyle(topic)}>
					<span className="filters__label" aria-hidden="true">
						Subtema
					</span>
					<button
						type="button"
						className="chip chip--all"
						aria-pressed={!subtopic && !deckActive}
						onClick={() => onSubtopic(null)}
					>
						Todos
					</button>
					{subtopics.map(({ id, name }) => {
						const pressed = subtopic === id && !deckActive;
						return (
							<button key={id} type="button" className="chip" aria-pressed={pressed} onClick={() => onSubtopic(id)}>
								<span className="chip__dot" aria-hidden="true">
									{pressed && <CheckIcon size={12} />}
								</span>
								{name}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
