---
createTime: 2026-08-17 11:17
笔记ID: 20260817111738
multiFile:
multiMedia:
description: 把一台 Windows 电脑全盘换成 Arch Linux 的调研与实操：硬件登记、备份清单、BIOS 设置、archinstall 安装、驱动与中文环境、pacman/AUR 维护、风险与选型
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
<progress value="20" max="100" style="width: 100%;"></progress>

> 调研时间 2026-08-17。**目标场景：另一台 Windows 电脑，全盘覆盖，只留 Arch，不做双系统。**
> 结论先行：可行，全程约 1-2 小时。真正的风险不在装系统（archinstall 已经很成熟），而在**装之前的数据备份**和**装之后的硬件驱动 + 中文环境**。发行版选择上，除非就是想折腾，否则建议直接上 **EndeavourOS**（原版 Arch + 图形安装器，装完即用）。

---

## 〇、硬件信息登记表（**待填** ⬅ 先填这张表，后面所有方案都按它定）

在**那台 Windows 机器**上按下表查一遍，填进「实际值」列。填完我按硬件出针对性的驱动 / 安装方案。

| # | 项目 | Windows 下怎么查 | 这项决定什么 | 实际值 |
|---|------|------------------|--------------|--------|
| 1 | 台式 / 笔记本 | 自己看 | 笔记本要额外配电源管理、触控板、亮度键、休眠 | |
| 2 | 厂商 + 型号 | `Get-CimInstance Win32_ComputerSystem \| Select Manufacturer,Model` | 能否在 ArchWiki 搜到专属页面（很多机型有现成踩坑记录） | |
| 3 | CPU | `Get-CimInstance Win32_Processor \| Select Name,NumberOfCores` | 微码包选 `intel-ucode` 还是 `amd-ucode`；CachyOS 的 v3/v4 优化包能否用 | |
| 4 | **显卡（最关键）** | `Get-CimInstance Win32_VideoController \| Select Name,AdapterRAM,DriverVersion` | NVIDIA / AMD / Intel 三条完全不同的驱动路线，见第五节 | |
| 5 | 是否双显卡（核显+独显） | 上一条如果列出两个设备 | 笔记本混合显卡要配 PRIME / optimus-manager | |
| 6 | 内存容量 | `Get-CimInstance Win32_PhysicalMemory \| Select Capacity,Speed` | 决定 swap 大小、要不要开休眠（hibernate 需 swap ≥ 内存） | |
| 7 | 硬盘（型号/容量/接口） | `Get-PhysicalDisk \| Select FriendlyName,MediaType,Size` + `Get-Disk \| Select Number,FriendlyName,PartitionStyle` | 分区方案；**多块盘时务必确认要格式化的是哪块**（`Number` 列） | |
| 8 | BIOS 模式（UEFI / Legacy） | `msinfo32` → 看「BIOS 模式」一行 | UEFI 才能用 systemd-boot；Legacy 只能 GRUB + MBR | |
| 9 | 无线网卡型号 | `Get-NetAdapter \| Select Name,InterfaceDescription` | Broadcom / 部分 Realtek 网卡需要额外固件，**装之前必须确认**，否则装完没网 | |
| 10 | 有线网口 | 同上 | 有网口就是保险绳：无线驱动挂了还能插网线救 | |
| 11 | 蓝牙 | `Get-PnpDevice -Class Bluetooth \| Select FriendlyName,Status` | 是否需要 `bluez` + 固件 | |
| 12 | 显示器分辨率 / 刷新率 / 几块屏 | `Get-CimInstance Win32_VideoController \| Select CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate` | HiDPI 缩放、多屏、高刷是否要走 Wayland | |
| 13 | 指纹 / 摄像头 / 读卡器等特殊外设 | 设备管理器里翻一遍 | 指纹在 Linux 上支持率很低，提前有心理预期 | |

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

## 一、迁移前置：Windows 上要先做的事

### 1. 数据备份（**不可逆操作，这步做完才能动手**）

全盘覆盖 = Windows 分区和数据**全部消失，无法恢复**。逐项确认：

