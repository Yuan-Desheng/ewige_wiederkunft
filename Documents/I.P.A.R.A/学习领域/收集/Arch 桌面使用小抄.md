---
createTime: 2026-11-15 21:24
笔记ID: 20261115212443
multiFile:
multiMedia:
description: 本机 Nyxuri v3.1.0 桌面的日常操作，先记快捷键和常用入口。
笔记类型: 收集笔记
阐述日期:
tags:
  - linux
  - Arch
  - Nyxuri
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Arch 桌面使用小抄

```meta-bind-embed
[[笔记抬头模块]]
```

> 给自己看的大白话操作表，按本机实际配置整理。换机复现时先核对快捷键；不含密码。

### 先知道这三件事

- 平时开机默认进 **Ubuntu**；想进 Arch，开机按 **F12／Fn+F12 → Arch Linux**。
- 登录用户是 `yuan`，密码和 Ubuntu 一样，桌面会话选 **Niri**。
- **Super 就是键盘左下角带 Windows 徽标的键，通常在 Ctrl 和 Alt 之间。** 这个桌面会自动排列窗口，多开几个会往左右排，属于正常行为。

### 先记这几个快捷键

| 想做什么             | 按什么           |
| ---------------- | ------------- |
| 打开应用，输入名字搜索      | Super＋R       |
| 打开文件管理器          | Super＋E       |
| 打开终端             | Super＋Enter   |
| 关闭当前窗口           | Super＋Q       |
| 查看全部窗口和工作区       | Super＋Tab     |
| 在窗口之间来回切换        | Alt＋Tab       |
| 看左边／右边的窗口        | Super＋左／右方向键  |
| 把当前窗口放到全屏／退出全屏   | Super＋Shift＋F |
| 不想让窗口自动排列，切成浮动窗口 | Super＋T       |
| 打开桌面设置           | Super＋I       |
| 换壁纸              | Super＋W       |
| 截图               | Super＋Shift＋S |
| 锁屏               | Super＋L       |
| 关机、重启、退出登录       | Super＋X，再选菜单  |

