'use client'

import { startTransition, useOptimistic } from 'react'
import { GearSixIcon } from '@phosphor-icons/react'
import { setSceneView, setShowScene } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
	SCENE_VIEW_LABELS,
	SCENE_VIEWS,
	type SceneView,
} from '@/lib/scene-view'

export function SettingsDialog({
	showScene,
	sceneView,
}: {
	showScene: boolean
	sceneView: SceneView
}) {
	// Both flip right away while the setting saves on the server
	const [showSceneNow, setShowSceneNow] = useOptimistic(showScene)
	const [sceneViewNow, setSceneViewNow] = useOptimistic(sceneView)

	function toggleScene(show: boolean) {
		startTransition(async () => {
			setShowSceneNow(show)
			await setShowScene(show)
		})
	}

	function pickView(view: SceneView) {
		startTransition(async () => {
			setSceneViewNow(view)
			await setSceneView(view)
		})
	}

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="secondary" size="icon" aria-label="Settings" />
				}
			>
				<GearSixIcon weight="bold" />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>
				<label className="flex items-center justify-between gap-4">
					<span>
						<span className="block font-medium">Bowler in the background</span>
						<span className="block text-sm text-muted-foreground">
							A 3D bowler who throws on every shot. Uses a bit more battery.
						</span>
					</span>
					<Switch
						size="lg"
						checked={showSceneNow}
						onCheckedChange={toggleScene}
					/>
				</label>
				<div role="group" aria-labelledby="scene-view-label">
					<p id="scene-view-label" className="mb-2 font-medium">
						Camera
					</p>
					<div className="flex gap-2">
						{SCENE_VIEWS.map((view) => (
							<Button
								key={view}
								variant={view === sceneViewNow ? 'default' : 'secondary'}
								aria-pressed={view === sceneViewNow}
								disabled={!showSceneNow}
								onClick={() => pickView(view)}
							>
								{SCENE_VIEW_LABELS[view]}
							</Button>
						))}
					</div>
					{!showSceneNow && (
						<p className="mt-2 text-sm text-muted-foreground">
							Turn on the bowler to pick a camera.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
