const CACHE_NAME = 'daily-tools-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',

  // JS
  '/calculator.js',
  '/checklist.js',
  '/counters.js',
  '/timer.js',
  '/lenguages.js',
  '/menu.js',
  '/notes.js',
  '/notify.js',
  '/pomodoro.js',
  '/reminders.js',
  '/settings.js',
  '/timers.js',

  // Assets
  '/assets/splash.png',

  // Ringtones (añade todos los que tengas)
  '/assets/ringtones/eurythmic.mp3',
  '/assets/ringtones/ringtone.mp3',
  '/assets/ringtones/ringtone30s.mp3',
  '/assets/ringtones/twinkle_light.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});

// Este código va dentro de service-worker.js
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Cierra el banner al tocarlo
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Si la app está abierta, ponla en foco
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si está cerrada, ábrela
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});



