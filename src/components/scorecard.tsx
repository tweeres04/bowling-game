import { buildFrames, rollMarks } from '@/lib/bowling'

export function Scorecard({ rolls }: { rolls: number[] }) {
	return (
		<div className="grid w-full grid-cols-[repeat(9,minmax(0,1fr))_minmax(0,1.5fr)] border-l border-t border-foreground">
			{buildFrames(rolls).map((frame, frameIndex) => {
				const isTenth = frameIndex === 9
				const marks = rollMarks(frame.rolls)
				// A strike sits in the right-hand box, like a real scorecard
				const boxes = isTenth
					? [marks[0], marks[1], marks[2]]
					: marks[0] === 'X'
						? [undefined, 'X']
						: [marks[0], marks[1]]

				return (
					<div
						key={frameIndex}
						className="flex flex-col border-b border-r border-foreground"
					>
						<p className="border-b border-foreground text-center text-xs">
							{frameIndex + 1}
						</p>
						<div className="flex justify-end">
							{boxes.map((mark, boxIndex) => (
								<span
									key={boxIndex}
									className="flex size-7 items-center justify-center border-b border-l border-foreground font-mono text-sm sm:size-9"
								>
									{mark}
								</span>
							))}
						</div>
						<p className="flex h-10 items-center justify-center font-mono text-lg">
							{frame.score}
						</p>
					</div>
				)
			})}
		</div>
	)
}
