'use server'

import { eq } from 'drizzle-orm'
import { refresh } from 'next/cache'
import { cookies } from 'next/headers'
import { db } from '@/db'
import { games, players } from '@/db/schema'
import { isGameOver } from '@/lib/bowling'
import {
	awayShotsSince,
	playAwayShots,
	playShot,
	summarizeAway,
	type FinishedGame,
	type PlayState,
} from '@/lib/play'
import {
	COOKIE_MAX_AGE,
	getOrCreatePlayer,
	getPlayer,
	xpOf,
	type Player,
} from '@/lib/player'
import {
	AUTO_MODE_COOKIE,
	SCENE_VIEW_COOKIE,
	SHOW_ODDS_COOKIE,
	SHOW_SCENE_COOKIE,
} from '@/lib/settings'
import { SCENE_VIEWS, type SceneView } from '@/lib/scene-view'
import { setPlayerProfile, trackEvent } from '@/lib/analytics'
import { summarizeGames } from '@/lib/stats'
import { AWAY_SHOT_INTERVAL_MS, levelFromXp } from '@/lib/progression'

function playStateOf(player: Player): PlayState {
	return { rolls: player.rolls, xp: xpOf(player), focus: player.focus }
}

function playerFields(state: PlayState, lastShotAt: Date) {
	return {
		rolls: state.rolls,
		firstBallXp: state.xp.firstBall,
		sparesXp: state.xp.spares,
		lastShotAt,
	}
}

async function savePlay(
	player: Player,
	fields: ReturnType<typeof playerFields>,
	finishedGames: FinishedGame[],
) {
	const updatePlayer = db
		.update(players)
		.set(fields)
		.where(eq(players.id, player.id))
	if (finishedGames.length === 0) return updatePlayer

	const insertGames = db
		.insert(games)
		.values(finishedGames.map((game) => ({ playerId: player.id, ...game })))
	return db.batch([updatePlayer, insertGames])
}

// Bowls and saves the shots earned since the player's last one
async function catchUpAwayShots(player: Player, now: Date) {
	const { shots, ...awayTime } = awayShotsSince(player.lastShotAt, now)
	if (shots === 0) return { player, finishedGames: [], awayTime }

	const { state, finishedGames } = playAwayShots(playStateOf(player), shots)
	// Keep the leftover time toward the next away shot, unless the cap ate it
	const lastShotAt = awayTime.capped
		? now
		: new Date(player.lastShotAt!.getTime() + shots * AWAY_SHOT_INTERVAL_MS)
	const fields = playerFields(state, lastShotAt)
	await savePlay(player, fields, finishedGames)

	return { player: { ...player, ...fields }, finishedGames, awayTime }
}

// Called when the page opens or becomes visible again
export async function collectAwayProgress() {
	const before = await getPlayer()
	// Someone who hasn't played yet has nothing to collect
	if (!before) return null
	const { player, finishedGames, awayTime } = await catchUpAwayShots(
		before,
		new Date(),
	)
	refresh()
	// Short gaps, like the check every away interval while the page is open,
	// don't finish a game and don't count as coming back
	if (finishedGames.length === 0) return null

	const xp = xpOf(player)
	const summary = summarizeAway(finishedGames, xpOf(before), xp, awayTime)
	trackEvent(player.id, 'away_progress_collected', {
		away_minutes: Math.round(summary.awayMs / 60_000),
		is_capped: summary.capped,
		games_completed: summary.games,
		average_score: summary.averageScore,
		first_ball_xp_gained: summary.xpGained.firstBall,
		spares_xp_gained: summary.xpGained.spares,
		first_ball_level: levelFromXp(xp.firstBall),
		spares_level: levelFromXp(xp.spares),
		focus: player.focus,
	})
	setPlayerProfile(player.id, {
		first_ball_level: levelFromXp(xp.firstBall),
		spares_level: levelFromXp(xp.spares),
		focus: player.focus,
	})
	return summary
}

// Who bowled the shot that finished a game you were there for. Games bowled
// while away are counted in away_progress_collected instead.
type FinishedBy = 'manual' | 'auto'

async function bowl(finishedBy: FinishedBy) {
	const now = new Date()
	const { player } = await catchUpAwayShots(await getOrCreatePlayer(), now)
	// Shots queued from fast clicking can land after the game ends
	if (!isGameOver(player.rolls)) {
		const { state, finishedGame } = playShot(playStateOf(player))
		await savePlay(
			player,
			playerFields(state, now),
			finishedGame ? [finishedGame] : [],
		)
		if (finishedGame) {
			const stats = summarizeGames([finishedGame])
			trackEvent(player.id, 'game_completed', {
				score: finishedGame.score,
				strikes: stats.strikesPerGame,
				spares: stats.sparesPerGame,
				finished_by: finishedBy,
				first_ball_level: levelFromXp(state.xp.firstBall),
				spares_level: levelFromXp(state.xp.spares),
				focus: state.focus,
			})
		}
	}
	refresh()
}

export async function shoot() {
	await bowl('manual')
}

// One tick of auto mode. A finished game stays on the scorecard for a tick
// before the next one starts.
export async function autoBowl() {
	const player = await getOrCreatePlayer()
	if (isGameOver(player.rolls)) return newGame()
	return bowl('auto')
}

export async function newGame() {
	const player = await getOrCreatePlayer()
	await db.update(players).set({ rolls: [] }).where(eq(players.id, player.id))
	refresh()
}

export async function setFocus(formData: FormData) {
	const focus = formData.get('focus')
	if (focus !== 'balanced' && focus !== 'firstBall' && focus !== 'spares') {
		throw new Error(`Unknown focus: ${focus}`)
	}
	const player = await getOrCreatePlayer()
	await db.update(players).set({ focus }).where(eq(players.id, player.id))
	trackEvent(player.id, 'focus_changed', {
		focus,
		previous_focus: player.focus,
	})
	setPlayerProfile(player.id, { focus })
	refresh()
}

// No refresh: the play button already shows the change, and the cookie only
// matters on the next visit
export async function setAutoMode(on: boolean) {
	if (typeof on !== 'boolean') throw new Error(`Unknown setting: ${on}`)
	const cookieStore = await cookies()
	cookieStore.set(AUTO_MODE_COOKIE, String(on), {
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
	})
	const player = await getOrCreatePlayer()
	trackEvent(player.id, 'auto_mode_toggled', { is_on: on })
}

export async function setShowScene(show: boolean) {
	if (typeof show !== 'boolean') throw new Error(`Unknown setting: ${show}`)
	const cookieStore = await cookies()
	cookieStore.set(SHOW_SCENE_COOKIE, String(show), {
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
	})
	refresh()
}

export async function setShowOdds(show: boolean) {
	if (typeof show !== 'boolean') throw new Error(`Unknown setting: ${show}`)
	const cookieStore = await cookies()
	cookieStore.set(SHOW_ODDS_COOKIE, String(show), {
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
	})
	refresh()
}

export async function setSceneView(view: SceneView) {
	if (!SCENE_VIEWS.includes(view)) throw new Error(`Unknown view: ${view}`)
	const cookieStore = await cookies()
	cookieStore.set(SCENE_VIEW_COOKIE, view, {
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
	})
	refresh()
}
