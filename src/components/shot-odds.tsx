import { shotOdds } from '@/lib/bowling'

export function ShotOdds({
	pinsStanding,
	skill,
}: {
	pinsStanding: number
	skill: number
}) {
	const odds = shotOdds(pinsStanding, skill)
	const highestOdds = Math.max(...odds)
	const clearLabel = pinsStanding === 10 ? 'Strike' : 'Spare'
	// Most pins at the top, so the strike or spare leads the list
	const rows = odds.map((chance, pins) => ({ pins, chance })).reverse()

	return (
		<div className="w-full">
			<h2 className="mb-2 text-sm font-semibold">
				Odds for your next shot ({pinsStanding}{' '}
				{pinsStanding === 1 ? 'pin' : 'pins'} standing)
			</h2>
			{/* Always 11 rows tall, the most a full rack needs, so the page
			    doesn't jump as pins fall */}
			<ul className="grid grid-rows-11 gap-1.5">
				{rows.map(({ pins, chance }) => (
					<li
						key={pins}
						className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm"
					>
						<span>
							{pins === pinsStanding
								? clearLabel
								: `${pins} ${pins === 1 ? 'pin' : 'pins'}`}
						</span>
						<span className="h-2">
							<span
								className="block h-full rounded-r-[4px] bg-primary"
								style={{ width: `${(chance / highestOdds) * 100}%` }}
							/>
						</span>
						<span className="text-right font-mono tabular-nums">
							{Math.round(chance * 100)}%
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}
