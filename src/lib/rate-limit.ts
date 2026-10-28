import 'server-only'

type Bucket = { count: number; resetAt: number }

// In memory is fine on a single server, and resetting on deploy is fine too
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, max: number, windowMs: number) {
	const now = Date.now()

	// Keep the map from growing without limit under sustained abuse
	if (buckets.size > 10_000) {
		for (const [k, bucket] of buckets) {
			if (now > bucket.resetAt) buckets.delete(k)
		}
	}

	const bucket = buckets.get(key)
	if (!bucket || now > bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs })
		return true
	}

	bucket.count++
	return bucket.count <= max
}
