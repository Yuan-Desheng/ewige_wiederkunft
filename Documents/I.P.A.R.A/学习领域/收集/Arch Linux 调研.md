---
createTime: 2026-08-17 11:17
笔记ID: 20260817111738
multiFile:
multiMedia:
description: Legion Y7000 IRX9 双盘双系统换 Arch 的调研与实操：硬件登记、认盘与备份、BIOS 设置、archinstall 安装、NVIDIA 混合显卡与中文环境、pacman/AUR 维护、风险与选型
笔记类型: 收集笔记
阐述日期:
tags:
  - Linux
  - ArchLinux
  - 调研
  - 装机
aliases:
  - Arch
  - Windows换Arch
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Arch Linux 调研
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="30" max="100" style="width: 100%;"></progress>

> 调研时间 2026-08-17。**目标场景（2026-08-17 按本机实测定稿）：本机 Lenovo Legion Y7000 IRX9 笔记本，双 NVMe 硬盘——Windows 盘不动，另一块 Ubuntu 盘整盘换成 Arch，双硬盘双系统。**
> 结论先行：可行，全程约 1-2 小时。真正的风险不在装系统（archinstall 已经很成熟），而在**装之前的数据备份**和**装之后的硬件驱动 + 中文环境**。发行版选择上，除非就是想折腾，否则建议直接上 **EndeavourOS**（原版 Arch + 图形安装器，装完即用）。

---

## 〇、硬件信息登记表（✅ 已填，2026-08-17 本机 Windows 实测）

已于 2026-08-17 在本机 Windows 下逐项实测填入「实际值」列。一句话结论：**微码选 `intel-ucode`、显卡走 `nvidia-open`、无线网卡内核原生支持、UEFI 且 Secure Boot 已是关的**——四件最容易翻车的事全部绿灯。

| # | 项目 | Windows 下怎么查 | 这项决定什么 | 实际值 |
|---|------|------------------|--------------|--------|
| 1 | 台式 / 笔记本 | 自己看 | 笔记本要额外配电源管理、触控板、亮度键、休眠 | **笔记本**（Chassis Type 10）→ 装完要配电源管理、亮度键 |
| 2 | 厂商 + 型号 | `Get-CimInstance Win32_ComputerSystem \| Select Manufacturer,Model` | 能否在 ArchWiki 搜到专属页面（很多机型有现成踩坑记录） | **Lenovo Legion Y7000 IRX9**（机型码 83JJ，BIOS PTCN14WW） |
| 3 | CPU | `Get-CimInstance Win32_Processor \| Select Name,NumberOfCores` | 微码包选 `intel-ucode` 还是 `amd-ucode`；CachyOS 的 v3/v4 优化包能否用 | Intel Core **i7-13650HX**，14 核 20 线程（Raptor Lake-HX）→ 装 `intel-ucode`；支持 x86-64-v3（无 AVX-512，v4 用不了） |
| 4 | **显卡（最关键）** | `Get-CimInstance Win32_VideoController \| Select Name,AdapterRAM,DriverVersion` | NVIDIA / AMD / Intel 三条完全不同的驱动路线，见第五节 | **NVIDIA RTX 4060 Laptop GPU（8GB，Ada 架构）** → 第五节走 `nvidia-open-dkms` 路线 |
| 5 | 是否双显卡（核显+独显） | 上一条如果列出两个设备 | 笔记本混合显卡要配 PRIME / optimus-manager | 是：Intel UHD 核显 + RTX 4060 独显 → 混合显卡，要配 PRIME |
| 6 | 内存容量 | `Get-CimInstance Win32_PhysicalMemory \| Select Capacity,Speed` | 决定 swap 大小、要不要开休眠（hibernate 需 swap ≥ 内存） | **24GB（2×12GB DDR5-4800，Ramaxel，两个插槽已占满）**；swap 用 zram 即可，要休眠才需 ≥24GB 真实 swap（建议放弃休眠） |
| 7 | 硬盘（型号/容量/接口） | `Get-PhysicalDisk \| Select FriendlyName,MediaType,Size` + `Get-Disk \| Select Number,FriendlyName,PartitionStyle` | 分区方案；**多块盘时务必确认要格式化的是哪块**（`Number` 列） | 两块 NVMe SSD 各 512GB：**Disk 0 YMTC = Windows 系统盘（C+D+恢复分区），全程不碰；Disk 1 SDHSJ-MA500 = 现 Ubuntu 盘，即 Arch 目标盘**。序列号见下方双盘对号表 |
| 8 | BIOS 模式（UEFI / Legacy） | `msinfo32` → 看「BIOS 模式」一行 | UEFI 才能用 systemd-boot；Legacy 只能 GRUB + MBR | **UEFI** ✅（Win11 26200）；**Secure Boot 当前已是关闭状态** ✅（注册表 UEFISecureBootEnabled=0） |
| 9 | 无线网卡型号 | `Get-NetAdapter \| Select Name,InterfaceDescription` | Broadcom / 部分 Realtek 网卡需要额外固件，**装之前必须确认**，否则装完没网 | **Realtek RTL8852BE WiFi 6** → 内核 `rtw89` 驱动原生支持、固件 `linux-firmware` 自带 ✅，但这块卡在 Arch 上有**断流 / 睡眠唤醒后掉卡 / 速度慢**的通病，装完照第五节第 4 项加一行 modprobe 配置即可根治 |
| 10 | 有线网口 | 同上 | 有网口就是保险绳：无线驱动挂了还能插网线救 | 有：Realtek PCIe GbE 千兆网口（当前未插线，装机时插上即是保险绳） |
| 11 | 蓝牙 | `Get-PnpDevice -Class Bluetooth \| Select FriendlyName,Status` | 是否需要 `bluez` + 固件 | 有：Realtek 蓝牙（RTL8852BE 二合一）→ `bluez` + `bluez-utils`，固件 `linux-firmware` 自带 |
| 12 | 显示器分辨率 / 刷新率 / 几块屏 | `Get-CimInstance Win32_VideoController \| Select CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate` | HiDPI 缩放、多屏、高刷是否要走 Wayland | 双屏：内屏 **1920×1080@144Hz**（核显输出）+ 外接 **3440×1440@60Hz** 带鱼屏（独显输出）；均非 HiDPI，X11/Wayland 皆可 |
| 13 | 指纹 / 摄像头 / 读卡器等特殊外设 | 设备管理器里翻一遍 | 指纹在 Linux 上支持率很低，提前有心理预期 | 摄像头 ×2（Integrated Camera + TranScreen Camera）；**未检测到指纹**；未见读卡器 |