忘记了，按 **Super＋/** 看提示。Super＋Shift＋Q 是退出整个桌面，会关闭会话。

### 工作区，就是几张不同的桌子

**Super＋1／2／3** 切到不同工作区。比如 1 放浏览器，2 放终端，3 放文件。

**Super＋Shift＋1／2／3** 把当前这一列窗口搬过去。窗口太多时，先按 Super＋Tab 看全局。

### 日常怎么用

- **上网**：Super＋R，搜 Firefox。连 Wi-Fi 先找桌面网络入口；找不到就打开终端输入 `nmtui`，选“启用连接”，再选家里的 Wi-Fi。
- **中文**：默认 Ctrl＋Space 切中英文。已补齐 NyxMellow 候选框皮肤，配色跟随桌面；不能输入时，Super＋R 搜 Fcitx5 配置，确认有“拼音”。
- **声音和亮度**：先用笔记本原来的功能键；声音设备不对时，启动器搜 Pavucontrol 调整。
- **文件**：Super＋E 打开 Thunar；下载文件通常在 Downloads。截图保存在 `~/Pictures/Screenshots/`。
- **壁纸**：把喜欢的图片放进 `~/Pictures/Wallpapers/`，再按 Super＋W 选择。2026-11-16 已补齐作者壁纸包，现有 26 张静态图片和 3 个视频，原有图片保留。
- **颜色、顶栏、外观**：Super＋I 打开 Noctalia 设置。设置里修改的是当前桌面，和作者演示的开发版界面可能不同。

### 只留三个常用命令

终端里输入下面的命令即可，**在 Arch 里运行**。

看快捷键速查：

```fish
nyxhelp keys
```

检查桌面哪里不对：

```fish
nyxuri doctor
```

网络好、准备更新系统时：

```fish
sudo pacman -Syu
```

终端要求输密码时不显示字符，正常输入后按 Enter。[更新命令说明](https://man.archlinux.org/man/pacman.8.en)。

### 出问题先这样处理

能打开终端，就先运行 `nyxuri doctor`。想保存这台机器的启动状态，还可以运行 `~/Verify-Arch.sh`，结果在 `~/Documents/arch-first-boot.txt`。

进不了图形桌面：按 **Ctrl＋Alt＋F3**，用 `yuan` 登录，然后输入 `niri-session`。也可以重启按 F12 回 Ubuntu。

### 新壁纸和输入法皮肤怎么用

重启进 Arch 后，按 **Windows 键＋W** 打开壁纸选择器，选喜欢的图。壁纸文件放在 `~/Pictures/Wallpapers/`，其中 `video/` 是 3 个视频文件；动态播放效果待登录后确认。

按 **Ctrl＋Space** 切到中文，打几个字，就能看候选框。NyxMellow 已设为普通和深色模式的默认皮肤，原来的拼音方案没改。主题已按当前富士山壁纸重新生成，之后由 Noctalia 随壁纸配色刷新。

如果候选框还是旧样式，在 Arch 终端依次输入：

```fish
noctalia msg config-reload
noctalia msg templates-apply
```

### 这次补齐了哪些外观组件

- **窗口**：Niri 已启用随桌面配色变化的窗口焦点效果。
- **顶栏和设置**：现在是作者的 Nyxuri Shell 开发版；按 **Super＋I** 调整。原 Noctalia 保留作回退。
- **自动配色**：换壁纸后，窗口、GTK 应用、Kitty 终端、Starship 提示符和中文候选框会使用生成的配色。
- **终端**：Super＋Enter 打开 Kitty，里面是 Fish＋Starship；已加自动补括号和 fzf 搜索插件。
- **中文皮肤**：NyxMellow，Ctrl＋Space 切到中文后看候选框。
- **登录界面**：Noctalia Greeter，保留正常密码登录。

动态壁纸插件已装好；视频放在 `~/Pictures/Wallpapers/video/`。静态图先按 **Super＋W** 选择，动态播放和中文候选框外观还需在正式 Arch 登录后看实际效果。

Ubuntu 里的预览是临时副本：这次组件配置已专门保存到正式系统，但以后在预览窗口里改设置，不会自动写回正式 Arch。

### 为什么和视频不完全一样

最初安装的是 **Nyxuri v3.1.0＋Niri＋Noctalia**；2026-11-16 按用户要求正式安装了作者的 **Nyxuri Shell 开发版**。用户给的[视频](https://www.bilibili.com/video/BV18yxy63EEP/)是开发进度演示；当前源码继续在改，画面不保证与视频逐项一致。2026-11-16 已补齐额外壁纸包、NyxMellow、动态壁纸插件和 Fisher 终端插件，并保存到正式 Arch。

先照这份小抄使用。安装记录和文件位置看 [[Windows 外置盘迁移与 Arch Nyxuri 安装交接]]；当前自制 Shell 来源为[仓库 main](https://github.com/ech678/Nyxuri)，原 v3.1.0 源码和 Noctalia 配置保留。

### 新装的自制 Shell 怎么用

正式 Arch 已选择 Nyxuri Shell：深色界面、分组顶栏、居中信息区、新应用菜单和设置面板；登录页用深色森林背景和对应配色。下一次登录看实际效果，安装完成不等于已做真机外观验收。

- 开机按 **F12 → Arch Linux**，登录 `yuan`，桌面仍选 **Niri**。
- **Super＋R** 打开新应用菜单；**Super＋I** 打开新设置；**Super＋X** 打开电源菜单。
- 这版仍在开发。启动未就绪时，本次会话会尝试回退 Noctalia；日志在 `~/.local/state/nyxuri/shell-session.log`。

想主动切回原来的界面，在 Arch 终端输入：

```fish
nyxuri shell set noctalia
```

再想切回自制 Shell：

```fish
nyxuri shell set nyxuri-shell /home/yuan/.local/bin/nyxuri-shell
```

### 存储清理记录

2026-11-16 清理了 Ubuntu 上的旧预览、安装暂存系统和重复下载缓存，释放约 **16.3GiB**。Arch 内部没有旧预览、孤立软件或明显临时残留；约 **2.4GiB** 缓存恰好是 730 个已安装软件各自的一份安装包，保留供断网修复。Arch 约用 19GiB、余 444GiB（本次检查时）。

重新打开预览会临时占一些空间；关闭后自动删除本次虚拟磁盘、临时内核与 EFI 镜像，保留小日志。
