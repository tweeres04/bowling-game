import {
  buildFrames,
  isGameOver,
  pinsStandingForNextRoll,
  rollBall,
} from "@/lib/bowling";
import {
  AWAY_CAP_MS,
  AWAY_SHOT_INTERVAL_MS,
  skillForShot,
  xpAfterGame,
  type Focus,
  type Xp,
} from "@/lib/progression";

export type PlayState = { rolls: number[]; xp: Xp; focus: Focus };

export type FinishedGame = { score: number; rolls: number[] };

// Bowls one shot. Finishing the game banks its XP and returns the game.
export function playShot(state: PlayState) {
  const pinsStanding = pinsStandingForNextRoll(state.rolls);
  const rolls = [
    ...state.rolls,
    rollBall(pinsStanding, skillForShot(state.xp, state.focus, pinsStanding)),
  ];
  if (!isGameOver(rolls)) {
    return { state: { ...state, rolls }, finishedGame: null };
  }
  return {
    state: { ...state, rolls, xp: xpAfterGame(state.xp, state.focus) },
    finishedGame: { score: buildFrames(rolls)[9].score!, rolls },
  };
}

// How many shots you've earned since your last one: one per away interval,
// up to the cap
export function awayShotsSince(lastShotAt: Date | null, now: Date) {
  const awayMs = lastShotAt ? now.getTime() - lastShotAt.getTime() : 0;
  const rewardedMs = Math.min(awayMs, AWAY_CAP_MS);
  return {
    shots: Math.floor(rewardedMs / AWAY_SHOT_INTERVAL_MS),
    awayMs,
    rewardedMs,
    capped: awayMs > AWAY_CAP_MS,
  };
}

export type AwayTime = Omit<ReturnType<typeof awayShotsSince>, "shots">;

// Plays shots back to back, starting new games as needed
export function playAwayShots(state: PlayState, shots: number) {
  let current = state;
  const finishedGames: FinishedGame[] = [];
  for (let shot = 0; shot < shots; shot++) {
    if (isGameOver(current.rolls)) current = { ...current, rolls: [] };
    const result = playShot(current);
    current = result.state;
    if (result.finishedGame) finishedGames.push(result.finishedGame);
  }
  return { state: current, finishedGames };
}

export type AwaySummary = AwayTime & {
  games: number;
  averageScore: number;
  xpGained: Xp;
};

export function summarizeAway(
  finishedGames: FinishedGame[],
  xpBefore: Xp,
  xpAfter: Xp,
  awayTime: AwayTime,
) {
  const total = finishedGames.reduce((sum, game) => sum + game.score, 0);
  return {
    games: finishedGames.length,
    averageScore: Math.round(total / finishedGames.length),
    xpGained: {
      firstBall: xpAfter.firstBall - xpBefore.firstBall,
      spares: xpAfter.spares - xpBefore.spares,
    },
    ...awayTime,
  } satisfies AwaySummary;
}
