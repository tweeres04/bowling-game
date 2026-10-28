import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactLink, LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Privacy policy · Idle bowling' }

export default function PrivacyPage() {
	return (
		<LegalPage title="Privacy policy" updated="October 28, 2026">
			<p>
				Idle bowling is made by Tyler Weeres in Victoria, British Columbia,
				Canada. This page explains what we collect when you play, why, and what
				you can do about it. Questions? Email <ContactLink />.
			</p>

			<h2>What we collect</h2>
			<ul>
				<li>
					<strong>Your game:</strong> your scores, finished games, XP, focus,
					and when you last bowled, so your progress is there when you come
					back.
				</li>
				<li>
					<strong>Your account, if you make one:</strong> your email address,
					and your password stored as a scrambled hash that we can&apos;t turn
					back into your password. If you continue with Google, we only get your
					email address from Google.
				</li>
				<li>
					<strong>Cookies:</strong> one that keeps you logged in and connected
					to your progress, a few that remember your settings (like the 3D
					bowler and auto mode), and a short-lived one during Google sign-in. No
					advertising cookies.
				</li>
				<li>
					<strong>How you use the game:</strong> we use Mixpanel to see how
					people play, like when games finish and which focus you pick. This
					includes your browser and device type, your rough location based on
					your IP address, and recordings of how you use the site, like what you
					tap and how the page looked. Recordings never include your password,
					but can show your email address if it&apos;s on screen.
				</li>
			</ul>

			<h2>How we use it</h2>
			<p>
				To run the game, keep you logged in, and figure out how to make the game
				better. We don&apos;t sell your information, and we don&apos;t use it
				for ads.
			</p>

			<h2>Who else sees it</h2>
			<ul>
				<li>
					<strong>Mixpanel</strong> stores the usage information and recordings
					described above, and your email address if you make an account, in the
					United States.
				</li>
				<li>
					<strong>Google</strong> knows you signed in to Idle bowling, if you
					choose to continue with Google.
				</li>
			</ul>
			<p>
				Everything else stays on our own server in Canada. We&apos;d only share
				it with anyone else if the law required us to.
			</p>

			<h2>How long we keep it</h2>
			<p>
				We keep your progress and account for as long as the game is running, so
				you can come back any time. If you&apos;d like it deleted sooner, just
				ask.
			</p>

			<h2>Your choices</h2>
			<p>
				Email <ContactLink /> and we&apos;ll send you a copy of what we have
				about you, fix anything that&apos;s wrong, or delete your account and
				progress. Clearing your browser&apos;s cookies also disconnects that
				browser from your progress, unless you&apos;ve made an account.
			</p>

			<h2>Kids</h2>
			<p>
				Idle bowling isn&apos;t made for children under 13, and we don&apos;t
				knowingly collect their information. If you think a child has made an
				account, email us and we&apos;ll delete it.
			</p>

			<h2>Changes</h2>
			<p>
				If this policy changes, we&apos;ll update this page and the date at the
				top. See also our <Link href="/terms">terms of service</Link>.
			</p>
		</LegalPage>
	)
}
