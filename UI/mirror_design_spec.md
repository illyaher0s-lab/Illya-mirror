# 镜像 · UI 设计规范文档
> 版本 v1.0 · 供实现 AI 使用
> 风格定义：Retro Sci-Fi · 纸质感 · 三页结构（首页 / 创建任务页 / 结果页）

---

## 一、Color Tokens

所有颜色必须通过 CSS 变量引用，禁止在组件中硬编码色值。

```css
:root {
  /* 背景 */
  --bg:          #D4CAB8;   /* 页面主背景，纸质暖灰 */
  --bg-card:     #CEC4B2;   /* 卡片、表单容器背景，比主背景深一阶 */
  --bg-input:    #C8BEA8;   /* 输入框背景，比卡片再深一阶 */
  --bg-dark:     #1a1a1a;   /* 深色区域：Nav ticker、表单 header、深色块 */

  /* 强调色 */
  --accent:      #E07A30;   /* 主强调色：CTA 按钮、选中态、橙色装饰 */
  --accent-blue: #4682C8;   /* 次强调色：处理中状态、推理型标签、蓝色装饰 */
  --accent-green: #3B6D11;  /* 第三强调色：叙述型标签 */

  /* 文字 */
  --text-primary:   #1a1a1a;  /* 主文字：标题、正文 */
  --text-secondary: #555555;  /* 次要文字：描述、说明 */
  --text-muted:     #888888;  /* 辅助文字：时间戳、计数、label */

  /* 边框 */
  --border:       #1a1a1a;   /* 主边框：外框、强调线 */
  --border-light: #B8AFA0;   /* 次级边框：卡片内部、分割线 */
}
```

### 颜色用途速查

| Token | 用途 |
|---|---|
| `--bg` | 所有页面背景 |
| `--bg-card` | 任务卡片、表单容器 |
| `--bg-input` | input、textarea |
| `--bg-dark` | ticker 条、表单 terminal header |
| `--accent` | 主 CTA 按钮、已完成状态条、判断型标签、数字强调 |
| `--accent-blue` | 处理中状态条、推理型标签、∞ 符号 |
| `--accent-green` | 叙述型标签 |
| `--text-primary` | 所有标题、卡片名称、输入内容 |
| `--text-secondary` | 描述文字、段落正文 |
| `--text-muted` | 时间戳、字符计数、eyebrow label |
| `--border` | 页面外框（2px）、Nav 下边框（1.5px）、任务区上边框 |
| `--border-light` | 卡片边框、表单内分割线、次级分组线 |

---

## 二、字体规范

```css
/* 引入方式 */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'Space Grotesk', sans-serif;
}
```

### 使用规则

| 场景 | 字体 | 字号 | 字重 | 其他 |
|---|---|---|---|---|
| Logo「MIRROR」 | `--font-mono` | 14px | 700 | letter-spacing: 0.08em |
| 面包屑当前页 | `--font-mono` | 12px | 400 | color: `--text-muted` |
| Eyebrow label | `--font-mono` | 9–10px | 400 | letter-spacing: 0.2em+ |
| Ticker 跑马灯 | `--font-mono` | 10px | 400 | letter-spacing: 0.18em |
| 页面主标题（中文） | `--font-sans` | 64–72px（首页）/ 36–40px（内页） | 700 | letter-spacing: -0.02em |
| 镂空标题「MIRROR」 | `--font-sans` | 同主标题 | 700 | color: transparent; -webkit-text-stroke: 1.5px var(--border) |
| 页面描述文字 | `--font-sans` | 13–14px | 400 | line-height: 1.7 |
| 卡片标题 | `--font-sans` | 14px | 600 | — |
| Tab 标签 | `--font-mono` | 10px | 400（未选中）/ 700（选中） | letter-spacing: 0.12em |
| 状态 badge | `--font-mono` | 9px | 400 | letter-spacing: 0.1em |
| 时间戳 | `--font-mono` | 9px | 400 | letter-spacing: 0.08em |
| 表单 label | `--font-mono` | 10px | 400 | letter-spacing: 0.14em |
| 输入框正文 | `--font-sans` | 13–14px | 400 | — |
| 按钮文字 | `--font-mono` | 10–12px | 400 | letter-spacing: 0.1–0.12em |
| 统计数字 | `--font-mono` | 26–28px | 700 | — |
| 段落序号 | `--font-mono` | 9px | 400 | color: `--border-light` |

