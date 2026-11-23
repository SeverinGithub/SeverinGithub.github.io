/* Service Worker: hält die App offline bereit.
   Strategie: aus dem Cache antworten und im Hintergrund nachladen (stale-while-revalidate).
   Nach Änderungen an der App-Hülle VERSION hochzählen, damit alte Caches verschwinden. */
const VERSION = 'so-v2';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const key = req.mode === 'navigate' ? './' : req;
      const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
      const fresh = fetch(req).then(res => {
        if (res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
