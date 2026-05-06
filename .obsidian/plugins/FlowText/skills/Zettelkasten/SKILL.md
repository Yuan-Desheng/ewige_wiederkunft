---
name: Zettelkasten
description: 将.md笔记关联/链接到某个主题文档（主题文档本质上是一个canvas文档），设定笔记完成度/进度。请在处理Obsidian中的.md文件时，或用户提及“卡片盒笔记、主题索引卡、主题、关联主题、笔记主题、进度、完成度、进度条”时使用此功能
---

# Obsidian 笔记主题索引技能

这个技能使Agent能够将.md笔记关联/链接到某个主题文档（主题文档本质上是一个canvas文档）。


## 如何关联笔记主题
关联笔记主题，本质上是通过Obsidian YAML 属性区域的“卡片盒笔记主题”字段值来实现的。通过在笔记的YAML属性区域添加或修改“卡片盒笔记主题”字段值，可以将笔记关联到指定的主题文档。格式如下：
### 示例
```yaml
---
卡片盒笔记主题: 
  - "[[Path/to/note.canvas|别名]]"
---
```

示例1：关联单个笔记主题

```yaml
---
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Markdown语法.canvas|Markdown语法]]"
---

```

示例2：关联多个笔记主题

```yaml
---
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Markdown语法.canvas|Markdown语法]]"
  - "[[Documents/I.P.A.R.A/工作领域/归档/卡片盒笔记主题索引卡/JS语法.canvas|JS语法]]"
---
```

### 关联步骤
第一步：先通过`obsidian files folder=Documents/I.P.A.R.A ext=canvas`cli命令找到所有的笔记主题.canvas文档
第二步：读取.md文档后，将.md笔记的YAML属性区域的“卡片盒笔记主题”字段值修改或追加为该笔记主题.canvas文档的路径。
- ⚠️注意：.md笔记已经有字段值时，通过示例2关联多个笔记主题
- ⚠️注意：链接显示别名必须与文件名完全一致


# Obsidian 笔记进度、完成度设定技能

这个技能使Agent能够为每个.md文档设定独立的进度或完成度值，，本质上是笔记正文中使用progress标签，并设定value（0-100，且为10的倍数），并绑定笔记 YAML 属性区域的“progress”字段值来实现的。格式如下：

## 如何设定完成度

### 示例1：未完成
```yaml
---
iscompleted: false
progress: 20
---
```
<progress value="20" max="100" style="width: 100%;"></progress>



### 示例2：已完成
```yaml
---
iscompleted: true
progress: 100
---
```
<progress value="100" max="100" style="width: 100%;"></progress>

### 注意事项
- 正文的progress标签与 YAML 属性区域的“progress”字段值需要同时设置
- 完全使用示例1和示例2的格式，当progress字段值不为100是，YAML设置iscompleted: false，反之iscompleted: true