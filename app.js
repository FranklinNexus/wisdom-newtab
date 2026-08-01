const STORAGE_KEY = "wisdomNewtabSettingsV3";
const THEME_CACHE_KEY = "wisdomThemePreferenceV1";
const WIDGET_CACHE_KEY = "wisdomWidgetPreferenceV1";
const GITHUB_CACHE_KEY = "wisdomGithubRisingV1";
const GITHUB_REFRESH_INTERVAL = 10 * 60 * 1000;
const GITHUB_RETRY_INTERVAL = 2 * 60 * 1000;
const GITHUB_CACHE_TTL = GITHUB_REFRESH_INTERVAL;
const HACKERNEWS_CACHE_KEY = "wisdomHackerNewsV1";
const HACKERNEWS_REFRESH_INTERVAL = 10 * 60 * 1000;
const HACKERNEWS_CACHE_TTL = HACKERNEWS_REFRESH_INTERVAL;
const FOCUS_DURATIONS = { focus: 25 * 60, break: 5 * 60 };
const SHORTCUT_LONG_PRESS_MS = 520;
const SHORTCUT_PRESS_MOVE_TOLERANCE = 9;
const REQUEST_TIMEOUT_MS = 12 * 1000;
const SETTINGS_TRANSITION_MS = 320;
const SEARCH_NAVIGATION_DELAY_MS = 160;
const PALETTES = ["warm", "porcelain", "sage", "graphite"];
const MAX_SHORTCUTS = 10;
const MAX_LOGO_FILE_BYTES = 5 * 1024 * 1024;
const MAX_STORED_LOGO_LENGTH = 400 * 1024;

const brandLogos = [
  { id: "wisdomechoes", match: /wisdomechoes\.net/i, src: "assets/logos/wisdomechoes.png" },
  { id: "langqian", match: /lang-qian\.com/i, src: "assets/logos/langqian.png" },
  { id: "github", match: /github\.com/i, src: "assets/logos/github.svg" }
];

const shortcutLabelMigrations = {
  wisdomechoes: { from: "WisdomEchoes", to: "Blog" },
  langqian: { from: "\u6d6a\u524d", to: "SurferGarage" }
};

const defaultSettings = {
  locale: "en",
  surface: "light",
  palette: "warm",
  activeWidget: "github",
  widgetCollapsed: false,
  shortcuts: [
    { id: "wisdomechoes", label: "Blog", url: "https://www.wisdomechoes.net/", color: "#29282c" },
    { id: "langqian", label: "SurferGarage", url: "https://www.lang-qian.com/", color: "#ef4f35" },
    { id: "github", label: "GitHub", url: "https://github.com/FranklinNexus", color: "#171717" }
  ]
};

const copy = {
  en: {
    search: "Search the web",
    add: "Add",
    githubTitle: "Trending on GitHub",
    githubViewAll: "View all",
    githubEmpty: "GitHub trends unavailable",
    githubLoading: "Loading GitHub trends...",
    githubNoDescription: "No description yet.",
    githubRetry: "Retry",
    githubRefresh: "Refresh GitHub trends",
    hackernewsTitle: "Hacker News",
    hackernewsViewAll: "Open Hacker News",
    hackernewsEmpty: "Hacker News unavailable",
    hackernewsLoading: "Loading Hacker News...",
    hackernewsRetry: "Retry",
    hackernewsRefresh: "Refresh Hacker News",
    focusTitle: "Focus session",
    focusStart: "Start",
    focusPause: "Pause",
    focusReset: "Reset timer",
    collapseWidgets: "Collapse widgets",
    openWidgets: "Open widgets",
    widgetGithub: "GitHub trends",
    widgetHackernews: "Hacker News",
    widgetFocus: "Focus timer"
  }
};

const extensionStorage = globalThis.chrome?.storage?.local;
const storage = {
  async get(key, fallback) {
    if (extensionStorage) {
      const result = await extensionStorage.get(key);
      return result[key] ?? fallback;
    }
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  async set(key, value) {
    if (extensionStorage) {
      await extensionStorage.set({ [key]: value });
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const elements = {
  focusModes: [...document.querySelectorAll("[data-focus-duration]")],
  focusProgressBar: document.querySelector("#focus-progress-bar"),
  focusReset: document.querySelector("#focus-reset"),
  focusStart: document.querySelector("#focus-start"),
  focusStartLabel: document.querySelector("#focus-start-label"),
  focusTime: document.querySelector("#focus-time"),
  focusTitle: document.querySelector("#focus-title"),
  githubList: document.querySelector("#github-list"),
  githubRepoTemplate: document.querySelector("#github-repo-template"),
  githubSearchLink: document.querySelector("#github-search-link"),
  githubSearchLabel: document.querySelector("#github-search-label"),
  githubTitle: document.querySelector("#github-rising-title"),
  hackernewsItemTemplate: document.querySelector("#hackernews-item-template"),
  hackernewsList: document.querySelector("#hackernews-list"),
  hackernewsSearchLabel: document.querySelector("#hackernews-search-label"),
  hackernewsTitle: document.querySelector("#hackernews-title"),
  homeStage: document.querySelector("#home-stage"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsForm: document.querySelector("#settings-form"),
  shortcutsManage: document.querySelector("#shortcuts-manage"),
  paletteInputs: [...document.querySelectorAll('input[name="palette"]')],
  bookmarkApply: document.querySelector("#bookmark-apply"),
  bookmarkImport: document.querySelector("#bookmark-import"),
  bookmarkImportClose: document.querySelector("#bookmark-import-close"),
  bookmarkImporter: document.querySelector("#bookmark-importer"),
  bookmarkItemTemplate: document.querySelector("#bookmark-item-template"),
  bookmarkList: document.querySelector("#bookmark-list"),
  bookmarkSearch: document.querySelector("#bookmark-search"),
  bookmarkSelectionCount: document.querySelector("#bookmark-selection-count"),
  bookmarkStatus: document.querySelector("#bookmark-status"),
  shortcutAdd: document.querySelector("#shortcut-add"),
  shortcutCount: document.querySelector("#shortcut-count"),
  shortcutEditor: document.querySelector("#shortcut-editor"),
  shortcutEditorTemplate: document.querySelector("#shortcut-editor-template"),
  shortcutGrid: document.querySelector("#shortcut-grid"),
  shortcutSettings: document.querySelector("#shortcut-settings"),
  shortcutStatus: document.querySelector("#shortcut-status"),
  shortcutTemplate: document.querySelector("#shortcut-template"),
  surfaceInputs: [...document.querySelectorAll('input[name="surface"]')],
  widgetCollapse: document.querySelector("#widget-collapse"),
  widgetExpand: document.querySelector("#widget-expand"),
  widgetPanes: [...document.querySelectorAll("[data-widget-pane]")],
  widgetRefresh: document.querySelector("#widget-refresh"),
  widgetTabs: [...document.querySelectorAll("[data-widget-tab]")]
};

let settings = structuredClone(defaultSettings);
const refreshStates = { github: "idle", hackernews: "idle" };
const refreshFeedbackTimers = { github: undefined, hackernews: undefined };
let githubRefreshTimer;
let githubRefreshRequest;
let githubLastFetchedAt = 0;
let githubLastAttemptAt = 0;
let githubRepositories = [];
let hackernewsRefreshRequest;
let hackernewsItems = [];
let focusDuration = FOCUS_DURATIONS.focus;
let focusRemaining = focusDuration;
let focusRunning = false;
let focusEndsAt = 0;
let focusTimer;
let focusCompletedSessions = 0;
let shortcutEditMode = false;
let shortcutPressTimer;
let shortcutPressTarget;
let shortcutPressOrigin;
let shortcutResetPointerId;
let blockNextShortcutActivation = false;
let shortcutActivationResetTimer;
let settingsCloseTimer;
let settingsDialogClosing = false;
let settingsReturnFocus;
let searchNavigationTimer;
let searchNavigationPending = false;
let browserBookmarks = [];
let selectedBookmarkIds = new Set();

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeColor(value, fallback = "#29282c") {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
}

function safeCustomLogo(value) {
  const logo = String(value || "");
  return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(logo)
    && logo.length <= MAX_STORED_LOGO_LENGTH
    ? logo
    : "";
}

function cachedAppearance() {
  try {
    const value = JSON.parse(localStorage.getItem(THEME_CACHE_KEY));
    if (!value || typeof value !== "object") return null;
    return {
      surface: ["light", "dark"].includes(value.surface) ? value.surface : "light",
      palette: PALETTES.includes(value.palette) ? value.palette : "warm"
    };
  } catch {
    return null;
  }
}

function cacheAppearance(surface, palette) {
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ surface, palette }));
  } catch {
    // chrome.storage.local remains the durable settings store.
  }
}

function cachedWidgetCollapsed() {
  try {
    const value = JSON.parse(localStorage.getItem(WIDGET_CACHE_KEY));
    return typeof value === "boolean" ? value : null;
  } catch {
    return null;
  }
}

function cacheWidgetCollapsed(collapsed) {
  try {
    localStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(Boolean(collapsed)));
  } catch {
    // chrome.storage.local remains the durable settings store.
  }
}

