---
fileName: 排除指定文件夹
tags:
  - 查询
  - 指定文件
  - 排除
  - 模块
multiFile:
---

```dataview
table
from "Assistants/Modules"
where file.folder != "Assistants/Modules/Dataview模块"
```
