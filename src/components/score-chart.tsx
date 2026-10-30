import { cn } from 'cn'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { formatNumber } from '@/lib/format'
import type { RecentGame } from '@/lib/game-history'

// Each point averages that game with the ones just before it. The line
// starts once there are enough games to fill the window, so an early point
// can't sit on top of a single game and pass for a trend.
function movingAverages(scores: number[], trendGames: number) {
	return scores.slice(trendGames - 1).map((_, index) => {
		const window = scores.slice(index, index + trendGames)
		return window.reduce((total, score) => total + score, 0) / trendGames
	})
}

// More bars than this would be under a pixel wide each
const MAX_BARS = 100

// Groups games into bars of equal size, newest first, so the newest bar is
// always full and only the oldest one can come up short
function barsOf(games: RecentGame[]) {
	const gamesPerBar = Math.ceil(games.length / MAX_BARS)
	const bars = []
	for (let start = 0; start < games.length; start += gamesPerBar) {
		const barGames = games.slice(start, start + gamesPerBar)
		const newest = barGames[0]
		const oldest = barGames.at(-1)!
		const score =
			barGames.reduce((total, game) => total + game.score, 0) / barGames.length
		bars.push({
			key: newest.id,
			score,
			label:
				barGames.length === 1
					? `Game ${formatNumber(newest.number)}: ${newest.score}`
					: `Games ${formatNumber(oldest.number)}-${formatNumber(newest.number)}: average ${Math.round(score)}`,
		})
	}
	return bars
}

// One bar per game (or per few games, when there are too many to fit),
// oldest on the left, with a line at the average so you can see which games
// beat it, and a trend line so you can see where you're heading
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
	const bars = barsOf(games).toReversed()
	// The tallest bar fills the chart. With one game per bar that's the best
	// game; grouped, it's the best group's average.
	const best = Math.max(...bars.map((bar) => bar.score))
	const heightOf = (score: number) => `${(score / best) * 100}%`
	// In viewBox units: one unit per game across, one per pin of score up. The
	// first point lands on the game that fills the first window.
	const trendPoints = movingAverages(
		oldestFirst.map((game) => game.score),
		trendGames,
	)
		.map((score, index) => `${index + trendGames - 0.5},${best - score}`)
		.join(' ')

	return (
		<figure>
			<div className="relative h-28 border-b">
				{/* 100 bars with 2px gaps would be mostly gap */}
				<ol
					className={cn(
						'flex h-full items-end',
						bars.length > 50 ? 'gap-px' : 'gap-0.5',
					)}
				>
					{/* Popovers, not tooltips, so tapping a bar works on phones too */}
					{bars.map((bar) => (
						<li
							key={bar.key}
							className="flex-1"
							style={{ height: heightOf(bar.score) }}
						>
							<Popover>
								<PopoverTrigger
									aria-label={bar.label}
									className="size-full rounded-t-sm bg-primary/25 data-popup-open:bg-primary/60"
								/>
								<PopoverContent side="top" className="w-auto">
									{bar.label}
								</PopoverContent>
							</Popover>
						</li>
					))}
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
				{/* The trend line starts once there are enough games to average */}
				{games.length >= trendGames && (
					<span className="flex items-center gap-2">
						<span className="w-4 border-t-2 border-foreground" />
						{trendGames}-game average
					</span>
				)}
			</figcaption>
		</figure>
	)
}
