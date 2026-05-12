# Mirror 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建认知数据提取引擎，两阶段蒸馏（Gemini压缩 + Claude三层提取）+ 质量评估

**Architecture:** FastAPI后端 + Vite/React前端 + PostgreSQL + 静态部署

**Tech Stack:** FastAPI, SQLAlchemy, PostgreSQL, Vite, React, React Router, Tailwind, shadcn/ui, Recharts

---

## Phase 1: 后端核心（2天）

### Task 1: 项目初始化

**Files:**
- Create: `backend/main.py`, `backend/requirements.txt`, `backend/.env.example`
- Create: `backend/app/__init__.py`, `backend/app/config.py`

- [x] 创建FastAPI项目结构
- [x] 安装依赖：`fastapi uvicorn sqlalchemy psycopg2-binary anthropic google-generativeai python-dotenv`
- [x] 配置环境变量（数据库URL、API keys）
- [x] 测试启动：`uvicorn app.main:app --reload`

### Task 2: 数据库设计

**Files:**
- Create: `backend/app/models.py`, `backend/app/database.py`
- Create: `backend/alembic.ini`, `backend/alembic/env.py`

- [x] 定义SQLAlchemy模型（distillations, contents, cognitive_profiles, quality_reports）
- [x] 配置Alembic迁移
- [x] 生成初始迁移：`alembic revision --autogenerate -m "initial"`
- [x] 执行迁移：`alembic upgrade head`
- [x] 验证表创建：`psql -d mirror -c "\dt"`

### Task 3: 基础API端点

**Files:**
- Create: `backend/app/routers/distillations.py`
- Create: `backend/app/schemas.py`

- [x] 实现CRUD端点（POST /api/distillations, GET /api/distillations, GET /api/distillations/{id}, DELETE /api/distillations/{id}）
- [x] Pydantic schemas定义
- [x] 测试API：`curl -X POST http://localhost:8000/api/distillations -d '{"name":"test","raw_text":"..."}'`

### Task 4: 三层分段蒸馏设计（已完成）

**Status:** ✅ 已完成

**实现方式：** 三层串行请求 + 分段交付 + 缓存机制

**Files:**
- Created: `docs/prompts/layer1.md` - 底层假设提取 + 段落索引构建
- Created: `docs/prompts/layer2.md` - 推理规则提取
- Created: `docs/prompts/layer3.md` - 表达策略分析
- Created: `docs/three-layer-staged-distillation.md` - 完整设计文档

**核心设计：**
- 请求1：提取底层假设 + 构建paragraph_index（包含段落类型标注和完整原文）
- 请求2：基于请求1的paragraph_index提取推理规则（不重新扫描原文）
- 请求3：基于请求1+2的输出提取表达策略（不重新扫描原文）
- 每层完成后等待用户确认，支持中途叫停
- 描述型段落的full_text为null，节省20-30% token

**测试结果：**
- 单段落测试文本成功完成三层蒸馏
- 提取3条底层假设、1条推理规则、4条表达策略
- Claude诚实标注数据量限制，未编造规则

### Task 5: Claude蒸馏模块（已完成）

**Status:** ✅ 已完成

**Files:**
- Created: `backend/app/services/claude_distiller.py` - Claude API调用（支持自定义base_url）
- Created: `backend/app/services/distillation_engine.py` - 后台任务引擎
- Created: `backend/app/routers/distillation_control.py` - 控制API端点
- Modified: `backend/app/models.py` - 增加layer1/2/3_result和current_layer字段
- Created: `backend/alembic/versions/73c95fab5e99_add_layer_results_and_current_layer.py` - 数据库迁移

