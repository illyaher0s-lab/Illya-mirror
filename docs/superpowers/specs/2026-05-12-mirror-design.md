# Mirror - 认知数据提取引擎 设计文档

**设计日期**：2026-05-12  
**状态**：已批准

---

## 一、项目定位

**核心能力**：从非结构化内容中提取结构化认知数据，为垂直领域AI产品构建高质量知识库。

**岗位对标**：AI数据运营

**业务价值**：
- 教育AI：提取名师的教学方法和思维框架
- 客服AI：提取金牌客服的沟通方式和话术模式
- 内容AI：提取爆款博主的写作风格和表达逻辑
- 咨询AI：提取行业专家的分析框架和决策模型

**差异化**：
- ❌ 不是简单的关键词提取或文本摘要
- ✅ 是基于LLM的语义理解 + 证据溯源，提取深层认知结构

---

## 二、核心架构

### 2.1 输入侧（简化策略）

**用户提供纯文本文件**：
- 用户自己准备语料（可能几十万字）
- 不做任何采集（不爬虫、不接Coze、不转录音频）
- 前端提供文本上传功能（支持.txt文件或直接粘贴）

**设计理由**：
- 聚焦核心能力（蒸馏算法），不在数据采集上浪费时间
- 降低技术复杂度（不需要处理反爬、API对接、音频转录）
- 用户可以用任何工具准备语料（Coze、手动复制、爬虫脚本等）

### 2.2 蒸馏流程（两阶段设计）

```
阶段一：结构化压缩（Gemini 2.0 Flash）
├─ 输入：原始大文本（几十万字）
├─ 处理：去重、主题聚类、关键段落提取
└─ 输出：结构化中间文件（压缩后的精华，几万字）

阶段二：深度蒸馏（Claude Sonnet 4）
├─ 输入：阶段一的中间文件
├─ 处理：三层蒸馏（认知层/表达层/互动层）
└─ 输出：结构化认知档案JSON
```

**模型选择理由**：
- **Gemini 2.0 Flash**：
  - 上下文窗口：100万token（输入）+ 800万token（缓存）
  - 完全免费（每分钟15次请求，每天1500次）
  - 速度快，适合批量处理大文本
- **Claude Sonnet 4**：
  - 语义理解能力强，适合深度认知分析
  - 200K上下文窗口，处理压缩后的文本绰绰有余
  - 结构化输出稳定

### 2.3 三层蒸馏结构

| 层级 | 回答什么 | 蒸馏内容 | 举例 |
|------|---------|---------|------|
| **认知层** | TA 怎么想？ | 核心信念、思维模型、价值观、世界观 | "TA 相信'复杂问题需要简单解法'，80% 的内容都在做减法" |
| **表达层** | TA 怎么说？ | 语言风格、修辞手法、叙事结构、节奏感 | "TA 喜欢用类比，35% 的段落以'就像…'开头" |
| **互动层** | TA 怎么连接？ | 如何与受众建立关系、如何引导思考、如何处理反对意见 | "TA 从不直接反驳，而是先认可对方，再提出新视角" |

### 2.4 产出物

#### 产出物 1：结构化认知数据（JSON格式）

```json
{
  "name": "博主名/作者名",
  "cognitive_layer": {
    "core_beliefs": [
      {
        "belief": "复杂问题需要简单解法",
        "evidence": [
          "文章 3：我从不追求复杂的方案...",
          "文章 7：大道至简...",
          "文章 12：最有效的解决方案往往是最简单的..."
        ],
        "confidence": "高",
        "evidence_count": 3,
        "source_count": 3
      }
    ],
    "thinking_models": ["第一性原理", "系统思维"],
    "values": "实用主义、效率优先",
    "worldview": "世界是可以被理解和优化的"
  },
  "expression_layer": {
    "language_style": {
      "formality": "口语化",
      "density": "简洁",
      "tone": "理性中带温度"
    },
    "narrative_structure": {
      "opening_pattern": "从具体案例切入",
      "transition": "用'但是'制造转折",
      "ending": "总结 + 行动建议"
    },
    "rhetoric": ["类比", "反问"],
    "high_frequency_words": ["本质", "底层", "框架", "系统"]
  },
  "interaction_layer": {
    "relationship": "平等对话，不说教",
    "guidance": "提问引导思考，不直接给答案",
    "objection_handling": "先认可，再提出新视角"
  }
}
```

**用途**：
- 符合RAG知识库标准，可直接导入Dify/Coze等工具
- 作为AI Agent的System Prompt
- 作为内容生成的风格指南

