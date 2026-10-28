'use client'

import { useActionState, useId, useState } from 'react'
import { CloudArrowUpIcon, SignInIcon } from '@phosphor-icons/react'
import { logIn, signUp } from '@/app/account-actions'
import { GoogleIcon } from '@/components/google-icon'
import { Button } from '@/components/ui/button'
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type AccountFormMode = 'signUp' | 'logIn'

// Takes over the dialog it's shown in, instead of stacking a second dialog
// on top. Back returns to what the dialog was showing before.
export function AccountForm({
	initialMode = 'signUp',
	onBack,
}: {
	initialMode?: AccountFormMode
	onBack: () => void
}) {
	const [mode, setMode] = useState(initialMode)
	const [result, submit, isPending] = useActionState(
		async (
			_previous: { error: string | null; mode: AccountFormMode } | null,
			formData: FormData,
		) => {
			const error = await (mode === 'signUp' ? signUp : logIn)(formData)
			// The page is for a different login now, so load it fresh
			if (!error) window.location.reload()
			return { error, mode }
		},
		null,
	)
	// Switching between sign up and log in hides the other form's error
	const error = result?.mode === mode ? result.error : null
	const emailId = useId()
	const passwordId = useId()

	return (
		<>
			<Button variant="ghost" size="sm" className="self-start" onClick={onBack}>
				Back
			</Button>
			<DialogHeader>
				<DialogTitle>
					{mode === 'signUp' ? 'Save your progress' : 'Log in'}
				</DialogTitle>
				<DialogDescription>
					{mode === 'signUp'
						? 'Make an account to keep your progress safe and bowl on any device.'
						: "Logging in brings back your account's progress. Anything bowled on this device without an account won't be kept."}
				</DialogDescription>
			</DialogHeader>
			<Button
				variant="secondary"
				size="lg"
				nativeButton={false}
				render={<a href="/auth/google" />}
				// The button that opened this is gone, so focus lands here
				autoFocus
			>
				<GoogleIcon className="size-5" />
				Continue with Google
			</Button>
			<p className="text-center text-sm text-muted-foreground">or</p>
			<form action={submit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor={emailId}>Email</Label>
					<Input
						id={emailId}
						name="email"
						type="email"
						autoComplete="email"
						required
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor={passwordId}>Password</Label>
					<Input
						id={passwordId}
						name="password"
						type="password"
						autoComplete={
							mode === 'signUp' ? 'new-password' : 'current-password'
						}
						minLength={mode === 'signUp' ? 8 : undefined}
						required
					/>
				</div>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<Button type="submit" size="lg" disabled={isPending}>
					{mode === 'signUp' ? (
						<>
							<CloudArrowUpIcon data-icon="inline-start" weight="bold" />
							Create account
						</>
					) : (
						<>
							<SignInIcon data-icon="inline-start" weight="bold" />
							Log in
						</>
					)}
				</Button>
			</form>
			{mode === 'signUp' && (
				<p className="text-center text-sm text-muted-foreground">
					By making an account, you agree to the{' '}
					<a
						href="/terms"
						target="_blank"
						className="text-foreground underline"
					>
						terms
					</a>{' '}
					and{' '}
					<a
						href="/privacy"
						target="_blank"
						className="text-foreground underline"
					>
						privacy policy
					</a>
					.
				</p>
			)}
			<p className="text-center text-sm">
				{mode === 'signUp' ? 'Already have an account?' : 'New here?'}{' '}
				<button
					type="button"
					className="font-medium underline"
					onClick={() => setMode(mode === 'signUp' ? 'logIn' : 'signUp')}
				>
					{mode === 'signUp' ? 'Log in' : 'Make an account'}
				</button>
			</p>
		</>
	)
}