**规则：中文内容标题用 `--font-sans`，所有系统性标签、编码、按钮用 `--font-mono`。两者混用产生风格张力，是这套设计语言的核心。**

---

## 三、纸质感实现方案（性能安全）

**禁止使用** `filter: blur()`、大尺寸 `box-shadow`、`backdrop-filter`，这些会触发 GPU 重绘导致卡顿。

```css
/* 纸质感：SVG noise + 细横纹，纯 CSS 实现，零性能损耗 */
.paper {
  background-color: var(--bg);
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 28px,
      rgba(0,0,0,0.018) 28px,
      rgba(0,0,0,0.018) 29px
    );
}
```

所有页面根容器加 `.paper` 类即可，子元素不需要重复添加。

---

## 四、组件规范

### 4.1 页面外框

```css
.page-frame {
  border: 2px solid var(--border);
  overflow: hidden;
}
```

三个页面统一用此外框，无圆角，体现印刷感。

---

### 4.2 Nav 导航栏

**首页 Nav（无面包屑）：**
```
左：MIRROR（font-mono 14px 700）
右：SYS_v2.4（font-mono 10px，color: --text-muted）
```

**子页面 Nav（有面包屑）：**
```
左：← MIRROR / 页面名称
    ↑           ↑
    可点击       不可点击，color: --text-muted
右：无内容（删除「首页」链接，返回唯一入口是左侧箭头）
```

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 28px;
  border-bottom: 1.5px solid var(--border);
  background: var(--bg);
}
.nav-breadcrumb-sep {
  color: var(--border-light);
  margin: 0 6px;
  font-family: var(--font-mono);
  font-size: 12px;
}
.nav-breadcrumb-cur {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  cursor: default;
  pointer-events: none;
}
```

---

### 4.3 Ticker 跑马灯

```css
.ticker {
  background: var(--bg-dark);
  color: var(--accent);
  padding: 6px 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  overflow: hidden;
  white-space: nowrap;
}
.ticker-inner {
  display: inline-flex;
  gap: 48px;
  padding: 0 28px;
  animation: ticker-scroll 18s linear infinite;
}
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**内容需要复制两份**（首尾拼接）才能无缝循环，分隔符用 `★`，颜色同 `--accent`。

首页使用动态版本。创建页 ticker 可关闭动画（静态展示），结果页不需要 ticker。

---

### 4.4 主 CTA 按钮（实色）

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11–12px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.12em;
  transition: filter 150ms ease;
}
.btn-primary:hover { filter: brightness(0.9); }
```

文字前缀统一用 `▶`，如「▶ 开始使用」「▶ 开始蒸馏」。

---

### 4.5 描边按钮（次要操作）

```css
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: background 150ms ease;
}
.btn-outline:hover { background: rgba(0,0,0,0.06); }
```

用于「查看结果 →」「↑ 上传文件」「＋ NEW_TASK」等次要操作。

---

### 4.6 文字按钮（最低优先级操作）

```css
.btn-text {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  letter-spacing: 0.08em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 120ms ease;
}
.btn-text:hover { color: var(--text-primary); }
```

用于「查看进度 →」（处理中任务）。

---

### 4.7 任务卡片

结构从左到右：`状态竖条 | 编号 | 卡片主体 | 操作按钮`

```css
.task-card {
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
  transition: border-color 120ms ease;
}
.task-card:hover { border-color: var(--border); }

