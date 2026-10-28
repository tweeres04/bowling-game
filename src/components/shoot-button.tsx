'use client'

import { startTransition, useRef, useState } from 'react'
import { BowlingBallIcon } from '@phosphor-icons/react'
import { shoot } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { MANUAL_SHOT_COOLDOWN_MS } from '@/lib/progression'

// Shoots on press and keeps shooting while held. The form action still works
// without JavaScript.
export function ShootButton() {
	const [coolingDown, setCoolingDown] = useState(false)
	const cooldownTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

	// Each shot restarts the cooldown, so the button stays disabled the whole
	// time it's held instead of flickering between shots
	function shootAndCoolDown() {
		clearTimeout(cooldownTimer.current)
		setCoolingDown(true)
		cooldownTimer.current = setTimeout(
			() => setCoolingDown(false),
			MANUAL_SHOT_COOLDOWN_MS,
		)
		startTransition(() => shoot())
	}

	// Listens on the window, since the finger can slide off the button before
	// letting go. Holding through the end of a game sends a few extra shots,
	// which the server ignores.
	function shootWhileHeld(event: React.PointerEvent) {
		// Only the main button, so right-clicking doesn't shoot
		if (event.button !== 0) return
		shootAndCoolDown()
		const timer = setInterval(shootAndCoolDown, MANUAL_SHOT_COOLDOWN_MS)
		const listeners = new AbortController()
		function stopHolding() {
			clearInterval(timer)
			listeners.abort()
		}
		window.addEventListener('pointerup', stopHolding, listeners)
		window.addEventListener('pointercancel', stopHolding, listeners)
	}

	return (
		<form
			action={shoot}
			onSubmit={(event) => {
				event.preventDefault()
				shootAndCoolDown()
			}}
		>
			{/* focusableWhenDisabled uses aria-disabled instead of the disabled
          attribute, which would swallow the pointer events that end a hold */}
			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={coolingDown}
				focusableWhenDisabled
				onPointerDown={shootWhileHeld}
				// Pointer presses already shot on the way down, so only keyboard
				// clicks (detail 0) go on to submit the form
				onClick={(event) => {
					if (event.detail > 0) event.preventDefault()
				}}
			>
				<BowlingBallIcon data-icon="inline-start" weight="bold" />
				Shoot
			</Button>
		</form>
	)
}
