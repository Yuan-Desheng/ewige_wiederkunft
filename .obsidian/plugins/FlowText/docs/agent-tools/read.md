# read — 读取 vault 文件

## 格式

- 单文件：`[Action] read: path/to/note.md`
- 批量：`[Action] read: a.md | b.md | c.md`（竖线分隔，可选空格）

## 禁止

- **不要** `read:` 文件夹路径（应使用 `cli: obsidian files folder=...`）。
- 路径不要用 vault 绝对路径或以错误的前缀开头；使用相对 vault 根的路径。

## 失败常见原因

- 文件不存在或路径拼写错误（注意大小写、子目录）。
- 把目录当成文件读取。
