/* AHS 2026-27 Roster — service worker.
 *
 * Its whole job is that a coach standing on a field with no signal can still
 * open the app and mark a roster. The app itself is one file, so "offline"
 * means: keep that file, its icons and its manifest, and serve them from the
 * cache the moment the network is not there.
 *
 * What it deliberately does NOT touch: anything cross-origin. Every call to the
 * Google Apps Script bridge goes straight to the network, every time. A cached
 * roster reply would be far worse than an honest failure — it would show a
 * coach a version of the roster that no longer exists and let them save over
 * the real one.
 *
 * CACHE is stamped at build time, so a new build cannot be served the old file.
 */
const CACHE = 'ahs-tryouts-20260903-081055';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);

    /* The app itself goes in first and on its own. Firing all seven requests
       at once starves it: it is 1.1MB and the icons are a few KB each, so on a
       slow phone connection the big one is the one that loses. It is also the
       only entry that actually matters — an icon that fails here is picked up
       by the fetch handler later, an uncached app is a blank screen. */
    try { await c.add('./index.html'); } catch (err) { /* fetch handler will catch it */ }

    for (const u of SHELL) {
      if (u === './index.html') continue;
      try { await c.add(u); } catch (err) { /* one missing icon is not a failure */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // the bridge is never cached

  /* Serve what we already have straight away, so it opens instantly and works
     with no signal, and refresh the copy in the background for next time. */
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });

    const live = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') {
        // waitUntil, so the write is not cut short when the response is served.
        e.waitUntil(cache.put(req, res.clone()));
      }
      return res;
    }).catch(() => null);

    if (hit) { e.waitUntil(live); return hit; }

    const res = await live;
    if (res) return res;

    /* Offline, and this exact address was never cached. A navigation still has
       somewhere to go: the app is a single page, so hand back the app. */
    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html', { ignoreSearch: true });
      if (shell) return shell;
    }
    return Response.error();
  })());
});
