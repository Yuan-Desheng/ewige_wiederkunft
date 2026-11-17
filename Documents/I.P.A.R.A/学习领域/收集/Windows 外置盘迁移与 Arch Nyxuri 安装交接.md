---
createTime: 2026-11-15 17:36
笔记ID: 20261115173601
multiFile:
multiMedia:
description: Arch 已正常启动，默认 Ubuntu；记录 Windows 外置盘状态、安装结果和离线材料。
笔记类型: 收集笔记
阐述日期:
tags:
  - linux
  - Windows
  - Arch
  - 系统迁移
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Windows 外置盘迁移与 Arch Nyxuri 安装交接

```meta-bind-embed
[[笔记抬头模块]]
```

> 本机迁移结果与后续入口，用于以后查找和复现。密码、密码哈希和网络密钥均不写进公开笔记库。

### 现在的状态

- **Arch 已安装，用户确认可以正常启动。** 最初桌面是 Nyxuri v3.1.0＋Niri＋Noctalia；2026-11-16 已按要求正式改用作者自制 Nyxuri Shell，原 Noctalia 保留。
- **日常默认进入 Ubuntu。** 已核验固件优先 Ubuntu、无 BootNext 临时覆盖，Ubuntu 的 GRUB 默认也是 Ubuntu。
- 想进 Arch：开机按 F12／Fn+F12，选择 **Arch Linux**。登录用户 `yuan`，密码沿用本机 Ubuntu，不记录具体值。
- 原 Windows 与“新加卷”已按用户明确确认清空，合并成约 **474.7GiB** 的 Arch 根分区。
- 外置 HGST 上有 Windows 完整副本和 USB 引导，但**外置 Windows 能否实机启动、文件系统是否修复，仍未确认**。

桌面怎么用，看：[[Arch 桌面使用小抄]]。

### 硬盘怎么区分

重启后 `/dev/nvme0n1`、`/dev/nvme1n1` 可能对调，以序列号和 UUID 为准。

| 用途 | 硬盘身份 | 结果 |
| --- | --- | --- |
| Ubuntu | SDHSJ-MA500；序列号 `H1TSMCKK007578` | 整盘保留，默认启动 |
| Arch | YMTC YMSS2ED06D25MC；序列号 `YMB5512JA242840J3N` | 原 p3＋p4 合并成 ext4；p2、p5 保留 |
| 外置 Windows | HGST HTS721010A9E630；序列号 `JR1000D33YZ1AE` | ESP、MSR、WindowsUSB、Data 保留 |

| 分区 | UUID |
| --- | --- |
| Ubuntu 根分区 | `27481a45-0188-4b3d-8dd9-57c694cc620b` |
| ArchRoot 根分区 | `8b0809a4-9c6d-4010-9cc2-7f70fcded47d` |
| 两个 Linux 共用的 EFI | `B288-10AD` |
| 外置 WindowsUSB | `1EAC352804889AFC` |
| 外置 ESP | `B698-9821` |
| 外置 Data | `7862A2B762A27990` |

**共享 EFI 在 YMTC 盘的 p1，只有 260MiB，保留了 Ubuntu 引导，不能整盘格式化。** Arch 内核放在自己的 ext4 `/boot`，EFI 分区只放引导文件。

本次固件编号：`Boot0003 = ubuntu`，`Boot0000 = Arch Linux`。早先同编号的 Windows USB 入口已被固件移除；找系统要看名称和路径，不能只记编号。2026-11-16 已清理旧内置 `Windows Boot Manager`（Boot0004）固件启动记录；删除前已备份。原 Windows EFI 文件仍保留，未改动 Ubuntu／Arch 引导及外置盘。

### 桌面是不是按视频和仓库装的

