const CACHE_NAME = 'flowtime-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/assets/css/local.css',
  '/assets/logo-192.png',
  '/assets/logo-512.png',
  // add more assets as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
}); 