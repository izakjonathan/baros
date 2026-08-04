/* Bar Ops v0.15.3 service worker.
   Authenticated pages and API responses are always network-only. */
const VERSION = "bar-ops-v0153";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f4f2"><title>Bar Ops — Offline</title><style>*{box-sizing:border-box}:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111;background:#f4f4f2}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px max(24px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left))}main{width:min(100%,420px);background:#fff;border-radius:24px;padding:28px;text-align:center}h1{font-size:26px;margin:0 0 10px}p{margin:0 0 22px;color:#666;line-height:1.5}button{min-height:44px;border:0;border-radius:12px;background:#111;color:#fff;font:600 16px inherit;padding:0 20px}</style></head><body><main><h1>You’re offline</h1><p>Bar Ops needs a connection to load current schedules, attendance and inventory securely. Reconnect and try again.</p><button type="button" onclick="location.reload()">Try again</button></main></body></html>`;

const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API, authentication, activation or employee/manager HTML.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/activate/") || url.pathname === "/login") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })));
    return;
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest";

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
