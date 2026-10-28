import 'server-only'
import { headers } from 'next/headers'

// nginx proxy manager sets x-forwarded-for, and the first entry is the client
export async function clientIp() {
	return (await headers()).get('x-forwarded-for')?.split(',')[0].trim()
}
