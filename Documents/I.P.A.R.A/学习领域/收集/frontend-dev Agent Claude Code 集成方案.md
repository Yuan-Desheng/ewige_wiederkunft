---
createTime: 2026-04-06 23:28
笔记ID: 20260406232855
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - claude-code
  - Agent
  - 前端
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/OpenClaw.canvas|OpenClaw]]"
---

##  frontend-dev Agent Claude Code 集成方案
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

> 本文档记录 frontend-dev agent 的改造内容、工作流程、以及如何通过 OpenClaw 操作 Claude Code。

---

## 一、整体架构

```
用户 → OpenClaw (frontend-dev agent) → tmux session (claude-dev) → Claude Code
```

- **OpenClaw**：负责理解需求、调度任务，不阻塞
- **tmux**：Claude Code 的运行环境，作为中间层实现非阻塞调用
- **Claude Code**：实际执行代码生成的 agent

---

## 二、tmux Session 准备

### Session 名称
`claude-dev`

### 启动命令
```bash
tmux new-session -d -s claude-dev "cd ~/code/smart_vision/global-sentiment/global-sentiment-web && claude"
```

### 基本操作
```bash
tmux attach-session -t claude-dev    # 进入 tmux 界面（按 Ctrl+B then d 退出）
tmux list-sessions                   # 查看所有 session
tmux kill-session -t claude-dev      # 终止 session
```

以下命令附加到 Claude Code 的会话：

tmux attach-session -t claude-dev

  
查看完成后，按 Ctrl+B 然后按 d 分离会话返回。

其他常用 tmux 命令：

|操作|命令|
|---|---|
|查看所有会话|tmux list-sessions|
|附加到 Claude Code|tmux attach-session -t claude-dev|
|分离会话|Ctrl+B 然后按 d|
|查看会话输出（不附加）|tmux capture-pane -t claude-dev -p \| tail -50|

---

## 三、Claude Code 日常操作

### 发送任务
```bash
tmux send-keys -t claude-dev "【任务描述】" Enter
```

### 查看输出
```bash
tmux capture-pane -t claude-dev -p | tail -30
```

### 等待并查看（推荐组合）
```bash
sleep 10 && tmux capture-pane -t claude-dev -p | tail -40
```

### 处理确认提示
Claude Code 遇到需要确认的情况（Do you want to proceed? / Y/n）：
```bash
tmux send-keys -t claude-dev "1" Enter   # 选第一项
tmux send-keys -t claude-dev "y" Enter   # 确认
tmux send-keys -t claude-dev Enter       # 直接回车确认
```

### 常见状态判断
| 界面状态 | 含义 |
|---------|------|
| `❯` | 空闲，可发新任务 |
| `⏳ / spinning` | 正在思考/执行 |
| `Do you want to proceed?` | 等待确认 |
| `Proceed?` | 等待确认，输入 y |
| `Done` | 任务完成 |

### 终止正在执行的任务
```bash
tmux send-keys -t claude-dev C-c   # Ctrl+C
```

---

## 四、/init 初始化流程

Claude Code 的 `/init` 命令用于为新项目生成 "CLAUDE.md" 说明书，避免每次重复解释项目基本信息。

### 完整执行流程
```bash
# 1. 重启 Claude Code session
tmux kill-session -t claude-dev
tmux new-session -d -s claude-dev "cd 【项目路径】 && claude"
sleep 5

# 2. 确认权限（选 1）
tmux send-keys -t claude-dev "1" Enter
sleep 5

# 3. 发送 /init
tmux send-keys -t claude-dev "/init" Enter
sleep 10

# 4. 查看状态，等待确认提示后批复
tmux capture-pane -t claude-dev -p | tail -30
# 如果出现 "Do you want to create CLAUDE.md?" → 选 1

# 5. 批复确认
tmux send-keys -t claude-dev "1" Enter
sleep 10

# 6. 验证文件
ls -lh 【项目路径】/CLAUDE.md
```

---

## 五、frontend-dev Agent 配置

### 配置文件路径
```
~/.openclaw/frontend-dev/SOUL.md      # agent 角色定义 + 核心 delegation 原则
~/.openclaw/frontend-dev/TOOLS.md    # tmux 工作流规范 + 任务格式要求
~/.openclaw/frontend-dev/MEMORY.md    # 长期记忆（项目路径 + 常用命令）
```

### SOUL.md 核心原则
- **收到代码修改任务 → 立即通过 tmux 发给 Claude Code 执行**
- 绝对不自己用 write/edit 生成代码
- Claude Code 是执行者，frontend-dev 是指挥官

### TOOLS.md 规范流程
```
第一步：发送任务
tmux send-keys -t claude-dev "【任务描述】" Enter

第二步：等待 Claude Code 响应
sleep 8

第三步：查看输出
tmux capture-pane -t claude-dev -p | tail -50

第四步：如果需要确认，批复
tmux send-keys -t claude-dev "y" Enter

第五步：继续等待直到完成
```

### 发送给 Claude Code 的任务格式
必须包含：
1. **文件路径**（精确到文件）
2. **期望行为**（要实现什么功能）
3. **约束条件**（可选，如"不要改其他部分"）

