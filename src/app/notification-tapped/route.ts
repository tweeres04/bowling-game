import { trackEvent } from '@/lib/analytics'
import { getPlayer } from '@/lib/player'

// The service worker posts here when a notification is tapped. Its requests
// carry the session cookie, so this is whoever plays in that browser now.
export async function POST() {
	const player = await getPlayer()
	if (player) trackEvent(player.id, 'away_cap_notification_tapped', {})
	return new Response(null, { status: 204 })
}
