---
fileName: 排除当前文件查询模
tags:
  - 查询
  - 排除
  - 当前文件
  - 模块
multiFile:
---

```dataview
list
from "Assistants/Modules/Dataview模块" and -#查询
where file.name != this.file.name
```
