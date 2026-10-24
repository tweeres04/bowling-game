'use client'

import dynamic from 'next/dynamic'
import type { SceneView } from '@/lib/scene-view'
import type { Pose } from './scene'

// Three.js only runs in the browser, and loading it lazily keeps it out of
// the first page load
const BowlingScene = dynamic(() => import('./scene'), { ssr: false })

// Decorative only: a low poly bowler behind the whole page who throws on
// every shot. Dimmed so the UI on top stays readable.
export function BowlingSceneBackground({
	shotKey,
	pinsDown,
	view,
}: {
	shotKey: number | null
	pinsDown: number
	view: SceneView
}) {
	return (
		<div
			className="pointer-events-none fixed inset-0 -z-10 opacity-40"
			aria-hidden
		>
			<BowlingScene shotKey={shotKey} pinsDown={pinsDown} view={view} />
		</div>
	)
}

// The share image's moment: the bowler in his follow through, and a full
// rack of pins flying
const POSTER_POSE: Pose = { bowler: 1.5, pins: 3.35 }

// A still, full brightness version of the scene, for the share image
export function BowlingScenePoster() {
	return (
		<BowlingScene
			shotKey={null}
			pinsDown={10}
			view="angled"
			posed={POSTER_POSE}
		/>
	)
}
