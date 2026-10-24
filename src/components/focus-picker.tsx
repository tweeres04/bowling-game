'use client'

import { useState } from 'react'
import {
	BowlingBallIcon,
	CrosshairIcon,
	ScalesIcon,
	type Icon,
} from '@phosphor-icons/react'
import { setFocus } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	FOCUS_BOOST_LEVELS,
	FOCUS_LABELS,
	FOCUS_SHARE,
	FOCUSES,
	XP_PER_GAME,
	type Focus,
} from '@/lib/progression'

const FOCUS_ICONS: Record<Focus, Icon> = {
	balanced: ScalesIcon,
	firstBall: BowlingBallIcon,
	spares: CrosshairIcon,
}

export function FocusPicker({ focus }: { focus: Focus }) {
	const [open, setOpen] = useState(false)
	const FocusIcon = FOCUS_ICONS[focus]

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button variant="secondary" />}>
				<FocusIcon data-icon="inline-start" weight="bold" />
				{FOCUS_LABELS[focus]}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>What are you focused on?</DialogTitle>
					<DialogDescription>
						You earn {XP_PER_GAME} XP every game. Pick a focus and it gets{' '}
						{FOCUS_SHARE * 100}% of that, plus {FOCUS_BOOST_LEVELS} bonus levels
						while you bowl. Balanced splits your XP evenly, with no bonus.
					</DialogDescription>
				</DialogHeader>
				<form
					action={setFocus}
					onSubmit={() => setOpen(false)}
					className="grid gap-2"
				>
					{FOCUSES.map((option) => {
						const OptionIcon = FOCUS_ICONS[option]
						return (
							<Button
								key={option}
								type="submit"
								name="focus"
								value={option}
								variant={option === focus ? 'default' : 'secondary'}
								aria-pressed={option === focus}
							>
								<OptionIcon data-icon="inline-start" weight="bold" />
								{FOCUS_LABELS[option]}
							</Button>
						)
					})}
				</form>
			</DialogContent>
		</Dialog>
	)
}
