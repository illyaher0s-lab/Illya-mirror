# Mirror Project - Architecture Documentation

**Last Updated**: 2026-05-13  
**Purpose**: 系统架构、数据流、关键设计决策的完整说明。

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户浏览器                              │
│                    http://43.128.11.119/                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (80)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Nginx (80)                              │
│  - 静态文件服务: /home/ubuntu/mirror/frontend/dist             │
│  - API 反向代理: /api/* → http://127.0.0.1:8000                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (127.0.0.1:8000)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI 后端 (8000)                          │
│  - 主进程: 处理 HTTP 请求                                       │
│  - 后台线程: 执行蒸馏任务                                       │
│  - systemd 服务: mirror-backend.service                        │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             │ PostgreSQL                    │ HTTPS
             ↓                               ↓
┌────────────────────────┐    ┌──────────────────────────────────┐
│   PostgreSQL (5432)    │    │       外部 API                    │
│  - distillations 表    │    │  - Anthropic Claude API          │
│  - contents 表         │    │  - Google Gemini API             │
│  - quality_reports 表  │    │                                  │
└────────────────────────┘    └──────────────────────────────────┘
```

---

## 数据流图

### 完整蒸馏流程

```
用户上传文本 (raw_text)
  ↓
前端 POST /api/distillations
  ↓
后端创建任务记录
  - status: pending
  - current_layer: null
  ↓
后台线程启动 (distillation_engine.py)
  ↓
【阶段 0: 文本压缩】
Gemini 2.0 Flash API
  - 输入: raw_text (可能很长)
  - 输出: compressed_text (压缩到 4000 tokens 以内)
  - 保存到: distillations.compressed_text
  - 状态: current_layer = "compressing"
  ↓
【阶段 1: 段落索引提取】
Claude Sonnet 4 API
  - 输入: compressed_text
  - 输出: paragraph_index (JSON)
    {
      "paragraph_index": [...],
      "extraction_notes": "...",
      "foundational_assumptions": [...]
    }
  - 保存到: distillations.layer1_result
  - 状态: current_layer = "layer1_running" → "layer1_done"
  ↓
【阶段 2: 主题聚类】
Claude Sonnet 4 API
  - 输入: paragraph_index (只传索引，不传压缩文本)
  - 输出: theme_clusters (JSON)
    {
      "theme_clusters": [...],
      "cross_references": [...],
      "meta_patterns": [...]
    }
  - 保存到: distillations.layer2_result
  - 状态: current_layer = "layer2_running" → "layer2_done"
  ↓
【阶段 3: 知识图谱构建】
Claude Sonnet 4 API
  - 输入: paragraph_index (只传索引)
  - 输出: knowledge_graph (JSON)
    {
      "knowledge_graph": {...},
      "cognitive_strategies": [...],
      "implicit_rules": [...],
      "decision_frameworks": [...]
    }
  - 保存到: distillations.layer3_result
  - 状态: current_layer = "layer3_running" → "layer3_done"
  ↓
【阶段 4: 认知画像生成】
Claude Sonnet 4 API
  - 输入: layer1_result + layer2_result + layer3_result
  - 输出: cognitive_profile (JSON)
    {
      "identity": {...},
      "core_assumptions": [...],
      "reasoning_patterns": [...],
      "expression_strategies": [...],
      "system_integration": {...}
    }
  - 保存到: distillations.layer4_result
  - 状态: current_layer = "layer4_running" → "layer4_done"
  ↓
【阶段 5: 质量评估】
quality_evaluator.py
  - 检测坏案例 (detect_bad_cases)
  - 计算置信度分数 (calculate_confidence_scores)
  - 生成整体评分 (generate_overall_score)
  - 输出: quality_data (dict)
  ↓
【阶段 6: 报告生成】
report_generator.py
  - 输入: layer1/2/3_result + quality_data
  - 输出:
    - report_json (完整数据)
    - report_markdown (可读报告)
  - 保存到: quality_reports 表
  ↓
更新任务状态
  - status: completed
  - current_layer: "completed"
  ↓
前端轮询 GET /api/distillations/{id}
  - 获取三层结果 + 质量报告
  - 渲染到页面
```

---

## 数据库 Schema

### distillations 表
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✓ |
| name | String | 任务名称 | ✓ |
| status | String | 任务状态: pending/processing/completed/failed | ✓ |
| current_layer | String | 当前执行阶段: compressing/layer1_running/layer1_done/... | |
| raw_text | Text | 用户上传的原始文本 | ✓ |
| compressed_text | Text | Gemini 压缩后的文本 | |
| layer1_result | JSONB | Layer 1 输出 (paragraph_index) | |
| layer2_result | JSONB | Layer 2 输出 (theme_clusters) | |
| layer3_result | JSONB | Layer 3 输出 (knowledge_graph) | |
| layer4_result | JSONB | Layer 4 输出 (cognitive_profile) | |
| quality_score | String | 质量评分 (A+/A/B/C) | |
| error_message | Text | 错误信息 (失败时记录) | |
| created_at | DateTime | 创建时间 | ✓ |
| updated_at | DateTime | 更新时间 | ✓ |

### contents 表
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✓ |
| distillation_id | UUID | 外键 → distillations.id | ✓ |
| layer | Integer | 层级 (1/2/3) | ✓ |
| content_type | String | 内容类型 (paragraph/theme/node) | ✓ |
| content_data | JSONB | 具体内容 | ✓ |
| created_at | DateTime | 创建时间 | ✓ |

**注意**: 当前版本未使用此表，所有结果直接存在 `distillations` 表的 JSONB 字段中。

### quality_reports 表
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✓ |
| distillation_id | UUID | 外键 → distillations.id | ✓ |
| report_json | JSONB | 完整质量数据 (JSON 格式) | ✓ |
| report_markdown | Text | 可读报告 (Markdown 格式) | ✓ |
| created_at | DateTime | 创建时间 | ✓ |

### cognitive_profiles 表
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✓ |
| distillation_id | UUID | 外键 → distillations.id | ✓ |
| profile_data | JSONB | 认知画像数据 | ✓ |
| created_at | DateTime | 创建时间 | ✓ |

**注意**: 当前版本未实现认知画像功能。

---

## API 端点

### POST /api/distillations
**功能**: 创建新的蒸馏任务

**请求体**:
```json
{
  "name": "任务名称",
  "raw_text": "用户上传的文本内容"
}
```

**响应**:
```json
{
  "id": "uuid",
  "name": "任务名称",
  "status": "pending",
  "current_layer": null,
  "created_at": "2026-05-13T14:00:00Z",
  "updated_at": "2026-05-13T14:00:00Z"
}
```

### GET /api/distillations/{id}
**功能**: 查询任务状态和结果

**响应**:
```json
{
  "id": "uuid",
  "name": "任务名称",
  "status": "completed",
  "current_layer": "completed",
  "quality_score": "A",
  "error_message": null,
  "layer1_result": { ... },
  "layer2_result": { ... },
  "layer3_result": { ... },
  "layer4_result": { ... },
  "created_at": "2026-05-13T14:00:00Z",
  "updated_at": "2026-05-13T14:01:30Z"
}
```

### GET /api/distillations/{id}/report
**功能**: 获取质量报告

**响应**:
```json
{
  "report_markdown": "# 质量报告\n\n...",
  "report_json": { ... }
}
```

### GET /api/distillations/{id}/export
**功能**: 导出第四层（认知画像）结果

**参数**:
- `format`: 导出格式 (json, yaml, markdown)

**响应**:
- `json`: 返回 JSON 格式的 layer4_result
- `yaml`: 返回 YAML 格式的 layer4_result
- `markdown`: 返回可读的 Markdown 格式

---

## 关键设计决策

### 1. 为什么用两阶段蒸馏 (Gemini + Claude)?

**问题**: 用户上传的文本可能很长 (10万字+)，直接发给 Claude 会超过 token 限制。

**方案**:
- **阶段 0**: Gemini 2.0 Flash 压缩文本到 4000 tokens 以内
  - 优点: Gemini 便宜、速度快、长文本处理能力强
  - 缺点: 质量不如 Claude
- **阶段 1-3**: Claude Sonnet 4 执行三层蒸馏
  - 优点: 质量高、理解能力强
  - 缺点: 贵、慢

**权衡**: 用 Gemini 做"脏活"（压缩），用 Claude 做"精细活"（提取知识）。

### 2. 为什么 Layer 2/3 只传 paragraph_index?

**问题**: 如果每层都传完整的压缩文本，会浪费大量 tokens。

**方案**:
- Layer 1 输出 `paragraph_index`（段落索引 + 简短摘要）
- Layer 2/3 只接收 `paragraph_index`，不接收 `compressed_text`
- 通过索引引用段落，而不是重复传递文本

**优点**:
- 节省 tokens（每层节省约 3000 tokens）
- 强制 Layer 2/3 基于结构化数据工作，而不是重新阅读原文

**缺点**:
- 如果 Layer 1 提取的索引不够好，Layer 2/3 质量会下降

### 3. 为什么用后台线程而不是 Celery?

**问题**: 蒸馏任务耗时长 (1-2 分钟)，不能阻塞 HTTP 请求。

**方案**:
- 使用 Python 的 `threading.Thread` 在后台执行任务
- 主进程立刻返回任务 ID
- 前端轮询任务状态

**为什么不用 Celery**:
- 项目规模小，不需要分布式任务队列
- 避免引入 Redis/RabbitMQ 等额外依赖
- 单机部署足够用

**缺点**:
- 服务重启时，正在执行的任务会丢失
- 无法水平扩展（多台服务器）

**未来优化**: 如果任务量大，可以迁移到 Celery。

### 4. 为什么质量报告单独存一张表?

**问题**: 质量报告数据量大 (可能 10KB+)，如果存在 `distillations` 表会拖慢查询。

**方案**:
- `distillations` 表只存核心字段 (status, current_layer, quality_score)
- `quality_reports` 表存完整报告 (report_json, report_markdown)
- 按需加载报告（用户点击"查看报告"时才查询）

**优点**:
- 列表页查询快（不加载报告数据）
- 详情页按需加载

### 5. 为什么用 JSONB 而不是关系型表?

**问题**: Layer 1/2/3 的输出结构复杂且不固定，用关系型表很难建模。

**方案**:
- 使用 PostgreSQL 的 JSONB 类型存储三层结果
- 保持灵活性（未来可以调整输出结构）
- 支持 JSON 查询（例如 `layer1_result->'paragraph_index'`）

**缺点**:
- 无法用 SQL 做复杂的关联查询
- 数据完整性依赖应用层代码

**权衡**: 当前阶段灵活性 > 查询能力。

---

## 技术栈

### 后端
- **框架**: FastAPI 0.104.1
- **数据库**: PostgreSQL 14
- **ORM**: SQLAlchemy 2.0
- **异步**: threading (标准库)
- **API 客户端**: anthropic, google-generativeai

### 前端
- **框架**: React 18
- **构建工具**: Vite 5
- **UI 库**: Ant Design (antd)
- **HTTP 客户端**: fetch (原生)

### 部署
- **服务器**: 腾讯云 Ubuntu 22.04
- **Web 服务器**: Nginx 1.18
- **进程管理**: systemd
- **日志**: /var/log/mirror-backend.log

---

## 性能指标

### 单任务耗时 (估算)
- Gemini 压缩: 10-20 秒
- Layer 1: 20-30 秒
- Layer 2: 15-25 秒
- Layer 3: 20-30 秒
- Layer 4: 25-35 秒
- 质量报告: 5-10 秒
- **总计**: 95-150 秒 (约 1.5-2.5 分钟)

### Token 消耗 (估算)
- Gemini 压缩: 输入 10,000 tokens → 输出 4,000 tokens
- Layer 1: 输入 4,000 tokens → 输出 1,500 tokens
- Layer 2: 输入 1,500 tokens → 输出 1,000 tokens
- Layer 3: 输入 1,500 tokens → 输出 1,200 tokens
- Layer 4: 输入 3,700 tokens → 输出 1,500 tokens
- **总计**: 约 30,400 tokens/任务

### 成本估算 (基于 API 定价)
- Gemini 2.0 Flash: $0.10 / 1M tokens
- Claude Sonnet 4: $3.00 / 1M input tokens, $15.00 / 1M output tokens
- **单任务成本**: 约 $0.18-0.25

---

## 扩展性考虑

### 当前限制
- **并发任务数**: 受限于单机 CPU/内存（建议不超过 10 个并发任务）
- **文本长度**: 原始文本建议不超过 20 万字（Gemini 压缩能力上限）
- **存储**: PostgreSQL 单表 JSONB 字段，建议单条记录不超过 1MB

### 未来优化方向
1. **任务队列**: 迁移到 Celery + Redis，支持分布式执行
2. **缓存**: 添加 Redis 缓存，减少数据库查询
3. **CDN**: 前端静态资源上 CDN，加速访问
4. **监控**: 添加 Prometheus + Grafana，实时监控任务状态
5. **日志**: 迁移到 ELK Stack，集中式日志管理

---

## 安全性

### 当前措施
- **API 访问**: 无认证（仅内网访问）
- **输入验证**: FastAPI 自动验证请求体
- **SQL 注入**: 使用 ORM，无原始 SQL
- **XSS**: 前端使用 React，自动转义

### 待加强
- [ ] 添加用户认证 (JWT)
- [ ] 添加 API 限流 (防止滥用)
- [ ] 添加敏感信息过滤 (防止用户上传密码等)
- [ ] HTTPS 支持 (当前只有 HTTP)

---

## 故障恢复

### 服务挂了怎么办?
1. 检查服务状态: `sudo systemctl status mirror-backend`
2. 查看错误日志: `tail -f /var/log/mirror-backend-error.log`
3. 重启服务: `sudo systemctl restart mirror-backend`
4. 如果还不行，检查数据库: `sudo systemctl status postgresql`

### 任务卡住了怎么办?
1. 查询任务状态: `curl http://127.0.0.1:8000/api/distillations/{id}`
2. 检查后端日志: `tail -f /var/log/mirror-backend.log`
3. 如果是 API 超时，等待任务自动失败 (timeout: 300 秒)
4. 如果是死锁，重启服务

### 数据库满了怎么办?
1. 清理旧任务: `DELETE FROM distillations WHERE created_at < NOW() - INTERVAL '30 days'`
2. 清理孤立报告: `DELETE FROM quality_reports WHERE distillation_id NOT IN (SELECT id FROM distillations)`
3. 压缩数据库: `VACUUM FULL`

---

## 文档维护

**何时更新此文档**:
- 添加新的 API 端点
- 修改数据库 schema
- 改变核心架构（例如引入 Celery）
- 发现重要的性能瓶颈或优化方案

**不需要更新此文档**:
- 修复 bug（记录到 debug.md）
- 调整 prompt（记录到代码注释）
- 小的代码重构
