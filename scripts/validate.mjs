import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import vm from "node:vm";

const requiredFiles = [
  "manifest.json",
  "newtab.html",
  "styles.css",
  "app.js",
  "theme-init.js",
  "assets/icons.svg",
  "assets/extension/icon16.png",
  "assets/extension/icon32.png",
  "assets/extension/icon48.png",
  "assets/extension/icon128.png",
  "assets/pwa/icon192.png",
  "assets/pwa/icon512.png",
  "assets/logos/wisdomechoes.png",
  "assets/logos/langqian.png",
  "assets/logos/github.svg",
  "PRIVACY.md",
  "privacy.html",
  "index.html",
  "install.css",
  "app/index.html",
  "app/manifest.webmanifest",
  "app/pwa.css",
  "app/pwa.js",
  "app/service-worker.js",
  "scripts/package-edge.ps1",
  "store/STORE_LISTING.md",
  "store/EDGE_ADDONS_SUBMISSION.md",
  "store/assets/icon-128.png",
  "store/assets/promo-small-440x280.png",
  "store/assets/01-github-1280x800.png",
  "store/assets/02-hacker-news-1280x800.png",
  "store/assets/03-focus-timer-1280x800.png"
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await access(file, constants.R_OK);
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

let manifest;
try {
  manifest = JSON.parse(await readFile("manifest.json", "utf8"));
} catch (error) {
  errors.push(`Invalid manifest.json: ${error.message}`);
}

if (manifest) {
  if (manifest.manifest_version !== 3) errors.push("manifest_version must be 3");
  if (manifest.chrome_url_overrides?.newtab !== "newtab.html") {
    errors.push("chrome_url_overrides.newtab must point to newtab.html");
  }

  const expectedIcons = {
    16: "assets/extension/icon16.png",
    32: "assets/extension/icon32.png",
    48: "assets/extension/icon48.png",
    128: "assets/extension/icon128.png"
  };
  for (const [size, path] of Object.entries(expectedIcons)) {
    if (manifest.icons?.[size] !== path) {
      errors.push(`manifest icon ${size} must point to ${path}`);
    }
  }

  const permissions = manifest.permissions || [];
  const unexpected = permissions.filter((permission) => !["favicon", "search", "storage"].includes(permission));
  if (unexpected.length) errors.push(`Unexpected permissions: ${unexpected.join(", ")}`);
  if (!permissions.includes("search")) errors.push("The search permission is required for the selected browser search engine API");
  if (!permissions.includes("favicon")) errors.push("The favicon permission is required for automatic website shortcut logos");

  const optionalPermissions = manifest.optional_permissions || [];
  const unexpectedOptional = optionalPermissions.filter((permission) => permission !== "bookmarks");
  if (unexpectedOptional.length) errors.push(`Unexpected optional permissions: ${unexpectedOptional.join(", ")}`);
  if (!optionalPermissions.includes("bookmarks")) errors.push("The bookmarks permission must remain optional");
}

let pwaManifest;
try {
  pwaManifest = JSON.parse(await readFile("app/manifest.webmanifest", "utf8"));
} catch (error) {
  errors.push(`Invalid app/manifest.webmanifest: ${error.message}`);
}

if (pwaManifest) {
  if (pwaManifest.start_url !== "./" || pwaManifest.scope !== "./") {
    errors.push("The mobile app manifest must remain scoped to app/");
  }
  if (pwaManifest.display !== "standalone") {
    errors.push("The mobile app must use standalone display mode");
  }
  const iconSizes = new Set((pwaManifest.icons || []).map((icon) => icon.sizes));
  if (!iconSizes.has("192x192") || !iconSizes.has("512x512")) {
    errors.push("The mobile app manifest must include 192x192 and 512x512 icons");
  }
}

async function assertPngSize(path, expectedWidth, expectedHeight) {
  try {
    const bytes = await readFile(path);
    const signature = bytes.subarray(0, 8).toString("hex");
    if (signature !== "89504e470d0a1a0a") {
      errors.push(`${path} must be a PNG file`);
      return;
    }

    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (width !== expectedWidth || height !== expectedHeight) {
      errors.push(`${path} must be ${expectedWidth}x${expectedHeight}, received ${width}x${height}`);
    }
  } catch {
    // Missing files are already reported by the required-file check.
  }
}

await Promise.all([
  assertPngSize("assets/extension/icon16.png", 16, 16),
  assertPngSize("assets/extension/icon32.png", 32, 32),
  assertPngSize("assets/extension/icon48.png", 48, 48),
  assertPngSize("assets/extension/icon128.png", 128, 128),
  assertPngSize("assets/pwa/icon192.png", 192, 192),
  assertPngSize("assets/pwa/icon512.png", 512, 512),
  assertPngSize("store/assets/icon-128.png", 128, 128),
  assertPngSize("store/assets/promo-small-440x280.png", 440, 280),
  assertPngSize("store/assets/01-github-1280x800.png", 1280, 800),
  assertPngSize("store/assets/02-hacker-news-1280x800.png", 1280, 800),
  assertPngSize("store/assets/03-focus-timer-1280x800.png", 1280, 800)
]);

try {
  const source = await readFile("app.js", "utf8");
  new vm.Script(source, { filename: "app.js" });
  if (!source.includes('chrome.search.query({ text: query, disposition: "CURRENT_TAB" })')) {
    errors.push("Web searches must use chrome.search.query with the browser-selected provider");
  }
  if (!source.includes('!declaredPermissions.includes("favicon")')) {
    errors.push("Packages without the favicon permission must use shortcut letter fallbacks");
  }
  if (!source.includes("elements.bookmarkImport.hidden = !bookmarkImportAvailable")) {
    errors.push("Bookmark import must hide when the browser does not expose the bookmarks API");
  }
  if (/google\.com\/search|bing\.com\/search|duckduckgo\.com\/\?q|fallbackSearchUrl/.test(source)) {
    errors.push("Provider-specific search URLs and search fallbacks are not allowed");
  }
  if (/window\.location\.assign\([^)]*query/.test(source)) {
    errors.push("Search queries must not be navigated through a manually constructed URL");
  }
  if (!source.includes("bookmarkSearch.focus({ preventScroll: true })")) {
    errors.push("Bookmark search focus must not scroll the settings panel");
  }
  if (!source.includes('settingsDialog.classList.add("is-importing")')) {
    errors.push("Bookmark import must use the focused settings layout");
  }
} catch (error) {
  errors.push(`Invalid app.js: ${error.message}`);
}

try {
  const source = await readFile("theme-init.js", "utf8");
  new vm.Script(source, { filename: "theme-init.js" });
} catch (error) {
  errors.push(`Invalid theme-init.js: ${error.message}`);
}

for (const path of ["app/pwa.js", "app/service-worker.js"]) {
  try {
    const source = await readFile(path, "utf8");
    new vm.Script(source, { filename: path });
  } catch (error) {
    errors.push(`Invalid ${path}: ${error.message}`);
  }
}

const html = await readFile("newtab.html", "utf8").catch(() => "");
const pwaHtml = await readFile("app/index.html", "utf8").catch(() => "");
const styles = await readFile("styles.css", "utf8").catch(() => "");
if (styles && !/\.bookmark-item\s*\{[\s\S]*?grid-template-columns:\s*36px\s+minmax\(0,\s*1fr\)\s+18px\s*;/m.test(styles)) {
  errors.push("Bookmark rows must reserve columns for the logo, copy, and selection control");
}
if (styles && !styles.includes(".side-panel.is-importing .shortcut-editor")) {
  errors.push("Bookmark import must hide the shortcut editor while selecting bookmarks");
}
if (html && /<script(?![^>]*\bsrc=)/i.test(html)) {
  errors.push("Inline scripts are not allowed by the extension CSP");
}
if (html && !/<script\s+src=["']theme-init\.js["']><\/script>\s*<link\s+rel=["']stylesheet["']/i.test(html)) {
  errors.push("theme-init.js must load before styles.css to restore the theme before first paint");
}
if (pwaHtml && !pwaHtml.includes('<link rel="manifest" href="app/manifest.webmanifest"')) {
  errors.push("The mobile app must link its web app manifest");
}
if (pwaHtml && /<script(?![^>]*\bsrc=)/i.test(pwaHtml)) {
  errors.push("Inline scripts are not allowed in the mobile app");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Extension validation passed.");
}
