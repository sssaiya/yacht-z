const divInstall = document.getElementById("installContainer");
const butInstall = document.getElementById("butInstall");

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

  window.addEventListener("beforeinstallprompt", (event) => {
    console.log("👍", "beforeinstallprompt", event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
    // Remove the 'hidden' class from the install button container
    divInstall.classList.toggle("hidden", false);
  });

  butInstall.addEventListener("click", () => {
    console.log("👍", "Install Button-clicked");
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      // The deferred prompt isn't available.
      return;
    }
    // Show the install prompt.
    promptEvent.prompt();
    // Log the result
    promptEvent.userChoice.then((result) => {
      console.log("👍", "userChoice", result);
      // Reset the deferred prompt variable, since
      // prompt() can only be called once.
      window.deferredPrompt = null;
      // Hide the install button.
      divInstall.classList.toggle("hidden", true);
    });
  });

  window.addEventListener("appinstalled", (event) => {
    console.log("👍", "appinstalled", event);
  });
}
