---
createTime: 2026-08-17 14:11
笔记ID: 20260817141112
multiFile:
multiMedia:
description: 在现有 Ubuntu 上零风险试玩 Niri 滚动平铺窗口管理器：Niri 能换掉哪一层与顺手清 snap/遥测、嵌套窗口试跑、PPA 与源码两条安装路线、NVIDIA 混合显卡配置、配套组件与中文输入法、试玩判断清单与干净卸载
笔记类型: 收集笔记
阐述日期:
tags:
  - Linux
  - Ubuntu
  - Niri
  - Wayland
aliases:
  - Niri
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Ubuntu 上安装 Niri
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="70" max="100" style="width: 100%;"></progress>

> **✅ 2026-08-22 已实际执行到第 5 步**（执行结果与踩坑见第十三节「执行记录」）：编译安装 niri 26.04、配套组件与 fcitx5 全装齐、NVIDIA modeset 已配、双屏与主题已写进 config.kdl 并 validate 通过。日常使用键位见 [[Niri 使用速查]]。
> **✅ 同日晚：系统升级 Ubuntu 26.04 LTS 并复刻「NIRI + Dank Linux Magic」视频方案**（DMS shell + greeter，源码版 niri 换成 PPA 包）——过程与踩坑见第十四节。

> **本笔记要办两件事**（都不需要换发行版）：
> 1. **在现有 Ubuntu 上装 Niri**，把 GNOME 那套桌面换成滚动平铺；
> 2. **顺手清掉 Ubuntu 的糟粕**——snap 全家、遥测、Ubuntu Pro 广告。
>
> 两件事互相独立：清糟粕现在就能做、和 Niri 无关；Niri 装了不喜欢 `apt remove` 掉就行，GNOME 留着当后路。
> 关联 [[Arch Linux 调研]]：**先在这里确认喜不喜欢 Niri，再决定要不要为它折腾发行版**——第二节讲清楚了哪些糟粕在 Ubuntu 上清不掉、只有换发行版才解决。

### 执行顺序（照这个走，每步都可回退）

| 步骤 | 做什么 | 风险 | 可回退 |
|------|--------|------|--------|
| **0** | **导出 snap 应用数据**（尤其 Firefox 配置）+ 过一遍数据备份清单（第二节 0） | — | 全系统快照非必需，理由见第二节 |
| **1** | 清 snap + 清遥测（第二节） | 低 | 软件能装回来，但**数据删了就没了**——所以先做第 0 步 |
| **2** | 装 niri 二进制 → **嵌套窗口试跑**（第四节路线 0） | **零** | 关掉窗口就没了 |
| **3** | 手感 OK → 装配套组件 + 配 fcitx5（第七、八节） | 低 | 都是独立的包 |
| **4** | 注销，登录界面切 Niri 会话，用一整天（第五节） | 低 | 随时切回 GNOME |
| **5** | 调 `config.kdl`，把带鱼屏三列布局配出来（第九节） | 无 | 改配置保存即生效 |
| **6** | 两天后按第十节清单下结论 | — | 不喜欢 → 第十一节干净卸载 |
| **7** | ⚠️ 卸 GNOME —— **暂时别做**，理由见第二节 | 高 | 难 |

## 一、Niri 是什么（30 秒版）

Rust 写的 **scrollable-tiling（滚动平铺）Wayland 合成器**，灵感来自 PaperWM。

和 i3 / Sway / Hyprland 的根本区别：**它不把屏幕切成网格，而是把窗口排成一条无限长的横向条带，你横向滚动浏览。**

```
       ┌─── 你的屏幕（可视窗口）───┐
 ...   │  [编辑器]  [终端]  [浏览器] │   [文档]  [Slack]  ...
       └───────────────────────────┘
        ←──────── 横向滚动 ────────→
```

带来的实际差别：

| 行为 | i3 / Sway / Hyprland | Niri |
|------|---------------------|------|
| 开一个新窗口 | 现有窗口全部**重新排布 + 缩小** | 新窗口追加到条带右侧，**现有窗口纹丝不动** |
| 窗口宽度 | 由屏幕除以窗口数决定 | 你自己定，超出屏幕就滚过去 |
| 多显示器 | 工作区常常是全局的 | **工作区按显示器独立**，是一等公民 |
| 找窗口 | Alt-Tab 轮盘赌 | 左右滚，位置是空间记忆 |

**适合谁**：宽屏 / 多屏、习惯「一次专注 2-3 个窗口但要保持更多窗口活着」的人。
**不适合谁**：重度依赖浮动窗口、想要 Hyprland 那种模糊和重动画、肌肉记忆绑死固定编号工作区的人。

> 本机双屏（内屏 1920×1080@144 + 外接 3440×1440 带鱼屏）其实很契合：带鱼屏一屏能并排放 3 列，横向滚动的交互本来就是为宽屏设计的。

## 二、动手前：Niri 能换掉哪一层、Ubuntu 糟粕清多少、要不要留快照

一句话：**Niri 只动「桌面」这一层。你最想清掉的东西里，有一半和 Niri 无关但能顺手清，另一半结构上就清不掉。**

| 层 | 具体是什么 | Niri 管不管 |
|----|-----------|------------|
| **桌面 / 窗口管理** | GNOME Shell、Mutter、Nautilus、GNOME 全家桶应用、gdm3 | ✅ **完全替换掉** |
| **系统自带软件与服务** | snap、遥测上报、Ubuntu Pro 广告、崩溃上报 | ⚠️ 和 Niri 无关，但**可以另外清掉**（见下） |
| **包管理与软件版本** | apt / dpkg、源里版本冻结两年、元包一把塞一堆东西 | ❌ **换不掉**。这就是发行版的定义 |

最后一行值得盯着看：**你最初想换 Arch 的真正理由（软件版本旧、包管理乱），恰好落在 Niri 够不到的那一层。**

### 0. 动手前要不要留快照？

