var CACHE_NAME = "yacht-z-cache-v1";
var expected_caches = [CACHE_NAME];
var urlsToCache = [
  "/",
  "/app",
  "images/die-1pips.png",
  "images/die-2pips.png",
  "images/die-3pips.png",
  "images/die-4pips.png",
  "images/die-5pips.png",
  "images/die-6pips.png",
  "images/dark-home.svg",
  "images/dark-yacht-wave.svg",
  "images/flamingo.svg",
  "images/logo.svg",
  "images/lock.svg",
  "images/die-lock.png",
];
// var clearUrlsToCache = [];
//Install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  // delete any caches that aren't in expectedCaches
  // which will get rid of static-v1
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!expected_caches.includes(key)) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(function () {
        console.log("Cache - " + CACHE_NAME);
      })
  );
});

self.addEventListener("install", (event) => {
  console.log("👷", "install", event);
  self.skipWaiting();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        //Cache HIT !
        console.log("Found: " + event.request.url + " in cache");
        return response;
      }
      return fetch(event.request)
        .then(function (response) {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          // let responseClone = response.clone();

          // Puts visited url's in the cache !
          // caches.open(CACHE_NAME).then(function (cache) {
          //   cache.put(event.request, responseClone);
          // }); // Comment out this code for testing .
          return response;
        })
        .catch(function () {
          // return caches.match("/sw-test/gallery/myLittleVader.jpg");
        });
    })
  );
});
