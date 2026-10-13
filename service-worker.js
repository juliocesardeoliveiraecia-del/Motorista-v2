// Doctor Core PWA — cache seguro de shell e dependências críticas.
// Não devolve index.html como resposta para scripts/JSON/imagens: isso causa
// SyntaxError silencioso e pode impedir o boot quando a rede falha.
const CACHE_NAME = 'motorista-ipameri-v1.12.2';
const ASSETS = [
  './',
  './index.html',
  './product-context.js?v=1.12.2',
  './product-content.js?v=1.12.2',
  './doctor-core-quality.js?v=1.12.2',
  './manifest.json?v=1.12.2',
  './doctor-core-icon.svg?v=1.12.2'
];
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('network-timeout')), ms));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    try {
      const response = await Promise.race([fetch(req), timeoutPromise(NETWORK_TIMEOUT_MS)]);
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
      }
      return response;
    } catch (_) {
      const cached = await caches.match(req);
      if (cached) return cached;

      // Só navegação/documento pode receber o shell HTML como fallback.
      // Scripts e assets sem cache retornam indisponibilidade explícita.
      if (req.mode === 'navigate' || req.destination === 'document') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return new Response('Este recurso ainda não está disponível offline. Conecte-se à internet e tente novamente.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
  })());
});
