# Mirror 项目交接文档

**交接时间**: 2026-05-12  
**当前进度**: Task 10 完成（质量评估模块），准备开始 Task 11（前端初始化）

---

## 1. 项目状态

### 工作目录
- **项目根目录**: `/home/ubuntu/mirror`
- **后端代码**: `/home/ubuntu/mirror/backend`
- **前端目录**: `/home/ubuntu/mirror/frontend`（待创建）

### Git 状态
- **分支**: `main`
- **最新 commit**: 三层蒸馏引擎实现

### 运行环境
- **后端服务**: `http://0.0.0.0:8000`（后台进程，`--reload` 模式）
- **数据库**: PostgreSQL，已应用迁移 `73c95fab5e99`
- **中转 API**: `https://cc-vibe.com`（已配置在 `.env`）

---

## 2. 已完成的工作

### ✅ Task 1-3: 项目初始化
- 数据库设计（4张表：distillations, contents, cognitive_profiles, quality_reports）
- API 设计（RESTful 端点）

### ✅ Task 4-6: 三层蒸馏引擎
- **两阶段蒸馏**: Gemini 2.0 Flash 压缩 → Claude Sonnet 4 三层蒸馏
- **分段交付**: 每层完成后等待用户确认（`continue` 端点）
- **缓存中间结果**: `layer1_result`, `layer2_result`, `layer3_result` 字段
- **后台任务**: 使用 Python 线程实现（非 Celery）

### ✅ Task 7-10: 质量评估模块
- 置信度评分（0-100）
- Bad Case 检测（幻觉、遗漏、过度简化）
- 覆盖度分析（段落级别）
- 整体质量报告（JSON/YAML/Markdown 导出）

### ✅ 设计风格敲定
- **Kenya Hara 东方极简风格**
- Demo 地址: `/home/ubuntu/mirror/design/kenya-hara-demo.html`

---

## 3. 核心技术决策

### 三层架构设计
1. **Layer 1（段落索引）**: 输出 `paragraph_index`，包含段落类型 + `full_text`（描述型为 `null`）
2. **Layer 2-3（深度蒸馏）**: **只用 `paragraph_index`**，不传压缩文本，避免层间漂移

### 数据库表结构
- `distillations`: 任务主表（状态、层级、时间戳）
- `contents`: 原文和压缩文本
- `cognitive_profiles`: 用户认知画像
- `quality_reports`: 质量评估结果

### API 端点（已实现）
```
POST   /api/distillations              # 创建任务并自动启动后台蒸馏
GET    /api/distillations              # 获取任务列表
GET    /api/distillations/{id}         # 获取任务详情
DELETE /api/distillations/{id}         # 删除任务
POST   /api/distillations/{id}/continue # 继续下一层
POST   /api/distillations/{id}/stop    # 叫停任务
GET    /api/distillations/{id}/layer1  # 查看请求1结果
GET    /api/distillations/{id}/layer2  # 查看请求2结果
GET    /api/distillations/{id}/layer3  # 查看请求3结果
GET    /api/distillations/{id}/status  # 查询实时状态
GET    /api/distillations/{id}/quality # 获取质量报告
GET    /api/distillations/{id}/export  # 导出质量报告（json/yaml/markdown）
```

---

## 4. 关键文件位置

### Prompt 文件
- `/home/ubuntu/mirror/backend/prompts/layer1_paragraph_index.txt`
- `/home/ubuntu/mirror/backend/prompts/layer2_deep_distillation.txt`
- `/home/ubuntu/mirror/backend/prompts/layer3_final_distillation.txt`

### 设计文档
- `/home/ubuntu/mirror/design/kenya-hara-demo.html`（设计 Demo）
- `/home/ubuntu/mirror/docs/implementation-plan.md`（实现计划）
- `/home/ubuntu/mirror/docs/three-layer-distillation-design.md`（三层蒸馏设计）

### 后端代码
- `/home/ubuntu/mirror/backend/main.py`（FastAPI 主入口）
- `/home/ubuntu/mirror/backend/models.py`（数据库模型）
- `/home/ubuntu/mirror/backend/schemas.py`（Pydantic 模型）
- `/home/ubuntu/mirror/backend/crud.py`（数据库操作）
- `/home/ubuntu/mirror/backend/distillation_engine.py`（蒸馏引擎）
- `/home/ubuntu/mirror/backend/quality_evaluator.py`（质量评估）

---

## 5. 设计规范（Kenya Hara 风格）

### 配色方案
- **Hero 区背景**: `#E8E3DC`（米白）
- **下方背景**: `#B5A79A`（米棕）
- **文字颜色**: `#2B2B2B`（深黑）
- **细线颜色**: `#8B7D6F`

### 字体规范
- **标题**: 80px Georgia 衬线
- **正文**: 16px 无衬线

### 卡片样式
- **内边距**: 30px
- **间隔**: 24px
- **背景**: 半透明白色 `rgba(255,255,255,0.85)`

### 装饰元素
- **四条平行黑线**: 1px → 2px → 3px → 4px（从上到下变粗）
- **黑色横幅**: 反白文字
- **巨大数字 "1"**: 透明度 15%

### 动画规范
- **只用 `transform`**，`ease` 缓动
- **禁止**: `backdrop-filter`, `box-shadow`

### 语言
- **全中文界面**

---

## 6. 下一步行动（Task 11: 前端项目初始化）

### 目标
在 `/home/ubuntu/mirror/frontend` 创建前端项目

### 技术栈
- **框架**: Vite + React
- **样式**: Tailwind CSS + shadcn/ui
- **路由**: React Router

### 具体步骤
1. 创建 Vite + React 项目
2. 安装 Tailwind CSS + shadcn/ui
3. 把 Kenya Hara 设计风格转成全局 CSS 变量和 Tailwind 配置
4. 搭建路由结构：
   - `/` - 首页（任务列表）
   - `/upload` - 上传页（创建任务）
   - `/progress/:id` - 进度页（实时监控）
   - `/result/:id` - 结果页（数据展示）

### 后续任务（Task 12-23）
- **Task 12-15**: 四个页面的 UI 实现
- **Task 16**: 前端 API 集成（连接后端 8000 端口）
- **Task 17-19**: 部署配置（Nginx + systemd + 域名）
- **Task 20-23**: 测试优化（真实案例 + Prompt 优化 + 性能测试 + 文档）

---

## 7. 重要提醒

### 代码修改工作流
- **非紧急改动**: 先出方案（问题诊断 + 修改计划 + 预期效果 + 风险评估），确认后再执行
- **紧急修复**: 直接做

### 质量要求
- 先读懂代码，追踪执行路径，再动手
- 改动最小化，不扩大范围
- 线程安全、边界情况、依赖兼容性全过一遍
- 验证逻辑要真验，不能自欺欺人
- 交付前确认：解决了问题、没引入副作用、没暴露敏感信息

### 用户偏好
- **渐进式推进**: 先文档/计划确认后再执行，不一次性完成多阶段
- **深度优于广度**: 宁可做精一个功能，不要浅尝辄止多个功能
- **产品思维**: 先 brainstorm，权衡"展示效果 vs 实现难度"

---

## 8. 快速启动命令

### 启动后端服务
```bash
cd /home/ubuntu/mirror/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 查看后台进程
```bash
process list
```

### 数据库迁移
```bash
cd /home/ubuntu/mirror/backend
alembic upgrade head
```

---

**交接完成，准备开始 Task 11 前端初始化。**
