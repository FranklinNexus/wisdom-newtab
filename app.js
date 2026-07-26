const STORAGE_KEY = "wisdomNewtabSettingsV3";
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
  activeWidget: "github",
  widgetCollapsed: false,
  shortcuts: [
    { id: "wisdomechoes", label: "Blog", url: "https://www.wisdomechoes.net/", color: "#29282c" },
    { id: "langqian", label: "SurferGarage", url: "https://www.lang-qian.com/", color: "#ef4f35" },
    { id: "github", label: "GitHub", url: "https://github.com/kfr34", color: "#171717" }
  ]
};

const copy = {
  en: {
    search: "Search Google",
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
let refreshFeedbackTimer;
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

function sanitizeSettings(candidate) {
  const value = candidate && typeof candidate === "object" ? candidate : {};
  const legacyLinks = Array.isArray(value.links) ? value.links : [];
  const rawShortcuts = Array.isArray(value.shortcuts) ? value.shortcuts : legacyLinks;
  const shortcuts = rawShortcuts.length
    ? rawShortcuts.slice(0, 10).map((item, index) => {
        const id = String(item.id || `shortcut-${Date.now()}-${index}`);
        const rawLabel = String(item.label || "Untitled").slice(0, 28);
        const labelMigration = shortcutLabelMigrations[id];
        return {
          id,
          label: labelMigration?.from === rawLabel ? labelMigration.to : rawLabel,
          url: normalizeUrl(item.url),
          color: safeColor(item.color, ["#29282c", "#ef4f35", "#171717", "#3d5c91"][index % 4])
        };
      }).filter((item) => item.label)
    : structuredClone(defaultSettings.shortcuts);

  return {
    locale: "en",
    surface: ["light", "dark"].includes(value.surface) ? value.surface : "light",
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

function renderShortcuts() {
  elements.shortcutGrid.replaceChildren();

  settings.shortcuts.slice(0, 7).forEach((shortcut) => {
    const item = elements.shortcutTemplate.content.firstElementChild.cloneNode(true);
    const tile = item.querySelector(".shortcut");
    const deleteButton = item.querySelector(".shortcut-delete");
    item.dataset.shortcutId = shortcut.id;
    tile.href = shortcut.url;
    tile.style.setProperty("--shortcut-color", shortcut.color);
    const brand = brandLogoFor(shortcut.url);
    const image = tile.querySelector(".shortcut-logo");
    const fallback = tile.querySelector(".shortcut-icon b");
    if (brand) {
      tile.classList.add("has-logo");
      tile.dataset.brand = brand.id;
      image.src = brand.src;
      image.hidden = false;
      fallback.hidden = true;
    } else {
      fallback.textContent = iconText(shortcut);
    }
    tile.querySelector(".shortcut-label").textContent = shortcut.label;
    deleteButton.setAttribute("aria-label", `Delete ${shortcut.label}`);
    deleteButton.title = `Delete ${shortcut.label}`;
    elements.shortcutGrid.append(item);
  });

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

function setRefreshState(state, widget = settings.activeWidget) {
  if (widget !== settings.activeWidget) return;
  clearTimeout(refreshFeedbackTimer);
  elements.widgetRefresh.classList.remove("is-loading", "is-success", "is-error");
  elements.widgetRefresh.classList.add(`is-${state}`);
  elements.widgetRefresh.disabled = state === "loading";
  elements.widgetRefresh.setAttribute("aria-busy", String(state === "loading"));

  if (state !== "loading") {
    refreshFeedbackTimer = setTimeout(() => {
      elements.widgetRefresh.classList.remove(`is-${state}`);
    }, 900);
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
    const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const payload = await response.json();
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
    const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    if (!idsResponse.ok) throw new Error(`Hacker News API returned ${idsResponse.status}`);
    const ids = await idsResponse.json();
    const stories = await Promise.all((ids || []).slice(0, 12).map(async (id) => {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (!response.ok) return null;
      return response.json();
    }));
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
  await storage.set(STORAGE_KEY, settings);
  applyWidgetState();
}

function applySurface(surface) {
  settings.surface = surface;
  document.documentElement.dataset.surface = surface;
}

async function switchSurface(surface, source) {
  const nextSurface = ["light", "dark"].includes(surface) ? surface : "light";
  if (nextSurface === settings.surface) return;

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
    applySurface(nextSurface);
  } else {
    root.classList.add("is-theme-switching");
    try {
      const transition = document.startViewTransition(() => applySurface(nextSurface));
      await transition.finished;
    } catch {
      applySurface(nextSurface);
    } finally {
      root.classList.remove("is-theme-switching");
    }
  }

  await storage.set(STORAGE_KEY, settings);
}

function applySettings() {
  document.documentElement.dataset.surface = settings.surface;
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

  elements.shortcutEditor.replaceChildren();
  settings.shortcuts.forEach((shortcut) => addEditorRow(shortcut));
}

function addEditorRow(shortcut = {}) {
  if (elements.shortcutEditor.children.length >= 10) return;
  const row = elements.shortcutEditorTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.id = shortcut.id || `shortcut-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  row.querySelector('[data-field="label"]').value = shortcut.label || "";
  row.querySelector('[data-field="url"]').value = shortcut.url || "";
  row.querySelector('[data-field="color"]').value = safeColor(shortcut.color, "#29282c");
  row.querySelector(".remove-shortcut").addEventListener("click", () => row.remove());
  elements.shortcutEditor.append(row);
}

function collectShortcuts() {
  return [...elements.shortcutEditor.querySelectorAll(".shortcut-row")]
    .map((row) => ({
      id: row.dataset.id,
      label: row.querySelector('[data-field="label"]').value.trim(),
      url: normalizeUrl(row.querySelector('[data-field="url"]').value),
      color: safeColor(row.querySelector('[data-field="color"]').value)
    }))
    .filter((shortcut) => shortcut.label && shortcut.url);
}

function openSettings(shortcutsOnly = false) {
  setShortcutEditMode(false);
  renderSettings();
  elements.settingsDialog.showModal();
  if (shortcutsOnly) {
    requestAnimationFrame(() => elements.shortcutSettings.scrollIntoView({ block: "start" }));
  }
}

function closeOnBackdrop(dialog, event) {
  if (event.target === dialog) dialog.close();
}

function searchTarget(rawQuery) {
  const value = rawQuery.trim();
  const commandMatch = value.match(/^(g|gh|yt|mdn|npm|wiki)\s+(.+)$/i);
  const commands = {
    g: "https://www.google.com/search?q=",
    gh: "https://github.com/search?q=",
    yt: "https://www.youtube.com/results?search_query=",
    mdn: "https://developer.mozilla.org/search?q=",
    npm: "https://www.npmjs.com/search?q=",
    wiki: "https://en.wikipedia.org/w/index.php?search="
  };
  if (commandMatch) return commands[commandMatch[1].toLowerCase()] + encodeURIComponent(commandMatch[2]);
  if (/^(https?:\/\/|[\w-]+\.[a-z]{2,})(\S*)$/i.test(value)) {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

async function initialize() {
  settings = sanitizeSettings(await storage.get(STORAGE_KEY, defaultSettings));
  await storage.set(STORAGE_KEY, settings);
  applySettings();
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (query) window.location.assign(searchTarget(query));
});

document.querySelector("#settings-open").addEventListener("click", () => openSettings(false));
document.querySelector("#settings-close").addEventListener("click", () => elements.settingsDialog.close());
document.querySelector("#shortcut-add").addEventListener("click", () => addEditorRow({ color: "#3d5c91" }));

elements.surfaceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) switchSurface(input.value, input);
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
    shortcuts: collectShortcuts()
  });
  await storage.set(STORAGE_KEY, settings);
  applySettings();
  elements.settingsDialog.close();
});

elements.settingsDialog.addEventListener("click", (event) => closeOnBackdrop(elements.settingsDialog, event));

document.addEventListener("keydown", (event) => {
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
