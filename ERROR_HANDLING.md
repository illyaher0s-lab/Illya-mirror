# Mirror Project - Error Handling Specification

**Last Updated**: 2026-05-13  
**Purpose**: 统一的错误处理策略、日志规范、重试逻辑。

---

## 错误分类

### 1. 用户错误 (User Error)
**定义**: 用户输入不符合要求

**示例**:
- 文本为空或过短 (< 1000 字)
- 文本过长 (> 50 万字)
- 任务名称为空

**处理策略**:
- ❌ 不重试
- ✅ 立刻返回 400 错误
- ✅ 返回清晰的错误提示（例如："文本长度必须在 1000-500000 字之间"）
- ❌ 不记录到错误日志（这不是系统错误）

**代码示例**:
```python
if len(raw_text) < 1000:
    raise HTTPException(
        status_code=400,
        detail="文本长度不足 1000 字，请提供更多内容"
    )
```

---

### 2. 系统错误 (System Error)
**定义**: 代码逻辑错误、数据库错误、配置错误

**示例**:
- 数据库连接失败
- 必需的环境变量未设置
- JSON 解析失败 (代码 bug)
- NoneType 错误 (代码 bug)

**处理策略**:
- ❌ 不重试（重试也不会成功）
- ✅ 记录完整错误堆栈到日志
- ✅ 返回 500 错误
- ✅ 标记任务为 `failed`
- ✅ 保存错误信息到 `distillations.error_message`
- 🚨 **立刻修复代码**

**代码示例**:
```python
try:
    result = json.loads(response_text)
except json.JSONDecodeError as e:
    logger.error(f"JSON parse error: {e}\nRaw response: {response_text}")
    distillation.status = "failed"
    distillation.error_message = f"JSON 解析失败: {str(e)}"
    db.commit()
    return
```

---

### 3. 外部依赖错误 (External Error)
**定义**: 第三方 API 失败、网络问题

**示例**:
- Claude API 返回 429 (rate limit)
- Claude API 返回 500 (服务器错误)
- Gemini API 超时
- 网络连接中断

**处理策略**:
- ✅ **自动重试** (最多 3 次，指数退避)
- ✅ 记录每次重试到日志
- ✅ 如果 3 次都失败，标记任务为 `failed`
- ✅ 保存最后一次错误信息

**重试规则**:
| 错误类型 | 是否重试 | 重试次数 | 退避策略 |
|---------|---------|---------|---------|
| 429 (Rate Limit) | ✅ | 3 | 指数退避 (2s, 4s, 8s) |
| 500 (Server Error) | ✅ | 3 | 指数退避 (2s, 4s, 8s) |
| 503 (Service Unavailable) | ✅ | 3 | 指数退避 (2s, 4s, 8s) |
| Timeout | ✅ | 3 | 指数退避 (2s, 4s, 8s) |
| 400 (Bad Request) | ❌ | 0 | - |
| 401 (Unauthorized) | ❌ | 0 | - |

**代码示例**:
```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=10),
    retry=retry_if_exception_type((APITimeoutError, APIConnectionError)),
    reraise=True
)
def call_claude_api(prompt: str) -> dict:
    response = client.messages.create(...)
    return response
```

---

## 日志规范

### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| **DEBUG** | 调试信息（生产环境关闭） | `[Layer 1] Sending prompt (4523 tokens)` |
| **INFO** | 正常流程信息 | `[Task abc123] Layer 1 completed in 23.5s` |
| **WARNING** | 可恢复的异常情况 | `[Claude API] Rate limit hit, retrying in 4s (attempt 2/3)` |
| **ERROR** | 错误但不影响其他任务 | `[Task abc123] Layer 2 failed: JSON parse error` |
| **CRITICAL** | 系统级错误 | `Database connection lost` |

### 日志格式

**标准格式**:
```
[时间戳] [级别] [模块] [任务ID] 消息内容
```

**示例**:
```
2026-05-13 14:23:45 INFO [distillation_engine] [abc-123] Layer 1 started
2026-05-13 14:24:10 WARNING [claude_distiller] [abc-123] API timeout, retrying (1/3)
2026-05-13 14:24:15 INFO [claude_distiller] [abc-123] Layer 1 completed (1523 tokens)
2026-05-13 14:24:20 ERROR [report_generator] [abc-123] NoneType error at line 112
```

