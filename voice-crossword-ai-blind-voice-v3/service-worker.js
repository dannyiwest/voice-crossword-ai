self.addEventListener('install', event => {
  event.waitUntil(caches.open('v2').then(cache => cache.addAll(['/', '/index.html', '/manifest.json'])));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
