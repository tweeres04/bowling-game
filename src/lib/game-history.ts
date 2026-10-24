import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";

export type RecentGame = Awaited<ReturnType<typeof getRecentGames>>[number];

// Newest first, each numbered by where it falls in the player's career
export async function getRecentGames(playerId: string, count: number) {
  const byPlayer = eq(games.playerId, playerId);
  const [recent, totalGames] = await Promise.all([
    db
      .select({ id: games.id, score: games.score, rolls: games.rolls })
      .from(games)
      .where(byPlayer)
      .orderBy(desc(games.id))
      .limit(count),
    db.$count(games, byPlayer),
  ]);
  return recent.map((game, index) => ({ ...game, number: totalGames - index }));
}
