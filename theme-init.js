(() => {
  const SETTINGS_KEY = "wisdomNewtabSettingsV3";
  const THEME_CACHE_KEY = "wisdomThemePreferenceV1";
  const surfaces = ["light", "dark"];
  const palettes = ["warm", "porcelain", "sage", "graphite"];
  const root = document.documentElement;

  function sanitizeAppearance(value) {
    if (!value || typeof value !== "object") return null;
    return {
      surface: surfaces.includes(value.surface) ? value.surface : "light",
      palette: palettes.includes(value.palette) ? value.palette : "warm"
    };
  }

  function readLocal(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function applyAppearance(value, cache = true) {
    const appearance = sanitizeAppearance(value) || { surface: "light", palette: "warm" };
    root.dataset.surface = appearance.surface;
    root.dataset.palette = appearance.palette;
    root.classList.remove("theme-pending");

    if (cache) {
      try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(appearance));
      } catch {
        // The regular settings loader remains the fallback when local storage is unavailable.
      }
    }
  }

  const cachedAppearance = sanitizeAppearance(readLocal(THEME_CACHE_KEY));
  if (cachedAppearance) {
    applyAppearance(cachedAppearance, false);
    return;
  }

  const previewSettings = sanitizeAppearance(readLocal(SETTINGS_KEY));
  const extensionStorage = globalThis.chrome?.storage?.local;
  if (!extensionStorage) {
    applyAppearance(previewSettings);
    return;
  }

  extensionStorage.get(SETTINGS_KEY)
    .then((result) => applyAppearance(result[SETTINGS_KEY] || previewSettings))
    .catch(() => applyAppearance(previewSettings, false));
})();
