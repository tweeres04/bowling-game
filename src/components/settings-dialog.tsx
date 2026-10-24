"use client";

import { startTransition, useOptimistic } from "react";
import { GearSixIcon } from "@phosphor-icons/react";
import { setShowScene } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function SettingsDialog({ showScene }: { showScene: boolean }) {
  // Flips right away while the setting saves on the server
  const [showSceneNow, setShowSceneNow] = useOptimistic(showScene);

  function toggleScene(show: boolean) {
    startTransition(async () => {
      setShowSceneNow(show);
      await setShowScene(show);
    });
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
      </DialogContent>
    </Dialog>
  );
}
