// Dev helper: pretend every local player last shot N hours ago (default 5),
// so the next page load shows the welcome back dialog.
// Usage: npm run dev:away -- [hours]
import { createClient } from '@libsql/client'

const hours = Number(process.argv[2] ?? 5)
const client = createClient({
	url: process.env.DATABASE_URL ?? 'file:local.db',
})
const lastShotAt = Date.now() - hours * 60 * 60 * 1000
const result = await client.execute({
	sql: 'UPDATE players SET lastShotAt = ?',
	args: [lastShotAt],
})
console.log(
	`Set ${result.rowsAffected} player(s) to ${hours}h away. Refresh the page.`,
)
