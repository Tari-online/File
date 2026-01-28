const APP_VERSION = 'tari-killswitch-v3';

// 1. INSTALL: Force the browser to kick out the old Service Worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

// 2. ACTIVATE: Delete ANY cache we find. Start fresh.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    })
  );
  return self.clients.claim(); // Take control of all pages immediately
});

// 3. FETCH: Network Only. 
// We explicitly tell the browser NOT to store API responses or HTML in the cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => {
      // Optional: You can return a simple offline page here if you want
      // For now, we just let it fail gracefully if there is absolutely no internet
      return new Response("No Internet Connection");
    })
  );
});