**本机双盘对号（装前必读）**：

| 盘 | 型号 / 序列号 | 现状 | 动作 |
|----|---------------|------|------|
| Disk 0 | YMTC YMSS2ED06D25MC（Serial `A428_B75E_56F8_0049`） | Windows：EFI 260M + C 175G + D 300G + 恢复分区 | **全程不碰** |
| Disk 1 | SDHSJ-MA500（Serial `0000_0030_3735_3738`） | Ubuntu：单个 Linux 分区占满整盘（无自己的 EFI 分区） | **格掉装 Arch** |

- Windows 和 Linux 的磁盘编号**不保证一致**（Linux 下可能是 `/dev/nvme0n1` 也可能是 `/dev/nvme1n1`）。进 Live 环境后用 `lsblk -o NAME,MODEL,SERIAL,SIZE` 按**型号/序列号**认盘，认准 SDHSJ-MA500 再动手。
- Ubuntu 盘上没有自己的 EFI 分区，说明现在 Ubuntu 的 GRUB 大概率装在 Windows 盘的 ESP 里。格盘后旧引导项残留但无害（进 Arch 后 `efibootmgr` 可清）；给 Arch 分区时让 archinstall **在目标盘上新建 ESP**（best-effort default layout 就是这么做的），Windows 盘一个字节都不用动。
- 双系统切换：Legion 开机按 `F12` 进启动菜单选盘，或在 BIOS 里调启动顺序。

**懒人一把梭（推荐）**：不用逐条敲命令，直接出两份报告：

```powershell
# PowerShell（管理员）—— 生成完整系统报告
msinfo32                       # 图形界面，文件 → 导出，存成 txt
dxdiag                         # 图形界面，点「保存所有信息」，存成 txt
```

**更准的办法（强烈推荐）**：制作好 Arch 安装 U 盘后（第三节），先**用 U 盘启动到 Live 环境但不安装**，跑下面两条命令，直接看 Linux 视角认到了什么硬件——这比在 Windows 里查准得多：

```bash
lspci -nnk          # 列出所有 PCI 设备 + 当前使用的内核驱动（显卡/网卡看这个）
lsusb               # USB 设备
ip link             # 网卡是否被识别
inxi -Fxz           # 一把梭总览（Live 环境自带）
```

> 把 `lspci -nnk` 的输出拍照 / 抄下来给我，显卡和网卡的方案就能直接定死。

---

## 一、迁移前置：动手之前要先做的事

### 1. 数据备份（**不可逆操作，这步做完才能动手**）

本机是**双盘双系统**：Windows 盘（Disk 0）不动，要格的只有 Ubuntu 盘（Disk 1）。所以真正要抢救的是 **Ubuntu 盘上的东西**：

| 类别 | 具体内容 | 备注 |
|------|----------|------|
| **Ubuntu 家目录** | `~/文档`、`~/下载`、`~/桌面`、自己建的工作目录 | 格盘后全没，且无法恢复 |
| **`~/.ssh`** | 私钥 + `config` | 最容易漏、丢了最疼的东西 |
| **本地仓库** | 每个项目跑一遍 `git status` / `git log origin/master..HEAD` | 未 commit 的改动、未 push 的分支 |
| **各类配置** | `~/.gitconfig`、`~/.bashrc` / `~/.zshrc`、`~/.config/` 下在意的、各种 `.env` 和 token | `.env` 里的密钥另存密码管理器 |
| **数据库 / 容器数据** | 本地 MySQL/PG 数据目录、Docker volume（`docker volume ls`） | 跑过本地服务就要确认 |
| **浏览器** | 书签导出 HTML、确认账号已同步 | |
| **WiFi 密码** | 装完 Arch 要重新连 | 先记到手机 |

Windows 盘虽然不动，但**误格盘是这套流程里唯一的灾难性风险**，所以：
- 备份去向选**外置硬盘 / NAS / 云**，不要往 Windows 盘的 D 盘里塞（万一手抖选错盘就一起没了）
- Windows 那边的关键数据（微信记录、文档）顺手也备一份，纯属买保险

> 双系统的好处：网银 U 盾、Office、带反作弊的网游这些 Linux 无解的场景，**开机 F12 切回 Windows 就行**，不需要为了换系统做任何取舍。

### 2. Windows 软件在 Linux 这边怎么办（切回 Windows 之外的选项）

| Windows 软件 | Linux 上怎么办 |
|--------------|----------------|
| 微信 | 官方已出 Linux 版（AUR: `wechat`），可用但功能少于 Windows 版 |
| QQ | 官方 Linux 版（`linuxqq`），可用 |
| 钉钉 / 飞书 | 都有官方 Linux 版，飞书体验较好 |
| Office | **没有原生版**。替代：WPS Linux 版（AUR `wps-office-cn`）/ OnlyOffice / 网页版 Office |
| Adobe 全家桶 | **没有，且基本无解**。替代：GIMP / Krita / Darktable / DaVinci Resolve |
| 微信小程序开发者工具 / 各类国产客户端 | 多数没有，需 Wine 或放弃 |
| 游戏 | Steam + Proton 兼容层，大部分单机能跑；**带反作弊的网游（如部分竞技游戏）跑不了** |
| 网银 / U 盾 / 税务系统 | 基本全灭，需要保留一台 Windows 或虚拟机 |

