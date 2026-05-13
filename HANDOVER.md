# Mirror 项目交接文档

**日期**: 2026-05-12  
**状态**: 前端已更新并构建，后端运行中，待测试 JSON 解析修复效果

---

## 当前状态

### 部署信息
- **服务器**: 腾讯云香港 (43.128.11.119)
- **后端**: FastAPI on port 8000, systemd service `mirror-backend.service`
- **前端**: Nginx on port 80, 静态文件在 `/home/ubuntu/mirror/frontend/dist`
- **数据库**: PostgreSQL, 连接信息在 `.env`

### 服务管理命令
```bash
# 后端
sudo systemctl status mirror-backend
sudo systemctl restart mirror-backend
sudo journalctl -u mirror-backend -f  # 查看实时日志

# 前端构建
cd /home/ubuntu/mirror/frontend
npm run build
# 构建后 dist 目录会自动被 Nginx 服务
```

---

## 核心问题：Claude JSON 解析失败

### 问题描述
用户创建任务"毛泽东"后，压缩阶段完成，但 Layer 1 蒸馏失败。数据库显示：
- `status: "failed"`
- `current_layer: "layer1"`
- `error_message: null` (没有记录错误信息)

### 根本原因
Claude API 返回的内容可能包含：
1. Markdown 代码块标记（```json ... ```）
2. 解释性文字
3. 格式不规范的 JSON

导致 `json.loads()` 解析失败，但错误信息没有正确传递到前端和数据库。

### 已完成的修复

#### 1. 后端错误处理增强
**文件**: `/home/ubuntu/mirror/backend/app/services/claude_distiller.py`

在 `extract_layer1()`, `extract_layer2()`, `extract_layer3()` 三个方法中：
- 添加了 `try-except JSONDecodeError` 捕获
- 解析失败时打印：
  - 错误位置（行号、列号）
  - 原始响应前 500 字符
- 抛出 `ValueError` 包含详细错误信息

**关键代码**:
```python
try:
    result = json.loads(content)
except json.JSONDecodeError as e:
    print(f"[ERROR] Layer X JSON 解析失败:")
    print(f"  位置: 第 {e.lineno} 行, 第 {e.colno} 列")
    print(f"  错误: {e.msg}")
    print(f"  原始响应前 500 字符:\n{content[:500]}")
    raise ValueError(f"Layer X JSON 解析失败: {e.msg} (位置: 第 {e.lineno} 行)")
```

#### 2. Prompt 优化
**文件**: 
- `/home/ubuntu/mirror/docs/prompts/layer1.md`
- `/home/ubuntu/mirror/docs/prompts/layer2.md`
- `/home/ubuntu/mirror/docs/prompts/layer3.md`

在"输出格式"部分添加了：
```
**重要：你必须返回严格的 JSON 格式，不要添加任何 markdown 代码块标记（如 ```json），不要添加任何解释性文字。直接输出纯 JSON 对象。**
```

#### 3. 前端错误提示系统
**新文件**: `/home/ubuntu/mirror/frontend/src/utils/api.js`
- 统一的 API 封装
- 自动 toast 错误提示
- 控制台详细日志

**已更新页面**:
- `HomePage.jsx`: 使用 `api.getTasks()`, `api.deleteTask()`
- `UploadPage.jsx`: 使用 `api.createTask()`
- `App.jsx`: 引入 `<Toaster />` 组件

**Toast 配置** (Kenya Hara 配色):
```javascript
<Toaster
  position="top-center"
  toastOptions={{
    duration: 4000,
    success: { duration: 3000, iconTheme: { primary: '#2c2c2c', secondary: '#fff' } },
    error: { duration: 5000, iconTheme: { primary: '#8b0000', secondary: '#fff' } },
    style: { background: '#f5f5f0', color: '#2c2c2c', border: '1px solid #e0e0d8' }
  }}
/>
```

#### 4. 前端已构建
最新构建：commit `ef809ca`
```
dist/index.html: 0.46 kB
dist/assets/index-C48_4XBd.css: 20.00 kB
dist/assets/index-CSRLhAmS.js: 277.05 kB
```

---

## 待完成任务

### 1. 测试 JSON 解析修复 (优先级: 高)
**步骤**:
1. 重启后端服务（加载新的 prompt）:
   ```bash
   sudo systemctl restart mirror-backend
   ```

2. 创建新测试任务（用短文本，避免等太久）

3. 查看实时日志：
   ```bash
   sudo journalctl -u mirror-backend -f
   ```

4. 如果 Layer 1 失败，检查日志中的：
   - `[ERROR] Layer 1 JSON 解析失败` 消息
   - 原始响应前 500 字符
   - 判断是否是 markdown 标记问题

### 2. 如果 Claude 仍返回 markdown 标记
**方案 A**: 在代码中预处理
在 `claude_distiller.py` 的 `extract_layerX()` 方法中，`json.loads()` 之前添加：
```python
# 移除可能的 markdown 代码块标记
content = content.strip()
if content.startswith('```json'):
    content = content[7:]  # 移除开头的 ```json