function sanitizeSettings(candidate) {
  const value = candidate && typeof candidate === "object" ? candidate : {};
  const legacyLinks = Array.isArray(value.links) ? value.links : [];
  const rawShortcuts = Array.isArray(value.shortcuts) ? value.shortcuts : legacyLinks;
  const shortcuts = rawShortcuts.length
    ? rawShortcuts.slice(0, MAX_SHORTCUTS).map((item, index) => {
        const id = String(item.id || `shortcut-${Date.now()}-${index}`);
        const rawLabel = String(item.label || "Untitled").slice(0, 28);
        const labelMigration = shortcutLabelMigrations[id];
        const normalizedUrl = normalizeUrl(item.url);
        const url = id === "github" && /^https:\/\/github\.com\/kfr34\/?$/i.test(normalizedUrl)
          ? "https://github.com/FranklinNexus"
          : normalizedUrl;
        return {
          id,
          label: labelMigration?.from === rawLabel ? labelMigration.to : rawLabel,
          url,
          color: safeColor(item.color, ["#29282c", "#ef4f35", "#171717", "#3d5c91"][index % 4]),
          logo: safeCustomLogo(item.logo)
        };
      }).filter((item) => item.label)
    : structuredClone(defaultSettings.shortcuts);

  return {
    locale: "en",
    surface: ["light", "dark"].includes(value.surface) ? value.surface : "light",
    palette: PALETTES.includes(value.palette) ? value.palette : "warm",
    activeWidget: ["github", "hackernews", "focus"].includes(value.activeWidget) ? value.activeWidget : "github",
    widgetCollapsed: Boolean(value.widgetCollapsed),
    shortcuts
  };
}

function iconText(shortcut) {
  if (/github\.com/i.test(shortcut.url)) return "GH";
  const clean = shortcut.label.trim();
  if (!clean) return "+";
  return /^[\u3400-\u9fff]/.test(clean) ? clean.slice(0, 1) : clean.slice(0, 1).toUpperCase();
}

function brandLogoFor(url) {
  return brandLogos.find((logo) => logo.match.test(url));
}

function automaticFaviconUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return "";
  if (globalThis.chrome?.runtime?.getURL) {
    const declaredPermissions = chrome.runtime.getManifest?.().permissions;
    if (Array.isArray(declaredPermissions) && !declaredPermissions.includes("favicon")) return "";
    return `${chrome.runtime.getURL("_favicon/")}?pageUrl=${encodeURIComponent(normalized)}&size=64`;
  }
  try {
    return new URL("/favicon.ico", normalized).href;
  } catch {
    return "";
  }
}

function logoSourceFor(shortcut) {
  const customLogo = safeCustomLogo(shortcut.logo);
  if (customLogo) return { src: customLogo, kind: "custom" };
  const brand = brandLogoFor(shortcut.url);
  if (brand) return { src: brand.src, kind: "brand", brand: brand.id };
  const favicon = automaticFaviconUrl(shortcut.url);
  return favicon ? { src: favicon, kind: "favicon" } : null;
}

function paintShortcutLogo(container, image, fallback, shortcut) {
  const source = logoSourceFor(shortcut);
  const revealFallback = () => {
    image.hidden = true;
    fallback.hidden = false;
    container.classList.remove("has-logo");
  };
  const revealImage = () => {
    image.hidden = false;
    fallback.hidden = true;
    container.classList.add("has-logo");
  };

  fallback.textContent = iconText(shortcut);
  image.onload = revealImage;
  image.onerror = revealFallback;
  revealFallback();
  if (!source) {
    image.removeAttribute("src");
    return;
  }

  if (source.brand) container.dataset.brand = source.brand;
  else delete container.dataset.brand;
  image.src = source.src;
  if (image.complete && image.naturalWidth > 0) revealImage();
}

