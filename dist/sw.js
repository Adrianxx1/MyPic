const CACHE_VERSION = 'v7';
const CACHE_NAME = `mypic-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `mypic-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `mypic-images-${CACHE_VERSION}`;
const EXTERNAL_CACHE = `mypic-external-${CACHE_VERSION}`;

// ⚠️ CRÍTICO: Estos archivos SIEMPRE deben estar en caché
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

// Dominios externos que queremos cachear (solo imágenes)
const CACHEABLE_DOMAINS = [
  'firebasestorage.googleapis.com',
  'lh3.googleusercontent.com',
];

// Dominios que el SW debe IGNORAR completamente (Firebase APIs)
const IGNORED_DOMAINS = [
  'identitytoolkit.googleapis.com', // Firebase Auth
  'firestore.googleapis.com', // Firestore
  'fcmtoken.googleapis.com', // Firebase Cloud Messaging
  'www.google.com/images/cleardot.gif', // Pixel de tracking
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v6...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      for (const asset of CRITICAL_ASSETS) {
        try {
          await cache.add(asset);
          console.log(`[SW] ✓ Cacheado: ${asset}`);
        } catch (error) {
          console.warn(`[SW] No se pudo cachear ${asset}`);
        }
      }
      
      await self.skipWaiting();
      console.log('[SW] Instalación completada');
    })()
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v6...');
  
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('mypic-') && 
                  name !== CACHE_NAME && 
                  name !== DYNAMIC_CACHE && 
                  name !== IMAGE_CACHE &&
                  name !== EXTERNAL_CACHE)
          .map(name => caches.delete(name))
      );
      
      await self.clients.claim();
      console.log('[SW] Activado y en control');
    })()
  );
});

// Función para determinar si es dominio externo cacheable
function isCacheableDomain(url) {
  try {
    const urlObj = new URL(url);
    return CACHEABLE_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Función para determinar si debe ignorarse completamente
function shouldIgnore(url) {
  try {
    return IGNORED_DOMAINS.some(domain => url.includes(domain));
  } catch {
    return false;
  }
}

// Función para determinar si es una imagen
function isImage(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    return path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) || 
           urlObj.hostname.includes('firebasestorage') ||
           urlObj.hostname.includes('googleusercontent');
  } catch {
    // Si la URL no tiene protocolo, asumir que es imagen si tiene extensión
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) !== null;
  }
}

