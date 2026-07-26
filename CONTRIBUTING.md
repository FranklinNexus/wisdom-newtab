# Contributing

感谢你改进 Wisdom New Tab。

1. 先搜索现有 issue；没有对应问题时再新建。
2. 从 `main` 创建短生命周期分支。
3. 保持插件零构建、零运行时依赖，除非 issue 已讨论并接受改变。
4. 运行 `node scripts/validate.mjs`。
5. 在 Chrome 或 Edge 中加载解压缩插件，测试搜索、设置保存、便笺和明暗主题。
6. PR 中填写测试结果和截图，关联对应 issue。

涉及新权限时，必须在 PR 中解释权限用途和更小权限方案为何不足。
