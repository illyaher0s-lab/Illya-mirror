# Mirror - 认知数据提取引擎

**slogan**：「从内容到知识库：让AI学会专家的思维方式」

---

## 项目定位

**核心能力**：从非结构化内容中提取结构化认知数据，为垂直领域AI产品构建高质量知识库。

**岗位对标**：AI数据运营（AI运营三大方向之一）

**业务价值**：
- 教育AI：提取名师的教学方法和思维框架
- 客服AI：提取金牌客服的沟通方式和话术模式
- 内容AI：提取爆款博主的写作风格和表达逻辑
- 咨询AI：提取行业专家的分析框架和决策模型

**差异化**：
- ❌ 不是简单的关键词提取或文本摘要
- ✅ 是基于LLM的语义理解 + 证据溯源，提取深层认知结构

**通用性**：
- 播客主（音频转文字 → 蒸馏）
- 书籍作者（章节内容 → 蒸馏）
- 视频博主（字幕 → 蒸馏）
- 公众号作者（文章 → 蒸馏）
- 企业家（演讲稿 → 蒸馏）

---

## 核心三层蒸馏结构

| 层级 | 回答什么 | 蒸馏内容 | 举例 |
|------|---------|---------|------|
| **认知层** | TA 怎么想？ | 核心信念、思维模型、价值观、世界观 | "TA 相信'复杂问题需要简单解法'，80% 的内容都在做减法" |
| **表达层** | TA 怎么说？ | 语言风格、修辞手法、叙事结构、节奏感 | "TA 喜欢用类比，35% 的段落以'就像…'开头" |
| **互动层** | TA 怎么连接？ | 如何与受众建立关系、如何引导思考、如何处理反对意见 | "TA 从不直接反驳，而是先认可对方，再提出新视角" |

---

## 产出物

### 产出物 1：结构化认知数据（核心产出）
**格式**：JSON

**内容**：
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

---

### 产出物 2：数据质量报告（证明数据可靠）
**格式**：Markdown + JSON

**内容**：
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
- 证明你懂数据运营的核心：质量控制

---

### 产出物 3：认知档案可视化（辅助产出）
**格式**：交互式 Web 页面

**内容**：
1. **一眼看清**（摘要卡片）
   - 核心标签（3-5 个关键词）
   - 一句话总结
   - 思维模型图谱（可视化）

2. **认知层：TA 怎么想**
   - 核心信念（3-5 条，带证据链，可点击查看原文）
   - 思维模型识别（第一性原理、系统思维、逆向思维等）
   - 价值观立场
   - 世界观框架

3. **表达层：TA 怎么说**
   - 语言风格（正式/口语、简洁/详尽、理性/感性）
   - 叙事结构（开头模板、转折方式、结尾模式）
   - 修辞手法（类比、反问、排比、对比）
   - 节奏感（句子长度分布、段落结构）
   - 高频词汇（语义聚类，不是简单频次）

4. **互动层：TA 怎么连接**
   - 如何与受众建立关系（平等/权威、亲密/疏离）
   - 如何引导思考（提问、留白、反转）
   - 如何处理反对意见（认可、重构、升维）

5. **典型案例分析**（3 个）
   - 选取最具代表性的 3 篇内容
   - 逐段拆解：认知层 + 表达层 + 互动层

6. **数据质量指标**（新增）
   - 整体评分
   - 置信度分布
   - Bad case 提示
   - 数据覆盖度

**用途**：
- 方便人工验证数据质量
- 辅助用户理解蒸馏结果
- 作为交付物展示给客户

---

## 技术架构

### 前端
- **框架**：Vite 6.0 + React 19
- **UI 库**：Tailwind CSS v4
- **路由**：React Router v6
- **设计风格**：Kenya Hara 东方极简美学

### 后端
- **框架**：FastAPI (Python)
- **数据库**：PostgreSQL（存储蒸馏结果）
- **AI 调用**：
  - OpenAI API（GPT-4）
  - Claude API（Sonnet 3.5）
  - 本地 LLM（可选，Ollama）

### 核心模块