### 代码实现

```python
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s [%(name)s] %(message)s',
    handlers=[
        logging.FileHandler('/var/log/mirror-backend.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# 使用日志
logger.info(f"[{task_id}] Layer 1 started")
logger.warning(f"[{task_id}] API timeout, retrying (1/3)")
logger.error(f"[{task_id}] JSON parse error: {e}", exc_info=True)
```

---

## 错误处理流程

### API 调用错误处理

```python
def execute_layer1(distillation: Distillation, db: Session):
    task_id = str(distillation.id)[:8]
    
    try:
        # 更新状态
        distillation.current_layer = "layer1_running"
        db.commit()
        logger.info(f"[{task_id}] Layer 1 started")
        
        # 调用 Claude API (带重试)
        result = call_claude_api_with_retry(distillation.compressed_text)
        
        # 保存结果
        distillation.layer1_result = result
        distillation.current_layer = "layer1_done"
        db.commit()
        logger.info(f"[{task_id}] Layer 1 completed")
        
    except APIError as e:
        # 外部 API 错误
        logger.error(f"[{task_id}] Layer 1 API error: {e}")
        distillation.status = "failed"
        distillation.error_message = f"Claude API 错误: {str(e)}"
        db.commit()
        
    except json.JSONDecodeError as e:
        # JSON 解析错误 (代码 bug)
        logger.error(f"[{task_id}] Layer 1 JSON parse error: {e}", exc_info=True)
        distillation.status = "failed"
        distillation.error_message = f"结果解析失败: {str(e)}"
        db.commit()
        
    except Exception as e:
        # 未知错误
        logger.critical(f"[{task_id}] Layer 1 unexpected error: {e}", exc_info=True)
        distillation.status = "failed"
        distillation.error_message = f"系统错误: {str(e)}"
        db.commit()
```

---

## 任务状态管理

### 状态转换图

```
pending
  ↓
processing (current_layer: compressing)
  ↓
processing (current_layer: layer1_running)
  ↓
processing (current_layer: layer1_done)
  ↓
processing (current_layer: layer2_running)
  ↓
processing (current_layer: layer2_done)
  ↓
processing (current_layer: layer3_running)
  ↓
processing (current_layer: layer3_done)
  ↓
processing (current_layer: generating_report)
  ↓
completed (current_layer: completed)

任何阶段都可能 → failed (current_layer: xxx_failed)
```

### 状态字段说明

| 字段 | 可能值 | 说明 |
|------|--------|------|
| **status** | pending | 任务已创建，等待执行 |
| | processing | 任务执行中 |
| | completed | 任务成功完成 |
| | failed | 任务失败 |
| **current_layer** | null | 尚未开始 |
| | compressing | 正在压缩文本 |
| | layer1_running | Layer 1 执行中 |
| | layer1_done | Layer 1 完成 |
| | layer2_running | Layer 2 执行中 |
| | layer2_done | Layer 2 完成 |
| | layer3_running | Layer 3 执行中 |
| | layer3_done | Layer 3 完成 |
| | layer4_running | Layer 4 执行中 |
| | layer4_done | Layer 4 完成 |
| | generating_report | 生成质量报告中 |
| | completed | 全部完成 |
| | compress_failed | 压缩失败 |
| | layer1_failed | Layer 1 失败 |
| | layer2_failed | Layer 2 失败 |
| | layer3_failed | Layer 3 失败 |
| | layer4_failed | Layer 4 失败 |
| | report_failed | 报告生成失败 |

---

## 前端错误处理

### API 调用错误

```javascript
async function createTask(name, text) {
  try {
    const response = await fetch('/api/distillations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, raw_text: text })
    });
    
    if (!response.ok) {
      // HTTP 错误
      const error = await response.json();
      throw new Error(error.detail || '创建任务失败');
    }
    
    return await response.json();
    
  } catch (error) {
    // 网络错误或其他异常
    console.error('API error:', error);
    message.error(error.message || '网络错误，请稍后重试');
    throw error;
  }
}
```

