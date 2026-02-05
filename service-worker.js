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
// service-worker.js

// Escuchar cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Cerrar la notificación

  // Abrir la app o ponerla en primer plano
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});


