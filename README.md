# Wisdom New Tab

A Chrome / Edge new-tab extension inspired by [WisdomEchoes](https://www.wisdomechoes.net/). It is a practical browser home page: browser-selected web search, automatic site-logo shortcuts, quiet settings controls, and one switchable live widget sidebar.

![Wisdom New Tab preview](assets/preview.png)

## Features

- Four restrained color themes: Warm, Porcelain, Sage, and Graphite.
- A pill-shaped web search field that uses only the browser's selected search engine.
- Automatic website favicon shortcuts on desktop Chrome, with bundled official logos for Blog, SurferGarage, and GitHub and letter fallbacks on Edge Android.
- Up to ten local shortcuts with editable labels, URLs, colors, and custom uploaded logos.
- Optional Chrome / Edge bookmark import with search, duplicate detection, and explicit multi-selection.
- Press and hold any shortcut, or right-click it on desktop, to enter a restrained jiggle mode; use its X button to delete it, or click elsewhere to exit.
- A single, collapsible widget sidebar for GitHub Trending, Hacker News, or a 25/5 focus timer.
- A seven-day GitHub ranking with language, description, stars, and forks.
- Current Hacker News stories with score, author, time, and comment count.
- Ten-minute, visibility-aware public-data refreshes with cached offline fallback.
- Immediate Light / Dark and theme controls with persistent local preferences.
- Settings stored only in the browser.
- A native Edge Android extension package that overrides the browser's New Tab page.
- An installable mobile web app fallback with the same dashboard layout and Google search.

## Install

### Chrome Web Store (recommended)

Open the [Wisdom New Tab installation page](https://franklinnexus.github.io/wisdom-newtab/), continue to the Chrome Web Store, select **Add to Chrome**, and confirm **Add extension**. Open a new tab after installation.

Desktop Microsoft Edge can use the same listing. If prompted, first select **Allow extensions from other stores**, then install Wisdom New Tab from the Chrome Web Store. Edge may pause a new-tab extension after installation; select **Turn on** once to confirm the browser-setting change.

### Microsoft Edge on Android

Current Edge for Android supports extension-based New Tab overrides. The dedicated Microsoft Edge Add-ons package keeps the supported `search` and `storage` APIs and omits the Android-unsupported `favicon` and `bookmarks` APIs. After installing and enabling the Edge Add-ons edition, set Edge's startup option to **Always start with a fresh new tab** so both a cold launch and the New Tab button open Wisdom New Tab.

The Edge Add-ons listing uses the normal Partner Center publishing workflow. Microsoft's documented Availability form has no separate Android platform switch; compatibility validation comes from the package manifest and supported API surface. The prepared upload is `wisdom-newtab-edge-v0.8.2.zip`.

Microsoft currently curates the public **Extensions for Mobile** collection separately. Publishing creates the Edge Add-ons listing and extension ID, but does not guarantee immediate inclusion in that mobile collection. Before inclusion, the owner's Android device can use **Developer options > Extension install by id** in Edge builds that expose that option.

Chrome on Android and browsers on iPhone do not support this extension path. Use the companion mobile app below on those platforms.

### Mobile app

Open the [Wisdom New Tab mobile app](https://franklinnexus.github.io/wisdom-newtab/app/). On Android Chrome or Edge, use **Install app** or **Add to Home screen** from the browser menu. On iPhone, open the app in Safari, select Share, then **Add to Home Screen**.

The mobile app runs independently from browser extensions and does not replace a browser's built-in New Tab page. Locally saved settings do not sync between installations.

### Manual development install

For local testing, download `wisdom-newtab-latest.zip` from the rolling [latest development release](https://github.com/FranklinNexus/wisdom-newtab/releases/tag/latest), then extract it to a permanent folder. This package follows the current `main` branch and can be newer than the Chrome Web Store version.

Versioned GitHub Releases remain immutable so they continue to match submitted store packages. Chrome and Edge load the extracted folder, not the ZIP itself.

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the extracted `wisdom-newtab` folder.
5. Open a new tab.

After changing code, select **Reload** on the extension card and then open a new tab.

## Local Preview

The extension has no build step. Preview it from any static server:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/newtab.html`. The normal web preview uses `localStorage`; the extension uses `chrome.storage.local`.

## Search

Every search submission uses the browser's currently selected search engine through `chrome.search.query`; the extension never chooses or changes the provider and has no provider-specific fallback. If Chrome Search API is unavailable, the extension performs no search. Press `/` or `Ctrl/Cmd + K` to focus search.

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
scripts/package-edge.ps1  Edge Add-ons package with Android-compatible permissions
app/                   Installable mobile PWA companion
```

## Privacy and Permissions

The extension requests `favicon`, `search`, and `storage` plus network access only to the GitHub API and Hacker News Firebase API for public project and story data. The `bookmarks` permission is optional and requested only when you choose Import bookmarks; unselected bookmarks are not stored. It does not read browsing history, inject scripts into other sites, send analytics, or load remote code. Search text is sent only to the browser-selected provider after submission; the extension never changes the default search engine.

See [Privacy Policy](PRIVACY.md) for the complete policy.

## Release

Chrome Web Store fields, permission explanations, screenshot sizes, and an upload checklist are in [store/STORE_LISTING.md](store/STORE_LISTING.md). Run `scripts/build-store-assets.ps1` to regenerate the extension icons and store assets.

Run `scripts/package-latest.ps1` to rebuild the rolling `wisdom-newtab-latest.zip` package without changing the manifest version.

Run `scripts/package-store.ps1` to build the versioned Chrome Web Store upload ZIP from the current manifest version.

Run `scripts/package-edge.ps1` to build the Microsoft Edge Add-ons upload ZIP. The script keeps the product version unchanged and removes only the permissions that Edge Android does not expose.

GitHub Releases can distribute versions before store approval. The Chrome Web Store and Microsoft Edge Add-ons each require their own developer account and review; a GitHub Release is not store approval.

The repository collaboration and GitHub-achievement guidance lives in [GITHUB_PLAYBOOK.md](GITHUB_PLAYBOOK.md). See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE). Icons are from [Lucide](https://lucide.dev/) under the ISC License.