**结论：全系统快照不是必需的，但 snap 应用的数据必须先救出来。**

先看每一步真实的可逆性：

| 操作 | 可逆吗 | 需要快照吗 |
|------|--------|-----------|
| 装 niri（apt 或源码） | ✅ 完全可逆，`apt remove` / 删二进制 | ❌ 不需要 |
| 装配套组件（waybar、fuzzel…） | ✅ 独立的包，随时卸 | ❌ 不需要 |
| 改 `~/.config/niri/config.kdl` | ✅ 删了重新生成 | ❌ 不需要 |
| 清遥测（`apt purge ubuntu-report` 等） | ✅ 想要再 `apt install` 回来 | ❌ 不需要 |
| **清 snap** | ⚠️ **软件能装回来，但 snap 应用的数据删了就没了** | ⬅ **只有这一步要小心** |
| 卸 GNOME | ❌ 难恢复 | 需要——所以第二节建议**先别做** |

#### 真正的风险点：snap 应用的数据

`snap remove --purge` + `rm -rf ~/snap` 会**连同应用数据一起删掉**。最要命的是 Firefox——snap 版的配置在 `~/snap/firefox/` 下，不是常规的 `~/.mozilla/`：

```bash
# 清 snap 之前，先把 Firefox 数据搬到标准位置
ls ~/snap/firefox/common/.mozilla/firefox/          # 确认 profile 在这
cp -a ~/snap/firefox/common/.mozilla ~/.mozilla     # 搬到 deb 版会读的位置

# 顺便看看还有哪些 snap 应用存了数据
du -sh ~/snap/*
```

对每个 `snap list` 里的应用问一句：**它的数据我在乎吗？** 在乎就先导出（浏览器书签导 HTML、编辑器配置拷出来），再删。

#### 想买个保险的话（可选，30 分钟）

```bash
# 1. 先看文件系统类型
findmnt -no FSTYPE /

# 2a. 是 btrfs → 快照几秒钟，几乎不占空间
sudo apt install timeshift
#    Timeshift 里选 BTRFS 模式，建一个快照

# 2b. 是 ext4（Ubuntu 默认）→ 只能 rsync 模式，要额外空间
sudo apt install timeshift
#    选 RSYNC 模式，快照目标选**外置硬盘**，别存本盘
```

另外记一份已装包清单，将来对照用（零成本）：

```bash
dpkg --get-selections > ~/pkglist-$(date +%F).txt
snap list > ~/snaplist-$(date +%F).txt
```

#### 我的建议

**不做全系统快照，但做两件事**：

1. **清 snap 前把在乎的 snap 应用数据导出**（尤其 Firefox）
2. `~/.ssh`、未 push 的仓库、`.env` 这些**本来就该有备份**——[[Arch Linux 调研]] 第一节那份清单现在就可以先过一遍

理由很直白：**这块盘本来就在换 Arch 的计划里，早晚要格。** 花时间给一个待拆的系统做全盘快照，收益不如把「哪些数据不能丢」这件事一次性理清楚——后者换 Arch 时还要再用一遍。

### 值得顺手清的（收益大、风险低）

#### 1. snap 全家 —— Ubuntu 最大的一块糟粕

```bash
snap list                                   # 先看装了哪些
sudo snap remove --purge <逐个包名>          # 一个个删干净

sudo systemctl disable --now snapd.service snapd.socket snapd.seeded.service
sudo apt purge -y snapd
sudo rm -rf /snap /var/snap /var/lib/snapd ~/snap

# 关键：防止 apt 把它悄悄装回来
sudo tee /etc/apt/preferences.d/nosnap.pref <<'EOF'
Package: snapd
Pin: release a=*
Pin-Priority: -10
EOF
```

**代价**：Ubuntu 官方源里的 Firefox 只是个「转 snap」的壳。换 Mozilla 官方 APT 源的原生 deb：

```bash
sudo install -d -m 0755 /etc/apt/keyrings
wget -qO- https://packages.mozilla.org/apt/repo-signing-key.gpg \
  | sudo tee /etc/apt/keyrings/packages.mozilla.org.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" \
  | sudo tee /etc/apt/sources.list.d/mozilla.list

# 优先级，防止被 Ubuntu 源的 snap 壳顶掉
sudo tee /etc/apt/preferences.d/mozilla <<'EOF'
Package: firefox*
Pin: origin packages.mozilla.org
Pin-Priority: 1000
EOF

sudo apt update && sudo apt install firefox
```

只有 snap 版的软件，用 **flatpak** 补位：`sudo apt install flatpak`。

> 这一步和换不换发行版完全无关，**现在就可以做，做完 Ubuntu 会干净一大截**。

#### 2. 遥测 / 广告 / 崩溃上报

```bash
sudo apt purge -y ubuntu-report popularity-contest apport whoopsie

# 终端登录时那段 Ubuntu Pro 广告
sudo pro config set apt_news=false
sudo chmod -x /etc/update-motd.d/*
```

> 卸 `apport` 之后就没有崩溃报告弹窗了（那玩意儿也从没帮你解决过问题）。

#### 3. 显示管理器 gdm3 → greetd（可选，收益小）

gdm3 会拉起一整套 GNOME 会话服务。介意的话换轻量的 `greetd`。但**收益很小，优先级最低**，试玩阶段别碰。

### ⚠️ GNOME 本体：建议**先别卸**

这是风险最高的一步，而且现在卸没有任何好处：

- **试玩期 GNOME 就是你的后路** —— 不喜欢 Niri，登录界面切回去即可
- **卸了不省内存，只省磁盘** —— 没启动的桌面不占内存，GNOME 那几个 G 磁盘不值得冒险
- **`ubuntu-desktop` 是元包**，卸掉之后 `do-release-upgrade` 会拒绝或降级处理，以后升级 Ubuntu 会很难受
- **一刀切容易连坐** —— GNOME 的依赖里混着密钥环、portal、polkit 认证代理这些 Niri 也要用的东西，`autoremove` 一把梭大概率把桌面搞成半残

