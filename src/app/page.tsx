import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { BowlingGame, BowlingGameSkeleton } from '@/components/bowling-game'

export default function Home() {
	return (
		<main className="space-y-10 px-4 pt-2 pb-20 max-w-md mx-auto">
			<h1 className="flex items-center gap-3 text-3xl font-semibold">
				{/* Pixel art, so scale it crisp instead of blurry */}
				<Image
					src="/icons/icon-192.png"
					alt=""
					width={48}
					height={48}
					className="[image-rendering:pixelated]"
				/>
				Idle bowling
			</h1>
			<Suspense fallback={<BowlingGameSkeleton />}>
				<BowlingGame />
			</Suspense>
			<footer className="space-y-1 text-center text-sm text-muted-foreground">
				<p>
					By{' '}
					<a href="https://tweeres.ca" className="text-foreground underline">
						Tyler Weeres
					</a>
				</p>
				<p className="space-x-5">
					<Link href="/privacy" className="text-foreground underline">
						Privacy
					</Link>
					<Link href="/terms" className="text-foreground underline">
						Terms
					</Link>
				</p>
			</footer>
		</main>
	)
}
