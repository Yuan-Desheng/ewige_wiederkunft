---
createTime: 2026-04-01 16:27
笔记ID: 20260401162714
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
---

##  Linux
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>
## 桌面快捷键

- 打开文件管理器后，按快捷键 **`Ctrl+L`**，地址栏会变成可编辑状态。
```
Ctrl+L
```

### 自定义快捷键
![[Pasted image 20260403105218.png]]



## 终端命令

### 服务器相关
测试一下这台服务器是否能连通
```
ping -c 3 115.190.175.31
```

系统监视器
```
gnome-system-monitor
```

杀死进程
```
xkill
```

查看历史
```
history
```

用 SSH 连接
```
ssh root@115.190.175.31
```

```
!p@ssword1
```

```
docker restart hz_test_local-nginx-1
```

在文件管理器中打开当前所在的目录
```
nautilus .
```

展示当前目录及其直接子目录的内容
```
tree -L 2
```



## 前端打包部署
在你的**本地终端**里依次执行：
**第一步：在本机压缩 dist**
```bash
tar -czvf /tmp/naval-class-web-test.tar.gz -C /home/yuan/code/smart_vision/zhitang-insight/zhitang-insight-admin/ dist
```
**第二步：上传到服务器**
```bash
scp /tmp/naval-class-web-test.tar.gz root@115.190.175.31:/usr/local/frontend/naval-class-web-test/
```

**第三步：SSH 到服务器解压**
```bash
ssh root@115.190.175.31 "cd /usr/local/frontend/naval-class-web-test && tar -xzvf naval-class-web-test.tar.gz && rm naval-class-web-test.tar.gz"
```

## 软件
### pandoc
```
pandoc --version    # 查看版本
pandoc input.md -o output.pdf   # md 转 pdf
pandoc input.md -o output.docx  # md 转 word
pandoc input.md -o output.html  # md 转 html
```

好的，已按您的要求去掉所有标题格式（如加粗、emoji、符号等），保留纯文本内容。

---

Typst 方案配置完成

安装结果
- typst 版本 0.14.2 已安装到 ~/.local/bin/
- COLOR_RULES.pdf（286KB）已生成

使用方法

方式一：使用脚本（推荐）
./md2pdf.sh COLOR_RULES.md

方式二：手动执行三步转换
1. 将 Markdown 转为 Typst 格式
pandoc file.md -o file.typst -t typst

2. 修正水平线语法（将 #horizontalrule 替换为 Typst 支持的画线命令）
sed -i 's/#horizontalrule/#line(length: 100%, stroke: 0.5pt)/g' file.typst

3. 编译生成 PDF
typst compile file.typst

```
将 <文件名>.md 用 Typst 转为 PDF。注意：不要用 Pandoc 的 typst
输出格式，它生成的代码 Typst 无法编译。请直接手写 Typst                       
源文件再编译，中文需指定 Noto Sans CJK SC 字体，代码块用 ``` 包裹，表格用
table.header 而非手动写表头行，不要用 calc.mod 做隔行变色。
```

```
将 @/home/yuan/obsidian/ewige_wiederkunft/Documents/I.P.A.R.A/工作领域/项目/OpenCLI-Facebook 博主数据采集方案.md 用 Typst 转为 PDF。注意：不要用 Pandoc 的 typst
输出格式，它生成的代码 Typst 无法编译。请直接手写 Typst                       
源文件再编译，中文需指定 Noto Sans CJK SC 字体，代码块用 ``` 包裹，表格用
table.header 而非手动写表头行，不要用 calc.mod 做隔行变色。
```


## VLC播放器

隐藏界面元素
```
ctrl + h
```

全屏
```
F
```