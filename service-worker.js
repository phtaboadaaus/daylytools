const CACHE_NAME = 'daily-tools-v6'; // Subimos a v6 para forzar limpieza
// 1. Forzar activación inmediata
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 2. Escuchar mensajes desde la App (timers.js, notify.js, etc.)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, text } = event.data;

        const options = {
            body: text,
            icon: 'assets/favicon-32x32.png',
            badge: 'assets/favicon-16x16.png',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'alarm-notification',
            renotify: true,
            requireInteraction: true,
            data: { url: self.location.origin } // Para abrir la app al tocar
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// 3. Qué hacer cuando el usuario toca la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});

const ASSETS = [
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
  'assets/splash.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Instalando caché v6 (sin audios para evitar bloqueos)...');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  return self.clients.claim();
});

// Estrategia: Los audios (.mp3) SIEMPRE van por red, el resto por cache
self.addEventListener('fetch', event => {
  // Omitir archivos de audio para que no se bloqueen en caché
  if (event.request.url.indexOf('.mp3') > -1) {
    return; // Deja que el navegador lo maneje normalmente
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // 1. Si está en caché, lo devolvemos
      if (response) return response;

      // 2. Si no está, intentamos ir a la red
      return fetch(event.request).then(fetchRes => {
        // Si la respuesta es válida, la devolvemos
        return fetchRes;
      }).catch(err => {
        // 3. FALLBACK: Si falla la red (offline) y es una página, mostrar index
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});