#### 产出物 2：数据质量报告（Markdown格式）

```markdown
# 数据质量报告

## 整体评分：A-

## 1. 置信度分析
- 高置信度信念：3条（证据≥5条，来源≥3篇）
- 中置信度信念：2条（证据≥3条，来源≥2篇）
- 低置信度信念：0条

详细数据：
| 信念 | 证据数量 | 来源分布 | 置信度 |
|------|----------|----------|--------|
| 复杂问题需要简单解法 | 5 | 3篇文章 | 高 |
| 长期主义是关键 | 4 | 3篇文章 | 中 |

## 2. Bad Case 检测
- 发现1处潜在矛盾：
  - 信念A："要追求完美"（证据：文章3、文章7）
  - 信念B："完成比完美更重要"（证据：文章12）
  - 分析：需要更多内容来判断这个人在什么情况下追求完美，什么情况下追求完成
  - 建议：补充相关内容或人工确认

## 3. 数据覆盖度分析
| 层级 | 数据量 | 状态 | 说明 |
|------|--------|------|------|
| 认知层 | 核心信念5条，思维模型3个 | ✓ 充足 | 数据完整 |
| 表达层 | 语言风格、叙事结构、修辞手法均已提取 | ✓ 充足 | 数据完整 |
| 互动层 | 关系建立、引导方式已提取，反对意见处理缺失 | ✗ 不足 | 建议补充与读者互动的内容 |

## 4. 数据迭代建议
1. **补充互动层数据**：建议补充3-5篇与读者互动的内容（评论回复、问答、直播文字稿）
2. **解决信念矛盾**：针对"完美 vs 完成"的矛盾，建议补充相关内容或人工确认
3. **提升置信度**：中置信度信念可通过补充内容提升到高置信度
```

**用途**：
- 向用户展示数据质量，建立信任
- 指导用户补充内容，提升数据质量
- 证明数据运营的核心能力：质量控制

#### 产出物 3：简单可视化（前端展示）

**不做复杂的D3.js可视化**，只做基础展示：
- 认知档案卡片布局（shadcn/ui组件）
- 置信度分布柱状图（Recharts）
- 覆盖度雷达图（Recharts）
- 证据链折叠展示（点击展开原文引用）

**设计理由**：
- 聚焦核心价值（数据质量），不在炫酷可视化上浪费时间
- 简单图表足以展示关键指标
- 面试官更关注思路和数据，不是图表有多炫

---

## 三、技术栈

### 3.1 前端

- **框架**：Vite + React
- **路由**：React Router v6
- **UI库**：Tailwind CSS + shadcn/ui
- **图表**：Recharts（轻量级，React原生）
- **状态管理**：React Query（API调用 + 缓存）
- **部署**：编译成静态文件，Nginx serve

**选择理由**：
- 不需要SSR，Vite比Next.js更轻量、打包更快
- shadcn/ui组件开箱即用，不需要从零写UI
- Recharts比D3.js简单，满足基础图表需求

### 3.2 后端

- **框架**：FastAPI（Python）
- **数据库**：PostgreSQL
- **ORM**：SQLAlchemy 2.0
- **AI调用**：
  - `google-generativeai`（Gemini 2.0 Flash）
  - `anthropic`（Claude Sonnet 4）
- **异步处理**：后台任务用FastAPI的BackgroundTasks
- **日志**：structlog（结构化日志）

**选择理由**：
- FastAPI性能好，异步支持完善
- PostgreSQL的JSONB字段适合存储认知档案
- SQLAlchemy 2.0的异步ORM与FastAPI配合好

### 3.3 部署

