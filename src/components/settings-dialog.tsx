'use client'

import { startTransition, useOptimistic, useState, useTransition } from 'react'
import {
	CloudArrowUpIcon,
	GearSixIcon,
	SignInIcon,
} from '@phosphor-icons/react'
import { logOut } from '@/app/account-actions'
import { setSceneView, setShowScene } from '@/app/actions'
import { AccountForm, type AccountFormMode } from '@/components/account-form'
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
	accountEmail,
}: {
	showScene: boolean
	sceneView: SceneView
	accountEmail: string | null
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

	// Which account form replaces the settings, if any
	const [accountFormMode, setAccountFormMode] =
		useState<AccountFormMode | null>(null)
	const [isLoggingOut, startLogOut] = useTransition()
	function logOutAndReload() {
		startLogOut(async () => {
			await logOut()
			window.location.reload()
		})
	}

	function pickView(view: SceneView) {
		startTransition(async () => {
			setSceneViewNow(view)
			await setSceneView(view)
		})
	}

	return (
		<Dialog
			onOpenChangeComplete={(open) => {
				if (!open) setAccountFormMode(null)
			}}
		>
			<DialogTrigger
				render={
					<Button variant="secondary" size="icon" aria-label="Settings" />
				}
			>
				<GearSixIcon weight="bold" />
			</DialogTrigger>
			<DialogContent>
				{accountFormMode ? (
					<AccountForm
						initialMode={accountFormMode}
						onBack={() => setAccountFormMode(null)}
					/>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Settings</DialogTitle>
						</DialogHeader>
						<div>
							<p className="mb-2 font-medium">Account</p>
							{accountEmail ? (
								<>
									<p className="mb-2 text-sm text-muted-foreground">
										Logged in as {accountEmail}
									</p>
									<Button
										variant="secondary"
										disabled={isLoggingOut}
										onClick={logOutAndReload}
									>
										Log out
									</Button>
								</>
							) : (
								<>
									<p className="mb-2 text-sm text-muted-foreground">
										Make an account to keep your progress safe and bowl on any
										device.
									</p>
									<div className="flex flex-col gap-2 sm:flex-row">
										<Button onClick={() => setAccountFormMode('signUp')}>
											<CloudArrowUpIcon
												data-icon="inline-start"
												weight="bold"
											/>
											Save your progress
										</Button>
										<Button
											variant="secondary"
											onClick={() => setAccountFormMode('logIn')}
										>
											<SignInIcon data-icon="inline-start" weight="bold" />
											Log in
										</Button>
									</div>
								</>
							)}
						</div>
						<label className="flex items-center justify-between gap-4">
							<span>
								<span className="block font-medium">
									Bowler in the background
								</span>
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
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
