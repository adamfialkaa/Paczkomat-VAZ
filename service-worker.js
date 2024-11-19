const CACHE_NAME = 'paczkomat-vaz-cache-v1';
const urlsToCache = [
 '/',
 '/index.html',
 '/style.css',
 '/script.js',
 '/icons/icon-192x192.png',
 '/icons/icon-512x512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
];
// Instalacja Service Workera
self.addEventListener('install', (event) => {
 event.waitUntil(
   caches.open(CACHE_NAME).then((cache) => {
     return cache.addAll(urlsToCache);
   })
 );
});
// Aktywacja Service Workera
self.addEventListener('activate', (event) => {
 const cacheWhitelist = [CACHE_NAME];
 event.waitUntil(
   caches.keys().then((cacheNames) => {
     return Promise.all(
       cacheNames.map((cacheName) => {
         if (!cacheWhitelist.includes(cacheName)) {
           return caches.delete(cacheName);
         }
       })
     );
   })
 );
});
// Fetch (zachowanie offline)
self.addEventListener('fetch', (event) => {
 event.respondWith(
   caches.match(event.request).then((cachedResponse) => {
     return cachedResponse || fetch(event.request);
   })
 );
});