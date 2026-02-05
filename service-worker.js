const CACHE_NAME = 'daily-tools-v3'; // Versión actualizada

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  // JS
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
  // Assets
  'assets/splash.png',
  // Ringtones
  'assets/ringtones/eurythmic.mp3',
  'assets/ringtones/ringtone.mp3',
  'assets/ringtones/ringtone30s.mp3',
  'assets/ringtones/twinkle_light.mp3'
];

// Instalación y almacenamiento en caché
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Actualizando caché a v3...');
      return cache.addAll(ASSETS);
    })
  );
});

// Limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Reclamar clientes inmediatamente
  return self.clients.claim();
});

// Estrategia de respuesta
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Gestión de clics en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Si el usuario toca el botón "Cerrar/Entendido" o la notificación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
