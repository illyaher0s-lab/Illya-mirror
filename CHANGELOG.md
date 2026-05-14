# Changelog

All notable changes to the Mirror project will be documented in this file.

## [1.1.0] - 2026-05-14

### Added
- **长文本支持**：文本上限从 50,000 字提升到 150,000 字，支持书籍级别内容蒸馏
- **Retro Sci-Fi UI 设计系统**：全新的视觉风格
  - 纸质感背景纹理（零 GPU 损耗）
  - Space Mono（等宽）+ Space Grotesk（无衬线）字体组合
  - 橙蓝配色方案（#E07A30 + #4682C8）
  - 深色 Ticker 滚动条
  - 镂空标题效果
- **首页任务管理增强**：
  - 相对时间显示（X HRS AGO / X DAYS AGO）
  - 进度条显示当前层级和百分比（LAYER_1 · 25%）
  - Hover 显示删除按钮
  - COMPLETE 水印戳
  - 任务卡片紧密排列，用边框分割
- **进度页停止按钮**：支持中途停止蒸馏任务
- **结果页视觉优化**：
  - Layer 2-4 完整视觉展示（不再显示原始 JSON）
  - 统一的设计语言（编号标签、Key-Value 样式、容器样式）
  - Layer 4 完整字段显示（known_blind_spots、known_failure_modes、usage_instructions）

### Changed
- 前端全局字体放大 110%，提升可读性
- 任务列表标题改为 `// TASK_QUEUE`（等宽字体，全大写）
- 卡片标题字号从 14px 提升到 16px，font-weight 700
- 卡片背景改为 `var(--bg-card)` (#CEC4B2)，和页面背景形成深浅对比

### Fixed
- Layer 4 数据映射问题（后端返回 `cognitive_profile`，前端兼容两种字段名）
- 删除按钮在所有任务状态下都可用（之前只有失败任务有删除按钮）

## [1.0.0] - 2026-05-13

### Added
- **四层蒸馏引擎**：段落索引 → 推理模式 → 表达策略 → 认知画像
- **质量评估模块**：置信度评分、Bad Case 检测、覆盖度分析
- **前端完整实现**：4 个页面（首页/创建/进度/结果）
- **API 集成**：RESTful API，支持任务 CRUD、分层查询、导出
- **导出功能**：JSON/YAML/Markdown 格式
- **生产环境部署**：Nginx + systemd + PostgreSQL
- **Layer 4 数据库迁移**：从 `cognitive_profiles` 表迁移到 `distillations.layer4_result` 字段

### Technical Details
- 前端：Vite 6.0 + React 19 + React Router v6
- 后端：FastAPI + PostgreSQL + SQLAlchemy + Alembic
- AI：Anthropic Claude Sonnet 4（蒸馏）+ Google Gemini 2.0 Flash（压缩）
- 部署：腾讯云香港轻量应用服务器（Ubuntu 24.04 LTS）

## [0.1.0] - 2026-05-12

### Added
- 项目初始化
- 数据库设计
- 基础 API 框架
- 前端脚手架
