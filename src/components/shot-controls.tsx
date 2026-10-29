'use client'

import {
	useEffect,
	useEffectEvent,
	useState,
	useSyncExternalStore,
	useTransition,
} from 'react'
import {
	ArrowCounterClockwiseIcon,
	PauseIcon,
	PlayIcon,
} from '@phosphor-icons/react'
import { autoBowl, newGame, setAutoMode } from '@/app/actions'
import { ShootButton } from '@/components/shoot-button'
import { Button } from '@/components/ui/button'
import { AUTO_SHOT_INTERVAL_MS } from '@/lib/progression'

function subscribeToVisibility(onChange: () => void) {
	document.addEventListener('visibilitychange', onChange)
	return () => document.removeEventListener('visibilitychange', onChange)
}

// The Shoot or New game button, with the auto mode toggle beside it and its
// timer bar underneath
export function ShotControls({
	savedAutoOn,
	gameOver,
}: {
	savedAutoOn: boolean
	gameOver: boolean
}) {
	const [autoOn, setAutoOn] = useState(savedAutoOn)
	// Auto mode pauses in a hidden tab, where away bowling takes over, and
	// picks back up when you return
	const visible = useSyncExternalStore(
		subscribeToVisibility,
		() => document.visibilityState === 'visible',
		() => true,
	)
	const running = autoOn && visible
	// Bumped every tick so the timer bar restarts in step with the shots
	const [tick, setTick] = useState(0)
	const [bowling, startBowling] = useTransition()

	// Skips a tick while the last shot is still saving, so a slow server can't
	// pile up a queue of shots
	const bowlIfReady = useEffectEvent(() => {
		setTick((previous) => previous + 1)
		if (bowling) return
		startBowling(() => autoBowl())
	})

	useEffect(() => {
		if (!running) return
		const timer = setInterval(bowlIfReady, AUTO_SHOT_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [running])

	function toggleAuto(on: boolean) {
		setAutoOn(on)
		setAutoMode(on)
	}

	// Shooting by hand means you're taking over. Only saves when it was on, so
	// manual shots don't each call the server.
	function stopAuto() {
		if (autoOn) toggleAuto(false)
	}

	return (
		<div className="w-full space-y-3">
			<div className="flex gap-2">
				<div className="flex-1">
					{gameOver ? (
						<form action={newGame}>
							<Button type="submit" size="lg" className="w-full">
								<ArrowCounterClockwiseIcon
									data-icon="inline-start"
									weight="bold"
								/>
								New game
							</Button>
						</form>
					) : (
						<ShootButton stopAuto={stopAuto} />
					)}
				</div>
				<Button
					size="icon-lg"
					variant={autoOn ? 'default' : 'secondary'}
					aria-pressed={autoOn}
					aria-label={autoOn ? 'Stop auto bowling' : 'Start auto bowling'}
					onClick={() => toggleAuto(!autoOn)}
				>
					{autoOn ? <PauseIcon weight="bold" /> : <PlayIcon weight="bold" />}
				</Button>
			</div>
			{/* Always takes up its height, so turning auto mode on doesn't shift
          the page; the track and bar only show while it's running */}
			<div className="h-1 overflow-hidden rounded-full">
				{running && (
					<div className="h-full bg-muted">
						<div
							key={tick}
							className="h-full origin-left animate-fill-bar bg-primary"
							style={{ animationDuration: `${AUTO_SHOT_INTERVAL_MS}ms` }}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
