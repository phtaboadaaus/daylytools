const CACHE_NAME = 'daily-tools-v2'; // Cambiamos a v2 para forzar actualización

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  // JS
  'calculator.js',
  'checklist.js',
  'counters.js',
  'languages.js', // Corregido "languages"
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
  self.skipWaiting(); // Obliga al nuevo SW a tomar el control
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cacheando archivos...');
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
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Intentar enfocar la app si ya está abierta
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ninguna ventana abierta, abrir la app
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
