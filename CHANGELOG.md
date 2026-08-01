# Changelog

## Unreleased

- Added an installable mobile PWA with the responsive dashboard, Google search, offline shell caching, and home-screen icons.
- Added a mobile installation path and platform-specific guidance to the public install page.
- Updated the privacy policy to distinguish desktop extension search from mobile web-app search.

## 0.8.2 - 2026-08-01

- Removed the duplicate settings control so the bookmark button is the single customization entry point.
- Updated the default GitHub shortcut to FranklinNexus and migrated the previous saved default automatically.

## 0.8.1 - 2026-07-29

- Removed the provider-specific web-preview fallback so every submitted query uses Chrome Search API exclusively.
- Removed direct URL handling from the search field to keep it strictly scoped to browser-selected web search.
- Added validation that rejects hard-coded search providers and manually constructed search-result URLs.
- Clarified the Chrome Web Store single-purpose and permission declarations for the Red Argon resubmission.

## 0.8.0 - 2026-07-29

- Added automatic website favicons for shortcuts, with a letter fallback only when no icon is available.
- Added per-shortcut custom logo uploads and a top-right shortcut-management entry point.
- Added optional Chrome / Edge bookmark import with search, multi-select, duplicate detection, and local-only handling.
- Fixed bookmark-import row alignment, focus scrolling, and nested-panel crowding with a dedicated import view.
- Replaced decorative settings labels and section numbers with a cleaner product-style hierarchy.
- Added Warm, Porcelain, Sage, and Graphite theme palettes, each with Light and Dark variants.
- Added immediate animated palette switching with persistent browser storage.
- Added request timeouts and per-widget refresh state so the refresh control always recovers.
- Added a polished open and close transition for the Settings panel.
- Added a rolling latest package for Edge and manual installs without changing the store version.
- Restored the saved theme before first paint to remove the warm-to-selected-theme flash.
- Refined widget, shortcut, and settings typography for clearer hierarchy across desktop and narrow screens.
- Stabilized search depth, restored collapsed widgets before first paint, and added a restrained search exit transition.
- Updated web search to use the browser-selected provider through Chrome Search API and removed custom search prefixes for single-purpose review compliance.

## 0.7.0 - 2026-07-27

- Removed the language switcher and shortcut edit button; the interface is now English-only.
- Rebuilt the Light / Dark preference as an immediate sliding segmented control with a reduced-motion-safe theme reveal.
- Added long-press and right-click shortcut editing with an Apple-style jiggle state, visible delete controls, persistent deletion, and click-away dismissal.

## 0.6.1 - 2026-07-27

- Added complete Chrome extension icon sizes and store-ready manifest metadata.
- Added a public privacy policy and reviewer-ready permission explanations.
- Added Chrome Web Store screenshots, a small promo tile, and listing copy.
- Added automated validation for required PNG dimensions.

## 0.6.0 - 2026-07-27

- Replaced the fixed GitHub column with a single switchable widget sidebar.
- Added live Hacker News stories with a ten-minute local cache.
- Added a local 25/5-minute focus timer with pause and reset controls.
- Added persistent collapse, expand, and active-widget state.
- Added a responsive overlay drawer for narrow browser windows.

## 0.5.1 - 2026-07-26

- Removed the top-left WisdomEchoes wordmark.
- Removed the GitHub widget time-window eyebrow and visible auto-sync status.
- Realigned the top toolbar, GitHub header, and widget footer after the cleanup.
- Kept visibility-aware GitHub auto-sync running without visible status chrome.

## 0.5.0 - 2026-07-26

- Rewrote the GitHub widget heading to clearly describe its seven-day trending view.
- Added detailed loading, success, error, and reduced-motion feedback to the refresh control.
- Added localized live-status copy and a compact sync indicator.
- Added ten-minute auto-sync while the tab is visible, visibility-aware catch-up, and online recovery.
- Deduplicated overlapping automatic and manual GitHub requests while preserving offline cache fallback.

## 0.4.1 - 2026-07-26

- Removed the greeting, network indicator, and bottom status bar.
- Removed the now-unused identity and status-bar settings.
- Renamed the default WisdomEchoes and Langqian shortcuts to Blog and SurferGarage.
- Added a stored-settings migration that preserves custom shortcut labels.

## 0.4.0 - 2026-07-26

- Removed the launcher panel and its duplicate navigation layer.
- Added brand-aware fitting for WisdomEchoes, Langqian, and GitHub shortcut logos.
- Reworked Google search into a pill field with a circular submit button.
- Kept GitHub Rising, settings, caching, keyboard search, and responsive layouts intact.
- Refreshed the desktop preview and GitHub Release package.

## 0.3.0 - 2026-07-26

- Added official site logos, editable shortcuts, and the GitHub Rising seven-day repository ranking.
- Added local caching, light and dark surfaces, language switching, and responsive layouts.
