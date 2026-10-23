"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import {
  buildFrames,
  isGameOver,
  pinsStandingForNextRoll,
  rollBall,
} from "@/lib/bowling";
import { getOrCreatePlayer, xpOf } from "@/lib/player";
import { skillForShot, xpAfterGame } from "@/lib/progression";

export async function shoot() {
  const player = await getOrCreatePlayer();
  // Shots queued from fast clicking can land after the game ends
  if (isGameOver(player.rolls)) return;

  const xp = xpOf(player);
  const pinsStanding = pinsStandingForNextRoll(player.rolls);
  const rolls = [
    ...player.rolls,
    rollBall(pinsStanding, skillForShot(xp, player.focus, pinsStanding)),
  ];

  if (isGameOver(rolls)) {
    const newXp = xpAfterGame(xp, player.focus);
    await db.batch([
      db
        .update(players)
        .set({
          rolls,
          firstBallXp: newXp.firstBall,
          sparesXp: newXp.spares,
        })
        .where(eq(players.id, player.id)),
      db.insert(games).values({
        playerId: player.id,
        score: buildFrames(rolls)[9].score!,
        rolls,
      }),
    ]);
  } else {
    await db.update(players).set({ rolls }).where(eq(players.id, player.id));
  }
  refresh();
}

// One tick of auto mode. A finished game stays on the scorecard for a tick
// before the next one starts.
export async function autoBowl() {
  const player = await getOrCreatePlayer();
  if (isGameOver(player.rolls)) return newGame();
  return shoot();
}

export async function newGame() {
  const player = await getOrCreatePlayer();
  await db.update(players).set({ rolls: [] }).where(eq(players.id, player.id));
  refresh();
}

export async function setFocus(formData: FormData) {
  const focus = formData.get("focus");
  if (focus !== "balanced" && focus !== "firstBall" && focus !== "spares") {
    throw new Error(`Unknown focus: ${focus}`);
  }
  const player = await getOrCreatePlayer();
  await db.update(players).set({ focus }).where(eq(players.id, player.id));
  refresh();
}
