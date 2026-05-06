# dida — 滴答清单（依赖 Dida Sync）

## 格式

`[Action] dida: [关键词] [project="项目名"] [status=pending|done|all|0|2]`

- 从 vault 配置目录下 `plugins/Dida Sync/data.json` 读取任务数据。
- 需 **Dida Sync** 已安装并同步过，否则读取失败。

## 失败常见原因

- 插件未安装或未同步 → 无法读 `data.json`。
- `project` / `status` / 关键词组合过严导致无匹配（属正常空结果，非语法错误）。
