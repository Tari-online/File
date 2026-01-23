const CACHE_NAME = 'tari-cache-v2.0'; // Update this ID when you make big changes
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/en.html',
  '/manifest.json',
  
  // External Libraries (Cache these to save data/speed)
  'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js',
  'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css',
  
  // Fonts (English & Arabic)
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Marhey:wght@300..700&display=swap',
  'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400..700&display=swap',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap'
];

// 1. INSTALL: Cache Core Assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force this SW to activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATE: Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim(); // Take control of open pages immediately
});

// 3. FETCH: The Smart Logic
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🛑 RULE 1: IGNORE SUPABASE (Always use Network)
    // We never want to cache database calls or we might see old orders.
    if (url.hostname.includes('supabase.co')) {
        return; 
    }

    // 📄 RULE 2: HTML PAGES (Network First -> Fallback to Cache)
    // Try to get the fresh page. If offline, load the cached version.
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => caches.match(event.request)) // Offline? Load cache.
        );
        return;
    }

    // ⚡ RULE 3: STATIC ASSETS (Stale-While-Revalidate)
    // Serve cached image/js immediately (FAST), but update it in the background for next time.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
