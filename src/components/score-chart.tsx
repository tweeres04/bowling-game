import { formatNumber } from '@/lib/format'
import type { RecentGame } from '@/lib/game-history'

// How many games each point of the trend line averages over
const TREND_GAMES = 5

// Each point averages that game with the ones just before it. The first few
// games have fewer before them, so they average what's there.
function movingAverages(scores: number[]) {
	return scores.map((_, index) => {
		const window = scores.slice(Math.max(0, index - TREND_GAMES + 1), index + 1)
		return window.reduce((total, score) => total + score, 0) / window.length
	})
}

// One bar per game, oldest on the left, with a line at the average so you
// can see which games beat it, and a trend line so you can see where you're
// heading
export function ScoreChart({
	games,
	average,
}: {
	// Newest first
	games: RecentGame[]
	average: number
}) {
	const oldestFirst = games.toReversed()
	const best = Math.max(...games.map((game) => game.score))
	const heightOf = (score: number) => `${(score / best) * 100}%`
	// In viewBox units: one unit per game across, one per pin of score up
	const trendPoints = movingAverages(oldestFirst.map((game) => game.score))
		.map((score, index) => `${index + 0.5},${best - score}`)
		.join(' ')

	return (
		<figure>
			<div className="relative h-28 border-b">
				<ol className="flex h-full items-end gap-0.5">
					{oldestFirst.map((game) => {
						const label = `Game ${formatNumber(game.number)}: ${game.score}`
						return (
							<li
								key={game.id}
								title={label}
								aria-label={label}
								className="flex-1 rounded-t-sm bg-primary/25"
								style={{ height: heightOf(game.score) }}
							/>
						)
					})}
				</ol>
				<div
					className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground"
					style={{ bottom: heightOf(average) }}
					aria-hidden
				/>
				{/* Stretched to the bars' box, so the stroke has to opt out of
            scaling to stay 2px */}
				<svg
					className="pointer-events-none absolute inset-0 size-full overflow-visible"
					viewBox={`0 0 ${games.length} ${best}`}
					preserveAspectRatio="none"
					aria-hidden
				>
					<polyline
						points={trendPoints}
						fill="none"
						className="stroke-foreground"
						strokeWidth={2}
						strokeLinejoin="round"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
			</div>
			<figcaption className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-2">
					<span className="w-4 border-t-2 border-dashed border-foreground" />
					Average {average}
				</span>
				<span className="flex items-center gap-2">
					<span className="w-4 border-t-2 border-foreground" />
					{TREND_GAMES}-game average
				</span>
			</figcaption>
		</figure>
	)
}
