import { cn } from 'cn'
import { formatNumber } from '@/lib/format'
import type { RecentGame } from '@/lib/game-history'

// Each point averages that game with the ones just before it. The first few
// games have fewer before them, so they average what's there.
function movingAverages(scores: number[], trendGames: number) {
	return scores.map((_, index) => {
		const window = scores.slice(Math.max(0, index - trendGames + 1), index + 1)
		return window.reduce((total, score) => total + score, 0) / window.length
	})
}

// One bar per game, oldest on the left, with a line at the average so you
// can see which games beat it, and a trend line so you can see where you're
// heading
export function ScoreChart({
	games,
	average,
	trendGames,
}: {
	// Newest first
	games: RecentGame[]
	average: number
	// How many games each point of the trend line averages over
	trendGames: number
}) {
	const oldestFirst = games.toReversed()
	const best = Math.max(...games.map((game) => game.score))
	const heightOf = (score: number) => `${(score / best) * 100}%`
	// In viewBox units: one unit per game across, one per pin of score up
	const trendPoints = movingAverages(
		oldestFirst.map((game) => game.score),
		trendGames,
	)
		.map((score, index) => `${index + 0.5},${best - score}`)
		.join(' ')

	return (
		<figure>
			<div className="relative h-28 border-b">
				{/* 100 bars with 2px gaps would be mostly gap */}
				<ol
					className={cn(
						'flex h-full items-end',
						games.length > 50 ? 'gap-px' : 'gap-0.5',
					)}
				>
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
					{trendGames}-game average
				</span>
			</figcaption>
		</figure>
	)
}
