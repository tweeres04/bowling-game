// Camera angles for the background scene
export const SCENE_VIEWS = ["side", "behind"] as const;

export type SceneView = (typeof SCENE_VIEWS)[number];

export const SCENE_VIEW_LABELS: Record<SceneView, string> = {
  side: "Side",
  behind: "Behind",
};