> 表里这些「Linux 无解」的项，在本机都不构成问题——**留着 Windows 盘就是答案**。真正需要在 Arch 这边解决的，只有日常开发和上网。

### 3. BIOS / UEFI 设置（Legion：开机按 `F2`，或关机状态按机身侧面的小孔 Novo 键）

| 设置项 | 本机现状 | 要不要动 |
|--------|----------|----------|
| Secure Boot | **已关闭** ✅（注册表实测 `UEFISecureBootEnabled=0`） | 不用动 |
| BIOS 模式 | **UEFI** ✅ | 不用动 |
| Intel VMD / RST | 当前 Ubuntu 能正常跑在 Disk 1 上 → **Linux 已能看到两块 NVMe** ✅ | 不用动。装机时若 archinstall 只列出一块盘，回 BIOS 关掉 VMD |
| Fast Boot / 快速启动 | 未知 | **关掉**，否则 U 盘可能启不来 |
| 显卡模式（Hybrid / 独显直连 MUX） | 未知，默认多为 Hybrid | **保持 Hybrid**。切「独显直连」后核显被断开，Linux 下功耗和续航会明显变差；外接屏的问题用第五节的 PRIME 方案解，不要靠切 MUX |
| 启动顺序 | — | 装机时按 `F12` 临时选 U 盘即可，不用改默认顺序 |

> ⚠️ **改 BIOS 前先把 Windows 的 BitLocker 恢复密钥找出来**（`https://aka.ms/myrecoverykey`，或 Windows 里运行 `manage-bde -status` 看 C 盘是否加密）。本机 Secure Boot 本来就是关的、也不会动 Windows 分区，触发恢复的概率很低，但改任何固件设置都有可能让 BitLocker 要密钥，手上有密钥就是零风险。

**双系统的时间差 8 小时问题（装完必处理）**：Linux 认为主板时钟是 UTC，Windows 认为是本地时间，两个系统轮流改，导致时间一直错 8 小时。**统一让 Windows 也用 UTC** 是最干净的解法——在 Windows 管理员 PowerShell 里执行：

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /t REG_DWORD /d 1 /f
```

Arch 这边保持默认（`timedatectl set-local-rtc 0`，即用 UTC）即可，两边都开 NTP 自动同步。

---

## 二、Arch 是什么（先确认这是你要的东西）

| 维度 | 说明 |
|------|------|
| 理念 | KISS（Keep It Simple, Stupid）——「简单」指**架构上不做多余封装**，不是「上手容易」 |
| 发布模式 | **Rolling release**（滚动更新），没有大版本升级，`pacman -Syu` 就是唯一升级路径 |
| ISO | 每月 1 号发一版，只是**安装介质快照**，装完立刻 `-Syu` 就和最新一致 |
| 包管理 | `pacman`（官方仓库 core / extra / multilib）+ **AUR**（社区 PKGBUILD 脚本仓库，非二进制） |
| 装完默认是什么 | 手动装的话是一个**没有桌面、没有网络管理器、没有声音**的裸命令行系统；用 archinstall 可以一次配齐 |
| 杀手锏 | **ArchWiki**——全 Linux 生态公认最好的文档，连 Ubuntu/Debian 用户都在查 |

**2026 年现状**：最新 ISO `2026.07.01`，内核 **Linux 7.0.x**，`archinstall` **4.4**（基于 Python 3.14+ 和 Textual TUI，支持全盘 LUKS2 加密、firewalld 菜单、GRUB UKI 引导项）。官方立场不变：archinstall **不会**帮你装 yay / paru，官方认为用户应自己审 PKGBUILD——这点在 6 月的 AUR 投毒事件后显得很有先见之明（见第七节）。

---

## 三、制作安装 U 盘（在本机 Windows 下做）

需要一个 **≥ 4GB 的 U 盘**（会被格式化）。

```
1. 下载 ISO：https://archlinux.org/download/  （选国内镜像，如清华 TUNA / 中科大）
   文件名形如 archlinux-2026.08.01-x86_64.iso

2. 校验完整性（可选但建议）：
   Windows PowerShell:  Get-FileHash .\archlinux-2026.08.01-x86_64.iso -Algorithm SHA256
   与下载页的 sha256sums.txt 比对

3. 写入 U 盘，二选一：
   - Rufus（https://rufus.ie）：选 ISO → 分区类型 GPT → 目标系统 UEFI → 开始 → 选「以 DD 镜像模式写入」
   - Ventoy（https://ventoy.net）：给 U 盘装一次 Ventoy，之后 ISO 直接拷进去即可，可放多个系统，更推荐