**实现功能：**
- [x] 三层Prompt加载（从docs/prompts/读取）
- [x] Claude API调用（支持中转API的base_url配置）
- [x] JSON解析（支持```json代码块和纯文本）
- [x] 后台线程任务（分段执行，状态机管理）
- [x] 缓存机制（layer1/2/3_result存储，失败重试不重跑已完成层）
- [x] 分段交付API：
  - POST /api/distillations/{id}/continue - 继续下一层
  - POST /api/distillations/{id}/stop - 叫停任务
  - GET /api/distillations/{id}/status - 查询实时状态
  - GET /api/distillations/{id}/layer1 - 查看请求1结果
  - GET /api/distillations/{id}/layer2 - 查看请求2结果
  - GET /api/distillations/{id}/layer3 - 查看请求3结果

**测试结果：**
- 中转API调用成功（base_url: https://cc-vibe.com）
- 三层蒸馏完整流程通过
- 分段交付和缓存机制正常工作

### Task 6: 蒸馏流程串联（已完成）

**Status:** ✅ 已完成（三层分段蒸馏）

**Note:** 原计划的"Gemini压缩 → Claude蒸馏"流程已调整为"三层分段蒸馏"。Gemini压缩模块暂未实现，当前直接使用compressed_text字段作为输入。

---

## Phase 2: 质量评估（1天）

### Task 7: 置信度计算

**Files:**
- Create: `backend/app/services/quality_evaluator.py`

- [ ] 实现置信度规则（证据数>=5且来源>=3 → 高，证据数>=3且来源>=2 → 中，其他 → 低）
- [ ] 测试：用mock数据验证计算逻辑

### Task 8: Bad Case检测

**Files:**
- Modify: `backend/app/services/quality_evaluator.py`
- Create: `backend/app/prompts/bad_case_prompt.py`

- [ ] 设计Bad case检测Prompt（找矛盾信念）
- [ ] 调用Claude检测矛盾
- [ ] 测试：构造矛盾信念，验证能否检测出来

### Task 9: 覆盖度分析 + 报告生成

**Files:**
- Modify: `backend/app/services/quality_evaluator.py`
- Create: `backend/app/services/report_generator.py`

- [ ] 实现覆盖度规则（认知层>=3条信念 → 充足，表达层全字段 → 充足，互动层全字段 → 充足）
- [ ] 生成Markdown报告（整体评分、置信度分析、Bad case、覆盖度、迭代建议）
- [ ] 集成到蒸馏流程（蒸馏完成后自动生成质量报告）
- [ ] 测试：验证报告格式和内容

### Task 10: 质量报告API

**Files:**
- Modify: `backend/app/routers/distillations.py`

- [ ] 实现GET /api/distillations/{id}/quality端点
- [ ] 实现GET /api/distillations/{id}/export端点（支持JSON/YAML/Markdown）
- [ ] 测试API

---

## Phase 3: 前端界面（1.5天）

### Task 11: 前端项目初始化

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.js`
- Create: `frontend/src/main.jsx`, `frontend/src/App.jsx`

- [ ] 创建Vite + React项目：`npm create vite@latest frontend -- --template react`
- [ ] 安装依赖：`npm install react-router-dom @tanstack/react-query axios tailwindcss shadcn-ui recharts`
- [ ] 配置Tailwind CSS
- [ ] 配置React Router
- [ ] 测试启动：`npm run dev`

### Task 12: shadcn/ui集成

**Files:**
- Create: `frontend/components.json`
- Create: `frontend/src/components/ui/*`

- [ ] 初始化shadcn/ui：`npx shadcn-ui@latest init`
- [ ] 安装常用组件：`npx shadcn-ui@latest add button card input textarea`
- [ ] 测试组件渲染

### Task 13: 首页（任务列表）

**Files:**
- Create: `frontend/src/pages/Home.jsx`
- Create: `frontend/src/api/distillations.js`

- [ ] 实现任务列表页面（卡片布局）
- [ ] React Query获取任务列表
- [ ] 支持按状态筛选、按时间排序
- [ ] 点击卡片跳转到结果页
- [ ] 测试：创建几个mock任务，验证列表显示

### Task 14: 上传页

**Files:**
- Create: `frontend/src/pages/Upload.jsx`

- [ ] 文本输入框（Textarea）
- [ ] 文件上传（Input type="file"）
- [ ] 提交表单（POST /api/distillations）
- [ ] 提交后跳转到进度页
- [ ] 测试：上传文本，验证任务创建

