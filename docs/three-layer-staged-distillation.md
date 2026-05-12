# Mirror 三层分段蒸馏设计文档

**更新日期**：2026-05-12  
**状态**：已实现

---

## 一、设计变更概述

### 原设计（已废弃）
- 阶段二：Claude一次性完成三层蒸馏
- 输入：Gemini压缩后的文本（2-3万字）
- 输出：完整的三层认知档案JSON

### 新设计（当前实现）
- 阶段二：Claude分三次请求，逐层蒸馏
- **请求1**：提取底层假设 + 构建段落索引
- **请求2**：基于请求1的输出，提取推理规则
- **请求3**：基于请求1+2的输出，提取表达策略
- 每层完成后等待用户确认，支持中途叫停

---

## 二、核心设计原则

### 2.1 认识论原则

**问题**：用"统计频次"代替"认知结构"会导致失真。

**解决方案**：
1. **底层假设提取**：不依赖频次，而是通过"追问三次"找到不言而喻的前提
2. **推理规则归纳**：不套用预设框架（如"第一性原理"），而是从文本中归纳实际使用的分析动作序列
3. **表达策略分析**：不只描述"他用了类比"，而是追问"为什么用类比？它服务于哪条推理规则？"

### 2.2 层间依赖关系

```
请求1（底层假设）
    ↓ 输出：foundational_assumptions + paragraph_index
请求2（推理规则）
    ↓ 输出：reasoning_patterns + assumption_coverage
请求3（表达策略）
    ↓ 输出：expression_strategies + system_integration
```

**关键设计**：
- 请求2-3不重新扫描原文，只处理请求1构建的 `paragraph_index`
- `paragraph_index` 包含每个段落的类型标注（判断型/推理型/表达型/描述型）和完整原文
- 描述型段落的 `full_text` 为 `null`，节省token（约20-30%）

### 2.3 误差控制机制

**问题**：层间漂移——第一层的错误会被逐层放大。

**解决方案**：
1. **每层内置证伪检验**：提取每条假设/规则后，主动搜索反例
2. **第四层回溯验证**（未实现）：用提取出的"推理引擎"重新解释原文，标注冲突点

---

## 三、分段交付设计

### 3.1 用户交互流程

```
用户提交任务
    ↓
后台执行请求1（3-7分钟）
    ↓
请求1完成 → 用户查看结果
    ↓
用户选择：[继续] [叫停] [修改]
    ↓
后台执行请求2（2-4分钟）
    ↓
请求2完成 → 用户查看结果
    ↓
用户选择：[继续] [叫停]
    ↓
后台执行请求3（2-4分钟）
    ↓
请求3完成 → 任务完成
```

### 3.2 状态机设计

```
pending → layer1_running → layer1_done → layer1_continue
                                ↓
                            stopped
                                
layer1_continue → layer2_running → layer2_done → layer2_continue
                                        ↓
                                    stopped
                                    
layer2_continue → layer3_running → completed
                                        ↓
                                    stopped
```

### 3.3 缓存机制

**数据库字段**：
- `layer1_result` (JSONB)：请求1的完整输出
- `layer2_result` (JSONB)：请求2的完整输出
- `layer3_result` (JSONB)：请求3的完整输出
- `current_layer` (VARCHAR)：当前状态

**重试逻辑**：
- 如果请求2失败，检查 `layer1_result` 是否存在 → 存在则直接用缓存，不重跑请求1
- 如果请求3失败，检查 `layer1_result` 和 `layer2_result` 是否存在 → 存在则直接用缓存

---

## 四、Prompt设计要点

### 4.1 请求1：底层假设提取

**输入**：Gemini压缩后的文本（2-3万字）

**输出**：
```json
{
  "paragraph_index": [
    {
      "id": "文章X·第Y段",
      "type": "判断型 | 推理型 | 表达型 | 描述型",
      "note": "段落核心内容（10字以内）",
      "full_text": "完整段落原文（描述型段落为null）"
    }
  ],
  "foundational_assumptions": [
    {
      "id": "FA-01",
      "statement": "一句话陈述",
      "evidence": [...],
      "inference_note": "推导路径",
      "confidence": "高 | 中 | 低",
      "falsification_check": "最接近反例的段落索引"
    }
  ]
}
```

**关键约束**：
- 假设数量：3-5条
- 每条假设至少2个独立证据
- 描述型段落的 `full_text` 必须为 `null`
- 证伪检验必须执行

### 4.2 请求2：推理规则提取

**输入**：请求1的完整JSON输出（不包含原文）

**输出**：
```json
{
  "reasoning_patterns": [
    {
      "id": "RP-01",
      "name": "描述性名称（禁止使用预设框架名）",
      "trigger": "激活条件",
      "steps": ["第一步", "第二步", "结论"],
      "underlying_assumptions": ["FA-01", "FA-03"],
      "evidence": [...],
      "validation_cases": [...]
    }
  ],
  "assumption_coverage": {
    "well_supported": ["FA-01被RP-01和RP-02使用"],
    "orphaned": ["FA-02未被任何推理规则使用"]
  }
}
```

**关键约束**：
- 推理规则数量：3-6条
- 每条规则至少3个独立证据
- 规则命名必须描述性，禁止使用"第一性原理"等预设框架名
- `assumption_coverage` 必须填写，孤立假设必须标注
- 不得重新扫描原始压缩文本

### 4.3 请求3：表达策略提取

**输入**：请求1+2的完整JSON输出（不包含原文）

