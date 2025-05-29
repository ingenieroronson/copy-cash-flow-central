
// Service Worker completely disabled to prevent deployment issues
// All caching and service worker functionality commented out

/*
const CACHE_NAME = 'integracopias-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './placeholder.svg'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files...');
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Service Worker: Failed to cache ${url}:`, error);
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Installation completed');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).catch(function(error) {
          console.warn('Service Worker: Network fetch failed:', error);
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html').then(response => {
              return response || new Response('App not available offline', { 
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          }
          return new Response('Resource not available', { status: 404 });
        });
      })
      .catch(function(error) {
        console.error('Service Worker: Cache match failed:', error);
        return new Response('Cache error', { status: 500 });
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation completed');
      return self.clients.claim();
    })
  );
});
*/

// Empty service worker - no functionality
console.log('Service Worker: Disabled for clean deployment');