示例：
```
请修改 ~/code/smart_vision/vpp/vpp-tov/src/views/ScenarioConfig.vue
在日期选择器下方添加一个"实时天气预览"区域，
调用 /api/weather 接口，UI 参考 ElCard 样式。
不要修改其他已存在的组件。
```

---

## 六、完整工作流示例

### 场景：让 Claude Code 修改一个组件

```bash
# 1. 发任务
tmux send-keys -t claude-dev "请修改 src/components/UserKpiBar.vue，在每个 KPI 项添加 el-tooltip 支持" Enter

# 2. 等待 Claude Code 分析
sleep 10

# 3. 查看输出
tmux capture-pane -t claude-dev -p | tail -40

# 4. 如果 Claude Code 在等待确认（如 permission 提示）
tmux send-keys -t claude-dev "1" Enter

# 5. 继续等待
sleep 10
tmux capture-pane -t claude-dev -p | tail -40

# 6. 确认文件已修改
ls -la src/components/UserKpiBar.vue
```

---

## 七、项目路径速查

| 项目 | 路径 | 说明 |
|------|------|------|
| **前台页面** | `~/code/smart_vision/global-sentiment/global-sentiment-web/` | 海外社交媒体传播动态分析系统，Vue 3 + TS，CLAUDE.md 已生成 |
| **后台页面** | `~/code/smart_vision/global-sentiment/global-sentiment-admin/` | 管理端界面 |
| **爬虫程序** | `~/code/smart_vision/global-sentiment/tik-hub/` | TikTok/社交媒体数据爬取服务 |
| 协同仿真模块 | `~/code/smart_vision/vpp/vpp-tov/` | 融合大模型智能体的虚拟电厂仿真系统 |

### global-sentiment-web 技术栈
```
Vue 3 + TypeScript + Vite + Element Plus + UnoCSS
包管理器：pnpm
启动命令：pnpm dev
CLAUDE.md：✅ 已生成（通过 /init 初始化）
```
---

## 八、注意事项

1. **Claude Code 没有 `/init` 命令** — `/init` 是 Claude Code 的内置命令，用于生成本地化的项目知识库
2. **tmux send-keys 可能丢键** — 如果批复没反应，尝试重新发一次
3. **Claude Code 每次新 session 都要确认权限** — 选 1 即可
4. **session 名称固定为 `claude-dev`** — 与 frontend-dev 的 TOOLS.md 配置一致

---

## 九、相关文件列表

```
~/.openclaw/frontend-dev/SOUL.md     # agent 角色定义（包含自动 delegation 原则）
~/.openclaw/frontend-dev/TOOLS.md   # 工具使用规范（tmux 操作详细流程）
~/.openclaw/frontend-dev/MEMORY.md  # agent 长期记忆（三个项目路径速查）
tmux session: claude-dev             # Claude Code 运行 session
```

---

## 十、关键配置更新记录（2026-04-06 晚）

### 更新的配置

| 文件 | 更新内容 |
|------|---------|
| `MEMORY.md` | 新增 global-sentiment 三个项目路径（前台/后台/爬虫），标注 CLAUDE.md 已生成 |
| `SOUL.md` | 明确"收到代码任务 → 立即 delegation 给 Claude Code"为核心原则 |
| `TOOLS.md` | 完善 tmux 工作流规范，增加任务格式要求 |
| `agents/frontend-dev/workspace/MEMORY.md` | 已删除（错误位置） |

### global-sentiment 项目群（MEMORY.md 速查）

| 项目 | 路径 | 说明 |
|------|------|------|
| 前台页面 | `~/code/smart_vision/global-sentiment/global-sentiment-web/` | Vue 3 + TypeScript + Vite，用户端，**CLAUDE.md 已生成** |
| 后台页面 | `~/code/smart_vision/global-sentiment/global-sentiment-admin/` | 管理端界面 |
| 爬虫程序 | `~/code/smart_vision/global-sentiment/tik-hub/` | TikTok/社交媒体数据爬取服务 |

### 前台页面技术栈（global-sentiment-web）
- 技术栈：Vue 3 + TypeScript + Vite + Element Plus + UnoCSS
- 包管理器：pnpm
- 启动命令：`pnpm dev`
- CLAUDE.md：已通过 `/init` 生成

---

---

## 十一、自动 delegation 工作流（用户视角）

用户不需要知道 tmux 或 Claude Code 的存在——这些是内部实现细节。

### 用户操作方式

用户只需对 frontend-dev 说：
```
"帮我修改海外社交媒体前台页面的首页"
"帮我打开 tik-hub 爬虫项目，让 Claude 介绍一下"
```

frontend-dev 自动完成：
1. 读 MEMORY.md 确认项目路径
2. 通过 tmux 发任务给 Claude Code
3. 监控进度，批复确认提示
4. 汇报结果

### agent 配置文件读取优先级
frontend-dev 读取配置的路径为 `~/.openclaw/frontend-dev/`，而非 `~/.openclaw/agents/frontend-dev/workspace/`。

---

*最后更新：2026-04-06 23:52*