#### 1. 数据采集模块
**支持多种输入方式**：
- 文本输入（用户直接粘贴）
- URL 抓取（公众号、小红书、知乎）
- 音频转文字（Whisper API）
- 视频字幕提取（YouTube、B站）

**技术栈**：
- 文本输入：直接接收
- URL 抓取：Playwright + BeautifulSoup
- 音频转文字：OpenAI Whisper API
- 视频字幕：youtube-dl / you-get

#### 2. 认知蒸馏模块（核心）
**2.1 核心信念提取**
- 输入：10-20 篇内容
- 方法：LLM 多轮对话 + 证据溯源
- 输出：3-5 条核心信念（带证据链）

**Prompt 设计**：
```
你是一个认知分析专家。我会给你一个人的 10-20 篇内容，请提取 TA 的核心信念。

要求：
1. 每条信念必须有 3 个以上的证据支撑
2. 证据必须是原文引用，不能改写
3. 信念必须是底层的、稳定的，不是表层观点
4. 用一句话概括每条信念

输出格式：
{
  "belief": "信念描述",
  "evidence": ["证据1", "证据2", "证据3"]
}
```

**2.2 思维模型识别**
- 输入：核心信念 + 内容样本
- 方法：LLM 模式识别 + 知识图谱
- 输出：思维模型图谱

**预设思维模型库**：
- 第一性原理
- 系统思维
- 逆向思维
- 批判性思维
- 设计思维
- 增长思维
- 二元对立
- 辩证思维

**2.3 表达风格提取**
- 输入：内容样本
- 方法：结构化 Prompt + Few-shot Learning
- 输出：语言风格模板

**分析维度**：
- 语言风格（正式度、密度、语气）
- 叙事结构（开头、转折、结尾）
- 修辞手法（类比、反问、排比）
- 节奏感（句子长度、段落结构）
- 高频词汇（语义聚类）

#### 3. 数据质量评估模块（新增，核心）

**3.1 置信度计算**
- 输入：核心信念 + 证据链
- 方法：统计分析 + 规则判断
- 输出：置信度评分（高/中/低）

**计算逻辑**：
```python
def calculate_confidence(belief, evidence_list):
    evidence_count = len(evidence_list)  # 证据数量
    source_count = len(set([e['source'] for e in evidence_list]))  # 来源分布
    
    if evidence_count >= 5 and source_count >= 3:
        return "高"
    elif evidence_count >= 3 and source_count >= 2:
        return "中"
    else:
        return "低"
```

**3.2 Bad Case 检测**
- 输入：所有核心信念
- 方法：LLM 语义对比 + 逻辑一致性检查
- 输出：自相矛盾的信念对 + 矛盾原因

**检测维度**：
- 直接矛盾（A说X，B说非X）
- 隐含矛盾（A的前提与B的结论冲突）
- 程度矛盾（A说"总是"，B说"有时"）

**3.3 数据覆盖度分析**
- 输入：完整的认知档案
- 方法：规则检查 + 数据统计
- 输出：三层蒸馏的数据完整性报告

**评估标准**：
- 认知层：核心信念≥3条，思维模型≥2个 → 充足
- 表达层：语言风格、叙事结构、修辞手法均已提取 → 充足
- 互动层：关系建立、引导方式、反对意见处理均已提取 → 充足

**3.4 数据迭代建议生成**
- 输入：数据质量评估结果
- 方法：规则引擎 + LLM 生成
- 输出：具体的改进建议

**建议类型**：
- 补充内容建议（缺少哪类内容）
- 解决矛盾建议（如何处理bad case）
- 提升置信度建议（如何增强证据链）

#### 4. 产出物生成模块
**4.1 结构化数据生成**
- 格式：JSON + JSON Schema 校验
- 导出：支持多种格式（JSON、YAML、Markdown）

**4.2 数据质量报告生成**
- 格式：Markdown + 可视化图表
- 内容：置信度分析、Bad case检测、覆盖度分析、迭代建议

**4.3 认知档案可视化**
- 技术：React 组件 + D3.js 可视化
- 交互：可折叠、可筛选、可导出

---

## 数据库设计

### 表结构

