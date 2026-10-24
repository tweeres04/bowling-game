import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import { setStatsWindow } from "@/app/actions";
import { Scorecard } from "@/components/scorecard";
import { StatGrid, StatTile } from "@/components/stat-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { RecentGame } from "@/lib/game-history";
import { STATS_WINDOWS, summarizeGames, type StatsWindow } from "@/lib/stats";

export function GameStats({
  games,
  statsWindow,
}: {
  // Newest first
  games: RecentGame[];
  statsWindow: StatsWindow;
}) {
  return (
    <section className="w-full max-w-sm">
      <h2 className="mb-3 text-sm font-semibold">Your games</h2>
      <form action={setStatsWindow} className="mb-4 flex gap-2">
        {STATS_WINDOWS.map((option) => (
          <Button
            key={option}
            type="submit"
            name="statsWindow"
            value={option}
            variant={option === statsWindow ? "default" : "secondary"}
            aria-pressed={option === statsWindow}
          >
            Last {option}
          </Button>
        ))}
      </form>
      {games.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Finish a game and your stats will show up here.
        </p>
      ) : (
        <RecentGames games={games} />
      )}
    </section>
  );
}

function RecentGames({ games }: { games: RecentGame[] }) {
  const stats = summarizeGames(games);
  return (
    <div className="space-y-6">
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
            buttonVariants({ variant: "ghost" }),
            "list-none [&::-webkit-details-marker]:hidden",
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
          {games.map((game) => (
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
  );
}
