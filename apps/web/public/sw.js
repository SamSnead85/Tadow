// Service Worker for Tadow PWA
const CACHE_NAME = 'tadow-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png',
    '/logo.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests - always go to network
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Don't cache non-ok responses
                if (!response || response.status !== 200) {
                    return response;
                }

                // Cache successful responses
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});

// Background sync for price alerts (future feature)
self.addEventListener('sync', (event) => {
    if (event.tag === 'price-alert-sync') {
        console.log('[ServiceWorker] Syncing price alerts');
    }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'Tadow Deal Alert';
    const options = {
        body: data.body || 'A deal you\'re tracking just dropped in price!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'tadow-deal-alert',
        data: data.url || '/',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});
