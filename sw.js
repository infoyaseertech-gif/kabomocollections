// ═══════════════════════════════════════════════
//   KABOMO COLLECTIONS — AUTO-UPDATE SERVICE WORKER
//   Every push to GitHub = instant update on all devices
//   No cache clearing, no reinstalling needed
// ═══════════════════════════════════════════════

// Change this version string every time you push an update
// The app will detect the change and auto-reload on all devices
const VERSION = 'kabomo-v' + Date.now();
const CACHE = VERSION;

// Files to cache for offline use
const FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/kabomo_icon_192.png',
  '/kabomo_icon_512.png'
];

// ── INSTALL: cache files and skip waiting immediately ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES).catch(() => {}))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ── ACTIVATE: delete ALL old caches, claim all clients ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim()) // take control of all open tabs
      .then(() => {
        // Tell all clients to reload with the new version
        return self.clients.matchAll({ type: 'window' });
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE });
        });
      })
  );
});

// ── FETCH: network first, fall back to cache ──
// Always tries network first so users get latest code
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip non-http requests
  if (!url.startsWith('http')) return;

  // Supabase API — always network, never cache
  if (url.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Everything else — network first, cache as backup
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Got fresh response — update cache with it
        if (res && res.ok && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(e.request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});

// ── MESSAGE: handle skip waiting command from app ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
