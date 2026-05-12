# Mirror 前端项目

## 技术栈
- **框架**: Vite + React
- **样式**: Tailwind CSS v4
- **路由**: React Router v6

## 项目结构
```
frontend/
├── src/
│   ├── pages/           # 页面组件
│   │   ├── HomePage.jsx      # 首页 - 任务列表
│   │   ├── UploadPage.jsx    # 上传页 - 创建任务
│   │   ├── ProgressPage.jsx  # 进度页 - 实时监控
│   │   └── ResultPage.jsx    # 结果页 - 数据展示
│   ├── components/      # 通用组件（待添加）
│   ├── App.jsx          # 路由配置
│   ├── index.css        # 全局样式 + Kenya Hara 风格
│   └── main.jsx         # 入口文件
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
└── package.json
```

## 路由结构
- `/` - 首页（任务列表）
- `/upload` - 上传页（创建任务）
- `/progress/:id` - 进度页（实时监控）
- `/result/:id` - 结果页（数据展示）

## Kenya Hara 设计风格

### 配色方案
- `kenya-cream`: `#E8E3DC` - Hero 区背景（米白）
- `kenya-brown`: `#B5A79A` - 主背景（米棕）
- `kenya-dark`: `#2B2B2B` - 文字颜色（深黑）
- `kenya-line`: `#8B7D6F` - 细线颜色

### 自定义 CSS 类
- `.kenya-card` - 卡片样式（半透明白色背景，30px 内边距）
- `.kenya-button` - 按钮样式（深黑背景，hover 放大效果）
- `.kenya-input` - 输入框样式（细线边框，focus 变深）
- `.kenya-lines` - 装饰性平行线（1px→2px→3px→4px 渐变）
- `.kenya-number-bg` - 巨大数字背景（透明度 15%）

## 开发命令

### 启动开发服务器
```bash
cd /home/ubuntu/mirror/frontend
npm run dev -- --host 0.0.0.0
```
访问: http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 当前状态（Task 11 完成）

✅ 已完成：
- Vite + React 项目初始化
- Tailwind CSS v4 配置
- Kenya Hara 设计风格转换为全局 CSS
- 四个页面的基础 UI 实现
- React Router 路由配置
- 开发服务器启动（端口 5173）

⏳ 待完成（Task 12-16）：
- Task 12-15: 完善各页面的交互逻辑和 UI 细节
- Task 16: 前端 API 集成（连接后端 8000 端口）

## 注意事项

1. **Tailwind v4 语法变化**：
   - 使用 `@import "tailwindcss"` 代替 `@tailwind` 指令
   - 需要安装 `@tailwindcss/postcss` 包

2. **API 集成**：
   - 当前页面使用模拟数据
   - Task 16 会实现真实的 API 调用
   - 后端地址: `http://localhost:8000/api`

3. **设计规范**：
   - 禁止使用 `backdrop-filter` 和 `box-shadow`
   - 动画只用 `transform`，缓动函数用 `ease`
   - 全中文界面
