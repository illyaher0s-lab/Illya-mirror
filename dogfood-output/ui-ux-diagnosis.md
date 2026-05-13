# Mirror 项目 UI/UX 诊断报告

**诊断时间**: 2026-05-13  
**诊断范围**: HomePage, ProgressPage, ResultPage, UploadPage  
**诊断依据**: ui-ux-pro-max skill (99 条 UX 规则 + 10 条 App UI 规则)

---

## 🚨 CRITICAL 级别问题（必须修复）

### 1. 缺少关键交互反馈 (Rule: `loading-buttons`, `submit-feedback`)

**问题描述**:
- **HomePage**: 删除按钮没有 loading 状态，点击后用户不知道是否在处理
- **ProgressPage**: "返回首页"/"查看完整结果" 按钮点击后没有任何反馈
- **ResultPage**: 导出按钮虽然有 `exporting` 状态，但只在内部使用，按钮文本没有变化
- **UploadPage**: "开始蒸馏" 按钮有 loading 文本，但没有视觉 spinner

**影响**: 用户不确定操作是否生效，可能重复点击导致重复请求

**修复方案**:
```jsx
// 删除按钮应该显示 loading 状态
<button
  onClick={() => handleDelete(task.id)}
  disabled={deletingId === task.id}
  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
>
  {deletingId === task.id ? '删除中...' : '删除'}
</button>

// 导出按钮应该显示 spinner
<button disabled={exporting}>
  {exporting ? (
    <span className="flex items-center gap-2">
      <span className="animate-spin">⏳</span>
      导出中...
    </span>
  ) : '导出'}
</button>
```

---

### 2. 缺少错误恢复路径 (Rule: `error-recovery`, `error-clarity`)

**问题描述**:
- **ProgressPage**: 当任务失败时，只显示状态，没有"重试"或"查看错误详情"按钮
- **ResultPage**: 当 `error` 状态为真时，只显示"获取任务数据失败"，没有重试按钮
- **HomePage**: API 错误只在 console 打印，用户看不到具体错误原因

**影响**: 用户遇到错误后无法自救，只能刷新页面或联系支持

**修复方案**:
```jsx
// ProgressPage 失败状态应该提供重试
{taskData.status === 'failed' && (
  <div className="kenya-card bg-red-50 border-l-4 border-red-500">
    <p className="text-red-800 mb-4">任务处理失败</p>
    {taskData.error_message && (
      <p className="text-sm text-red-700 mb-4">{taskData.error_message}</p>
    )}
    <button 
      onClick={() => handleRetry(id)}
      className="kenya-button"
    >
      重新开始
    </button>
  </div>
)}

// ResultPage 错误状态应该提供重试
{error && (
  <div className="kenya-card text-center py-20">
    <div className="text-4xl mb-4">❌</div>
    <p className="text-kenya-dark/60 mb-6">{error}</p>
    <button onClick={() => window.location.reload()} className="kenya-button">
      重新加载
    </button>
  </div>
)}
```

---

### 3. 缺少确认对话框 (Rule: `confirmation-dialogs`, `destructive-emphasis`)

**问题描述**:
- **HomePage**: 删除按钮使用原生 `window.confirm()`，体验不一致
- **ResultPage**: 没有看到任何破坏性操作的确认（如果有删除功能）

**影响**: 原生对话框打断用户体验，且无法自定义样式

**修复方案**:
```jsx
// 使用自定义确认对话框组件
const [deleteConfirm, setDeleteConfirm] = useState(null);

{deleteConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="kenya-card max-w-md">
      <h3 className="text-xl font-medium mb-4">确认删除</h3>
      <p className="text-kenya-dark/70 mb-6">
        确定要删除任务"{deleteConfirm.name}"吗？此操作无法撤销。
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => setDeleteConfirm(null)}
          className="flex-1 px-4 py-2 border border-kenya-line"
        >
          取消
        </button>
        <button 
          onClick={() => confirmDelete(deleteConfirm.id)}
          className="flex-1 px-4 py-2 bg-red-600 text-white"
        >
          删除
        </button>
      </div>
    </div>
  </div>
)}
```

