import { Progress } from '@/components/ui/progress'
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
			<ul className="space-y-4 text-sm">
				{SKILL_AREAS.map((area) => {
					const level = levelFromXp(xp[area])
					const levelStartXp = xpForLevel(level)
					const xpIntoLevel = xp[area] - levelStartXp
					const levelCostXp = xpForLevel(level + 1) - levelStartXp

					return (
						<li key={area}>
							<div className="mb-1.5 flex justify-between gap-3">
								<span>
									{FOCUS_LABELS[area]} · Level {level} of {MAX_LEVEL}
									{area === focus && ` (+${FOCUS_BOOST_LEVELS} from focus)`}
								</span>
								<span className="font-mono tabular-nums">
									{formatNumber(xpIntoLevel)} / {formatNumber(levelCostXp)} XP
								</span>
							</div>
							<Progress
								value={(xpIntoLevel / levelCostXp) * 100}
								aria-label={`${FOCUS_LABELS[area]} progress to level ${level + 1}`}
							/>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
