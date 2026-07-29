# Wisdom New Tab

A Chrome / Edge new-tab extension inspired by [WisdomEchoes](https://www.wisdomechoes.net/). It is a practical browser home page: browser-selected web search, automatic site-logo shortcuts, quiet settings controls, and one switchable live widget sidebar.

![Wisdom New Tab preview](assets/preview.png)

## Features

- Four restrained color themes: Warm, Porcelain, Sage, and Graphite.
- A pill-shaped web search field that uses the browser's selected search engine and opens typed URLs directly.
- Automatic website favicon shortcuts, with bundled official logos for Blog, SurferGarage, and GitHub.
- Up to ten local shortcuts with editable labels, URLs, colors, and custom uploaded logos.
- Optional Chrome / Edge bookmark import with search, duplicate detection, and explicit multi-selection.
- Press and hold any shortcut, or right-click it on desktop, to enter a restrained jiggle mode; use its X button to delete it, or click elsewhere to exit.
- A single, collapsible widget sidebar for GitHub Trending, Hacker News, or a 25/5 focus timer.
- A seven-day GitHub ranking with language, description, stars, and forks.
- Current Hacker News stories with score, author, time, and comment count.
- Ten-minute, visibility-aware public-data refreshes with cached offline fallback.
- Immediate Light / Dark and theme controls with persistent local preferences.
- Settings stored only in the browser.

## Install

For Edge or a manual development install, download `wisdom-newtab-latest.zip` from the rolling [latest development release](https://github.com/FranklinNexus/wisdom-newtab/releases/tag/latest), then extract it to a permanent folder. This package follows the current `main` branch and can be newer than the Chrome Web Store version.

Versioned GitHub Releases remain immutable so they continue to match submitted store packages. Chrome and Edge load the extracted folder, not the ZIP itself.

### Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the extracted `wisdom-newtab` folder.
5. Open a new tab.

### Edge

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the extracted `wisdom-newtab` folder.

After changing code, select **Reload** on the extension card and then open a new tab.

## Local Preview

The extension has no build step. Preview it from any static server:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/newtab.html`. The normal web preview uses `localStorage`; the extension uses `chrome.storage.local`.

## Search

Search submissions use the browser's currently selected search engine through `chrome.search.query`; the extension never changes the default provider. URLs typed into the field open directly. Press `/` or `Ctrl/Cmd + K` to focus search.

## Project Structure

```text
manifest.json          Manifest V3 configuration and new-tab override
newtab.html            Semantic page structure
styles.css             Full-screen visual system and responsive layout
app.js                 Search, shortcuts, widgets, timer, settings, and storage
theme-init.js          Restores the saved theme before the first visual paint
assets/icons.svg       Trimmed Lucide icon set
assets/extension/      Chrome / Edge extension icons
assets/logos/          Bundled Blog, SurferGarage, and GitHub logos
scripts/validate.mjs   Zero-dependency project validation
store/                 Chrome Web Store copy and submission assets
```

## Privacy and Permissions

The extension requests `favicon`, `search`, and `storage` plus network access only to the GitHub API and Hacker News Firebase API for public project and story data. The `bookmarks` permission is optional and requested only when you choose Import bookmarks; unselected bookmarks are not stored. It does not read browsing history, inject scripts into other sites, send analytics, or load remote code. Search text is sent only to the browser-selected provider after submission; the extension never changes the default search engine.

See [Privacy Policy](PRIVACY.md) for the complete policy.

## Release

Chrome Web Store fields, permission explanations, screenshot sizes, and an upload checklist are in [store/STORE_LISTING.md](store/STORE_LISTING.md). Run `scripts/build-store-assets.ps1` to regenerate the extension icons and store assets.

Run `scripts/package-latest.ps1` to rebuild the rolling `wisdom-newtab-latest.zip` package without changing the manifest version.

Run `scripts/package-store.ps1` to build the versioned Chrome Web Store upload ZIP from the current manifest version.

GitHub Releases can distribute versions before store approval. The Chrome Web Store and Microsoft Edge Add-ons each require their own developer account and review; a GitHub Release is not store approval.

The repository collaboration and GitHub-achievement guidance lives in [GITHUB_PLAYBOOK.md](GITHUB_PLAYBOOK.md). See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE). Icons are from [Lucide](https://lucide.dev/) under the ISC License.