---

### 4. 缺少空状态操作引导 (Rule: `empty-states`)

**问题描述**:
- **ProgressPage**: 当 `layer1_result` / `layer2_result` / `layer3_result` 为空时，只显示卡片，没有"等待中"或"处理中"的明确提示
- **ResultPage**: 当某一层数据为空时，只显示"暂无数据"，没有解释为什么没有数据

**影响**: 用户不知道是数据还没生成，还是出错了

**修复方案**:
```jsx
// 在每一层卡片中明确显示状态
{!taskData.layer1_result && taskData.current_layer !== 'layer1_running' && (
  <div className="mt-4 pt-4 border-t border-kenya-line/30">
    <p className="text-sm text-kenya-dark/60">
      {taskData.current_layer === 'pending' ? '等待开始...' : '数据尚未生成'}
    </p>
  </div>
)}
```

---

## ⚠️ HIGH 级别问题（强烈建议修复）

### 5. 缺少键盘导航支持 (Rule: `keyboard-nav`, `focus-states`)

**问题描述**:
- 所有页面的交互元素（按钮、链接）都没有明确的 focus 样式
- 没有 `tabIndex` 管理，键盘用户无法高效导航

**影响**: 键盘用户和屏幕阅读器用户无法正常使用

**修复方案**:
```css
/* 在 index.css 中添加全局 focus 样式 */
.kenya-button:focus-visible,
.kenya-input:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid #2B2B2B;
  outline-offset: 2px;
}
```

---

### 6. 进度条缺少语义化标记 (Rule: `aria-labels`, `screen-reader`)

**问题描述**:
- **HomePage** 和 **ProgressPage** 的进度条只是视觉元素，没有 `role="progressbar"` 和 `aria-valuenow`
- 屏幕阅读器用户无法感知进度

**影响**: 无障碍访问不合规

**修复方案**:
```jsx
<div 
  role="progressbar" 
  aria-valuenow={percentage} 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label={`任务进度 ${percentage}%`}
  className="h-2 bg-kenya-line/20 overflow-hidden"
>
  <div 
    className="h-full bg-kenya-dark transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

### 7. 缺少 Toast 自动消失时间控制 (Rule: `toast-dismiss`)

**问题描述**:
- 使用了 `react-hot-toast`，但没有看到全局配置
- 不确定 toast 是否会自动消失，以及消失时间是否合理（推荐 3-5 秒）

**影响**: Toast 可能停留过久或过短

**修复方案**:
```jsx
// 在 main.jsx 或 App.jsx 中配置
import { Toaster } from 'react-hot-toast';

<Toaster 
  position="top-center"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#2B2B2B',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#10B981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 5000,
      iconTheme: {
        primary: '#EF4444',
        secondary: '#fff',
      },
    },
  }}
/>
```

---

### 8. 轮询逻辑缺少用户控制 (Rule: `loading-states`, `user-control`)

**问题描述**:
- **ProgressPage** 每 3 秒自动轮询，但用户无法暂停或手动刷新
- 如果用户切换到其他标签页，轮询仍在继续，浪费资源

**影响**: 不必要的网络请求，且用户无法控制

**修复方案**:
```jsx
// 添加手动刷新按钮
<button 
  onClick={() => fetchTaskStatus()}
  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5"
>
  手动刷新
</button>

