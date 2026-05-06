# cli — Obsidian CLI Commander

## 格式

`[Action] cli: obsidian <子命令> [参数]`

- 必须以 `obsidian` 开头（系统可自动补全，但建议写全）。
- 参数一律 `key=value`；含空格或中文的值用双引号：`query="关键词"`。
- 路径为 **vault 相对路径**，例如：Note/未命名.md，根目录为"/"
- 不要使用 `format` 参数。
- 不知道命令时,通过`cli: obsidian help`查看所有可用cli命令

## 文件操作cli命令
列出文件夹：obsidian files folder=文档相对路径
打开文件：obsidian open path=文档相对路径
重命名文件：obsidian rename file=file.md name=newfile.md
删除文件：obsidian delete path=path/to/file.md
移动文件：obsidian move path=path/to/file.md to=folder/to/path  
    移动文件错误示例：obsidian move path=Note/Subfolder1 to=Note/Subfolder2
    移动到根目录示例：obsidian move path=Note/未命名.md to="/"

## 搜索cli命令
搜索标签：obsidian search query=tag:#标签名
搜索文件名：obsidian search query=file:"文件名"
搜索属性：obsidian search query=[属性名:值(可选)]
搜索任务：obsidian search query=task:搜索词
搜索其他内容：obsidian search query=搜索词


## 属性cli命令
列出文件属性：obsidian properties file=文档相对路径
设置文件属性：obsidian property:set name=属性名 value=属性值 path=文档相对路径
删除文件属性：obsidian property:remove name=属性名 path=文档相对路径
读取文件属性值：obsidian property:read name=属性名 path=文档相对路径


## 模板cli命令
基于模板创建笔记：obsidian create path=path/to/file.md template=path/to/file
注意
- path参数基于 vault 相对路径
- template参数不带格式后缀，基于Assistants文件夹的相对路径，例如模板文件为"Assistants/Templater/笔记/笔记通用模板.md" ，则template=Templater/笔记/笔记通用模板.md，而不是template=Assistants/Templater/笔记/笔记通用模板.md
- 可追加content="..." 
- 基于模板创建笔记不需要先read


## 任务cli命令
列出已完任务：obsidian tasks done
列出未完任务：obsidian tasks todo
列出详细的已完任务（带文件路径和行号）：obsidian tasks done verbose
列出详细的未完任务（带文件路径和行号）：obsidian tasks todo verbose
切换任务状态：obsidian task:toggle line=N path="path/to/file.md"
任务已完成：obsidian task:done line=N path="path/to/file.md"
任务未完成：obsidian task:todo line=N path="path/to/file.md"

## 链接cli命令
列出孤立笔记：obsidian orphans
列出反向链接：obsidian backlinks path=path/to/file.md
列出出站链接：obsidian links path=path/to/file.md

## 标签cli命令
列出笔记标签：obsidian tags file=path/to/file.md
列出带有某标签的笔记：obsidian tag name=标签名

## obsidian命令
所有命令id列表：obsidian commands
运行命令：obsidian command id=命令id