# Mirror UI/UX 结构重构计划

**目标**：统一布局、组件、状态，修复结构性问题，不新增业务功能。

---

## 一、全局设计系统

### 1.1 布局规范
```
- Header 高度：64px
- 主内容容器：max-width: 1120px，居中
- 容器 padding：左右 32px，顶部 48px
- Spacing 系统：8 / 12 / 16 / 24 / 32 / 48 / 64
```

### 1.2 字体层级
```
- 页面主标题：36px / 44px / 600
- 区块标题：24px / 32px / 600
- 正文：16px / 24px / 400
- 辅助信息：14px / 20px / 400（中性灰）
- 按钮文字：14px 或 15px / 500
```

### 1.3 按钮规范
```jsx
// PrimaryButton
className="bg-kenya-dark text-white h-11 rounded-lg px-5 font-medium text-sm
           hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200"

// SecondaryButton
className="bg-white text-kenya-dark border border-kenya-line h-11 rounded-lg px-5 font-medium text-sm
           hover:bg-kenya-dark/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200"

// DangerButton
className="text-red-600 hover:text-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
           transition-all duration-200"
```

### 1.4 状态规范
```jsx
// LoadingState
<div className="text-center py-20">
  <div className="animate-pulse text-4xl mb-4">⏳</div>
  <p className="text-kenya-dark/60">加载中...</p>
</div>

// EmptyState
<div className="text-center py-20">
  <div className="text-6xl mb-4 opacity-20">📄</div>
  <p className="text-kenya-dark/60 mb-6">暂无数据</p>
  <button className="kenya-button-secondary">操作按钮</button>
</div>

// ErrorState
<div className="bg-red-50 border-l-4 border-red-500 p-6">
  <div className="flex items-start gap-3">
    <div className="text-2xl">❌</div>
    <div>
      <h3 className="font-semibold text-red-800 mb-2">错误标题</h3>
      <p className="text-red-700">错误信息</p>
    </div>
  </div>
</div>
```

---

## 二、组件清单

### 2.1 必须实现的组件

#### AppHeader.jsx
```jsx
// 全局导航栏
// 高度 64px，左侧"镜像"，右侧"首页"
<header className="h-16 bg-kenya-cream border-b border-kenya-line">
  <div className="max-w-[1120px] mx-auto px-8 h-full flex items-center justify-between">
    <div className="font-serif text-2xl">镜像</div>
    <Link to="/" className="text-sm hover:text-kenya-dark/70">首页</Link>
  </div>
</header>
```

#### PageContainer.jsx
```jsx
// 主内容容器
<div className="max-w-[1120px] mx-auto px-8 pt-12">
  {children}
</div>
```

#### PageTitle.jsx
```jsx
// 页面标题
<h1 className="text-4xl leading-[44px] font-semibold mb-2">
  {title}
</h1>
{subtitle && <p className="text-sm text-kenya-dark/60">{subtitle}</p>}
```

#### PrimaryButton.jsx / SecondaryButton.jsx / DangerButton.jsx
```jsx
// 统一按钮组件，支持 loading / disabled 状态
```

#### StatusBadge.jsx
```jsx
// 状态标签：处理中 / 已完成 / 失败
<span className={`px-3 py-1 text-xs rounded-full ${colorClass}`}>
  {statusText}
</span>
```

#### FilterTabs.jsx
```jsx
// 筛选 Tab：全部 / 处理中 / 已完成 / 失败
<div className="flex gap-2 border-b border-kenya-line">
  {tabs.map(tab => (
    <button className={`px-4 py-2 text-sm ${active ? 'border-b-2 border-kenya-dark' : ''}`}>
      {tab.label}
    </button>
  ))}
</div>
```

#### LayerTabs.jsx
```jsx
// 层级 Tab：第一层 / 第二层 / 第三层 / 第四层
<div className="flex gap-2">
  {[1, 2, 3, 4].map(layer => (
    <button className={`px-6 py-3 rounded-lg ${active ? 'bg-kenya-dark text-white' : 'bg-white/50'}`}>
      第{layer}层
    </button>
  ))}
</div>
```

#### TaskCard.jsx
```jsx
// 任务卡片：任务名 / 状态 / 更新时间 / 进度条 / 操作按钮
<div className="bg-white border border-kenya-line rounded-lg p-6">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold mb-2">{task.name}</h3>
      <StatusBadge status={task.status} />
    </div>
    <div className="flex gap-2">
      <SecondaryButton>查看结果</SecondaryButton>
      <DangerButton>删除</DangerButton>
    </div>
  </div>
  <div className="text-sm text-kenya-dark/60">
    最后更新：{task.updated_at}
  </div>
  {task.status === 'processing' && (
    <div className="mt-4 h-2 bg-kenya-line/20 rounded-full overflow-hidden">
      <div className="h-full bg-kenya-dark" style={{width: `${task.progress}%`}} />
    </div>
  )}
</div>
```

