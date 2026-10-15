import { useMemo, type CSSProperties } from 'react';

const COLORS = ['var(--rust)', 'var(--curio-chest-light)', 'var(--plumage)', 'var(--curio-light)'];
const COUNT = 14;

/**
 * Feathers falling over the stage in a celebration. Decorative, they ignore touch
 * and fade out on their own within ~1.2s. With reduced motion they don't appear (see feed.css).
 */
export function Feathers() {
	const feathers = useMemo(
		() =>
			Array.from({ length: COUNT }, (_, i) => ({
				x: `${(i / COUNT) * 100 + Math.random() * 6}%`,
				delay: `${Math.round(Math.random() * 200)}ms`,
				fall: `${14 + Math.random() * 8}rem`,
				drift: `${(Math.random() - 0.5) * 4}rem`,
				spinFrom: `${Math.round((Math.random() - 0.5) * 120)}deg`,
				spinTo: `${Math.round((Math.random() - 0.5) * 360)}deg`,
				scale: (0.7 + Math.random() * 0.6).toFixed(2),
				color: COLORS[i % COLORS.length],
			})),
		[],
	);

	return (
		<div className="feathers" aria-hidden="true">
			{feathers.map((f, i) => (
				<svg
					key={i}
					className="feather"
					viewBox="0 0 12 26"
					width="12"
					height="26"
					style={
						{
							left: f.x,
							color: f.color,
							animationDelay: f.delay,
							'--fall': f.fall,
							'--drift': f.drift,
							'--spin-from': f.spinFrom,
							'--spin-to': f.spinTo,
							'--scale': f.scale,
						} as CSSProperties
					}
				>
					<path d="M6 .5c4.2 5 6 13 1.5 20.5H4.5C0 13.5 1.8 5.5 6 .5z" fill="currentColor" />
					<path d="M6 3.5V25.5" stroke="var(--nest)" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
				</svg>
			))}
		</div>
	);
}