function renderShortcuts() {
  elements.shortcutGrid.replaceChildren();

  settings.shortcuts.slice(0, MAX_SHORTCUTS).forEach((shortcut) => {
    const item = elements.shortcutTemplate.content.firstElementChild.cloneNode(true);
    const tile = item.querySelector(".shortcut");
    const deleteButton = item.querySelector(".shortcut-delete");
    item.dataset.shortcutId = shortcut.id;
    tile.href = shortcut.url;
    tile.style.setProperty("--shortcut-color", shortcut.color);
    const image = tile.querySelector(".shortcut-logo");
    const fallback = tile.querySelector(".shortcut-icon b");
    paintShortcutLogo(tile, image, fallback, shortcut);
    tile.querySelector(".shortcut-label").textContent = shortcut.label;
    deleteButton.setAttribute("aria-label", `Delete ${shortcut.label}`);
    deleteButton.title = `Delete ${shortcut.label}`;
    elements.shortcutGrid.append(item);
  });

  if (settings.shortcuts.length < MAX_SHORTCUTS) {
    const add = document.createElement("button");
    add.type = "button";
    add.className = "shortcut shortcut-add";
    add.setAttribute("aria-label", "Add shortcut");
    add.innerHTML = `
      <span class="shortcut-icon"><svg aria-hidden="true"><use href="assets/icons.svg#plus"></use></svg></span>
      <span class="shortcut-label">${copy[settings.locale].add}</span>
    `;
    add.addEventListener("click", () => openSettings(true));
    elements.shortcutGrid.append(add);
  }
  setShortcutEditMode(shortcutEditMode);
}

function cancelShortcutPress() {
  clearTimeout(shortcutPressTimer);
  shortcutPressTimer = undefined;
  shortcutPressTarget?.classList.remove("is-pressing");
  shortcutPressTarget = undefined;
  shortcutPressOrigin = undefined;
}

function finishShortcutPress() {
  cancelShortcutPress();
}

function blockShortcutActivation() {
  clearTimeout(shortcutActivationResetTimer);
  blockNextShortcutActivation = true;
  shortcutActivationResetTimer = window.setTimeout(() => {
    blockNextShortcutActivation = false;
  }, 1000);
}

function setShortcutEditMode(active, announce = false) {
  shortcutEditMode = Boolean(active);
  elements.shortcutGrid.classList.toggle("is-editing", shortcutEditMode);
  elements.shortcutGrid.querySelectorAll(".shortcut-delete").forEach((button) => {
    button.tabIndex = shortcutEditMode ? 0 : -1;
    button.setAttribute("aria-hidden", String(!shortcutEditMode));
  });
  if (!shortcutEditMode) cancelShortcutPress();
  if (announce) {
    elements.shortcutStatus.textContent = shortcutEditMode
      ? "Shortcut editing enabled. Use a delete button or click elsewhere to finish."
      : "Shortcut editing finished.";
  }
}

function beginShortcutPress(event) {
  if (!event.isPrimary || event.button !== 0 || shortcutEditMode || event.pointerId === shortcutResetPointerId) return;
  const shortcut = event.target.closest(".shortcut-item .shortcut");
  if (!shortcut) return;

  cancelShortcutPress();
  shortcutPressTarget = shortcut.closest(".shortcut-item");
  shortcutPressOrigin = { x: event.clientX, y: event.clientY };
  shortcutPressTarget.classList.add("is-pressing");
  shortcutPressTimer = window.setTimeout(() => {
    shortcutPressTarget?.classList.remove("is-pressing");
    blockShortcutActivation();
    setShortcutEditMode(true, true);
  }, SHORTCUT_LONG_PRESS_MS);
}

function trackShortcutPress(event) {
  if (!shortcutPressOrigin) return;
  const distance = Math.hypot(event.clientX - shortcutPressOrigin.x, event.clientY - shortcutPressOrigin.y);
  if (distance > SHORTCUT_PRESS_MOVE_TOLERANCE) cancelShortcutPress();
}

async function deleteShortcut(shortcutId) {
  const shortcut = settings.shortcuts.find((item) => item.id === shortcutId);
  if (!shortcut) return;
  settings.shortcuts = settings.shortcuts.filter((item) => item.id !== shortcutId);
  await storage.set(STORAGE_KEY, settings);
  renderShortcuts();
  renderSettings();
  elements.shortcutStatus.textContent = `${shortcut.label} deleted.`;
}

function githubQuery() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);
  return `created:>=${since.toISOString().slice(0, 10)} stars:>5`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function renderRefreshState() {
  const state = refreshStates[settings.activeWidget] || "idle";
  elements.widgetRefresh.classList.remove("is-loading", "is-success", "is-error");
  if (state !== "idle") elements.widgetRefresh.classList.add(`is-${state}`);
  elements.widgetRefresh.disabled = state === "loading";
  elements.widgetRefresh.setAttribute("aria-busy", String(state === "loading"));
}

function setRefreshState(state, widget = settings.activeWidget) {
  if (!(widget in refreshStates)) return;
  clearTimeout(refreshFeedbackTimers[widget]);
  refreshStates[widget] = state;
  if (widget === settings.activeWidget) renderRefreshState();

  if (state === "success" || state === "error") {
    refreshFeedbackTimers[widget] = window.setTimeout(() => {
      refreshStates[widget] = "idle";
      if (widget === settings.activeWidget) renderRefreshState();
    }, 900);
  }
}

async function withRequestTimeout(task, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

function renderGitHubState(message, retry = false) {
  githubRepositories = [];
  elements.githubList.replaceChildren();
  const item = document.createElement("li");
  item.className = "widget-state";
  const text = document.createElement("span");
  text.textContent = message;
  item.append(text);

  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button";
    button.textContent = copy[settings.locale].githubRetry;
    button.addEventListener("click", () => loadGitHubRising(true));
    item.append(button);
  }

  elements.githubList.append(item);
}

function renderGitHubRepos(repositories) {
  githubRepositories = repositories;
  elements.githubList.replaceChildren();
  repositories.forEach((repository, index) => {
    const item = elements.githubRepoTemplate.content.firstElementChild.cloneNode(true);
    const link = item.querySelector("a");
    link.href = repository.url;
    item.querySelector(".github-rank").textContent = String(index + 1).padStart(2, "0");
    item.querySelector(".github-language").textContent = (repository.language || "OTHER").toUpperCase();
    item.querySelector("h3").textContent = repository.name;
    item.querySelector("p").textContent = repository.description || copy[settings.locale].githubNoDescription;
    item.querySelector('[data-stat="stars"]').textContent = formatCompactNumber(repository.stars);
    item.querySelector('[data-stat="forks"]').textContent = formatCompactNumber(repository.forks);
    elements.githubList.append(item);
  });
}

function nextGitHubRefreshDelay(now = Date.now()) {
  const nextRegularRefresh = githubLastFetchedAt
    ? githubLastFetchedAt + GITHUB_REFRESH_INTERVAL
    : now + GITHUB_REFRESH_INTERVAL;
  const nextRetry = githubLastAttemptAt ? githubLastAttemptAt + GITHUB_RETRY_INTERVAL : 0;
  return Math.max(1000, Math.max(nextRegularRefresh, nextRetry) - now);
}

function scheduleGitHubRefresh() {
  clearTimeout(githubRefreshTimer);
  if (document.hidden) return;

  githubRefreshTimer = setTimeout(() => {
    loadGitHubRising(false);
  }, nextGitHubRefreshDelay());
}

