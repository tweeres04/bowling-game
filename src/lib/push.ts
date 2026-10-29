import 'server-only'
import { and, eq, gt, lte } from 'drizzle-orm'
import webpush, { WebPushError } from 'web-push'
import { db } from '@/db'
import { players, pushSubscriptions } from '@/db/schema'
import { AWAY_CAP_HOURS, AWAY_CAP_MS } from '@/lib/progression'

export const CAP_CHECK_INTERVAL_MS = 5 * 60 * 1000

// Where Chrome, Firefox, Safari, and Edge subscriptions point. The server
// sends to whatever endpoint is saved, so anything else could aim it at
// addresses on the home network.
const PUSH_SERVICE_HOSTS = [
	/^fcm\.googleapis\.com$/,
	/^updates\.push\.services\.mozilla\.com$/,
	/\.push\.apple\.com$/,
	/\.notify\.windows\.com$/,
]

export function isPushServiceEndpoint(endpoint: string) {
	const url = new URL(endpoint)
	return (
		url.protocol === 'https:' &&
		PUSH_SERVICE_HOSTS.some((host) => host.test(url.hostname))
	)
}

// Checked when the server starts, in instrumentation.ts
const vapidDetails = {
	subject: 'https://idle-bowling.tweeres.com',
	publicKey: process.env.VAPID_PUBLIC_KEY!,
	privateKey: process.env.VAPID_PRIVATE_KEY!,
}

// Pushes to everyone who hit the away cap since the last check. Checking a
// window instead of saving who's been told means a player whose window passes
// while the server is down doesn't hear about it, which is fine.
export async function notifyPlayersAtAwayCap(now: Date) {
	const capReachedBy = now.getTime() - AWAY_CAP_MS
	const atCap = await db
		.select({
			endpoint: pushSubscriptions.endpoint,
			subscription: pushSubscriptions.subscription,
		})
		.from(pushSubscriptions)
		.innerJoin(players, eq(pushSubscriptions.playerId, players.id))
		.where(
			and(
				gt(players.lastShotAt, new Date(capReachedBy - CAP_CHECK_INTERVAL_MS)),
				lte(players.lastShotAt, new Date(capReachedBy)),
			),
		)

	const payload = JSON.stringify({
		title: 'Your lane is idle',
		body: `You've been away ${AWAY_CAP_HOURS} hours, so you've stopped earning shots. Come see how your games went!`,
	})
	await Promise.all(
		atCap.map(async ({ endpoint, subscription }) => {
			try {
				await webpush.sendNotification(subscription, payload, {
					vapidDetails,
				})
			} catch (error) {
				// The browser dropped the subscription, so stop sending to it
				if (
					error instanceof WebPushError &&
					(error.statusCode === 404 || error.statusCode === 410)
				) {
					await db
						.delete(pushSubscriptions)
						.where(eq(pushSubscriptions.endpoint, endpoint))
					return
				}
				throw error
			}
		}),
	)
}
