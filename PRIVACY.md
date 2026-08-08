# Wisdom New Tab Privacy Policy

Effective date: August 1, 2026

Wisdom New Tab is a desktop browser extension that replaces the New Tab page with search, shortcuts, public developer news, and a local focus timer. This policy explains the limited data the extension handles.

## Data stored on your device

The extension uses `chrome.storage.local` to save:

- interface language and appearance preferences;
- shortcut names, URLs, colors, and optional custom logo images that you configure;
- the active widget and whether the widget sidebar is collapsed;
- cached public GitHub and Hacker News results; and
- local focus timer state.

This information stays in your browser profile. The developer does not receive or maintain a server-side copy. Removing the extension or clearing its storage removes this local data according to your browser's normal behavior.

## Network requests

Wisdom New Tab makes HTTPS requests only for its visible, user-facing features:

- `api.github.com` provides public repository metadata for the GitHub Trending widget.
- `hacker-news.firebaseio.com` provides public Hacker News story data.
- Submitted search text is passed to the browser's selected search provider exclusively through `chrome.search.query`; the extension does not choose or change the default provider and has no provider-specific fallback.
- When you open a shortcut or story, your browser navigates to that destination normally.

The GitHub and Hacker News requests do not contain your shortcut configuration, search text, browsing history, or a developer-issued identifier.

In the Chrome extension, website shortcut icons are obtained through the browser's favicon service. If you choose **Import bookmarks**, the extension asks for bookmark access at that moment, reads the current browser's bookmark tree to show the picker, and stores only the bookmarks you explicitly add as shortcuts. Bookmark folders and unselected bookmarks are not copied into extension storage or sent anywhere. The reduced-permission Edge package uses bundled brand marks or local letter fallbacks and does not request bookmark access.

## Data the developer does not collect

Wisdom New Tab does not collect analytics, advertising identifiers, browsing history, passwords, authentication data, financial information, health information, precise location, personal communications, or content from pages you visit. It does not inject scripts into other websites and does not sell or share user data for advertising or profiling.

## Browser extension permissions

- `storage` stores settings, shortcuts, timer state, and public-data caches locally.
- `favicon` displays website icons already available through the browser's favicon service.
- `search` submits search text exclusively through the browser's currently selected provider without changing it. If Chrome Search API is unavailable, no alternate provider is used.
- `bookmarks` is optional and requested only after you select **Import bookmarks**. It reads the bookmark tree for the local picker and does not create, edit, move, or delete browser bookmarks.
- Access to `https://api.github.com/*` is limited to public repository data used by the GitHub widget.
- Access to `https://hacker-news.firebaseio.com/*` is limited to public story data used by the Hacker News widget.

The extension does not execute remotely hosted code. All executable code is included in the installed package.

## Limited use

Data handled by Wisdom New Tab is used only to provide and improve the extension's disclosed, user-facing features. It is not transferred for advertising, credit-worthiness, or unrelated purposes, and it is not made available for humans to read except when required for security, legal compliance, or support explicitly requested by the user.

## Contact

Questions and privacy requests can be submitted through the public issue tracker:

https://github.com/FranklinNexus/wisdom-newtab/issues

## Changes

Material changes to this policy will be published in this repository and reflected by an updated effective date.
