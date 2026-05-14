# Mirror Project - Agent Working Rules

**Last Updated**: 2026-05-14  
**Purpose**: 强制执行的代码修改和调试规范，防止低质量修复和隐性 bug。

---

## Rule 0 — Data First (数据优先)
**任何涉及数据展示的功能，必须先查看真实 API 响应，再写代码。**

**强制要求**：
- 禁止根据"应该有什么字段"去猜测字段名
- 如果用户没有提供真实数据，**主动要求提供**
- 写完代码后，对照真实数据检查每个字段名

**示例**：
- ❌ 错误：看到 `expression_engine.strategies`，就猜测有 `strategy.description` 字段
- ✅ 正确：先 `curl http://localhost:8000/api/distillations/{id} | jq '.cognitive_profile.expression_engine.strategies[0]'`，看到实际字段是 `how` 和 `when_to_use`，再写代码

---

## Rule 1 — Think Before Coding
No silent assumptions. State what you're assuming. Surface tradeoffs. Ask before guessing. Push back when a simpler approach exists.

**Mirror 项目具体要求**：
- 修 bug 前必须回答：这个错误是在哪个执行路径上发生的？
- 看到 `NoneType` 错误时，先问"为什么这个字段会是 None"，而不是直接加 `or ""`
- 如果用户说"前端没反应"，先列出可能的原因（后端挂了？API 返回错误？前端轮询逻辑有问题？），再动手查

---

## Rule 2 — Simplicity First
Minimum code that solves the problem. No speculative features. No abstractions for single-use code. If a senior engineer would call it overcomplicated — simplify.

**Mirror 项目具体要求**：
- 不要为了"可扩展性"添加配置项（除非用户明确要求）
- 不要为了"优雅"重构工作中的代码
- 如果一个函数只被调用一次，不要抽象成通用工具

---

## Rule 3 — Surgical Changes
Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Don't refactor what isn't broken. Match existing style.

**Mirror 项目具体要求**：
- 修 `report_generator.py` 时，只改报错的那几行，不要顺手改其他函数
- 不要删除"看起来没用"的注释或调试代码（除非确认是你自己加的）
- 保持现有的命名风格（`layer1_result` 不要改成 `layer_1_result`）

**判断标准**：
- Git diff 里每一行改动都能直接追溯到用户的请求
- 如果有人问"为什么改这行"，你能立刻回答出来

---

## Git Workflow

**分支策略**：
- `main` 分支：稳定版本，只接受经过验证的代码
- 功能开发：创建 `feature/功能名` 分支
- Bug 修复：创建 `fix/问题描述` 分支

**Commit 规范**：
- 使用清晰的 commit message，说明改了什么和为什么
- 示例：`fix: Layer 4 字段名与 API 响应不匹配`
- 示例：`feat: 添加段落索引颜色编码`

**合并前检查**：
- 前端：`npm run build` 成功
- 后端：所有 API 端点正常响应
- 如果修改了数据展示逻辑，必须用真实数据验证

**回滚策略**：
- 如果修改导致严重 bug，立即 `git revert` 或切回上一个稳定 commit
- 保持 `main` 分支随时可部署

---

## Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified. Don't tell Claude what steps to follow, tell it what success looks like and let it iterate.

**Mirror 项目具体要求**：
- 修 bug 前先定义"怎么算修好了"（例如：任务能跑完 + 前端能看到结果 + 日志没报错）
- 修完后必须验证所有成功标准，不能只验证一部分
- 如果验证失败，回到 Rule 1 重新分析，不要盲目试错

---

## Rule 5 — Use the model only for judgment calls
Use Claude for: classification, drafting, summarization, extraction from unstructured text.  
Do NOT use Claude for: routing, retries, status-code handling, deterministic transforms.  
If a status code already answers the question, plain code answers the question.

**Mirror 项目具体要求**：
- Claude API 只用于三层蒸馏的内容提取，不要用来做数据验证或格式转换
- 错误重试逻辑用 Python 的 `tenacity` 库，不要让 Claude 判断"是否需要重试"
- 如果 API 返回 400，直接记录错误并标记任务失败，不要让 Claude 分析"为什么 400"

---

## Rule 6 — Token budgets are not advisory
Per-task budget: 4,000 tokens.  
Per-session budget: 30,000 tokens.  
If a task is approaching budget, summarize and start fresh. Do not push through.  
Surfacing the breach > silently overrunning.

