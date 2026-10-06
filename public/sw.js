// Sirr al-Huruf Service Worker
// Cache version bump — forces old SW and all old caches to be replaced immediately.
// Change CACHE_VERSION to force a full cache bust on all clients.
// IMPORTANT: Increment this version number on EVERY deployment to ensure users get the latest version.
const CACHE_VERSION = 'sirr-v6-20260704';
const STATIC_CACHE = CACHE_VERSION;

// On install: skip waiting immediately so new SW activates without delay
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// On activate: delete ALL old caches, then claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete every cache (old versions)
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all open tabs/windows immediately
      return self.clients.claim();
    })
  );
});

// Fetch: network-first strategy — always try network, never serve stale login screens
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For navigation requests (HTML pages), always go to network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline fallback only — return minimal offline page
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offline</title></head><body style="background:#020710;color:#D4AF37;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>You are offline. Please reconnect.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // For all other requests: network-first, no caching of app JS/CSS
  // This ensures users always get the latest build
  event.respondWith(fetch(event.request));
});