#### FormCard.jsx
```jsx
// 表单容器：max-width 800-900px
<div className="max-w-[900px] mx-auto bg-white border border-kenya-line rounded-lg p-8">
  {children}
</div>
```

#### ResultCard.jsx
```jsx
// 结果展示卡片
<div className="bg-white border border-kenya-line rounded-lg p-6">
  {children}
</div>
```

#### EmptyState.jsx / LoadingState.jsx / ErrorState.jsx
```jsx
// 统一的状态组件
```

---

## 三、页面重构清单

### 3.1 HomePage.jsx

**当前问题**：
- Hero 区和任务列表混在一起
- 筛选器不像 Tab
- 任务卡片信息散乱
- "创建新任务"按钮位置不明确

**重构方案**：
```jsx
<div className="min-h-screen bg-kenya-brown">
  <AppHeader />
  
  {/* Hero 区 */}
  <div className="bg-kenya-cream py-16">
    <PageContainer>
      <PageTitle 
        title="镜像" 
        subtitle="将你的思考方式蒸馏成可复用的认知操作系统"
      />
      <PrimaryButton onClick={() => navigate('/upload')}>
        开始使用
      </PrimaryButton>
    </PageContainer>
  </div>
  
  {/* 任务列表区 */}
  <PageContainer>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">任务列表</h2>
      <PrimaryButton onClick={() => navigate('/upload')}>
        创建新任务
      </PrimaryButton>
    </div>
    
    <FilterTabs 
      tabs={['全部', '处理中', '已完成', '失败']}
      active={filter}
      onChange={setFilter}
    />
    
    <div className="space-y-4 mt-6">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
    
    {tasks.length === 0 && <EmptyState />}
  </PageContainer>
</div>
```

**修改文件**：
- `frontend/src/pages/HomePage.jsx`

**新增组件**：
- `frontend/src/components/AppHeader.jsx`
- `frontend/src/components/PageContainer.jsx`
- `frontend/src/components/PageTitle.jsx`
- `frontend/src/components/PrimaryButton.jsx`
- `frontend/src/components/SecondaryButton.jsx`
- `frontend/src/components/DangerButton.jsx`
- `frontend/src/components/StatusBadge.jsx`
- `frontend/src/components/FilterTabs.jsx`
- `frontend/src/components/TaskCard.jsx`
- `frontend/src/components/EmptyState.jsx`

---

### 3.2 UploadPage.jsx

**当前问题**：
- 表单横跨整页
- "开始蒸馏"按钮太宽
- 上传文件按钮位置不明确
- 字数统计和验证提示不够明显

**重构方案**：
```jsx
<div className="min-h-screen bg-kenya-brown">
  <AppHeader />
  
  {/* Hero 区 */}
  <div className="bg-kenya-cream py-12">
    <PageContainer>
      <button onClick={() => navigate('/')} className="text-sm text-kenya-dark/60 hover:text-kenya-dark mb-4">
        ← 返回首页
      </button>
      <PageTitle 
        title="创建蒸馏任务" 
        subtitle="上传你的文本内容，我们将提取其中的思维模式"
      />
    </PageContainer>
  </div>
  
  {/* 表单区 */}
  <PageContainer>
    <FormCard>
      {/* 任务标题 */}
      <div className="mb-6">
        <label className="block text-base font-medium mb-2">任务标题</label>
        <input 
          type="text"
          className="w-full h-11 px-4 border border-kenya-line rounded-lg"
          placeholder="给这次蒸馏起个名字"
        />
      </div>
      
      {/* 文本内容 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-base font-medium">文本内容</label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-kenya-dark/60">
              {wordCount} / 500 字
            </span>
            <SecondaryButton size="sm" onClick={handleFileUpload}>
              上传文件
            </SecondaryButton>
          </div>
        </div>
        <textarea 
          className="w-full h-80 p-4 border border-kenya-line rounded-lg resize-none"
          placeholder="粘贴或输入至少 500 字的文本内容..."
        />
        {wordCount < 500 && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ 请输入至少 500 字
          </p>
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex justify-end gap-4">
        <SecondaryButton onClick={() => navigate('/')}>
          取消
        </SecondaryButton>
        <PrimaryButton 
          onClick={handleSubmit}
          disabled={!isValid}
        >
          开始蒸馏
        </PrimaryButton>
      </div>
    </FormCard>
  </PageContainer>
</div>
```

**修改文件**：
- `frontend/src/pages/UploadPage.jsx`