- **服务器**：腾讯云香港轻量应用服务器（43.128.11.119）
- **后端**：systemd管理FastAPI进程（端口8001）
- **前端**：Nginx serve静态文件（端口80）
- **数据库**：PostgreSQL直接装在服务器上
- **反向代理**：Nginx代理后端API（/api/* → localhost:8001）

---

## 四、数据库设计

### 4.1 表结构

#### distillations（蒸馏任务表）

```sql
CREATE TABLE distillations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,              -- 被蒸馏者名字
  status VARCHAR(50) NOT NULL,             -- pending/processing/completed/failed
  quality_score VARCHAR(10),               -- A+/A/A-/B+/B/B-/C
  error_message TEXT,                      -- 失败原因
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### contents（原始内容表）

```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,                  -- 用户上传的原始文本
  compressed_text TEXT,                    -- 阶段一的压缩结果
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### cognitive_profiles（认知档案表）

```sql
CREATE TABLE cognitive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id) ON DELETE CASCADE,
  profile_json JSONB NOT NULL,             -- 完整的三层JSON
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### quality_reports（质量报告表）

```sql
CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL,              -- 结构化报告数据
  report_markdown TEXT,                    -- Markdown格式报告
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 索引设计

```sql
CREATE INDEX idx_distillations_status ON distillations(status);
CREATE INDEX idx_distillations_created_at ON distillations(created_at DESC);
CREATE INDEX idx_contents_distillation_id ON contents(distillation_id);
```

---

## 五、API设计

### 5.1 核心端点

```
POST   /api/distillations          创建蒸馏任务（上传文本）
GET    /api/distillations          列出所有任务（支持分页、筛选）
GET    /api/distillations/{id}     获取任务详情
DELETE /api/distillations/{id}     删除任务
GET    /api/distillations/{id}/profile      获取认知档案JSON
GET    /api/distillations/{id}/quality      获取质量报告
GET    /api/distillations/{id}/export       导出（JSON/YAML/Markdown）
```

### 5.2 请求/响应示例

#### POST /api/distillations

**请求**：
```json
{
  "name": "李笑来",
  "raw_text": "这里是几十万字的原始文本..."
}
```

**响应**：
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "李笑来",
  "status": "pending",
  "created_at": "2026-05-12T14:30:00Z"
}
```

#### GET /api/distillations/{id}

**响应**：
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "李笑来",
  "status": "completed",
  "quality_score": "A-",
  "created_at": "2026-05-12T14:30:00Z",
  "updated_at": "2026-05-12T14:35:00Z"
}
```

---

## 六、前端页面结构

### 6.1 路由设计

```
/                    首页（任务列表）
/upload              上传文本 + 创建任务
/distillation/:id    蒸馏进度页（实时状态）
/result/:id          结果展示页（三层结构 + 质量报告）
```

### 6.2 页面功能

#### 首页（任务列表）
- 显示所有蒸馏任务（卡片布局）
- 支持按状态筛选（全部/进行中/已完成/失败）
- 支持按时间排序
- 点击卡片进入结果页

#### 上传页
- 文本输入框（支持粘贴）
- 文件上传（支持.txt）
- 输入被蒸馏者名字
- 提交后跳转到进度页

#### 进度页
- 显示当前状态（pending/processing/completed/failed）
- 实时进度条（阶段一 → 阶段二 → 质量评估）
- 完成后自动跳转到结果页

#### 结果页
- **认知层卡片**：核心信念（可展开证据链）、思维模型、价值观、世界观
- **表达层卡片**：语言风格、叙事结构、修辞手法、高频词
- **互动层卡片**：关系建立、引导方式、反对意见处理
- **质量报告卡片**：整体评分、置信度分布图、Bad case提示、覆盖度雷达图
- **导出按钮**：下载JSON/YAML/Markdown

---

## 七、开发计划

### Phase 1：后端核心（2天）

**Day 1**：
- FastAPI项目初始化（项目结构、配置管理）
- PostgreSQL设置（Docker或直接安装）
- 数据库表结构 + SQLAlchemy模型
- 基础API端点（CRUD）

**Day 2**：
- Gemini压缩Prompt设计 + 测试
- Claude三层蒸馏Prompt设计 + 测试
- 蒸馏流程串联（阶段一 → 阶段二）
- 后台任务处理（BackgroundTasks）

### Phase 2：质量评估模块（1天）

- 置信度计算逻辑（规则引擎）
- Bad case检测Prompt + 测试
- 覆盖度分析逻辑
- 质量报告生成（JSON + Markdown）

### Phase 3：后端API完善（0.5天）

- 错误处理 + 统一响应格式
- 日志记录（structlog）
- API文档（FastAPI自动生成）

### Phase 4：前端界面（1.5天）

**Day 1**：
- Vite + React项目初始化
- React Router配置
- shadcn/ui组件集成
- 4个页面基础布局

**Day 2（半天）**：
- API调用（React Query）
- 基础图表（Recharts）
- 响应式布局优化

### Phase 5：部署（0.5天）

- 云服务器环境配置（PostgreSQL + Nginx）
- 后端部署（systemd服务）
- 前端build + Nginx配置
- 反向代理设置

### Phase 6：测试优化（1.5天）

- 真实案例测试（用户提供语料）
- Prompt迭代优化
- Bug修复 + 性能优化
- 文档编写

**总计：7天**

---

## 八、技术亮点

### 8.1 两阶段蒸馏架构
- 利用Gemini的超大上下文和免费额度处理大文本
- 利用Claude的语义理解能力做深度分析
- 成本优化：Gemini免费 + Claude只处理压缩后的文本

### 8.2 数据质量保障体系
- 置信度计算：量化数据可靠性
- Bad case检测：自动发现数据矛盾
- 覆盖度分析：确保数据完整性
- 迭代建议：指导数据优化方向

### 8.3 证据溯源机制
- 每条核心信念都有原文引用
- 可追溯到具体的文章段落
- 支持人工验证和修正

### 8.4 通用性设计
- 不局限于自媒体博主
- 可以蒸馏任何有内容输出的人（作家、企业家、播客主等）
- 风格模板可导出到其他工具（Dify、Coze等）

---

## 九、成功标准

### 9.1 技术指标
- [ ] 蒸馏准确率 > 80%（人工评估）
- [ ] 单次蒸馏时间 < 5 分钟
- [ ] 数据质量评估准确率 > 85%（bad case检测、置信度计算）
- [ ] API响应时间 < 500ms（除蒸馏任务外）

### 9.2 产品指标
- [ ] 完成 5 个真实案例蒸馏（宠物博主 5 种风格）
- [ ] 风格模板可直接导入热浪项目
- [ ] 认知档案页面加载时间 < 2 秒
- [ ] 数据质量报告生成时间 < 10 秒

### 9.3 展示指标（面试用）
- [ ] 有完整的 Demo 视频（3 分钟）
- [ ] 有详细的技术文档
- [ ] 有对比分析案例（展示差异化）
- [ ] 有数据质量报告案例（展示数据运营能力）

---

## 十、风险与应对

### 10.1 技术风险

**风险1：Gemini压缩效果不理想**
- 应对：设计多个压缩策略（简单去重、主题聚类、预提取），A/B测试选最优
- 备选方案：直接用Claude处理（成本增加但质量有保障）

**风险2：Claude蒸馏结果不稳定**
- 应对：Prompt加强结构化约束，使用Few-shot Learning
- 备选方案：多次调用取共识结果

**风险3：数据库性能问题**
- 应对：JSONB字段建立GIN索引，查询优化
- 备选方案：热数据缓存（Redis）

### 10.2 产品风险

**风险1：用户提供的语料质量不够**
- 应对：前端提示最低字数要求（建议10万字以上）
- 备选方案：提供语料质量预检功能

**风险2：蒸馏结果不符合用户预期**
- 应对：提供人工修正入口，支持重新蒸馏
- 备选方案：提供"蒸馏参数调整"功能（如置信度阈值）

---

## 十一、后续迭代方向

### 11.1 功能增强
- 支持多语言（英文、日文等）
- 支持少样本蒸馏（5篇内容就能初步蒸馏）
- 支持对比分析（蒸馏多个博主后横向对比）
- 支持持续学习（用户反馈 → 优化蒸馏算法）

### 11.2 产品化
- 用户系统（注册/登录/权限管理）
- 团队协作（多人共享蒸馏结果）
- API开放（让其他工具调用Mirror的蒸馏能力）
- SaaS化（按蒸馏次数收费）

### 11.3 与其他项目联动
- **镜像 → 热浪**：蒸馏5种博主风格 → 导入热浪项目的`blogger_styles.json`
- **热浪 → 镜像**：热浪生成的内容 → 回测数据 → 优化镜像的蒸馏算法

---

## 十二、面试话术

> "我做了三个项目，但它们不是独立的，而是展示我在AI运营三个方向上的能力：
> 
> **对位**：展示我能从0到1交付AI产品（基于业务目标的AI产品运营）
> 
> **镜像**：展示我的数据运营能力——如何从非结构化内容中提取结构化认知数据，这是垂直领域知识库构建的核心能力。具体来说，我做了三件事：
> 1. 定义数据标准（三层蒸馏结构）
> 2. 搭建数据生产流程（两阶段蒸馏：Gemini压缩 + Claude深度分析）
> 3. 建立质量评估体系（置信度计算、Bad case检测、数据迭代）
> 
> **热浪**：展示我能把AI能力落地到具体业务场景（内容生成工作流）
> 
> 这三个项目对应AI运营岗位的三个核心方向：产品交付、数据运营、业务落地。"

---

**设计完成时间**：2026-05-12  
**下一步**：进入实现阶段（writing-plans skill）
