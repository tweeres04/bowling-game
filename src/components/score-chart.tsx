import { formatNumber } from "@/lib/format";
import type { RecentGame } from "@/lib/game-history";

// One bar per game, oldest on the left, with a line at the average so you
// can see which games beat it
export function ScoreChart({
  games,
  average,
}: {
  // Newest first
  games: RecentGame[];
  average: number;
}) {
  const oldestFirst = games.toReversed();
  const best = Math.max(...games.map((game) => game.score));
  const heightOf = (score: number) => `${(score / best) * 100}%`;

  return (
    <figure>
      <div className="relative h-28 border-b">
        <ol className="flex h-full items-end gap-0.5">
          {oldestFirst.map((game) => {
            const label = `Game ${formatNumber(game.number)}: ${game.score}`;
            return (
              <li
                key={game.id}
                title={label}
                aria-label={label}
                className="flex-1 rounded-t-sm bg-primary"
                style={{ height: heightOf(game.score) }}
              />
            );
          })}
        </ol>
        <div
          className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground"
          style={{ bottom: heightOf(average) }}
          aria-hidden
        />
      </div>
      <figcaption className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-4 border-t-2 border-dashed border-foreground" />
        Average {average}
      </figcaption>
    </figure>
  );
}
