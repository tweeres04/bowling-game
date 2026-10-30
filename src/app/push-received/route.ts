import { trackEvent } from '@/lib/analytics'
import { getPlayer } from '@/lib/player'

// The service worker posts here when a push arrives, before showing it. Its
// requests carry the session cookie, so this is whoever plays in that browser now.
export async function POST() {
	const player = await getPlayer()
	if (player) trackEvent(player.id, 'away_cap_notification_received', {})
	return new Response(null, { status: 204 })
}
