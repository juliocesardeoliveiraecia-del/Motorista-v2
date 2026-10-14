// service-worker.js — network-first (sempre busca a versão mais nova primeiro)
const CACHE_NAME = 'motorista-ipameri-v1.12.3';
const ASSETS = [
  './', './index.html', './manifest.json', './version.json',
  './production-config.js', './product-context.js', './product-content.js',
  './doctor-core-quality.js', './doctor-core-icon.svg',
  './assets/doctor/evolution/doctor-avatar-fallback.svg'
];
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A single optional/missing asset must never cancel SW installation.
    await Promise.allSettled(ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response && response.ok) await cache.put(asset, response);
      } catch (_) { /* optional asset; network-first still serves it later */ }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const sameOrigin = req.url.startsWith(self.location.origin);
  if (!sameOrigin) return;
  if (req.method !== 'GET') return;

  event.respondWith(
    Promise.race([fetch(req), timeoutPromise(NETWORK_TIMEOUT_MS)])
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
