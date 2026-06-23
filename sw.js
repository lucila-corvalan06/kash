const CACHE_NAME = 'kash-v1';

const ARCHIVOS = [
    './',
    './index.html',
    './offline.html',
    './css/style.css',
    './js/app.js',
    './js/storage.js',
    './js/api.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ARCHIVOS);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('./offline.html');
                }
            });
        })
    );
});