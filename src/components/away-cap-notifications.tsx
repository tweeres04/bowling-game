'use client'

import {
	startTransition,
	useOptimistic,
	useState,
	useSyncExternalStore,
} from 'react'
import type { PushSubscription } from 'web-push'
import { turnOffAwayCapPush, turnOnAwayCapPush } from '@/app/actions'
import { Switch } from '@/components/ui/switch'
import { AWAY_CAP_HOURS } from '@/lib/progression'

// Support never changes while the page is open
const subscribeToNothing = () => () => {}

async function subscribeToPush(vapidPublicKey: string) {
	await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
	const registration = await navigator.serviceWorker.ready
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: vapidPublicKey,
	})
	return subscription.toJSON() as PushSubscription
}

async function getBrowserSubscription() {
	const registration = await navigator.serviceWorker.getRegistration()
	return (await registration?.pushManager.getSubscription()) ?? null
}

// Whether this browser is subscribed, shared by every switch. Null until the
// check that starts with the page finishes, which is long before anyone can
// open a dialog, so the switch doesn't flip on as it appears.
let isSubscribed: boolean | null = null
const listeners = new Set<() => void>()

function setIsSubscribed(value: boolean) {
	isSubscribed = value
	listeners.forEach((listener) => listener())
}

function subscribeToIsSubscribed(listener: () => void) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

if (typeof window !== 'undefined' && 'PushManager' in window) {
	getBrowserSubscription().then((subscription) =>
		setIsSubscribed(subscription !== null),
	)
}

// The switch shows whether this browser gets notifications, since each of a
// player's devices turns them on separately
export function AwayCapNotifications({
	vapidPublicKey,
	onlyOfferWhenOff = false,
}: {
	vapidPublicKey: string
	// For pitching it outside settings: hidden if this browser already has it
	// on, or can't do it. Stays put after turning it on, so it doesn't vanish
	// from under the player's finger.
	onlyOfferWhenOff?: boolean
}) {
	const isSupported = useSyncExternalStore(
		subscribeToNothing,
		() => 'PushManager' in window,
		() => true,
	)
	const isSubscribedNow = useSyncExternalStore(
		subscribeToIsSubscribed,
		() => isSubscribed,
		() => null,
	)
	const [isOn, setIsOn] = useOptimistic(isSubscribedNow)
	const [isBlocked, setIsBlocked] = useState(false)
	const [wasOnAtStart] = useState(isSubscribedNow)

	function toggle(on: boolean) {
		startTransition(async () => {
			setIsOn(on)
			if (!on) {
				// The switch was only on because this browser has one
				const subscription = (await getBrowserSubscription())!
				await subscription.unsubscribe()
				await turnOffAwayCapPush(subscription.endpoint)
				setIsSubscribed(false)
				return
			}
			try {
				await turnOnAwayCapPush(await subscribeToPush(vapidPublicKey))
				setIsSubscribed(true)
			} catch (error) {
				// The player said no to the browser's permission prompt, now or before
				if (error instanceof DOMException && error.name === 'NotAllowedError') {
					setIsBlocked(true)
					return
				}
				throw error
			}
		})
	}

	if (onlyOfferWhenOff && wasOnAtStart !== false) return null

	return (
		<div>
			<label className="flex items-center justify-between gap-4">
				<span>
					<span className="block font-medium">Tell me when I max out</span>
					<span className="block text-sm text-muted-foreground">
						Get a notification on this device when you&apos;ve been away{' '}
						{AWAY_CAP_HOURS} hours.
					</span>
				</span>
				<Switch
					size="lg"
					checked={isOn ?? false}
					disabled={!isSupported || isOn === null}
					onCheckedChange={toggle}
				/>
			</label>
			{!isSupported && (
				<p className="mt-2 text-sm text-muted-foreground">
					This browser can&apos;t do notifications. On iPhone, add Idle bowling
					to your home screen first.
				</p>
			)}
			{isBlocked && (
				<p className="mt-2 text-sm text-muted-foreground">
					Notifications are blocked. Allow them in your browser&apos;s settings
					for this site, then try again.
				</p>
			)}
		</div>
	)
}
