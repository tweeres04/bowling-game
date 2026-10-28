import 'server-only'
import { normalizeEmail } from '@/lib/account'

// Holds a random value through the trip to Google and back, so a sign-in
// can only finish in the browser that started it
export const GOOGLE_STATE_COOKIE = 'googleState'

const CALLBACK_PATH = '/auth/google/callback'

function requiredEnv(name: string) {
	const value = process.env[name]
	if (!value) throw new Error(`${name} not found`)
	return value
}

// Must exactly match a redirect URI on the Google OAuth client. Behind the
// proxy, the request's own URL isn't the public one.
function redirectUri(request: Request) {
	return process.env.NODE_ENV === 'production'
		? `https://idle-bowling.tweeres.com${CALLBACK_PATH}`
		: new URL(CALLBACK_PATH, request.url).toString()
}

export function googleSignInUrl(request: Request, state: string) {
	const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
	url.searchParams.set('client_id', requiredEnv('GOOGLE_CLIENT_ID'))
	url.searchParams.set('redirect_uri', redirectUri(request))
	url.searchParams.set('response_type', 'code')
	url.searchParams.set('scope', 'openid email')
	url.searchParams.set('state', state)
	return url.toString()
}

// Trades the code from the callback for Google's ID token and returns the
// verified email. The token comes straight from Google over HTTPS, so reading
// it without checking the signature is safe. Who it was issued for, and
// whether Google verified the email, still get checked.
export async function getGoogleEmail(request: Request, code: string) {
	const clientId = requiredEnv('GOOGLE_CLIENT_ID')
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
			redirect_uri: redirectUri(request),
			grant_type: 'authorization_code',
		}),
	})
	if (!response.ok) {
		throw new Error(`Google token exchange failed: ${await response.text()}`)
	}
	const { id_token: idToken } = (await response.json()) as { id_token: string }
	const payload = JSON.parse(
		Buffer.from(idToken.split('.')[1], 'base64url').toString(),
	) as { aud: string; email?: string; email_verified?: boolean }

	if (payload.aud !== clientId || !payload.email_verified || !payload.email) {
		throw new Error('Google sign-in returned no verified email')
	}
	return normalizeEmail(payload.email)
}
