import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GOOGLE_STATE_COOKIE, googleSignInUrl } from '@/lib/google-auth'

// "Continue with Google" links here, which sends you to Google's sign-in
export async function GET(request: Request) {
	const state = crypto.randomUUID()
	;(await cookies()).set(GOOGLE_STATE_COOKIE, state, {
		maxAge: 10 * 60,
		httpOnly: true,
		sameSite: 'lax',
	})
	redirect(googleSignInUrl(request, state))
}
