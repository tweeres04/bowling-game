import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactLink, LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Terms of service · Idle bowling' }

export default function TermsPage() {
	return (
		<LegalPage title="Terms of service" updated="October 28, 2026">
			<p>
				These terms are the deal for playing Idle bowling, a free game made by
				Tyler Weeres in Victoria, British Columbia, Canada. By playing, you
				agree to them. Questions? Email <ContactLink />.
			</p>

			<h2>Playing the game</h2>
			<p>
				The game is free, and it&apos;s here for fun. Please don&apos;t try to
				break it, overload it, or get around how it works, like scripting
				requests to the server to rack up XP. Auto mode and away bowling are the
				intended way to idle.
			</p>

			<h2>Your account</h2>
			<p>
				Accounts are optional. If you make one, use an email address that&apos;s
				yours, and keep your password to yourself. You&apos;re responsible for
				what happens on your account.
			</p>

			<h2>Your progress</h2>
			<p>
				We work to keep your progress safe, but we can&apos;t promise it will
				never be lost. The game will keep changing: we may rebalance levels and
				odds, change features, reset progress if we have to, or shut the game
				down. Your progress has no money value.
			</p>

			<h2>Ending things</h2>
			<p>
				You can stop playing any time, and email us to delete your account. We
				may suspend or delete accounts that break these terms.
			</p>

			<h2>No guarantees</h2>
			<p>
				The game is provided as is, without any warranties. To the extent the
				law allows, we&apos;re not liable for any losses that come from using
				it, or from not being able to use it.
			</p>

			<h2>The legal bits</h2>
			<p>
				These terms are governed by the laws of British Columbia and Canada. If
				they change, we&apos;ll update this page and the date at the top, and
				playing after that means you accept the new terms. Our{' '}
				<Link href="/privacy">privacy policy</Link> explains what we collect.
			</p>
		</LegalPage>
	)
}
