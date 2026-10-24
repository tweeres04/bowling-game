// Whole numbers with thousands separators, like "1,350"
export function formatNumber(value: number) {
	return value.toLocaleString('en-US')
}

// The two largest units, like "4h 2m" or "33m 3s"
export function formatDuration(ms: number) {
	const totalSeconds = Math.floor(ms / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	if (hours > 0) return `${hours}h ${minutes}m`
	if (minutes > 0) return `${minutes}m ${seconds}s`
	return `${seconds}s`
}
