# Archive - 历史文档归档

本目录存放项目开发过程中的历史文档，已完成的阶段性报告，以及临时分析文件。这些文档不再是项目的活跃部分，但保留用于追溯开发历史和决策过程。

## 目录结构

### `ui-redesign/` - UI 改造过程文档
UI 设计系统从 Kenya Hara 风格迁移到 Retro Sci-Fi 风格的完整过程记录（2026-05-13 至 2026-05-14）。

**关键文档**：
- `UI_REDESIGN.md` - 初始改造计划
- `UI_REDESIGN_COMPLETE.md` - 改造完成报告
- `UI_UPDATE_v1.1.md` - v1.1 更新记录
- `RESULT_PAGE_REFACTOR_PLAN.md` - 结果页重构计划
- `UI_REFACTOR_COMPLETION.md` - UI 重构完成报告
- `UI_UX_AUDIT.md` / `UX_DETAIL_AUDIT.md` - UX 审计报告

**当前状态**：UI 改造已完成，最新设计规范见 `UI/mirror_design_spec.md`

### `planning/` - 项目规划和竞品分析
项目早期的规划文档、竞品分析报告、设计原型。

**关键文档**：
- `PROJECT_PLAN.md` - 项目初始规划
- `HANDOVER.md` - 交接文档
- `竞品分析.md` / `Mirror_竞品分析报告.html` - 竞品分析
- `design-demo-kenya-hara.html` - Kenya Hara 风格设计原型（已废弃）

**当前状态**：项目已进入稳定开发阶段，初始规划已完成

### `dogfood-output/` - 自动化诊断报告
使用 dogfood skill 生成的 UI/UX 诊断报告（2026-05-13）。

**关键文档**：
- `ui-ux-diagnosis.md` - UI/UX 诊断报告
- `ui-navigation-diagnosis.md` - 导航诊断报告
- `交互问题诊断报告.md` - 交互问题诊断

**当前状态**：诊断发现的问题已在 UI 改造中修复

## 如何使用归档文档

### 查看开发历史
如果需要了解某个功能的设计决策过程，可以查看对应的归档文档。例如：
- 想知道为什么选择 Retro Sci-Fi 风格 → 查看 `ui-redesign/UI_REDESIGN.md`
- 想了解初始项目规划 → 查看 `planning/PROJECT_PLAN.md`

### 追溯设计变更
如果需要回溯某个设计决策，归档文档提供了完整的变更记录和理由。

### 学习项目演进
新加入的开发者可以通过归档文档了解项目的演进过程，理解当前架构的来龙去脉。

## 注意事项

⚠️ **归档文档不再维护**：这些文档反映的是历史状态，不会随项目更新而同步修改。

✅ **查看最新信息**：项目的最新状态和规范请参考项目根目录的活跃文档：
- `README.md` - 项目概览
- `AGENTS.md` - Agent 工作规范
- `ARCHITECTURE.md` - 系统架构
- `UI/mirror_design_spec.md` - UI 设计规范
- `CHANGELOG.md` - 版本更新记录

## 归档日期

- **ui-redesign/** - 2026-05-14（UI 改造完成后归档）
- **planning/** - 2026-05-14（项目进入稳定开发阶段后归档）
- **dogfood-output/** - 2026-05-14（诊断问题修复后归档）
