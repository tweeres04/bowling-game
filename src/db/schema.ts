import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { PushSubscription } from 'web-push'

export const players = sqliteTable('players', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	// An account is optional. Making one adds these to your current player.
	// Stored lowercase so logins aren't case sensitive.
	email: text().unique(),
	// Null for accounts made with Google
	passwordHash: text(),
	firstBallXp: integer().notNull().default(0),
	sparesXp: integer().notNull().default(0),
	focus: text({ enum: ['balanced', 'firstBall', 'spares'] })
		.notNull()
		.default('balanced'),
	// The game on the scorecard: in progress, or finished until a new one starts
	rolls: text({ mode: 'json' })
		.$type<number[]>()
		.notNull()
		.$defaultFn(() => []),
	// Away progress is earned from here; null until the first shot
	lastShotAt: integer({ mode: 'timestamp_ms' }),
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

// Every finished game, kept for progress history
export const games = sqliteTable(
	'games',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		playerId: text()
			.notNull()
			.references(() => players.id),
		score: integer().notNull(),
		rolls: text({ mode: 'json' }).$type<number[]>().notNull(),
		finishedAt: integer({ mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	// Stats read each player's latest games on every page load, and auto and
	// away bowling add hundreds of games a day
	(table) => [index('games_player_recent').on(table.playerId, table.id)],
)

// One per browser, for anonymous and logged in players alike. The session
// cookie holds the token.
export const sessions = sqliteTable('sessions', {
	token: text().primaryKey(),
	playerId: text()
		.notNull()
		.references(() => players.id),
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

// One per browser that asked to hear when away bowling stops. The endpoint is
// the browser's unique address on its push service.
export const pushSubscriptions = sqliteTable('push_subscriptions', {
	endpoint: text().primaryKey(),
	playerId: text()
		.notNull()
		.references(() => players.id),
	subscription: text({ mode: 'json' }).$type<PushSubscription>().notNull(),
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})
