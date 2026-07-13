const CACHE_NAME = 'cap-predictor-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
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
  const request = event.request;

  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);

  // Ignore non-HTTP requests (like ws:// or chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Ignore API requests and Vite HMR polling/tokens
  if (url.pathname.startsWith('/api') || url.search.includes('token=') || url.pathname.includes('@vite')) {
    return;
  }

  // @ts-ignore
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background to update the cache
        fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      }).catch(error => {
        console.error('[SW] Fetch failed:', error);
        throw error;
      });
    })
  );
});
