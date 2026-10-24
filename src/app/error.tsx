'use client'

import { useEffect } from 'react'
import { unstable_isUnrecognizedActionError } from 'next/navigation'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

// Catches errors from anything on the page, including server actions fired
// by auto mode and the away check
export default function Error({ error }: { error: unknown }) {
	// After a deploy, an open tab still calls the old build's server actions.
	// Reloading picks up the new build, and auto mode remembers it was on.
	const isOldBuild = unstable_isUnrecognizedActionError(error)

	useEffect(() => {
		if (isOldBuild) window.location.reload()
	}, [isOldBuild])

	if (isOldBuild) return null

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<h2 className="text-lg font-semibold">Something went wrong.</h2>
			<p className="text-sm text-muted-foreground">
				Your progress is saved. Reload and you&apos;ll pick up right where you
				left off.
			</p>
			<Button size="lg" onClick={() => window.location.reload()}>
				<ArrowClockwiseIcon data-icon="inline-start" weight="bold" />
				Reload
			</Button>
		</main>
	)
}
