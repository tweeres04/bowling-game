import {
  ArrowCounterClockwiseIcon,
  BowlingBallIcon,
} from "@phosphor-icons/react/ssr";
import { newGame, shoot } from "@/app/actions";
import { AwaySummary } from "@/components/away-summary";
import { FocusPicker } from "@/components/focus-picker";
import { Scorecard } from "@/components/scorecard";
import { ShotControls } from "@/components/shot-controls";
import { ShotOdds } from "@/components/shot-odds";
import { SkillLevels } from "@/components/skill-levels";
import { Button } from "@/components/ui/button";
import { isGameOver, pinsStandingForNextRoll } from "@/lib/bowling";
import { getPlayerForDisplay, xpOf } from "@/lib/player";
import { skillForShot } from "@/lib/progression";

export async function BowlingGame() {
  const player = await getPlayerForDisplay();
  const xp = xpOf(player);
  const gameOver = isGameOver(player.rolls);
  // After the last frame, the next shot is the new game's first ball
  const pinsStanding = gameOver ? 10 : pinsStandingForNextRoll(player.rolls);

  return (
    <div className="flex flex-col items-center gap-8">
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
      </div>

      <SkillLevels xp={xp} focus={player.focus} />
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
