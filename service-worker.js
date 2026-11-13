// service-worker.js — network-first com preservação do último shell offline válido.
const CACHE_NAME = 'motorista-ipameri-v1.13.25-vade-mecum-offline-sync';
const ASSETS = [
  './', './index.html', './manifest.json?v=1.13.3-platform-bridge', './version.json',
  './production-config.js?v=1.12.19', './doctor-platform-bridge.js?v=1.12.19-platform-6', './legal-search.js?v=1.2.1',
  './vade-mecum.js?v=1.2.0',
  './product-context.js?v=2026.3-appid3', './product-content.js?v=2026.3',
  './doctor-core-quality.js?v=1.12.19', './calculator-scientific.js?v=1.12.19',
  './doctor-core-icon.svg', './assets/icons/products/motorista-legislativo.svg?v=1.3.0',
  './assets/icons/icon-palette.json', './assets/icons/icon-generator.js?v=1.3.0',
  './assets/images/ipameri-chamber-green.svg?v=20261028-2',
  './assets/images/motorista-legislativo-edital.svg',
  './assets/images/motorista-legislativo-banner.svg?v=20261028-2',
  './assets/doctor/evolution/doctor-avatar-fallback.svg',
  './assets/doctor/evolution/doctor-level-01.svg',
  './assets/doctor/evolution/doctor-level-02.svg',
  './assets/doctor/evolution/doctor-level-03.svg',
  './assets/doctor/evolution/doctor-level-04.svg',
  './assets/doctor/evolution/doctor-level-05.svg',
  './assets/doctor/evolution/doctor-level-06.svg',
  './assets/doctor/evolution/doctor-level-07.svg',
  './assets/doctor/evolution/doctor-level-08.svg',
  './assets/doctor/evolution/doctor-level-09.svg',
  './assets/doctor/evolution/doctor-level-10.svg'
];
const CORE_ASSETS = [
  './index.html', './manifest.json?v=1.13.3-platform-bridge', './version.json',
  './production-config.js?v=1.12.19', './doctor-platform-bridge.js?v=1.12.19-platform-6',
  './product-context.js?v=2026.3-appid3', './product-content.js?v=2026.3',
  './doctor-core-quality.js?v=1.12.19', './calculator-scientific.js?v=1.12.19',
  './assets/icons/icon-generator.js?v=1.3.0', './legal-search.js?v=1.2.1',
  './vade-mecum.js?v=1.2.0'
];
const CACHE_PREFIX = 'motorista-ipameri-';
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const previousNames = (await caches.keys()).filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).reverse();

    async function previousResponse(asset) {
      for (const name of previousNames) {
        const previous = await (await caches.open(name)).match(asset);
        if (previous) return previous;
      }
      return await caches.match(asset);
    }

    await Promise.allSettled(ASSETS.map(async (asset) => {
      let response = null;
      try {
        const network = await fetch(asset, { cache: 'reload' });
        if (network && network.ok) response = network;
      } catch (_) { /* preserve the last cached version below */ }
      if (!response) response = await previousResponse(asset);
      if (response) await cache.put(asset, response.clone());
    }));

    const missingCore = [];
    for (const asset of CORE_ASSETS) {
      if (!await cache.match(asset)) missingCore.push(asset);
    }
    // Never activate an incomplete update and then delete the last working offline shell.
    if (missingCore.length) throw new Error('Core offline assets unavailable: ' + missingCore.join(', '));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const sameOrigin = req.url.startsWith(self.location.origin);
  if (!sameOrigin || req.method !== 'GET') return;

  event.respondWith(
    Promise.race([fetch(req), timeoutPromise(NETWORK_TIMEOUT_MS)])
      .then(async (response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          await caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        return new Response('Recurso temporariamente indisponível. Verifique a conexão e tente novamente.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
        });
      })
  );
});
