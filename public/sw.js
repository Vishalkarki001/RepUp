/* RepUp service worker: app shell works offline after the first visit. */
const VERSION = 'v8';
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon-48.png?v=3', '/icon-192.png?v=3', '/icon-512.png?v=3', '/apple-icon.png?v=3'];
/** Old hashed build files are trimmed so the cache doesn't grow forever. */
const MAX_STATIC = 80;
/** On a weak gym connection, fall back to the saved copy after this long. */
const NAV_TIMEOUT_MS = 3000;

const ASSETS = PRECACHE.filter((p) => p !== '/');

/** Only the signed-in app may be kept as the offline copy: never the public home page or a redirect. */
function isAppShell(res) {
  return !!res && res.ok && !res.redirected && res.headers.get('x-repup-shell') === 'app';
}

/** Shown when a page can't load and there is no saved copy for it. */
function offlinePage() {
  const html =
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Offline · RepUp</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#121212;color:#ededed;font-family:system-ui,sans-serif;text-align:center;padding:24px">' +
    '<div><p style="font-size:20px;font-weight:600;margin:0 0 8px">You’re offline</p>' +
    '<p style="margin:0 0 20px;opacity:.7">Connect to the internet and try again.</p>' +
    '<button onclick="location.reload()" style="background:#7c3aed;color:#fff;border:0;border-radius:10px;padding:10px 20px;font-size:15px">Try again</button></div>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES);
      await cache.addAll(ASSETS);
      try {
        const res = await fetch('/', { cache: 'no-store' });
        if (isAppShell(res)) await cache.put('/', res);
      } catch {
        /* offline while updating: keep the previous copy below */
      }
      // Never lose the offline app on an update: carry over the previous version's copy.
      if (!(await cache.match('/'))) {
        for (const key of await caches.keys()) {
          if (key === PAGES || !key.startsWith('pages-')) continue;
          const old = await (await caches.open(key)).match('/');
          if (old) {
            await cache.put('/', old);
            break;
          }
        }
      }
      await self.skipWaiting();
    })(),
  );
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

  // Page loads.
  if (req.mode === 'navigate') {
    const isApp = url.pathname === '/';
    const network = fetch(req).then((res) => {
      if (isApp && isAppShell(res)) {
        const copy = res.clone();
        caches.open(PAGES).then((c) => c.put('/', copy));
      }
      return res;
    });
    if (!isApp) {
      // Website, login and other pages: always the real page (never the app copy).
      event.respondWith(network.catch(() => offlinePage()));
      return;
    }
    // The app: network first; on a weak gym connection, fall back to the saved copy.
    event.respondWith(
      withTimeout(network, NAV_TIMEOUT_MS)
        .catch(() => caches.match('/').then((hit) => hit || network))
        .catch(() => offlinePage()),
    );
    return;
  }

  // Icons, manifest and other files: network first, saved copy when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && PRECACHE.includes(url.pathname + url.search)) {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || new Response('Offline', { status: 503 }))),
  );
});
