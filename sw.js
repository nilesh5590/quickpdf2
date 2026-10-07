// sw.js — App shell cache. Network-first for HTML, cache-first for assets.
const VERSION = 'v1.0.0';
const SHELL = `quickpdf-shell-${VERSION}`;

const PRECACHE = [
  '/', '/index.html',
  '/merge.html', '/split.html', '/compress.html', '/ocr.html',
  '/sign.html', '/images-to-pdf.html', '/pdf-info.html',
  '/assets/css/themes.css', '/assets/css/base.css',
  '/assets/css/components.css', '/assets/css/utilities.css',
  '/assets/js/main.js', '/assets/js/tools-registry.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // don't touch CDN requests

  // HTML: network-first so updates land immediately.
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(res => { const copy = res.clone(); caches.open(SHELL).then(c => c.put(request, copy)); return res; })
        .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Assets: cache-first.
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const copy = res.clone(); caches.open(SHELL).then(c => c.put(request, copy)); return res;
    }))
  );
});