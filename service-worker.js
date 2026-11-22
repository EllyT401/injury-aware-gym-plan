// Makes the app work offline.
//
// Strategy: "network first, cache as backup". When online, the freshest files
// are used (and saved). When offline, the saved copies are used. This avoids
// the classic problem of an app being stuck on an old version.
//
// Bump CACHE_VERSION when you add or rename files so the file list refreshes.

const CACHE_VERSION = "igp-shell-v1";

const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./js/app.js",
  "./js/store.js",
  "./js/data.js",
  "./js/util.js",
  "./js/ui.js",
  "./js/tags.js",
  "./js/safety/redflags.js",
  "./js/safety/pause.js",
  "./js/screens/setup.js",
  "./js/screens/pause.js",
  "./js/screens/prefs.js",
  "./js/screens/tabs.js",
  "./data/redflags.json",
  "./data/tags.json",
  "./data/injuries.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
