# Mirror - 认知数据提取引擎

基于AI的智能数据提取与分析平台

## 项目结构

```
mirror/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI应用入口
│   │   └── config.py        # 配置管理
│   ├── requirements.txt     # Python依赖
│   └── .env.example         # 环境变量模板
└── README.md
```

## 技术栈

- **FastAPI**: 现代化的Python Web框架
- **SQLAlchemy**: ORM数据库工具
- **PostgreSQL**: 关系型数据库
- **Anthropic Claude API**: AI文本处理
- **Google Gemini API**: AI多模态处理
- **Alembic**: 数据库迁移工具

## 快速开始

### 1. 配置环境变量

复制环境变量模板并填入真实值：

```bash
cd /home/ubuntu/mirror/backend
cp .env.example .env
# 编辑 .env 文件，填入真实的API密钥和数据库连接信息
```

### 2. 安装依赖

```bash
cd /home/ubuntu/mirror/backend
pip install -r requirements.txt
```

### 3. 启动应用

```bash
cd /home/ubuntu/mirror/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## API端点

- `GET /` - 根路径，返回API基本信息
- `GET /health` - 健康检查，显示数据库和API配置状态
- `GET /docs` - Swagger交互式API文档
- `GET /redoc` - ReDoc API文档

## 开发状态

✅ Task 1: 项目初始化完成
- [x] FastAPI项目结构创建
- [x] 依赖安装完成
- [x] 环境变量配置模板
- [x] 应用启动测试通过

⏳ 待开发功能
- [ ] 数据库模型设计
- [ ] API路由实现
- [ ] AI集成（Claude + Gemini）
- [ ] 数据提取逻辑
- [ ] 前端界面

## 版本

当前版本: v0.1.0