```

> Ventoy 的好处：同一个 U 盘可以同时放 Arch、EndeavourOS、Windows 安装镜像和 PE，装崩了随时换方案。

---

## 四、安装（只格 Disk 1，Windows 盘全程不碰）

### 装之前：认盘（**这一步做错就是灾难，做两遍**）

进 Live 环境第一件事，不是装系统，是确认哪块盘是 Ubuntu 盘：

```bash
lsblk -o NAME,MODEL,SERIAL,SIZE,FSTYPE,MOUNTPOINTS
```

对照第〇节的双盘对号表：

- **目标盘 = `SDHSJ-MA500`，Serial `0000_0030_3735_3738`** —— 上面只有一个 Linux 分区，没有 EFI 分区
- **禁区 = `YMTC YMSS2ED06D25MC`，Serial `A428_B75E_56F8_0049`** —— 上面有 4 个分区（260M EFI + 175G NTFS + 300G NTFS + 恢复分区），看到 `ntfs` 就说明认错了

Linux 下的 `/dev/nvme0n1` 和 `/dev/nvme1n1` **不保证**对应 Windows 的 Disk 0 / Disk 1，**只认型号和序列号，不认编号**。

### 路线 A：archinstall（推荐，约 15 分钟）

U 盘启动进入 Live 环境后：

```bash
# 1. 联网
#    有线：插上网线一般自动获取 IP，ping 一下确认
ping -c 3 archlinux.org

#    无线：
iwctl
# [iwd]# device list
# [iwd]# station wlan0 scan
# [iwd]# station wlan0 get-networks
# [iwd]# station wlan0 connect 你的WiFi名称
# [iwd]# exit

# 2. 校时
timedatectl set-ntp true

# 3. 换国内镜像源（大陆网络必做，否则下载龟速）
vim /etc/pacman.d/mirrorlist
#    在文件最顶部加上：
#    Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
#    Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
#    Server = https://mirrors.aliyun.com/archlinux/$repo/os/$arch

# 4. 更新安装器本体
pacman -Sy archinstall

# 5. 起飞
archinstall
```

TUI 里逐项选（**本机 Legion Y7000 IRX9 双盘场景的推荐值**）：

| 菜单项 | 选什么 |
|--------|--------|
| Mirror region | China |
| **Disk configuration** ⚠️ | **只勾 SDHSJ-MA500 那块盘**（务必核对序列号）→ **Use a best-effort default partition layout** → 文件系统选 **btrfs**，勾上 "use compression"。它会在这块盘上新建自己的 ESP，**不会碰 Windows 盘的 ESP** |
| Disk encryption | 可开可不开。开 LUKS2 = 笔记本丢了数据安全，代价是每次开机多输一次密码。**开发机建议开** |
| Bootloader | **systemd-boot**（见下方「双系统怎么切」） |
| Swap | 开 **zram**（24GB 内存够用，不做休眠就不需要真实 swap 分区） |
| Hostname / Root password / User account | 建普通用户并勾 **superuser (sudo)** |
| Profile | **Desktop** → **KDE Plasma**（多屏 + 144Hz + 带鱼屏，Plasma 支持最好） |
| Audio | **pipewire** |
| Kernels | 勾上 `linux` **和** `linux-lts`；**再勾上 `linux-headers` 和 `linux-lts-headers`**（NVIDIA 的 dkms 驱动必需，漏了装完没显卡驱动） |
| Network configuration | **NetworkManager**（不要选 "copy ISO config"） |
| Additional packages | 见下方清单 |
| Timezone | Asia/Shanghai |

**双系统怎么切（两块盘各有自己的 ESP，所以有两条路）**：

| 方案 | 怎么用 | 取舍 |
|------|--------|------|
| **systemd-boot + `F12`**（推荐） | Arch 装在自己盘的 ESP 上，开机按 `F12` 选进哪块盘 | 两个系统**完全隔离**：Windows 大版本更新重写自己的 ESP 也绝对动不了 Arch 的引导。代价是每次进 Windows 要按一下 F12 |
| GRUB + os-prober | 装 `grub` `os-prober`，在 `/etc/default/grub` 里放开 `GRUB_DISABLE_OS_PROBER=false`，再 `grub-mkconfig -o /boot/grub/grub.cfg` | 一个统一菜单，开机直接选。代价是 Windows 更新偶尔会把引导顺序抢回去，需要重新修 |

> 本机建议走 **systemd-boot + F12**：Windows 是「偶尔切回去办事」的备胎，不值得为它引入引导被抢的风险。

**桌面环境选哪个**：

| 桌面 | 特点 | 适合 |
|------|------|------|
| **KDE Plasma** | 功能最全、设置项最多、界面最像 Windows、对 HiDPI/高刷/多屏支持最好 | **从 Windows 迁过来首选** |
| GNOME | 简洁统一、触控板手势最好、但定制受限 | 笔记本、喜欢 macOS 风格 |
| Hyprland / Sway | 平铺窗口管理器，纯键盘操作，极度需要配置 | 折腾党，不建议第一次装就上 |
| Xfce | 极轻量，老机器救星 | 硬件很老的机器 |

**Additional packages 里建议先勾上的**（装完就有网、有输入法、有浏览器，避免装完发现啥都干不了）：

```
git vim wget curl base-devel man-db man-pages
networkmanager bluez bluez-utils
firefox
fcitx5 fcitx5-chinese-addons fcitx5-gtk fcitx5-qt fcitx5-configtool
noto-fonts noto-fonts-cjk noto-fonts-emoji ttf-jetbrains-mono-nerd
htop fastfetch unzip p7zip
```

选完 → `Install` → 完成后拔 U 盘重启。

### 路线 B：手动安装（想真正搞懂 Arch 才走这条）

```bash
# 1. 确认 UEFI 启动模式（有输出即 UEFI 64 位）
cat /sys/firmware/efi/fw_platform_size

# 2. 联网 + 校时（同上）
iwctl
timedatectl set-ntp true

# 3. 分区（示例设备 /dev/nvme0n1，务必先 lsblk 确认盘符！）
lsblk
cfdisk /dev/nvme0n1        # 新建 GPT 表：EFI 分区 1G（类型 EFI System）+ root 剩余全部
mkfs.fat -F32 /dev/nvme0n1p1
mkfs.btrfs -f /dev/nvme0n1p2

