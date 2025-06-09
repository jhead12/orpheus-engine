// Service Worker for Orpheus Engine Browser Version
// Provides offline capabilities and caching for the PWA

const CACHE_NAME = 'orpheus-engine-v1.0.10'
const STATIC_CACHE = 'orpheus-static-v1'
const DYNAMIC_CACHE = 'orpheus-dynamic-v1'

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/browser.html',
  '/manifest.json',
  '/vite.svg',
  // Core application files will be added dynamically
]

// Audio file extensions to cache
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests (different origin)
  if (url.origin !== location.origin) {
    return
  }
  
  event.respondWith(
    handleFetch(request)
  )
})

// Handle fetch requests with caching strategy
async function handleFetch(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request)
    }
    
    // Strategy 2: Network First for HTML pages
    if (isHtmlRequest(request)) {
      return await networkFirst(request)
    }
    
    // Strategy 3: Cache First for audio files
    if (isAudioFile(pathname)) {
      return await cacheFirst(request)
    }
    
    // Strategy 4: Network First for API calls
    if (isApiRequest(pathname)) {
      return await networkOnly(request)
    }
    
    // Default: Network First
    return await networkFirst(request)
    
  } catch (error) {
    console.error('Service Worker: Fetch failed', error)
    
    // Fallback to offline page for navigation requests
    if (isHtmlRequest(request)) {
      const cache = await caches.open(STATIC_CACHE)
      return await cache.match('/') || new Response('Offline')
    }
    
    throw error
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }
  
  return response
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    throw error
  }
}

// Network Only Strategy (for real-time data)
async function networkOnly(request) {
  return await fetch(request)
}

// Helper functions
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/assets/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg')
  )
}

function isHtmlRequest(request) {
  return (
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html')
  )
}

function isAudioFile(pathname) {
  return AUDIO_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext))
}

function isApiRequest(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/graphql') ||
    pathname.includes('/socket.io/')
  )
}

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Skipping waiting...')
    self.skipWaiting()
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Handle any queued actions when back online
    console.log('🔄 Service Worker: Performing background sync')
    
    // You can implement offline action queuing here
    // For example, sync user settings, project saves, etc.
    
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed', error)
  }
}

// Push notification handling (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'orpheus-notification'
      })
    )
  }
})

console.log('🌐 Service Worker: Loaded successfully')
