import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { players } from "@/db/schema";

const PLAYER_COOKIE = "playerId";

// Browsers cap cookie lifetimes at 400 days; it's re-set on every action
const PLAYER_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export type Player = typeof players.$inferSelect;

// What a visitor sees before their first action creates a player
const NEW_PLAYER = {
  rolls: [],
  firstBallXp: 0,
  sparesXp: 0,
  focus: "balanced",
} satisfies Partial<Player>;

export async function getPlayerForDisplay() {
  const playerId = (await cookies()).get(PLAYER_COOKIE)?.value;
  if (!playerId) return NEW_PLAYER;
  const player = await db.query.players.findFirst({
    where: eq(players.id, playerId),
  });
  return player ?? NEW_PLAYER;
}

// Server actions only, since setting the cookie isn't allowed during render
export async function getOrCreatePlayer() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get(PLAYER_COOKIE)?.value;
  const existing = playerId
    ? await db.query.players.findFirst({ where: eq(players.id, playerId) })
    : undefined;
  const player =
    existing ?? (await db.insert(players).values({}).returning())[0];

  cookieStore.set(PLAYER_COOKIE, player.id, {
    maxAge: PLAYER_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
  });
  return player;
}

export function xpOf(player: Pick<Player, "firstBallXp" | "sparesXp">) {
  return { firstBall: player.firstBallXp, spares: player.sparesXp };
}
