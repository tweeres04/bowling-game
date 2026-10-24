import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	reactCompiler: true,
	// Mixpanel's browser SDK sends here, so ad blockers don't drop it. The
	// proxy passes the player's forwarded IP through, so locations stay right.
	async rewrites() {
		return [
			{
				source: '/mp/:path*',
				destination: 'https://api-js.mixpanel.com/:path*',
			},
		]
	},
	turbopack: {
		rules: {
			'*.css': {
				loaders: ['@tailwindcss/turbopack'],
				as: '*.css',
			},
		},
	},
}

export default nextConfig
