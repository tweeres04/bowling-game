import 'server-only'
import { cookies } from 'next/headers'

import { SCENE_VIEWS, type SceneView } from '@/lib/scene-view'

export const SHOW_SCENE_COOKIE = 'showScene'
export const SCENE_VIEW_COOKIE = 'sceneView'
export const AUTO_MODE_COOKIE = 'autoMode'
export const SHOW_ODDS_COOKIE = 'showOdds'

// The 3D bowler is off unless the player turns it on
export async function getShowScene() {
	return (await cookies()).get(SHOW_SCENE_COOKIE)?.value === 'true'
}

export async function getSceneView(): Promise<SceneView> {
	const saved = (await cookies()).get(SCENE_VIEW_COOKIE)?.value
	return SCENE_VIEWS.find((view) => view === saved) ?? 'angled'
}

// Auto mode comes back on if it was on when you left
export async function getAutoMode() {
	return (await cookies()).get(AUTO_MODE_COOKIE)?.value === 'true'
}

// The odds show under the Shoot button unless the player hides them
export async function getShowOdds() {
	return (await cookies()).get(SHOW_ODDS_COOKIE)?.value !== 'false'
}
