const CACHE_NAME = "fom-print-cache-v1";
const SYNC_TAG = "sync-xml-data";
const XML_CACHE_NAME = "xml-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/assets/css/bootstrap.min.css",
  "/assets/css/bootstrap-icons.css",
  "/assets/css/style.css",
  "/assets/js/bootstrap.bundle.min.js",
  "/assets/js/popper.min.js",
  "/assets/js/numeral.min.js",
  "/assets/js/moment.min.js",
  "/assets/js/app.js",
  "/assets/img/fom-app-logo-01.svg",
  "/assets/img/favicon-16x16.png",
  "/assets/img/favicon-32x32.png",
  "/assets/img/apple-touch-icon-152x152.png",
  "/assets/img/apple-touch-icon-167x167.png",
  "/assets/img/apple-touch-icon-180x180.png",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(Promise.all([caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)), caches.open(XML_CACHE_NAME)]));
});

// Sync event - handle background sync
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncXmlData());
  }
});

// Periodic sync - check for updates every few hours
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "periodic-xml-sync") {
    event.waitUntil(syncXmlData());
  }
});

// Function to sync XML data
async function syncXmlData() {
  try {
    // Fetch latest XML data
    const response = await fetch("/path/to/your/xml/data.xml");
    const xmlData = await response.text();

    // Cache the XML data
    const cache = await caches.open(XML_CACHE_NAME);
    await cache.put("/xml-data", new Response(xmlData));

    // Broadcast message to update SQLite
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "UPDATE_XML_DATA",
        data: xmlData,
      });
    });

    return true;
  } catch (error) {
    console.error("Error syncing XML data:", error);
    return false;
  }
}

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Handle XML data requests separately
  if (event.request.url.includes("/xml-data")) {
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, XML_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
