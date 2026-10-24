import { Progress, ProgressLabel } from '@/components/ui/progress'
import { formatNumber } from '@/lib/format'
import {
	FOCUS_BOOST_LEVELS,
	FOCUS_LABELS,
	levelFromXp,
	MAX_LEVEL,
	SKILL_AREAS,
	xpForLevel,
	type Focus,
	type Xp,
} from '@/lib/progression'

export function SkillLevels({ xp, focus }: { xp: Xp; focus: Focus }) {
	return (
		<div className="w-full max-w-sm">
			<h2 className="mb-3 text-sm font-semibold">Skill</h2>
			<ul className="space-y-5 text-sm">
				{SKILL_AREAS.map((area) => {
					const level = levelFromXp(xp[area])
					const levelStartXp = xpForLevel(level)
					const xpIntoLevel = xp[area] - levelStartXp
					const levelCostXp = xpForLevel(level + 1) - levelStartXp
					const levelProgress = xpIntoLevel / levelCostXp
					// Counts levels, not XP: the top levels cost so much that an XP
					// based bar would barely move for months
					const overallProgress = (level + levelProgress) / MAX_LEVEL

					return (
						<li key={area}>
							<Progress value={levelProgress * 100} className="gap-y-1.5">
								<ProgressLabel>
									{FOCUS_LABELS[area]} · Lvl {level}
									{area === focus && ` (+${FOCUS_BOOST_LEVELS} from focus)`}
								</ProgressLabel>
								{/* Not ProgressValue: that one shows the bar's percentage */}
								<span className="ml-auto font-mono tabular-nums">
									{`${formatNumber(xpIntoLevel)} / ${formatNumber(levelCostXp)} XP`}
								</span>
							</Progress>
							<Progress
								tone="muted"
								value={overallProgress * 100}
								aria-label={`${FOCUS_LABELS[area]} progress to level ${MAX_LEVEL}`}
								size="sm"
								className="mt-0.5"
							/>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
