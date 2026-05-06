# edit — 修改笔记（非 canvas）

## 总格式

`[Action] edit: <子命令> path="相对路径" ...`

参数值用双引号；换行写 `\n`，引号转义 `\"`。

## 子命令摘要

- `write` — 新建或大段重写；推荐 **heredoc**：
  - 第一行：`edit: write path="路径"`
  - 下一行起：`<<<CONTENT` … 正文多行 … `CONTENT>>>`
- `replace_line` — `line=N` `text="..."`（单行；大段用 `replace_lines` + heredoc）
- `replace_lines` — `start=N` `end=M` + `<<<CONTENT` … `CONTENT>>>`
- `insert_after` / `insert_before` — `line=N` `text="..."`（`insert_after` 且 `line=0` 表示文件开头）
- `delete` — `start=N` `end=M`（单行可只给 `start`）
- `regex` — `pattern="..."` `flags="g"` `replacement="..."`

## 失败常见原因

- `path` 缺失或与 vault 不一致。
- `replace_lines` 的 `start`/`end` 与当前文件行号不一致（改前务必 `read: … lines=` 对齐）。
- 误对 `.canvas` 使用 `edit`（必须用 `canvas:`）。
