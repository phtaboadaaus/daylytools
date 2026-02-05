const CACHE_NAME = 'daily-tools-v4';

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'calculator.js',
  'checklist.js',
  'counters.js',
  'languages.js', 
  'menu.js',
  'notes.js',
  'notify.js',
  'pomodoro.js',
  'reminders.js',
  'settings.js',
  'timers.js',
  'assets/splash.png',
  'assets/ringtones/eurythmic.mp3',
  'assets/ringtones/ringtone.mp3',
  'assets/ringtones/ringtone30s.mp3',
  'assets/ringtones/twinkle_light.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
