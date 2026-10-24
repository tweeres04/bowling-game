import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
	url: process.env.DATABASE_URL ?? 'file:local.db',
})

// busy_timeout first so the WAL pragma itself waits for the lock instead of
// failing when another process (dev server, build workers) has the db open
client.executeMultiple('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;')

export const db = drizzle(client, { schema })
