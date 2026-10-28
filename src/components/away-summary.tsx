'use client'

import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import { CheckIcon, CloudArrowUpIcon } from '@phosphor-icons/react'
import { collectAwayProgress } from '@/app/actions'
import { AccountForm } from '@/components/account-form'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { RewardList, RewardRow } from '@/components/reward-list'
import { StatGrid, StatTile } from '@/components/stat-grid'
import { formatDuration, formatNumber } from '@/lib/format'
import type { AwaySummary as Summary } from '@/lib/play'
import {
	AWAY_SHOT_INTERVAL_MS,
	FOCUS_LABELS,
	SKILL_AREAS,
} from '@/lib/progression'

// Collects away progress when the page opens, when you come back to it, and
// every away interval while you're on it with auto mode off. Shows what you
// bowled if a game finished.
export function AwaySummary({ isLoggedIn }: { isLoggedIn: boolean }) {
	const [summary, setSummary] = useState<Summary | null>(null)
	const [isSavingProgress, setIsSavingProgress] = useState(false)

	const collect = useEffectEvent(() => {
		startTransition(async () => {
			const result = await collectAwayProgress()
			if (result) setSummary(result)
		})
	})

	useEffect(() => {
		collect()
		function collectWhenVisible() {
			if (document.visibilityState === 'visible') collect()
		}
		// Switching apps or windows can leave the tab "visible" the whole time,
		// so focus coming back counts as returning too
		document.addEventListener('visibilitychange', collectWhenVisible)
		window.addEventListener('focus', collectWhenVisible)
		const timer = setInterval(collectWhenVisible, AWAY_SHOT_INTERVAL_MS)
		return () => {
			document.removeEventListener('visibilitychange', collectWhenVisible)
			window.removeEventListener('focus', collectWhenVisible)
			clearInterval(timer)
		}
	}, [])

	return (
		<Dialog
			open={summary !== null}
			onOpenChange={(open) => {
				if (!open) setSummary(null)
			}}
			onOpenChangeComplete={(open) => {
				if (!open) setIsSavingProgress(false)
			}}
		>
			{summary && (
				<DialogContent>
					{isSavingProgress ? (
						<AccountForm onBack={() => setIsSavingProgress(false)} />
					) : (
						<>
							<DialogHeader>
								<DialogTitle>Welcome back!</DialogTitle>
								<DialogDescription>
									You kept bowling while you were away.
								</DialogDescription>
							</DialogHeader>
							<StatGrid>
								<StatTile
									label="Time away"
									value={formatDuration(summary.awayMs)}
								/>
								<StatTile
									label="Rewarded time"
									value={formatDuration(summary.rewardedMs)}
								/>
								<StatTile
									label="Games bowled"
									value={formatNumber(summary.games)}
								/>
								<StatTile label="Average score" value={summary.averageScore} />
							</StatGrid>
							{summary.capped && (
								<p>
									Away bowling maxes out at 4 hours, so check back before then
									to keep it going.
								</p>
							)}
							<RewardList>
								{SKILL_AREAS.map((area) => (
									<RewardRow
										key={area}
										label={FOCUS_LABELS[area]}
										amount={`+${formatNumber(summary.xpGained[area])} XP`}
									/>
								))}
							</RewardList>
							{isLoggedIn ? (
								<DialogClose render={<Button size="lg" />}>
									<CheckIcon data-icon="inline-start" weight="bold" />
									Collect
								</DialogClose>
							) : (
								<>
									<p>
										Your progress is only saved in this browser, so clearing
										your browser data would erase it. Make an account to keep it
										safe and bowl on any device.
									</p>
									<Button size="lg" onClick={() => setIsSavingProgress(true)}>
										<CloudArrowUpIcon data-icon="inline-start" weight="bold" />
										Save your progress
									</Button>
									<DialogClose
										render={<Button variant="secondary" size="lg" />}
									>
										<CheckIcon data-icon="inline-start" weight="bold" />
										Collect
									</DialogClose>
								</>
							)}
						</>
					)}
				</DialogContent>
			)}
		</Dialog>
	)
}
