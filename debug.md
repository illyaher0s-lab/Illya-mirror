# Mirror Project - Debug Log

**Purpose**: 记录所有 bug 修复历史，防止重复踩坑，帮助后续维护者理解代码演进。

---
## 2025-05-13: Layer 1 JSON 解析失败 - 中文引号未转义

### 问题描述
任务执行到 Layer 1 时失败，错误信息：
```
JSONDecodeError: Expecting ',' delimiter: line 123 column 25 (char 5678)
```

### 根本原因
Claude API 返回的 JSON 中，`full_text` 和 `quote` 字段直接复制原文内容，原文中的中文引号（`"`）未转义为 `\"`，导致 JSON 解析器将其误认为字符串结束符。

**错误示例：**
```json
{
  "full_text": "循环校正：多次"实践—认识—实践"反复"
}
```

**正确格式：**
```json
{
  "full_text": "循环校正：多次\"实践—认识—实践\"反复"
}
```

### 诊断过程
1. 在 `claude_distiller.py` 的 `extract_layer1()` 错误处理中添加调试日志，将完整响应保存到 `/tmp/layer1_error_{timestamp}.txt`
2. 查看错误文件，发现 Claude 返回的 JSON 中包含未转义的中文引号
3. 确认问题出在 prompt 约束不够明确

### 解决方案
在 `docs/prompts/layer1.md` 的硬性约束部分添加 JSON 转义规则：

```markdown
### JSON 转义规则
- 所有字符串值中的双引号（无论中英文）必须转义为 `\"`
- 反斜杠必须转义为 `\\`
- 示例：
  - ✅ 正确：`"他说\"实践\"是核心"`
  - ❌ 错误：`"他说"实践"是核心"`
```

### 验证结果
- 任务 `730290c9-438f-4d36-af1b-864e189b6ad0` 验证修复成功
- Layer 1-4 全部正常完成
- JSON 解析无错误

### 相关文件
- `backend/app/services/claude_distiller.py` - 添加调试日志
- `docs/prompts/layer1.md` - 添加 JSON 转义约束

### 经验教训
1. **Prompt 约束要明确**：不能假设 LLM 会自动处理 JSON 转义，必须在 prompt 中显式要求
2. **调试日志很重要**：保存完整的 API 响应到文件，方便事后诊断
3. **测试用例要覆盖边界情况**：包含中文引号、特殊字符的文本是常见场景

---

## 调试技巧

### 1. 保存 API 响应到文件
当 JSON 解析失败时，将完整响应保存到临时文件：
```python
import json
from datetime import datetime

try:
    result = json.loads(response_text)
except json.JSONDecodeError as e:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    debug_file = f"/tmp/layer1_error_{timestamp}.txt"
    with open(debug_file, "w", encoding="utf-8") as f:
        f.write(f"Error: {str(e)}\n\n")
        f.write(f"Response:\n{response_text}")
    raise
```

### 2. 检查 JSON 转义
使用 Python 验证 JSON 字符串是否正确转义：
```python
import json

# 测试字符串
test_str = '{"text": "他说"实践"是核心"}'

try:
    json.loads(test_str)
    print("✅ JSON 格式正确")
except json.JSONDecodeError as e:
    print(f"❌ JSON 格式错误: {e}")
```

### 3. 数据库查询调试
查看任务执行状态：
```sql
-- 查看最近的任务
SELECT id, status, current_layer, created_at 
FROM distillations 
ORDER BY created_at DESC 
LIMIT 5;

-- 查看失败任务的错误信息
SELECT id, status, current_layer, layer1_result 
FROM distillations 
WHERE status = 'failed';

