import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/ssr'
import { newGame } from '@/app/actions'
import { AwaySummary } from '@/components/away-summary'
import { BowlingSceneBackground } from '@/components/bowling-scene'
import { FocusPicker } from '@/components/focus-picker'
import { MixpanelBrowser } from '@/components/mixpanel-browser'
import { GameStats } from '@/components/game-stats'
import { Scorecard } from '@/components/scorecard'
import { SettingsDialog } from '@/components/settings-dialog'
import { ShootButton } from '@/components/shoot-button'
import { ShotControls } from '@/components/shot-controls'
import { ShotOdds } from '@/components/shot-odds'
import { SkillLevels } from '@/components/skill-levels'
import { Button } from '@/components/ui/button'
import { isGameOver, pinsStandingForNextRoll } from '@/lib/bowling'
import { mixpanelToken } from '@/lib/analytics'
import { formatNumber } from '@/lib/format'
import { getRecentGames } from '@/lib/game-history'
import { getPlayerForDisplay, xpOf } from '@/lib/player'
import { getAutoMode, getSceneView, getShowScene } from '@/lib/settings'
import { skillForShot } from '@/lib/progression'
import { STATS_GAMES } from '@/lib/stats'

export async function BowlingGame() {
	const [player, showScene, sceneView, autoMode] = await Promise.all([
		getPlayerForDisplay(),
		getShowScene(),
		getSceneView(),
		getAutoMode(),
	])
	// A visitor who hasn't bowled yet has no player row, so no games
	const { games: recentGames, totalGames } =
		'id' in player
			? await getRecentGames(player.id, STATS_GAMES)
			: { games: [], totalGames: 0 }
	const xp = xpOf(player)
	const gameOver = isGameOver(player.rolls)
	// A finished game is saved the moment it ends, so until you start the
	// next one, the scorecard shows a game that's already counted
	const gameNumber = gameOver ? totalGames : totalGames + 1
	// After the last frame, the next shot is the new game's first ball
	const pinsStanding = gameOver ? 10 : pinsStandingForNextRoll(player.rolls)

	return (
		<div className="flex flex-col items-center gap-8">
			{mixpanelToken && (
				<MixpanelBrowser
					token={mixpanelToken}
					playerId={'id' in player ? player.id : null}
				/>
			)}
			{/* Changes on every shot, including away catch-ups. Not rendering it
          at all when off also skips downloading three.js. */}
			{showScene && (
				<BowlingSceneBackground
					shotKey={player.lastShotAt?.getTime() ?? null}
					pinsDown={player.rolls.at(-1) ?? 0}
					view={sceneView}
				/>
			)}
			<div className="w-full">
				<h2 className="mb-2 text-sm font-semibold">
					Game {formatNumber(gameNumber)}
				</h2>
				<Scorecard rolls={player.rolls} />
			</div>

			<ShotControls savedAutoOn={autoMode}>
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
					<ShootButton />
				)}
			</ShotControls>

			<div className="flex gap-2">
				<FocusPicker focus={player.focus} />
				<ShotOdds
					pinsStanding={pinsStanding}
					skill={skillForShot(xp, player.focus, pinsStanding)}
				/>
				<SettingsDialog
					showScene={showScene}
					sceneView={sceneView}
					accountEmail={player.email}
				/>
			</div>

			<SkillLevels xp={xp} focus={player.focus} />
			<GameStats games={recentGames} />
			<AwaySummary isLoggedIn={player.email !== null} />
		</div>
	)
}

// Shown while the player loads; an empty scorecard holds the layout
export function BowlingGameSkeleton() {
	return (
		<div className="flex flex-col items-center gap-8">
			<div className="w-full">
				{/* Holds the game number's line so the scorecard doesn't jump */}
				<p className="invisible mb-2 text-sm" aria-hidden>
					Game
				</p>
				<Scorecard rolls={[]} />
			</div>
		</div>
	)
}
