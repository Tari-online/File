// 1. Force Immediate Update
const APP_VERSION = 'network-only-v1';

// INSTALL: Skip waiting and take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // <--- This kills the old "Zombie" SW instantly
});

// ACTIVATE: Delete ALL old caches to free up space and remove "Yellow Truck"
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          console.log('Deleting old cache:', cache);
          return caches.delete(cache); // <--- Nukes the old cache
        })
      );
    })
  );
  return self.clients.claim(); // <--- Controls the page immediately without reload
});

// FETCH: Network Only (Pass-through)
self.addEventListener('fetch', (event) => {
  // Simply pass the request to the internet. 
  // If offline, it shows the browser's standard "No Internet" dino.
  event.respondWith(fetch(event.request));
});
