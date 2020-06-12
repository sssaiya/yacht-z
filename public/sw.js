if ("serviceWorker" in navigator) {
  //IMP - register service worker on page load event
  //Doing it before it will affect time to interactive on first visit
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/service-worker.js").then(
      function (reg) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          reg.scope
        );
        if (reg.installing) {
          console.log("Service worker installing");
        } else if (reg.waiting) {
          console.log("Service worker installed");
        } else if (reg.active) {
          console.log("Service worker active");
        }
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