# 4. 挂载
mount /dev/nvme0n1p2 /mnt
mount --mkdir /dev/nvme0n1p1 /mnt/boot

# 5. 装基本系统（微码包按 CPU 二选一：intel-ucode / amd-ucode）
pacstrap -K /mnt base linux linux-firmware linux-lts \
    base-devel vim networkmanager sudo man-db intel-ucode

# 6. 生成 fstab
genfstab -U /mnt >> /mnt/etc/fstab

# 7. 进入新系统
arch-chroot /mnt

# 8. 时区 / 硬件时钟
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc

# 9. locale：编辑 /etc/locale.gen 取消 en_US.UTF-8 和 zh_CN.UTF-8 的注释
vim /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
#    注：系统语言建议保持英文，出错信息好搜；中文由桌面环境单独设

# 10. 主机名
echo "archbox" > /etc/hostname

# 11. initramfs
mkinitcpio -P

# 12. root 密码 + 普通用户
passwd
useradd -m -G wheel zhanwei
passwd zhanwei
EDITOR=vim visudo          # 放开 %wheel ALL=(ALL:ALL) ALL 那一行

# 13. 引导器（systemd-boot）
bootctl install
#     还需手写 /boot/loader/entries/arch.conf，参考 ArchWiki
#     或用 GRUB：
# pacman -S grub efibootmgr
# grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
# grub-mkconfig -o /boot/grub/grub.cfg

# 14. 开机自启网络，退出重启
systemctl enable NetworkManager
exit
umount -R /mnt
reboot
```

> ⚠️ 手动安装最容易翻车的两步：**忘了装 `networkmanager` 并 enable**（重启后没网，只能再挂载 chroot 回去救）、**忘了装引导器**（直接进不了系统）。

---

## 五、装完第一件事：驱动与中文环境

> 本节已按本机实际硬件（i7-13650HX + Intel UHD 核显 + RTX 4060 Laptop + RTL8852BE）写成可直接抄的命令，不用再对号入座。

### 1. 显卡：Intel 核显 + RTX 4060 混合输出（本机最复杂的一块）

本机是 **muxless 混合显卡**：桌面跑在核显上省电，独显按需拉起来干重活。**关键事实：Legion Y7000/Y7000P IRX9 的 HDMI / DP / USB-C 视频口全部硬连到独显**——所以那块 3440×1440 带鱼屏想点亮，NVIDIA 驱动必须先装好、装对。

**第一步：开 multilib 仓库**（`lib32-*` 包需要，游戏和 Wine 也需要）

```bash
sudo vim /etc/pacman.conf
# 取消这两行的注释：
# [multilib]
# Include = /etc/pacman.d/mirrorlist
sudo pacman -Syu
```

**第二步：装驱动**（RTX 4060 是 Ada 架构，属于 Turing 之后，走开源内核模块 `nvidia-open`）

```bash
# 核显（Intel）
sudo pacman -S mesa lib32-mesa vulkan-intel lib32-vulkan-intel intel-media-driver

# 独显（NVIDIA）—— dkms 版才能同时伺候 linux 和 linux-lts 两个内核
sudo pacman -S nvidia-open-dkms nvidia-utils lib32-nvidia-utils \
               nvidia-settings nvidia-prime \
               linux-headers linux-lts-headers

# 微码（Intel CPU）
sudo pacman -S intel-ucode
```

**第三步：内核参数 + 早期加载**（不做这步，Wayland 下会花屏 / 外接屏点不亮）

```bash
# 1) 内核参数：systemd-boot 编辑 /boot/loader/entries/ 下的 .conf，
#    在 options 那一行末尾追加：
#    nvidia_drm.modeset=1 nvidia_drm.fbdev=1
sudo vim /boot/loader/entries/2026-*.conf

# 2) initramfs 里早期加载 nvidia 模块
sudo vim /etc/mkinitcpio.conf
#    MODULES=(nvidia nvidia_modeset nvidia_uvm nvidia_drm)
#    HOOKS 里如果有 kms，把它删掉（否则会抢先加载 nouveau）
sudo mkinitcpio -P
```

**第四步：修好「合盖睡眠后花屏 / 黑屏」**（笔记本 + NVIDIA 的经典坑，必做）

```bash
# 睡眠时保留显存内容
echo 'options nvidia NVreg_PreserveVideoMemoryAllocations=1 NVreg_TemporaryFilePath=/var/tmp' \
  | sudo tee /etc/modprobe.d/nvidia-power.conf

sudo systemctl enable nvidia-suspend.service nvidia-hibernate.service nvidia-resume.service
sudo reboot
```

**第五步：验证**

```bash
nvidia-smi                       # 能列出 RTX 4060 = 驱动装好了
lspci -nnk | grep -A3 VGA        # 看两块 GPU 各自绑定的驱动（i915 / nvidia）
prime-run glxinfo | grep "OpenGL renderer"   # 应显示 NVIDIA，说明按需卸载生效
glxinfo | grep "OpenGL renderer"             # 不加 prime-run 应显示 Intel
```

**日常怎么用**：

```bash
prime-run 程序名        # 让这个程序跑在独显上（游戏、CUDA、视频渲染）
# 不加 prime-run 就跑核显，省电
```

**外接 3440×1440 带鱼屏**：
- 视频口硬连独显，所以**必须**先完成上面的第三步（`nvidia_drm.modeset=1`），否则插上没信号
- KDE Plasma 6 + Wayland 下，跨 GPU 输出是原生支持的，正常情况插上直接点亮
- 如果 Wayland 下外接屏依然黑屏，两个后备方案：① 登录界面切 **X11** 会话，再 `xrandr --setprovideroutputsource NVIDIA-G0 modesetting`；② 让独显当主 GPU 全程驱动桌面（外接屏最省事，代价是续航明显变差）
- **不建议**去 BIOS 里切「独显直连 / MUX」来解决——切了核显被彻底断开，笔记本续航会崩

> 补充：`nvidia-open` 从 610 版起 **Runtime D3 电源管理默认全开**，独显闲时能真正断电，混合显卡的续航问题基本已经不是问题了。

### 1.5 无线网卡 RTL8852BE 稳定性（**装完立刻做，不然会怀疑人生**）

这块卡内核原生支持，但 ASPM 省电和 power save 会导致**随机断流、速度突然掉到几百 K、睡眠唤醒后网卡直接消失**。一个配置文件根治：

```bash
sudo tee /etc/modprobe.d/rtw89.conf <<'EOF'
options rtw89_pci disable_aspm_l1=y disable_aspm_l1ss=y
options rtw89_core disable_ps_mode=y
EOF

