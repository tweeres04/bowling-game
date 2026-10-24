import type { Metadata } from 'next'
import Image from 'next/image'
import { BowlingScenePoster } from '@/components/bowling-scene'

// Only here to be screenshotted into the share image by
// scripts/generate-og-image.sh, so keep it out of search
export const metadata: Metadata = { robots: { index: false } }

export default function OgScene() {
	return (
		<div className="relative h-[630px] w-[1200px] overflow-hidden bg-background">
			<div className="absolute inset-0">
				<BowlingScenePoster />
			</div>
			<div className="absolute top-14 left-16">
				<h1 className="flex items-center gap-5 text-7xl font-semibold">
					<Image
						src="/icons/icon-192.png"
						alt=""
						width={96}
						height={96}
						className="[image-rendering:pixelated]"
					/>
					Idle bowling
				</h1>
			</div>
		</div>
	)
}
