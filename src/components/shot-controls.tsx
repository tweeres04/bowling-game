"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { autoBowl } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { AUTO_SHOT_INTERVAL_MS } from "@/lib/progression";

// The Shoot or New game form comes in as children, with the auto mode
// toggle beside it and its timer bar underneath
export function ShotControls({ children }: { children: React.ReactNode }) {
  const [autoOn, setAutoOn] = useState(false);
  // Bumped every tick so the timer bar restarts in step with the shots
  const [tick, setTick] = useState(0);
  const [bowling, startBowling] = useTransition();

  // Skips a tick while the last shot is still saving, so a slow server can't
  // pile up a queue of shots
  const bowlIfReady = useEffectEvent(() => {
    setTick((previous) => previous + 1);
    if (bowling) return;
    startBowling(() => autoBowl());
  });

  useEffect(() => {
    if (!autoOn) return;
    const timer = setInterval(bowlIfReady, AUTO_SHOT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoOn]);

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">{children}</div>
        <Button
          size="icon-lg"
          variant={autoOn ? "default" : "secondary"}
          aria-pressed={autoOn}
          aria-label={autoOn ? "Stop auto bowling" : "Start auto bowling"}
          onClick={() => setAutoOn(!autoOn)}
        >
          {autoOn ? <PauseIcon weight="bold" /> : <PlayIcon weight="bold" />}
        </Button>
      </div>
      {autoOn && (
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            key={tick}
            className="h-full origin-left animate-fill-bar bg-primary"
            style={{ animationDuration: `${AUTO_SHOT_INTERVAL_MS}ms` }}
          />
        </div>
      )}
    </div>
  );
}
