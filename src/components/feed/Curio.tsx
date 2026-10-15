import { useId } from 'react';
import './curio.css';

export type Mood = 'waiting' | 'happy' | 'comforting' | 'celebrating';

interface Props {
	mood?: Mood;
	size?: number;
	/** No waiting animation (for the logo, for instance) */
	still?: boolean;
	className?: string;
}

// Shared silhouettes: drawn once with the outline underneath and once on top,
// so the outline only shows on the outer edge.
const TAIL = 'M23 47 8.5 61.5c-1.6 1.6-.4 4 1.8 3.2L28 56z';
const BEAK = 'M60.5 22.5c6.5.3 11.5 3 13.8 6.6L61 31c-1.3-2.6-1.4-5.6-.5-8.5z';

/**
 * O Curió (the mascot): a male with dark head and back, rust-brown chest,
 * a small white spot on the wing and a thick beak. Decorative; the text next to it always says the result.
 */
export function Curio({ mood = 'waiting', size = 56, still = false, className = '' }: Props) {
	const cheerful = mood === 'happy' || mood === 'celebrating';
	const chestId = `curio-chest-${useId().replace(/:/g, '')}`;
	return (
		<svg
			className={`curio curio--${mood}${still ? ' curio--still' : ''} ${className}`}
			width={size}
			height={size}
			viewBox="0 0 80 80"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<radialGradient id={chestId} cx="0.6" cy="0.35" r="0.75">
					<stop offset="0" stopColor="var(--curio-chest-light)" />
					<stop offset="0.7" stopColor="var(--rust)" />
				</radialGradient>
			</defs>
			{cheerful && (
				<g className="curio__notes" fill="var(--rust)" stroke="var(--rust)" strokeWidth="1.6" strokeLinecap="round">
					<g className="curio__note">
						<path d="M71 13V5.5l5-1.2V11" fill="none" />
						<ellipse cx="69.6" cy="13.2" rx="2.3" ry="1.8" stroke="none" />
						<ellipse cx="74.6" cy="11" rx="2.3" ry="1.8" stroke="none" />
					</g>
					{mood === 'celebrating' && (
						<g className="curio__note curio__note--2">
							<path d="M61 10V3.5" fill="none" />
							<ellipse cx="59.4" cy="10.3" rx="2.2" ry="1.7" stroke="none" />
						</g>
					)}
				</g>
			)}

			<g className="curio__bird">
				{/* Outline */}
				<g fill="var(--curio-outline)" stroke="var(--curio-outline)" strokeWidth="2.6" strokeLinejoin="round">
					<path d={TAIL} />
					<ellipse cx="38" cy="50" rx="24" ry="20" />
					<circle cx="47" cy="29" r="16" />
				</g>

				<path d={TAIL} fill="var(--plumage)" />
				<path d="M12 59.5 18 54" stroke="var(--curio-light)" strokeWidth="1.4" strokeLinecap="round" />

				{/* Body and chest */}
				<ellipse cx="38" cy="50" rx="24" ry="20" fill="var(--plumage)" />
				<ellipse cx="45.5" cy="55" rx="15.5" ry="13" fill={`url(#${chestId})`} />

				{/* Front wing */}
				<g className="curio__wing">
					{mood === 'celebrating' ? (
						<>
							{/* Raised wing, with the tip feathers spread */}
							<path
								d="M37 45c-3-8.5-9.5-17-18.5-22.5-3.5-2.1-7.5.6-6.5 4.3.4 1.4 1.2 2.6 2.2 3.5-3 .2-4.8 3.4-3.1 5.8.8 1.1 2 1.8 3.3 2-2 1.4-1.7 4.6.6 5.6C20 46.5 29 47 37 45z"
								fill="var(--curio-light)"
								stroke="var(--curio-outline)"
								strokeWidth="1.3"
								strokeLinejoin="round"
							/>
							<path d="M15.5 31c6 2.5 12 6.5 17 11.5M15 39c5.5.8 11 2.5 16 4.8" stroke="var(--plumage)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
							<circle cx="26" cy="35" r="2.2" fill="var(--nest)" />
						</>
					) : (
						<>
							<path d="M16.5 46c3-11 17-14.5 27.5-8.5-1.8 9.5-10.5 17.5-22 17.5-4.3 0-6.5-4.5-5.5-9z" fill="var(--curio-light)" />
							<path d="M20 51.5c5 .5 11-1.5 15.5-6M19 46.5c4.5-.5 9.5-2.5 13-6" stroke="var(--plumage)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
							<circle cx="27.5" cy="44.5" r="2.2" fill="var(--nest)" />
						</>
					)}
				</g>

				{/* Feet */}
				<path d="M33 69.5v4.5M43 69.5v4.5M30.5 74h5M40.5 74h5" stroke="var(--curio-beak)" strokeWidth="2" strokeLinecap="round" />

				{/* Head */}
				<g className="curio__head">
					<circle cx="47" cy="29" r="16" fill="var(--plumage)" />
					<path d="M33.5 24.5c2-6.5 8-11 15-11.5-5.5 2.5-9.5 7-11 12.5z" fill="var(--curio-light)" />

					<path d={BEAK} fill="var(--curio-beak)" stroke="var(--curio-outline)" strokeWidth="1.3" strokeLinejoin="round" />
					<path d="M63 25c3.5.3 6.5 1.5 8.5 3.3" stroke="var(--curio-beak-light)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
					<path
						className="curio__lower-beak"
						d="M61 31l13.3-1.9c-1.8 3-6.3 5-12 4.6z"
						fill="var(--curio-beak)"
						stroke="var(--curio-outline)"
						strokeWidth="1.3"
						strokeLinejoin="round"
					/>

					<g className="curio__eye">
						{mood === 'waiting' && (
							<>
								<circle cx="53.5" cy="25.5" r="3.8" fill="var(--nest)" />
								<circle cx="54.4" cy="25.8" r="2.4" fill="var(--curio-outline)" />
								<circle cx="55.3" cy="24.6" r="0.9" fill="var(--nest)" />
							</>
						)}
						{cheerful && <path d="M49.8 27.2q3.7-5.2 7.4 0" fill="none" stroke="var(--nest)" strokeWidth="2.3" strokeLinecap="round" />}
						{mood === 'comforting' && (
							<>
								{/* Looking down, eyebrow raised on the inner side: compassion */}
								<circle cx="53.5" cy="25.8" r="4.1" fill="var(--nest)" />
								<circle cx="54" cy="27" r="2" fill="var(--curio-outline)" />
								<circle cx="54.7" cy="26.2" r="0.7" fill="var(--nest)" />
								<path d="M49.6 21.6q3.5-.2 7.2-3" fill="none" stroke="var(--curio-beak-light)" strokeWidth="1.8" strokeLinecap="round" />
							</>
						)}
					</g>
				</g>
			</g>
		</svg>
	);
}
