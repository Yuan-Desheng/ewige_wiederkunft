---
fileName: 列出特定字段所在段落内容
tags:
  - 查询
  - 字段
  - 段落
  - 模块
multiFile:
---

```dataviewjs
//使用时修改关键词即可
const term ="排除"
let folderpath="Assistants/Modules"
//更改为限定文件夹即可，留空为遍历所有笔记
const files = app.vault.getMarkdownFiles().filter(file=>file.path.includes(folderpath))
const arr = files.map(async ( file) => {
const content = await app.vault.cachedRead(file)
const lines = content.split("\n").filter(line => line.contains(term))
return lines
})
Promise.all(arr).then(values => 
dv.list(values.flat()))
```
