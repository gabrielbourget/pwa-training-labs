const staticFiles = [
  "/", "/style/main.css",
  "images/still_life_medium.jpg",
  "index.html", "pages/offline.html",
  "pages/404.html",
];

const STATIC_CACHE_NAME = "pages-cache-v2";

self.addEventListener("install", (evt) => {
  console.log("[sw.js]: Installing service worker and caching static assets...");
  evt.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(staticFiles))
  );
});

self.addEventListener("activate", (evt) => {
  console.log("[sw.js]: Activating new service worker");

  const cacheAllowList = [STATIC_CACHE_NAME];

  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowList.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (evt) => {
  console.log("[sw.js]: Fetch event for -> ", evt.request.url);
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      if (response) {
        console.log("[sw.js]: Found resource in cache -> ", evt.request.url);
        return response;
      }
      console.log("[sw.js]: Making a network request for -> ", evt.request.url);
      return fetch(evt.request).then((response) => {
        if (response.status === 404) {
          return caches.match("pages/404.html");
        }
        return caches.open(STATIC_CACHE_NAME).then((cache) => {
          cache.put(evt.request.url, response.clone());
          return response;
        });
      });
    }).catch((err) => {
      console.log('[sw.js]: Error encountered -> ', err);
      return caches.match('pages/offline.html');
    })
  );
});