**Mirror 项目具体要求**：
- 每个蒸馏任务的 prompt 不超过 4,000 tokens（已在代码中硬编码）
- 如果用户输入的文本超过限制，先用 Gemini 压缩，不要直接截断
- 如果 Claude API 返回 token 超限错误，记录到日志并标记任务失败，不要静默重试

---

## Rule 7 — Surface conflicts, don't average them
If two existing patterns in the codebase contradict, don't blend them.  
Pick one (the more recent / more tested), explain why, and flag the other for cleanup.  
"Average" code that satisfies both rules is the worst code.

**Mirror 项目具体要求**：
- 如果发现前端有两种不同的 API 调用方式（例如 `fetch` 和 `axios`），选择更新的那个，并在 debug.md 里记录"旧代码需要清理"
- 如果后端有两种不同的错误处理模式，选择更完善的那个，不要创造第三种

---

## Rule 8 — Read before you write
Before adding code in a file, read the file's exports, the immediate caller, and any obvious shared utilities.  
If you don't understand why existing code is structured the way it is, ask before adding to it.  
"Looks orthogonal to me" is the most dangerous phrase in this codebase.

**Mirror 项目具体要求**：
- 修改 `distillation_engine.py` 前，必须先读 `claude_distiller.py` 和 `report_generator.py`，理解数据流
- 修改 API schema 前，必须先读前端的 API 调用代码，确认前端期望的字段名
- 如果不确定某个函数为什么这样写，先问用户，不要猜测

**强制检查清单**（修改代码前必须完成）：
- [ ] 读过要修改的文件
- [ ] 读过调用这个文件的代码
- [ ] 理解了数据从哪里来、到哪里去
- [ ] 知道为什么现有代码是这样写的

---

## Rule 9 — Tests verify intent, not just behavior
Every test must encode WHY the behavior matters, not just WHAT it does.  
A test like `expect(getUserName()).toBe('John')` is worthless if the function takes a hardcoded ID.  
If you can't write a test that would fail when business logic changes, the function is wrong.

**Mirror 项目具体要求**：
- 测试三层蒸馏时，不要只检查"返回了 JSON"，要检查"JSON 里有 paragraph_index 且格式正确"
- 测试质量报告时，不要只检查"生成了 markdown"，要检查"markdown 里包含了所有必需的章节"
- 如果测试通过了但用户说"结果不对"，说明测试写错了，不是代码写错了

---

## Rule 10 — Checkpoint after every significant step
After completing each step in a multi-step task: summarize what was done, what's verified, what's left.  
Don't continue from a state you can't describe back to me.  
If you lose track, stop and restate.

**Mirror 项目具体要求**：
- 修完一个 bug 后，必须输出：
  ```
  ✅ 已完成：[具体改了什么]
  ✅ 已验证：[怎么确认修好了]
  ⏳ 待处理：[还有什么问题]
  ```
- 如果连续修了 3 个问题还没解决，停下来重新梳理问题，不要继续试错
- 每次重启服务后，必须确认服务启动成功（检查进程、测试 API）

---

## Rule 11 — Match the codebase's conventions, even if you disagree
If the codebase uses snake_case and you'd prefer camelCase: snake_case.  
If the codebase uses class-based components and you'd prefer hooks: class-based.  
Disagreement is a separate conversation. Inside the codebase, conformance > taste.  
If you genuinely think the convention is harmful, surface it. Don't fork it silently.

**Mirror 项目具体要求**：
- 后端用 `snake_case`（`layer1_result`），前端用 `camelCase`（`taskData`），不要混用
- 后端用 SQLAlchemy ORM，不要写原始 SQL（除非性能问题）
- 前端用 React Hooks，不要用 class 组件
- 如果发现现有代码违反了这些规则，记录到 debug.md，不要静默修复

---

## Rule 12 — Fail loud
If you can't be sure something worked, say so explicitly.  
"Migration completed" is wrong if 30 records were skipped silently.  
"Tests pass" is wrong if you skipped any.  
"Feature works" is wrong if you didn't verify the edge case I asked about.  
Default to surfacing uncertainty, not hiding it.

**Mirror 项目具体要求**：
- 如果修改后没有测试，必须说"已修改但未测试"
- 如果只测试了正常情况，必须说"边界情况未验证"
- 如果不确定修复是否会引入新问题，必须说"可能的副作用：[列出来]"

