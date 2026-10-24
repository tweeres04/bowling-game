'use client'

import { useEffect } from 'react'
import mixpanel from 'mixpanel-browser'

// Records sessions and puts browser details on the player's profile. Game
// events are tracked on the server, so nothing here tracks events itself.
export function MixpanelBrowser({
	token,
	playerId,
}: {
	token: string
	// A first time visitor has no player until the away check creates one
	playerId: string | null
}) {
	useEffect(() => {
		mixpanel.init(token, {
			// Sent through our own domain so ad blockers don't drop it
			api_host: '/mp',
			autocapture: false,
			track_pageview: false,
			record_sessions_percent: 100,
			// Nothing on the page is private, so record it as it looks
			record_mask_all_text: false,
			record_mask_all_inputs: false,
			record_block_selector: '',
			record_collect_fonts: true,
		})
	}, [token])

	useEffect(() => {
		if (!playerId) return
		// Links this browser, and its recordings, to the server's events
		mixpanel.identify(playerId)
		// Also adds the browser and operating system to the profile
		mixpanel.people.set({
			is_installed_app: matchMedia('(display-mode: standalone)').matches,
		})
		mixpanel.people.set_once({
			$initial_referrer: mixpanel.get_property('$initial_referrer'),
			$initial_referring_domain: mixpanel.get_property(
				'$initial_referring_domain',
			),
		})
	}, [playerId])

	return null
}
