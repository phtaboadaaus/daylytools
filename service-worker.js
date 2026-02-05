const CACHE_NAME = 'daily-tools-v6'; // Subimos a v6 para forzar limpieza

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
