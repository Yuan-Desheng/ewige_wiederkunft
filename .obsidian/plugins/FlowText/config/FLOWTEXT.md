---
flowtext-version: 1
scope: vault
imports: []

collections:
  guides:
    title: 使用指南
    roots: [使用指南]
    aliases: [教程, 帮助文档, 功能说明, 模块化OB]
    file-types: [md]
    search-mode: prefer

  assistants:
    title: 助手资源
    roots: [Assistants]
    aliases: [模板, 脚本, 模块]
    search-mode: prefer

  books:
    title: 图书与阅读资料
    roots: [Books]
    aliases: [PDF, 电子书, 读书笔记, 阅读笔记]
    file-types: [md, pdf, canvas]
    search-mode: prefer

  contacts:
    title: 人际关系
    roots: [Connections]
    aliases: [联系人, 人物, 人脉, 关系卡片]
    file-types: [md]
    search-mode: prefer

  documents:
    title: 办公文档
    roots: [Documents/Office]
    aliases: [办公文档, Office]
    file-types: [docx, xlsx, pptx, doc, xls, ppt]
    search-mode: prefer

  inbox:
    title: 笔记收集箱
    roots: [Documents/I.P.A.R.A/0-收集箱]
    aliases: [收集箱, 闪念笔记, 灵感, 暂存, 临时笔记]
    search-mode: prefer

  work-area:
    title: 工作领域
    roots: [Documents/I.P.A.R.A/工作领域]
    aliases: [工作领域, 工作笔记]
    search-mode: prefer

  study-area:
    title: 学习领域
    roots: [Documents/I.P.A.R.A/学习领域]
    aliases: [学习领域, 学习笔记]
    search-mode: prefer

  life-area:
    title: 生活领域
    roots: [Documents/I.P.A.R.A/生活领域]
    aliases: [生活领域, 生活笔记]
    search-mode: prefer

  daily-notes:
    title: 日记
    roots: [Documents/Dailynote/日记]
    aliases: [日记, 日志, 每日笔记, 日常记录]
    file-types: [md]
    search-mode: strict_then_global
    date:
      source: filename
      format: YYYY-MM-DD

  yearly-notes:
    title: 年记
    roots: [Documents/Dailynote/年记]
    aliases: [年记, 年度日志]
    file-types: [md]
    search-mode: strict_then_global
    date:
      source: filename
      format: YYYY

  monthly-notes:
    title: 月记
    roots: [Documents/Dailynote/月记]
    aliases: [月记, 月度日志]
    file-types: [md]
    search-mode: strict_then_global
    date:
      source: filename
      format: YYYY-MM

  weekly-notes:
    title: 周记
    roots: [Documents/Dailynote/周记]
    aliases: [周记, 周度日志]
    file-types: [md]
    search-mode: strict_then_global
    date:
      source: filename
      format: YYYY-Www

  attachments:
    title: 附件
    roots: [Extras]
    aliases: [图片, 附件, 资源文件]
    search-mode: strict

scopes:
  - paths: [Documents/Dailynote/**]
    rules:
      - 当前文件属于日记系统。
      - 日记使用 data 属性记录自然日期，属性名 data 是历史命名，必须保留。
      - data 属性值使用 YYYY-MM-DD 格式。
      - 修改已有日记时保留原有 YAML 属性和嵌入模块。
  - paths: [Documents/I.P.A.R.A/**]
    rules:
      - 当前文件属于 I.P.A.R.A 笔记系统。
      - 用户要求给 Markdown 笔记关联主题时，先列出对应领域“归档/卡片盒笔记主题索引卡”目录中已有的 .canvas 文件。
      - 用户选定主题后，将对应 canvas 文件链接写入“卡片盒笔记主题”属性。
      - 属性值使用带双引号的 Wiki 链接，例如："[[Documents/I.P.A.R.A/工作领域/归档/卡片盒笔记主题索引卡/JS语法.canvas|JS语法]]"。

search:
  fallback: widen-once

templates:
  default-note:
    title: 普通笔记模板
    path: Assistants/Templater/笔记/笔记通用模板.md
    aliases: [普通笔记, 通用笔记]
    file-types: [md]

  daily-note:
    title: 日记模板
    path: Assistants/Templater/日记/日记模板1.md
    aliases: [日记, 每日日记]
    collection: daily-notes

  weekly-note:
    title: 周记模板
    path: Assistants/Templater/日记/周记模板1.md
    aliases: [周记]
    collection: weekly-notes

  monthly-note:
    title: 月记模板
    path: Assistants/Templater/日记/月记模板1.md
    aliases: [月记]
    collection: monthly-notes

  yearly-note:
    title: 年记模板
    path: Assistants/Templater/日记/年记模板1.md
    aliases: [年记]
    collection: yearly-notes

creation:
  default-folder: Documents/I.P.A.R.A/0-收集箱
  image-folder: Extras/附件
---

# Vault 概览

这是 FlowText 的 Vault 持久上下文入口。它位于插件配置目录，不参与普通笔记索引。

# 架构说明

- 使用指南：保存使用说明和教程。
- Assistants：保存模板、脚本和模块。
- Books：保存 PDF、书籍和读书笔记。
- Connections：保存人物与人际关系卡片。
- Documents：保存通用笔记、日记、白板、I.P.A.R.A 和 Office 文档。
- Extras：保存图片和其他附件。

# 通用工作原则

- 用户明确给出路径时，以用户指定为准。
- 搜索间接描述时优先选择 collection；低置信度或零结果时扩大到全库一次。
- “最近 N 天的日记”指日记代表的自然日期； 只有明确说“修改过”时才使用修改时间。
- 创建新文档前先检查是否已经存在同名或同主题文件。

# 模板规则

- 创建新的普通 Markdown 笔记时，如果用户没有明确指定其他模板，必须先读取 `Assistants/Templater/笔记/笔记通用模板.md`，再以模板内容为基础创建目标文件。
- 模板文件是普通 Vault 文件，使用 read 读取；不要调用已注册模板列表，也不要把模板路径当作输出路径。
- 用户明确指定模板时，以用户指定的模板为准。
- 用户只要求修改已有文件时，不使用新建模板。

# 卢曼卡片笔记工作流
Vault 仓库的笔记工作流，使用的是卢曼卡片笔记工作流，其中：
- 笔记属性中的`卡片盒笔记主题`属性值，用于记录笔记所属的主题，类似卢曼的卡片盒，关联具有共同主题的笔记，属性值格式为："[[xxx仓库相对路径.canvas|文件名作为Alt显示名称]]"，注意保留双引号。
- 笔记属性中的`阐述日期`属性值，用于下一步详细阐述笔记的**计划日期**。
- 笔记属性中的`progress`属性值，用于记录笔记当前的进度值，可设置0-100，建议10的倍数。
- 笔记属性中的`iscompleted`属性值，布尔值，用于标记笔记完成状态
- 正文中通常会写入progress html标签，与fontmatter属性中的`progress`属性值绑定，格式按示例，只允许调整value值，其他格式固定不变。

示例

---
阐述日期: 2026-10-01
progress: 100
iscompleted: true
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Markdown语法.canvas|Markdown语法]]"
  - "[[Documents/I.P.A.R.A/工作领域/归档/卡片盒笔记主题索引卡/JS语法.canvas|JS语法]]"
---
<progress value="100" max="100" style="width: 100%;"></progress>