// Camera angles for the background scene
export const SCENE_VIEWS = ["angled", "side", "behind"] as const;

export type SceneView = (typeof SCENE_VIEWS)[number];

export const SCENE_VIEW_LABELS: Record<SceneView, string> = {
  angled: "Angled",
  side: "Side",
  behind: "Behind",
};