sudo reboot
```

> 有线千兆网口是保险绳：万一无线出问题，插网线照样能上网修。装机时建议**全程插着网线**。

### 1.6 Legion 专属工具（可选，装不上不影响用）

风扇曲线和性能模式（安静 / 均衡 / 野兽）在 Linux 下默认调不了，社区项目 [LenovoLegionLinux](https://github.com/johnfanv2/LenovoLegionLinux) 提供内核模块 + 控制工具：

```bash
paru -S lenovolegionlinux-dkms-git legion-dpm-git
```

> ⚠️ 该项目官方声明的支持范围是 **2020–2023 款 Legion**，本机 IRX9 是 2024 款，**属于「试试看」而非「保证可用」**。装完 `cat /sys/kernel/legion_laptop/*` 有输出才算认到；认不到就卸掉，用默认的散热策略照样能用，只是没法自定义风扇曲线。

### 2. 中文输入法（fcitx5）

```bash
sudo pacman -S fcitx5-im fcitx5-chinese-addons fcitx5-material-color
```

在 `~/.config/environment.d/im.conf` 写入（KDE/GNOME 下 Wayland 也认这个）：

```bash
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
```

重新登录后运行 `fcitx5-configtool` 添加「拼音」，默认 `Ctrl+Space` 切换。

### 3. 字体（不装的话中文会是方块）

```bash
sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji \
               wqy-zenhei ttf-jetbrains-mono-nerd
```

### 4. 网络 / 蓝牙 / 声音

```bash
sudo systemctl enable --now NetworkManager
sudo systemctl enable --now bluetooth
# 声音（archinstall 选了 pipewire 就已装好）
sudo pacman -S pipewire pipewire-pulse pipewire-alsa wireplumber
```

### 5. 笔记本电源与显示（本机 Legion）

**电源管理二选一，不能同时装**（两者抢同一套接口，装两个必冲突）：

```bash
# 方案 A：power-profiles-daemon（推荐给 KDE）
#   Plasma 电源面板里直接切 省电/平衡/性能，开箱即用
sudo pacman -S power-profiles-daemon
sudo systemctl enable --now power-profiles-daemon

# 方案 B：tlp（更激进，续航更好，但要自己调参）
sudo pacman -S tlp
sudo systemctl enable --now tlp
sudo systemctl mask power-profiles-daemon    # 二者互斥
```

其它：

```bash
sudo pacman -S powertop brightnessctl    # 功耗诊断 / 亮度调节
```

**内屏 144Hz 别忘了手动开**：KDE 系统设置 → 显示和监视器 → 刷新率，默认可能停在 60Hz。带鱼屏那台是 60Hz，两块屏刷新率不同时，Wayland 下各自独立刷新（X11 下会互相拖累，这也是建议用 Wayland 的原因之一）。

**触控板手势**：KDE/GNOME 在 Wayland 下开箱即用，不用装 libinput-gestures。

### 6. 常用软件

```bash
# 官方仓库
sudo pacman -S firefox chromium code neovim docker docker-compose \
               obsidian vlc gimp libreoffice-fresh flameshot

# AUR（先装 helper，见第六节）
paru -S google-chrome visual-studio-code-bin wechat linuxqq \
        wps-office-cn ttf-ms-fonts
```

---

## 六、包管理：pacman 与 AUR

### pacman 常用命令 / 与 Windows 习惯对照

| 目的 | pacman | 对照 |
|------|--------|------|
| 全量更新系统 | `pacman -Syu` | Windows Update |
| 装包 | `pacman -S 包名` | 装软件 |
| 卸载（连依赖和配置） | `pacman -Rns 包名` | 卸载 |
| 搜索仓库 | `pacman -Ss 关键词` | 应用商店搜索 |
| 查已装包 | `pacman -Qs 关键词` | 已安装程序列表 |
| 查文件属于哪个包 | `pacman -Qo /usr/bin/xxx` | — |
| 列出所有 AUR/外部包 | `pacman -Qm` | — |
| 列出孤儿依赖 | `pacman -Qtdq` | — |
| 清理包缓存 | `paccache -rk2`（需 `pacman-contrib`） | 磁盘清理 |

### AUR

AUR 不是二进制仓库，是**一堆用户提交的 PKGBUILD 构建脚本**，在本机现编译。装 helper：

```bash
# paru（Rust 写的，社区目前更推荐）
sudo pacman -S --needed base-devel git
git clone https://aur.archlinux.org/paru.git
cd paru && makepkg -si

# 之后
paru -S google-chrome
paru -Sua        # 只更新 AUR 包
```

**AUR 使用纪律（2026 年后不再是可选项）**：
1. 装之前看 PKGBUILD，重点看 `source=` 指向哪、`prepare()/build()` 里有没有 `curl | sh`
2. 优先选官方仓库有的版本，AUR 只作补充
3. 定期 `pacman -Qm` 审一遍自己到底装了哪些 AUR 包

---

## 七、日常维护：怎么不「滚挂」

滚动更新本身不会挂，**挂的都是操作不当**。四条铁律：

1. **永远全量更新，禁止部分更新**
   ```bash
   sudo pacman -Syu          # ✅ 唯一正确姿势
   sudo pacman -Sy 某个包    # ❌ 部分更新，最经典的滚挂原因（glibc 版本错配 → 系统崩）
   ```
   `-Sy` 单独用只刷新数据库不升级系统，后续任何安装都会拉入与旧系统不匹配的新包。唯一例外是 `pacman -Sy archlinux-keyring` 修钥匙。

2. **更新前扫一眼官方 News**：`https://archlinux.org/news/`。需要「manual intervention」的更新一年有好几次（2026 年内已有 `virtualbox-ext-vnc`、`kea`、`iptables → nft 后端`、`varnish → vinyl-cache` 等）。可装 `informant` 强制在更新前读新闻。

3. **快照兜底（最重要）**：Btrfs + snapper + `grub-btrfs`
   ```bash
   sudo pacman -S snapper snap-pac grub-btrfs
   sudo systemctl enable --now grub-btrfsd
   ```
   - `snap-pac`：每次 pacman 事务前后自动打快照
   - `grub-btrfs`：把快照挂到启动菜单，滚挂了直接从菜单选上一个快照进系统
   - 子卷布局：`@`（系统）、`@home`、`@snapshots`、`@swap`（含 swapfile 的子卷不能被快照，必须独立）

4. **保底内核**：同时装 `linux` 和 `linux-lts`，新内核起不来就在引导菜单切 LTS。

其它日常动作：

```bash
sudo pacman -Syu                    # 建议每周一次，别攒几个月
pacdiff                             # 处理 .pacnew / .pacsave 配置差异（需 pacman-contrib）
sudo paccache -rk2                  # 只保留最近 2 个版本的缓存，/var/cache/pacman/pkg 很吃盘
sudo pacman -Rns $(pacman -Qtdq)    # 清孤儿包
```

### ⚠️ 2026-06 AUR 供应链投毒（Atomic Arch）

- **时间线**：2026 年 6 月 11 日前后曝光，攻击者用 AUR 正常的「adopt 孤儿包」流程批量接管约 **1500 个无人维护的包**，篡改 PKGBUILD 注入恶意 npm 包 `atomic-lockfile`
- **载荷**：Rust 写的凭据窃取器，专扒开发机和 CI 上的密钥；拿到 root 后加载 **eBPF rootkit** 隐藏自己
- **后果**：Arch 一度**暂停 AUR 的包认领（adoption）功能**
- **边界**：**官方仓库 core / extra / multilib 未受影响**——它们有严格的打包者审核
- **应对**：`pacman -Qm` 列出所有 AUR 包比对受影响清单；若曾中招，轮换 SSH key、GitHub / npm token、云 API key

> 结论不是「AUR 不能用」，而是 **AUR 的信任模型 = 你自己审 PKGBUILD**。装 AUR 包的机器上不要放不能轮换的长期凭据。

### 其它常见坑

| 坑 | 说明 |
|----|------|
| 长期不更新 | 攒半年再 `-Syu` 极易撞上 keyring 过期 + 多个手动干预点叠加，比每周更新危险得多 |
| 磁盘被缓存吃满 | `/var/cache/pacman/pkg` 不自动清，配 `paccache.timer` |
| Secure Boot | 关掉最省事；想开需 `sbctl` 自己签名内核和引导器 |
| 文档依赖 | 遇到任何问题第一反应查 ArchWiki，不要搜中文博客——博客常年过期 |

---

## 八、发行版选型：原版 Arch 还是 Arch 系？

| 发行版 | 定位 | 适合谁 |
|--------|------|--------|
| **Arch Linux** | 原教旨。手动装，纯净，无任何第三方补丁 | 想彻底搞懂 Linux 启动/初始化链路；愿意为可控性付时间 |
| **EndeavourOS** | 最贴近原版 Arch 的「带图形安装器版」，几乎不加自研工具，只额外加一个很小的 endeavouros 仓 | **从 Windows 迁过来的最优解**：要 Arch 的一切，但不想手敲 pacstrap；社区口碑极好 |
| **CachyOS** | 性能向：按 CPU 架构（x86-64-v3/v4）重编译全部包、自研调度器（BORE/sched-ext）、多内核可选 | 游戏、跑重 IDE、编译密集型；目前上升最快的 Arch 系 |
| **Manjaro** | 官方仓库**延迟约两周**发布以求稳，自研安装器和内核管理器 | 纯新手。但延迟发布 + AUR 按最新 Arch 写 → **两者混用易出依赖冲突**，是它最被诟病的点 |

**针对本机（Legion Y7000 IRX9，替换掉 Disk 1 上的 Ubuntu）的建议**：

- **首选 EndeavourOS**：图形安装器（Calamares）里能直接勾 NVIDIA 驱动，把本节第五章最麻烦的显卡部分在装机时就办了；底层纯 Arch，ArchWiki 全部适用。**要注意**：Calamares 选盘界面同样要认准 SDHSJ-MA500，别选错
- **想顺便学 Linux** → 原版 Arch 走路线 B 手动装一遍。反正 Windows 盘不动、Ubuntu 盘数据已备份，装崩了重来的成本就是一小时
- **主要拿来打游戏** → CachyOS：i7-13650HX 支持 x86-64-v3，能吃到它的架构优化包；Steam + Proton 在 RTX 4060 上表现不错
- **别选 Manjaro**：延迟两周的仓库 + 按最新 Arch 写的 AUR，混用容易出依赖冲突
- **服务器场景（比如阿里云 ECS）绝对不要用 Arch**：滚动更新没有 LTS 承诺、一年数次需要人工干预、无长期安全支持分支、云厂商内核模块不适配。服务器继续用 Debian / Ubuntu LTS / Rocky

---

## 九、执行 Checklist

**装机前**
- [x] 填完第〇节硬件登记表（2026-08-17 本机实测）
- [x] 确认无线网卡在 Linux 下能用（RTL8852BE / rtw89 原生支持，另需一行 modprobe 调优），另有千兆网口兜底
- [x] Secure Boot 已是关闭状态，BIOS 为 UEFI，Linux 已能看到两块 NVMe（现有 Ubuntu 在跑）
- [ ] **Ubuntu 盘数据全部备份**（`~/.ssh`、未 push 的仓库、`.env`、Docker volume）到外置硬盘 / NAS，并**在另一台机器上验证能打开**
- [ ] WiFi 密码、各类账号密码已记录到手机 / 密码管理器
- [ ] 找出 Windows 的 BitLocker 恢复密钥备用
- [ ] 制作 U 盘（Ventoy 或 Rufus），校验 ISO 哈希
- [ ] BIOS：关 Fast Boot；显卡模式保持 Hybrid（**不要**切独显直连）
- [ ] Windows 侧写入 `RealTimeIsUniversal=1`，避免双系统时间差 8 小时

**装机中**
- [ ] 插上网线（无线出问题时的保险绳）
- [ ] Live 环境跑 `lspci -nnk` / `inxi -Fxz` 确认硬件识别
- [ ] **`lsblk -o NAME,MODEL,SERIAL,FSTYPE` 认盘两遍**：目标 = SDHSJ-MA500 / Serial `0000_0030_3735_3738`；看到 `ntfs` 立刻停手
- [ ] 换国内镜像源
- [ ] archinstall：**只勾目标盘** + btrfs + systemd-boot + zram + pipewire + NetworkManager
- [ ] 内核勾 `linux` `linux-lts` **+ `linux-headers` `linux-lts-headers`**（NVIDIA dkms 必需）
- [ ] Profile 选 KDE Plasma；附加包勾 fcitx5 全家桶 + noto CJK 字体 + firefox

**装机后（按顺序）**
- [ ] 开机按 `F12` 能分别进 Arch 和 Windows，两个系统都正常
- [ ] 联网：`nmtui` 连 WiFi
- [ ] 写 `/etc/modprobe.d/rtw89.conf` 修 WiFi 断流，重启验证
- [ ] 开 multilib 仓库
- [ ] 装 NVIDIA：`nvidia-open-dkms` + 内核参数 `nvidia_drm.modeset=1` + mkinitcpio MODULES + 睡眠三件套 service
- [ ] `nvidia-smi` 有输出、`prime-run glxinfo` 显示 NVIDIA
- [ ] 插上带鱼屏验证能点亮；内屏刷新率手动调到 144Hz
- [ ] 配 fcitx5 输入法环境变量并重登录，中文能打出来
- [ ] 装 snapper + snap-pac + grub-btrfs 快照兜底
- [ ] 电源管理二选一（power-profiles-daemon 或 tlp），验证合盖睡眠 → 唤醒不花屏
- [ ] 装 paru，再装 AUR 软件
- [ ] 跑一次 `sudo pacman -Syu` 确认更新链路通畅
- [ ] 笔记本：装 tlp 并 enable
- [ ] 跑一次 `sudo pacman -Syu` 确认更新链路通畅

---

## 十、延伸阅读

- [ArchWiki Installation Guide](https://wiki.archlinux.org/title/Installation_guide) — 唯一权威安装文档
- [ArchWiki General recommendations](https://wiki.archlinux.org/title/General_recommendations) — 装完之后该干什么，全部在这
- [Arch Linux News](https://archlinux.org/news/) — 更新前必看，可订阅 RSS
- [Arch Linux 官方公告：Active AUR malicious packages incident](https://archlinux.org/news/active-aur-malicious-packages-incident/)
- [ArchWiki: NVIDIA](https://wiki.archlinux.org/title/NVIDIA) / [Fcitx5](https://wiki.archlinux.org/title/Fcitx5) / [Snapper](https://wiki.archlinux.org/title/Snapper) / [Laptop](https://wiki.archlinux.org/title/Laptop)
- **本机相关**：[ArchWiki: PRIME](https://wiki.archlinux.org/title/PRIME) / [NVIDIA Optimus](https://wiki.archlinux.org/title/NVIDIA_Optimus)（混合显卡按需卸载）
- [LenovoLegionLinux](https://github.com/johnfanv2/LenovoLegionLinux)（Legion 风扇曲线 / 性能模式，官方支持列表止于 2023 款）
- [Arch 论坛：RTL8852BE 断流合集](https://bbs.archlinux.org/viewtopic.php?id=298372)（`disable_aspm` 解法出处）
- [linux-on-lenovo-legion 笔记](https://github.com/cszach/linux-on-lenovo-legion)
- [EndeavourOS 官网](https://endeavouros.com/) / [CachyOS 官网](https://cachyos.org/)
- [Ventoy](https://ventoy.net) — 多系统启动 U 盘
- [Arch Linux 2026.07.01 ISO 发布说明](https://www.linuxcompatible.org/story/arch-linux-20260701-iso-released-with-kernel-7010-and-archinstall-44/)
- [Phoronix：AUR 事件超 1500 个包受影响](https://www.phoronix.com/news/Arch-Linux-AUR-More-Than-1500)

相关笔记：[[Linux]]、[[Windows安装Ubuntu （双系统）]]、[[Ubuntu 安装 Windows 虚拟机]]