按 [Nyxuri 仓库](https://github.com/ech678/Nyxuri) 的 **v3.1.0 稳定版**配置，固定提交 `2f729784661341eaff2eb353e1567409b884ef30`。核心配置由项目自己的安装器以普通用户部署，驱动和依赖则从事先校验过的缓存安装。

用户给的[视频](https://www.bilibili.com/video/BV18yxy63EEP/)标题是“Nyxuri（原NyxNiri）项目进度展示”。作者在简介中说明正在调整 Shell 和架构；目前仓库 main 也包含正在开发的自制 Shell。**这次安装没有按视频逐项复刻，也没有切到开发中的自制 Shell。** 本次读取了视频标题、简介，未逐帧比较画面。

| 项目 | 这台机器实际配置 |
| --- | --- |
| 窗口排列、快捷键 | Niri，使用 v3.1.0 配置 |
| 状态栏、面板、设置 | 当前选择 Nyxuri Shell 开发版，Noctalia 5.5.0 保留作回退 |
| 登录画面 | Noctalia Greeter，深色森林背景与对应暗色配色 |
| 文件管理器快捷键 | Super＋E 打开 Thunar；Nautilus 也已安装 |
| 壁纸 | 2026-11-16 已补齐作者壁纸库：26 张图片、3 个视频 |
| 动态壁纸工具 | mpvpaper 1.9＋官方 noctalia/mpvpaper 插件 1.2.2，3 个视频；实际播放待登录确认 |
| 中文输入 | Fcitx5 拼音；2026-11-16 已启用 NyxMellow 默认／深色皮肤 |
| 终端外观 | Kitty＋Fish＋Starship；Fisher、autopair、fzf.fish 已安装 |

另外补齐了 `effects.kdl → effects_normal.kdl` 运行时链接，让 Niri 首次启动能读取特效配置。原始下载源码未改动。没有因为视觉差异自动升级 main 或覆盖现有桌面。

### 2026-11-16 补齐壁纸与 NyxMellow

从[作者壁纸库](https://github.com/ech678/wallpaper-collection)下载，固定提交 `336c32f08ac76deeb49074bccd0635cf102e2ad9`。素材总计约 113MiB，26 张静态图片（含原有一张）与 3 个视频；新增 28 个文件，原有图片未覆盖，安装后哈希与源文件全部一致。

在 Ubuntu 中挂载 Arch，使用 Arch 自身环境及普通用户 `yuan` 运行项目的 `fcitx install`。NyxMellow 模板已部署、Noctalia 模板已注册，`Theme` 和 `DarkTheme` 都设为 `nyxmellow`。随后用上次保存的 Noctalia 调色板生成 theme.conf／panel.svg／highlight.svg，配置和 SVG 格式检查通过。现有 Fcitx 拼音 profile 的哈希未变。

下次登录 Arch 后由 Noctalia 自动按当前配色刷新；实际候选框外观和动态壁纸播放仍待会话内确认。操作备份与校验记录：Ubuntu 工作目录下的 `desktop-extras-2026-11-16/`。默认启动仍为 Ubuntu。

### 2026-11-16 六项桌面组件保存到正式 Arch

用户明确同意保存到正式系统。先关闭临时预览，再挂载实际 Arch 根分区更新；没有把整个预览副本覆盖回硬盘。

1. 保留 Nyxuri v3.1.0＋Niri＋Noctalia 稳定版；启用项目的 `glow-material-you` 窗口焦点配色预设。
2. 通过项目 `./install.sh fisher install` 安装固定版本的 Fisher、autopair、fzf.fish，Fish 仍是 yuan 的默认 shell。
3. 补齐官方 `noctalia/mpvpaper` 插件，部署到 `~/.local/share/noctalia/plugins/mpvpaper/`；配置校验和插件检查均无告警。
4. 为 Kitty 的 `current-theme.conf`、Starship 配色增加自定义模板，保留原有终端布局；GTK3/4、Niri 和 NyxMellow 模板一起按当前壁纸原生渲染。模板没有残留占位符，TOML／SVG 格式通过检查。
5. 安装并校验签名的 `adw-gtk-theme 6.5-1`，补齐 GTK 主题基础文件。
6. Noctalia Greeter 和 greetd 已启用；通过软件自带的 `passwordless-sync enable yuan` 只授权同步登录界面外观。正常登录认证不变，未修改 PAM。

配置备份 `desktop-components-2026-11-16/before-configs.tar.gz`，系统配置备份 `before-system/`。同目录的 `system-components-result.json` 与 `user-config-validation.json` 记录正式系统写入和校验结果；该目录位于下文迁移工作目录内。默认启动仍为 Ubuntu。

当前已完成离线配置与生成文件校验；正式硬件上的动态壁纸播放、中文候选框和换壁纸联动仍需下一次登录 Arch 观察。使用方法见 [[Arch 桌面使用小抄]]。

### 安装做了什么

1. 原 Windows C: 整分区复制到 HGST，约 `187599683584` 字节，读回哈希一致；独立 USB EFI、BCD 和启动驱动已配置。
2. 原 NTFS 有簇计数问题；隔离 WinRE 修复因 `0xc0000428` 未完成，已恢复正常 Windows 引导与原版恢复镜像。
3. 用户之后明确跳过 Windows 验证，并确认清空原 C: 和“新加卷”，包括未备份的数据。**C: 克隆不包含“新加卷”全部个人文件与程序。**
4. 在临时目录离线装好 Arch 并检查，再合并原 p3＋p4，写入系统。装有普通／LTS 双内核、Intel 微码、NVIDIA open 驱动、网络、蓝牙、声音、中文字体和 8GiB 交换文件。
5. 新增 `EFI/Arch/grubx64.efi`；已有 EFI 文件哈希全部不变，Ubuntu 保留。用户已确认 Arch 正常启动，之后按要求重新核验默认 Ubuntu。

复制阶段、修改引导前的 Windows 分区 SHA256：
`84f4d4d5833b7bd9c8cc60e3b0e64a18b0b17456aa6d8888e7c5e3589a8e3455`。

### 之后若要检查外置 Windows

接上 HGST，用 F12 选它的 UEFI USB 入口；有些固件显示 `EFI USB Device`。进入 Windows 后，以管理员 PowerShell 运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Migration\Verify-WindowsUSB.ps1
```

结果在 `C:\Migration\boot-verification.txt` 和 `.json`。它检查 C: 和系统 EFI 是否都在外置盘，并扫描文件系统。旧脚本中的“保留原分区”是较早的提醒；原分区目前已经删除。

Windows 启动失败时记录错误代码，F12 返回 Ubuntu。旧 `vm-test`、`vm-repair` 试验镜像未通过验证，已作为临时文件清理；小诊断记录已归档。

### 旧 Windows 启动项已清理（2026-11-16）

旧入口指向内置共享 EFI 中的 `EFI/Microsoft/Boot/bootmgfw.efi`，对应的原 Windows 系统已删除。本次只删除 Boot0004 固件记录，Ubuntu 与 Arch 入口保持不变，Ubuntu 仍是默认；磁盘分区、EFI 文件与外置 Windows 均未改动。

备份：工作目录 `arch-install/stale-windows-entry-backup-2026-11-16/`；结果：`arch-install/stale-windows-entry-removal-result.json`。

### 文件都放在哪里

Ubuntu 工作目录：`/home/yuan/Downloads/system-migration-2026-11-15/`。

| 路径 | 内容 |
| --- | --- |
| `arch-install/install-result.json`、`status.json` | Arch 安装结果与状态 |
| `arch-install/ubuntu-default-result.json` | 默认 Ubuntu 的核验结果 |
| `arch-install/install.log` | 安装日志 |
| `arch-install/before-arch/` | 清盘前 GPT 与共享 EFI 备份 |
| `preflight-20261115T072609Z/` | 较早的内外置盘 GPT、共享 EFI 备份 |
| `arch-prep/` | 保留 ISO、原稳定版源码和验证记录；Bootstrap、重复包缓存及临时根目录已清理 |
| `hive-backups/` | 私密注册表备份，只留本机，不放公开仓库 |

离线材料另有一份在外置 Data 的 `Installers-20261115/`，总计约 3.8GiB。720 个官方包的哈希和签名已验证，断网依赖检查通过；它不包括所有可选软件或 Windows 完整安装 ISO。

**以后只需要选系统、用桌面，不要重跑首次分区和安装脚本。** 显卡、音频、Wi-Fi、休眠等逐项硬件验收仍可继续；“能正常启动”不等于这些全部测完。

### 2026-11-16 正式安装作者自制 Shell 与清理

- 用户改为要求直接正式安装，未先创建自制 Shell 预览版。源码固定提交 `2ed257103b9010f004a7c01cd6321937ca4d5aa7`，保存在 Arch 的 `~/Nyxuri-Shell/`。原 `~/Nyxuri/` 稳定版保留。
- 安装 Quickshell 0.3.2、matugen、Qt5 兼容模块与 Material Symbols 字体等 8 个签名包；通过项目原子复制机制部署 `~/.config/quickshell/nyxuri-shell/`，更新 Niri 两个 Shell 网关；没有整套覆盖 Niri、输入法或 Noctalia 配置。
- 当前 CLI 由 `~/.local/bin/nyxuri` 指向新引擎。自制 Shell 已设为默认，采用深色分组顶栏、应用菜单和深色森林配色。Noctalia Greeter 写入同一背景与对应暗色调色板；PAM 保持原样。
- 新启动包装器会检查就绪状态，失败时尝试回退 Noctalia。用户命令见 [[Arch 桌面使用小抄]]；原配置和登录页备份在 `custom-shell-2026-11-16/`。
- 已验证包文件无缺失、Niri 配置、脚本语法、50 色调色板生成、CLI 状态与图标字体。正式硬件显示、动态壁纸、锁屏等仍待实际登录验收；当前源码不是视频的逐帧复刻。
- 清理 Ubuntu 上旧预览、11GB 安装暂存根、临时 bootstrap 环境、重复缓存和失败 Windows 试验镜像，实际释放约 **16.3GiB**；保留迁移备份、恢复镜像、Arch ISO 和日志。清理清单在 `custom-shell-2026-11-16/cleanup-result.json`。
- **Arch 内部**另行审计：730 个已安装包，无孤立软件；2.4GiB 缓存全为当前版本、没有重复；临时目录为空。因此保留该份离线软件包，未将 Ubuntu 的释放量记作 Arch 释放量。
- 默认启动仍是 Ubuntu。此后重新开预览会创建新的临时镜像，并在窗口关闭后自动清理大文件。

#### 自制 Shell 预览中的启动修正

首次预览发现：通用部署复制过滤了运行时需要的 `manifest.toml`，导致界面单元数为零；另缺少 Qt WebP 解码插件。已逐文件补回 11 个插件清单，正式安装 `qt6-imageformats` 及所需的 jasper、libmng、freeglut、glu（签名和文件检查通过）。未保留排查用的临时 QML 改动。

启动就绪检查已改为确认顶栏、应用菜单、设置和壁纸单元实际加载；正常重启时不再额外启动 Noctalia。重新从正式系统创建的预览已显示单套深色顶栏和森林壁纸，菜单与设置在前一轮验证可用；正式硬件仍待登录验收。修正脚本与结果记录在 `custom-shell-2026-11-16/`。
