---
createTime: 2026-08-17 14:11
笔记ID: 20260817141112
multiFile:
multiMedia:
description: 在现有 Ubuntu 上零风险试玩 Niri 滚动平铺窗口管理器：嵌套窗口试跑、PPA 与源码两条安装路线、NVIDIA 混合显卡配置、配套组件与中文输入法、试玩判断清单与干净卸载
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

> 目的：**在不换发行版、不动现有系统的前提下，花两天判断自己是不是真喜欢滚动平铺这套交互。** 配套 [[Arch Linux 调研]] 的行动建议第 1 步——先确认喜欢 Niri，再决定要不要为它折腾发行版。
> 全程可逆：装了不喜欢，`apt remove` 掉就行，现有 GNOME 桌面一根毛都不会少。

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

## 二、动手前先查三件事

```bash
# 1. Ubuntu 版本 —— 决定走哪条安装路线
lsb_release -a

# 2. 当前会话是 Wayland 还是 X11
echo $XDG_SESSION_TYPE

# 3. 显卡和驱动
lspci -nnk | grep -A3 -i vga
```

记下结果，下一节按版本分叉。

## 三、安装：三条路线，按你的情况选

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

## 四、首次启动

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

## 五、NVIDIA 混合显卡（本机必看）

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

## 六、最小可用配套（Niri 什么都不自带）

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

## 七、中文输入法（fcitx5）

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

## 八、配置入门：config.kdl

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

## 九、试玩判断清单（这才是这份笔记的目的）

用两天，重点验证这几件事。**不是验证 Niri 好不好，是验证它适不适合你**：

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

## 十、干净卸载

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

## 十一、延伸阅读

- [Niri 官方仓库](https://github.com/niri-wm/niri) / [Getting Started](https://niri-wm.github.io/niri/Getting-Started.html) / [Wiki](https://github.com/niri-wm/niri/wiki/Getting-Started)
- [It's FOSS：Niri 上手评测](https://itsfoss.com/niri-window-manager/)
- [MakeUseOf：试了 Niri 但不适合我](https://www.makeuseof.com/every-linux-user-told-me-to-try-niri-so-i-finally-did-and-it-wasnt-for-me/)（反面视角，值得先看）
- [Exploring Niri（Debian 13 安装记）](https://weiyichen.me/blog/niri_exploration)
- [NyxNiri](https://github.com/ech678/NyxNiri) —— 视频里那套配置，**当参考抄，别一键跑**（理由见 [[Arch Linux 调研]] 第二节）

相关笔记：[[Arch Linux 调研]]、[[Linux]]
