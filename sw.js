const CACHE_NAME = 'tari-app-v1';
const ASSETS = [
  './',
  './index.html',
  './ar.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400..700&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];

// 1. Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Fetch Assets (Serve from Cache if available)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
