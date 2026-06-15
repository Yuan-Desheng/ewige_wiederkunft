---
name: dida-sync
description: 查询滴答清单 / TickTick 任务。用户提到滴答、待办清单、今日任务、dida 时，必须用 dida: 读取 Dida Sync 同步数据后再回答，禁止臆造任务列表。
---

# dida: 滴答清单任务查询

依赖 **Dida Sync** 插件；数据来自 `.obsidian/plugins/Dida Sync/data.json`。

```
[Action] dida:
[Action] dida: 关键词
[Action] dida: project="项目名" status=pending
[Action] dida: status=done
```

- `status`：`pending`（未完成）、`done`（已完成）、`all`
- 无匹配时如实说明，不要编造任务
