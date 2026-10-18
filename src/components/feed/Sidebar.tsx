import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { LEVEL_IDS, LEVELS, levelStyle, type Level } from '../../data/levels';
import { TOPICS, topicStyle, type Topic } from '../../data/topics';
import { topicsRoute, type FeedMode } from '../../lib/routes';
import { Curio } from './Curio';
import { CheckIcon, CrossIcon, SidebarIcon, TopicIcon, TopicsIcon } from './Icons';
import { readSidebarCollapsed, writeSidebarCollapsed } from './progress';
import './sidebar.css';

export interface SubtopicOption {
	id: string;
	name: string;
}

type Filter = Topic | 'all';

interface Props {
	/** Topics that already have questions */
	topics: Topic[];
	topic: Filter;
	onTopic: (topic: Filter) => void;
	mode: FeedMode;
	onMode: (mode: FeedMode) => void;
	level: Level | null;
	onLevel: (level: Level | null) => void;
	/** Subtopics of the selected topic. Empty when "Tudo" is selected or the topic has a single one. */
	subtopics: SubtopicOption[];
	subtopic: string | null;
	/** A single deck is selected (arrived from a topic page): no subtopic is highlighted */
	deckActive: boolean;
	onSubtopic: (subtopic: string | null) => void;
	/** Mobile drawer */
	open: boolean;
	onClose: () => void;
}

const MODES: { id: FeedMode; label: string }[] = [
	{ id: 'new', label: 'Novas' },
	{ id: 'missed', label: 'Que errei' },
	{ id: 'seen', label: 'Que já vi' },
];

/** Color variables of a mode, named like the topic ones so the item styles can be shared. */
const modeStyle = (mode: FeedMode) =>
	({
		'--topic': `var(--mode-${mode})`,
		'--topic-ink': `var(--mode-${mode}-ink)`,
	}) as CSSProperties;

interface ItemProps {
	label: string;
	pressed: boolean;
	onClick: () => void;
	mark: ReactNode;
	style?: CSSProperties;
	neutral?: boolean;
	/** Reduced sidebar: the name only shows as a tooltip */
	tooltip?: boolean;
}

function Item({ label, pressed, onClick, mark, style, neutral, tooltip }: ItemProps) {
	return (
		<button
			type="button"
			className={`side-item${neutral ? ' side-item--neutral' : ''}`}
			style={style}
			aria-pressed={pressed}
			title={tooltip ? label : undefined}
			onClick={onClick}
		>
			{mark}
			<span className="side-item__label">{label}</span>
		</button>
	);
}

const Dot = ({ pressed }: { pressed: boolean }) => (
	<span className="side-item__mark" aria-hidden="true">
		<span className="side-item__dot">{pressed && <CheckIcon size={12} />}</span>
	</span>
);

/**
 * Left column: the brand, the way to the topics screen and every feed filter.
 * On small screens it is a drawer; from 48rem it stays in place, expanded or reduced to icons.
 */