### 用户友好的错误提示

| 后端错误 | 前端提示 |
|---------|---------|
| 400: 文本长度不足 | "文本长度不足 1000 字，请提供更多内容" |
| 500: 系统错误 | "系统错误，请稍后重试或联系管理员" |
| 网络超时 | "网络连接超时，请检查网络后重试" |
| 任务失败 (error_message) | 直接显示 error_message |

---

## 监控和告警

### 需要监控的指标

1. **任务成功率**: `completed / (completed + failed)` > 95%
2. **平均执行时间**: < 120 秒
3. **API 错误率**: Claude API 调用失败率 < 5%
4. **系统错误数**: 每小时 < 1 次

### 告警规则

| 指标 | 阈值 | 告警级别 |
|------|------|---------|
| 任务成功率 | < 90% | 🔴 严重 |
| 任务成功率 | < 95% | 🟡 警告 |
| 平均执行时间 | > 180 秒 | 🟡 警告 |
| API 错误率 | > 10% | 🔴 严重 |
| 系统错误 | > 5 次/小时 | 🔴 严重 |

### 实现方式 (未来)

```python
# 使用 Prometheus + Grafana
from prometheus_client import Counter, Histogram

task_counter = Counter('mirror_tasks_total', 'Total tasks', ['status'])
task_duration = Histogram('mirror_task_duration_seconds', 'Task duration')

# 记录指标
task_counter.labels(status='completed').inc()
task_duration.observe(duration)
```

---

## 常见错误处理示例

### 1. Claude API 返回非 JSON

**错误**:
```
json.JSONDecodeError: Expecting ',' delimiter: line 13 column 37
```

**原因**: Claude 返回了解释性文字，而不是纯 JSON

**处理**:
```python
# 提取 JSON 代码块
if "```json" in response_text:
    json_text = response_text.split("```json")[1].split("```")[0].strip()
else:
    json_text = response_text.strip()

try:
    result = json.loads(json_text)
except json.JSONDecodeError as e:
    logger.error(f"JSON parse error: {e}\nFull response:\n{response_text}")
    raise
```

### 2. 字段为 None 导致的错误

**错误**:
```
TypeError: 'NoneType' object is not subscriptable
```

**原因**: 访问了可能为 None 的字段

**处理**:
```python
# 错误写法
content = item.get("assumption")[:50]

# 正确写法
content = (item.get("assumption") or "")[:50]
```

### 3. 数据库连接丢失

**错误**:
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) server closed the connection unexpectedly
```

**原因**: 数据库连接超时或服务重启

**处理**:
```python
from sqlalchemy.exc import OperationalError

try:
    db.commit()
except OperationalError as e:
    logger.error(f"Database connection lost: {e}")
    db.rollback()
    # 重新连接
    db = SessionLocal()
    db.commit()
```

### 4. API 超时

**错误**:
```
anthropic.APITimeoutError: Request timed out
```

**原因**: Claude API 响应慢或网络问题

**处理**:
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=10)
)
def call_claude_api(prompt: str) -> dict:
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            timeout=300.0,  # 5 分钟超时
            messages=[{"role": "user", "content": prompt}]
        )
        return response
    except APITimeoutError as e:
        logger.warning(f"API timeout, will retry: {e}")
        raise
```

---

## 错误恢复策略

### 任务失败后如何恢复?

**当前策略**: 不支持自动恢复，用户需要重新创建任务

**未来优化**:
1. 添加"重试"按钮，从失败的层级继续执行
2. 保存中间结果，避免重复计算
3. 实现断点续传

### 服务重启后正在执行的任务怎么办?

**当前策略**: 任务丢失，状态永远停留在 `processing`

**未来优化**:
1. 服务启动时，检查所有 `processing` 状态的任务
2. 标记为 `failed`，错误信息为"服务重启导致任务中断"
3. 或者自动重新执行

---

## 文档维护

**何时更新此文档**:
- 添加新的错误类型
- 修改重试策略
- 改变日志格式
- 发现新的常见错误模式

**不需要更新此文档**:
- 修复具体的 bug（记录到 debug.md）
- 调整日志内容（只要格式不变）
