---
createTime: 2026-08-22 12:40
笔记ID: 20260822124000
multiFile:
multiMedia:
description: Niri 滚动平铺窗口管理器的日常使用速查（Ubuntu 26.04 + DMS 版）：核心心智模型、按实际 config.kdl 核对的完整键位表（窗口/列/工作区/显示器/截图/电源）、GNOME 迁移差异、DMS（DankMaterialShell）主题系统调整入口、Walker 启动器、双屏排布与镜像、终端按键坑（SSH 退格/小键盘 Enter）、常见症状对照
笔记类型: 收集笔记
阐述日期:
tags:
  - Linux
  - Niri
  - Wayland
  - 效率工具
aliases:
  - Niri速查
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Niri 使用速查
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="70" max="100" style="width: 100%;"></progress>

> **定位**：[[Ubuntu 上安装 Niri]] 的姊妹篇——那篇管「装」，这篇管「用」。键位全部按本机 `~/.config/niri/config.kdl`（2026-08-23 版）核对过，非官方文档照抄。安装、排障、卸载请回原笔记。

### 0. 核心心智：一条无限长的横向条带

```
       ┌─── 你的屏幕（可视窗口）───┐
 ...   │  [编辑器]  [终端]  [浏览器] │   [文档]  [Slack]  ...
       └───────────────────────────┘
        ←──────── 横向滚动 ────────→
```

- **开新窗口不重排**：追加到条带右侧，现有窗口纹丝不动（和 i3/GNOME 最大的区别）
- **没有「最小化」**：窗口一直活着，滚出视野而已。找回：滚动 / `Mod+D` 搜 / 顶栏任务栏图标点击
- **列（column）是基本单位**：一个窗口默认一列；`Mod+Shift+Comma` 把窗口吞进左列变多行堆叠
- **忘了任何键 → `Mod+Shift+/` 弹快捷键面板**，这是唯一需要背的键

### 1. 日常高频（先练熟这一组）

| 键                       | 作用                         |
| ----------------------- | -------------------------- |
| `Mod+1`                 | **Obsidian**（开过聚焦/没开启动）    |
| `Mod+2`                 | **XQNetwork**（开过聚焦/缩托盘拉起）  |
| `Mod+T`                 | 开终端（alacritty）             |
| `Mod+D`                 | 应用启动器（**Walker**：应用+命令+计算） |
| `Mod+Space`             | **DMS spotlight**（应用+剪贴板+计算） |
| `Mod+V`                 | 剪贴板历史（cliphist）           |
| `Mod+Comma`             | **DMS 设置 GUI**             |
| `Mod+N` / `Mod+M`       | 通知中心 / 任务管理器               |
| `Mod+Y`                 | 壁纸浏览                       |
| `Mod+Shift+D`           | 备用启动器（fuzzel）              |
| `Mod+O`                 | 概览模式（缩放看全部窗口，带壁纸背景）       |
| `Mod+Q`                 | 关窗口                        |
| `Mod+Shift+/`           | **快捷键面板**（忘了就按它）           |
| `Mod+R`                 | 循环列宽 1/4 → 1/3 → 1/2 → 2/3 |
| `Mod+F` / `Mod+Shift+F` | 列最大化（仍并排）/ 窗口真全屏           |
| `Mod+Shift+E`           | 退出 Niri 回登录界面              |
| `Mod+Alt+L`             | 锁屏（DMS 锁屏，桌面同主题）           |

### 2. 焦点移动（`Mod` = Super 键）

| 键 | 作用 |
|----|------|
| `Mod+←/→` 或 `Mod+H/L` | 焦点左右移（列间） |
| `Mod+↑/↓` 或 `Mod+K/J` | 焦点上下移（列内堆叠窗口间） |
| `Mod+Home` / `Mod+End` | 跳到条带最左 / 最右 |
| `Mod+U` / `Mod+I` | 上 / 下一个工作区 |
| `Mod+3..9` | 直达工作区（⚠️ 1、2 已让位给 Obsidian/XQNetwork；每显示器独立编号） |
| `Mod+WheelScroll↑/↓` | 滚轮切工作区；`←/→` 滚轮切列 |

### 3. 移动窗口 / 调整大小