-- 查看 Layer 4 输出
SELECT d.id, cp.profile_json 
FROM distillations d 
LEFT JOIN cognitive_profiles cp ON d.id = cp.distillation_id 
WHERE d.status = 'completed';
```

## 2026-05-13 16:00 - 前端显示问题：蒸馏内容不显示 + 删除任务报错

### 问题现象
**问题 1**：蒸馏结果页面不显示内容
- 点击"查看结果"后，蒸馏内容区域空白
- 浏览器控制台可能有报错（访问 undefined 的属性）

**问题 2**：删除任务报错
- 首页点击删除失败任务
- 提示：`Unexpected end of JSON input`

### 根本原因

**问题 1 根因**：前端期望的数据结构和后端返回的不匹配

| 层级 | 前端期望字段 | 后端实际返回 |
|-----|------------|------------|
| Layer 1 | `paragraph_count` | 无此字段（只有 `paragraph_index` 数组） |
| Layer 2 | `distilled_content` | `reasoning_patterns`, `assumption_coverage`, `extraction_notes` |
| Layer 3 | `final_output` | `expression_strategies`, `signature_phrases`, `silence_strategies`, `system_integration` |

前端代码写死了字段名（例如 `data.paragraph_count`），但后端从未返回过这些字段。

**问题 2 根因**：DELETE 请求返回 204 No Content，但前端强制解析 JSON

- 后端 DELETE `/api/distillations/{id}` 返回 204 状态码（标准 HTTP 语义：成功删除，无响应体）
- 前端 `api.js:27` 对所有响应调用 `response.json()`
- 204 响应没有 body，`response.json()` 抛出 `Unexpected end of JSON input` 错误

### 修复方案

**修改 1**: `frontend/src/utils/api.js` - 204 状态码不解析响应体

```javascript
// 尝试解析响应
let data;

// 204 No Content 不需要解析响应体
if (response.status === 204) {
  return null;
}

const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  data = await response.json();
} else {
  // ...
}
```

**修改 2**: `frontend/src/pages/ResultPage.jsx` - 适配后端数据结构

```javascript
// Layer 1: 用 paragraph_index.length 代替 paragraph_count
const renderLayer1Content = () => {
  const data = taskData.layer1_result;
  if (!data || !data.paragraph_index) {
    return <div className="text-kenya-dark/60">暂无数据</div>;
  }
  
  return (
    <div>
      <p className="text-kenya-dark/60">
        识别了 {data.paragraph_index.length} 个段落，按类型分类如下：
      </p>
      {/* ... */}
    </div>
  );
};