// 使用 Page Visibility API 暂停后台轮询
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setPolling(false);
    } else {
      setPolling(true);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

### 9. 缺少"返回顶部"按钮 (Rule: `navigation-patterns`, `scroll-behavior`)

**问题描述**:
- **ResultPage** 内容很长（785 行），但没有"返回顶部"按钮
- 用户滚动到底部后需要手动滚回去

**影响**: 长页面导航体验差

**修复方案**:
```jsx
const [showBackToTop, setShowBackToTop] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 500);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

{showBackToTop && (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-8 right-8 w-12 h-12 bg-kenya-dark text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-50"
    aria-label="返回顶部"
  >
    ↑
  </button>
)}
```

---

### 10. 文件上传缺少拖拽支持 (Rule: `input-helper-text`, `progressive-disclosure`)

**问题描述**:
- **UploadPage** 只支持点击上传，不支持拖拽文件
- 现代 Web 应用标配功能缺失

**影响**: 用户体验不够流畅

**修复方案**:
```jsx
const [isDragging, setIsDragging] = useState(false);

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const file = e.dataTransfer.files[0];
  if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
    handleFileUpload({ target: { files: [file] } });
  } else {
    toast.error('只支持 .txt 和 .md 文件');
  }
};

<div
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
  onDrop={handleDrop}
  className={`kenya-card border-2 border-dashed transition-colors ${
    isDragging ? 'border-kenya-dark bg-kenya-dark/5' : 'border-kenya-line/30'
  }`}
>
  <p className="text-center text-kenya-dark/60">
    拖拽文件到此处，或点击上传按钮
  </p>
</div>
```

---

## 📋 MEDIUM 级别问题（建议优化）

### 11. 缺少骨架屏 (Rule: `loading-states`, `progressive-loading`)

**问题描述**:
- **HomePage** 和 **ProgressPage** 的 loading 状态只显示一个 emoji 和文字
- 没有骨架屏（skeleton screen）预示内容结构

**影响**: 加载体验不够流畅

**修复方案**:
```jsx
// HomePage loading 状态
{loading && (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="kenya-card animate-pulse">
        <div className="h-6 bg-kenya-line/20 w-1/3 mb-4"></div>
        <div className="h-4 bg-kenya-line/20 w-2/3 mb-2"></div>
        <div className="h-4 bg-kenya-line/20 w-1/2"></div>
      </div>
    ))}
  </div>
)}
```

---

### 12. 时间显示不一致 (Rule: `number-formatting`)

**问题描述**:
- **HomePage** 使用相对时间（"3 分钟前"）
- **ProgressPage** 使用绝对时间（"2026-05-13 20:47"）
- 同一个应用中时间格式不统一

**影响**: 用户认知负担增加

**修复方案**:
统一使用相对时间 + hover 显示绝对时间：
```jsx
<span title={formatAbsoluteDate(task.created_at)}>
  {formatRelativeDate(task.created_at)}
</span>
```

---

### 13. 缺少"复制到剪贴板"功能 (Rule: `user-control`)

**问题描述**:
- **ResultPage** 显示大量 JSON 数据，但没有"复制"按钮
- 用户需要手动选择文本复制

**影响**: 开发者和高级用户体验不佳

**修复方案**:
```jsx
const handleCopy = (text) => {
  navigator.clipboard.writeText(text);
  toast.success('已复制到剪贴板');
};

<button 
  onClick={() => handleCopy(JSON.stringify(data, null, 2))}
  className="text-sm text-kenya-dark hover:underline"
>
  复制 JSON
</button>
```

---

### 14. 筛选器缺少"清除筛选"按钮 (Rule: `filter-reset`)

**问题描述**:
- **HomePage** 的筛选器选中后，用户需要点击"全部"才能清除
- 没有明确的"清除筛选"或"重置"按钮

**影响**: 用户可能不知道如何回到初始状态

**修复方案**:
```jsx
{filter !== 'all' && (
  <button
    onClick={() => setFilter('all')}
    className="px-4 py-2 text-sm text-kenya-dark/60 hover:text-kenya-dark"
  >
    清除筛选 ×
  </button>
)}
```

---

### 15. 缺少"最近查看"或"收藏"功能 (Rule: `user-control`, `personalization`)

**问题描述**:
- **HomePage** 只显示所有任务，没有"最近查看"或"收藏"功能
- 用户无法快速找到常用任务

**影响**: 任务多了之后查找困难

**修复方案**:
```jsx
// 添加"最近查看"标签
<button
  onClick={() => setFilter('recent')}
  className={`px-4 py-2 text-sm transition-colors ${
    filter === 'recent' ? 'bg-kenya-dark text-white' : 'bg-white/50'
  }`}
>
  最近查看
</button>

// 在任务卡片中添加"收藏"按钮
<button
  onClick={() => toggleFavorite(task.id)}
  className="text-xl"
  aria-label={task.is_favorite ? '取消收藏' : '收藏'}
>
  {task.is_favorite ? '★' : '☆'}
</button>
```

---

## 🎨 样式和视觉问题

### 16. 按钮 hover 效果过于夸张 (Rule: `scale-feedback`)

**问题描述**:
- `.kenya-button:hover { transform: scale(1.05); }` 放大 5% 过于明显
- 推荐范围是 0.95-1.05，但 1.05 已经是上限

**影响**: 视觉上不够精致

**修复方案**:
```css
.kenya-button:hover {
  transform: scale(1.02); /* 改为 2% */
}
```

---

### 17. 缺少暗色模式支持 (Rule: `dark-mode-pairing`)

**问题描述**:
- 整个应用只有浅色模式
- 现代 Web 应用标配功能缺失

**影响**: 夜间使用体验差

**修复方案**:
```css
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e5e5e5;
  }
  
  .kenya-card {
    background: rgba(40, 40, 40, 0.85);
  }
  
  .kenya-button {
    background: #e5e5e5;
    color: #1a1a1a;
  }
}
```

---

### 18. Emoji 作为图标 (Rule: `no-emoji-icons`)

**问题描述**:
- **HomePage**: 使用 📝 作为空状态图标
- **ProgressPage**: 使用 📝 作为压缩阶段图标
- **ResultPage**: 使用 ❌ 作为错误图标
- Emoji 在不同平台渲染不一致，且无法控制颜色

**影响**: 视觉不一致，且无法适配暗色模式

**修复方案**:
```jsx
// 使用 SVG 图标库（如 Heroicons 或 Lucide）
import { DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/outline';

<DocumentTextIcon className="w-12 h-12 text-kenya-dark/20" />
<XCircleIcon className="w-12 h-12 text-red-500" />
```

---

## 📊 总结

### 问题分布
- **CRITICAL**: 4 个（必须修复）
- **HIGH**: 6 个（强烈建议修复）
- **MEDIUM**: 5 个（建议优化）
- **样式问题**: 3 个

### 优先级修复顺序
1. **立即修复**: 问题 1, 2, 3（交互反馈 + 错误恢复 + 确认对话框）
2. **本周修复**: 问题 5, 6, 7, 8（无障碍 + Toast + 轮询控制）
3. **下周优化**: 问题 9-15（返回顶部 + 拖拽上传 + 骨架屏等）
4. **长期优化**: 问题 16-18（样式精修 + 暗色模式 + 图标替换）

### 核心问题
**最大的问题是"缺少交互反馈"**：
- 按钮点击后没有 loading 状态
- 错误发生后没有恢复路径
- 长时间操作没有进度提示

这些问题让用户感觉"不知道发生了什么"，是交互体验糟糕的根本原因。

---

## 🛠️ 快速修复清单（Copy-Paste Ready）

### 1. 全局 Focus 样式（添加到 index.css）
```css
@layer components {
  *:focus-visible {
    outline: 2px solid #2B2B2B;
    outline-offset: 2px;
  }
}
```

### 2. Toast 全局配置（添加到 App.jsx）
```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: '#2B2B2B', color: '#fff' },
        }}
      />
      {/* 其他内容 */}
    </>
  );
}
```

### 3. 进度条语义化（替换所有进度条）
```jsx
<div 
  role="progressbar" 
  aria-valuenow={percentage} 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label={`任务进度 ${percentage}%`}
  className="h-2 bg-kenya-line/20 overflow-hidden"
>
  <div 
    className="h-full bg-kenya-dark transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

### 4. 按钮 Loading 状态模板
```jsx
<button 
  onClick={handleAction}
  disabled={loading}
  className="kenya-button disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <span className="animate-spin">⏳</span>
      处理中...
    </span>
  ) : '操作'}
</button>
```

---

**诊断完成。建议先修复 CRITICAL 级别的 4 个问题，这些是用户最直接感受到的交互缺陷。**
