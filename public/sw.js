self.addEventListener("install", (event) => {
  console.log("SW instalado");
  event.waitUntil(
    caches.open("mypic-cache").then((cache) => {
      return cache.addAll(["/", "/index.html"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          caches.match("/index.html")
        )
      );
    })
  );
});

self.addEventListener("activate", () => {
  console.log("SW activado");
});