### Task 15: 进度页

**Files:**
- Create: `frontend/src/pages/Progress.jsx`

- [ ] 显示当前状态（pending/processing/completed/failed）
- [ ] 轮询任务状态（React Query refetchInterval）
- [ ] 进度条（阶段一 → 阶段二 → 质量评估）
- [ ] 完成后自动跳转到结果页
- [ ] 测试：提交任务，观察进度更新

### Task 16: 结果页

**Files:**
- Create: `frontend/src/pages/Result.jsx`
- Create: `frontend/src/components/CognitiveLayer.jsx`
- Create: `frontend/src/components/ExpressionLayer.jsx`
- Create: `frontend/src/components/InteractionLayer.jsx`
- Create: `frontend/src/components/QualityReport.jsx`

- [ ] 认知层卡片（核心信念可展开证据链）
- [ ] 表达层卡片
- [ ] 互动层卡片
- [ ] 质量报告卡片（置信度柱状图、覆盖度雷达图用Recharts）
- [ ] 导出按钮（下载JSON/Markdown）
- [ ] 测试：用真实蒸馏结果验证展示效果

---

## Phase 4: 部署（0.5天）

### Task 17: 服务器环境配置

- [ ] 安装PostgreSQL：`sudo apt install postgresql postgresql-contrib`
- [ ] 创建数据库：`sudo -u postgres createdb mirror`
- [ ] 创建数据库用户：`sudo -u postgres createuser mirror_user -P`
- [ ] 授权：`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mirror TO mirror_user;"`

### Task 18: 后端部署

**Files:**
- Create: `/etc/systemd/system/mirror-backend.service`

- [ ] 上传后端代码到服务器
- [ ] 安装Python依赖：`pip install -r requirements.txt`
- [ ] 配置环境变量（.env文件）
- [ ] 执行数据库迁移：`alembic upgrade head`
- [ ] 创建systemd服务
- [ ] 启动服务：`sudo systemctl start mirror-backend`
- [ ] 验证：`curl http://localhost:8000/api/distillations`

### Task 19: 前端部署

**Files:**
- Create: `/etc/nginx/sites-available/mirror`

- [ ] 前端build：`npm run build`
- [ ] 上传dist文件到服务器（/var/www/mirror）
- [ ] 配置Nginx（静态文件 + API反向代理）
- [ ] 重启Nginx：`sudo systemctl restart nginx`
- [ ] 验证：访问 http://43.128.11.119

---

## Phase 5: 测试优化（1.5天）

### Task 20: 真实案例测试

- [ ] 准备5个真实语料（每个10万字以上）
- [ ] 逐个提交蒸馏任务
- [ ] 验证蒸馏结果质量（核心信念是否准确、证据链是否完整）
- [ ] 记录问题（Prompt不准确、格式错误、性能问题等）

### Task 21: Prompt优化

- [ ] 根据测试结果调整Gemini压缩Prompt
- [ ] 根据测试结果调整Claude蒸馏Prompt
- [ ] 重新测试，验证改进效果
- [ ] 迭代2-3轮直到满意

### Task 22: Bug修复 + 性能优化

- [ ] 修复测试中发现的Bug
- [ ] 优化数据库查询（添加索引）
- [ ] 优化前端加载速度（代码分割、懒加载）
- [ ] 添加错误处理和用户提示

### Task 23: 文档编写

**Files:**
- Create: `README.md`, `docs/API.md`, `docs/DEPLOYMENT.md`

- [ ] 项目README（项目介绍、技术栈、本地开发、部署）
- [ ] API文档（端点列表、请求/响应示例）
- [ ] 部署文档（服务器配置、环境变量、常见问题）

---

## 验证清单

- [ ] 后端API全部可用（Postman测试）
- [ ] 前端4个页面全部正常（手动测试）
- [ ] 端到端流程跑通（上传文本 → 蒸馏 → 查看结果）
- [ ] 真实案例测试通过（至少3个）
- [ ] 部署到云服务器成功
- [ ] 文档完整

---

**预计总时长：7天**
