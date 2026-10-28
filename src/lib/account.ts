import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { players } from '@/db/schema'
import { setPlayerProfile, trackEvent } from '@/lib/analytics'
import {
	createPlayer,
	getPlayer,
	switchSession,
	type Player,
} from '@/lib/player'

type SignInMethod = 'password' | 'google'

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase()
}

export function findPlayerByEmail(email: string) {
	return db.query.players.findFirst({ where: eq(players.email, email) })
}

// The account keeps the progress on this device, unless it already belongs
// to another account. Then the new account starts fresh.
export async function createAccount(
	email: string,
	passwordHash: string | null,
	method: SignInMethod,
) {
	const current = await getPlayer()
	const player = current && !current.email ? current : await createPlayer()
	await db
		.update(players)
		.set({ email, passwordHash })
		.where(eq(players.id, player.id))
	await switchSession(player.id)
	trackEvent(player.id, 'account_created', { method })
	setPlayerProfile(player.id, { $email: email })
}

// Switches this browser to the account's player. Whatever was bowled here
// without an account is left behind.
export async function logInToAccount(
	player: Player & { email: string },
	method: SignInMethod,
) {
	await switchSession(player.id)
	trackEvent(player.id, 'logged_in', { method })
	setPlayerProfile(player.id, { $email: player.email })
}
