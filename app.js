const STORAGE_KEY = "wisdomNewtabSettingsV3";
const GITHUB_CACHE_KEY = "wisdomGithubRisingV1";
const GITHUB_CACHE_TTL = 60 * 60 * 1000;

const brandLogos = [
  { id: "wisdomechoes", match: /wisdomechoes\.net/i, src: "assets/logos/wisdomechoes.png" },
  { id: "langqian", match: /lang-qian\.com/i, src: "assets/logos/langqian.png" },
  { id: "github", match: /github\.com/i, src: "assets/logos/github.svg" }
];

const shortcutLabelMigrations = {
  wisdomechoes: { from: "WisdomEchoes", to: "Blog" },
  langqian: { from: "浪前", to: "SurferGarage" }
};

const defaultSettings = {
  locale: "en",
  surface: "light",
  shortcuts: [
    { id: "wisdomechoes", label: "Blog", url: "https://www.wisdomechoes.net/", color: "#29282c" },
    { id: "langqian", label: "SurferGarage", url: "https://www.lang-qian.com/", color: "#ef4f35" },
    { id: "github", label: "GitHub", url: "https://github.com/kfr34", color: "#171717" }
  ]
};

const copy = {
  en: {
    search: "Search Google",
    add: "Add"
  },
  zh: {
    search: "用 Google 搜索",
    add: "添加"
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
  githubList: document.querySelector("#github-list"),
  githubRefresh: document.querySelector("#github-refresh"),
  githubRepoTemplate: document.querySelector("#github-repo-template"),
  githubSearchLink: document.querySelector("#github-search-link"),
  githubUpdated: document.querySelector("#github-updated"),
  languageLabel: document.querySelector("#language-label"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsForm: document.querySelector("#settings-form"),
  shortcutEditor: document.querySelector("#shortcut-editor"),
  shortcutEditorTemplate: document.querySelector("#shortcut-editor-template"),
  shortcutGrid: document.querySelector("#shortcut-grid"),
  shortcutSettings: document.querySelector("#shortcut-settings"),
  shortcutTemplate: document.querySelector("#shortcut-template")
};

let settings = structuredClone(defaultSettings);

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
    locale: ["en", "zh"].includes(value.locale) ? value.locale : "en",
    surface: ["light", "dark"].includes(value.surface) ? value.surface : "light",
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
    const tile = elements.shortcutTemplate.content.firstElementChild.cloneNode(true);
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
    elements.shortcutGrid.append(tile);
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
}

function githubQuery() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);
  return `created:>=${since.toISOString().slice(0, 10)} stars:>5`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function renderGitHubState(message, retry = false) {
  elements.githubList.replaceChildren();
  const item = document.createElement("li");
  item.className = "github-state";
  const text = document.createElement("span");
  text.textContent = message;
  item.append(text);

  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button";
    button.textContent = "Retry";
    button.addEventListener("click", () => loadGitHubRising(true));
    item.append(button);
  }

  elements.githubList.append(item);
}

function renderGitHubRepos(repositories) {
  elements.githubList.replaceChildren();
  repositories.forEach((repository, index) => {
    const item = elements.githubRepoTemplate.content.firstElementChild.cloneNode(true);
    const link = item.querySelector("a");
    link.href = repository.url;
    item.querySelector(".github-rank").textContent = String(index + 1).padStart(2, "0");
    item.querySelector(".github-language").textContent = (repository.language || "OTHER").toUpperCase();
    item.querySelector("h3").textContent = repository.name;
    item.querySelector("p").textContent = repository.description || "No description provided.";
    item.querySelector('[data-stat="stars"]').textContent = formatCompactNumber(repository.stars);
    item.querySelector('[data-stat="forks"]').textContent = formatCompactNumber(repository.forks);
    elements.githubList.append(item);
  });
}

function cacheLabel(timestamp, prefix) {
  const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(timestamp);
  return `${prefix} / ${time}`;
}

async function loadGitHubRising(force = false) {
  const cached = await storage.get(GITHUB_CACHE_KEY, null);
  const hasCachedItems = Array.isArray(cached?.items) && cached.items.length > 0;
  const cacheIsFresh = hasCachedItems && Date.now() - Number(cached.fetchedAt) < GITHUB_CACHE_TTL;
  const query = githubQuery();
  elements.githubSearchLink.href = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories&s=stars&o=desc`;

  if (hasCachedItems) {
    renderGitHubRepos(cached.items);
    elements.githubUpdated.textContent = cacheLabel(cached.fetchedAt, cacheIsFresh ? "CACHED" : "STALE");
  } else {
    renderGitHubState("SYNCING GITHUB");
  }

  if (!force && cacheIsFresh) return;
  if (!navigator.onLine && hasCachedItems) return;

  const apiUrl = new URL("https://api.github.com/search/repositories");
  apiUrl.search = new URLSearchParams({ q: query, sort: "stars", order: "desc", per_page: "5" }).toString();
  elements.githubRefresh.classList.add("is-loading");
  elements.githubRefresh.disabled = true;

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
    renderGitHubRepos(repositories);
    elements.githubUpdated.textContent = cacheLabel(cache.fetchedAt, "LIVE");
  } catch {
    if (!hasCachedItems) {
      renderGitHubState("GITHUB DATA UNAVAILABLE", true);
      elements.githubUpdated.textContent = "NO CACHE";
    }
  } finally {
    elements.githubRefresh.classList.remove("is-loading");
    elements.githubRefresh.disabled = false;
  }
}

function applySettings() {
  document.documentElement.dataset.surface = settings.surface;
  elements.languageLabel.textContent = settings.locale === "en" ? "中" : "EN";
  elements.searchInput.placeholder = copy[settings.locale].search;
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
  loadGitHubRising();
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (query) window.location.assign(searchTarget(query));
});

document.querySelector("#settings-open").addEventListener("click", () => openSettings(false));
document.querySelector("#shortcuts-edit").addEventListener("click", () => openSettings(true));
document.querySelector("#settings-close").addEventListener("click", () => elements.settingsDialog.close());
document.querySelector("#shortcut-add").addEventListener("click", () => addEditorRow({ color: "#3d5c91" }));

document.querySelector("#language-toggle").addEventListener("click", async () => {
  settings.locale = settings.locale === "en" ? "zh" : "en";
  await storage.set(STORAGE_KEY, settings);
  applySettings();
});

elements.githubRefresh.addEventListener("click", () => loadGitHubRising(true));

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
