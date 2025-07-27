// QRetro Service Worker - Offline PWA Support
// Cache-first strategy for all static assets and offline functionality

const CACHE_NAME = 'qretro-v1.0.0';
const STATIC_CACHE = 'qretro-static-v1.0.0';
const DYNAMIC_CACHE = 'qretro-dynamic-v1.0.0';

// Files to cache on install
const STATIC_FILES = [
  // Core app files
  '/QRetro/',
  '/QRetro/index.html',
  '/QRetro/_next/static/css/app/layout.css',
  '/QRetro/_next/static/chunks/webpack.js',
  '/QRetro/_next/static/chunks/main-app.js',
  '/QRetro/_next/static/chunks/app/layout.js',
  '/QRetro/_next/static/chunks/app/page.js',
  
  // Fonts (critical for retro aesthetic)
  '/QRetro/fonts/PixelOperatorMonoHB.ttf',
  '/QRetro/fonts/TT2020Base-Regular.woff2',
  '/QRetro/fonts/TT2020Base-Regular.ttf',
  
  // PWA icons and assets
  '/QRetro/icon-192.png',
  '/QRetro/icon-512.png',
  '/QRetro/icon-180.png',
  '/QRetro/icon-167.png',
  '/QRetro/icon-152.png',
  '/QRetro/favicon.ico',
  '/QRetro/manifest.json',
  
  // Share page
  '/QRetro/share',
  '/QRetro/share/index.html'
];

// Install event - Cache static files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        console.log('[Service Worker] Caching static files...');
        
        // Cache static files with error handling for each file
        const cachePromises = STATIC_FILES.map(async (file) => {
          try {
            const response = await fetch(file);
            if (response.ok) {
              await staticCache.put(file, response);
              console.log(`[Service Worker] Cached: ${file}`);
            } else {
              console.warn(`[Service Worker] Failed to cache (${response.status}): ${file}`);
            }
          } catch (error) {
            console.warn(`[Service Worker] Error caching ${file}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('[Service Worker] Static files cached successfully');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Install failed:', error);
      }
    })()
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => 
            name.startsWith('qretro-') && 
            name !== STATIC_CACHE && 
            name !== DYNAMIC_CACHE
          )
          .map(name => {
            console.log(`[Service Worker] Deleting old cache: ${name}`);
            return caches.delete(name);
          });
        
        await Promise.all(deletePromises);
        console.log('[Service Worker] Old caches cleaned up');
        
        // Take control of all clients immediately
        await self.clients.claim();
        console.log('[Service Worker] Activated and claimed clients');
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - Cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    // Static assets: Cache-first
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAppNavigation(request)) {
    // App navigation: Network-first with offline fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (isApiRequest(url)) {
    // External APIs: Network-only (graceful degradation)
    event.respondWith(networkOnlyStrategy(request));
  } else {
    // Everything else: Cache-first with network fallback
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Clone the response before caching
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Cache-first strategy failed:', error);
    // Return offline fallback for critical assets
    return getOfflineFallback(request);
  }
}

// Network-first strategy for app navigation
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.warn('[Service Worker] Network failed, trying cache:', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return getOfflineFallback(request);
  }
}

// Network-only strategy for external APIs
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.warn('[Service Worker] Network-only request failed:', error);
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Get offline fallback response
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return the main page
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/QRetro/') || await cache.match('/QRetro/index.html');
    if (fallback) {
      return fallback;
    }
  }
  
  // For other resources, return a basic offline response
  return new Response(
    'Offline - Resource not available',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    }
  );
}

// Helper functions to categorize requests
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.woff2', '.woff', '.ttf', '.ico'];
  const pathname = url.pathname;
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.includes('/_next/static/') ||
         pathname.includes('/fonts/');
}

function isAppNavigation(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isApiRequest(url) {
  // External APIs or any requests outside our app domain
  return !url.pathname.startsWith('/QRetro/') && url.origin !== self.location.origin;
}

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'qr-codes-sync') {
    event.waitUntil(syncQRCodes());
  }
});

// Placeholder for future QR code synchronization
async function syncQRCodes() {
  console.log('[Service Worker] Syncing QR codes...');
  // Future enhancement: sync locally stored QR codes when online
}

// Message handling for app communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_QR_CODE') {
    // Cache generated QR codes for offline access
    cacheQRCode(event.data.qrData);
  }
});

// Cache QR code data for offline access
async function cacheQRCode(qrData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(qrData.dataUrl, {
      headers: { 'Content-Type': 'image/png' }
    });
    await cache.put(`/qr-cache/${qrData.id}`, response);
    console.log('[Service Worker] QR code cached for offline access');
  } catch (error) {
    console.warn('[Service Worker] Failed to cache QR code:', error);
  }
}

console.log('[Service Worker] QRetro SW loaded and ready for offline support!');