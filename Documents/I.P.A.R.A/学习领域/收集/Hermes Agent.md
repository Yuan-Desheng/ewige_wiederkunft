---
createTime: 2026-04-24 16:41
笔记ID: 20260424164144
multiFile:
multiMedia:
description: Hermes Agent 安装、配置与 Obsidian LLM Wiki 集成
笔记类型: 收集笔记
阐述日期:
tags:
  - hermes
  - agent
  - llm-wiki
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

##  Hermes Agent
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="30" max="100" style="width: 100%;"></progress>

## 待办


## 资料
[Hermes Agent](https://hermes-agent.nousresearch.com/docs/)

### 生图能力
![[Pasted image 20260424164618.png]]
https://jimeng.jianying.com/ai-tool/install
复制下列指令给你的 AGENT，一般情况下 AGENT 能够自行完成安装。
```Plain
使用这个指令安装即梦CLI，使用 -h指令阅读所有功能，并完成登录
curl -fsSL https://jimeng.jianying.com/cli | bash
```

自己去网页调用别的AI
![[Pasted image 20260424164725.png]]

## 笔记

[[Hermes Agent + LLM Wiki知识库 + Obsidian图谱]]

### 安装

```
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 常用命令

切换模型
```
hermes model
```

**交互式会话选择器**，用方向键和回车即可选中恢复
```
hermes sessions browse
```

打开web页面
```
hermes dashboard
```

### 配置

**配置文件位置**
- 安装路径：`~/.local/bin/hermes`
- 配置目录：`~/.hermes/`
- 主配置：`~/.hermes/config.yaml`
- 环境变量：`~/.hermes/.env`
- 会话记录：`~/.hermes/sessions/`

**当前模型配置**（`~/.hermes/config.yaml`）
- 默认模型：`glm-5-turbo`（通过 `https://open.bigmodel.cn/api/anthropic` 代理）
- 凭证池策略：`fill_first`，依次尝试 GLM-glm4.7 → MiniMax-CN-MiniMaxM2.7 → GLM-glm5

**环境变量**（`~/.hermes/.env`）
```
# LLM Wiki 路径（映射到 Obsidian vault）
WIKI_PATH=/home/yuan/obsidian/ewige_wiederkunft
```

### Skills

已安装的 skills（`~/.hermes/skills/`）：
- `research/llm-wiki` — Karpathy LLM Wiki 模式，在 Obsidian vault 内搭建知识库
- `research/arxiv` — arXiv 论文检索
- `research/blogwatcher` — 博客监控
- `note-taking/` — 笔记相关
- `software-development/` — 开发相关
- 其他：email、feeds、gaming、gifs、github、mcp 等 20+ 分类

### LLM Wiki + Obsidian 集成

> [!info] 详见 [[Hermes Agent + LLM Wiki知识库 + Obsidian图谱]]

**已完成**
- `WIKI_PATH` 已配置为 Obsidian vault 根目录
- LLM Wiki 目录映射到 IPARA 结构：
  - `0-收集箱/raw/` → 原始资料（articles, papers, transcripts）
  - `学习领域/资源/concepts/` → 概念页面
  - `学习领域/资源/entities/` → 实体页面
  - `学习领域/资源/comparisons/` → 对比分析
  - `学习领域/资源/queries/` → 查询结果
- `SCHEMA.md` 在 vault 根目录，兼容鱼先生 frontmatter 格式

**待完成**
- [ ] 重启 Hermes Agent 使 WIKI_PATH 生效
- [ ] 执行第一批 source ingest
- [ ] 配置 Hermes skill hook（对话结束时自动整理到 Obsidian）
- [ ] 验证 Obsidian 图谱视图中 wiki 链接

