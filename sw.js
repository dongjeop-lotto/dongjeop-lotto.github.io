const CACHE_NAME = "dongjeop-lotto-github-pages-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/icon-96.png",
  "/icon-192.png",
  "/icon-512.png",
  "/seed.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) await (await caches.open(CACHE_NAME)).put("/index.html", response.clone());
          return response;
        })
        .catch(async () => (await caches.match("/index.html")) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
      if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })),
  );
});
