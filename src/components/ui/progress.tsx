'use client'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cn } from 'cn'

// Muted is for a bar that sits under a main one and shouldn't compete with it
const INDICATOR_TONES = {
	primary: 'bg-primary',
	muted: 'bg-muted-foreground',
}

// Set on the track, not the root, so a label passed as children keeps its
// own height
const TRACK_SIZES = {
	default: 'h-1',
	sm: 'h-0.5',
}

function Progress({
	className,
	children,
	value,
	tone = 'primary',
	size = 'default',
	...props
}: ProgressPrimitive.Root.Props & {
	tone?: keyof typeof INDICATOR_TONES
	size?: keyof typeof TRACK_SIZES
}) {
	return (
		<ProgressPrimitive.Root
			value={value}
			data-slot="progress"
			className={cn('flex flex-wrap gap-3', className)}
			{...props}
		>
			{children}
			<ProgressTrack className={TRACK_SIZES[size]}>
				<ProgressIndicator className={INDICATOR_TONES[tone]} />
			</ProgressTrack>
		</ProgressPrimitive.Root>
	)
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
	return (
		<ProgressPrimitive.Track
			className={cn(
				'relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted',
				className,
			)}
			data-slot="progress-track"
			{...props}
		/>
	)
}

function ProgressIndicator({
	className,
	...props
}: ProgressPrimitive.Indicator.Props) {
	return (
		<ProgressPrimitive.Indicator
			data-slot="progress-indicator"
			className={cn('h-full bg-primary transition-all', className)}
			{...props}
		/>
	)
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
	return (
		<ProgressPrimitive.Label
			className={cn('text-sm font-medium', className)}
			data-slot="progress-label"
			{...props}
		/>
	)
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
	return (
		<ProgressPrimitive.Value
			className={cn(
				'ml-auto text-sm text-muted-foreground tabular-nums',
				className,
			)}
			data-slot="progress-value"
			{...props}
		/>
	)
}

export {
	Progress,
	ProgressTrack,
	ProgressIndicator,
	ProgressLabel,
	ProgressValue,
}
