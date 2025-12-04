const CACHE_NAME = 'pokedex-static-v1';
const API_CACHE = 'pokedex-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/style/style.css',
  '/js/main.js',
  '/data/pokedex-fallback.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME && k !== API_CACHE) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Serve static assets cache-first
  if (req.method === 'GET' && STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      })).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For PokéAPI endpoints: network-first, fallback to cache
  if (req.method === 'GET' && url.hostname.includes('pokeapi.co')) {
    event.respondWith(
      caches.open(API_CACHE).then(async cache => {
        try {
          const response = await fetch(req);
          cache.put(req, response.clone());
          return response;
        } catch (err) {
          const cached = await cache.match(req);
          if (cached) return cached;
          if (req.url.includes('/pokemon?')) {
            const fallback = await caches.match('/data/pokedex-fallback.json');
            if (fallback) return fallback;
          }
          return new Response('{"error":"offline"}', { headers: { 'Content-Type':'application/json' }});
        }
      })
    );
    return;
  }

  // default network-first then cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
