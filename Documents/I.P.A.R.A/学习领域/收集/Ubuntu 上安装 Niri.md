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
<progress value="20" max="100" style="width: 100%;"></progress>

> **本笔记要办两件事**（都不需要换发行版）：
> 1. **在现有 Ubuntu 上装 Niri**，把 GNOME 那套桌面换成滚动平铺；
> 2. **顺手清掉 Ubuntu 的糟粕**——snap 全家、遥测、Ubuntu Pro 广告。
>
> 两件事互相独立：清糟粕现在就能做、和 Niri 无关；Niri 装了不喜欢 `apt remove` 掉就行，GNOME 留着当后路。
> 关联 [[Arch Linux 调研]]：**先在这里确认喜不喜欢 Niri，再决定要不要为它折腾发行版**——第二节讲清楚了哪些糟粕在 Ubuntu 上清不掉、只有换发行版才解决。

### 执行顺序（照这个走，每步都可回退）

| 步骤 | 做什么 | 风险 | 可回退 |
|------|--------|------|--------|
| **1** | 清 snap + 清遥测（第二节） | 低 | Firefox 换成 Mozilla 官方 deb，装回 snapd 也不难 |
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

## 二、Niri 能换掉什么、换不掉什么（顺便清理 Ubuntu 糟粕）

一句话：**Niri 只动「桌面」这一层。你最想清掉的东西里，有一半和 Niri 无关但能顺手清，另一半结构上就清不掉。**

| 层 | 具体是什么 | Niri 管不管 |
|----|-----------|------------|
| **桌面 / 窗口管理** | GNOME Shell、Mutter、Nautilus、GNOME 全家桶应用、gdm3 | ✅ **完全替换掉** |
| **系统自带软件与服务** | snap、遥测上报、Ubuntu Pro 广告、崩溃上报 | ⚠️ 和 Niri 无关，但**可以另外清掉**（见下） |
| **包管理与软件版本** | apt / dpkg、源里版本冻结两年、元包一把塞一堆东西 | ❌ **换不掉**。这就是发行版的定义 |

最后一行值得盯着看：**你最初想换 Arch 的真正理由（软件版本旧、包管理乱），恰好落在 Niri 够不到的那一层。**

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

## 十二、延伸阅读

- [Niri 官方仓库](https://github.com/niri-wm/niri) / [Getting Started](https://niri-wm.github.io/niri/Getting-Started.html) / [Wiki](https://github.com/niri-wm/niri/wiki/Getting-Started)
- [It's FOSS：Niri 上手评测](https://itsfoss.com/niri-window-manager/)
- [MakeUseOf：试了 Niri 但不适合我](https://www.makeuseof.com/every-linux-user-told-me-to-try-niri-so-i-finally-did-and-it-wasnt-for-me/)（反面视角，值得先看）
- [Exploring Niri（Debian 13 安装记）](https://weiyichen.me/blog/niri_exploration)
- [NyxNiri](https://github.com/ech678/NyxNiri) —— 视频里那套配置。**只支持 Arch / CachyOS，Ubuntu 上装不了**；能抄的只有发行版无关的片段，详见第七节末尾
- [Noctalia 官网](https://noctalia.dev/) / [文档](https://docs.noctalia.dev/) —— NyxNiri 用的 shell，Debian 系需自行编译 noctalia-qs
- [DankMaterialShell（DMS）](https://github.com/AvengeMedia/DankMaterialShell) —— Ubuntu 25.10+ 可 apt 直装的替代选择

相关笔记：[[Arch Linux 调研]]、[[Linux]]
