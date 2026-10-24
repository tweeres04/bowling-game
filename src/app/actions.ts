"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { isGameOver } from "@/lib/bowling";
import {
  awayShotsSince,
  playAwayShots,
  playShot,
  summarizeAway,
  type FinishedGame,
  type PlayState,
} from "@/lib/play";
import { getOrCreatePlayer, xpOf, type Player } from "@/lib/player";
import { AWAY_SHOT_INTERVAL_MS } from "@/lib/progression";

function playStateOf(player: Player): PlayState {
  return { rolls: player.rolls, xp: xpOf(player), focus: player.focus };
}

function playerFields(state: PlayState, lastShotAt: Date) {
  return {
    rolls: state.rolls,
    firstBallXp: state.xp.firstBall,
    sparesXp: state.xp.spares,
    lastShotAt,
  };
}

async function savePlay(
  player: Player,
  fields: ReturnType<typeof playerFields>,
  finishedGames: FinishedGame[],
) {
  const updatePlayer = db
    .update(players)
    .set(fields)
    .where(eq(players.id, player.id));
  if (finishedGames.length === 0) return updatePlayer;

  const insertGames = db
    .insert(games)
    .values(finishedGames.map((game) => ({ playerId: player.id, ...game })));
  return db.batch([updatePlayer, insertGames]);
}

// Bowls and saves the shots earned since the player's last one
async function catchUpAwayShots(player: Player, now: Date) {
  const { shots, ...awayTime } = awayShotsSince(player.lastShotAt, now);
  if (shots === 0) return { player, finishedGames: [], awayTime };

  const { state, finishedGames } = playAwayShots(playStateOf(player), shots);
  // Keep the leftover time toward the next away shot, unless the cap ate it
  const lastShotAt = awayTime.capped
    ? now
    : new Date(player.lastShotAt!.getTime() + shots * AWAY_SHOT_INTERVAL_MS);
  const fields = playerFields(state, lastShotAt);
  await savePlay(player, fields, finishedGames);

  return { player: { ...player, ...fields }, finishedGames, awayTime };
}

// Called when the page opens or becomes visible again
export async function collectAwayProgress() {
  const before = await getOrCreatePlayer();
  const { player, finishedGames, awayTime } = await catchUpAwayShots(
    before,
    new Date(),
  );
  refresh();
  return finishedGames.length > 0
    ? summarizeAway(finishedGames, xpOf(before), xpOf(player), awayTime)
    : null;
}

export async function shoot() {
  const now = new Date();
  const { player } = await catchUpAwayShots(await getOrCreatePlayer(), now);
  // Shots queued from fast clicking can land after the game ends
  if (!isGameOver(player.rolls)) {
    const { state, finishedGame } = playShot(playStateOf(player));
    await savePlay(
      player,
      playerFields(state, now),
      finishedGame ? [finishedGame] : [],
    );
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
