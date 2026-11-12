/* RepUp service worker: app shell works offline after the first visit. */
const VERSION = 'v6';
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon-48.png?v=2', '/icon-192.png?v=2', '/icon-512.png?v=2', '/apple-icon.png?v=2'];
/** Old hashed build files are trimmed so the cache doesn't grow forever. */
const MAX_STATIC = 80;
/** On a weak gym connection, fall back to the saved copy after this long. */
const NAV_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trimStatic() {
  const cache = await caches.open(STATIC);
  const keys = await cache.keys();
  // Cache keys come back in insertion order: drop the oldest.
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_STATIC)).map((k) => cache.delete(k)));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Hashed build assets never change: cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches
                .open(STATIC)
                .then((c) => c.put(req, copy))
                .then(trimStatic);
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Pages and everything else: network-first, fall back to cache when offline or slow.
  const network = fetch(req).then((res) => {
    // Never cache auth pages or a redirect (e.g. to /login after signing out) as the app shell.
    const authPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/reset-password');
    if (res.ok && !res.redirected && !authPage && (req.mode === 'navigate' || PRECACHE.includes(url.pathname + url.search))) {
      const copy = res.clone();
      caches.open(PAGES).then((c) => c.put(req.mode === 'navigate' ? '/' : req, copy));
    }
    return res;
  });
  const fromCache = () => caches.match(req, { ignoreSearch: req.mode !== 'navigate' }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/') : undefined));

  event.respondWith(
    (req.mode === 'navigate' ? withTimeout(network, NAV_TIMEOUT_MS) : network)
      .catch(() => fromCache().then((hit) => hit || network))
      .catch(() => undefined)
      .then((res) => res || new Response('Offline', { status: 503 })),
  );
});
