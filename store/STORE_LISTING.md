# Chrome Web Store Submission

This file contains reviewer-ready text and the exact upload checklist for Wisdom New Tab 0.8.1.

## Product details

Name:

```text
Wisdom New Tab
```

Summary:

```text
Replace the new tab with a calm, customizable developer dashboard.
```

Category: `Productivity`

Language: `English`

Detailed description:

```text
Wisdom New Tab replaces the default new tab page with a quiet workspace for developers and makers.

Use the search field with the browser's currently selected search engine, or open a saved site shortcut. The search field calls Chrome Search API only; it never selects or changes the search provider. Keep frequently used sites close with editable visual shortcuts. A single, collapsible widget sidebar switches between live GitHub repository trends, current Hacker News stories, and a local 25/5 focus timer.

Highlights:
- Calm, responsive new tab layout
- Search through the user's selected browser search engine
- Editable local shortcuts
- Automatic website favicons and optional custom shortcut logos
- Optional import from the current Chrome or Edge bookmark collection
- Public GitHub and Hacker News data
- Local 25/5 focus timer
- Collapsible single-widget sidebar
- Immediate Light / Dark surface switching
- Warm, Porcelain, Sage, and Graphite theme palettes
- Press-and-hold shortcut editing with persistent deletion

Privacy-first by design: settings stay in browser storage, there are no analytics or ads, and the extension does not read browsing history or inject scripts into websites.
```

## Graphic assets

Upload these files from `store/assets/`:

- Store icon: `icon-128.png` (128x128)
- Screenshot 1: `01-github-1280x800.png`
- Screenshot 2: `02-hacker-news-1280x800.png`
- Screenshot 3: `03-focus-timer-1280x800.png`
- Small promo tile: `promo-small-440x280.png`

The optional 1400x560 marquee tile and YouTube video can be added later. Do not delay the first review for them.

## Privacy practices

Single purpose:

```text
This extension has one purpose: replace Chrome's new tab page with a customizable developer dashboard. It does not override or modify the default search engine, omnibox, home page, startup pages, or searches outside its own new tab page. The new-tab search field delegates submitted text exclusively to `chrome.search.query`, which uses the search provider already selected by the user in Chrome.
```

Permission justification for `storage`:

```text
Stores the user's interface preferences, configured shortcut names, URLs, colors, optional custom logo images, selected widget, collapsed state, local focus timer state, and short-lived caches of public GitHub and Hacker News data. The extension uses chrome.storage.local only and does not sync this data to a developer server.
```

Permission justification for `search`:

```text
Used only when the user submits the search field inside the replacement new tab page. Every query is passed directly to `chrome.search.query({ text, disposition: "CURRENT_TAB" })`, which uses the provider already selected by the user in Chrome. The extension contains no provider-specific search URL, no alternate-provider fallback, and no code or manifest setting that sets, replaces, or modifies the default search provider.
```

Permission justification for `favicon`:

```text
Uses Chrome's favicon service to show the website's own icon on each configured shortcut. The extension does not read browsing history or page content.
```

Optional permission justification for `bookmarks`:

```text
Requested only when the user selects Import bookmarks. It reads the current browser's bookmark tree for a local search and multi-select picker. Only bookmarks the user explicitly adds are stored as shortcuts; the extension does not create, edit, move, or delete browser bookmarks.
```

Host permission justification for `https://api.github.com/*`:

```text
Fetches public repository metadata for the visible GitHub Trending widget. Requests do not use authentication and do not include user settings, search text, browsing history, or a developer-issued identifier.
```

Host permission justification for `https://hacker-news.firebaseio.com/*`:

```text
Fetches public story IDs and story metadata for the visible Hacker News widget. Requests do not include user settings, search text, browsing history, or a developer-issued identifier.
```

Remote code:

```text
No. The extension does not execute remote code. All JavaScript is packaged with the extension. Network responses from GitHub and Hacker News are treated only as data and rendered as text and links.
```

Data handling declaration:

```text
The developer does not collect or retain user data. The extension handles user-configured shortcuts, optional custom logos, and preferences locally. The optional bookmark picker reads the current browser's bookmark tree only after the user invokes it and stores only explicitly selected bookmarks as shortcuts. Search text is passed directly to Chrome Search API only after the user submits it; the API uses the provider already selected in Chrome. The extension has no provider-specific fallback. Public GitHub and Hacker News requests contain no user data. There are no analytics, ads, tracking identifiers, or background browsing-history collection.
```

Do not claim that the extension handles no data at all: Chrome's policy treats locally stored user settings as user-data handling. Answer the dashboard's standardized categories according to the exact wording shown there, and keep the declarations consistent with the public privacy policy.

Privacy policy URL after GitHub Pages is enabled:

```text
https://franklinnexus.github.io/wisdom-newtab/privacy.html
```

Fallback public URL:

```text
https://github.com/FranklinNexus/wisdom-newtab/blob/main/PRIVACY.md
```

## Distribution

- Visibility: `Public`
- Regions: `All regions` unless a specific legal or product reason requires exclusions
- Pricing: `Free`
- In-app purchases: `No`

## Test instructions

```text
1. Install the extension and open a new tab.
2. Submit a search and verify that it uses the search engine currently selected in Chrome. The implementation calls `chrome.search.query` and contains no provider-specific fallback.
3. Select the GitHub, Hacker News, and focus timer icons in the right sidebar; only one widget is visible at a time.
4. Use the rightmost sidebar control to collapse the sidebar, then use the right-edge handle to reopen it.
5. Open Settings to verify the Light / Dark preference persists after opening another new tab.
6. Press and hold a shortcut until it jiggles; use its X button to delete it, then refresh to verify the deletion persists.
7. Open shortcut management, verify website favicons, and choose Import bookmarks. Grant the optional permission, select one bookmark, add it, and save.

No account, paid service, API key, or special test credential is required.
```

## Reviewer note for Red Argon resubmission

```text
Version 0.8.1 addresses the Red Argon single-purpose rejection.

Wisdom New Tab only overrides Chrome's new tab page through `chrome_url_overrides.newtab`. It does not declare `chrome_settings_overrides`, does not modify the default search engine, and does not alter searches from the omnibox or any other browser surface.

The search field inside the new tab now has exactly one code path: `chrome.search.query({ text, disposition: "CURRENT_TAB" })`. This delegates the query to the search provider already selected by the user in Chrome. Version 0.8.1 removes the previous hard-coded Google fallback and removes direct URL/address-bar behavior. If Chrome Search API is unavailable, the extension displays an error and performs no search.

Please test by selecting any default search engine in Chrome settings, opening a new tab, and submitting a query. The result uses that selected provider.
```

## Submission order

1. Register or open the Chrome Web Store developer account.
2. Upload `wisdom-newtab-chrome-v0.8.1.zip` with `manifest.json` at the ZIP root.
3. Complete Store Listing using the text and images above.
4. Complete Privacy practices using the permission explanations above.
5. Set Distribution to free and public.
6. Add the test instructions.
7. Select deferred publishing for the first review, then submit for review.
8. After approval, inspect the listing once and publish within the dashboard's 30-day staged window.

Official references:

- https://developer.chrome.com/docs/webstore/register
- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/images
