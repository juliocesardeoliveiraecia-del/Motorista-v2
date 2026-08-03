// service-worker.js — network-first (sempre busca a versão mais nova primeiro)
const CACHE_NAME = 'motorista-ipameri-v1';
const ASSETS = ['./', './index.html'];
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
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
  if (!sameOrigin) return; // deixa passar direto (ex: API da Groq)
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