真到了长期只用 Niri 的那天再考虑，做法也是：`apt-mark showmanual` 摸清手动装的包，一个个 `apt -s remove` 看模拟输出再动手，**永远别信 `autoremove`**。

### 结构上清不掉的（这些只有换发行版才解决）

| 你嫌弃的 | Ubuntu 上能做到什么程度 |
|----------|------------------------|
| apt 慢、输出难看 | 换个前端 `nala` 能改善观感，dpkg 内核不变 |
| **软件版本旧** | ❌ 结构性问题。PPA / flatpak / 手动编译都只是打补丁，**补丁打得越多系统越乱** |
| 一个软件三个来源 | 清掉 snap 能好很多，但 apt + PPA + flatpak 仍然是三套 |
| 不知道系统里为什么有某个包 | ❌ 装的时候就是元包一把塞进来的，事后追不回来 |

### 诚实提醒：削过头就是在手工重造 Arch

把 Ubuntu 一点点削成「只有我装的东西」的最小系统，技术上做得到，但你会得到一个**没人测试过的 Frankenstein Ubuntu**：

- 出问题时 ArchWiki 帮不了你（你不是 Arch），Ubuntu 文档也帮不了你（你不是标准 Ubuntu）
- 官方和社区的教程都默认你有 `ubuntu-desktop`
- **维护成本反而比直接装 Arch 高**

「系统里每个包都是我自己装的」**正是 Arch 的默认状态**，不是要你逆着发行版的设计去削出来的结果。

**建议的顺序**：

1. **现在**：装 Niri 试玩 + 清掉 snap 和遥测。GNOME 留着当后路。这一步收益最大、风险最低，且和换不换发行版无关
2. **试玩出结论后**：喜欢 Niri **且**认可 Arch 的维护成本 → 换 Arch，在干净系统上重建（见 [[Arch Linux 调研]]）
3. **不要走**「在 Ubuntu 上一点点削成 Arch」这条路 —— 那是两边的缺点全占

## 三、动手前先查三件事

```bash
# 1. Ubuntu 版本 —— 决定走哪条安装路线
lsb_release -a

# 2. 当前会话是 Wayland 还是 X11
echo $XDG_SESSION_TYPE

# 3. 显卡和驱动
lspci -nnk | grep -A3 -i vga
```

记下结果，下一节按版本分叉。

## 四、安装：三条路线，按你的情况选

### 路线 0：嵌套窗口试跑（**先做这个，零风险，5 分钟**）

Niri 可以**作为一个普通窗口跑在你现在的 GNOME 桌面里**（用 winit 后端）——不用退出登录、不用改显示管理器、不用碰驱动。先这么摸一遍手感，再决定要不要正式装成会话。

先按下面的路线 A 或 B 把 `niri` 这个二进制装上，然后在现有桌面的终端里直接执行：

```bash
niri            # 注意：是 niri，不是 niri-session
```

会弹出一个窗口，里面就是一个完整的 Niri。在里面开终端、开几个窗口、左右滚一滚，试试是不是你要的交互。关掉窗口就结束，对系统零影响。

> 这一步能过滤掉 80% 的「看视频觉得酷、实际用不惯」。**强烈建议在正式配会话之前先跑一遍。**

### 路线 A：Ubuntu 25.10 及以上 —— PPA 直装（推荐）

```bash
sudo add-apt-repository ppa:avengemedia/danklinux
sudo add-apt-repository ppa:avengemedia/dms
sudo apt update
sudo apt install niri
```

`dms`（DankMaterialShell）是配套的 Material 风格 shell，想要视频里那种观感就一起装：

```bash
sudo apt install dms
```

> 不想要 shell、只想试 WM 本体，就只装 `niri`。

### 路线 B：Ubuntu 24.04 LTS —— 源码编译（约 15 分钟）

24.04 没有官方包，只能自己编。**编译本身很干净，产物就一个二进制，不污染系统。**

```bash
# 1. 装 Rust（用 rustup，不要用 apt 的 rustc，版本太旧）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 2. 装编译依赖
sudo apt-get install -y gcc clang libudev-dev libgbm-dev libxkbcommon-dev \
  libegl1-mesa-dev libwayland-dev libinput-dev libdbus-1-dev libsystemd-dev \
  libseat-dev libpipewire-0.3-dev libpango1.0-dev libdisplay-info-dev

# 3. 拉代码并编译
git clone https://github.com/niri-wm/niri.git
cd niri
cargo build --release

# 4. 二进制在这里，可以先直接跑（就是路线 0 的嵌套窗口）
./target/release/niri

# 5. 觉得可以，再装到系统里
sudo cp target/release/niri /usr/local/bin/
sudo cp resources/niri-session /usr/local/bin/
sudo cp resources/niri.desktop /usr/share/wayland-sessions/
sudo cp resources/niri-portals.conf /usr/share/xdg-desktop-portal/
```

> ⚠️ `curl | sh` 装 rustup 是 Rust 官方推荐方式，但按本仓库的原则：**执行前先 `curl -sSf https://sh.rustup.rs -o rustup.sh` 把脚本存下来看一眼再跑**。

### 路线 C：不想在 Ubuntu 上折腾 —— 直接虚拟机

```bash
sudo apt install virt-manager qemu-kvm
```

装个 CachyOS 或 Arch 虚拟机，`pacman -S niri` 一条命令。缺点是虚拟机里的手感（尤其多屏和动画）不能代表真机，**只适合看外观，不适合判断日常好不好用**。

## 五、首次启动

1. **注销**当前会话（不是重启）
2. 登录界面点用户名旁边的**齿轮 / 会话选择**图标 → 选 **Niri**
3. 输密码进去

进去之后大概率是一片空屏，这是正常的——Niri 不自带桌面。记住三个键先活下来：

