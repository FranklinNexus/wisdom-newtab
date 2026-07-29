# GitHub 成就与仓库路线

目标是把这个插件做成一个真正有人使用、有人贡献的小项目。成就只是公开协作留下的副产品，不使用无意义 commit、垃圾 issue、互刷 star 或骚扰其他仓库。

## 首次发布

1. 新建公开仓库，例如 `wisdom-newtab`。
2. 推送当前代码作为 `v0.1.0`。
3. 在仓库设置中开启 Issues、Discussions 和 Pull Requests。
4. 保护 `main`，要求 CI 通过；独立开发时不强制 review。
5. 创建带截图和变更说明的 GitHub Release。

## 可以真实推进的成就

| 成就 | 真实触发方式 | 适合本项目的动作 |
| --- | --- | --- |
| Pull Shark | 合并 Pull Request | 后续功能全部使用 issue + feature branch + PR，例如导入导出配置、主题切换、快捷键自定义 |
| Pair Extraordinaire | 合并含 co-author 的 commit | 与真实贡献者结对修一个 issue，并在 commit message 添加 `Co-authored-by:` footer |
| Quickdraw | 在很短时间内关闭 issue / PR | 只用于能立即确认的重复 issue、无效链接或小型文档修复，不制造假问题 |
| YOLO | 未经 review 合并 PR | 仅用于 CI 已通过、可立即回滚的低风险文档 PR；核心代码仍建议 review |
| Galaxy Brain | GitHub Discussion 的回答被标记为 accepted | 开启 Q&A，认真回答 Web Extension、Manifest V3 和新标签页开发问题 |
| Starstruck | 公开仓库获得足够 star | 做好 README、截图、演示 GIF、商店链接和中文/英文说明，靠真实用户获得 |
| Public Sponsor | 通过 GitHub Sponsors 赞助开源贡献者 | 选择你真正长期使用的开源项目进行赞助 |

GitHub 会调整规则与等级阈值，且部分成就是历史限定；触发前以 GitHub 当前公开说明和个人 Profile 的 Achievements 页面为准。

## 首批真实 issue

- `feat: add configuration export and import`
- `feat: support shortcut folders`
- `feat: add keyboard shortcut preferences`
- `design: create extension icons and store screenshots`
- `test: add browser-level smoke tests`
- `docs: add an English README`
- `release: prepare Chrome Web Store package`

每个 issue 都要有验收标准；一次 PR 只解决一个 issue。这样合并记录、release notes 和贡献者历史都是真实可审计的。

## 推荐分支与提交

```text
main
  feat/config-portability
  feat/shortcut-folders
  design/store-assets
  docs/english-readme
```

```text
feat: add settings export and import
fix: preserve note when settings are saved
docs: add Edge installation steps
test: validate manifest permissions
```

结对提交示例：

```text
feat: add settings export

Co-authored-by: Contributor Name <contributor@example.com>
```

只有对方确实共同完成这次修改时才使用 co-author footer。

## 不建议做的事

- 用脚本制造空 commit 或按日期伪造贡献图
- 在别人的仓库提交无关 PR 只为合并数
- 互刷 star、follow、Discussion accepted answer
- 为拿 YOLO 绕过本来需要 review 的安全检查
- 把 token、邮箱或浏览数据提交进仓库

这些做法会降低仓库可信度，也可能触发平台反滥用机制。
