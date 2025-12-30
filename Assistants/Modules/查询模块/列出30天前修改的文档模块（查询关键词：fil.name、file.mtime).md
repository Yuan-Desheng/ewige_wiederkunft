---
fileName: 列出30天前修改的文档模块
tags:
  - 30天前
  - 修改
  - 模块
multiFile:
---

```dataview
table 
file.name from ""
where file.mtime < date(today) - dur(30day)
```
