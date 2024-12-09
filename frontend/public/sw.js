const isDevelopment = self.location.hostname === 'localhost' && self.location.port === '5173';

if (isDevelopment) {
  // Bypass all caching in development
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Fetch failed:', error);
          throw error;
        })
    );
  });
} else {
  // Production caching logic
  const CACHE_NAME = 'barber-shop-v1';
  const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-144x144.png',
    '/icons/icon-192x192.png'
  ];

  // Install event
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .then(() => self.skipWaiting()) // Activate worker immediately
    );
  });

  // Activate event
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim()) // Take control of all pages immediately
    );
  });

  // Fetch event
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            (response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
    );
  });
}
