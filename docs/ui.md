# Mirror UI/UX 设计规范

**最后更新**：2026-05-13  
**目的**：统一布局、组件、状态，确保视觉一致性和交互可预测性。

---

## 一、全局设计系统

### 1.1 布局规范

```
- Header 高度：64px
- 主内容容器：max-width: 1120px，居中
- 容器 padding：左右 32px，顶部 48px
- Spacing 系统：8 / 12 / 16 / 24 / 32 / 48 / 64
```

**页面结构**：
```
┌─────────────────────────────────────────┐
│ AppHeader (64px)                        │
├─────────────────────────────────────────┤
│ Hero 区（奶油色背景）                    │
│ ┌─────────────────────────────────────┐ │
│ │ PageContainer (max-w-1120px)        │ │
│ │ - 返回按钮                           │ │
│ │ - PageTitle                         │ │
│ │ - 主操作按钮                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 主内容区                                 │
│ ┌─────────────────────────────────────┐ │
│ │ PageContainer (max-w-1120px)        │ │
│ │ - 内容卡片                           │ │
│ │ - 列表 / 表单 / 结果                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 1.2 字体层级

| 用途 | 字号 | 行高 | 字重 | Tailwind |
|------|------|------|------|----------|
| 页面主标题 | 36px | 44px | 600 | `text-4xl leading-[44px] font-semibold` |
| 区块标题 | 24px | 32px | 600 | `text-2xl leading-8 font-semibold` |
| 小标题 | 18px | 28px | 600 | `text-lg leading-7 font-semibold` |
| 正文 | 16px | 24px | 400 | `text-base leading-6` |
| 辅助信息 | 14px | 20px | 400 | `text-sm leading-5 text-kenya-dark/60` |
| 按钮文字 | 14-15px | - | 500 | `text-sm font-medium` |

### 1.3 颜色系统（Kenya Hara 设计语言）

```css
/* 主色 */
--kenya-cream: #FFF8F0;      /* 奶油色背景 */
--kenya-brown: #F5EFE7;      /* 浅棕色背景 */
--kenya-dark: #2C2C2C;       /* 深灰色文字 */
--kenya-line: #8B7355;       /* 棕色边框 */

/* 状态色 */
--status-processing: #3B82F6; /* 蓝色 */
--status-completed: #10B981;  /* 绿色 */
--status-failed: #EF4444;     /* 红色 */
--status-pending: #6B7280;    /* 灰色 */
```

### 1.4 按钮规范

#### PrimaryButton
```jsx
className="bg-kenya-dark text-white h-11 rounded-lg px-5 font-medium text-sm
           hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200"
```

**使用场景**：主要操作（开始蒸馏、创建任务、确认）

#### SecondaryButton
```jsx
className="bg-white text-kenya-dark border border-kenya-line h-11 rounded-lg px-5 font-medium text-sm
           hover:bg-kenya-dark/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200"
```

**使用场景**：次要操作（取消、返回、查看详情）

#### DangerButton
```jsx
className="text-red-600 hover:text-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200 text-sm font-medium"
```

**使用场景**：危险操作（删除任务）

**按钮尺寸**：
- 默认：`h-11 px-5`（44px 高度）
- 小号：`h-9 px-4`（36px 高度）

### 1.5 状态规范

#### LoadingState
```jsx
<div className="text-center py-20">
  <div className="animate-pulse text-4xl mb-4">⏳</div>
  <p className="text-kenya-dark/60 text-base">加载中...</p>
</div>
```

#### EmptyState
```jsx
<div className="text-center py-20">
  <div className="text-6xl mb-4 opacity-20">📄</div>
  <p className="text-kenya-dark/60 text-base mb-6">暂无数据</p>
  <SecondaryButton>操作按钮</SecondaryButton>
</div>
```

#### ErrorState
```jsx
<div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
  <div className="flex items-start gap-3">
    <div className="text-2xl">❌</div>
    <div className="flex-1">
      <h3 className="font-semibold text-red-800 mb-2 text-base">错误标题</h3>
      <p className="text-red-700 text-sm">错误信息</p>
    </div>
  </div>
</div>
```

---

## 二、组件库

### 2.1 布局组件

#### AppHeader
```jsx
// 全局导航栏
// 高度 64px，左侧"镜像"，右侧"首页"
<header className="h-16 bg-kenya-cream border-b border-kenya-line">
  <div className="max-w-[1120px] mx-auto px-8 h-full flex items-center justify-between">
    <div className="font-serif text-2xl text-kenya-dark">镜像</div>
    <Link to="/" className="text-sm text-kenya-dark hover:text-kenya-dark/70 transition-colors">
      首页
    </Link>
  </div>
</header>
```

#### PageContainer
```jsx
// 主内容容器：max-width 1120px，左右 padding 32px，顶部 padding 48px
<div className="max-w-[1120px] mx-auto px-8 pt-12">
  {children}
