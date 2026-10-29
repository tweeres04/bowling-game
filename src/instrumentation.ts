export async function register() {
	// The edge runtime can't reach the database
	if (process.env.NEXT_RUNTIME !== 'nodejs') return
	// Fails a deploy that's missing the keys right away, instead of when a
	// player tries to turn notifications on. Not checked where the keys are
	// used, because the build loads those files without them.
	if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
		throw new Error(
			'Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY. Make a pair with `npx web-push generate-vapid-keys`.',
		)
	}
	const { CAP_CHECK_INTERVAL_MS, notifyPlayersAtAwayCap } =
		await import('@/lib/push')
	setInterval(
		() => notifyPlayersAtAwayCap(new Date()).catch(console.error),
		CAP_CHECK_INTERVAL_MS,
	)
}
