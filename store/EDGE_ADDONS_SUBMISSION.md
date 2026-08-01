# Microsoft Edge Add-ons Submission

Use `scripts/package-edge.ps1` to build `wisdom-newtab-edge-v0.8.2.zip`. This package is compatible with desktop Edge and Edge on Android. The Chrome Web Store package and its manifest remain unchanged.

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

The Edge package supports desktop and Android. On Android, unsupported bookmark and favicon APIs are omitted; shortcut icons use bundled brand marks or local letter fallbacks.
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

Partner Center does not expose a separate Android checkbox in the documented Availability flow. Android compatibility is determined by Edge and the APIs declared in the package. Microsoft separately curates the public **Extensions for Mobile** collection, so normal publication does not guarantee immediate inclusion there. The published listing ID can be used with **Developer options > Extension install by id** in Edge Android builds that expose that option.

## Reviewer instructions

```text
1. Install Wisdom New Tab in Microsoft Edge and open a new tab.
2. Submit a search and confirm it uses the search provider currently selected in Edge.
3. Switch between GitHub, Hacker News, and Focus in the single widget sidebar.
4. Collapse the sidebar, open another new tab, and confirm the collapsed state is restored before first paint.
5. Change the theme and confirm it is restored before first paint on another new tab.
6. On Edge Android, confirm the bookmark import action is hidden and non-bundled shortcut icons use letter fallbacks.
7. On Edge Android, choose Always start with a fresh new tab in Edge's startup setting, close Edge, and relaunch it to confirm the extension page opens.

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
- https://learn.microsoft.com/en-us/intune/app-management/configuration/configure-edge-ios-android
- https://microsoftedge.microsoft.com/addons/collections/mobile_android_extensions
