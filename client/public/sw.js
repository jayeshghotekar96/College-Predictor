const CACHE_NAME = 'cap-predictor-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/data/cutoffs.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // @ts-ignore
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // @ts-ignore
  if (event.request.method !== 'GET') return;
  
  // @ts-ignore
  event.respondWith(
    // @ts-ignore
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background to update the cache
        // @ts-ignore
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              // @ts-ignore
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }
      
      // @ts-ignore
      return fetch(event.request).then((networkResponse) => {
        // @ts-ignore
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // @ts-ignore
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});