| 键 | 作用 |
|----|------|
| `Mod+Ctrl+方向` 或 `Mod+Ctrl+H/J/K/L` | **移动窗口**（注意：不是 Shift） |
| `Mod+-` / `Mod+=` | 列宽 ±10% |
| `Mod+Shift+=` / `Mod+Shift+-` | 窗口高度 ±10% |
| `Mod+Ctrl+R` | 循环预设窗口高度 |
| `Mod+Ctrl+V` | 浮动 / 平铺切换（原 `Mod+V` 让给剪贴板） |
| `Mod+W` | 列内 tab 页模式切换 |
| `Mod+Shift+Comma` | 把下方窗口吞进当前列（堆叠）；`Mod+[` `Mod+]` 吞/吐左右列 |

### 4. 工作区与双屏

| 键 | 作用 |
|----|------|
| `Mod+Shift+1..9` | 带着焦点窗口跳工作区 |
| `Mod+Shift+H/L/J/K` | 焦点扔到相邻显示器 |
| `Mod+Shift+PageUp/Down` | 交换工作区位置 |
| `Mod+Ctrl+1..9` | 把窗口移到指定工作区（不跟过去） |

> 双屏心法：**工作区属于各自的显示器**，插上带鱼屏后两边独立滚动，互不干扰。

### 4.5 双屏排布与镜像

**排布（扩展模式）**：`~/.config/niri/config.kdl` 的 `output` 块用 `position x= y=` 定位各屏，**保存即热重载**；只想临时试摆位用运行时命令（重启即丢，且改配置文件会被覆盖）：

```bash
niri msg outputs                                # 看当前屏 / 模式 / 逻辑坐标
niri msg output HDMI-A-1 position x=1920 y=0    # 挪到内屏右边
niri msg output HDMI-A-1 mode 3440x1440@100     # 换刷新率
```

本机两块屏：内屏 eDP-1 1920×1080@144、带鱼屏 HDMI-A-1 3440×1440@100（带鱼屏在上 (0,0)、内屏在正下方 (742,1440)）。经常拔插显示器的话可配 kanshi 自动切换排布（niri 官方 wiki 推荐）。

**镜像**：niri **无原生镜像**（IPC 无 mirror 动作，官方确认未实现）。社区方案 wl-mirror——把一块屏的画面镜像成一个全屏窗口：

```bash
sudo apt install wl-mirror
wl-mirror eDP-1    # 开一个实时镜像内屏的窗口
# 然后 Mod+Shift+方向 把窗口扔到带鱼屏 → Mod+Shift+F 全屏，即完成镜像
```

16:9 内屏镜像到 21:9 带鱼屏两侧会有黑边（比例不同）。

### 5. 截图 / 多媒体（本机加配）

| 键 | 作用 |
|----|------|
| `Win+A` | **冻结画面 → 在冻结图上框选 → Satty 标注**（箭头/框/文字；保存到 `~/Pictures/Screenshots/` + 进剪贴板）。实现：`~/.local/bin/shot-annotate`（grim 抓聚焦屏 → imv 全屏铺冻结图 → slurp 框选 → PIL 裁剪 → satty） |
| `Win+S` | niri 内置截图：立即冻结，选区域/窗口（不能标注） |
| `Win+P` / `Win+Print` | DMS 截图 |
| `Win+Shift+S` | 框选后静默直接进剪贴板（grim+slurp+wl-copy，无标注） |
| `Print`（有此键的键盘） | 同 niri 内置交互式截图 |
| `Ctrl+Print` / `Alt+Print` | 整屏 / 当前窗口截图存文件 |
| 音量/亮度/播放 | 键盘 FN 多媒体键直通（wpctl / brightnessctl / playerctl） |

### 6. 从 GNOME 迁移的差异对照

| GNOME 里做的事 | Niri 里怎么做 |
|----------------|---------------|
| Alt-Tab 切窗口 | 左右滚条带（空间记忆）或顶栏任务栏图标点击 |
| 最小化 | 不存在——窗口滚出视野，`Mod+D` 搜回 |
| 拖窗口到另一屏 | `Mod+Ctrl+方向` 移动 + `Mod+Shift+方向` 换焦点屏 |
| 双击标题栏最大化 | `Mod+F`（列最大化）/ `Mod+Shift+F`（真全屏） |
| Activities 搜应用 | `Mod+D` |
| Super 长按 | `Mod+Shift+/` 快捷键面板 |
| 工作区在所有屏共享 | **每屏独立**，编号各自从 1 开始 |
| 截图工具 | `Print` / `Mod+Shift+S`（剪贴板） |

### 7. 主题套件：改哪里（26.04 + DMS 版）

**2026-08-22 起桌面 shell 换成 DMS（DankMaterialShell）**，顶栏/通知/壁纸/控制中心/锁屏都归它管，改外观优先走 DMS 设置 GUI（顶栏右键，或 `dms ipc open settings`）。

