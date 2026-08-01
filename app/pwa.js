(() => {
  const WIDGET_CACHE_KEY = "wisdomWidgetPreferenceV1";
  const PWA_INITIALIZED_KEY = "wisdomPwaInitializedV1";
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let installPrompt;

  globalThis.chrome ||= {};
  globalThis.chrome.search = {
    async query({ text }) {
      const url = new URL("https://www.google.com/search");
      url.searchParams.set("q", String(text || ""));
      window.location.assign(url.toString());
    }
  };

  try {
    if (!localStorage.getItem(PWA_INITIALIZED_KEY)) {
      localStorage.setItem(PWA_INITIALIZED_KEY, "true");
      localStorage.setItem(WIDGET_CACHE_KEY, "true");
    }
  } catch {
    // The app remains usable when persistent storage is unavailable.
  }

  function updateInstallButton() {
    const button = document.querySelector("#pwa-install");
    if (!button) return;
    button.hidden = isStandalone || !installPrompt;
    button.onclick = async () => {
      if (!installPrompt) return;
      const prompt = installPrompt;
      installPrompt = undefined;
      button.hidden = true;
      await prompt.prompt();
      await prompt.userChoice;
    };
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    updateInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = undefined;
    updateInstallButton();
  });

  window.addEventListener("DOMContentLoaded", updateInstallButton, { once: true });

  window.addEventListener("load", () => {
    const searchInput = document.querySelector("#search-input");
    const searchLabel = document.querySelector('label[for="search-input"]');
    if (searchInput) searchInput.placeholder = "Search Google";
    if (searchLabel) searchLabel.textContent = "Search Google";

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("app/service-worker.js", { scope: "app/" }).catch(() => {});
    }
  }, { once: true });
})();
