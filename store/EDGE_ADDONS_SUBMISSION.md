# Microsoft Edge Add-ons Submission

Use `scripts/package-edge.ps1` to build `wisdom-newtab-edge-v0.8.2.zip`. This package is intended for desktop Microsoft Edge. The Chrome Web Store package and its manifest remain unchanged.

## Product details

Name:

```text
Wisdom New Tab
```

Short description:

```text
Replace the new tab with a calm, customizable developer dashboard.
```

Category: `Productivity`

Language: `English`

Description:

```text
Wisdom New Tab replaces Microsoft Edge's default new tab page with a quiet workspace for developers and makers.

Search with the provider already selected in Edge, open editable visual shortcuts, follow public GitHub and Hacker News trends, or use the local 25/5 focus timer. A single collapsible sidebar keeps one widget visible at a time. Settings and caches remain in local extension storage, with no analytics, ads, or remote code.

The Edge package omits bookmark and favicon APIs. Shortcut icons use bundled brand marks or local letter fallbacks.
```

## Privacy

Single purpose:

```text
Wisdom New Tab has one purpose: replace Microsoft Edge's New Tab page with a customizable developer dashboard. It does not change the address-bar search provider, home page, startup setting, or searches outside its own New Tab page. Search submissions use chrome.search.query and therefore use the provider already selected by the user in Edge.
```

`storage` justification:

```text
Stores interface preferences, configured shortcuts and optional custom logos, selected widget, collapsed state, focus timer state, and short-lived caches of public GitHub and Hacker News data in chrome.storage.local. This data is not sent to a developer server.
```

`search` justification:

```text
Used only when the user submits the search field on the replacement New Tab page. The query is passed to chrome.search.query with CURRENT_TAB, which uses the search provider already selected by the user. The extension does not set or change that provider.
```

GitHub host permission:

```text
Fetches unauthenticated public repository metadata for the visible GitHub Trending widget. Requests do not include user settings, search text, browsing history, or a developer-issued identifier.
```

Hacker News host permission:

```text
Fetches public story metadata for the visible Hacker News widget. Requests do not include user settings, search text, browsing history, or a developer-issued identifier.
```

Remote code: `No`

Privacy policy:

```text
https://franklinnexus.github.io/wisdom-newtab/privacy.html
```

## Availability

- Visibility: `Public`
- Markets: `All markets`
- Pricing: `Free`
- Mature content: `No`

## Reviewer instructions

```text
1. Install Wisdom New Tab in Microsoft Edge and open a new tab.
2. Submit a search and confirm it uses the search provider currently selected in Edge.
3. Switch between GitHub, Hacker News, and Focus in the single widget sidebar.
4. Collapse the sidebar, open another new tab, and confirm the collapsed state is restored before first paint.
5. Change the theme and confirm it is restored before first paint on another new tab.
No account, API key, paid service, or test credential is required.
```

## Upload sequence

1. Open Microsoft Partner Center and create a new Microsoft Edge extension.
2. Upload `wisdom-newtab-edge-v0.8.2.zip`.
3. Set Availability to Public and All markets.
4. Complete Properties and Privacy with the text above.
5. Reuse the images in `store/assets/` for the English store listing.
6. Add the reviewer instructions and submit for certification.

Official references:

- https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/api-support
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