**禁止的表述**：
- ❌ "应该修好了"（要么修好了，要么没修好）
- ❌ "理论上可以工作"（要么测试过，要么没测试过）
- ❌ "前端应该能看到结果了"（要么验证过，要么没验证过）

---

## Mirror 项目特定规则

### 调试流程（强制执行）

**修 bug 前必须做的事**：
1. 读相关文件（`read_file`），不要凭记忆修改
2. 理解执行路径（从用户操作 → 前端 API 调用 → 后端处理 → 数据库 → 返回前端）
3. 定义成功标准（怎么算修好了）

**修 bug 时禁止做的事**：
1. 不准改无关代码（即使"看起来不对"）
2. 不准猜测（不确定就问用户）
3. 不准试错超过 2 次（第 3 次前必须重新分析问题）

**修完后必须验证的事**：
1. 后端日志没有新的错误
2. 前端能正常显示（如果涉及前端）
3. 数据库数据正确（如果涉及数据库）

### 数据流图（必须理解）

```
用户输入文本
  ↓
前端 POST /api/distillations
  ↓
后端创建任务 (status=pending)
  ↓
后台线程启动
  ↓
Gemini 压缩文本 (raw_text → compressed_text)
  ↓
Layer 1: Claude 提取段落索引 (→ layer1_result)
  ↓
Layer 2: Claude 聚类主题 (→ layer2_result)
  ↓
Layer 3: Claude 构建知识图谱 (→ layer3_result)
  ↓
生成质量报告 (→ quality_reports 表)
  ↓
更新任务状态 (status=completed)
  ↓
前端轮询 GET /api/distillations/{id}
  ↓
显示结果
```

**关键字段**：
- `distillations` 表：`id`, `name`, `status`, `current_layer`, `layer1_result`, `layer2_result`, `layer3_result`, `error_message`
- `quality_reports` 表：`distillation_id`, `report_json`, `report_markdown`

### 常见错误模式

1. **`NoneType` 错误**：通常是因为 Claude API 返回的 JSON 缺少某个字段，先检查 prompt 是否明确要求了这个字段
2. **JSON 解析错误**：通常是因为 Claude 返回了非 JSON 内容（例如解释性文字），检查 prompt 是否强调了"只返回 JSON"
3. **前端显示"无"**：通常是因为 API schema 缺少字段，检查 `schemas.py` 的 `DistillationResponse`
4. **任务卡在某一层**：通常是因为后台线程崩溃了，检查 `nohup.out` 日志

---

## 违规处理

如果发现自己违反了上述规则：
1. 立刻停止当前操作
2. 告诉用户"我刚才违反了 Rule X，需要重新来"
3. 回到正确的流程

如果用户发现你违反了规则：
1. 承认错误
2. 解释为什么会违反（是理解错了还是忘记了）
3. 重新按规则执行

---

## 文档使用规则

### 何时阅读文档

**修改代码前必读**：
- `AGENTS.md`（本文件）- 每次修改代码前快速扫一遍相关规则
- `ARCHITECTURE.md` - 第一次接触项目时完整阅读；修改核心流程前重新阅读相关章节
- `ERROR_HANDLING.md` - 修复错误或添加错误处理逻辑时阅读

**不需要每次都读**：
- 如果只是修改一个小 bug（例如修复拼写错误），不需要重新阅读架构文档
- 如果已经理解了数据流，不需要每次都看数据流图

### 何时更新 debug.md

**必须记录**：
- 修复了导致任务失败的 bug
- 修复了导致服务崩溃的 bug
- 发现了代码中的设计缺陷（例如缺少错误处理）

**不需要记录**：
- 调整 UI 样式
- 修改文案
- 添加注释

**记录格式**（参考 debug.md 现有格式）：
```markdown
### Bug: [简短描述]
- **现象**: [用户看到了什么错误]
- **根本原因**: [为什么会出错]
- **解决方案**: [改了什么]
- **影响范围**: [哪些文件/功能受影响]
```

### 何时更新其他文档

- `ARCHITECTURE.md`: 添加新的 API 端点、修改数据库 schema、改变核心架构时
- `ERROR_HANDLING.md`: 添加新的错误类型、修改重试策略时
- `AGENTS.md`: 发现新的常见错误模式、添加新的强制规则时

---

## 文档维护

- 每次发现新的坑，更新"常见错误模式"章节
- 每次修改架构，更新"数据流图"
- 每次添加新功能，更新相关规则的"具体要求"

**这个文件是活的，不是死的。发现规则不够用，立刻补充。**