| 快捷键 | 作用 |
|--------|------|
| `Super + T` | 开终端 |
| `Super + D` | 开应用启动器 |
| `Super + Shift + E` | **退出 Niri**（回到登录界面） |
| `Super + Shift + /` | **打开完整快捷键面板** ⬅ 记这一个就够，其余都能在里面查 |

> 只要记得 `Super + Shift + E` 能退出，就永远不会被困在里面。实在不行 `Ctrl+Alt+F3` 切到 TTY 也能救。

配置文件在 `~/.config/niri/config.kdl`，**保存即生效，不用重启**（live reload）——这点是 Niri 体验最好的地方之一，改配置的反馈是实时的。

### 起不来时的排查速查

| 现象 | 原因 | 怎么办 |
|------|------|--------|
| **登录界面没有 Niri 选项** | 会话文件没装到位 | `ls /usr/share/wayland-sessions/` 看有没有 `niri.desktop`；源码装的话是路线 B 第 5 步漏了。装完 `sudo systemctl restart gdm3` 刷新 |
| 选了 Niri，闪一下弹回登录界面 | 启动就崩了 | 切 TTY（`Ctrl+Alt+F3`）跑 `journalctl --user -b -u niri` 或 `journalctl -b | grep -i niri` 看报错 |
| 进去后**全黑**，键盘有反应 | 渲染设备挑错了（NVIDIA 常见） | 见第六节第 2 点，手动配 `render-drm-device` |
| 进去后全黑，键盘也没反应 | 彻底挂了 | `Ctrl+Alt+F3` 进 TTY，改配置或 `sudo systemctl restart gdm3` |
| 空屏但 `Super+T` 没反应 | 终端没装 | 回 TTY 装 `alacritty`，或改 config 里的终端命令 |
| 什么都正常，但**没有状态栏 / 启动器** | 第七节的配套组件没装 | 那些不是 Niri 自带的，要自己装 |
| 应用图标全是灰白方块 | 图标主题缺失 | `sudo apt install papirus-icon-theme` 之类 |

> **保命前提**：`Ctrl+Alt+F3` 永远能切到 TTY 文字终端，在那里可以改配置、卸包、重启显示管理器。**试玩期间不会有真正回不去的情况。**

## 六、NVIDIA 混合显卡（本机必看）

本机是 Intel 核显 + RTX 4060 的 muxless 混合显卡，Wayland 下有几个已知点：

**1. 确认内核模式设置已开**

```bash
cat /sys/module/nvidia_drm/parameters/modeset      # 应输出 Y
```

输出不是 `Y` 的话，加内核参数后重启：

```bash
sudo vim /etc/default/grub
# GRUB_CMDLINE_LINUX_DEFAULT 里加上：nvidia-drm.modeset=1
sudo update-grub && sudo reboot
```

**2. 黑屏时手动指定渲染设备**

在 TTY 或登录后进 Niri 得到黑屏，是它没能正确挑出主渲染设备。在 `~/.config/niri/config.kdl` 里手动指定：

```kdl
debug {
    render-drm-device "/dev/dri/card1"
}
```

`card0` / `card1` 都试一遍，用 `ls /dev/dri/` 看有哪些。

**3. 已知问题**

| 问题 | 说明 |
|------|------|
| 显存占用偏高 | NVIDIA 驱动有 heap 复用的问题，在 Niri 上表现为 VRAM 占用高，上游有手动修复方案 |
| 硬件光标 | 旧教程里的 `WLR_NO_HARDWARE_CURSORS` **已废弃，不要设**；Niri 有自己的 cursor 配置项 |
| 外接带鱼屏 | 视频口硬连独显，驱动装好的前提下 Niri 的多屏支持没问题；点不亮先回去查驱动，不是 Niri 的问题 |

> 这块如果折腾超过半小时还不顺，**先用路线 0 的嵌套窗口试玩**——嵌套模式下走的是现有会话的渲染路径，绕开所有这些问题。

## 七、最小可用配套（Niri 什么都不自带）

Niri 只管窗口，其余全靠自己拼。一次装齐：

```bash
sudo apt install \
  alacritty \                      # 终端（或用你习惯的）
  fuzzel \                         # 应用启动器
  waybar \                         # 状态栏
  mako-notifier \                  # 桌面通知
  swaylock swayidle \              # 锁屏 / 自动息屏
  swaybg \                         # 桌面壁纸
  xwayland-satellite \             # 跑 X11 老程序（Steam、部分 IDE 需要）
  xdg-desktop-portal-gnome xdg-desktop-portal-gtk   # 文件选择框、截图、屏幕共享
```

> ⚠️ **portal 不装的话**，浏览器上传文件时不弹选择框、截图和屏幕共享全废——这是新手最常见的「Niri 好像坏了」。

**waybar 双状态栏问题**：Niri 默认配置里已经有 `spawn-at-startup "waybar"`，如果你自己又起了一个会出现两条栏。修法：

```bash
pkill waybar
# 然后编辑 ~/.config/niri/config.kdl，删掉那行 spawn-at-startup "waybar"
```

### 主题与外观：视频里那套在 Ubuntu 上能不能装？