**输出**：
```json
{
  "expression_strategies": [
    {
      "id": "ES-01",
      "name": "策略名称",
      "observable_form": "具体表现形式",
      "cognitive_function": "认知目的",
      "linked_to": ["FA-01", "RP-02"],
      "evidence": [...]
    }
  ],
  "silence_strategies": [...],
  "signature_phrases": [...],
  "system_integration": {
    "fa_rp_es_coherence": "三层一致性评估",
    "internal_tensions": "矛盾或不一致",
    "simulation_readiness": {
      "high_confidence_dimensions": "可高置信度模拟的维度",
      "blind_spots": "证据不足的维度",
      "known_failure_modes": "低置信度推断的场景"
    }
  }
}
```

**关键约束**：
- 表达策略：4-8条；沉默策略：1-3条
- 每条表达策略必须关联至少一个FA或RP
- `simulation_readiness` 三个子字段必须全部填写
- 不得重新扫描原始压缩文本

---

## 五、技术实现

### 5.1 后台任务引擎

**文件**：`app/services/distillation_engine.py`

**核心逻辑**：
```python
def _distillation_worker(distillation_id: str):
    # Layer 1
    distillation.current_layer = "layer1_running"
    layer1_result = extract_layer1(compressed_text)
    distillation.layer1_result = layer1_result
    distillation.current_layer = "layer1_done"
    
    # Wait for user confirmation
    while distillation.current_layer == "layer1_done":
        time.sleep(2)
        if distillation.current_layer == "stopped":
            return
        elif distillation.current_layer == "layer1_continue":
            break
    
    # Layer 2
    distillation.current_layer = "layer2_running"
    layer2_result = extract_layer2(layer1_result)
    distillation.layer2_result = layer2_result
    distillation.current_layer = "layer2_done"
    
    # ... (同样的等待逻辑)
    
    # Layer 3
    distillation.current_layer = "layer3_running"
    layer3_result = extract_layer3(layer1_result, layer2_result)
    distillation.layer3_result = layer3_result
    distillation.current_layer = "completed"
```

### 5.2 API端点

**控制端点**：
- `POST /api/distillations/{id}/continue` - 继续下一层
- `POST /api/distillations/{id}/stop` - 叫停任务
- `GET /api/distillations/{id}/status` - 查询实时状态

**结果查询端点**：
- `GET /api/distillations/{id}/layer1` - 查看请求1结果
- `GET /api/distillations/{id}/layer2` - 查看请求2结果
- `GET /api/distillations/{id}/layer3` - 查看请求3结果

### 5.3 Claude API调用

**文件**：`app/services/claude_distiller.py`

**模型配置**：
- 模型：`claude-sonnet-4-20250514`
- 温度：0（确定性输出）
- Max tokens：
  - 请求1：16000 tokens
  - 请求2：12000 tokens
  - 请求3：12000 tokens

**Prompt加载**：
- 从 `/home/ubuntu/mirror/docs/prompts/layer{1,2,3}.md` 读取
- 动态插入输入数据（压缩文本或上一层的JSON输出）

---

## 六、成本与性能

### 6.1 时间成本

**单次蒸馏总时长**：9-15分钟
- 请求1：3-7分钟（需要全文扫描 + 构建索引）
- 请求2：2-4分钟（只处理判断型/推理型段落）
- 请求3：2-4分钟（只处理表达型段落 + 已引用段落）
- 用户确认时间：不计入

**优化效果**：
- 原设计（一次性蒸馏）：预计10-16分钟
- 新设计（分段蒸馏）：9-15分钟（时间相近，但用户体验更好）

### 6.2 API成本

**单次蒸馏总成本**：约$2-3（使用Claude Sonnet 4）
- 请求1：输入2万字 + 输出5-8k字 → $0.8-1.2
- 请求2：输入2.5万字 + 输出3k字 → $0.8-1.0
- 请求3：输入2.8万字 + 输出4k字 → $0.9-1.2

**Token节省优化**：
- 描述型段落不照录 `full_text` → 节省约20-30%输出token
- 请求2-3不传入原文 → 节省约2万字输入token

---

## 七、未来优化方向

### 7.1 第四层回溯验证（未实现）

**目标**：用提取出的"推理引擎"重新解释原文，标注冲突点。

**实现方式**：
- 请求4：输入请求1-3的完整输出 + 原文关键段落
- 任务：用FA+RP+ES重新解释这些段落，标注解释不通的地方
- 输出：验证报告 + 冲突点 + 修正建议

### 7.2 用户手动修改中间结果（未实现）

**目标**：用户可以在请求1完成后，手动编辑假设，然后继续请求2。

**实现方式**：
- 新增API：`PATCH /api/distillations/{id}/layer1`
- 用户修改后，清空 `layer2_result` 和 `layer3_result`（因为依赖关系变了）
- 继续执行请求2时，使用修改后的 `layer1_result`

### 7.3 前端实时进度显示（未实现）

**目标**：用户可以看到"已分析87个判断句，已提取2条候选假设"。

**实现方式**：
- 后台任务定期更新进度字段（如 `progress_stats`）
- 前端轮询 `/api/distillations/{id}/status` 每2秒一次
- 显示进度条 + 实时统计

---

## 八、相关文件

**Prompt文件**：
- `/home/ubuntu/mirror/docs/prompts/layer1.md`
- `/home/ubuntu/mirror/docs/prompts/layer2.md`
- `/home/ubuntu/mirror/docs/prompts/layer3.md`

**代码文件**：
- `/home/ubuntu/mirror/backend/app/services/claude_distiller.py` - Claude API调用
- `/home/ubuntu/mirror/backend/app/services/distillation_engine.py` - 后台任务引擎
- `/home/ubuntu/mirror/backend/app/routers/distillation_control.py` - 控制API端点
- `/home/ubuntu/mirror/backend/app/models.py` - 数据库模型（增加layer1/2/3_result字段）

**数据库迁移**：
- `/home/ubuntu/mirror/backend/alembic/versions/73c95fab5e99_add_layer_results_and_current_layer.py`
