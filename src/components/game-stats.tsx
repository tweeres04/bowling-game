import { CaretRightIcon } from '@phosphor-icons/react/ssr'
import { cn } from 'cn'
import { setStatsGames } from '@/app/actions'
import { ScoreChart } from '@/components/score-chart'
import { Scorecard } from '@/components/scorecard'
import { StatGrid, StatTile } from '@/components/stat-grid'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { RecentGame } from '@/lib/game-history'
import {
	SCORECARD_GAMES,
	TREND_GAMES,
	availableStatsGameCounts,
	summarizeGames,
	type StatsGameCount,
} from '@/lib/stats'

export function GameStats({
	games,
	count,
	totalGames,
}: {
	// Newest first
	games: RecentGame[]
	count: StatsGameCount
	totalGames: number
}) {
	return (
		<section className="w-full max-w-sm">
			<div className="mb-3 flex items-center justify-between">
				{/* A count unlocks once you pass the one before it, so you can
            pick 1000 with only 728 games. "All 0 games" would read oddly
            next to the empty state, so that keeps "Last". */}
				<h2 className="text-sm font-semibold">
					{0 < totalGames && totalGames < count
						? `All ${totalGames} games`
						: `Last ${count} games`}
				</h2>
				<div className="flex gap-1">
					{availableStatsGameCounts(totalGames).map((option) => (
						<form key={option} action={setStatsGames.bind(null, option)}>
							<Button
								type="submit"
								size="sm"
								variant={option === count ? 'secondary' : 'ghost'}
								aria-pressed={option === count}
							>
								{option}
							</Button>
						</form>
					))}
				</div>
			</div>
			{games.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Finish a game and your stats will show up here.
				</p>
			) : (
				<RecentGames games={games} count={count} />
			)}
		</section>
	)
}

function RecentGames({
	games,
	count,
}: {
	games: RecentGame[]
	count: StatsGameCount
}) {
	const stats = summarizeGames(games)
	return (
		<div className="space-y-6">
			<ScoreChart
				games={games}
				average={stats.average}
				trendGames={TREND_GAMES[count]}
			/>
			<StatGrid columns={3}>
				<StatTile label="Average" value={stats.average} />
				<StatTile label="Best" value={stats.best} />
				<StatTile label="Worst" value={stats.worst} />
				<StatTile
					label="Strikes per game"
					value={stats.strikesPerGame.toFixed(1)}
				/>
				<StatTile
					label="Spares per game"
					value={stats.sparesPerGame.toFixed(1)}
				/>
				<StatTile
					label="Spare %"
					value={`${Math.round(stats.sparePercent)}%`}
				/>
				<StatTile
					label="First ball average"
					value={stats.firstBallAverage.toFixed(1)}
				/>
				<StatTile
					label="Gutter balls per game"
					value={stats.guttersPerGame.toFixed(1)}
				/>
				<StatTile
					label="Clean games"
					value={`${stats.cleanGames} of ${games.length}`}
				/>
			</StatGrid>
			{/* Native details/summary toggles without any client JS */}
			<details className="group">
				<summary
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						'list-none [&::-webkit-details-marker]:hidden',
					)}
				>
					<CaretRightIcon
						data-icon="inline-start"
						weight="bold"
						className="transition-transform group-open:rotate-90"
					/>
					<span className="group-open:hidden">Show scorecards</span>
					<span className="hidden group-open:inline">Hide scorecards</span>
				</summary>
				<ol className="mt-4 space-y-6">
					{games.slice(0, SCORECARD_GAMES).map((game) => (
						<li key={game.id}>
							<h3 className="mb-2 text-sm font-semibold">
								Game {formatNumber(game.number)}
							</h3>
							<Scorecard rolls={game.rolls} />
						</li>
					))}
				</ol>
			</details>
		</div>
	)
}