| 类别 | 具体内容 | 备注 |
|------|----------|------|
| 文档 / 照片 / 下载 | `C:\Users\用户名\` 下的 桌面、文档、图片、下载、视频 | 最容易漏「桌面」和「下载」 |
| 浏览器 | 书签导出成 HTML、确认已登录账号同步 | Chrome/Edge 密码要单独导出 CSV |
| 微信 / QQ 聊天记录 | 微信「备份与迁移」→ 备份到手机；或直接拷 `我的文档\WeChat Files\` | **Linux 上恢复不了 Windows 的聊天备份，只能靠手机端** |
| 开发环境 | `.ssh` 私钥、`.gitconfig`、各种 token / `.env`、本地未 push 的仓库 | `git status` 每个项目扫一遍有没有未提交的改动 |
| 软件授权 | Office / Adobe / IDEA 等的账号和授权码 | |
| 系统凭据 | 浏览器/系统里存的 WiFi 密码、各类登录 | 装完 Arch 要重新连 WiFi，**先把 WiFi 密码记下来** |
| 驱动备份（可选） | 无线网卡的 Windows 驱动 | 万一要回滚 Windows |

备份去向：外置硬盘 / NAS / 云盘，**不要备份到本机另一个分区**（全盘覆盖会一起删）。

### 2. Windows 软件的 Linux 处境（决定要不要真换）

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

> ⚠️ **如果这台机器有网银、U 盾、Office 强需求或带反作弊的网游，全盘覆盖前要想清楚**——这些在 Linux 上是真的没有替代方案。

### 3. BIOS / UEFI 设置

进 BIOS（开机狂按 `Del` / `F2` / `F12`，看厂商），改这几项：

| 设置项 | 改成 | 原因 |
|--------|------|------|
| Secure Boot（安全启动） | **关闭** | Arch 默认不签名，开着装不了（后期可用 `sbctl` 自己签名再打开） |
| Fast Boot / 快速启动 | 关闭 | 会跳过 USB 设备检测，U 盘启不来 |
| SATA Mode | **AHCI**（不要 RAID/Intel RST） | RST 模式下 Linux 直接看不到硬盘，这是最常见的「装机时找不到硬盘」原因 |
| Boot Mode | UEFI | 除非是十年以上的老机器 |
| TPM | 无所谓 | 不做双系统就不用管 BitLocker |

同时在 Boot 菜单里把 U 盘调到第一启动项，或开机按 `F12` 临时选。

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

## 三、制作安装 U 盘（在现在这台能用的电脑上做）

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

## 四、安装（全盘覆盖）

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

TUI 里逐项选（**全盘覆盖场景的推荐值**）：

| 菜单项 | 选什么 |
|--------|--------|
| Mirror region | China |
| Disk configuration | **Use a best-effort default partition layout** → 选中目标硬盘 → 文件系统选 **btrfs**（为快照做准备，勾上 "use compression"） |
| Disk encryption | 笔记本建议开 LUKS2；台式机自己权衡（开了每次开机要输密码） |
| Bootloader | **systemd-boot**（UEFI 下最省事）；Legacy BIOS 只能 GRUB |
| Swap | 开（zram 或 swapfile）；要休眠则 swap ≥ 内存容量 |
| Hostname / Root password / User account | 建立普通用户并勾 **superuser (sudo)** |
| Profile | **Desktop** → 选桌面环境（见下） |
| Audio | **pipewire** |
| Kernels | 勾上 `linux` **和** `linux-lts`（保底内核，新内核起不来时切它） |
| Network configuration | **NetworkManager**（不要选 "copy ISO config"） |
| Additional packages | 见下方清单 |
| Timezone | Asia/Shanghai |

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

### 1. 显卡驱动（**按第〇节表格第 4 项对号入座**）

```bash
# ── Intel 核显 ──（最省心）
sudo pacman -S mesa vulkan-intel intel-media-driver

# ── AMD 显卡 / 核显 ──（同样省心，驱动在内核里）
sudo pacman -S mesa vulkan-radeon libva-mesa-driver

# ── NVIDIA 独显 ──（最麻烦，三选一）
# a) Turing（GTX 16 / RTX 20 系）及更新 → 推荐开源内核模块
sudo pacman -S nvidia-open-dkms nvidia-utils lib32-nvidia-utils

# b) Maxwell / Pascal（GTX 9 系 / 10 系）→ 用闭源版
sudo pacman -S nvidia-dkms nvidia-utils lib32-nvidia-utils

