self.addEventListener("install", (evt) => {
  console.log("[service-worker.js]: Service worker installed");
});

self.addEventListener("activate", (evt) => {
  console.log("[service-worker.js]: Service worker activated");
});