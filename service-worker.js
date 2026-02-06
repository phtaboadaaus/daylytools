const CACHE_NAME = 'daily-tools-v6'; // Subimos a v6 para forzar limpieza
// 1. Forzar activación inmediata
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 2. Escuchar mensajes desde la App (timers.js, notify.js, etc.)
// service-worker.js

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, text } = event.data;

        const options = {
            body: text,
            icon: 'assets/favicon-32x32.png',
            badge: 'assets/favicon-16x16.png',
            // Patrón de vibración largo: vibra 1s, para 0.5s, vibra 2s...
            vibrate: [1000, 500, 2000, 500, 1000], 
            tag: 'alarm-notification',
            renotify: true,
            requireInteraction: true, // No desaparece hasta que el usuario la toque
            priority: 2, // Prioridad alta para Android
            data: { url: self.location.origin }
            actions: [
                    { action: 'stop', title: 'DETENER ALARMA' }
                    ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// 3. Qué hacer cuando el usuario toca la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Cierra la notificación

    if (event.action === 'stop') {
        // Aquí podrías enviar un mensaje de vuelta a la app para parar el audio
        console.log('El usuario detuvo la alarma desde la notificación');
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});

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
  if (event.request.url.endsWith('.mp3')) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});





