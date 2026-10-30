import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { games } from '@/db/schema'

export type RecentGame = Awaited<ReturnType<typeof getRecentGames>>[number]

export async function countGames(playerId: string) {
	return db.$count(games, eq(games.playerId, playerId))
}

// Newest first, each numbered by where it falls in the player's career
export async function getRecentGames(
	playerId: string,
	count: number,
	totalGames: number,
) {
	const recent = await db
		.select({ id: games.id, score: games.score, rolls: games.rolls })
		.from(games)
		.where(eq(games.playerId, playerId))
		.orderBy(desc(games.id))
		.limit(count)
	return recent.map((game, index) => ({
		...game,
		number: totalGames - index,
	}))
}
