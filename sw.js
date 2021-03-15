const cacheName = 'SUDOKU_WORKER'

const urlToCache = [
  '/index.html',
  '/scripts/calert.min.js',
  '/scripts/utils.js',
  '/scripts/sudoku.js',
  '/scripts/const.js',
  '/scripts/index.js',
  '/scripts/store.js',
  '/css/main.css',
  '/assets/favicon.png',
  '/assets/sudokuLogo-192.png',
  '/assets/sudokuLogo-800.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(urlToCache)
    }),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cachesNames) => {
      return Promise.all(
        cachesNames.map((cache) => {
          if (cache !== cacheName) {
            // Delete old cache
            return caches.delete(cache)
          }
        }),
      )
    }),
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(caches.match(e.request)))
})
