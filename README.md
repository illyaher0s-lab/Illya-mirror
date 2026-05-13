# Mirror - 多阶段 LLM 蒸馏系统

**在线访问**: http://43.128.11.119

将长文本通过四层 AI 蒸馏，转化为认知友好的结构化内容。

## 项目简介

Mirror 是一个基于多阶段 LLM 蒸馏的知识提取系统，采用 **Gemini 2.0 Flash + Claude Sonnet 4** 两阶段蒸馏架构，将长文本（1000-50000字）压缩为易于理解和吸收的结构化内容。

### 核心特性

- **四层串行蒸馏**：段落索引 → 推理模式 → 表达策略 → 认知画像
- **分段交付**：每层完成后可查看结果、继续或停止
- **质量评估**：置信度评分、Bad Case 检测、覆盖度分析
- **导出功能**：支持 JSON/YAML/Markdown 格式导出认知画像
- **实时监控**：实时进度更新
- **Kenya Hara 设计**：东方极简美学的用户界面

## 技术栈

### 前端
- **Vite 6.0** + **React 19**
- **Tailwind CSS v4** - 样式框架
- **React Router v6** - 路由管理
- **Kenya Hara 设计风格** - 东方极简美学

### 后端
- **FastAPI** - Python Web 框架
- **PostgreSQL** - 关系型数据库
- **SQLAlchemy** + **Alembic** - ORM 和数据库迁移
- **Anthropic Claude API** - 深度蒸馏
- **Google Gemini API** - 文本压缩
- **Python 线程** - 后台任务处理

### 部署
- **Nginx** - 反向代理和静态文件服务
- **systemd** - 服务管理
- **腾讯云轻量应用服务器** - Ubuntu 24.04 LTS

## 项目结构

```
mirror/
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── api/           # API 客户端
│   │   └── index.css      # 全局样式
│   ├── dist/              # 生产构建输出
│   └── package.json
├── backend/               # 后端项目
│   ├── app/
│   │   ├── main.py        # FastAPI 入口
│   │   ├── models.py      # 数据库模型
│   │   ├── schemas.py     # Pydantic 模型
│   │   ├── routers/       # API 路由
│   │   └── services/      # 业务逻辑
│   ├── alembic/           # 数据库迁移
│   ├── prompts/           # LLM Prompt 模板
│   ├── venv/              # Python 虚拟环境
│   └── requirements.txt
├── docs/                  # 项目文档
├── nginx.conf             # Nginx 配置
├── mirror-backend.service # systemd 服务配置
├── DEPLOYMENT.md          # 部署文档
└── README.md
```

## 快速开始

### 在线使用

直接访问：http://43.128.11.119

### 本地开发

#### 1. 环境要求

- Python 3.12+
- Node.js 20+
- PostgreSQL 14+

#### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API 密钥和数据库连接

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

## API 文档

### 核心端点

```
POST   /api/distillations              # 创建蒸馏任务
GET    /api/distillations              # 获取任务列表
GET    /api/distillations/{id}         # 获取任务详情
DELETE /api/distillations/{id}         # 删除任务
POST   /api/distillations/{id}/continue # 继续下一层蒸馏
POST   /api/distillations/{id}/stop    # 停止任务
GET    /api/distillations/{id}/layer1  # 第一层结果（底层假设）
GET    /api/distillations/{id}/layer2  # 第二层结果（推理模式）
GET    /api/distillations/{id}/layer3  # 第三层结果（表达策略）
GET    /api/distillations/{id}/layer4  # 第四层结果（认知画像）
GET    /api/distillations/{id}/quality # 质量报告
GET    /api/distillations/{id}/export  # 导出结果（json/yaml/markdown）
```

### 交互式文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 四层蒸馏架构

### 第一层：底层假设（Foundational Assumptions）
- **输入**：原始长文本
- **处理**：Gemini 2.0 Flash 压缩 + Claude Sonnet 4 提取核心假设
- **输出**：`paragraph_index`（段落类型 + 关键内容）

### 第二层：推理模式（Reasoning Patterns）
- **输入**：`paragraph_index`（不传压缩文本，避免层间漂移）
- **处理**：Claude Sonnet 4 提取推理模式和思维方式
- **输出**：结构化的推理引擎

### 第三层：表达策略（Expression Strategies）
- **输入**：`paragraph_index`
- **处理**：Claude Sonnet 4 分析表达方式和沟通策略
- **输出**：表达引擎

### 第四层：认知画像（Cognitive Profile）
- **输入**：前三层结果
- **处理**：Claude Sonnet 4 综合生成完整认知画像
- **输出**：可导出的认知画像（JSON/YAML/Markdown）

## 质量评估

每个蒸馏任务都会生成质量报告：

- **置信度评分**（0-100）：基于证据链和一致性
- **Bad Case 检测**：识别幻觉、遗漏、过度简化
- **覆盖度分析**：段落级别的内容覆盖情况
- **整体评分**：综合质量评估

## 部署

详细部署文档请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 生产环境

- **服务器**：腾讯云香港轻量应用服务器
- **IP**：43.128.11.119
- **系统**：Ubuntu 24.04 LTS
- **服务管理**：systemd（mirror-backend.service）
- **Web 服务器**：Nginx（反向代理 + 静态文件）

### 服务管理

```bash
# 查看后端服务状态
sudo systemctl status mirror-backend

# 重启后端服务
sudo systemctl restart mirror-backend

# 查看日志
sudo journalctl -u mirror-backend -f
```

## 开发状态

### ✅ 已完成

- [x] 项目初始化和数据库设计
- [x] 四层蒸馏引擎实现
- [x] 质量评估模块
- [x] 前端完整实现（4个页面）
- [x] API 集成
- [x] 导出功能（JSON/YAML/Markdown）
- [x] 生产环境部署
- [x] Nginx 配置
- [x] systemd 服务配置
- [x] Layer 4 数据库迁移和架构升级（2026-05-13）

### ⏳ 待优化

- [ ] Gemini API 集成（当前压缩服务缺失）
- [ ] 真实案例测试
- [ ] Prompt 优化
- [ ] 性能测试和优化
- [ ] 用户认证和权限管理
- [ ] 考虑废弃 cognitive_profiles 表（当前保留以向后兼容）

## 环境变量

后端 `.env` 文件需要配置：

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost/mirror

# API 密钥
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key

# 中转 API（可选）
API_BASE_URL=https://cc-vibe.com
```

## 项目信息

- **开发者**：Illya
- **项目名称**：Mirror（镜像）
- **功能**：多阶段 LLM 蒸馏系统
- **部署日期**：2026-05-12
- **当前版本**：v1.0.0
- **在线地址**：http://43.128.11.119

## 许可证

MIT License

## 联系方式

如有问题，请联系项目维护者。
