"use client";

import dynamic from "next/dynamic";

// Three.js only runs in the browser, and loading it lazily keeps it out of
// the first page load
const BowlingScene = dynamic(() => import("./scene"), { ssr: false });

// Decorative only: a low poly bowler behind the whole page who throws on
// every shot. Dimmed so the UI on top stays readable.
export function BowlingSceneBackground({
  shotKey,
}: {
  shotKey: number | null;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-40"
      aria-hidden
    >
      <BowlingScene shotKey={shotKey} />
    </div>
  );
}
