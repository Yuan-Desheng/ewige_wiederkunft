---
createTime: 2026-08-22 12:40
笔记ID: 20260822124000
multiFile:
multiMedia:
description: Niri 滚动平铺窗口管理器的日常使用速查（Ubuntu 26.04 + DMS 版）：核心心智模型、按实际 config.kdl 核对的完整键位表（窗口/列/工作区/显示器/截图/电源）、GNOME 迁移差异、DMS（DankMaterialShell）主题系统调整入口、Walker 启动器、常见症状对照
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
<progress value="60" max="100" style="width: 100%;"></progress>

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

### 5. 截图 / 多媒体（本机加配）

| 键 | 作用 |
|----|------|
| `Print` | 交互式截图（niri 内置：选窗口/区域，存 `~/Pictures/Screenshots/`） |
| `Mod+Shift+S` | **区域截图直接进剪贴板**（本机加配，grim+slurp+wl-copy） |
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

### 8. 常见症状速查

| 症状                  | 原因 / 解决                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| DMS 顶栏没起来           | `dms doctor` 自检；手动 `dms run` 看报错                                                                          |
| DMS 行为怪异            | `dms restart` 重启 shell（配置不动）                                                                              |
| 嵌套试跑按键无效            | 嵌套模式 `Mod` = `Alt` 不是 `Super`（niri 设计如此）                                                                  |
| Walker 弹不出          | elephant 服务挂了：`systemctl --user status elephant`；或配置文件颜色格式错（fuzzel/walker 对色值格式挑剔，看 `~/.local/state` 下日志） |
| 浏览器上传不弹文件框          | 26.04 已预防性配好 portals.conf；若仍触发见 [[Ubuntu 上安装 Niri]] 十三章 gist 方案                                           |
| VSCode / 微信打不了中文    | 启动参数加 `--enable-wayland-ime`                                                                              |
| 顶栏图标是方块             | Nerd Font 丢了：`fc-list \| grep -i nerd`，字体在 `~/.local/share/fonts`                                         |
| 登录界面起不来（greetd）     | `Ctrl+Alt+F3` 进 TTY：`sudo systemctl disable greetd && sudo systemctl enable gdm3`                         |
| **登录页没有 Niri 选项**   | `dms greeter install/sync` 会删 `niri.desktop`：`sudo apt install --reinstall niri` 恢复，跑完 greeter 相关命令必检查    |
| X11 老程序起不来（Steam 等） | xwayland-satellite 没跑：`pgrep xwayland-satellite`                                                          |
| 想看 niri 眼里的屏幕/窗口    | `niri msg outputs` / `niri msg windows`                                                                   |
| **托盘应用点击唤不回窗口**     | Flutter 应用通病（托盘无 `Activate`、窗口 unmap）：配 toggle 键（见 7.8 节范式），应急 `pkill -x 应用名 && 重启命令`  |

相关笔记：[[Ubuntu 上安装 Niri]]、[[Arch Linux 调研]]、[[Linux]]
