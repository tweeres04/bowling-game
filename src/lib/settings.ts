import "server-only";
import { cookies } from "next/headers";

export const SHOW_SCENE_COOKIE = "showScene";

// The 3D bowler is off unless the player turns it on
export async function getShowScene() {
  return (await cookies()).get(SHOW_SCENE_COOKIE)?.value === "true";
}
