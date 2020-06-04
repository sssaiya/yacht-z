describe("Service Worker Suite", function () {
  beforeEach(function () {
    return window.__testCleanup();
  });

  after(function () {
    return window.__testCleanup();
  });
  it("should register a service worker and cache file on install", function () {
    // 1: Register service worker.
    // 2: Wait for service worker to install.
    // 3: Check cache was performed correctly.
    return navigator.serviceWorker
      .register("../../service-worker.js")
      .then((reg) => {
        return window.__waitForSWState(reg, "installed");
      })
      .then(() => {
        return caches
          .match("/___test/test")
          .then((response) => {
            if (!response) {
              throw new Error("No response was found in the cache.");
            }

            return response.text();
          })
          .then((responseText) => {
            if (responseText !== "Hello World!") {
              throw new Error(
                `The response text was wrong!: '${responseText}'`
              );
            }
          });
      });
  });
});