**新增组件**：
- `frontend/src/components/FormCard.jsx`

---

### 3.3 ProgressPage.jsx

**当前问题**：
- 进度条样式不统一
- 超时提示不够明显

**重构方案**：
```jsx
<div className="min-h-screen bg-kenya-brown">
  <AppHeader />
  
  {/* Hero 区 */}
  <div className="bg-kenya-cream py-12">
    <PageContainer>
      <button onClick={() => navigate('/')} className="text-sm text-kenya-dark/60 hover:text-kenya-dark mb-4">
        ← 返回首页
      </button>
      <PageTitle 
        title={taskData.name} 
        subtitle="蒸馏进行中"
      />
    </PageContainer>
  </div>
  
  {/* 进度区 */}
  <PageContainer>
    <ResultCard>
      {/* 步骤进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= idx ? 'bg-kenya-dark text-white' : 'bg-kenya-line/20'
              }`}>
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-24 h-1 ${
                  currentStep > idx ? 'bg-kenya-dark' : 'bg-kenya-line/20'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-kenya-dark/60">
          第 {currentStep + 1} / {steps.length} 步：{steps[currentStep]}
        </p>
      </div>
      
      {/* 超时提示 */}
      {isTimeout && (
        <ErrorState 
          title="处理超时"
          message="任务处理时间超过 10 分钟，请刷新页面或返回首页"
          actions={[
            <SecondaryButton onClick={() => window.location.reload()}>刷新页面</SecondaryButton>,
            <SecondaryButton onClick={() => navigate('/')}>返回首页</SecondaryButton>
          ]}
        />
      )}
    </ResultCard>
  </PageContainer>
</div>
```

**修改文件**：
- `frontend/src/pages/ProgressPage.jsx`

**新增组件**：
- `frontend/src/components/ResultCard.jsx`
- `frontend/src/components/ErrorState.jsx`

---

### 3.4 ResultPage.jsx（重点）

**当前问题**：
- 层级 Tab 缺失第三层（显示空白）
- "质量报告"看起来像文字
- 导出按钮位置不明确
- 空状态不友好

**重构方案**：
```jsx
<div className="min-h-screen bg-kenya-brown">
  <AppHeader />
  
  {/* Hero 区 */}
  <div className="bg-kenya-cream py-12">
    <PageContainer>
      <button onClick={() => navigate(`/progress/${id}`)} className="text-sm text-kenya-dark/60 hover:text-kenya-dark mb-4">
        ← 返回进度页
      </button>
      <PageTitle 
        title={taskData.name} 
        subtitle="蒸馏结果"
      />
    </PageContainer>
  </div>
  
  {/* 结果区 */}
  <PageContainer>
    <ResultCard>
      {/* 层级切换 */}
      <LayerTabs 
        layers={[1, 2, 3, 4]}
        active={layer}
        onChange={setLayer}
      />
      
      {/* 内容类型切换 + 导出按钮 */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'content' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            📄 蒸馏内容
          </button>
          <button 
            onClick={() => setActiveTab('quality')}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'quality' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            📊 质量报告
          </button>
        </div>
        
        <div className="flex gap-3">
          <SecondaryButton size="sm" onClick={() => handleExport('json')}>
            导出 JSON
          </SecondaryButton>
          <SecondaryButton size="sm" onClick={() => handleExport('markdown')}>
            导出 Markdown
          </SecondaryButton>
          <SecondaryButton size="sm" onClick={() => handleExport('txt')}>
            导出 TXT
          </SecondaryButton>
        </div>
      </div>
      
      {/* 内容展示 */}
      {activeTab === 'content' && (
        <div>
          {layer === 1 && renderLayer1Content()}
          {layer === 2 && renderLayer2Content()}
          {layer === 3 && (
            taskData.layer3_result ? renderLayer3Content() : (
              <EmptyState 
                icon="📄"
                message="第三层暂无结果"
                actions={[
                  <SecondaryButton onClick={() => setLayer(1)}>查看第一层</SecondaryButton>,
                  <SecondaryButton onClick={() => navigate('/')}>返回首页</SecondaryButton>
                ]}
              />
            )
          )}
          {layer === 4 && renderLayer4Content()}
        </div>
      )}
      
      {activeTab === 'quality' && (
        taskData.quality_report ? renderQualityReport() : (
          <EmptyState 
            icon="📊"
            message="质量报告尚未生成"
          />
        )
      )}
      
      {/* 底部操作 */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-kenya-line">
        <SecondaryButton onClick={() => navigate(`/progress/${id}`)}>
          返回进度页
        </SecondaryButton>
        <SecondaryButton onClick={() => navigate('/')}>
          返回首页
        </SecondaryButton>
      </div>
    </ResultCard>
  </PageContainer>
</div>
```

**修改文件**：
- `frontend/src/pages/ResultPage.jsx`

**新增组件**：
- `frontend/src/components/LayerTabs.jsx`

---

## 四、实施步骤

### 阶段 1：创建基础组件（30 分钟）
1. 创建 `components/` 目录下的所有基础组件
2. 统一样式和交互状态
3. 验证组件独立可用

**文件清单**：
- `AppHeader.jsx`
- `PageContainer.jsx`
- `PageTitle.jsx`
- `PrimaryButton.jsx`
- `SecondaryButton.jsx`
- `DangerButton.jsx`
- `StatusBadge.jsx`
- `FilterTabs.jsx`
- `LayerTabs.jsx`
- `TaskCard.jsx`
- `FormCard.jsx`
- `ResultCard.jsx`
- `EmptyState.jsx`
- `LoadingState.jsx`
- `ErrorState.jsx`

### 阶段 2：重构 HomePage（20 分钟）
1. 替换 Header 为 AppHeader
2. 拆分 Hero 区和任务列表区
3. 使用 FilterTabs 和 TaskCard
4. 添加空状态

**验证标准**：
- ✅ Hero 区和任务列表区分离
- ✅ 筛选器是 Tab 样式
- ✅ 任务卡片信息清晰
- ✅ "创建新任务"按钮位置明确

### 阶段 3：重构 UploadPage（15 分钟）
1. 使用 FormCard 包裹表单
2. 调整表单宽度和按钮尺寸
3. 优化上传文件按钮位置
4. 增强验证提示

**验证标准**：
- ✅ 表单宽度 800-900px
- ✅ "开始蒸馏"按钮宽度 160-200px
- ✅ 上传文件按钮在标题右侧
- ✅ 验证提示明确

### 阶段 4：重构 ProgressPage（10 分钟）
1. 使用 ResultCard 包裹进度内容
2. 优化步骤进度条样式
3. 使用 ErrorState 显示超时提示

**验证标准**：
- ✅ 进度条样式统一
- ✅ 超时提示明显

### 阶段 5：重构 ResultPage（30 分钟）
1. 使用 LayerTabs 显示所有层级
2. 为"质量报告"添加图标和按钮样式
3. 统一导出按钮位置和尺寸
4. 为所有层级添加空状态

**验证标准**：
- ✅ 四个层级 Tab 连续显示
- ✅ 第三层切换后不显示空白
- ✅ "质量报告"是明确的按钮
- ✅ 导出按钮在顶部右侧
- ✅ 空状态有操作入口

### 阶段 6：全局验证（15 分钟）
1. 检查所有页面布局一致性
2. 检查所有按钮交互状态
3. 检查所有空状态、加载状态、错误状态
4. 重新构建前端

**验证标准**：
- ✅ 所有页面使用统一的 Header 和 PageContainer
- ✅ 所有按钮有 hover/active/disabled 状态
- ✅ 所有空状态有明确提示和操作入口
- ✅ 字号层级统一

---

## 五、遵循 AGENTS.md 规则

### Rule 1 — Think Before Coding
- ✅ 已明确问题：布局不统一、组件样式混乱、状态缺失
- ✅ 已定义成功标准：见各阶段验证标准

### Rule 2 — Simplicity First
- ✅ 不新增业务功能
- ✅ 只重构 UI 结构和组件

### Rule 3 — Surgical Changes
- ✅ 只修改页面组件和样式
- ✅ 不修改 API 调用逻辑
- ✅ 不修改数据结构

### Rule 8 — Read Before You Write
- ✅ 已读取所有页面代码
- ✅ 理解了现有布局和组件结构

### Rule 10 — Checkpoint After Every Step
- ✅ 每个阶段完成后验证
- ✅ 每个阶段完成后提交代码

### Rule 12 — Fail Loud
- ✅ 每个阶段明确验证标准
- ✅ 验证失败立即停止

---

## 六、风险评估

### 低风险
- 创建新组件（不影响现有功能）
- 调整布局和样式（不改变逻辑）

### 中风险
- 重构 ResultPage 的层级切换逻辑（可能影响数据渲染）
- 需要仔细测试第三层空状态

### 缓解措施
- 每个阶段完成后立即验证
- 保持现有的数据流和 API 调用逻辑不变
- 只修改 UI 层，不修改业务逻辑

---

## 七、不做的事情

❌ 不新增 PRD 没有的功能
❌ 不修改后端 API
❌ 不修改数据库 schema
❌ 不修改 API 调用逻辑
❌ 不修改数据处理逻辑
❌ 不做移动端适配
❌ 不添加复杂动画
❌ 不修改 Kenya Hara 设计语言（奶油色、棕色、直角）
