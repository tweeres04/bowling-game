import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAccount, findPlayerByEmail, logInToAccount } from '@/lib/account'
import { GOOGLE_STATE_COOKIE, getGoogleEmail } from '@/lib/google-auth'

// Google sends you back here after you pick an account. A Google email that
// matches an account made with a password logs into it, since Google has
// verified the email.
export async function GET(request: Request) {
	const params = new URL(request.url).searchParams
	const cookieStore = await cookies()
	const state = cookieStore.get(GOOGLE_STATE_COOKIE)?.value
	cookieStore.delete(GOOGLE_STATE_COOKIE)

	const code = params.get('code')
	// Cancelling on Google's screen comes back without a code
	if (!code) redirect('/')
	if (!state || params.get('state') !== state) {
		throw new Error('Google sign-in state did not match')
	}

	const email = await getGoogleEmail(request, code)
	const player = await findPlayerByEmail(email)
	if (player) await logInToAccount({ ...player, email }, 'google')
	else await createAccount(email, null, 'google')
	redirect('/')
}
