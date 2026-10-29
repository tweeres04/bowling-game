// Only here for push notifications

self.addEventListener('push', (event) => {
	const { title, body } = event.data.json()
	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: '/icons/icon-192.png',
		}),
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
