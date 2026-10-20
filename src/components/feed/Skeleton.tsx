/** Placeholder card shown while questions load. Styles live in feed.css. */
export function Skeleton() {
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