/* 左侧状态竖条 */
.task-card-stripe        { width: 4px; flex-shrink: 0; }
.task-card-stripe.done   { background: var(--accent); }
.task-card-stripe.processing { background: var(--accent-blue); }
.task-card-stripe.failed { background: #c0392b; }

/* 卡片编号 */
.task-card-num {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--border-light);
  padding: 14px 10px;
  align-self: flex-start;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

/* 卡片主体 */
.task-card-body { flex: 1; padding: 14px 12px; }
.task-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
```

**状态 Badge 规范：**

```css
/* 基础 */
.task-status {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border: 1px solid;
}
/* 已完成 */
.task-status.done {
  color: #7a4a10;
  background: rgba(224,122,48,0.1);
  border-color: rgba(224,122,48,0.4);
}
/* 处理中 */
.task-status.processing {
  color: #1a3f6f;
  background: rgba(70,130,200,0.1);
  border-color: rgba(70,130,200,0.4);
}
/* 失败 */
.task-status.failed {
  color: #7a1a1a;
  background: rgba(192,57,43,0.1);
  border-color: rgba(192,57,43,0.4);
}
```

**COMPLETE 水印戳（已完成任务专用）：**

```css
.task-stamp {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%) rotate(-12deg);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(224,122,48,0.18);
  border: 1.5px solid rgba(224,122,48,0.18);
  padding: 3px 8px;
  pointer-events: none;
}
```

**进度条（处理中任务专用）：**

```css
.task-progress-bar {
  width: 80px;
  height: 2px;
  background: var(--border-light);
}
.task-progress-fill {
  height: 2px;
  background: var(--accent-blue);
  /* width 由 JS 动态设置，如 style="width:45%" */
}
```

---

### 4.8 Tab 筛选栏

```css
.task-tabs {
  display: flex;
  gap: 0;
  padding: 12px 28px 0;
  border-bottom: 1px solid var(--border-light);
}
.task-tab {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.12em;
  padding: 6px 16px 8px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 120ms ease;
}
.task-tab.active {
  color: var(--text-primary);
  font-weight: 700;
  border-bottom: 2px solid var(--border);
}
.task-tab:hover:not(.active) { color: var(--text-secondary); }
```

Tab 文字用全大写英文：`ALL` / `PROCESSING` / `DONE` / `FAILED`。

---

### 4.9 表单（创建任务页）

**表单容器：**
```css
.form-wrap {
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  margin: 0 28px 40px;
}
/* Terminal header 条 */
.form-header {
  background: var(--bg-dark);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-header-dot {
  width: 8px;
  height: 8px;
  border: 1px solid #444;
}
.form-header-dot.active {
  border-color: var(--accent);
  background: rgba(224,122,48,0.3);
}
.form-header-title {
  font-family: var(--font-mono);
  font-size: 9px;
  color: #555;
  letter-spacing: 0.18em;
  margin-left: 4px;
}
```

**输入框：**
```css
.form-input,
.form-textarea {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  border-top-color: var(--border);
  border-left-color: var(--border);   /* 模拟纸面压印的投影感 */
  padding: 11px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}
.form-input:focus,
.form-textarea:focus {
  border-color: var(--border);
  box-shadow: inset 2px 2px 0 rgba(0,0,0,0.08);
}
.form-textarea {
  resize: vertical;
  min-height: 160px;
  line-height: 1.7;
}
```

**字符计数**放在 input 右下角，`text-align: right`，字体 `--font-mono` 9px，颜色 `--text-muted`。

---

### 4.10 结果页工具栏组件

**层级选择器（L1/L2/L3/L4）：**
```css
.layer-chip {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: background 120ms, color 120ms;
}
.layer-chip.active {
  background: var(--bg-dark);
  color: #fff;
  border-color: var(--bg-dark);
}
.layer-chip:hover:not(.active) { background: rgba(0,0,0,0.05); }
```

**视图切换（Segmented Control）：**
```css
.view-seg {
  display: inline-flex;
  background: rgba(0,0,0,0.06);
  padding: 3px;
  gap: 2px;
}
.view-seg-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 5px 14px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  letter-spacing: 0.08em;
  transition: background 120ms, color 120ms;
}
.view-seg-btn.active {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 700;
  border: 1px solid var(--border-light);
}
```

**导出按钮：**
```css
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: border-color 120ms, color 120ms;
}
.btn-export:hover {
  border-color: var(--border);
  color: var(--text-primary);
}
```

文字格式：`↓ JSON` / `↓ MD` / `↓ TXT`。

---

### 4.11 段落卡片（结果页）

结构：`类型竖条 | 序号 | 内容体`

```css
.seg-item {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  overflow: hidden;
}
/* 左侧类型竖条 */
.seg-stripe         { width: 3px; flex-shrink: 0; }
.seg-stripe.judge   { background: var(--accent); }
.seg-stripe.infer   { background: var(--accent-blue); }
.seg-stripe.narrate { background: var(--accent-green); }

