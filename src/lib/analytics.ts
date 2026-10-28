import 'server-only'
import Mixpanel from 'mixpanel'
import { clientIp } from '@/lib/request'

// Only production sets the token, so local play stays out of the real data
export const mixpanelToken = process.env.MIXPANEL_TOKEN
const mixpanel = mixpanelToken ? Mixpanel.init(mixpanelToken) : null

type Properties = Record<string, string | number | boolean>

// Everything here is tied to the player ID, which stays the same when you make
// an account. Every call passes the player's IP, or Mixpanel would place
// everyone wherever the server is. None of it is awaited by callers: sending
// happens in the background while the action returns, and `next start` stays
// running, so nothing gets cut off.

export async function trackEvent(
	playerId: string,
	event: string,
	properties: Properties,
) {
	if (!mixpanel) return
	const ip = await clientIp()
	mixpanel.track(event, { distinct_id: playerId, ip, ...properties })
}

// Current state on the player's profile, like levels and focus
export async function setPlayerProfile(
	playerId: string,
	properties: Properties,
) {
	if (!mixpanel) return
	mixpanel.people.set(playerId, properties, { $ip: await clientIp() })
}

// Facts that never change, like when the player started
export async function setPlayerProfileOnce(
	playerId: string,
	properties: Properties,
) {
	if (!mixpanel) return
	mixpanel.people.set_once(playerId, properties, { $ip: await clientIp() })
}
