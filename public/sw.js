// CryptoGuard Service Worker
const CACHE_NAME = 'cryptoguard-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first strategy - always fetch fresh content from server
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
