# Chrome Web Store Submission

This file contains reviewer-ready text and the exact upload checklist for Wisdom New Tab 0.6.1.

## Product details

Name:

```text
Wisdom New Tab
```

Summary:

```text
A calm new tab with search, developer shortcuts, live tech trends, and a focus timer.
```

Category: `Productivity`

Language: `English` as the default listing. Add a Simplified Chinese localization after the English listing is complete.

Detailed description:

```text
Wisdom New Tab replaces the default new tab page with a quiet workspace for developers and makers.

Search Google or use shortcuts for GitHub, YouTube, MDN, npm, and Wikipedia. Keep frequently used sites close with editable visual shortcuts. A single, collapsible widget sidebar switches between live GitHub repository trends, current Hacker News stories, and a local 25/5 focus timer.

Highlights:
- Calm, responsive new tab layout
- Google search with developer search prefixes
- Editable local shortcuts
- Public GitHub and Hacker News data
- Local 25/5 focus timer
- Collapsible single-widget sidebar
- Light and dark surfaces
- English and Simplified Chinese interface

Privacy-first by design: settings stay in browser storage, there are no analytics or ads, and the extension does not read browsing history or inject scripts into websites.
```

Simplified Chinese description:

```text
Wisdom New Tab 将默认新标签页替换为一个安静、实用的开发者工作台。

你可以直接使用 Google 搜索，也可以通过前缀快速搜索 GitHub、YouTube、MDN、npm 和 Wikipedia。常用网站可以保存为可编辑快捷入口。右侧只有一个可收起组件栏，可在 GitHub 热门项目、Hacker News 实时热点和本地 25/5 专注计时器之间切换。

主要功能：
- 安静、响应式的新标签页布局
- 带开发者搜索前缀的 Google 搜索
- 保存在本地的可编辑快捷入口
- GitHub 与 Hacker News 公开实时数据
- 本地 25/5 专注计时器
- 可完全收起的单组件侧栏
- 明暗表面设置
- 中英文界面

隐私优先：设置只保存在浏览器本地，不含分析与广告，不读取浏览历史，也不向其他网站注入脚本。
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
Replace the browser new tab page with a calm developer dashboard that combines search, user-configured shortcuts, public technology trends, and a local focus timer.
```

Permission justification for `storage`:

```text
Stores the user's interface preferences, configured shortcut names and URLs, selected widget, collapsed state, local focus timer state, and short-lived caches of public GitHub and Hacker News data. The extension uses chrome.storage.local only and does not sync this data to a developer server.
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
The developer does not collect or retain user data. The extension handles user-configured shortcuts and preferences locally. Search text is sent directly to the selected search provider only after the user submits it. Public GitHub and Hacker News requests contain no user data. There are no analytics, ads, tracking identifiers, or background browsing-history collection.
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
2. Submit a search to verify navigation to Google.
3. Select the GitHub, Hacker News, and focus timer icons in the right sidebar; only one widget is visible at a time.
4. Use the rightmost sidebar control to collapse the sidebar, then use the right-edge handle to reopen it.
5. Open Settings or Edit shortcuts to verify values persist after opening another new tab.

No account, paid service, API key, or special test credential is required.
```

## Submission order

1. Register or open the Chrome Web Store developer account.
2. Upload `wisdom-newtab-chrome-v0.6.1.zip` with `manifest.json` at the ZIP root.
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
