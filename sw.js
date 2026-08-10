/* =============================================
   CLASSIC AURA — Service Worker (PWA)
   =============================================
   Minimal, safe service worker:
   - Pre-caches core static assets at install time.
   - Cache-first for static assets (CSS, JS, images, fonts).
   - Network-first for page navigations, falling back to the
     cached copy (and finally to the cached home page) so the
     app still opens offline.
   No offline cart/checkout, no background sync, no push.
   All paths are relative to this script (/classicaura/sw.js),
   so they work when the site is served from a sub-path.
*/

const VERSION = 'classic-aura-v1';
const CACHE_NAME = VERSION;

/* Core assets to cache on install. Keep this small and stable. */
const PRECACHE_URLS = [
  './',
  './index.html',
  './shop.html',
  './product.html',
  './cart.html',
  './checkout.html',
  './about.html',
  './contact.html',
  './mango-bleach.html',
  './css/style.css',
  './js/products.js',
  './js/main.js',
  './favicon.svg',
  './manifest.json',
  './images/bannar.jpg',
  './images/covar1.jpg',
  './images/kurti.jpg',
  './images/mengo.jpg',
  './images/top-skirt-set-maroon.jpg',
  './images/top-skirt-set-black.jpg',
  './images/top-skirt-set-purple.jpg',
  './images/top-skirt-set-red.jpg',
  './images/top-skirt-set-mustard.jpg',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/apple-touch-icon.png',
];

/* Install: open the cache and populate it. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activate: take control immediately and clean up old caches. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first for static assets, network-first for navigations. */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Page navigations: try network first so users always get the
  // newest version online, then fall back to cache when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match('./index.html') || caches.match('./')
          )
        )
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Only cache same-origin successes to avoid storing 3rd-party noise.
          if (
            response.ok &&
            request.url.startsWith(self.location.origin)
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
