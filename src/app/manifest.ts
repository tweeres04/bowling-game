import type { MetadataRoute } from 'next'

// The dark theme's --background, so the splash screen and status bar blend
// into the app
export const APP_BACKGROUND = '#0a0f1a'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Idle bowling',
		short_name: 'Idle bowling',
		description: 'An idle bowling game',
		start_url: '/',
		display: 'standalone',
		background_color: APP_BACKGROUND,
		theme_color: APP_BACKGROUND,
		icons: [
			{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
			{
				src: '/icons/icon-maskable-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	}
}
