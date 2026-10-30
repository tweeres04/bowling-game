// Only here for push notifications

// Nothing is cached, so a new version can take over right away instead of
// waiting for every open tab to close
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('push', (event) => {
	// Before anything that could fail, so a push that arrives but doesn't show
	// can be told apart from one that never arrives
	const received = fetch('/push-received', { method: 'POST' })
	const { title, body } = event.data.json()
	event.waitUntil(
		Promise.all([
			self.registration.showNotification(title, {
				body,
				icon: '/icons/icon-192.png',
			}),
			received,
		]),
	)
})

// Brings back an open tab if there is one, or opens the game
self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	event.waitUntil(
		Promise.all([
			self.clients.matchAll({ type: 'window' }).then((windows) => {
				const open = windows[0]
				return open ? open.focus() : self.clients.openWindow('/')
			}),
			fetch('/notification-tapped', { method: 'POST' }),
		]),
	)
})
