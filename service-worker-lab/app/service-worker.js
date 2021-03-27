self.addEventListener("install", (evt) => {
  console.log("[service-worker.js]: Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  console.log("[service-worker.js]: Service worker activated");
});

self.addEventListener('fetch', event => {
  console.log('[service-worker.js]: Fetching -> ', event.request.url);
});