async function syncGitHubRising(force = false) {
  const cached = await storage.get(GITHUB_CACHE_KEY, null);
  const hasCachedItems = Array.isArray(cached?.items) && cached.items.length > 0;
  const cacheIsFresh = hasCachedItems && Date.now() - Number(cached.fetchedAt) < GITHUB_CACHE_TTL;
  const query = githubQuery();
  elements.githubSearchLink.href = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories&s=stars&o=desc`;

  if (hasCachedItems) {
    githubLastFetchedAt = Number(cached.fetchedAt) || 0;
    renderGitHubRepos(cached.items);
  } else {
    renderGitHubState(copy[settings.locale].githubLoading);
  }

  if (!force && cacheIsFresh) return;
  if (!navigator.onLine) {
    githubLastAttemptAt = Date.now();
    if (force) setRefreshState("error", "github");
    if (!hasCachedItems) {
      renderGitHubState(copy[settings.locale].githubEmpty, true);
    }
    return;
  }

  const apiUrl = new URL("https://api.github.com/search/repositories");
  apiUrl.search = new URLSearchParams({ q: query, sort: "stars", order: "desc", per_page: "5" }).toString();
  githubLastAttemptAt = Date.now();
  setRefreshState("loading", "github");

  try {
    const payload = await withRequestTimeout(async (signal) => {
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github+json" },
        signal
      });
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    });
    const repositories = (payload.items || []).slice(0, 5).map((repository) => ({
      name: String(repository.full_name || repository.name || "Untitled"),
      url: normalizeUrl(repository.html_url),
      description: String(repository.description || "").slice(0, 180),
      language: String(repository.language || ""),
      stars: Number(repository.stargazers_count) || 0,
      forks: Number(repository.forks_count) || 0
    })).filter((repository) => repository.url);
    if (!repositories.length) throw new Error("GitHub API returned no repositories");

    const cache = { fetchedAt: Date.now(), items: repositories };
    await storage.set(GITHUB_CACHE_KEY, cache);
    githubLastFetchedAt = cache.fetchedAt;
    renderGitHubRepos(repositories);
    setRefreshState("success", "github");
  } catch {
    setRefreshState("error", "github");
    if (!hasCachedItems) {
      renderGitHubState(copy[settings.locale].githubEmpty, true);
    }
  } finally {
    if (refreshStates.github === "loading") setRefreshState("idle", "github");
  }
}

function loadGitHubRising(force = false) {
  if (githubRefreshRequest) return githubRefreshRequest;

  githubRefreshRequest = syncGitHubRising(force).finally(() => {
    githubRefreshRequest = null;
    scheduleGitHubRefresh();
  });
  return githubRefreshRequest;
}

function formatRelativeTime(unixSeconds) {
  const minutes = Math.max(1, Math.floor((Date.now() - Number(unixSeconds) * 1000) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function renderHackerNewsState(message, retry = false) {
  hackernewsItems = [];
  elements.hackernewsList.replaceChildren();
  const item = document.createElement("li");
  item.className = "widget-state";
  const text = document.createElement("span");
  text.textContent = message;
  item.append(text);

  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button";
    button.textContent = copy[settings.locale].hackernewsRetry;
    button.addEventListener("click", () => loadHackerNews(true));
    item.append(button);
  }

  elements.hackernewsList.append(item);
}

function renderHackerNewsItems(items) {
  hackernewsItems = items;
  elements.hackernewsList.replaceChildren();
  items.forEach((story, index) => {
    const item = elements.hackernewsItemTemplate.content.firstElementChild.cloneNode(true);
    const link = item.querySelector("a");
    link.href = story.url;
    item.querySelector(".hackernews-rank").textContent = String(index + 1).padStart(2, "0");
    item.querySelector(".hackernews-meta").textContent = `${formatCompactNumber(story.score)} PTS`;
    item.querySelector("h3").textContent = story.title;
    item.querySelector("p").textContent = `${story.by} / ${formatRelativeTime(story.time)} / ${formatCompactNumber(story.comments)} comments`;
    elements.hackernewsList.append(item);
  });
}

async function syncHackerNews(force = false) {
  const cached = await storage.get(HACKERNEWS_CACHE_KEY, null);
  const hasCachedItems = Array.isArray(cached?.items) && cached.items.length > 0;
  const cacheIsFresh = hasCachedItems && Date.now() - Number(cached.fetchedAt) < HACKERNEWS_CACHE_TTL;

  if (hasCachedItems) {
    renderHackerNewsItems(cached.items);
  } else {
    renderHackerNewsState(copy[settings.locale].hackernewsLoading);
  }

  if (!force && cacheIsFresh) return;
  if (!navigator.onLine) {
    if (force) setRefreshState("error", "hackernews");
    if (!hasCachedItems) renderHackerNewsState(copy[settings.locale].hackernewsEmpty, true);
    return;
  }

  setRefreshState("loading", "hackernews");

  try {
    const stories = await withRequestTimeout(async (signal) => {
      const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { signal });
      if (!idsResponse.ok) throw new Error(`Hacker News API returned ${idsResponse.status}`);
      const ids = await idsResponse.json();
      return Promise.all((ids || []).slice(0, 12).map(async (id) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal });
        if (!response.ok) return null;
        return response.json();
      }));
    });
    const items = stories.filter((story) => story?.type === "story" && story.title).slice(0, 5).map((story) => ({
      id: Number(story.id),
      title: String(story.title).slice(0, 180),
      url: normalizeUrl(story.url) || `https://news.ycombinator.com/item?id=${story.id}`,
      by: String(story.by || "unknown"),
      time: Number(story.time) || 0,
      score: Number(story.score) || 0,
      comments: Number(story.descendants) || 0
    }));
    if (!items.length) throw new Error("Hacker News API returned no stories");

    await storage.set(HACKERNEWS_CACHE_KEY, { fetchedAt: Date.now(), items });
    renderHackerNewsItems(items);
    setRefreshState("success", "hackernews");
  } catch {
    setRefreshState("error", "hackernews");
    if (!hasCachedItems) renderHackerNewsState(copy[settings.locale].hackernewsEmpty, true);
  } finally {
    if (refreshStates.hackernews === "loading") setRefreshState("idle", "hackernews");
  }
}

function loadHackerNews(force = false) {
  if (hackernewsRefreshRequest) return hackernewsRefreshRequest;
  hackernewsRefreshRequest = syncHackerNews(force).finally(() => {
    hackernewsRefreshRequest = null;
  });
  return hackernewsRefreshRequest;
}