| 想改什么 | 去哪改 |
|----------|--------|
| 顶栏模块 / 圆角 / 模糊 / 主题色 | **DMS 设置 GUI**（`Mod+Comma` 或 `dms ipc open settings`）|
| DMS 主题色来源 | 换壁纸后 DMS 用 matugen 自动取色重新生成（`Mod+Y` 壁纸浏览） |
| niri 的 gaps/圆角/焦点环颜色 | **DMS 设置 GUI → Compositor**（经 `include "dms/*.kdl"` 实时同步，别再手改主配置的这些段） |
| 启动器 | Walker 在 `Mod+D`；DMS spotlight 在 `Mod+Space`（应用+剪贴板+计算），剪贴板历史 `Mod+V` |
| 输入法皮肤 | `~/.config/fcitx5/conf/classicui.conf` 的 `Theme=`（现用 **Tokyonight-Storm**：深蓝底 `#222436` + 亮蓝高亮 `#82aaff`，与桌面全套配色同族）；主题文件在 `~/.local/share/fcitx5/themes/`（含 60 个 Catppuccin 变体可随时换）；改完 `fcitx5-remote -r` 重载，彻底重启用 `pkill fcitx5 && fcitx5 -d` |
| 终端 | ghostty（视频同款，DMS 已接管其配色）；alacritty 配置保留备用 |
| 动画 / 阴影 / 键位 / 双屏 | `~/.config/niri/config.kdl`（**保存即热重载**）；DMS 键位在 `~/.config/niri/dms/binds.kdl` |
| DMS CLI 瑞士军刀 | `dms doctor`（自检）/ `dms ipc`（控制）/ `dms restart`（shell 重启） |
| 登录界面 | dms-greeter + greetd（gdm3 保留，`sudo systemctl disable greetd && sudo systemctl enable gdm3` 可切回） |
| 旧组件回滚 | waybar/mako/swaybg 配置都还在 `~/.config/`，niri config.kdl 里取消 DMS 的 spawn、恢复注释掉的 swaybg 行即可 |

> Tokyonight Moon 常用色（niri 配置仍用）：青 `#33ccff` 蓝 `#7aa2f7` 绿 `#9ece6a` 橙 `#e0af68` 粉红 `#ff007c` 紫 `#bb9af7` 底 `#1a1b26`/`#1e2030` 深底 `#14151f`。
> 备份链：`~/niri-mocha-backup-1252/`（Mocha 版）→ `~/upgrade-2604-backup/`（升级 26.04 前）。

### 7.5 Walker：比 fuzzel 强在哪

`Mod+D` 弹出（常驻服务，首弹无延迟）：

- **应用 + 命令合一**：输入 `fire` 开 Firefox，输入 `alacritty` 直接当 runner 用
- **内置计算器**：输入 `233*7+1` 直接出结果回车复制
- 备用启动器 fuzzel 在 `Mod+Shift+D`（Walker 出问题时用）
- 配置：`~/.config/walker/config.toml`（providers 决定搜什么）

### 7.8 应用专属键与「找回窗口」编程范式

`Mod+数字` 被用作常用应用直达键（1=Obsidian、2=XQNetwork）。XQNetwork 的 `~/.local/bin/xq-toggle` 示范了 niri IPC 的窗口管理范式，任何「应用缩托盘/窗口丢了」都能照抄：

```bash
# 找窗口 ID → 聚焦；找不到 → 拉起
ID=$(niri msg --json windows | python3 -c "
import json,sys
for w in json.load(sys.stdin):
    if '关键词' in w.get('title','').lower(): print(w['id']); break")
[ -n "$ID" ] && niri msg action focus-window --id "$ID" || 启动命令
```

> 起因：XQNetwork 是 Flutter 应用，托盘不实现 `Activate` 协议（DBus 铁证）、窗口隐藏是协议层 unmap——任何外部 shell 都唤不回，只能这样从 compositor 侧补。Electron 应用（如 Obsidian）自带单实例唤醒，直接 `spawn` 即可，不需要 toggle 脚本。

### 7.9 终端两个按键坑：SSH 退格变空格 / 小键盘 Enter 失灵（已修）

