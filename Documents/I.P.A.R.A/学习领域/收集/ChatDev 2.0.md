---
createTime: 2026-05-27 10:44
笔记ID: 20260527104442
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - AI
  - Agent
  - ChatDev
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

# ChatDev 2.0 部署笔记

```meta-bind-embed
[[笔记抬头模块]]
```


> 零代码多智能体平台 - 用于开发一切

---

## 项目信息

- 仓库：https://github.com/OpenBMB/ChatDev
- 位置：`/home/yuan/ChatDev`
- 部署日期：2026-05-15

---

## 环境要求

| 组件 | 版本要求 | 实际安装版本 |
|------|---------|-------------|
| Python | 3.12.x | 3.12.13 |
| Node.js | 18+ | v22.12.0 |
| npm | - | 10.9.0 |
| uv | - | 0.11.7 |

---

## 部署步骤

### 1. 环境准备

```bash
# 安装 Python 3.12（Ubuntu/Debian）
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 uv 包管理器
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.cargo/env
```

### 2. 克隆项目

```bash
cd ~
git clone https://github.com/OpenBMB/ChatDev.git
cd ChatDev
git checkout main
```

### 3. 安装后端依赖

```bash
cd ~/ChatDev
uv sync
```

已安装 149 个包，包括：
- fastapi, uvicorn, websockets
- openai, pydantic, numpy, pandas
- faiss-cpu, matplotlib, networkx

### 4. 安装前端依赖

```bash
cd ~/ChatDev/frontend
npm install
```

已安装 167 个包。

### 5. 配置 API 密钥

```bash
cd ~/ChatDev
cp .env.example .env
nano .env
```

**当前配置（MiniMax）：**
```env
BASE_URL=https://api.minimaxi.com/v1
API_KEY=sk-cp-fd4xX34VKhKwvjSw2i9P3jewxgpNhPLwRHgmSX2OSdXQ7lu5nzRb4mfjq-3DUvCK3NCDoeZqdRDmt__HzyieWVJFiNsOBWFZkPmlGnWp_YwuS2wA9m6ADb4
```

### 6. 启动服务

**方式一：使用 Makefile（推荐）**
```bash
cd ~/ChatDev
make dev
```

**方式二：分别启动**

终端 1 - 后端：
```bash
cd ~/ChatDev
uv run python server_main.py --port 6400
```

终端 2 - 前端：
```bash
cd ~/ChatDev/frontend
npx cross-env VITE_API_BASE_URL=http://localhost:6400 npm run dev
```

---

## 服务信息

| 服务 | 端口 | 访问地址 |
|------|------|---------|
| 前端 | 5173 | http://localhost:5173 |
| 后端 | 6400 | http://localhost:6400 |

远程访问：`http://<服务器IP>:5173`

---

## 项目结构

```
/home/yuan/ChatDev/
├── frontend/          # 前端（Vue 3 + Vite）
├── server/            # 后端 API
├── workflow/          # 工作流定义
├── yaml_template/     # YAML 模板
├── yaml_instance/     # YAML 实例
├── server_main.py     # 后端入口
├── run.py             # CLI 入口
├── pyproject.toml     # Python 依赖配置
├── .env               # 环境变量配置
└── Makefile           # 构建脚本
```

---

## 常用命令

### 服务管理

```bash
# 检查端口占用
lsof -i :6400
lsof -i :5173

# 停止服务
cd ~/ChatDev
make stop

# 或手动终止
npx kill-port 6400 5173

# 重启服务
make dev
```

### Makefile 命令

| 命令 | 说明 |
|------|------|
| `make dev` | 同时启动前后端 |
| `make server` | 仅启动后端 |
| `make client` | 仅启动前端 |
| `make stop` | 停止所有服务 |
| `make help` | 查看所有命令 |
| `make sync` | 同步 Vue 图表到服务器数据库 |
| `make validate-yamls` | 验证 YAML 配置文件 |

---

## 配置说明

### .env 环境变量

| 变量 | 说明 |
|------|------|
| `BASE_URL` | LLM API 地址 |
| `API_KEY` | LLM API 密钥 |
| `SERPER_DEV_API_KEY` | Serper 搜索 API（可选） |
| `JINA_API_KEY` | Jina API（可选） |

### 支持的 LLM 提供商

| 提供商 | BASE_URL |
|--------|----------|
| OpenAI | `https://api.openai.com/v1` |
| Gemini | `https://generativelanguage.googleapis.com` |
| MiniMax | `https://api.minimaxi.com/v1` |
| LM Studio | `http://localhost:1234/v1` |
| Ollama | `http://localhost:11434/v1` |

---

## 使用指南

### 基本流程

1. 打开浏览器访问 http://localhost:5173
2. 创建新的工作流项目
3. 配置智能体和工作流
4. 执行任务并监控进度

### CLI 模式

```bash
cd ~/ChatDev
python run.py --task "你的任务描述"
```

### YAML 配置

