import 'server-only'
import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { players, sessions } from '@/db/schema'
import { setPlayerProfileOnce, trackEvent } from '@/lib/analytics'

// Named from before sessions, when it held the player ID. Keeping the name
// let existing players carry over.
const SESSION_COOKIE = 'playerId'

// Browsers cap cookie lifetimes at 400 days. The session cookie is re-set on
// every action, so it only expires after 400 days without playing.
export const COOKIE_MAX_AGE = 400 * 24 * 60 * 60

export type Player = typeof players.$inferSelect

// What a visitor sees before their first action creates a player
const NEW_PLAYER = {
	rolls: [],
	firstBallXp: 0,
	sparesXp: 0,
	focus: 'balanced',
	lastShotAt: null,
	email: null,
} satisfies Partial<Player>

async function findSession() {
	const token = (await cookies()).get(SESSION_COOKIE)?.value
	if (!token) return undefined
	const [session] = await db
		.select({ player: players })
		.from(sessions)
		.innerJoin(players, eq(sessions.playerId, players.id))
		.where(eq(sessions.token, token))
	return session && { token, player: session.player }
}

// Cookies can only be set from server actions and route handlers, not
// during render
async function setSessionCookie(token: string) {
	;(await cookies()).set(SESSION_COOKIE, token, {
		maxAge: COOKIE_MAX_AGE,
		httpOnly: true,
		sameSite: 'lax',
	})
}

async function startSession(playerId: string) {
	const token = randomBytes(32).toString('base64url')
	await db.insert(sessions).values({ token, playerId })
	await setSessionCookie(token)
}

// Ends this browser's session and starts a new one. Used whenever who you
// are changes: making an account, logging in, and logging out.
export async function switchSession(playerId: string) {
	const token = (await cookies()).get(SESSION_COOKIE)?.value
	if (token) await db.delete(sessions).where(eq(sessions.token, token))
	await startSession(playerId)
}

export async function getPlayerForDisplay() {
	return (await findSession())?.player ?? NEW_PLAYER
}

// A visitor gets a player on their first action, like a shot or turning on
// auto mode, and a fresh one when they log out
export async function createPlayer() {
	const [player] = await db.insert(players).values({}).returning()
	trackEvent(player.id, 'player_created', { platform: 'web' })
	setPlayerProfileOnce(player.id, { $created: player.createdAt.toISOString() })
	return player
}

// For actions that shouldn't make a player for someone who's only looking,
// like the away check on page load
export async function getPlayer() {
	const session = await findSession()
	if (!session) return undefined
	await setSessionCookie(session.token)
	return session.player
}

export async function getOrCreatePlayer() {
	const existing = await getPlayer()
	if (existing) return existing
	const player = await createPlayer()
	await startSession(player.id)
	return player
}

export function xpOf(player: Pick<Player, 'firstBallXp' | 'sparesXp'>) {
	return { firstBall: player.firstBallXp, spares: player.sparesXp }
}
