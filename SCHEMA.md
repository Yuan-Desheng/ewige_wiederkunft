---
createTime: 2026-05-28 11:30
笔记ID: 20260528113000
tags: [wiki, schema, 配置]
---

# LLM Wiki Schema

## Domain
编程、AI Agent、Flutter、前端开发、知识管理 — 用户是一名程序员，日常使用AI辅助编程，需要知识库来沉淀和回顾技术知识点。

## Architecture: Three Layers (mapped to IPARA)

```
Documents/I.P.A.R.A/
├── 0-收集箱/raw/           # Layer 1: 不可变原始资料
│   ├── articles/           # 网页文章、剪报
│   ├── papers/             # PDF、arxiv论文
│   └── transcripts/        # 对话记录、会议笔记
├── 学习领域/资源/           # Layer 2: Wiki页面（agent维护）
│   ├── concepts/           # 概念/主题页面
│   ├── entities/           # 实体页面（人、组织、产品、模型）
│   ├── comparisons/        # 对比分析
│   └── queries/            # 值得保留的查询结果
├── 学习领域/资源/wiki-index.md    # 内容目录
└── 学习领域/资源/wiki-log.md      # 操作日志
```

## Conventions

- 文件名：小写、连字符、无空格（如 `transformer-architecture.md`）
- 每个wiki页面必须有至少2个 `[[wikilinks]]` 指向其他页面
- 更新页面时，必须更新 `updated` 字段
- 新页面必须添加到 `wiki-index.md` 的对应分区
- 每次操作必须追加到 `wiki-log.md`
- raw/ 下的文件不可变 — agent只读取，不修改

## Frontmatter (兼容鱼先生模板)

```yaml
---
createTime: YYYY-MM-DD HH:mm
笔记ID: YYYYMMDDHHmmss
multiFile:
multiMedia:
description:
笔记类型: wiki笔记
阐述日期:
tags: [from taxonomy below]
aliases:
cssclasses: ai-note
卡片盒笔记主题:
# LLM Wiki 专属字段
updated: YYYY-MM-DD
type: entity | concept | comparison | query
sources: [0-收集箱/raw/articles/source-name.md]
confidence: high | medium | low
---
```

## Tag Taxonomy

- 编程语言: dart, flutter, vue, angular, typescript, python, go
- AI/ML: agent, llm, rag, prompt, fine-tuning, inference
- 工具链: docker, nginx, git, linux, obsidian
- 平台: thingsboard, hermes, openclaw, claude-code
- 领域: iot, virtual-power-plant, education, aquaculture
- 元类型: comparison, tutorial, reference, architecture

## Page Thresholds

- **创建页面**: 实体/概念在2+个来源中出现，或在一个来源中是核心主题
- **添加到已有页面**: 新来源提到了已有页面覆盖的内容
- **不创建页面**: 仅在脚注或段落中一次性的提及
- **拆分页面**: 超过200行时拆分为子主题
- **归档页面**: 内容完全被取代时移动到 `归档/`

## Update Policy

当新信息与已有内容冲突时：
1. 检查日期 — 较新的来源通常优先
2. 如果确实矛盾，同时记录两个立场并标注日期和来源
3. 在frontmatter中标记: `contested: true`
4. 提交给用户审核