function renderFocusTimer() {
  const minutes = Math.floor(focusRemaining / 60);
  const seconds = Math.max(0, focusRemaining % 60);
  elements.focusTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  elements.focusProgressBar.style.width = `${Math.min(100, Math.max(0, (1 - focusRemaining / focusDuration) * 100))}%`;
  elements.focusStartLabel.textContent = copy[settings.locale][focusRunning ? "focusPause" : "focusStart"];
  elements.focusStart.querySelector("use").setAttribute("href", `assets/icons.svg#${focusRunning ? "pause" : "play"}`);
  document.querySelectorAll(".focus-sessions span").forEach((dot, index) => {
    dot.classList.toggle("is-complete", index < Math.min(4, focusCompletedSessions));
  });
}

function tickFocusTimer() {
  focusRemaining = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
  if (focusRemaining === 0) {
    clearInterval(focusTimer);
    focusRunning = false;
    focusCompletedSessions += 1;
  }
  renderFocusTimer();
}

function toggleFocusTimer() {
  if (focusRunning) {
    focusRemaining = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
    clearInterval(focusTimer);
    focusRunning = false;
    renderFocusTimer();
    return;
  }

  if (focusRemaining <= 0) focusRemaining = focusDuration;
  focusRunning = true;
  focusEndsAt = Date.now() + focusRemaining * 1000;
  clearInterval(focusTimer);
  focusTimer = setInterval(tickFocusTimer, 250);
  renderFocusTimer();
}

function resetFocusTimer() {
  clearInterval(focusTimer);
  focusRunning = false;
  focusRemaining = focusDuration;
  renderFocusTimer();
}

function setFocusDuration(minutes) {
  focusDuration = Number(minutes) * 60;
  focusRemaining = focusDuration;
  focusRunning = false;
  clearInterval(focusTimer);
  elements.focusModes.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.focusDuration) === Number(minutes));
  });
  renderFocusTimer();
}

function applyWidgetState() {
  document.documentElement.dataset.widgets = settings.widgetCollapsed ? "collapsed" : "open";
  cacheWidgetCollapsed(settings.widgetCollapsed);
  elements.homeStage.classList.toggle("is-widget-collapsed", settings.widgetCollapsed);
  elements.widgetTabs.forEach((tab) => {
    const active = tab.dataset.widgetTab === settings.activeWidget;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  elements.widgetPanes.forEach((pane) => {
    const active = pane.dataset.widgetPane === settings.activeWidget;
    pane.hidden = !active;
    pane.classList.toggle("is-active", active);
  });
  elements.widgetRefresh.hidden = settings.activeWidget === "focus";
  const refreshKey = settings.activeWidget === "hackernews" ? "hackernewsRefresh" : "githubRefresh";
  elements.widgetRefresh.setAttribute("aria-label", copy[settings.locale][refreshKey]);
  elements.widgetRefresh.title = copy[settings.locale][refreshKey];
  renderRefreshState();

  if (settings.activeWidget === "hackernews") loadHackerNews(false);
  if (settings.activeWidget === "github") loadGitHubRising(false);
}

async function selectWidget(widget) {
  if (!["github", "hackernews", "focus"].includes(widget)) return;
  settings.activeWidget = widget;
  await storage.set(STORAGE_KEY, settings);
  applyWidgetState();
}

async function setWidgetCollapsed(collapsed) {
  settings.widgetCollapsed = collapsed;
  applyWidgetState();
  await storage.set(STORAGE_KEY, settings);
}

function applyAppearance(surface, palette) {
  settings.surface = surface;
  settings.palette = palette;
  document.documentElement.dataset.surface = surface;
  document.documentElement.dataset.palette = palette;
  cacheAppearance(surface, palette);
}

async function switchAppearance(updates, source) {
  const nextSurface = ["light", "dark"].includes(updates.surface) ? updates.surface : settings.surface;
  const nextPalette = PALETTES.includes(updates.palette) ? updates.palette : settings.palette;
  if (nextSurface === settings.surface && nextPalette === settings.palette) return;

  const trigger = source.closest("label") || source;
  const bounds = trigger.getBoundingClientRect();
  const originX = Math.round(bounds.left + bounds.width / 2);
  const originY = Math.round(bounds.top + bounds.height / 2);
  const radius = Math.ceil(Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY)
  ));
  const root = document.documentElement;
  root.style.setProperty("--theme-origin-x", `${originX}px`);
  root.style.setProperty("--theme-origin-y", `${originY}px`);
  root.style.setProperty("--theme-radius", `${radius}px`);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reducedMotion) {
    applyAppearance(nextSurface, nextPalette);
  } else {
    root.classList.add("is-theme-switching");
    try {
      const transition = document.startViewTransition(() => applyAppearance(nextSurface, nextPalette));
      await transition.finished;
    } catch {
      applyAppearance(nextSurface, nextPalette);
    } finally {
      root.classList.remove("is-theme-switching");
    }
  }

  await storage.set(STORAGE_KEY, settings);
}

function applySettings() {
  applyAppearance(settings.surface, settings.palette);
  elements.searchInput.placeholder = copy[settings.locale].search;
  elements.githubTitle.textContent = copy[settings.locale].githubTitle;
  elements.githubSearchLabel.textContent = copy[settings.locale].githubViewAll;
  elements.hackernewsTitle.textContent = copy[settings.locale].hackernewsTitle;
  elements.hackernewsSearchLabel.textContent = copy[settings.locale].hackernewsViewAll;
  elements.focusTitle.textContent = copy[settings.locale].focusTitle;
  elements.focusReset.setAttribute("aria-label", copy[settings.locale].focusReset);
  elements.focusReset.title = copy[settings.locale].focusReset;
  elements.widgetCollapse.setAttribute("aria-label", copy[settings.locale].collapseWidgets);
  elements.widgetCollapse.title = copy[settings.locale].collapseWidgets;
  elements.widgetExpand.setAttribute("aria-label", copy[settings.locale].openWidgets);
  elements.widgetExpand.title = copy[settings.locale].openWidgets;
  const widgetLabels = {
    github: copy[settings.locale].widgetGithub,
    hackernews: copy[settings.locale].widgetHackernews,
    focus: copy[settings.locale].widgetFocus
  };
  elements.widgetTabs.forEach((tab) => {
    const label = widgetLabels[tab.dataset.widgetTab];
    tab.setAttribute("aria-label", label);
    tab.title = label;
  });
  if (githubRepositories.length) renderGitHubRepos(githubRepositories);
  if (hackernewsItems.length) renderHackerNewsItems(hackernewsItems);
  renderFocusTimer();
  applyWidgetState();
  renderShortcuts();
}

function renderSettings() {
  const surfaceChoice = elements.settingsForm.querySelector(`input[name="surface"][value="${settings.surface}"]`);
  if (surfaceChoice) surfaceChoice.checked = true;
  const paletteChoice = elements.settingsForm.querySelector(`input[name="palette"][value="${settings.palette}"]`);
  if (paletteChoice) paletteChoice.checked = true;

  elements.shortcutEditor.replaceChildren();
  settings.shortcuts.forEach((shortcut) => addEditorRow(shortcut));
  closeBookmarkImporter();
  updateShortcutEditorState();
}

