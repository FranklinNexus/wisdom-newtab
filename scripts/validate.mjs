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
  "assets/logos/wisdomechoes.png",
  "assets/logos/langqian.png",
  "assets/logos/github.svg",
  "PRIVACY.md",
  "privacy.html",
  "store/STORE_LISTING.md",
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
  const unexpected = permissions.filter((permission) => permission !== "storage");
  if (unexpected.length) errors.push(`Unexpected permissions: ${unexpected.join(", ")}`);
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
  assertPngSize("store/assets/icon-128.png", 128, 128),
  assertPngSize("store/assets/promo-small-440x280.png", 440, 280),
  assertPngSize("store/assets/01-github-1280x800.png", 1280, 800),
  assertPngSize("store/assets/02-hacker-news-1280x800.png", 1280, 800),
  assertPngSize("store/assets/03-focus-timer-1280x800.png", 1280, 800)
]);

try {
  const source = await readFile("app.js", "utf8");
  new vm.Script(source, { filename: "app.js" });
} catch (error) {
  errors.push(`Invalid app.js: ${error.message}`);
}

try {
  const source = await readFile("theme-init.js", "utf8");
  new vm.Script(source, { filename: "theme-init.js" });
} catch (error) {
  errors.push(`Invalid theme-init.js: ${error.message}`);
}

const html = await readFile("newtab.html", "utf8").catch(() => "");
if (html && /<script(?![^>]*\bsrc=)/i.test(html)) {
  errors.push("Inline scripts are not allowed by the extension CSP");
}
if (html && !/<script\s+src=["']theme-init\.js["']><\/script>\s*<link\s+rel=["']stylesheet["']/i.test(html)) {
  errors.push("theme-init.js must load before styles.css to restore the theme before first paint");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Extension validation passed.");
}