// Función para crear placeholder SVG
function createPlaceholder() {
  return new Response(
    `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#1a1a1a" width="400" height="400"/>
      <text x="50%" y="45%" text-anchor="middle" fill="#666" font-size="18" font-family="system-ui">📡</text>
      <text x="50%" y="55%" text-anchor="middle" fill="#666" font-size="14" font-family="system-ui">Sin conexión</text>
      <text x="50%" y="62%" text-anchor="middle" fill="#555" font-size="12" font-family="system-ui">Imagen no disponible</text>
    </svg>`,
    { 
      status: 200,
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      } 
    }
  );
}

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // No interceptar peticiones de actualización del SW
  if (request.url.includes('/sw.js')) {
    return;
  }

  // ⚠️ CRÍTICO: No interceptar Firebase Auth, Firestore, etc.
  if (shouldIgnore(request.url)) {
    return; // Dejar que pase directo a la red
  }

  event.respondWith(
    (async () => {
      try {
        const url = new URL(request.url);

        // ========================================
        // 1. NAVEGACIÓN (HTML): Cache-First
        // ========================================
        if (request.mode === 'navigate') {
          console.log('[SW] Navegación:', url.pathname);
          
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            console.log('[SW] ✓ HTML desde caché');
            
            // Actualizar en segundo plano
            event.waitUntil(
              fetch(request)
                .then(response => {
                  if (response && response.ok) {
                    return caches.open(CACHE_NAME).then(cache => cache.put(request, response));
                  }
                })
                .catch(() => {}) // Silenciar errores de actualización
            );
            
            return cachedResponse;
          }
          
          // Intentar red
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, networkResponse.clone());
              return networkResponse;
            }
          } catch (error) {
            console.log('[SW] Sin conexión, mostrando offline.html');
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;
          }
          
          return new Response('Sin conexión', { 
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }

        // ========================================
        // 2. IMÁGENES: Cache-First con Network Fallback
        // ========================================
        if (isImage(request.url)) {
          // Intentar caché primero
          const cachedImage = await caches.match(request);
          if (cachedImage) {
            console.log('[SW] ✓ Imagen desde caché:', url.pathname);
            return cachedImage;
          }

          // Si no está en caché, intentar red
          try {
            console.log('[SW] Descargando imagen:', request.url);
            const networkResponse = await fetch(request, {
              mode: 'cors',
              credentials: 'omit'
            });
            
            if (networkResponse && networkResponse.ok) {
              // Cachear la imagen
              const targetCache = isCacheableDomain(request.url) ? EXTERNAL_CACHE : IMAGE_CACHE;
              const cache = await caches.open(targetCache);
              
              // Clonar antes de cachear
              cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('[SW] No se pudo cachear imagen:', err);
              });
              
              console.log('[SW] ✓ Imagen descargada y cacheada');
              return networkResponse;
            }
          } catch (error) {
            console.log('[SW] ✗ Error descargando imagen:', error.message);
          }

          // Si todo falla, mostrar placeholder
          return createPlaceholder();
        }

        // ========================================
        // 3. RECURSOS EXTERNOS CACHEABLES: Network-First
        // ========================================
        if (isCacheableDomain(request.url)) {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(EXTERNAL_CACHE);
              cache.put(request, networkResponse.clone()).catch(() => {});
              return networkResponse;
            }
          } catch (error) {
            // Si falla, buscar en caché
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              console.log('[SW] Recurso externo desde caché (offline)');
              return cachedResponse;
            }
          }

          // Si es JSON, retornar error estructurado
          if (request.headers.get('accept')?.includes('application/json')) {
            return new Response(
              JSON.stringify({ error: 'Sin conexión', offline: true }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response('Sin conexión', { status: 503 });
        }

        // ========================================
        // 4. ASSETS LOCALES (JS, CSS, fonts): Cache-First
        // ========================================
        if (url.origin === location.origin) {
          if (request.destination === 'script' || 
              request.destination === 'style' || 
              request.destination === 'font') {
            
            const cachedAsset = await caches.match(request);
            if (cachedAsset) {
              return cachedAsset;
            }

            try {
              const networkResponse = await fetch(request);
              if (networkResponse && networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, networkResponse.clone());
                return networkResponse;
              }
            } catch (error) {
              console.log('[SW] Asset no disponible');
            }
          }

          // Otras peticiones locales: Network-First
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(request, networkResponse.clone()).catch(() => {});
              return networkResponse;
            }
          } catch (error) {
            const cachedData = await caches.match(request);
            if (cachedData) {
              return cachedData;
            }
          }
        }

        // Petición no manejada, pasar directo a la red
        return fetch(request);

      } catch (error) {
        console.error('[SW] Error general:', error);
        
        // Buscar en cualquier caché como último recurso
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si es navegación, mostrar offline
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;
        }
        
        // Si es imagen, mostrar placeholder
        if (isImage(request.url)) {
          return createPlaceholder();
        }
        
        return new Response('Error de red', { 
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      (async () => {
        const urls = event.data.urls;
        
        for (const url of urls) {
          try {
            const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
            if (response && response.ok) {
              const isCacheable = isCacheableDomain(url);
              const isImg = isImage(url);
              
              let targetCache = DYNAMIC_CACHE;
              if (isImg && isCacheable) targetCache = EXTERNAL_CACHE;
              else if (isImg) targetCache = IMAGE_CACHE;
              
              const cache = await caches.open(targetCache);
              await cache.put(url, response);
              console.log(`[SW] Pre-cacheado: ${url}`);
            }
          } catch (error) {
            console.warn(`[SW] No se pudo pre-cachear: ${url}`);
          }
        }
      })()
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});