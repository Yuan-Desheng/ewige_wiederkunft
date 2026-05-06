# canvas — 仅用于 .canvas 文件

## 禁止

- **禁止**用 `edit:` 或 `eval` 直接改 `.canvas` 正文，必须用本 Action。

## 格式

`[Action] canvas: <子命令> path="相对路径.canvas" ...`

多行 `nodes=[...]` / `edges=[...]` 时保持 JSON 数组括号配对。

## 子命令

- `create` — `nodes=` `edges=`（可空数组）
- `add_nodes` — `nodes=` 必填；可选 `edges=`
- `add_edges` — `edges=` 必填
- `update_node` — `id=`，可选 `text` `color` `x` `y` `width` `height` `file` `url` 等
- `remove_nodes` — `ids=[...]`
- `rewrite` — 保留文件，替换全部节点与边；`nodes` 非空

## 节点与边

- 节点字段常见：`id`, `type`（text/file/link/group）, `x`, `y`, `width`, `height`, `text`, `color`（"1"–"6"）, `file`, `url`, `label`
- 边：`fromNode`, `toNode` 必填；可选 `fromSide`, `toSide`, `label`, `color`

复杂布局请以本文与 Skills 参考为准；若 Action 失败，请根据 [Observation] 中的 `[ToolDocIndex] docs/agent-tools/canvas.md` 对照系统注入的全文修正命令。