# c) 更老的卡（Kepler 及以前）→ 只能上旧分支 AUR 包，如 nvidia-470xx-dkms
```

> ⚠️ **NVIDIA 590 驱动起已停止支持 Pascal（GTX 10 系）及更早的卡**，老卡必须锁旧分支。装 NVIDIA 后要把 `nvidia_drm.modeset=1` 加进内核参数，Wayland 才正常。
> 装 `*-dkms` 版的前提是装了 `linux-headers` 和 `linux-lts-headers`。

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

### 5. 笔记本额外项（如果是笔记本）

```bash
sudo pacman -S tlp powertop           # 电源管理，显著延长续航
sudo systemctl enable --now tlp
sudo pacman -S brightnessctl          # 亮度调节
# 触控板手势：KDE/GNOME 在 Wayland 下开箱即用
```

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

**针对这台 Windows 机器的建议**：

- 目的是**换个能用的系统** → **EndeavourOS**。图形安装器（Calamares）全程点点点，装完自带驱动、桌面、网络，学习曲线最平缓，而底层就是纯 Arch，ArchWiki 全部适用
- 目的是**顺便学 Linux** → 原版 Arch 走路线 B 手动装一遍，装崩了大不了重来（反正数据已备份）
- 目的是**打游戏** → **CachyOS**
- **服务器场景（比如阿里云 ECS）绝对不要用 Arch**：滚动更新没有 LTS 承诺、一年数次需要人工干预、无长期安全支持分支、云厂商内核模块不适配。服务器继续用 Debian / Ubuntu LTS / Rocky

---

## 九、执行 Checklist

**装机前（在 Windows 上）**
- [ ] 填完第〇节硬件登记表
- [ ] 确认无线网卡型号在 Linux 下有驱动（或确认有网口做保险）
- [ ] 数据全部备份到外置硬盘 / 云，并**在另一台机器上验证能打开**
- [ ] WiFi 密码、各类账号密码已记录到手机 / 密码管理器
- [ ] 确认没有网银 U 盾 / Office / 反作弊网游这类无解需求
- [ ] 制作 U 盘（Ventoy 或 Rufus），校验 ISO 哈希
- [ ] BIOS：关 Secure Boot、关 Fast Boot、SATA 改 AHCI

**装机中**
- [ ] Live 环境跑 `lspci -nnk` / `inxi -Fxz` 确认硬件识别
- [ ] `lsblk` 确认目标硬盘盘符（**多块盘时别格错**）
- [ ] 换国内镜像源
- [ ] archinstall：btrfs + systemd-boot + pipewire + NetworkManager + linux & linux-lts
- [ ] 附加包勾上 fcitx5 全家桶 + noto CJK 字体 + firefox

**装机后**
- [ ] 联网：`nmtui` 连 WiFi
- [ ] 装显卡驱动（按硬件表第 4 项）
- [ ] 配 fcitx5 输入法环境变量并重登录
- [ ] 装 snapper + snap-pac + grub-btrfs 快照兜底
- [ ] 装 paru，再装 AUR 软件
- [ ] 笔记本：装 tlp 并 enable
- [ ] 跑一次 `sudo pacman -Syu` 确认更新链路通畅

---

## 十、延伸阅读

- [ArchWiki Installation Guide](https://wiki.archlinux.org/title/Installation_guide) — 唯一权威安装文档
- [ArchWiki General recommendations](https://wiki.archlinux.org/title/General_recommendations) — 装完之后该干什么，全部在这
- [Arch Linux News](https://archlinux.org/news/) — 更新前必看，可订阅 RSS
- [Arch Linux 官方公告：Active AUR malicious packages incident](https://archlinux.org/news/active-aur-malicious-packages-incident/)
- [ArchWiki: NVIDIA](https://wiki.archlinux.org/title/NVIDIA) / [Fcitx5](https://wiki.archlinux.org/title/Fcitx5) / [Snapper](https://wiki.archlinux.org/title/Snapper) / [Laptop](https://wiki.archlinux.org/title/Laptop)
- [EndeavourOS 官网](https://endeavouros.com/) / [CachyOS 官网](https://cachyos.org/)
- [Ventoy](https://ventoy.net) — 多系统启动 U 盘
- [Arch Linux 2026.07.01 ISO 发布说明](https://www.linuxcompatible.org/story/arch-linux-20260701-iso-released-with-kernel-7010-and-archinstall-44/)
- [Phoronix：AUR 事件超 1500 个包受影响](https://www.phoronix.com/news/Arch-Linux-AUR-More-Than-1500)

相关笔记：[[Linux]]、[[Windows安装Ubuntu （双系统）]]、[[Ubuntu 安装 Windows 虚拟机]]
