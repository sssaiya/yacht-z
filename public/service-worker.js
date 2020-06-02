var CACHE_NAME = "yacht-z-cache-v1";
var expected_caches = [CACHE_NAME];
// var urlsToCache = ["/", "/scorecard", "/app"];
var clearUrlsToCache = [];
//Install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(clearUrlsToCache);
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
      .then(() => {
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
          let responseClone = response.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function () {
          // return caches.match("/sw-test/gallery/myLittleVader.jpg");
        });
    })
  );
});
