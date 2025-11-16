const CACHE_NAME = 'chromatic-timer-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html', // Or match your main file, e.g., 'color_timer.html'
  '/color_timer.html' // Cache the main file
];

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to cache. Adjust '/index.html' if your main file is 'color_timer.html'
        // For this to work, the server should serve 'color_timer.html' as the root '/' or '/index.html'
        return cache.addAll(URLS_TO_CACHE.map(url => url === '/index.html' ? '/color_timer.html' : url));
      })
  );
});

// Fetch event: serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch and cache
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});