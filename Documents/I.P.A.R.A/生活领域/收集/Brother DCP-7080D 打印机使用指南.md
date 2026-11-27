---
createTime: 2026-11-19 18:22
笔记ID: 20261119182247
multiFile:
multiMedia:
description: Brother DCP-7080D 的本机打印队列、A4 单双面打印、复印扫描和常见故障处理。
笔记类型: 收集笔记
阐述日期:
tags:
  - 打印机
  - Brother
  - CUPS
aliases:
  - Brother 打印机使用指南
cssclasses:
卡片盒笔记主题:
---

## Brother DCP-7080D 打印机使用指南

```meta-bind-embed
[[笔记抬头模块]]
```

本机的打印队列是 `Brother_7080D_169`，使用 brlaser 驱动，默认 A4、600 dpi、单面。打印机支持黑白打印和复印、彩色扫描。 [Brother 产品规格](https://support.brother.com/g/b/spec.aspx?c=cn&lang=zh&prod=dcp7080d_cn)

### 日常打印

1. 打开打印机，把 A4 普通纸装进底部纸盒。纸张打印面朝下，导纸板贴住纸边，纸叠低于上限刻度。 [Brother 装纸指南](https://support.brother.com/g/b/faqend.aspx?c=cn&faqid=faq00003167_006&ftype3=2044&lang=zh&ot=cn_ot&prod=dcp7080d_cn)
2. 打开 PDF 或文档，按 `Ctrl+P`，选择 **Brother_7080D_169**。纸张选 **A4**，检查预览、页码和份数，再点 **打印**。
3. 要双面时用 A4 普通纸。像书一样左右翻页，竖版选**长边翻转**，横版选**短边翻转**。可以先双面打前两页确认方向。 [Brother 产品规格](https://support.brother.com/g/b/spec.aspx?c=cn&lang=zh&prod=dcp7080d_cn)

### 用终端打印 PDF

把 `文件.pdf` 换成实际路径。命令会返回作业编号，例如 `Brother_7080D_169-42`。

```bash
# 单面打印整份 PDF
lp -d Brother_7080D_169 -o media=A4 -o sides=one-sided "文件.pdf"

# 双面打印整份 PDF，沿长边翻转
lp -d Brother_7080D_169 -o media=A4 -o sides=two-sided-long-edge "文件.pdf"

# 单面打印第 1 至 2 页
lp -d Brother_7080D_169 -o media=A4 -o sides=one-sided -P 1-2 "文件.pdf"

# 查看待处理作业
lpstat -o Brother_7080D_169

# 取消指定作业，42 换成实际编号
cancel Brother_7080D_169-42
```

短边翻转使用 `two-sided-short-edge`。 [CUPS 打印选项](https://openprinting.github.io/cups/doc/options.html)

### 复印和扫描

- **复印**：掀开上盖，将原稿内容面朝下放在玻璃上，沿角标对齐。合盖后用面板上的上下键选份数，按 **Start（开始）**。需要把两页原稿复印到一张纸的正反面时，先选面板的**双面**功能，再按屏幕提示换页。 [Brother 双面复印说明](https://support.brother.com/g/b/faqend.aspx?c=cn&faqid=faq00002595_003&lang=zh&prod=dcp7080d_cn)
- **扫描到电脑**：用 USB 把打印机连接到电脑，安装对应系统的扫描驱动。原稿面朝下放在玻璃上，在电脑的扫描工具里选 Brother DCP-7080D，预览后保存。普通文档可选 300 dpi 和 PDF。当前 AppSocket 队列提供打印功能，扫描需要单独配置。 [Brother 驱动下载](https://support.brother.com/g/b/downloadtop.aspx?c=cn&lang=zh&prod=dcp7080d_cn)

### 打不出来时

| 现象 | 检查方法 |
| --- | --- |
| 打印列表找不到 Brother | 运行 `lpstat -p Brother_7080D_169`，确认队列存在且已启用。该机没有系统默认打印机，打印时手动选 Brother 队列。 |
| 作业一直等候或机器没反应 | 检查打印机供电、屏幕报错、纸盒和局域网连接。用 `lpstat -o Brother_7080D_169` 看等待中的作业，取消重复作业后先打 1 页。 |
| 背面倒过来或提示双面尺寸错误 | 查看预览，检查装纸和打印设置是否都为 A4。背面方向不对时，在长边与短边翻转之间切换。 |
| 面板提示卡纸、粉盒或硒鼓 | 按屏幕提示确认位置或耗材类型，再查对应的图解步骤。 [Brother 中文说明书](https://support.brother.com/g/b/manualtop.aspx?c=cn&lang=zh&prod=dcp7080d_cn) |

### 查询或恢复连接

本机队列使用 AppSocket，端口为 `9100`。实际局域网地址可在已配置的电脑上运行 `lpstat -v Brother_7080D_169` 查到。重建队列时在系统的打印机设置里选择 AppSocket/JetDirect，填入该地址和端口，驱动选择 **Brother DCP-7080D（brlaser）**。设备本体的接口为 USB，现有网络路径以队列配置为准。 [Brother 接口规格](https://support.brother.com/g/b/spec.aspx?c=cn&lang=zh&prod=dcp7080d_cn)

2026-11-19 已核对本机 CUPS 的驱动和默认设置。A4 PDF 的单面、长边双面和短边双面参数均通过 CUPS 校验。出纸、复印和扫描留待实机验证。