项目使用 YAML 文件配置工作流和智能体：
- `yaml_template/` - 模板定义
- `yaml_instance/` - 实例配置

---

## 故障排查

| 问题 | 解决方法 |
|------|---------|
| 端口已被占用 | `npx kill-port 6400 5173` |
| uv: command not found | `source ~/.cargo/env` |
| 前端无法连接后端 | 检查 `VITE_API_BASE_URL` 设置 |
| API 调用失败 | 检查 `.env` 中的 API_KEY 和 BASE_URL |

---

## 研发闭环 Agent 配置

### 概述

为 ChatDev 2.0 设计了三个专业 AI Agent，形成全自动研发闭环：

```
用户需求 → 可研分析Agent → 产品设计Agent → 开发交付Agent → 交付物
```

### Agent 配置文件

| Agent | 配置文件 | 大小 |
|-------|---------|------|
| 可研分析Agent | `yaml_instance/rd闭环_可研分析Agent.yaml` | 7.9K |
| 产品设计Agent | `yaml_instance/rd闭环_产品设计Agent.yaml` | 14K |
| 开发交付Agent | `yaml_instance/rd闭环_开发交付Agent.yaml` | 17K |
| 研发全流程（串联） | `yaml_instance/rd闭环_研发全流程.yaml` | 22K |
| **FullAutoRD-DAG（全自动工作流）** | `yaml_instance/FullAutoRD-DAG.yaml` | **40K** |

### FullAutoRD-DAG 全自动研发闭环工作流

**文件：** `yaml_instance/FullAutoRD-DAG.yaml`（40K，1177行）

#### 工作流结构

```
用户需求
    ↓
┌─────────────────────────────────────────┐
│  节点1: feasibility_agent (可研分析)       │
│  - 市场/技术可行性分析                     │
│  - SWOT、风险评估、技术选型                │
│  - 超时: 300s | 重试: 3次                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点2: human_review_feasibility (审核)   │
│  - 人工审核可行性报告                     │
│  - 通过/驳回/终止                         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点3: product_design_agent (产品设计)   │
│  - 功能规格、用户故事                     │
│  - Mermaid 流程图、页面交互               │
│  - 超时: 300s | 重试: 3次                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点4: human_review_product_design (审核) │
│  - 人工审核产品设计                       │
│  - 通过/驳回/终止                         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点5: developer_agent (开发交付)         │
│  - 任务拆解、代码生成                     │
│  - Python/Java/React 示例代码             │
│  - 超时: 300s | 重试: 3次                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点6: human_review_delivery (审核)       │
│  - 人工审核最终交付                       │
│  - 接受/要求返工/终止                     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  节点7: final_summary (最终汇总)           │
│  - 整合三阶段输出                         │
│  - 生成完整项目交付报告                   │
└─────────────────────────────────────────┘
    ↓
项目交付报告
```

#### 节点配置详情

| 节点 ID | 类型 | 说明 | 超时 | 重试 |
|---------|------|------|------|------|
| `feasibility_agent` | agent | 可研分析 | 300s | 3次 |
| `human_review_feasibility` | human | 可研审核点 | 3600s | - |
| `product_design_agent` | agent | 产品设计 | 300s | 3次 |
| `human_review_product_design` | human | 产品设计审核点 | 3600s | - |
| `developer_agent` | agent | 开发交付 | 300s | 3次 |
| `human_review_delivery` | human | 最终交付审核 | 3600s | - |
| `final_summary` | agent | 最终汇总 | 300s | 3次 |

#### 边（Edges）配置

| 边 | 触发条件 | 说明 |
|----|---------|------|
| feasibility → 审核 | 包含 "GO" 或 "CONDITIONAL" | NO_GO 则终止 |
| 审核通过 → 产品设计 | 包含 "通过/approved/pass" | 排除驳回/终止 |
| 产品设计 → 审核 | 自动 | |
| 审核通过 → 开发 | 包含 "通过/approved/pass" | 排除驳回/终止 |
| 开发 → 审核 | 自动 | |
| 审核通过 → 汇总 | 包含 "接受/approved/accept" | 排除终止 |
| 自循环边 | `code_fail` | 错误时自动重试 |

#### 质量门禁（Quality Gates）

| 阶段 | 必须包含的内容 |
|------|--------------|
| 可研分析 | market_analysis, technical_analysis, risk_assessment, go_decision |
| 产品设计 | feature_specs, user_flows, mermaid_diagrams, development_tasks |
| 开发交付 | task_breakdown, code_files, test_cases, delivery_checklist |

#### 人工审核点说明

1. **human_review_feasibility**：审核可行性报告，决定是否进入产品设计阶段
2. **human_review_product_design**：审核产品设计文档，决定是否进入开发阶段
3. **human_review_delivery**：审核最终交付物，确认交付完成

每个审核点支持三种操作：通过、驳回（需说明问题）、终止（终止整个项目）

---

### 使用方法

1. **单独使用某个Agent**：
   ```bash
   cd ~/ChatDev
   python run.py --config rd闭环_可研分析Agent --task "开发一个AI客服系统"
   ```