if content.startswith('```'):
    content = content[3:]   # 移除开头的 ```
if content.endswith('```'):
    content = content[:-3]  # 移除结尾的 ```
content = content.strip()
```

**方案 B**: 使用正则提取
```python
import re
json_match = re.search(r'\{.*\}', content, re.DOTALL)
if json_match:
    content = json_match.group(0)
```

### 3. 完善错误信息传递
**问题**: 当前 `error_message` 字段在失败时仍为 `null`

**检查位置**: `/home/ubuntu/mirror/backend/app/services/distillation_service.py`

在 `process_distillation()` 方法的异常处理中，确保：
```python
except Exception as e:
    db_task.status = "failed"
    db_task.error_message = str(e)  # 确保这行存在
    db.commit()
```

### 4. 更新剩余前端页面
**待更新**:
- `ProgressPage.jsx`: 使用 `api.js` 的方法
- `ResultPage.jsx`: 使用 `api.js` 的方法

**模式参考** `HomePage.jsx`:
```javascript
import { toast } from 'react-hot-toast';
import api from '../utils/api';

// 替换所有 distillationAPI.xxx() 为 api.xxx()
// 删除本地 error state
// 成功操作后添加 toast.success()
```

---

## 数据库快速查询

```bash
# 进入 PostgreSQL
sudo -u postgres psql mirror_db

# 查看所有任务
SELECT id, name, status, current_layer, error_message, created_at 
FROM distillations 
ORDER BY created_at DESC;

# 查看特定任务的详细信息
SELECT * FROM distillations WHERE name = '毛泽东';

# 查看压缩结果
SELECT id, distillation_id, length(compressed_text) as text_length 
FROM contents 
WHERE distillation_id = (SELECT id FROM distillations WHERE name = '毛泽东');

# 退出
\q
```

---

## 调试技巧

### 查看 Claude API 原始响应
在 `claude_distiller.py` 中，每个 `extract_layerX()` 方法都有：
```python
content = response.content[0].text
print(f"[DEBUG] Layer X 原始响应前 200 字符: {content[:200]}")
```

如果需要看完整响应，临时改成：
```python
print(f"[DEBUG] Layer X 完整响应:\n{content}")
```

### Python 缓存问题
如果修改代码后行为没变，清理缓存：
```bash
cd /home/ubuntu/mirror/backend
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete
sudo systemctl restart mirror-backend
```

### 前端调试
1. 打开浏览器 F12 控制台
2. 查看 Network 标签，检查 API 请求/响应
3. 查看 Console 标签，`api.js` 会输出详细错误日志

---

## 架构决策记录

### 四层蒸馏流程
1. **压缩阶段** (10%): Claude Sonnet 4, 提取核心段落
2. **Layer 1** (20%): 提取 Foundational Assumptions
3. **Layer 2** (20%): 提取 Reasoning Patterns
4. **Layer 3** (20%): 提取 Expression Strategies
5. **Layer 4** (30%): 生成认知画像 (Cognitive Profile)

### 数据流
```
用户上传文本 
  → 后台线程启动 
  → 压缩 (compressed_text 存入 contents 表)
  → Layer 1 (layer1_result 存入 distillations 表)
  → Layer 2 (layer2_result 存入 distillations 表)
  → Layer 3 (layer3_result 存入 distillations 表)
  → Layer 4 (layer4_result 存入 distillations 表)
  → 生成质量报告
  → status = "completed"
```

### 技术栈
- **后端**: FastAPI + SQLAlchemy + PostgreSQL + Anthropic SDK
- **前端**: React + Vite + TailwindCSS + react-hot-toast
- **部署**: systemd + Nginx

---

## 联系信息

**项目路径**: `/home/ubuntu/mirror`  
**Git 仓库**: 本地仓库，最新 commit `ef809ca`  
**用户**: Illya (用户744011)

---

## 明天的优先级

1. **测试 JSON 解析修复** - 创建新任务，看 Layer 1 是否成功
2. **如果仍失败** - 查看日志，根据原始响应决定用方案 A 还是 B
3. **完善错误传递** - 确保 `error_message` 字段正确记录
4. **更新剩余前端页面** - ProgressPage 和 ResultPage

**预期结果**: 用户能看到清晰的错误提示（toast + 控制台），开发者能看到 Claude 原始响应用于调试。

---

晚安 Illya，明天继续 💪
