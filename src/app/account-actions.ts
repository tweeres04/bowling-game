'use server'

import argon2 from 'argon2'
import {
	createAccount,
	findPlayerByEmail,
	logInToAccount,
	normalizeEmail,
} from '@/lib/account'
import { trackEvent } from '@/lib/analytics'
import { createPlayer, getPlayer, switchSession } from '@/lib/player'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/request'

// Each returns an error to show in the form, or null when it worked. The page
// reloads after, since it's now showing a different login.

const TOO_MANY_TRIES = 'Whoa, slow down. Give it a few minutes and try again.'
const USE_GOOGLE =
	'You made your account with Google, so continue with Google instead.'

function credentialsFrom(formData: FormData) {
	return {
		email: normalizeEmail(String(formData.get('email'))),
		password: String(formData.get('password')),
	}
}

export async function signUp(formData: FormData) {
	if (!rateLimit(`signUp:${await clientIp()}`, 10, 60 * 60 * 1000)) {
		return TOO_MANY_TRIES
	}
	const { email, password } = credentialsFrom(formData)
	if (!email.includes('@')) return "That email doesn't look right."
	if (password.length < 8) return 'Your password needs at least 8 characters.'
	if (password.length > 256) return 'Your password needs to be shorter.'

	const existing = await findPlayerByEmail(email)
	if (existing) {
		return existing.passwordHash
			? 'You already have an account with that email. Try logging in?'
			: USE_GOOGLE
	}
	await createAccount(email, await argon2.hash(password), 'password')
	return null
}

export async function logIn(formData: FormData) {
	if (!rateLimit(`logIn:${await clientIp()}`, 10, 15 * 60 * 1000)) {
		return TOO_MANY_TRIES
	}
	const { email, password } = credentialsFrom(formData)
	const player = await findPlayerByEmail(email)
	if (player && !player.passwordHash) return USE_GOOGLE
	// Hashing is slow, so skip it for long passwords nobody signed up with
	const isMatch =
		player?.passwordHash && password.length <= 256
			? await argon2.verify(player.passwordHash, password)
			: false
	if (!player || !isMatch) {
		return "That email and password don't match. Try again?"
	}
	await logInToAccount({ ...player, email }, 'password')
	return null
}

// Starts a fresh player, so whoever uses this device next doesn't bowl as you
export async function logOut() {
	const before = await getPlayer()
	if (before) trackEvent(before.id, 'logged_out', {})
	const player = await createPlayer()
	await switchSession(player.id)
}