2. **使用完整研发闭环（无人工审核）**：
   ```bash
   cd ~/ChatDev
   python run.py --config rd闭环_研发全流程 --task "开发一个AI客服系统"
   ```

3. **使用 FullAutoRD-DAG（全自动工作流 + 人工审核）**：
   ```bash
   cd ~/ChatDev
   python run.py --config FullAutoRD-DAG --task "开发一个AI客服系统"
   ```

4. **通过 Web UI**：
   - 访问 http://localhost:5173
   - 选择对应的 YAML 配置文件
   - 输入任务描述

---

### 1. 可研分析Agent（Feasibility Analyst）

**职责**：市场/技术可行性分析、SWOT、风险评估、技术选型

**输入**：用户需求描述
```json
{"user_requirement": "产品需求描述", "budget_range": "预算", "timeline": "周期"}
```

**输出**：结构化可行性报告
```json
{
  "report_id": "FEAS-20260515-001",
  "market_feasibility": {"market_size": "...", "competitors": [...]},
  "technical_feasibility": {"core_challenges": [...], "technology_stack_recommendation": {...}},
  "swot_analysis": {"strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...]},
  "risk_assessment": {"high_risks": [...], "medium_risks": [...], "low_risks": [...]},
  "go_no_go_recommendation": {"decision": "GO/CONDITIONAL", "confidence": 0.85}
}
```

**协作**：输出传递给产品设计Agent

---

### 2. 产品设计Agent（Product Designer）

**职责**：产品原型设计、功能规格、用户流程（Mermaid）、交互逻辑

**输入**：可行性分析报告
```json
{
  "feasibility_report": "<JSON报告>",
  "approved_features": ["功能列表"],
  "technical_constraints": ["技术约束"]
}
```

**输出**：产品设计文档
```json
{
  "document_id": "PRD-20260515-001",
  "product_overview": {"product_name": "...", "core_value_proposition": "..."},
  "feature_specifications": [{
    "feature_id": "F001",
    "feature_name": "功能名",
    "user_stories": [{"story_id": "US001", "as_a": "角色", "i_want_to": "行为", "so_that": "价值"}],
    "functional_requirements": [...]
  }],
  "user_flows": [{
    "flow_id": "UF001",
    "flow_name": "流程名",
    "mermaid_diagram": "flowchart TD\n  A[用户] --> B[操作]..."
  }],
  "page_wireframes": [...],
  "data_models": [...],
  "api_contracts": [...],
  "development_tasks": [...]
}
```

**协作**：输出传递给开发交付Agent

---

### 3. 开发交付Agent（Developer）

**职责**：任务拆解、代码生成（含注释）、单元测试、交付物清单

**输入**：产品设计文档
```json
{
  "product_design_doc": "<JSON文档>",
  "development_tasks": [{"task_id": "T001", "task_name": "任务", "priority": "P0"}]
}
```

**输出**：交付文档
```json
{
  "delivery_id": "DELIVERY-20260515-001",
  "task_breakdown": [{
    "task_id": "T001",
    "task_name": "任务名",
    "status": "done",
    "deliverables": [{"type": "code", "path": "src/api/user.py", "language": "python"}]
  }],
  "code_generation": [{
    "file_path": "src/api/user.py",
    "language": "python",
    "framework": "FastAPI",
    "code": "# 完整代码...",
    "annotations": {"class_UserService": "用户服务类"},
    "test_cases": [{"test_name": "test_create_user", "assertions": [...]}]
  }],
  "delivery_summary": {
    "total_tasks": 12,
    "completed_tasks": 8,
    "total_files": 25,
    "code_lines": 3500,
    "test_coverage": "82%"
  }
}
```

---

### 使用方法

1. **单独使用某个Agent**：
   ```bash
   cd ~/ChatDev
   python run.py --config rd闭环_可研分析Agent --task "开发一个AI客服系统"
   ```

2. **使用完整研发闭环**：
   ```bash
   cd ~/ChatDev
   python run.py --config rd闭环_研发全流程 --task "开发一个AI客服系统"
   ```

3. **通过 Web UI**：
   - 访问 http://localhost:5173
   - 选择对应的 YAML 配置文件
   - 输入任务描述

---

## 资源链接

- 官方文档：https://github.com/OpenBMB/ChatDev
- 中文 README：https://github.com/OpenBMB/ChatDev/blob/main/README-zh.md
- ChatDev 1.0（经典版）：https://github.com/OpenBMB/ChatDev/tree/chatdev1.0

---

## 备注

- ChatDev 2.0 是零代码多智能体平台，不同于 1.0 的虚拟软件公司模式
- 项目使用 Python 3.12 严格版本控制（`>=3.12,<3.13`）
- 前端使用 Vue 3 + Vite，后端使用 FastAPI
- 支持多种 LLM 提供商，通过 OpenAI 兼容 API
- 三个 Agent 形成完整的研发闭环：分析→设计→开发