</div>
```

#### PageTitle
```jsx
// 页面标题组件
<div className="mb-8">
  <h1 className="text-4xl leading-[44px] font-semibold text-kenya-dark mb-2">
    {title}
  </h1>
  {subtitle && (
    <p className="text-sm text-kenya-dark/60 leading-5">{subtitle}</p>
  )}
</div>
```

### 2.2 交互组件

#### StatusBadge
```jsx
// 状态标签：处理中 / 已完成 / 失败 / 待处理
const statusConfig = {
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: '处理中' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: '已完成' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: '失败' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: '待处理' }
};

<span className={`px-3 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
  {config.label}
</span>
```

#### FilterTabs
```jsx
// 筛选 Tab：全部 / 处理中 / 已完成 / 失败
<div className="flex gap-2 border-b border-kenya-line">
  {tabs.map(tab => (
    <button 
      key={tab.value}
      onClick={() => onChange(tab.value)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active === tab.value 
          ? 'border-b-2 border-kenya-dark text-kenya-dark' 
          : 'text-kenya-dark/60 hover:text-kenya-dark'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

#### LayerTabs
```jsx
// 层级 Tab：第一层 / 第二层 / 第三层 / 第四层
<div className="flex gap-2">
  {[1, 2, 3, 4].map(layer => (
    <button 
      key={layer}
      onClick={() => onChange(layer)}
      className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
        active === layer 
          ? 'bg-kenya-dark text-white' 
          : 'bg-white/50 hover:bg-white/70 text-kenya-dark'
      }`}
    >
      第{layer}层
    </button>
  ))}
</div>
```

### 2.3 内容组件

#### TaskCard
```jsx
// 任务卡片：任务名 / 状态 / 更新时间 / 进度条 / 操作按钮
<div className="bg-white border border-kenya-line rounded-lg p-6 hover:shadow-sm transition-shadow">
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-kenya-dark mb-2">{task.name}</h3>
      <StatusBadge status={task.status} />
    </div>
    <div className="flex gap-2">
      <SecondaryButton size="sm" onClick={() => navigate(`/result/${task.id}`)}>
        查看结果
      </SecondaryButton>
      <DangerButton size="sm" onClick={() => handleDelete(task.id)}>
        删除
      </DangerButton>
    </div>
  </div>
  
  <div className="text-sm text-kenya-dark/60 mb-3">
    最后更新：{formatDate(task.updated_at)}
  </div>
  
  {task.status === 'processing' && (
    <div className="h-2 bg-kenya-line/20 rounded-full overflow-hidden">
      <div 
        className="h-full bg-kenya-dark transition-all duration-300" 
        style={{width: `${task.progress || 0}%`}} 
      />
    </div>
  )}
</div>
```

#### FormCard
```jsx
// 表单容器：max-width 800-900px，居中
<div className="max-w-[900px] mx-auto bg-white border border-kenya-line rounded-lg p-8">
  {children}
</div>
```

#### ResultCard
```jsx
// 结果展示卡片
<div className="bg-white border border-kenya-line rounded-lg p-8">
  {children}
</div>
```

---

## 三、页面规范

### 3.1 HomePage（首页）

**布局结构**：
```
AppHeader
├─ Hero 区（奶油色背景）
│  ├─ 标题："镜像"
│  ├─ 副标题："将你的思考方式蒸馏成可复用的认知操作系统"
│  └─ 主按钮："开始使用"
└─ 任务列表区
   ├─ 标题栏："任务列表" + "创建新任务"按钮
   ├─ FilterTabs：全部 / 处理中 / 已完成 / 失败
   ├─ TaskCard 列表
   └─ EmptyState（无任务时）
```

**关键元素**：
- Hero 区和任务列表区分离
- 筛选器使用 Tab 样式
- 任务卡片信息清晰（任务名、状态、时间、操作）
- "创建新任务"按钮在标题栏右侧

### 3.2 UploadPage（创建任务页）

**布局结构**：
```
AppHeader
├─ Hero 区
│  ├─ 返回按钮："← 返回首页"
│  ├─ 标题："创建蒸馏任务"
│  └─ 副标题："上传你的文本内容，我们将提取其中的思维模式"
└─ 表单区
   └─ FormCard (max-w-900px)
      ├─ 任务标题输入框
      ├─ 文本内容输入框（高度 280-360px）
      │  ├─ 标题左侧：label
      │  └─ 标题右侧：字数统计 + 上传文件按钮
      ├─ 验证提示（字数不足时显示）
      └─ 操作按钮（右对齐）
         ├─ 取消
         └─ 开始蒸馏（宽度 160-200px）
```

**关键元素**：
- 表单宽度 800-900px，居中
- "开始蒸馏"按钮不横跨整页
- 上传文件按钮在文本内容标题右侧
- 字数统计实时显示
- 验证错误明确提示

### 3.3 ProgressPage（进度页）

**布局结构**：
```
AppHeader
├─ Hero 区
│  ├─ 返回按钮："← 返回首页"
│  ├─ 标题：任务名称
│  └─ 副标题："蒸馏进行中"
└─ 进度区
   └─ ResultCard
      ├─ 步骤进度条（4 步）
      │  ├─ 第 1 步：上传完成
      │  ├─ 第 2 步：分析中
      │  ├─ 第 3 步：压缩中
      │  └─ 第 4 步：完成
      ├─ 当前步骤提示
      └─ 超时提示（ErrorState，10 分钟后显示）
```

**关键元素**：
- 步骤进度条（不是百分比进度条）
- 当前步骤高亮
- 超时后显示明确提示和操作按钮

### 3.4 ResultPage（结果页）

**布局结构**：
```
AppHeader
├─ Hero 区
│  ├─ 返回按钮："← 返回进度页"
│  ├─ 标题：任务名称
│  └─ 副标题："蒸馏结果"
└─ 结果区
   └─ ResultCard
      ├─ LayerTabs：第一层 / 第二层 / 第三层 / 第四层
      ├─ 内容类型切换 + 导出按钮
      │  ├─ 左侧：📄 蒸馏内容 / 📊 质量报告
      │  └─ 右侧：导出 JSON / Markdown / TXT
      ├─ 内容展示区
      │  ├─ 蒸馏内容（根据选中层级显示）
      │  ├─ 质量报告
      │  └─ EmptyState（无数据时）
      └─ 底部操作
         ├─ 返回进度页
         └─ 返回首页
```

**关键元素**：
- 四个层级 Tab 连续显示（不能缺失）
- "质量报告"是明确的按钮（带图标 📊）
- 导出按钮在顶部右侧（不在底部）
- 空状态有明确提示和操作入口
- 第三层无数据时显示 EmptyState，不显示空白

---

## 四、交互规范

### 4.1 按钮状态

**所有按钮必须实现**：
- **Hover**：`hover:opacity-90` 或 `hover:bg-xxx`
- **Active**：`active:scale-95`
- **Disabled**：`disabled:opacity-50 disabled:cursor-not-allowed`
- **过渡动画**：`transition-all duration-200`

### 4.2 表单验证

**实时验证**：
- 字数不足：显示红色提示"⚠️ 请输入至少 500 字"
- 标题为空：显示红色提示"⚠️ 请输入任务标题"
- 验证失败时，提交按钮 disabled

**验证提示位置**：
- 输入框下方，红色文字，14px

### 4.3 加载状态

**按钮 loading**：
- 文字改为"处理中..." / "导出中..." / "删除中..."
- 按钮 disabled
- 可选：添加 spinner 图标

**页面 loading**：
- 使用 LoadingState 组件
- 居中显示，带动画图标

### 4.4 空状态

**必须包含**：
- 大图标（60px，透明度 20%）
- 提示文字（16px，中性灰）
- 操作按钮（至少一个）

**常见场景**：
- 任务列表为空："暂无任务" + "创建新任务"按钮
- 第三层无数据："第三层暂无结果" + "查看第一层" / "返回首页"按钮
- 质量报告未生成："质量报告尚未生成"

---

## 五、响应式规范

**当前版本不做移动端适配**，只保证桌面端体验。

**最小支持宽度**：1280px

---

## 六、实施检查清单

### 布局一致性
- [ ] 所有页面使用 AppHeader
- [ ] 所有页面使用 PageContainer（max-w-1120px）
- [ ] 所有页面遵循 Hero 区 + 内容区结构
- [ ] 所有页面使用统一的 spacing（8/12/16/24/32/48/64）

### 字体一致性
- [ ] 页面主标题：36px / 44px / 600
- [ ] 区块标题：24px / 32px / 600
- [ ] 正文：16px / 24px / 400
- [ ] 辅助信息：14px / 20px / 400
- [ ] 按钮文字：14-15px / 500

### 按钮一致性
- [ ] 所有主要操作使用 PrimaryButton
- [ ] 所有次要操作使用 SecondaryButton
- [ ] 所有危险操作使用 DangerButton
- [ ] 所有按钮有 hover/active/disabled 状态

### 状态完整性
- [ ] 所有列表有 EmptyState
- [ ] 所有异步操作有 LoadingState
- [ ] 所有错误有 ErrorState
- [ ] 所有表单有验证提示

### 交互可预测性
- [ ] 所有可点击元素看起来像按钮或链接
- [ ] 所有 disabled 按钮有 cursor: not-allowed
- [ ] 所有 Tab 有明确的选中状态
- [ ] 所有操作有明确的反馈（toast / loading / 状态变化）

---

## 七、维护规则

### 添加新页面时
1. 必须使用 AppHeader
2. 必须使用 PageContainer
3. 必须遵循 Hero 区 + 内容区结构
4. 必须使用统一的字体层级
5. 必须使用统一的按钮组件

### 添加新组件时
1. 必须遵循 Kenya Hara 设计语言
2. 必须实现所有交互状态（hover/active/disabled）
3. 必须使用统一的 spacing 系统
4. 必须添加到本文档的组件库章节

### 修改现有组件时
1. 必须保持向后兼容（或同步更新所有使用处）
2. 必须更新本文档
3. 必须验证所有使用该组件的页面

---

**这个文档是活的，不是死的。发现规范不够用，立刻补充。**
