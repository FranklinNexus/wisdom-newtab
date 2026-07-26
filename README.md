# Wisdom New Tab

A Chrome / Edge new-tab extension inspired by [WisdomEchoes](https://www.wisdomechoes.net/). It is a practical browser home page: central Google search, official site-logo shortcuts, a quiet settings control, and one switchable live widget sidebar.

![Wisdom New Tab preview](assets/preview.png)

## Features

- A warm, plain surface with no decorative hero image.
- A pill-shaped Google search field that opens typed URLs directly.
- `g`, `gh`, `yt`, `mdn`, `npm`, and `wiki` search prefixes.
- Adaptive official logo shortcuts for Blog, SurferGarage, and GitHub.
- Up to ten local shortcuts with editable labels, URLs, and colors.
- Press and hold any shortcut, or right-click it on desktop, to enter a restrained jiggle mode; use its X button to delete it, or click elsewhere to exit.
- A single, collapsible widget sidebar for GitHub Trending, Hacker News, or a 25/5 focus timer.
- A seven-day GitHub ranking with language, description, stars, and forks.
- Current Hacker News stories with score, author, time, and comment count.
- Ten-minute, visibility-aware public-data refreshes with cached offline fallback.
- An immediate Light / Dark control with a persistent local preference.
- Settings stored only in the browser.

## Install

Download the latest `wisdom-newtab-v*.zip` from [GitHub Releases](https://github.com/FranklinNexus/wisdom-newtab/releases), then extract it to a permanent folder. Chrome and Edge load the extracted folder, not the ZIP itself.

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

## Search Prefixes

```text
gh new tab extension   -> GitHub repositories and code
mdn web extensions    -> MDN
npm lucide             -> npm
yt browser extension  -> YouTube
wiki new tab page      -> Wikipedia
```

Google is used without a prefix. Press `/` or `Ctrl/Cmd + K` to focus search.

## Project Structure

```text
manifest.json          Manifest V3 configuration and new-tab override
newtab.html            Semantic page structure
styles.css             Full-screen visual system and responsive layout
app.js                 Search, shortcuts, widgets, timer, settings, and storage
assets/icons.svg       Trimmed Lucide icon set
assets/extension/      Chrome / Edge extension icons
assets/logos/          Official Blog, SurferGarage, and GitHub logos
scripts/validate.mjs   Zero-dependency project validation
store/                 Chrome Web Store copy and submission assets
```

## Privacy and Permissions

The extension requests `storage` plus network access only to the GitHub API and Hacker News Firebase API for public project and story data. It does not read browsing history, inject scripts into other sites, send analytics, or load remote code. Search text is sent only to the selected destination after submission.

See [Privacy Policy](PRIVACY.md) for the complete policy.

## Release

Chrome Web Store fields, permission explanations, screenshot sizes, and an upload checklist are in [store/STORE_LISTING.md](store/STORE_LISTING.md). Run `scripts/build-store-assets.ps1` to regenerate the extension icons and store assets.

GitHub Releases can distribute versions before store approval. The Chrome Web Store and Microsoft Edge Add-ons each require their own developer account and review; a GitHub Release is not store approval.

The repository collaboration and GitHub-achievement guidance lives in [GITHUB_PLAYBOOK.md](GITHUB_PLAYBOOK.md). See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE). Icons are from [Lucide](https://lucide.dev/) under the ISC License.
