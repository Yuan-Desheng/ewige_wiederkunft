---
Tag: 使用指南
---

# 1-6号标题
输入方式：“#+空格+标题”
## Level 2 Headings
### Level 3 Headings
#### Level 4 Headings
##### Level 5 Headings
###### Level 6 Headings

# 强调语法
粗体：“文字前后各两个星号”，例如**粗体**
斜体：“文字前后各1个星号”，例如*斜体*

# callouts标注语法
输入方式：
```
> [!NOTE] 标题
> 内容
```
或通过鼠标右键 → 插入 → 标注
`注：NOTE可以调整为tip,todo等`，支持的类型可以详见[这里](https://help.obsidian.md/Editing+and+formatting/Callouts)

示例：
> [!NOTE] 🌈Boder
> A clean and highly customisable theme for obsidian.Highly recommended for use with [style settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.Create your own UI style using [style settings](https://github.com/mgmeyers/obsidian-style-settings) plugin. Here are some presets:

# 脚注

Base color Defines all background[^1] and border colors unless overridden in more granular settings^[这是脚注2，不需要在文档后面在添加额外的注释，直接在原文输入]

[^1]: 这是脚注1，需要在后面添加额外的注释

# 内链（wiki链接）
内链图片格式：`![[图片.jpg]]`
- 去掉感叹号则只显示链接
- 在格式后缀后面添加英文竖线和数字，按比例调整图片大小，例如`![[图片.jpg|400]]`

![[banner-甜点.JPG|400]]

# 外链（Markdown链接）

## 网址外链
输入方式：`[这里输入显示名称](这里输入网址)`
例如：[这是书籍封面](https://ytmaps.vip/202406241657109.png)链接，在前面加上英文感叹号则会直接显示图片

## 本地文档外链
输入方式：`[这里输入显示](file:///这里输入文档路径)`

# 引用
输入方式：`>+文字`
>This is a quote
>n Markdown, <span style="background:#fff88f">quote blocks and code blocks are two important</span> formatting tools, which are used to highlight quoted text and code fragments respectively.

# 分割线
输入方式：三个减号(需要独占一行）

# 代码框
输入方式：前后1个英文反引号（内联代码），或者前后3个反引号（代码块）
内联代码：`这里是内联代码`

```
code
```

# 列表语法
## 无序列表
输入方式：“-+空格”
- 00:46 This is list 
	- This is list 1.1
	- This is list 1.2
- 09:50 This is list 2
	- This is list 2.1
	- This is list 2.2

## 有序列表
输入方式：“数字+点+空格”
1. 列表1
2. 列表2
3. 列表...

## 任务语法
- 手动输入方式：
	- 未完任务：`- [ ] `
	- 已完任务：`- [x] `
- 右键菜单快捷输入方式：鼠标右键 → 段落设置 → 任务列表

# 标签
输入方法：“#+标签名”，例如： #示例标签/子标签

# 转义符
有的时候，想要直接显示一些特殊符号，例如两个反引号\`,因为反引号在markdown语法有特殊意义，因此正常会显示为`代码`，需要直接显示反引号，则需要在前面加上一个"\\"符号转译（这里我输入了2个斜杠，因为需要进行一次转译）

==最后，如果你暂时还记不住，可以选中已经输入的文字，会弹出md语法工具栏，“Editing Toolbar”插件会帮助你快速使用部分markdown和html语法==

以上内容仅作简单介绍，更多详细的MD语法教程，欢迎来了解一下小红书[基础课程](https://www.xiaohongshu.com/goods-detail/680f81700e004a0001cf7ca1?t=1746846249223&xsec_token=ABvTI7ehTD7OVFBoyHtKWZXvZiYfwlv2z77jtomMUaXlk%3D&xsec_source=pc_arkselfshare)(ima平台)

