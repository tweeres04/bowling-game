'use client'

import { useState } from 'react'
import { BowlingBallIcon } from '@phosphor-icons/react'
import { shoot } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { MANUAL_SHOT_COOLDOWN_MS } from '@/lib/progression'

export function ShootButton() {
	const [coolingDown, setCoolingDown] = useState(false)

	function startCooldown() {
		setCoolingDown(true)
		setTimeout(() => setCoolingDown(false), MANUAL_SHOT_COOLDOWN_MS)
	}

	return (
		<form action={shoot} onSubmit={startCooldown}>
			<Button type="submit" size="lg" className="w-full" disabled={coolingDown}>
				<BowlingBallIcon data-icon="inline-start" weight="bold" />
				Shoot
			</Button>
		</form>
	)
}
