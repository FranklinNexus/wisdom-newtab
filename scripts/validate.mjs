import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import vm from "node:vm";

const requiredFiles = [
  "manifest.json",
  "newtab.html",
  "styles.css",
  "app.js",
  "assets/icons.svg",
  "assets/logos/wisdomechoes.png",
  "assets/logos/langqian.png",
  "assets/logos/github.svg"
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

  const permissions = manifest.permissions || [];
  const unexpected = permissions.filter((permission) => permission !== "storage");
  if (unexpected.length) errors.push(`Unexpected permissions: ${unexpected.join(", ")}`);
}

try {
  const source = await readFile("app.js", "utf8");
  new vm.Script(source, { filename: "app.js" });
} catch (error) {
  errors.push(`Invalid app.js: ${error.message}`);
}

const html = await readFile("newtab.html", "utf8").catch(() => "");
if (html && /<script(?![^>]*\bsrc=)/i.test(html)) {
  errors.push("Inline scripts are not allowed by the extension CSP");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Extension validation passed.");
}