/* 序号 */
.seg-num {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--border-light);
  padding: 12px 12px 0 0;
  flex-shrink: 0;
  align-self: flex-start;
}

/* 内容 */
.seg-body { padding: 12px 16px; flex: 1; }

/* 类型标签 */
.seg-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  padding: 2px 8px;
  border: 1px solid;
  margin-bottom: 6px;
}
.seg-badge.judge   { color: #7a4a10; border-color: rgba(224,122,48,0.5);  background: rgba(224,122,48,0.08); }
.seg-badge.infer   { color: #1a3f6f; border-color: rgba(70,130,200,0.5);  background: rgba(70,130,200,0.08); }
.seg-badge.narrate { color: #2a4a10; border-color: rgba(59,109,17,0.5);   background: rgba(59,109,17,0.08); }

/* 段落正文 */
.seg-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}
```

**类型标签文字格式**：`JUDGE · 判断型` / `INFER · 推理型` / `NARRATE · 叙述型`（英文全大写 + 中文，中间用 ` · ` 分隔）。

如需扩展更多类型，从以下色值顺序分配：
- 提问型：`#854F0B`（琥珀）
- 反思型：`#533AB7`（紫）

---

## 五、间距规范

```
页面外边距（内容与边框之间）：28px 左右
Nav 高度：约 44px（padding 13px 上下）
Ticker 高度：约 30px
Hero padding-top：40px
Hero 到内容区间距：24–32px
卡片间距（gap）：10px
卡片内 padding：14px 上下 / 12px 左右（主体区）
表单字段间距（margin-bottom）：24px
表单容器距页面边缘：28px 左右
```

---

## 六、性能约束（实现 AI 必须遵守）

| 禁止 | 替代方案 |
|---|---|
| `filter: blur()` | 不需要模糊效果 |
| 大尺寸 `box-shadow`（超过 8px） | 用 `inset` 小阴影或无阴影 |
| `backdrop-filter` | 不使用 |
| CSS `transition` 超过 300ms | 统一 120–150ms |
| 动画属性超过 `transform` 和 `opacity` | 只用这两个做动画 |
| Ticker 用 JS 操控 DOM | 纯 CSS animation 实现 |

---

## 七、三页结构速查

| 页面 | 风格强度 | Ticker | 返回导航 | 主操作 |
|---|---|---|---|---|
| 首页 | ★★★ 最强 | 有，动态滚动 | 无 | ▶ 开始使用（--accent 实色） |
| 创建任务页 | ★★ 中等 | 有，静态 | ← MIRROR / 创建蒸馏任务 | ▶ 开始蒸馏（--accent 实色） |
| 结果页 | ★ 最克制 | 无 | ← MIRROR / 任务名称 | ↓ 导出按钮（描边） |

---

## 八、参考文件

- `mirror_full_playground.html`：三页完整视觉参考，可直接在浏览器打开查看
- 实现时以 playground 为视觉基准，以本文档为规则依据，两者冲突时以本文档为准