export function Sidebar({
	topics,
	topic,
	onTopic,
	mode,
	onMode,
	level,
	onLevel,
	subtopics,
	subtopic,
	deckActive,
	onSubtopic,
	open,
	onClose,
}: Props) {
	// Read after the first render: the server always renders it expanded
	const [collapsed, setCollapsed] = useState(false);
	useEffect(() => setCollapsed(readSidebarCollapsed()), []);

	const closeRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (open) closeRef.current?.focus();
	}, [open]);

	function toggle() {
		writeSidebarCollapsed(!collapsed);
		setCollapsed(!collapsed);
	}

	// Choosing something closes the drawer (it only matters on small screens)
	const pick =
		<A extends unknown[]>(action: (...args: A) => void) =>
		(...args: A) => {
			action(...args);
			if (open) onClose();
		};

	return (
		<>
			{open && <div className="scrim" onClick={onClose} aria-hidden="true" />}
			<aside id="sidebar" className="sidebar" data-open={open} data-collapsed={collapsed} aria-label="Menu e filtros">
				<div className="sidebar__head">
					<div className="sidebar__brand" aria-hidden="true">
						<Curio size={36} still />
						<span>Curiô</span>
					</div>
					<button
						type="button"
						className="sidebar__button sidebar__toggle"
						aria-expanded={!collapsed}
						aria-controls="sidebar"
						aria-label={collapsed ? 'Expandir a barra lateral' : 'Reduzir a barra lateral'}
						title={collapsed ? 'Expandir a barra lateral' : 'Reduzir a barra lateral'}
						onClick={toggle}
					>
						<SidebarIcon size={22} />
					</button>
					<button ref={closeRef} type="button" className="sidebar__button sidebar__close" aria-label="Fechar o menu" onClick={onClose}>
						<CrossIcon size={22} />
					</button>
				</div>

				<nav className="sidebar__nav" aria-label="Filtros do feed">
					<div className="side-group" role="group" aria-label="Assunto">
						<span className="side-label" aria-hidden="true">
							Assunto
						</span>
						<Item
							label="Tudo"
							neutral
							tooltip={collapsed}
							pressed={topic === 'all'}
							onClick={pick(() => onTopic('all'))}
							mark={<Dot pressed={topic === 'all'} />}
						/>
						{topics.map((id) => (
							<Item
								key={id}
								label={TOPICS[id].name}
								tooltip={collapsed}
								style={topicStyle(id)}
								pressed={topic === id}
								onClick={pick(() => onTopic(id))}
								mark={
									<span className="side-item__mark side-item__mark--filled" aria-hidden="true">
										<TopicIcon topic={id} size={16} />
									</span>
								}
							/>
						))}
					</div>

					{topic !== 'all' && subtopics.length > 1 && (
						<div className="side-group" role="group" aria-label="Subtemas" style={topicStyle(topic)}>
							<span className="side-label" aria-hidden="true">
								Subtemas
							</span>
							<Item
								label="Todos"
								neutral
								tooltip={collapsed}
								pressed={!subtopic && !deckActive}
								onClick={pick(() => onSubtopic(null))}
								mark={<Dot pressed={!subtopic && !deckActive} />}
							/>
							{subtopics.map(({ id, name }) => {
								const pressed = subtopic === id && !deckActive;
								return (
									<Item
										key={id}
										label={name}
										tooltip={collapsed}
										pressed={pressed}
										onClick={pick(() => onSubtopic(id))}
										mark={
											<span className="side-item__mark side-item__mark--filled" aria-hidden="true">
												{pressed ? <CheckIcon size={14} /> : name.charAt(0).toUpperCase()}
											</span>
										}
									/>
								);
							})}
						</div>
					)}

					<div className="side-group" role="group" aria-label="Mostrar">
						<span className="side-label" aria-hidden="true">
							Mostrar
						</span>
						{MODES.map(({ id, label }) => (
							<Item
								key={id}
								label={label}
								tooltip={collapsed}
								style={modeStyle(id)}
								pressed={mode === id}
								onClick={pick(() => onMode(id))}
								mark={<Dot pressed={mode === id} />}
							/>
						))}
					</div>

					<div className="side-group" role="group" aria-label="Dificuldade">
						<span className="side-label" aria-hidden="true">
							Dificuldade
						</span>
						<Item
							label="Todas"
							neutral
							tooltip={collapsed}
							pressed={!level}
							onClick={pick(() => onLevel(null))}
							mark={<Dot pressed={!level} />}
						/>
						{LEVEL_IDS.map((id) => (
							<Item
								key={id}
								label={LEVELS[id].name}
								tooltip={collapsed}
								style={levelStyle(id)}
								pressed={level === id}
								onClick={pick(() => onLevel(id))}
								mark={<Dot pressed={level === id} />}
							/>
						))}
					</div>
				</nav>

				<div className="sidebar__foot">
					<a className="side-item" href={topicsRoute()} title={collapsed ? 'Ver todos os temas' : undefined}>
						<span className="side-item__mark" aria-hidden="true">
							<TopicsIcon size={20} />
						</span>
						<span className="side-item__label">Ver todos os temas</span>
					</a>
				</div>
			</aside>
		</>
	);
}
