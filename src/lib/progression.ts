export type SkillArea = 'firstBall' | 'spares'

export type Xp = Record<SkillArea, number>

export const SKILL_AREAS: SkillArea[] = ['firstBall', 'spares']

// Balanced splits XP evenly and boosts nothing
export type Focus = SkillArea | 'balanced'

export const FOCUSES: Focus[] = ['balanced', 'firstBall', 'spares']

export const FOCUS_LABELS: Record<Focus, string> = {
	balanced: 'Balanced',
	firstBall: 'First ball',
	spares: 'Spares',
}

export const XP_PER_GAME = 100

// Level 100 would take infinite XP, so 99 is the real top
export const MAX_LEVEL = 99

// How often auto mode bowls a shot
export const AUTO_SHOT_INTERVAL_MS = 4000

// Shoot waits this long between shots, tapped or held, so manual shooting
// tops out at 4 shots a second
export const MANUAL_SHOT_COOLDOWN_MS = 250

// While you're away (tab closed, hidden, or auto mode off) you still bowl,
// 10x slower than auto mode, for up to 4 hours
export const AWAY_SHOT_INTERVAL_MS = AUTO_SHOT_INTERVAL_MS * 10
export const AWAY_CAP_MS = 4 * 60 * 60 * 1000

// Share of each game's XP that goes to the area you're focusing on
export const FOCUS_SHARE = 0.75

// Extra levels in your focus area while you bowl
export const FOCUS_BOOST_LEVELS = 5

// XP at which a skill is halfway from beginner to pro. Skill approaches pro
// but never reaches it, so each level costs more XP than the last.
const HALFWAY_XP = 100_000

// Levels run 0 (first-timer) to 100 (pro); each is 1% of the way there
const PRO_LEVEL = 100

function xpShare(area: SkillArea, focus: Focus) {
	if (focus === 'balanced') return 0.5
	return area === focus ? FOCUS_SHARE : 1 - FOCUS_SHARE
}

export function xpAfterGame(xp: Xp, focus: Focus): Xp {
	return {
		firstBall: xp.firstBall + XP_PER_GAME * xpShare('firstBall', focus),
		spares: xp.spares + XP_PER_GAME * xpShare('spares', focus),
	}
}

// 0 is beginner odds, 1 is pro odds
function skillFromXp(xp: number) {
	return xp / (xp + HALFWAY_XP)
}

// Both level formulas divide whole numbers only, so level boundaries don't
// drift by floating point rounding
export function levelFromXp(xp: number) {
	return Math.floor((PRO_LEVEL * xp) / (xp + HALFWAY_XP))
}

// Total XP needed to reach a level
export function xpForLevel(level: number) {
	return Math.ceil((HALFWAY_XP * level) / (PRO_LEVEL - level))
}

// A full rack uses first-ball skill (including the 10th frame's fill balls);
// anything less is a spare attempt
export function skillAreaForShot(pinsStanding: number): SkillArea {
	return pinsStanding === 10 ? 'firstBall' : 'spares'
}

export function skillForShot(xp: Xp, focus: Focus, pinsStanding: number) {
	const area = skillAreaForShot(pinsStanding)
	const boost = area === focus ? FOCUS_BOOST_LEVELS / PRO_LEVEL : 0
	// Capped at pro level; blending past 1 would produce negative odds
	return Math.min(1, skillFromXp(xp[area]) + boost)
}
