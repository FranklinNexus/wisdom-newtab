(() => {
  const SETTINGS_KEY = "wisdomNewtabSettingsV3";
  const THEME_CACHE_KEY = "wisdomThemePreferenceV1";
  const WIDGET_CACHE_KEY = "wisdomWidgetPreferenceV1";
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

    if (cache) {
      try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(appearance));
      } catch {
        // The regular settings loader remains the fallback when local storage is unavailable.
      }
    }
  }

  function applyWidgetState(collapsed, cache = true) {
    const value = Boolean(collapsed);
    root.dataset.widgets = value ? "collapsed" : "open";

    if (cache) {
      try {
        localStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(value));
      } catch {
        // The regular settings loader remains the fallback when local storage is unavailable.
      }
    }
  }

  const cachedAppearance = sanitizeAppearance(readLocal(THEME_CACHE_KEY));
  const cachedWidgetState = readLocal(WIDGET_CACHE_KEY);
  const hasCachedWidgetState = typeof cachedWidgetState === "boolean";
  const previewSettings = readLocal(SETTINGS_KEY);

  function settle(settings) {
    applyAppearance(cachedAppearance || settings);
    applyWidgetState(hasCachedWidgetState ? cachedWidgetState : settings?.widgetCollapsed);
    root.classList.remove("theme-pending");
  }

  if (cachedAppearance && hasCachedWidgetState) {
    settle(null);
    return;
  }

  const extensionStorage = globalThis.chrome?.storage?.local;
  if (!extensionStorage) {
    settle(previewSettings);
    return;
  }

  extensionStorage.get(SETTINGS_KEY)
    .then((result) => settle(result[SETTINGS_KEY] || previewSettings))
    .catch(() => settle(previewSettings));
})();
