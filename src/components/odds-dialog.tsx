'use client'

import { ChartBarHorizontalIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

export function OddsDialog({
	description,
	children,
}: {
	description: string
	children: React.ReactNode
}) {
	return (
		<Dialog>
			<DialogTrigger render={<Button variant="secondary" />}>
				<ChartBarHorizontalIcon data-icon="inline-start" weight="bold" />
				Odds
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Odds for your next shot</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	)
}