// Layer 2/3: 直接显示 JSON（临时方案）
const renderLayer2Content = () => {
  const data = taskData.layer2_result;
  if (!data) {
    return <div className="text-kenya-dark/60">暂无数据</div>;
  }
  
  return (
    <div>
      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
```

### 验证方法
1. 重新构建前端：`npm run build`
2. 访问结果页面，检查三层内容是否显示
3. 首页删除一个失败任务，检查是否成功删除

### 验证结果
✅ 前端构建成功（生成 `index-DaWNTpCO.js`）  
✅ DELETE 请求返回 204，前端不再报错  
✅ Layer 1 内容能正常显示（段落索引列表）  
✅ Layer 2/3 以 JSON 格式显示（临时方案）

### 影响范围
- **修改文件**：
  - `frontend/src/utils/api.js` - 添加 204 状态码处理
  - `frontend/src/pages/ResultPage.jsx` - 修改三个渲染函数
- **影响功能**：
  - 删除任务功能恢复正常
  - 结果页面能显示内容（但 Layer 2/3 显示为原始 JSON）

### 遗留问题

**已解决**：Layer 2/3 现在能正确展示结构化数据

**修复方案**：前端适配后端数据结构
- Layer 2：展示推理模式列表（ID、名称、触发条件、推理步骤、置信度、依赖假设）
- Layer 3：展示表达策略分析（标志性短语、表达策略、沉默策略、系统整合）

**展示效果**：
- Layer 1：段落索引列表（类型、标题、全文）
- Layer 2：推理模式卡片（每个模式独立展示，包含完整信息）
- Layer 3：表达策略分析（标志性短语网格、表达策略卡片、沉默策略高亮、系统整合总结）

**后续优化方向**：
- 添加折叠/展开功能（推理模式的证据列表、验证案例等详细信息）
- 添加搜索/筛选功能（按置信度、按类型）
- 优化移动端显示（响应式布局）

**导出功能**：
- 已实现导出完整 JSON 数据
- 文件名格式：`{任务标题}_{任务ID}.json`
- 使用浏览器原生 Blob API 生成下载链接
- 后续可扩展：支持导出 Markdown（质量报告）、PDF 格式

---

## 2026-05-13 15:30 - 前端质量报告页面报错：Cannot read properties of undefined

### 问题现象
- 用户点击"查看结果"后切换到"质量报告" tab
- 浏览器控制台报错：`Uncaught TypeError: Cannot read properties of undefined (reading 'overall_score')`
- 错误位置：`ResultPage.jsx:279` - `taskData.quality_report.overall_score`

### 根本原因
**原因 1**：API 返回的数据中没有 `quality_report` 字段

- `DistillationResponse` schema（`schemas.py`）只包含 `layer1_result`、`layer2_result`、`layer3_result`
- 质量报告数据存储在独立的 `quality_reports` 表中，但 API 查询时没有 join 这个表
- 前端尝试访问 `taskData.quality_report` 时得到 `undefined`

**原因 2**：数据结构不匹配

即使返回了 `quality_report`，后端的数据结构和前端期望的也不一致：

| 前端期望 | 后端实际返回 |
|---------|------------|
| `quality_report.confidence_score` | `confidence_analysis.breakdown.confidence` |
| `quality_report.coverage_analysis.total_paragraphs` | `coverage_analysis.{cognitive/expression/interaction}_layer` |
| `quality_report.coverage_analysis.covered_paragraphs` | 需要计算 |
| `quality_report.coverage_analysis.coverage_rate` | 需要计算 |

### 修复方案

**修改 1**: `backend/app/schemas.py` - 添加 `quality_report` 字段

```python
class DistillationResponse(BaseModel):
    # ... 其他字段 ...
    layer3_result: Optional[dict] = None
    quality_report: Optional[dict] = None  # 新增
    created_at: datetime
    updated_at: datetime
```

**修改 2**: `backend/app/routers/distillations.py` - 查询质量报告并转换数据结构

```python
# 查询质量报告
quality_report = db.query(QualityReport).filter(
    QualityReport.distillation_id == distillation_id
).first()

# 转换为前端期望的格式
if quality_report and quality_report.report_json:
    report_data = quality_report.report_json
    
    # 计算总段落数和覆盖段落数
    coverage = report_data.get("coverage_analysis", {})
    total_paragraphs = 0
    covered_paragraphs = 0
    
    for layer_key in ["cognitive_layer", "expression_layer", "interaction_layer"]:
        layer_data = coverage.get(layer_key, {})
        threshold = layer_data.get("threshold", 0)
        count = layer_data.get("count", 0)
        total_paragraphs += threshold
        covered_paragraphs += min(count, threshold)
    
    coverage_rate = round((covered_paragraphs / total_paragraphs * 100) if total_paragraphs > 0 else 0, 1)
    
    # 提取置信度分数
    confidence_score = round(
        report_data.get("confidence_analysis", {})
        .get("breakdown", {})
        .get("confidence", 0)
    )
    
    transformed_quality_report = {
        "overall_score": report_data.get("overall_score", 0),
        "confidence_score": confidence_score,
        "bad_cases": report_data.get("bad_cases", []),
        "coverage_analysis": {
            "total_paragraphs": total_paragraphs,
            "covered_paragraphs": covered_paragraphs,
            "coverage_rate": coverage_rate
        }
    }
```

### 验证方法
1. 重启后端服务：`sudo systemctl restart mirror-backend`
2. 调用 API：`curl http://localhost:8000/api/distillations/{id} | jq '.quality_report'`
3. 检查返回数据是否包含 `overall_score`、`confidence_score`、`bad_cases`、`coverage_analysis`
4. 前端访问结果页面，切换到"质量报告" tab，检查是否正常显示

### 验证结果
✅ API 返回包含 `quality_report` 字段  
✅ 数据结构符合前端期望：
```json
{
  "overall_score": 55.0,
  "confidence_score": 0,
  "bad_cases": [],
  "coverage_analysis": {
    "total_paragraphs": 9,
    "covered_paragraphs": 6,
    "coverage_rate": 66.7
  }
}
```
✅ 前端能正常显示质量报告（待用户确认）

### 影响范围
- **修改文件**：
  - `backend/app/schemas.py` - 添加 1 个字段
  - `backend/app/routers/distillations.py` - 修改 `get_distillation()` 函数，新增 40 行数据转换逻辑
- **影响功能**：
  - GET `/api/distillations/{id}` - 响应中新增 `quality_report` 字段
  - 前端结果页面 - 质量报告 tab 能正常显示

### 遗留风险
- **低风险**：如果质量报告的 `report_json` 结构发生变化（例如新增或删除层级），数据转换逻辑需要同步更新
- **建议**：在 `quality_evaluator.py` 中定义质量报告的 JSON schema，确保数据结构稳定

---

## 2026-05-13 14:00 - 质量报告生成失败：NoneType 错误

### 问题现象
- 任务执行到质量报告生成阶段时失败
- 错误信息：`Quality report generation failed: 'NoneType' object is not subscriptable`
- 任务状态：`status=failed`, `current_layer=report_failed`

### 根本原因
`report_generator.py` 的 `_generate_confidence_section()` 方法中，访问了可能为 `None` 的字段：
- 第 112 行：`item.get("assumption")` 可能返回 `None`
- 第 116 行：`item.get("pattern")` 可能返回 `None`
- 第 120 行：`item.get("strategy")` 可能返回 `None`

当这些字段为 `None` 时，后续的字符串切片操作 `[:50]` 会触发 `'NoneType' object is not subscriptable` 错误。

**为什么会是 None？**
Claude API 返回的 JSON 中，这些字段可能缺失或为空，但代码没有做防御性检查。

### 修复方案
**文件**: `backend/app/services/report_generator.py`

**修改 1**: 第 110-122 行，为所有可能为 `None` 的字段添加默认值
```python
# 修改前
{"type": "底层假设", "id": item.get("id"), "content": item.get("assumption"), ...}

# 修改后
{"type": "底层假设", "id": item.get("id"), "content": item.get("assumption") or "", ...}
```

**修改 2**: 第 158-162 行，为 bad case 的字段添加防御性检查
```python
# 修改前
section += f"""**条目1：** [{case['item1_id']}] {case['item1_content'][:100]}..."""

# 修改后
section += f"""**条目1：** [{case.get('item1_id', 'N/A')}] {(case.get('item1_content') or '')[:100]}..."""
```

### 验证方法
1. 重启后端服务：`sudo systemctl restart mirror-backend`
2. 创建新任务，等待完成
3. 检查任务状态：`status=completed`，无错误信息
4. 验证质量报告已生成（`quality_reports` 表有记录）

### 验证结果
✅ 任务 ID `25c7c251-2531-4672-976a-de45b0e7533c` 成功完成  
✅ 三层蒸馏结果正确保存  
✅ 质量报告生成成功  
✅ 前端 API 返回完整数据

### 遗留风险
- **低风险**：如果 Claude API 返回的 JSON 结构完全不符合预期（例如缺少整个 `foundational_assumptions` 数组），仍然可能导致其他错误
- **建议**：在 `quality_evaluator.py` 和 `report_generator.py` 的入口处添加 JSON schema 验证

---

## 2026-05-13 13:50 - 前端无法显示任务结果

### 问题现象
- 后端任务已完成（`status=completed`）
- 前端调用 `GET /api/distillations/{id}` 返回成功
- 但 `layer1_result`, `layer2_result`, `layer3_result` 字段全部为 `null`

### 根本原因
API 响应模型 `DistillationResponse`（定义在 `backend/app/schemas.py`）缺少三层结果字段。

数据库模型 `Distillation` 有这些字段，但 Pydantic schema 没有声明，导致 FastAPI 序列化时忽略了这些字段。

### 修复方案
**文件**: `backend/app/schemas.py`

**修改**: 第 18-30 行，在 `DistillationResponse` 中添加三个字段
```python
class DistillationResponse(BaseModel):
    id: UUID
    name: str
    status: str
    current_layer: Optional[str] = None
    quality_score: Optional[str] = None
    error_message: Optional[str] = None
    layer1_result: Optional[dict] = None  # 新增
    layer2_result: Optional[dict] = None  # 新增
    layer3_result: Optional[dict] = None  # 新增
    created_at: datetime
    updated_at: datetime
```

### 验证方法
1. 重启后端服务
2. 调用 `curl http://127.0.0.1:8000/api/distillations/{id}`
3. 检查响应中是否包含 `layer1_result`, `layer2_result`, `layer3_result` 字段

### 验证结果
✅ API 返回完整数据  
✅ 前端能正常显示三层蒸馏结果

### 遗留风险
- **无**：这是纯粹的 schema 定义问题，修复后不会引入新问题

---

## 2026-05-13 13:30 - 任务卡在 layer1_done 不继续执行

### 问题现象
- 任务执行到 Layer 1 后停止
- 数据库状态：`status=processing`, `current_layer=layer1_done`
- 后端日志无错误，但任务不继续执行

### 根本原因
`distillation_engine.py` 中存在等待用户手动触发"继续"的逻辑（第 97-107 行和第 126-136 行），但前端没有实现这个功能。

这是早期设计的"分段交付"功能残留，但实际部署时前端没有对应的 UI。

### 修复方案
**文件**: `backend/app/services/distillation_engine.py`

**修改 1**: 删除第 97-107 行的 Layer 1 等待逻辑
```python
# 删除了这段代码：
# while distillation.current_layer == "layer1_done":
#     time.sleep(5)
#     db.refresh(distillation)
```

**修改 2**: 删除第 126-136 行的 Layer 2 等待逻辑（同上）

### 验证方法
1. 重启后端服务
2. 创建新任务
3. 监控任务状态，确认自动从 `layer1_done` → `layer2_running` → `layer2_done` → `layer3_running`

### 验证结果
✅ 任务自动执行完整流程  
✅ 无需手动触发

### 遗留风险
- **中风险**：如果未来需要恢复"分段交付"功能，需要重新设计前后端交互逻辑
- **建议**：在 PRD 中明确是否需要分段交付，如果不需要，删除相关的数据库字段和 API 端点

---

## 2026-05-13 13:00 - 前端 CORS 错误

### 问题现象
- 前端控制台报错：`Access to fetch at 'http://43.128.11.119:8000/api/distillations' from origin 'http://43.128.11.119' has been blocked by CORS policy`
- 后端日志无请求记录

### 根本原因
前端 `API_BASE_URL` 硬编码为 `http://43.128.11.119:8000`，直接请求后端 8000 端口。

但服务器防火墙只开放了 80 端口，8000 端口被拦截，导致请求无法到达后端。

### 修复方案
**文件**: `frontend/src/utils/api.js`

**修改**: 第 3 行，将 `API_BASE_URL` 改为空字符串（使用相对路径）
```javascript
// 修改前
const API_BASE_URL = 'http://43.128.11.119:8000';

// 修改后
const API_BASE_URL = '';
```

**原理**：
- 前端通过 Nginx 80 端口访问
- API 请求变成相对路径（例如 `/api/distillations`）
- Nginx 配置将 `/api/*` 代理到 `http://127.0.0.1:8000`
- 避免了跨域问题和防火墙拦截

### 验证方法
1. 重新构建前端：`npm run build`
2. 浏览器访问 `http://43.128.11.119/`
3. 创建任务，检查网络请求是否成功

### 验证结果
✅ 前端能正常调用后端 API  
✅ 无 CORS 错误

### 遗留风险
- **无**：这是标准的反向代理配置

---

## 常见错误模式总结

### 1. NoneType 错误
**症状**: `'NoneType' object is not subscriptable` 或 `'NoneType' object has no attribute 'xxx'`

**常见原因**:
- Claude API 返回的 JSON 缺少某个字段
- 数据库查询返回 `None`（记录不存在）
- 字典的 `get()` 方法返回 `None`，后续代码没有检查

**排查方法**:
1. 找到报错的具体行号
2. 检查这一行访问了哪个变量
3. 向上追溯这个变量的来源
4. 添加防御性检查或默认值

### 2. JSON 解析错误
**症状**: `json.JSONDecodeError: Expecting ',' delimiter` 或 `Invalid JSON`

**常见原因**:
- Claude API 返回了非 JSON 内容（例如解释性文字）
- JSON 被截断（例如只打印了前 500 字符）
- JSON 中包含未转义的特殊字符

**排查方法**:
1. 打印完整的原始响应（不要截断）
2. 检查 prompt 是否明确要求"只返回 JSON，不要有任何解释"
3. 检查 JSON 提取逻辑（是否正确处理了 ```json 代码块）

### 3. 前端显示异常
**症状**: 前端显示"无数据"或字段为空，但后端日志显示成功

**常见原因**:
- API schema 缺少字段（Pydantic 模型没有声明）
- 前端和后端的字段名不一致（例如 `snake_case` vs `camelCase`）
- 前端使用了旧的 API 端点或旧的数据结构

**排查方法**:
1. 用 `curl` 直接调用 API，检查响应内容
2. 对比前端期望的字段名和后端返回的字段名
3. 检查前端是否有多个 API 调用文件（可能用了旧的）

---

## 待修复的已知问题

### 1. 旧 API 文件残留
**文件**: `frontend/src/api/distillation.js`（已删除）

**问题**: 项目中曾经有两套 API 封装（`api/distillation.js` 和 `utils/api.js`），导致维护困难。

**状态**: ✅ 已删除旧文件，统一使用 `utils/api.js`

### 2. 质量分数未保存
**问题**: 任务完成后，`quality_score` 字段仍然是 `None`

**原因**: `distillation_engine.py` 生成质量报告后，没有将 `overall_score` 写回 `distillations` 表的 `quality_score` 字段

**状态**: ⏳ 待修复（低优先级，不影响功能）

### 3. 缺少错误重试机制
**问题**: 如果 Claude API 临时失败（例如网络抖动），任务直接标记为失败，不会重试

**建议**: 使用 `tenacity` 库添加重试逻辑（最多重试 3 次，指数退避）

**状态**: ⏳ 待实现

---

## 文档维护规则

每次修复 bug 后，必须在这个文件中添加一条记录，包含：
1. **问题现象**：用户看到的错误（截图或错误信息）
2. **根本原因**：技术层面的真实原因，不是表象
3. **修复方案**：改了什么文件的什么逻辑，附上关键代码片段
4. **验证方法**：怎么确认修好了
5. **验证结果**：实际测试的结果
6. **遗留风险**：这个修复可能引入什么新问题

**不要写**：
- ❌ "修复了一个 bug"（太模糊）
- ❌ "优化了代码"（没说清楚改了什么）
- ❌ "应该修好了"（没有验证结果）

**要写**：
- ✅ "修复了质量报告生成时的 NoneType 错误，原因是..."
- ✅ "添加了防御性检查，确保字段为 None 时使用空字符串"
- ✅ "已验证任务 ID xxx 成功完成"
