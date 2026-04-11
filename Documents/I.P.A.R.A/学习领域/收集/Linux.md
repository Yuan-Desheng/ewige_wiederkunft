---
createTime: 2026-04-01 16:27
笔记ID: 20260401162714
multiFile:
multiMedia:
description:
笔记类型:
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


用 SSH 连接
```
ssh root@115.190.175.31
```
!p@ssword1
docker restart hz_test_local-nginx-1



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
