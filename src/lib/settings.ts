import "server-only";
import { cookies } from "next/headers";

import { SCENE_VIEWS, type SceneView } from "@/lib/scene-view";

export const SHOW_SCENE_COOKIE = "showScene";
export const SCENE_VIEW_COOKIE = "sceneView";

// The 3D bowler is off unless the player turns it on
export async function getShowScene() {
  return (await cookies()).get(SHOW_SCENE_COOKIE)?.value === "true";
}

export async function getSceneView(): Promise<SceneView> {
  const saved = (await cookies()).get(SCENE_VIEW_COOKIE)?.value;
  return SCENE_VIEWS.find((view) => view === saved) ?? "angled";
}
