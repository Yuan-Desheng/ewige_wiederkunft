---
name: dida-sync
description: 查询滴答清单 / TickTick 任务。用户提到滴答、TickTick、待办清单、今日任务或 dida 时使用原生 dida function call 读取 Dida Sync 已同步数据后再回答，禁止臆造任务列表。
---

# 滴答清单查询

## 工具调用

使用原生 `dida` function call。


| 参数        | 必填  | 用途                                                  |
| --------- | --- | --------------------------------------------------- |
| `query`   | 否   | 按任务标题、内容、描述、项目名或子任务关键词过滤                            |
| `project` | 否   | 按真实项目名过滤，支持部分匹配                                     |
| `status`  | 否   | `pending` / `0` 表示未完成，`done` / `2` 表示已完成，`all` 表示全部 |


参数对象示例：

```json
{}
```

```json
{"query":"周报"}
```

```json
{"project":"工作","status":"pending"}
```

```json
{"status":"done"}
```

## 查询规则

- 工具从 vault 配置目录下的 `plugins/Dida Sync/data.json` 读取已同步数据，只提供查询能力。
- 必须等待工具 Observation 后再回答；不得根据常识或历史对话猜测任务。
- 多个互不依赖的查询可在同一 assistant turn 分别发起 `dida` function call。
- 空结果不等于调用错误。可在确有必要时适当放宽 `query`、`project` 或 `status`，但不要无边界遍历。

## 失败处理

- Dida Sync 未安装、未同步、数据文件不可读或 JSON 异常时，停止相同参数重试并说明依赖条件。
- 不要编辑 `data.json` 或其他 vault 文件来“修复”查询失败。

