const CACHE = "opc-v1";
const ASSETS = [
  "/",
  "/style.css",
  "/app-core.js",
  "/favicon.svg",
  "/manifest.json"
];

self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});
