// Service Worker para Impulsa PWA
const CACHE_NAME = 'impulsa-cache-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptação de requests
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - retorna response do cache
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Verifica se é uma response válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Atualização do Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notifications (preparação futura)
self.addEventListener('push', function(event) {
  const options = {
    body: 'Sua simulação de antecipação está pronta!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore', 
        title: 'Ver Proposta',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close', 
        title: 'Fechar',
        icon: '/icons/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Impulsa - Proposta Pronta', options)
  );
});

// Análise offline - trackea events mesmo offline
self.addEventListener('sync', function(event) {
  if (event.tag == 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implementar sync de dados quando voltar online
  return Promise.resolve();
}

// Performance monitoring
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});