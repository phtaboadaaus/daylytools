const CACHE_NAME = 'daily-tools-v5'; // Subimos a v5 para limpiar errores previos

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

// 1. Instalación rápida
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Instalando caché v5...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activación y limpieza profunda
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Borrando caché antigua:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  return self.clients.claim();
});

// 3. Estrategia Network-First para asegurar que el audio y JS se actualicen
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 4. Gestión de clics profesional
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Si el usuario hace clic, intentamos traer la app al frente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