**结论先说：[NyxNiri](https://github.com/ech678/NyxNiri) 在 Ubuntu 上装不了，别试。**

| 事实 | 依据 |
|------|------|
| NyxNiri README 第一行就写明支持范围是 **「Arch Linux / CachyOS」**，全文没有一处提到 Ubuntu / Debian | 仓库 README |
| 它的安装脚本用 **pacman + AUR**，找不到 AUR helper 时会自己装 `paru` | 同上 |
| 核心依赖 **Noctalia shell** 需要一个**定制版 quickshell（noctalia-qs）**，发行版仓库里的 quickshell 不兼容；Debian/Ubuntu 上只能从源码编 | Noctalia 官方文档 |

所以在 Ubuntu 上，主题这件事分三档：

| 档位 | 做什么 | 适用 |
|------|--------|------|
| **① 裸 Niri（推荐给试玩期）** | 只装第七节那套 waybar + fuzzel + mako，不碰任何主题 | **试玩阶段就该这样**——你要判断的是「滚动平铺这套交互适不适合我」，不是「配色好不好看」。主题只会增加故障面 |
| **② DMS（DankMaterialShell）** | Ubuntu 25.10+ 的 PPA 里直接有：`sudo apt install dms`。这是 Niri 官方 Getting Started 里配套推荐的 shell，Material 风格，观感最接近视频 | 想要点样子、又不想编译。**24.04 没有这个包** |
| **③ 抄 NyxNiri 的片段** | 它仓库里**发行版无关**的部分照抄：`config.kdl` 的布局和键位、fcitx5 皮肤、Starship / Fastfetch 配置。**发行版相关的部分**（pacman 装包、Noctalia、AUR 依赖）跳过 | 想要它的具体某个效果时 |

**给你的建议**：

1. 试玩期走 **① 裸 Niri**。先确认交互本身你受得了
2. 确认喜欢之后，Ubuntu 25.10+ 就 `apt install dms`；24.04 就先用 waybar 凑合，别为了外观去编 quickshell
3. **NyxNiri 整套留到换 Arch/CachyOS 之后再说**——那时候它才是一条命令的事。而且到那天也建议先读脚本再跑（理由见 [[Arch Linux 调研]] 第二节）

> ⚠️ 顺带一提，NyxNiri 自己的 README 就记着一条坑：**Noctalia 启动时 ddcutil 扫 I2C 总线会卡住，「NVIDIA 常见」——正好是你这台机器**。这也是建议试玩期别碰主题的实际理由之一。

## 八、中文输入法（fcitx5）

Niri 是纯 Wayland，输入法走 `text-input-v3` 协议，配置和 GNOME 下略有不同：

```bash
sudo apt install fcitx5 fcitx5-chinese-addons fcitx5-config-qt
```

在 `~/.config/environment.d/im.conf` 写入：

```bash
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
```

然后在 `~/.config/niri/config.kdl` 里让它开机自启：

```kdl
spawn-at-startup "fcitx5" "-d"
```

重新登录后 `fcitx5-configtool` 加「拼音」，默认 `Ctrl+Space` 切换。

> 若 GTK 应用能打中文、Electron 应用（VSCode / 微信）不行，给那些应用加 `--enable-wayland-ime` 启动参数。

## 九、配置入门：config.kdl

配置是 KDL 格式（比 JSON 好读，比 YAML 严格），**保存即生效**。几个最常改的：

```kdl
input {
    keyboard {
        repeat-delay 300
        repeat-rate 40
    }
    touchpad {
        tap
        natural-scroll
    }
}

// 双屏：按型号/接口分别设分辨率和刷新率
output "eDP-1" {
    mode "1920x1080@144.000"
    scale 1.0
}
output "HDMI-A-1" {
    mode "3440x1440@60.000"
    scale 1.0
    position x=1920 y=0
}

layout {
    gaps 8
    // 一列占屏幕宽度的多少 —— 带鱼屏上设 1/3 能并排放三列
    preset-column-widths {
        proportion 0.33333
        proportion 0.5
        proportion 0.66667
    }
    default-column-width { proportion 0.5; }
}

spawn-at-startup "fcitx5" "-d"
spawn-at-startup "waybar"
```

改完保存，切回 Niri 立刻能看到效果。**这个即时反馈是它比 i3/Sway 舒服的地方**——不用每次改完重载会话。

## 十、执行清单

### A. 清理 Ubuntu 糟粕（和 Niri 无关，现在就能做）

- [ ] **先做**：`du -sh ~/snap/*` 看哪些 snap 应用存了数据，在乎的先导出
- [ ] **先做**：`cp -a ~/snap/firefox/common/.mozilla ~/.mozilla`（书签密码都在这）
- [ ] **先做**：`dpkg --get-selections > ~/pkglist-$(date +%F).txt` 存一份包清单
- [ ] `snap list` 记下装了哪些，逐个 `snap remove --purge`
- [ ] purge `snapd`，删 `/snap` `/var/snap` `/var/lib/snapd` `~/snap`
- [ ] 写 `/etc/apt/preferences.d/nosnap.pref` 防止 apt 装回来
- [ ] 加 Mozilla 官方 APT 源 + pin，装原生 deb 版 Firefox，确认书签和登录状态还在
- [ ] `apt purge ubuntu-report popularity-contest apport whoopsie`
- [ ] `pro config set apt_news=false` + `chmod -x /etc/update-motd.d/*`
- [ ] （按需）装 flatpak 补位那些只有 snap 的软件
- [ ] ⚠️ **GNOME 本体不要卸** —— 试玩期它是后路，理由见第二节

### B. 装 Niri

- [ ] `lsb_release -a` 确认版本 → 选路线 A（25.10+ PPA）还是路线 B（24.04 源码）
- [ ] 装上 `niri` 二进制
- [ ] 装配套：fuzzel / waybar / mako / swaylock / swaybg / **xwayland-satellite** / **portal 两个包**
- [ ] 配 fcitx5 环境变量 + `spawn-at-startup`
- [ ] NVIDIA：确认 `nvidia_drm.modeset=1`；黑屏则配 `render-drm-device`

### C. 试玩判断（用两天，**不是验证 Niri 好不好，是验证它适不适合你**）

- [ ] 嵌套窗口跑一遍（路线 0），第一印象是「有意思」还是「别扭」
- [ ] 正式进会话，用它做**一整天真实工作**（写代码 + 开浏览器 + 开终端 + 聊天工具）
- [ ] **带鱼屏上并排三列**跑起来，看是不是真的比现在的窗口管理舒服
- [ ] 双屏切换、把窗口从一块屏挪到另一块，顺不顺手
- [ ] 开 15 个窗口之后，还找得到东西吗（这是 Niri 的核心卖点，也是最该验证的）
- [ ] 微信 / 飞书 / VSCode 这些 Electron 应用有没有毛病（缩放、输入法、托盘）
- [ ] 截图、录屏、文件上传弹窗正常吗（portal 装没装对）
- [ ] 合盖睡眠 → 唤醒，会不会花屏（NVIDIA 相关）
- [ ] 两天后问自己一句：**回 GNOME 会不会觉得难受？** 会 → 说明真喜欢；不会 → 那就是视频剪得好

**判断结论怎么用**：

| 结果 | 下一步 |
|------|--------|
| 喜欢 Niri | 换不换 Arch 是**另一个独立问题**，按 [[Arch Linux 调研]] 第二节的成本收益表自己判断。Ubuntu 上继续用 Niri 完全可以 |
| 不喜欢 Niri | 换 Arch 的理由就只剩「新版本工具链 + AUR + 干净包管理」，**这条本身也够，但别拿桌面美化当理由** |

## 十一、干净卸载

```bash
# PPA 装的
sudo apt remove --purge niri dms
sudo add-apt-repository --remove ppa:avengemedia/danklinux
sudo add-apt-repository --remove ppa:avengemedia/dms

# 源码装的
sudo rm /usr/local/bin/niri /usr/local/bin/niri-session
sudo rm /usr/share/wayland-sessions/niri.desktop
sudo rm /usr/share/xdg-desktop-portal/niri-portals.conf

# 配置（想留着以后再试就别删）
rm -rf ~/.config/niri
```

登录界面选回 GNOME（或你原来的会话）即可。**现有桌面环境全程没被动过。**

### 如果连 snap 也想装回来

第二节说过「软件能装回来，数据删了才没了」，这是把软件装回来的命令：

```bash
# 1. 先去掉那条阻止 apt 装 snapd 的 pin
sudo rm /etc/apt/preferences.d/nosnap.pref

# 2. 装回 snapd
sudo apt update && sudo apt install snapd
sudo systemctl enable --now snapd.service snapd.socket

# 3. 想把 Firefox 也换回 snap 版（一般没必要，deb 版更好用）
sudo rm /etc/apt/preferences.d/mozilla /etc/apt/sources.list.d/mozilla.list
sudo apt update && sudo apt install --reinstall firefox

# 4. 按第二节存下的清单，把当初的 snap 应用装回来
cat ~/snaplist-*.txt
sudo snap install <包名>
```

> ⚠️ 应用**数据**装不回来——这就是第二节 0 要你先导出的原因。Firefox 的配置如果已经 `cp -a` 到了 `~/.mozilla`，deb 版会直接读到，不需要回滚。

## 十二、执行记录（2026-08-22 实际走了一遍）

### 实际环境与路线选择

| 项 | 实际值 | 结论 |
|----|--------|------|
| 系统 | Ubuntu **24.04.4 LTS**（内核 6.8.0-138） | 走路线 B 源码编译 |
| Rust | 已有 rustup 装的 1.95（`~/.cargo`） | **rustup 安装步骤直接跳过** |
| 显卡 | Intel UHD（i915）+ RTX 4060 Max-Q（nvidia 驱动） | 与第六节预设一致 |
| 当前会话 | X11（modeset 未开导致 GNOME 回退 X11） | 正好验证了第六节的必要性 |
| 带鱼屏 | **当天未连接**（HDMI-A-1 disconnected） | output 配置先写好，插上即生效 |

### 执行结果

- 编译 `cargo build --release`：**10m25s**，产物 136M，版本 niri 26.04 (dd75865)
- 装到系统：`/usr/local/bin/niri` + `niri-session`、`/usr/share/wayland-sessions/niri.desktop`、`/usr/share/xdg-desktop-portal/niri-portals.conf`
- 配套：fuzzel / waybar / mako / swaylock / swayidle / swaybg / portal×2 / alacritty / fcitx5 全家 / grim+slurp+wl-clipboard / papirus-icon-theme
- GRUB：`nvidia-drm.modeset=1` 已加（原文件备份 `/etc/default/grub.bak-niri`），**待重启生效**
- fcitx5：`~/.config/environment.d/im.conf` + config.kdl 自启；**装包时 profile 已自动带拼音**，无需再跑 configtool
- config.kdl：双屏 output、gaps 8、列宽档 1/4~2/3、fcitx5/xwayland-satellite/swaybg 自启、Mocha 配色、`Mod+Shift+S` 区域截图进剪贴板，`niri validate` 通过

### 踩坑（复现时对照）

| 现象 | 原因 | 解决 |
|------|------|------|
| `apt install A B C ...` 整批失败 | 列表里混了 24.04 源没有的 `xwayland-satellite`，apt 一个定位不到全部中止 | **拆开装**；xwayland-satellite 单独源码编译 |
| xwayland-satellite release 无预编译资产（assets: 0） | 上游只发源码 | `git clone Supreeeme/xwayland-satellite` + cargo 编译，7 秒完事 |
| xwayland-satellite 编译报 `pkg-config 找不到 xcb-cursor` | 缺 xcb 侧开发头文件 | `apt install libxcb-cursor-dev` |
| `sudo` 在脚本里报 "a terminal is required" | 非交互环境无法弹密码 | `sudo -S` 从 stdin 读，或用户 `!` 前缀自己跑 |
| GitHub 下载慢 / 超时 | 直连限速 | 开 VPN 后重试即成 |
| waybar 没有工作区模块 | apt 版 waybar 0.9.24，`niri/workspaces` 模块 0.10+ 才有 | 用 `wlr/taskbar` 显示窗口图标（niri 支持 wlr-foreign-toplevel），想要真模块得编 waybar 0.11+ |

### 主题（GitHub 社区主流实践的可移植版）

社区调研（官方 Showcase 讨论帖 #325 + niri-rice topic）：主流组合是 **waybar + fuzzel + Catppuccin Mocha**；AGS / quickshell / Noctalia 更炫但 24.04 要编译，按第七节结论不碰。先落地了一套 Mocha（备份在 `~/niri-mocha-backup-1252/`）。

**第二轮：改用 dotfriedrice 观感（Tokyonight Moon）**。用户觉得 Mocha 版「不够好看好用」后，调研了 GitHub 星数最高的 niri dotfiles：

| 仓库 | 星数 | Ubuntu 24.04 可用性 |
|------|------|---------------------|
| [snowarch/iNiR](https://github.com/snowarch/iNiR) | 1456★ | ❌ Arch 系 |
| [nickjj/dotfriedrice](https://github.com/nickjj/dotfriedrice) | 1315★ | ⚠️ **桌面部分也是 Arch-only**（见下） |
| [folke/dot](https://github.com/folke/dot) | 1284★ | ⚠️ Arch 为主，配置片段可抄 |

**dotfriedrice 的 Arch 墙（源码级确认）**：README 说支持 Ubuntu 只指 CLI 部分（zsh/tmux/neovim）；`bootstrap:209` 里 `GUI_ELIGIBLE=1` 的唯一条件是 `OS_DISTRO_LIKE=arch`；`_install/default/packages/debian` 清单里 grep niri/waybar/walker 零命中。桌面粉依赖 Walker（AUR）等包。

**最终方案：手工移植 dotfriedrice 观感**（发行版无关的部分全搬）：

| 件 | 来源与做法 |
|----|-----------|
| **Walker 启动器 2.17.0** | 官方 release 二进制直装；依赖 gtk4-layer-shell 无 deb → 源码编译 v1.3.0（需 meson + libgtk-4-dev + gobject-introspection + valac，编译时把 Android SDK 的 cmake 从 PATH 里让位给系统 cmake） |
| **waybar** | dotfriedrice 同款布局：左「菜单+任务栏」/ 中时钟 / 右「托盘+音量+网络+CPU+电池+电源」；黑白极简、纯色无圆角（Ubuntu 组件版：无 niri/workspaces 模块仍用 wlr/taskbar，无 mpd） |
| **niri** | Tokyonight 渐变焦点环（`#33ccff→#00ff99` 45°）、背景 `#14151f`、2px 圆角窗口规则、overview 背景色 |
| **Walker 主题** | 抄它的 style.css + theme.css 分层结构（`~/.config/walker/themes/base/`），换主题只改 theme.css 一个文件 |
| **mako / swaylock / alacritty** | 色板从 Mocha 全量映射到 Tokyonight Moon |
| **壁纸** | PIL 重新生成 Tokyonight 光斑渐变（`~/Pictures/Wallpapers/tokyonight-gradient.png`） |
| **键位** | `Mod+D`→Walker（应用+runner+计算合一，常驻 `--gapplication-service` 加速首弹）；`Mod+Shift+D`→fuzzel 后备；`Mod+O`→概览（默认配置已有，勿重复添加——重复键位会 validate 报错） |

移植中新踩的坑：niri 配置**不允许重复键位**（`Mod+O` 默认已绑定 toggle-overview，再写一遍 validate 直接报 duplicate keybind）；meson 会误用 `/opt/android-sdk` 里的 cmake 导致 gobject-introspection 探测失败，`export PATH=/usr/bin:$PATH` 解决；`ninja install` 后的 `ldconfig` 需要 root 单独跑。

各配置文件位置与调整入口见 [[Niri 使用速查]] 第七节（该笔记已同步更新为 Tokyonight 版）。

## 十三、升级 Ubuntu 26.04 与 DMS 复刻（2026-08-22 第二阶段）

### 0. 为什么升：视频解锁了 DMS 路线

视频《Ubuntu 26.04 is FINALLY BEAUTIFUL: NIRI + Dank Linux Magic》（https://www.youtube.com/watch?v=d7eUqk7tQOU ，Dank Linux 官网 https://danklinux.com/ ）的方案 = **niri + DMS（DankMaterialShell）**。24.04 上 DMS 无包（第七节的结论）；26.04 的 avengemedia PPA 直接有全套。

**升级前调研的三份资料**：
- ubuntu.fan 升级文档——标准流程 + 关键细节「26.04 发布初期需 `do-release-upgrade -d`」（LTS 通道要等 26.04.1，本文执行时还没开）
- jiacai2050 的 gist——升级后两大高发坑：壁纸变黑 + Chrome 文件框弹不出（AppArmor/bwrap 沙盒冲突），预防方：`~/.config/xdg-desktop-portal/portals.conf` 强制 FileChooser 走 gtk。**已提前配置，升级后未触发**
- lixx.cn 深度文——26.04 大变更：GNOME 50 全面 Wayland-only、内核 7.0、sudo 换 sudo-rs、coreutils 换 rust 版、NVIDIA Wayland 大幅改善

### 1. 升级执行（分权模式）

```
阶段0 备份 ~/upgrade-2604-backup/（桌面配置+包清单+壁纸）
阶段1 apt 基线拉平至 0 待升级 —— ⚠️ 地雷：deadsnakes PPA 的 jammy 版 python3.12
      全家残留导致依赖死锁，需 --allow-downgrades 降回 noble 官方版
阶段2 用户在 GNOME/TTY 的 tmux 里跑 do-release-upgrade -d（Claude 会话会断，交互
      要点：配置冲突一律选包维护者版本，GRUB 被问到才保留本地）
阶段3 验证：26.04 LTS / 内核 7.0 / GRUB modeset 未被冲掉 / 0 失败服务
```

**升级后的系统级坑（都修了）**：

| 现象 | 原因 | 解决 |
|------|------|------|
| sudo 全挂，报 sudoers 语法错误 | 26.04 默认 **sudo-rs**，比旧 sudo 严格：`/etc/sudoers.d/nas-mount` 缺行尾换行符 | `sudo sh -c 'echo >> /etc/sudoers.d/nas-mount'`（需 TTY 或 pkexec，Claude 的 bash 传不了密码时让用户在终端跑） |
| 源码装的 niri/walker/elephant 还能用但脱离包管理 | `/usr/local` 升级不碰 | 见下节换 apt 版 |

### 2. DMS 复刻（视频方案落地）

| 包 | 版本 | 说明 |
|----|------|------|
| niri | 26.04ppa3 | PPA 版替换源码版：`rm /usr/local/bin/niri*` 后 apt 装；**手装的 `~/.config/systemd/user/niri*.service` 必须删**（包自带同名单元，冲突） |
| dms | 1.5.3ppa1 | Material 风格 shell，接管 waybar/mako/swaybg 的职责 |
| dms-greeter | 1.5.3ppa1 | 登录界面（配 greetd） |
| ghostty | 1.3.1ppa11 | 视频同款 GPU 终端 |
| cliphist / danksearch / dankcalendar | — | Dank 生态工具 |

PPA：`add-apt-repository ppa:avengemedia/danklinux` + `ppa:avengemedia/dms`（niri 主包在 danklinux 源里）。

**niri 配置改动**（`~/.config/niri/config.kdl` 全部继承，只改自启）：

```kdl
// waybar → DMS 接管
spawn-at-startup "dms" "run"
// swaybg 注释掉（壁纸交给 DMS）
// 保留：fcitx5 -d、xwayland-satellite、walker --gapplication-service
```

`dms doctor` 自检全绿（quickshell/matugen/dgop/cava 依赖随包装好）。DMS 首次运行自动从壁纸取色生成 Material 主题（matugen）；`dms matugen generate` 手动喂参数很繁琐，不必。

### 3. dms-greeter 替换 gdm3

`dms greeter install` 内部要调 sudo（非交互环境拿不到 TTY 会 FATAL）——**它要做的 sudo 步骤可全部手动做**：建 `greeter` 组加用户、`setfacl -m g:greeter:rX ~/.local/state ~/.local/share`、`/var/cache/dms-greeter` 属主 greeter:greeter。greetd 的 `/etc/greetd/config.toml` 它已写好（`dms-greeter --command niri`）。

切显示管理器（gdm3 完整保留可回退）：

```bash
sudo systemctl disable gdm3 && sudo systemctl enable greetd
sudo bash -c 'echo /usr/sbin/greetd > /etc/X11/default-display-manager'
```

**回退**：`sudo systemctl disable greetd && sudo systemctl enable gdm3`。

遗留小项：`dms greeter sync` 的 AppArmor profile 需要真机交互 sudo 跑一次（非阻塞警告）。

### 3.5 ⚠️ 大坑：dms greeter install 会删 niri.desktop（登录页只剩 ubuntu）

**现象**：重启后 dms-greeter 登录页的会话选择器只有 Ubuntu，没有 Niri。

**原因**（journal 里有铁证）：`dms greeter install` 运行中会「清理」`/usr/share/wayland-sessions/` 里它不认识的会话文件——把 `niri.desktop` 和 `niri-portals.conf` 删了，且 `dpkg -V niri` 显示 missing 但 apt 状态仍是 ii（静默损坏）。

**修复**：

```bash
sudo apt install --reinstall niri    # 恢复 niri.desktop
```

**预防**：每次跑完 `dms greeter install` / `sync` / `uninstall` 后检查：

```bash
ls /usr/share/wayland-sessions/ | grep niri || sudo apt install --reinstall niri
```

### 4. 视频观感对照结论

| 视频内容 | 落地 |
|----------|------|
| NIRI on 26.04 | ✅ PPA 包版 |
| Scrolling Tiling | ✅ 键位/双屏/动画/阴影全继承 |
| Dank theming | ✅ DMS shell + greeter + ghostty + matugen 自动取色 |
| 登录界面 | ✅ dms-greeter（下次重启生效） |

## 十四、延伸阅读

- [Niri 官方仓库](https://github.com/niri-wm/niri) / [Getting Started](https://niri-wm.github.io/niri/Getting-Started.html) / [Wiki](https://github.com/niri-wm/niri/wiki/Getting-Started)
- [It's FOSS：Niri 上手评测](https://itsfoss.com/niri-window-manager/)
- [MakeUseOf：试了 Niri 但不适合我](https://www.makeuseof.com/every-linux-user-told-me-to-try-niri-so-i-finally-did-and-it-wasnt-for-me/)（反面视角，值得先看）
- [Exploring Niri（Debian 13 安装记）](https://weiyichen.me/blog/niri_exploration)
- [NyxNiri](https://github.com/ech678/NyxNiri) —— 视频里那套配置。**只支持 Arch / CachyOS，Ubuntu 上装不了**；能抄的只有发行版无关的片段，详见第七节末尾
- [Noctalia 官网](https://noctalia.dev/) / [文档](https://docs.noctalia.dev/) —— NyxNiri 用的 shell，Debian 系需自行编译 noctalia-qs
- [DankMaterialShell（DMS）](https://github.com/AvengeMedia/DankMaterialShell) —— Ubuntu 25.10+ 可 apt 直装的替代选择
- [nickjj/dotfriedrice](https://github.com/nickjj/dotfriedrice) —— 1315★，桌面 Arch-only 但配置可移植（本机主题的出处，见第十二节）
- [folke/dot](https://github.com/folke/dot) —— 1284★，LazyVim 作者的 niri 配置
- [Walker 启动器](https://github.com/abenz1267/walker) —— 已装 2.17.0，官方二进制
- [niri 官方 Showcase 讨论](https://github.com/niri-wm/niri/discussions/325) / [niri-rice topic](https://github.com/topics/niri-rice) —— 配置灵感池

相关笔记：[[Niri 使用速查]]、[[Arch Linux 调研]]、[[Linux]]