| 症状 | 原因 | 修复 |
|------|------|------|
| SSH 到服务器后按退格键「加一个空格」而不是删除 | alacritty / ghostty 给远端发的是 `TERM=alacritty` / `xterm-ghostty`，服务器上没有这些 terminfo 条目，退格字节被错误回显成前移一格 | 统一发通用的 `xterm-256color`：`~/.config/alacritty/alacritty.toml` 的 `[env]` 段 + `~/.config/ghostty/config` 的 `term`（真彩色走 `COLORTERM`，不受影响） |
| 小键盘 Enter「有时候」按了没反应 | vim / htop / Claude Code 等 TUI 会把终端切到应用键盘模式，此模式下小键盘 Enter 发的是 `ESC O M` 序列，不认识的程序直接忽略 | 强制永远发 `\r` 与主 Enter 一致：alacritty 加 `[[keyboard.bindings]]`（`NumpadEnter` → `chars = "\r"`）；ghostty 加 `keybind = numpad_enter=text:\r` |

> 已连着的 SSH 会话里执行 `export TERM=xterm-256color` 可立即恢复退格。IDEA 内置终端 / Obsidian 里的小键盘 Enter 走各自的按键转发，与这两处配置无关。

### 8. 常见症状速查

| 症状                  | 原因 / 解决                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| DMS 顶栏没起来           | `dms doctor` 自检；手动 `dms run` 看报错                                                                          |
| DMS 行为怪异            | `dms restart` 重启 shell（配置不动）                                                                              |
| 嵌套试跑按键无效            | 嵌套模式 `Mod` = `Alt` 不是 `Super`（niri 设计如此）                                                                  |
| Walker 弹不出          | elephant 服务挂了：`systemctl --user status elephant`；或配置文件颜色格式错（fuzzel/walker 对色值格式挑剔，看 `~/.local/state` 下日志） |
| 浏览器上传不弹文件框          | 26.04 已预防性配好 portals.conf；若仍触发见 [[Ubuntu 上安装 Niri]] 十三章 gist 方案                                           |
| VSCode / 微信打不了中文    | 启动参数加 `--enable-wayland-ime`；**Electron 应用若外壳太老则无解**（见下一行）                                  |
| **Obsidian 切不了中文输入法** | deb 里的 Electron 外壳太老（本机曾装 1.7.7 = Electron 32/Chromium 128，只会 text-input **v1**，而 niri 只提供 **v3**，参数救不了）；且应用内自更新只升 JS 不换外壳（界面显示 1.13.7 但外壳仍是 2024 年的）。**解法：装官方最新 deb**（1.13.7 起 = Electron 43，默认走 v3），启动带 `--enable-wayland-ime --wayland-text-input-version=3`（已配在 `Mod+1`）。判别法：`strings /opt/Obsidian/obsidian \| grep Electron/` 看外壳版本；`timeout 2 env WAYLAND_DEBUG=1 wl-copy x 2>&1 \| grep text_input` 看 compositor 提供的协议版本 |
| 顶栏图标是方块             | Nerd Font 丢了：`fc-list \| grep -i nerd`，字体在 `~/.local/share/fonts`                                         |
| 登录界面起不来（greetd）     | `Ctrl+Alt+F3` 进 TTY：`sudo systemctl disable greetd && sudo systemctl enable gdm3`                         |
| **登录页没有 Niri 选项**   | `dms greeter install/sync` 会删 `niri.desktop`：`sudo apt install --reinstall niri` 恢复，跑完 greeter 相关命令必检查    |
| X11 老程序起不来（Steam 等） | xwayland-satellite 没跑：`pgrep xwayland-satellite`                                                          |
| 想看 niri 眼里的屏幕/窗口    | `niri msg outputs` / `niri msg windows`                                                                   |
| **托盘应用点击唤不回窗口**     | Flutter 应用通病（托盘无 `Activate`、窗口 unmap）：配 toggle 键（见 7.8 节范式），应急 `pkill -x 应用名 && 重启命令`  |
| SSH 后退格变「加一个空格」      | 远端没有 alacritty / ghostty 的 terminfo；已改发 `xterm-256color`（见 7.9） |
| 小键盘 Enter 时灵时不灵        | 应用键盘模式下发 `ESC O M`；已绑定为永远发 `\r`（见 7.9） |
| 想镜像屏幕                      | niri 无原生镜像，用 wl-mirror 开全屏窗口（见 4.5） |
| **蓝牙开不了**（设置开关灰/无反应） | `rfkill list` 看 Soft blocked——多半是按过飞机模式，退出时蓝牙没跟着恢复；`rfkill unblock bluetooth` 即解 |

相关笔记：[[Ubuntu 上安装 Niri]]、[[Arch Linux 调研]]、[[Linux]]
