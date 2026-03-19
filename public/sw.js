// Basic Service Worker for PWA installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch handler - skip Chrome devtools requests and catch errors
  if (event.request.url.includes('com.chrome.devtools')) return;
  
  event.respondWith(
    fetch(event.request).catch(err => {
      console.warn('[SW] Fetch failed:', err);
      // Fallback or just let it fail silently if it's not a critical asset
      return new Response('Offline or failed request', { status: 408 });
    })
  );
});
