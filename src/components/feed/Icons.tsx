// Rounded-stroke icons, all in the same style. Decorative: the text next to them carries the meaning.
import type { ReactNode } from 'react';
import type { Topic } from '../../data/topics';

export function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{children}
		</svg>
	);
}

export const CheckIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</Icon>
);

/** The "almost" marker on a wrong answer */
export const CrossIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="m7 7 10 10M17 7 7 17" />
	</Icon>
);

export const ArrowDownIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M12 5v14M6 13l6 6 6-6" />
	</Icon>
);

export const RestartIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
	</Icon>
);

export const NoteIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M9 18V6l10-2v12" />
		<circle cx="6.5" cy="18" r="2.5" />
		<circle cx="16.5" cy="16" r="2.5" />
	</Icon>
);

export const ArrowRightIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</Icon>
);

export const ArrowLeftIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</Icon>
);

/** Arrow leaving a box: the link opens in a new tab. */
export const ExternalIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M14 5h5v5M19 5l-8 8M18 14v3.5A1.5 1.5 0 0 1 16.5 19h-9A1.5 1.5 0 0 1 6 17.5v-9A1.5 1.5 0 0 1 7.5 7H10" />
	</Icon>
);

/** An open book: the album of discoveries. */
export const AlbumIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M12 7.5C10.5 6 8 5.5 5 5.5v11c3 0 5.5.5 7 2 1.5-1.5 4-2 7-2v-11c-3 0-5.5.5-7 2ZM12 7.5v11" />
	</Icon>
);

/** A medal with a ribbon: the seals page. */
export const SealIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<circle cx="12" cy="9.5" r="5" />
		<path d="m9 14 -1.5 6 4.5 -2.5 4.5 2.5 -1.5 -6" />
	</Icon>
);

/** A magnifying glass: search fields. */
export const SearchIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<circle cx="10.5" cy="10.5" r="5.5" />
		<path d="m15 15 4.5 4.5" />
	</Icon>
);

/** Three lines: opens the sidebar on small screens. */
export const MenuIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M4 7h16M4 12h16M4 17h16" />
	</Icon>
);

/** A panel with a side column: reduces or expands the sidebar. */
export const SidebarIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<rect x="4" y="5" width="16" height="14" rx="3.5" />
		<path d="M9.5 5v14" />
	</Icon>
);

/** Four rounded corners: the door to the topics screen. */
export const TopicsIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<rect x="4" y="4" width="6.5" height="6.5" rx="2" />
		<rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
		<rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
		<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
	</Icon>
);

// ---------- One icon per topic (same stroke as the others) ----------

const TOPIC_ICONS: Record<Topic, ReactNode> = {
	// Flask with a line of liquid
	science: (
		<>
			<path d="M9.5 3.5h5M10 3.5v5.8L5.2 17.6A2.2 2.2 0 0 0 7.1 21h9.8a2.2 2.2 0 0 0 1.9-3.4L14 9.3V3.5" />
			<path d="M7.8 15h8.4" />
		</>
	),
	// Pi
	math: <path d="M4.5 7h15M9 7l-.6 10.5M15 7v9.5a1.5 1.5 0 0 0 1.5 1.5h.8" />,
	// Puzzle piece
	logic: <path d="M4 6h6a2 2 0 1 1 4 0h6v4a2 2 0 1 1 0 4v6H4v-6a2 2 0 1 0 0-4z" />,
	// Hourglass
	history: (
		<>
			<path d="M6.5 3h11M6.5 21h11" />
			<path d="M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l-2.4 2.3A4 4 0 0 0 8 17.5V21M16 3v3.5a4 4 0 0 1-1.6 3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" />
		</>
	),
	// Globe
	geography: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" />
		</>
	),
	// Ringed planet (the ring passes in front and hides behind the planet)
	astronomy: (
		<g transform="rotate(-20 12 12)">
			<circle cx="12" cy="12" r="5.5" />
			<path d="M16.83 9.37A10 3 0 0 1 16.83 14.63A10 3 0 0 1 7.17 14.63A10 3 0 0 1 7.17 9.37" />
		</g>
	),
	// Speech bubble
	language: (
		<>
			<path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z" />
			<path d="M8 9.5h8M8 12.5h5" />
		</>
	),
};

export const TopicIcon = ({ topic, size }: { topic: Topic; size?: number }) => (
	<Icon size={size}>{TOPIC_ICONS[topic]}</Icon>
);

/** Stopwatch: the challenge and its clock */
export const TimerIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<circle cx="12" cy="13.5" r="7.5" />
		<path d="M12 9.5v4l2.5 1.5M9.5 3h5" />
	</Icon>
);

export const PauseIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M9 6.5v11M15 6.5v11" />
	</Icon>
);

export const PlayIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M8.5 6v12l9.5-6z" />
	</Icon>
);

export const PlusIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M12 5.5v13M5.5 12h13" />
	</Icon>
);

/** Share: three dots joined by two lines */
export const ShareIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<circle cx="6" cy="12" r="2.5" />
		<circle cx="17.5" cy="6" r="2.5" />
		<circle cx="17.5" cy="18" r="2.5" />
		<path d="m8.2 10.8 7.1-3.6M8.2 13.2l7.1 3.6" />
	</Icon>
);

/** Sun: the question of the day */
export const SunIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
	</Icon>
);

/** Two arrows going opposite ways: moving progress between devices */
export const TransferIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" />
	</Icon>
);

export const DownloadIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
	</Icon>
);

export const UploadIcon = (p: { size?: number }) => (
	<Icon {...p}>
		<path d="M12 16V5M7 9l5-5 5 5M5 20h14" />
	</Icon>
);