#### 1. distillations（蒸馏任务）
```sql
CREATE TABLE distillations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,              -- 被蒸馏者名字
  source_type VARCHAR(50) NOT NULL,        -- 数据源类型：text/url/audio/video
  status VARCHAR(50) NOT NULL,             -- 状态：pending/processing/completed/failed
  quality_score VARCHAR(10),               -- 数据质量评分：A+/A/A-/B+/B/B-/C
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. contents（原始内容）
```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id),
  title VARCHAR(500),
  body TEXT NOT NULL,
  source_url VARCHAR(1000),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. cognitive_profiles（认知档案）
```sql
CREATE TABLE cognitive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id),
  core_beliefs JSONB,                      -- 核心信念（带置信度）
  thinking_models JSONB,                   -- 思维模型
  values TEXT,                             -- 价值观
  worldview TEXT,                          -- 世界观
  language_style JSONB,                    -- 语言风格
  narrative_structure JSONB,               -- 叙事结构
  rhetoric JSONB,                          -- 修辞手法
  interaction_layer JSONB,                 -- 互动层
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. quality_reports（数据质量报告）
```sql
CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id),
  overall_score VARCHAR(10),               -- 整体评分
  confidence_analysis JSONB,               -- 置信度分析
  bad_cases JSONB,                         -- Bad case检测结果
  coverage_analysis JSONB,                 -- 覆盖度分析
  iteration_suggestions JSONB,             -- 迭代建议
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. style_templates（风格模板）
```sql
CREATE TABLE style_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distillation_id UUID REFERENCES distillations(id),
  template_json JSONB NOT NULL,            -- 完整的风格模板
  template_markdown TEXT,                  -- Markdown 格式
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API 端点设计

### 1. 创建蒸馏任务
```
POST /api/distillations
Body: {
  "name": "博主名",
  "source_type": "text",
  "contents": [
    {"title": "标题1", "body": "正文1"},
    {"title": "标题2", "body": "正文2"}
  ]
}
Response: {
  "distillation_id": "uuid",
  "status": "pending"
}
```

### 2. 获取蒸馏结果
```
GET /api/distillations/{distillation_id}
Response: {
  "id": "uuid",
  "name": "博主名",
  "status": "completed",
  "quality_score": "A-",
  "cognitive_profile": {...},
  "quality_report": {...},
  "style_template": {...}
}
```

### 3. 获取数据质量报告
```
GET /api/distillations/{distillation_id}/quality-report
Response: {
  "overall_score": "A-",
  "confidence_analysis": {...},
  "bad_cases": [...],
  "coverage_analysis": {...},
  "iteration_suggestions": [...]
}
```

### 4. 导出风格模板
```
GET /api/distillations/{distillation_id}/export?format=json|yaml|markdown
Response: 风格模板文件
```

### 5. 对比分析
```
POST /api/distillations/compare
Body: {
  "distillation_ids": ["uuid1", "uuid2"]
}
Response: {
  "comparison": {
    "cognitive_layer": {...},
    "expression_layer": {...}
  }
}
```

---

## 开发计划

### ✅ Phase 1-4：核心功能开发（已完成，2026-05-12）
- [x] 项目初始化和数据库设计
- [x] 三层蒸馏引擎实现（Gemini 2.0 Flash + Claude Sonnet 4）
- [x] 质量评估模块（置信度、Bad Case、覆盖度）
- [x] 后端 API 完整实现
- [x] 前端完整实现（Vite + React + Kenya Hara 设计）
- [x] 生产环境部署（Nginx + systemd）
- [x] 系统上线运行（http://43.128.11.119）

### ⏳ Phase 5：优化和迭代（待进行）
- [ ] 真实案例测试
- [ ] Prompt 优化
- [ ] 性能测试和优化
- [ ] 文档完善

---

## 与热浪项目的关系

### 互相成就
1. **镜像 → 热浪**：蒸馏 5 种博主风格 → 导入热浪项目的 `blogger_styles.json`
2. **热浪 → 镜像**：热浪生成的内容 → 回测数据 → 优化镜像的蒸馏算法

### 面试时怎么讲
> "我做了三个项目，但它们不是独立的，而是展示我在AI运营三个方向上的能力：
> 
> **对位**：展示我能从0到1交付AI产品（基于业务目标的AI产品运营）
> 
> **镜像**：展示我的数据运营能力——如何从非结构化内容中提取结构化认知数据，这是垂直领域知识库构建的核心能力。具体来说，我做了三件事：
> 1. 定义数据标准（三层蒸馏结构）
> 2. 搭建数据生产流程（LLM语义理解 + 证据溯源）
> 3. 建立质量评估体系（置信度计算、Bad case检测、数据迭代）
> 
> **热浪**：展示我能把AI能力落地到具体业务场景（内容生成工作流）
> 
> 这三个项目对应AI运营岗位的三个核心方向：产品交付、数据运营、业务落地。"

---

## 技术亮点

### 1. 认知建模算法
- 不是简单的关键词提取
- 是基于 LLM 的语义理解 + 证据溯源
- 可以识别隐含的思维模型

### 2. 数据质量保障体系（新增）
- 置信度计算：量化数据可靠性
- Bad case检测：自动发现数据矛盾
- 覆盖度分析：确保数据完整性
- 迭代建议：指导数据优化方向

### 3. 多模态输入
- 支持文本、音频、视频
- 统一的蒸馏流程
- 自动化数据预处理

### 4. 可视化设计
- 思维模型图谱（D3.js）
- 证据链可视化
- 数据质量指标可视化
- 交互式探索

### 5. 通用性
- 不局限于自媒体
- 可以蒸馏任何有内容输出的人
- 风格模板可导出到其他工具

---

## 局限性 + 改进方向

### 当前局限
1. **数据量要求**：需要 10-20 篇内容才能准确蒸馏
2. **语言限制**：目前只支持中文
3. **主观性**：认知层的提取有一定主观性
4. **质量评估**：置信度计算规则需要根据实际情况调整

### 改进方向
1. **少样本蒸馏**：5 篇内容就能初步蒸馏
2. **多语言支持**：英文、日文等
3. **置信度优化**：引入更多维度（证据质量、时间分布等）
4. **持续学习**：用户反馈 → 优化蒸馏算法
5. **人工验证流程**：用户可以标注错误，系统自动重新蒸馏

---

## 成功标准

### 技术指标
- [ ] 蒸馏准确率 > 80%（人工评估）
- [ ] 单次蒸馏时间 < 5 分钟
- [ ] 支持 4 种输入方式（文本、URL、音频、视频）
- [ ] 数据质量评估准确率 > 85%（bad case检测、置信度计算）

### 产品指标
- [ ] 完成 5 个真实案例蒸馏（宠物博主 5 种风格）
- [ ] 风格模板可直接导入热浪项目
- [ ] 认知档案页面加载时间 < 2 秒
- [ ] 数据质量报告生成时间 < 10 秒

### 展示指标（面试用）
- [ ] 有完整的 Demo 视频（3 分钟）
- [ ] 有详细的技术文档
- [ ] 有对比分析案例（展示差异化）
- [ ] 有数据质量报告案例（展示数据运营能力）

---

## 参考资源

### 技术参考
- [blogger-distiller](https://github.com/otter1101/blogger-distiller) — 自媒体博主蒸馏工具（参考三层结构）
- [LangChain](https://python.langchain.com/) — LLM 应用开发框架
- [D3.js](https://d3js.org/) — 数据可视化库

### 理论参考
- 认知科学：思维模型、认知框架
- 语言学：叙事结构、修辞手法
- 心理学：价值观、世界观
- 数据科学：数据质量评估、置信度计算

---

## 下一步行动

### 立即行动（今天）
1. [ ] 与Orion讨论数据质量评估规则（30分钟）
   - 置信度标准：多少条证据算"高"？
   - 覆盖度标准：什么叫"充足"？
   - Bad case标准：什么情况算"矛盾"？

### 明天开始
1. [ ] 设计核心信念提取 Prompt
2. [ ] 测试 Prompt（用 3 个真实案例）
3. [ ] 实现置信度计算逻辑
4. [ ] 实现 Bad case 检测
5. [ ] 搭建数据库
6. [ ] 开发蒸馏引擎
