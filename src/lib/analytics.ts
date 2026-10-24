import 'server-only'
import { headers } from 'next/headers'
import Mixpanel from 'mixpanel'

// Only production sets the token, so local play stays out of the real data
export const mixpanelToken = process.env.MIXPANEL_TOKEN
const mixpanel = mixpanelToken ? Mixpanel.init(mixpanelToken) : null

type Properties = Record<string, string | number | boolean>

// The proxy puts the player's address first. Without it, Mixpanel would place
// everyone wherever the server is.
async function playerIp() {
	return (await headers()).get('x-forwarded-for')?.split(',')[0].trim()
}

// Everything here is tied to the anonymous player ID from the player cookie,
// since there's no login. None of it is awaited by callers: sending happens in
// the background while the action returns, and `next start` stays running, so
// nothing gets cut off.

export async function trackEvent(
	playerId: string,
	event: string,
	properties: Properties,
) {
	if (!mixpanel) return
	const ip = await playerIp()
	mixpanel.track(event, { distinct_id: playerId, ip, ...properties })
}

// Current state on the player's profile, like levels and focus
export async function setPlayerProfile(
	playerId: string,
	properties: Properties,
) {
	if (!mixpanel) return
	mixpanel.people.set(playerId, properties, { $ip: await playerIp() })
}

// Facts that never change, like when the player started
export async function setPlayerProfileOnce(
	playerId: string,
	properties: Properties,
) {
	if (!mixpanel) return
	mixpanel.people.set_once(playerId, properties, { $ip: await playerIp() })
}
