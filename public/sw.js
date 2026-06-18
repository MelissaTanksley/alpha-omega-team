// Minimal service worker — required for PWA installability
const CACHE_NAME = 'ai-risk-navigator-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first; let the browser handle everything normally.
  // Presence of a fetch handler is what makes the app installable.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