function addEditorRow(shortcut = {}) {
  if (elements.shortcutEditor.children.length >= MAX_SHORTCUTS) return false;
  const row = elements.shortcutEditorTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.id = shortcut.id || `shortcut-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  row.logo = safeCustomLogo(shortcut.logo);
  const labelInput = row.querySelector('[data-field="label"]');
  const urlInput = row.querySelector('[data-field="url"]');
  const fileInput = row.querySelector('[data-field="logo-file"]');
  labelInput.value = shortcut.label || "";
  urlInput.value = shortcut.url || "";
  row.querySelector('[data-field="color"]').value = safeColor(shortcut.color, "#29282c");
  row.querySelector(".remove-shortcut").addEventListener("click", () => {
    row.remove();
    updateShortcutEditorState();
    if (!elements.bookmarkImporter.hidden) renderBookmarkItems();
  });
  row.querySelector(".logo-picker").addEventListener("click", () => fileInput.click());
  row.querySelector(".logo-auto").addEventListener("click", () => {
    row.logo = "";
    renderEditorLogo(row);
    elements.shortcutStatus.textContent = `${labelInput.value.trim() || "Shortcut"} now uses its website logo.`;
  });
  fileInput.addEventListener("change", async () => {
    const [file] = fileInput.files || [];
    if (!file) return;
    try {
      row.logo = await prepareCustomLogo(file);
      renderEditorLogo(row);
      elements.shortcutStatus.textContent = `${labelInput.value.trim() || "Shortcut"} logo updated.`;
    } catch (error) {
      elements.shortcutStatus.textContent = error.message;
    } finally {
      fileInput.value = "";
    }
  });
  let previewTimer;
  const refreshPreview = () => {
    clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => renderEditorLogo(row), 180);
  };
  urlInput.addEventListener("input", refreshPreview);
  labelInput.addEventListener("input", refreshPreview);
  elements.shortcutEditor.append(row);
  renderEditorLogo(row);
  updateShortcutEditorState();
  return true;
}

function collectShortcuts() {
  return [...elements.shortcutEditor.querySelectorAll(".shortcut-row")]
    .map((row) => ({
      id: row.dataset.id,
      label: row.querySelector('[data-field="label"]').value.trim(),
      url: normalizeUrl(row.querySelector('[data-field="url"]').value),
      color: safeColor(row.querySelector('[data-field="color"]').value),
      logo: safeCustomLogo(row.logo)
    }))
    .filter((shortcut) => shortcut.label && shortcut.url);
}

function renderEditorLogo(row) {
  const preview = row.querySelector(".logo-preview");
  const image = preview.querySelector("img");
  const fallback = preview.querySelector("b");
  const shortcut = {
    label: row.querySelector('[data-field="label"]').value.trim() || "Shortcut",
    url: row.querySelector('[data-field="url"]').value,
    logo: row.logo
  };
  paintShortcutLogo(preview, image, fallback, shortcut);
  row.querySelector(".logo-auto").hidden = !safeCustomLogo(row.logo);
}

function prepareCustomLogo(file) {
  if (!/^image\/(?:png|jpeg|webp)$/i.test(file.type)) {
    return Promise.reject(new Error("Choose a PNG, JPG, or WebP image."));
  }
  if (file.size > MAX_LOGO_FILE_BYTES) {
    return Promise.reject(new Error("The logo image must be smaller than 5 MB."));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext("2d");
      const scale = Math.min(112 / image.naturalWidth, 112 / image.naturalHeight);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, Math.round((128 - width) / 2), Math.round((128 - height) / 2), width, height);
      const logo = canvas.toDataURL("image/png");
      if (!safeCustomLogo(logo)) {
        reject(new Error("The processed logo is too large to store."));
        return;
      }
      resolve(logo);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The logo image could not be read."));
    };
    image.src = objectUrl;
  });
}

function updateShortcutEditorState() {
  const count = elements.shortcutEditor.children.length;
  elements.shortcutCount.textContent = `${count} / ${MAX_SHORTCUTS}`;
  elements.shortcutAdd.disabled = count >= MAX_SHORTCUTS;
  elements.bookmarkImport.disabled = count >= MAX_SHORTCUTS || !elements.bookmarkImporter.hidden;
}

function colorForUrl(url) {
  const colors = ["#29282c", "#3d5c91", "#2f7a56", "#8f4d38", "#6c4f8b", "#2563c9"];
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    // The sanitized bookmark URL is used as a stable fallback.
  }
  const hash = [...host].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return colors[hash % colors.length];
}

function flattenBookmarkTree(nodes, path = [], output = []) {
  nodes.forEach((node) => {
    if (node.url) {
      const url = normalizeUrl(node.url);
      if (url) {
        output.push({
          id: String(node.id),
          title: String(node.title || new URL(url).hostname).slice(0, 80),
          url,
          folder: path.filter(Boolean).join(" / ")
        });
      }
      return;
    }
    const nextPath = node.title ? [...path, String(node.title)] : path;
    if (Array.isArray(node.children)) flattenBookmarkTree(node.children, nextPath, output);
  });
  return output;
}

function renderBookmarkState(message, preserveSelection = false) {
  elements.bookmarkList.replaceChildren();
  const state = document.createElement("p");
  state.className = "bookmark-state";
  state.textContent = message;
  elements.bookmarkList.append(state);
  if (!preserveSelection) selectedBookmarkIds = new Set();
  const available = Math.max(0, MAX_SHORTCUTS - elements.shortcutEditor.children.length);
  elements.bookmarkApply.disabled = selectedBookmarkIds.size === 0;
  elements.bookmarkSelectionCount.textContent = preserveSelection
    ? `${selectedBookmarkIds.size} selected · ${available} available`
    : "0 selected";
}

function renderBookmarkItems() {
  const query = elements.bookmarkSearch.value.trim().toLowerCase();
  const existingUrls = new Set(collectShortcuts().map((shortcut) => shortcut.url));
  const matches = browserBookmarks.filter((bookmark) => {
    if (!query) return true;
    return `${bookmark.title} ${bookmark.url} ${bookmark.folder}`.toLowerCase().includes(query);
  });
  elements.bookmarkList.replaceChildren();
  if (!matches.length) {
    renderBookmarkState(query ? "No matching bookmarks." : "No browser bookmarks found.", Boolean(query));
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach((bookmark) => {
    const item = elements.bookmarkItemTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const duplicate = existingUrls.has(bookmark.url);
    item.dataset.bookmarkId = bookmark.id;
    checkbox.checked = selectedBookmarkIds.has(bookmark.id);
    checkbox.disabled = duplicate;
    item.classList.toggle("is-duplicate", duplicate);
    item.querySelector("strong").textContent = bookmark.title;
    let host = bookmark.url;
    try {
      host = new URL(bookmark.url).hostname.replace(/^www\./, "");
    } catch {
      // Keep the URL when a hostname cannot be derived.
    }
    item.querySelector("small").textContent = duplicate
      ? "Already added"
      : [bookmark.folder, host].filter(Boolean).join(" · ");
    paintShortcutLogo(
      item.querySelector(".bookmark-logo"),
      item.querySelector(".bookmark-logo img"),
      item.querySelector(".bookmark-logo b"),
      { label: bookmark.title, url: bookmark.url }
    );
    checkbox.addEventListener("change", updateBookmarkSelection);
    fragment.append(item);
  });
  elements.bookmarkList.append(fragment);
  updateBookmarkSelection();
}

function updateBookmarkSelection(event) {
  const available = Math.max(0, MAX_SHORTCUTS - elements.shortcutEditor.children.length);
  if (event?.target) {
    const bookmarkId = event.target.closest(".bookmark-item")?.dataset.bookmarkId;
    if (event.target.checked && selectedBookmarkIds.size >= available) {
      event.target.checked = false;
      elements.bookmarkStatus.textContent = `You can add ${available} more shortcut${available === 1 ? "" : "s"}.`;
    } else if (bookmarkId) {
      if (event.target.checked) selectedBookmarkIds.add(bookmarkId);
      else selectedBookmarkIds.delete(bookmarkId);
    }
  }
  if (selectedBookmarkIds.size > available) {
    selectedBookmarkIds = new Set([...selectedBookmarkIds].slice(0, available));
  }
  elements.bookmarkList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    const item = checkbox.closest(".bookmark-item");
    const id = item?.dataset.bookmarkId;
    checkbox.checked = selectedBookmarkIds.has(id);
    checkbox.disabled = item?.classList.contains("is-duplicate")
      || (!checkbox.checked && selectedBookmarkIds.size >= available);
  });
  elements.bookmarkSelectionCount.textContent = `${selectedBookmarkIds.size} selected · ${available} available`;
  elements.bookmarkApply.disabled = selectedBookmarkIds.size === 0;
}

function requestBookmarkPermission() {
  return new Promise((resolve) => {
    if (!globalThis.chrome?.permissions?.request) {
      resolve(false);
      return;
    }
    chrome.permissions.request({ permissions: ["bookmarks"] }, (granted) => {
      if (chrome.runtime?.lastError) {
        resolve(false);
        return;
      }
      resolve(Boolean(granted));
    });
  });
}

function readBrowserBookmarks() {
  return new Promise((resolve, reject) => {
    if (!globalThis.chrome?.bookmarks?.getTree) {
      reject(new Error("Bookmark access is unavailable."));
      return;
    }
    chrome.bookmarks.getTree((tree) => {
      const error = chrome.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(tree || []);
    });
  });
}

async function openBookmarkImporter() {
  selectedBookmarkIds = new Set();
  elements.settingsDialog.classList.add("is-importing");
  elements.bookmarkImporter.hidden = false;
  elements.bookmarkImport.disabled = true;
  renderBookmarkState("Connecting to browser bookmarks...");
  const granted = await requestBookmarkPermission();
  if (!granted) {
    renderBookmarkState(globalThis.chrome?.runtime
      ? "Bookmark access was not granted."
      : "Bookmark import is available in the installed Chrome or Edge extension.");
    return;
  }
  try {
    browserBookmarks = flattenBookmarkTree(await readBrowserBookmarks());
    renderBookmarkItems();
    elements.shortcutSettings.scrollIntoView({ block: "start" });
    elements.bookmarkSearch.focus({ preventScroll: true });
  } catch {
    renderBookmarkState("Browser bookmarks could not be loaded.");
  }
}

function closeBookmarkImporter() {
  elements.settingsDialog.classList.remove("is-importing");
  elements.bookmarkImporter.hidden = true;
  elements.bookmarkSearch.value = "";
  elements.bookmarkList.replaceChildren();
  selectedBookmarkIds = new Set();
  elements.bookmarkImport.disabled = elements.shortcutEditor.children.length >= MAX_SHORTCUTS;
}

function applySelectedBookmarks() {
  const selectedIds = new Set(selectedBookmarkIds);
  let added = 0;
  browserBookmarks.forEach((bookmark) => {
    if (!selectedIds.has(bookmark.id) || elements.shortcutEditor.children.length >= MAX_SHORTCUTS) return;
    if (addEditorRow({
      id: `bookmark-${bookmark.id}`,
      label: bookmark.title.slice(0, 28),
      url: bookmark.url,
      color: colorForUrl(bookmark.url)
    })) added += 1;
  });
  closeBookmarkImporter();
  elements.bookmarkStatus.textContent = `${added} bookmark${added === 1 ? "" : "s"} added.`;
  updateShortcutEditorState();
}

function openSettings() {
  if (elements.settingsDialog.open || settingsDialogClosing) return;
  setShortcutEditMode(false);
  renderSettings();
  settingsReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.shortcutsManage;
  settingsDialogClosing = false;
  clearTimeout(settingsCloseTimer);
  elements.settingsDialog.classList.remove("is-open", "is-closing");
  elements.shortcutsManage.classList.add("is-active");
  elements.shortcutsManage.setAttribute("aria-expanded", "true");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) elements.settingsDialog.classList.add("is-open");
  elements.settingsDialog.showModal();
  if (!reducedMotion) {
    elements.settingsDialog.getBoundingClientRect();
    requestAnimationFrame(() => elements.settingsDialog.classList.add("is-open"));
  }
  requestAnimationFrame(() => elements.shortcutSettings.scrollIntoView({ block: "start" }));
}

function finishSettingsClose() {
  if (!elements.settingsDialog.open) return;
  clearTimeout(settingsCloseTimer);
  elements.settingsDialog.close();
  elements.settingsDialog.classList.remove("is-open", "is-closing");
  elements.shortcutsManage.classList.remove("is-active");
  elements.shortcutsManage.setAttribute("aria-expanded", "false");
  settingsDialogClosing = false;
  const returnFocus = settingsReturnFocus;
  settingsReturnFocus = undefined;
  requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
}

function closeSettings() {
  if (!elements.settingsDialog.open || settingsDialogClosing) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishSettingsClose();
    return;
  }

  settingsDialogClosing = true;
  elements.settingsDialog.classList.add("is-closing");
  elements.settingsDialog.classList.remove("is-open");
  elements.shortcutsManage.classList.remove("is-active");
  elements.shortcutsManage.setAttribute("aria-expanded", "false");
  settingsCloseTimer = window.setTimeout(finishSettingsClose, SETTINGS_TRANSITION_MS + 80);
}

function reportSearchUnavailable() {
  elements.shortcutStatus.textContent = "Search is unavailable. Check your browser search settings.";
  resetSearchNavigation();
}

async function submitToSelectedSearchEngine(query) {
  if (typeof globalThis.chrome?.search?.query !== "function") {
    reportSearchUnavailable();
    return;
  }

  try {
    await globalThis.chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
  } catch {
    reportSearchUnavailable();
  }
}

function resetSearchNavigation() {
  clearTimeout(searchNavigationTimer);
  searchNavigationTimer = undefined;
  searchNavigationPending = false;
  document.body.classList.remove("is-navigating");
  elements.searchForm.classList.remove("is-submitting");
  elements.searchForm.setAttribute("aria-busy", "false");
}

function navigateFromSearch(query) {
  if (searchNavigationPending) return;
  searchNavigationPending = true;
  elements.searchForm.classList.add("is-submitting");
  elements.searchForm.setAttribute("aria-busy", "true");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void submitToSelectedSearchEngine(query);
    return;
  }

  document.body.classList.add("is-navigating");
  searchNavigationTimer = window.setTimeout(() => {
    void submitToSelectedSearchEngine(query);
  }, SEARCH_NAVIGATION_DELAY_MS);
}

async function initialize() {
  const bookmarkImportAvailable = Boolean(
    globalThis.chrome?.permissions?.request && globalThis.chrome?.bookmarks?.getTree
  );
  elements.bookmarkImport.hidden = !bookmarkImportAvailable;

  const storedSettings = sanitizeSettings(await storage.get(STORAGE_KEY, defaultSettings));
  const appearance = cachedAppearance();
  const widgetCollapsed = cachedWidgetCollapsed();
  settings = sanitizeSettings({
    ...storedSettings,
    ...(appearance || {}),
    ...(widgetCollapsed === null ? {} : { widgetCollapsed })
  });
  await storage.set(STORAGE_KEY, settings);
  applySettings();
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (query) navigateFromSearch(query);
});

window.addEventListener("pageshow", resetSearchNavigation);

elements.shortcutsManage.addEventListener("click", openSettings);
document.querySelector("#settings-close").addEventListener("click", closeSettings);
elements.shortcutAdd.addEventListener("click", () => {
  if (!elements.bookmarkImporter.hidden) closeBookmarkImporter();
  addEditorRow({ color: "#3d5c91" });
});
elements.bookmarkImport.addEventListener("click", openBookmarkImporter);
elements.bookmarkImportClose.addEventListener("click", closeBookmarkImporter);
elements.bookmarkApply.addEventListener("click", applySelectedBookmarks);
elements.bookmarkSearch.addEventListener("input", renderBookmarkItems);

elements.surfaceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) switchAppearance({ surface: input.value }, input);
  });
});

elements.paletteInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) switchAppearance({ palette: input.value }, input);
  });
});

elements.shortcutGrid.addEventListener("pointerdown", beginShortcutPress);
elements.shortcutGrid.addEventListener("pointermove", trackShortcutPress);
elements.shortcutGrid.addEventListener("pointerup", finishShortcutPress);
elements.shortcutGrid.addEventListener("pointercancel", finishShortcutPress);
elements.shortcutGrid.addEventListener("pointerleave", finishShortcutPress);
elements.shortcutGrid.addEventListener("dragstart", (event) => event.preventDefault());
elements.shortcutGrid.addEventListener("contextmenu", (event) => {
  if (shortcutEditMode || !event.target.closest(".shortcut-item .shortcut")) return;
  event.preventDefault();
  blockShortcutActivation();
  setShortcutEditMode(true, true);
});
elements.shortcutGrid.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".shortcut-delete");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    deleteShortcut(deleteButton.closest(".shortcut-item")?.dataset.shortcutId);
    return;
  }

  if (blockNextShortcutActivation) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(shortcutActivationResetTimer);
    blockNextShortcutActivation = false;
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!shortcutEditMode || event.target.closest(".shortcut-delete")) return;
  if (event.target.closest("#shortcut-grid")) {
    shortcutResetPointerId = event.pointerId;
    blockShortcutActivation();
    event.stopPropagation();
  }
  setShortcutEditMode(false, true);
}, true);

document.addEventListener("pointerup", (event) => {
  if (event.pointerId === shortcutResetPointerId) shortcutResetPointerId = undefined;
}, true);

elements.widgetTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectWidget(tab.dataset.widgetTab));
});

elements.widgetCollapse.addEventListener("click", () => setWidgetCollapsed(true));
elements.widgetExpand.addEventListener("click", () => setWidgetCollapsed(false));
elements.widgetRefresh.addEventListener("click", () => {
  if (settings.activeWidget === "hackernews") {
    loadHackerNews(true);
    return;
  }
  loadGitHubRising(true);
});

elements.focusStart.addEventListener("click", toggleFocusTimer);
elements.focusReset.addEventListener("click", resetFocusTimer);
elements.focusModes.forEach((button) => {
  button.addEventListener("click", () => setFocusDuration(button.dataset.focusDuration));
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(githubRefreshTimer);
    return;
  }
  if (settings.activeWidget === "hackernews") loadHackerNews(false);
  if (settings.activeWidget === "github") loadGitHubRising(false);
});

window.addEventListener("online", () => {
  if (document.hidden) return;
  if (settings.activeWidget === "hackernews") loadHackerNews(false);
  if (settings.activeWidget === "github") loadGitHubRising(false);
});

elements.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  settings = sanitizeSettings({
    ...settings,
    surface: new FormData(elements.settingsForm).get("surface"),
    palette: new FormData(elements.settingsForm).get("palette"),
    shortcuts: collectShortcuts()
  });
  await storage.set(STORAGE_KEY, settings);
  applySettings();
  closeSettings();
});

elements.settingsDialog.addEventListener("click", (event) => {
  if (event.target === elements.settingsDialog) closeSettings();
});
elements.settingsDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeSettings();
});
elements.settingsDialog.addEventListener("transitionend", (event) => {
  if (settingsDialogClosing && event.target === elements.settingsDialog && event.propertyName === "transform") {
    finishSettingsClose();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.settingsDialog.open) {
    event.preventDefault();
    closeSettings();
    return;
  }
  if (event.key === "Escape" && shortcutEditMode) {
    setShortcutEditMode(false, true);
    return;
  }
  const activeTag = document.activeElement?.tagName;
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
  if (event.key === "/" && !isTyping && !elements.settingsDialog.open) {
    event.preventDefault();
    elements.searchInput.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !elements.settingsDialog.open) {
    event.preventDefault();
    elements.searchInput.focus();
    elements.searchInput.select();
  }
});

initialize();
