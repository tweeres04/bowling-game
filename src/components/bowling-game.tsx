import {
  ArrowCounterClockwiseIcon,
  BowlingBallIcon,
} from "@phosphor-icons/react/ssr";
import { newGame, shoot } from "@/app/actions";
import { AwaySummary } from "@/components/away-summary";
import { BowlingSceneBackground } from "@/components/bowling-scene";
import { FocusPicker } from "@/components/focus-picker";
import { GameStats } from "@/components/game-stats";
import { Scorecard } from "@/components/scorecard";
import { SettingsDialog } from "@/components/settings-dialog";
import { ShotControls } from "@/components/shot-controls";
import { ShotOdds } from "@/components/shot-odds";
import { SkillLevels } from "@/components/skill-levels";
import { Button } from "@/components/ui/button";
import { isGameOver, pinsStandingForNextRoll } from "@/lib/bowling";
import { getRecentGames, getStatsWindow } from "@/lib/game-history";
import { getPlayerForDisplay, xpOf } from "@/lib/player";
import { getSceneView, getShowScene } from "@/lib/settings";
import { skillForShot } from "@/lib/progression";

export async function BowlingGame() {
  const [player, statsWindow, showScene, sceneView] = await Promise.all([
    getPlayerForDisplay(),
    getStatsWindow(),
    getShowScene(),
    getSceneView(),
  ]);
  // A visitor who hasn't bowled yet has no player row, so no games
  const recentGames =
    "id" in player ? await getRecentGames(player.id, statsWindow) : [];
  const xp = xpOf(player);
  const gameOver = isGameOver(player.rolls);
  // After the last frame, the next shot is the new game's first ball
  const pinsStanding = gameOver ? 10 : pinsStandingForNextRoll(player.rolls);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Changes on every shot, including away catch-ups. Not rendering it
          at all when off also skips downloading three.js. */}
      {showScene && (
        <BowlingSceneBackground
          shotKey={player.lastShotAt?.getTime() ?? null}
          pinsDown={player.rolls.at(-1) ?? 0}
          view={sceneView}
        />
      )}
      <Scorecard rolls={player.rolls} />

      <ShotControls>
        {gameOver ? (
          <form action={newGame}>
            <Button type="submit" size="lg" className="w-full">
              <ArrowCounterClockwiseIcon
                data-icon="inline-start"
                weight="bold"
              />
              New game
            </Button>
          </form>
        ) : (
          <form action={shoot}>
            <Button type="submit" size="lg" className="w-full">
              <BowlingBallIcon data-icon="inline-start" weight="bold" />
              Shoot
            </Button>
          </form>
        )}
      </ShotControls>

      <div className="flex gap-2">
        <FocusPicker focus={player.focus} />
        <ShotOdds
          pinsStanding={pinsStanding}
          skill={skillForShot(xp, player.focus, pinsStanding)}
        />
        <SettingsDialog showScene={showScene} sceneView={sceneView} />
      </div>

      <SkillLevels xp={xp} focus={player.focus} />
      <GameStats games={recentGames} statsWindow={statsWindow} />
      <AwaySummary />
    </div>
  );
}

// Shown while the player loads; an empty scorecard holds the layout
export function BowlingGameSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8">
      <Scorecard rolls={[]} />
    </div>
  );
}
