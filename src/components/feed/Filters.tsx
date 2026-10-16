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
}

const MODES: { id: FeedMode; label: string }[] = [
	{ id: 'new', label: 'Novas' },
	{ id: 'missed', label: 'Que errei' },
	{ id: 'seen', label: 'Que já vi' },
];

/** Second row under the topic chips: what to show (new, missed, seen) and, inside a topic, which subtopic. */
export function Filters({ mode, onMode, subtopics, topic, subtopic, deckActive, onSubtopic }: Props) {
	return (
		<div className="filters">
			<div className="filters__group" role="group" aria-label="Mostrar">
				{MODES.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						className="chip chip--all chip--mode"
						aria-pressed={mode === id}
						onClick={() => onMode(id)}
					>
						{label}
					</button>
				))}
			</div>

			{topic !== 'all' && subtopics.length > 1 && (
				<div className="filters__group" role="group" aria-label="Subtemas" style={topicStyle(topic)}>
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
