// Service Worker for Day Planner PWA & Push Reminders

const CACHE_NAME = 'planner-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming messages from app to trigger background/PWA notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_REMINDER') {
    const { title, body, tag, icon } = event.data;
    
    self.registration.showNotification(title || 'Task Reminder', {
      body: body || 'You have an upcoming task in 5 minutes!',
      icon: icon || '/favicon.ico',
      badge: icon || '/favicon.ico',
      tag: tag || 'planner-reminder',
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      data: event.data,
      actions: [
        { action: 'open', title: 'Open Planner' }
      ]
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
