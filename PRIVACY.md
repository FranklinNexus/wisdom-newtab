# Wisdom New Tab Privacy Policy

Effective date: July 27, 2026

Wisdom New Tab replaces the browser new tab page with search, shortcuts, public developer news, and a local focus timer. This policy explains the limited data the extension handles.

## Data stored on your device

The extension uses `chrome.storage.local` to save:

- interface language and appearance preferences;
- shortcut names, URLs, and colors that you configure;
- the active widget and whether the widget sidebar is collapsed;
- cached public GitHub and Hacker News results; and
- local focus timer state.

This information stays in your browser profile. The developer does not receive or maintain a server-side copy. Removing the extension or clearing its storage removes this local data according to your browser's normal behavior.

## Network requests

The extension makes HTTPS requests only for its visible, user-facing features:

- `api.github.com` provides public repository metadata for the GitHub Trending widget.
- `hacker-news.firebaseio.com` provides public Hacker News story data.
- When you submit a search, the text is passed to the browser's selected search provider through `chrome.search.query`; the extension does not choose or change the default provider.
- When you open a shortcut or story, your browser navigates to that destination normally.

The GitHub and Hacker News requests do not contain your shortcut configuration, search text, browsing history, or a developer-issued identifier.

## Data the developer does not collect

The extension does not collect analytics, advertising identifiers, browsing history, passwords, authentication data, financial information, health information, precise location, personal communications, or content from pages you visit. It does not inject scripts into other websites and does not sell or share user data for advertising or profiling.

## Permissions

- `storage` stores settings, shortcuts, timer state, and public-data caches locally.
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
