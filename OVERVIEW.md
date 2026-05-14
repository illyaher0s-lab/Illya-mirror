# Mirror 项目概览

> **5 分钟快速了解 Mirror 项目**

## 一句话介绍

Mirror 是一个 AI 驱动的知识蒸馏系统，能将长文本（最多 15 万字）通过四层 AI 分析，提取出作者的思维方式和表达策略，生成可复用的"认知画像"。

## 核心价值

**问题**：读完一本书或长文章后，很难快速提取出作者的核心思维模式和表达策略。

**解决方案**：通过四层渐进式蒸馏，从原始文本中提取：
1. **Layer 1**：段落索引（FACT/JUDGE/STORY 分类）
2. **Layer 2**：推理模式（作者如何思考）
3. **Layer 3**：表达策略（作者如何表达）
4. **Layer 4**：认知画像（完整的思维系统）

## 技术架构

```
用户输入文本（1,000-150,000 字）
  ↓
Gemini 2.0 Flash 压缩（可选）
  ↓
Claude Sonnet 4 四层蒸馏
  ↓
导出认知画像（JSON/YAML/Markdown）
```

## 项目状态

- ✅ **已完成**：核心功能、UI 设计、生产部署
- ⏳ **待优化**：Gemini API 集成、真实案例测试
- 🌐 **在线访问**：http://43.128.11.119

## 快速开始

### 使用在线版本
直接访问 http://43.128.11.119，上传文本即可开始蒸馏。

### 本地开发

```bash
# 后端
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 填入 API 密钥
alembic upgrade head
uvicorn app.main:app --reload

# 前端
cd frontend
npm install
npm run dev
```

## 关键文档

- **[README.md](./README.md)** - 完整项目文档
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 系统架构说明
- **[AGENTS.md](./AGENTS.md)** - Agent 工作规范
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署指南
- **[CHANGELOG.md](./CHANGELOG.md)** - 版本更新记录
- **[UI/mirror_design_spec.md](./UI/mirror_design_spec.md)** - UI 设计规范

## 技术栈速查

| 层级 | 技术 |
|------|------|
| 前端 | Vite 6 + React 19 + React Router v6 |
| 后端 | FastAPI + PostgreSQL + SQLAlchemy |
| AI | Claude Sonnet 4 + Gemini 2.0 Flash |
| 部署 | Nginx + systemd + 腾讯云 Ubuntu 24.04 |
| 设计 | Retro Sci-Fi（纸质感 + Space Mono/Grotesk） |

## 项目结构

```
mirror/
├── frontend/          # React 前端（4 个页面）
├── backend/           # FastAPI 后端（蒸馏引擎 + API）
├── docs/              # 技术文档
├── UI/                # 设计规范和参考
├── archive/           # 历史文档归档
└── *.md               # 项目文档（README/AGENTS/ARCHITECTURE 等）
```

## 常见问题

**Q: 为什么限制 15 万字？**  
A: Claude API 的 token 限制。超过 15 万字建议手动分块蒸馏。

**Q: Gemini API 是必需的吗？**  
A: 不是。Gemini 用于压缩超长文本，如果输入文本不超过 5 万字，可以跳过压缩直接用 Claude 蒸馏。

**Q: 蒸馏一次需要多长时间？**  
A: 取决于文本长度。5 万字约 5-8 分钟，15 万字约 15-20 分钟。

**Q: 如何修改 UI 样式？**  
A: 所有样式在 `frontend/src/index.css`，使用 CSS 变量系统，参考 `UI/mirror_design_spec.md`。

## 联系方式

- **开发者**：Illya
- **部署日期**：2026-05-12
- **当前版本**：v1.1.0
- **在线地址**：http://43.128.11.119
