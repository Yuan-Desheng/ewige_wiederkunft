---
createTime: 2026-08-22 12:40
笔记ID: 20260822124000
multiFile:
multiMedia:
description: Niri 滚动平铺窗口管理器的日常使用速查：核心心智模型、按实际 config.kdl 核对的完整键位表（窗口/列/工作区/显示器/截图/电源）、GNOME 迁移差异、Tokyonight Moon 主题套件（dotfriedrice 移植）的文件位置与调整入口、Walker 启动器、常见症状对照
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

> **定位**：[[Ubuntu 上安装 Niri]] 的姊妹篇——那篇管「装」，这篇管「用」。键位全部按本机 `~/.config/niri/config.kdl`（2026-08-22 版）核对过，非官方文档照抄。安装、排障、卸载请回原笔记。

### 0. 核心心智：一条无限长的横向条带

```
       ┌─── 你的屏幕（可视窗口）───┐
 ...   │  [编辑器]  [终端]  [浏览器] │   [文档]  [Slack]  ...
       └───────────────────────────┘
        ←──────── 横向滚动 ────────→
```

- **开新窗口不重排**：追加到条带右侧，现有窗口纹丝不动（和 i3/GNOME 最大的区别）
- **没有「最小化」**：窗口一直活着，滚出视野而已。找回：滚动 / `Mod+D` 搜 / 顶栏任务栏图标点击
- **列（column）是基本单位**：一个窗口默认一列；`Mod+Comma` 把窗口吞进左列变多行堆叠
- **忘了任何键 → `Mod+Shift+/` 弹快捷键面板**，这是唯一需要背的键

### 1. 日常高频（先练熟这一组）

| 键                       | 作用                         |
| ----------------------- | -------------------------- |
| `Mod+T`                 | 开终端（alacritty）             |
| `Mod+D`                 | 应用启动器（**Walker**：应用+命令+计算） |
| `Mod+Shift+D`           | 备用启动器（fuzzel）              |
| `Mod+O`                 | 概览模式（缩放看全部窗口）             |
| `Mod+Q`                 | 关窗口                        |
| `Mod+Shift+/`           | **快捷键面板**（忘了就按它）           |
| `Mod+R`                 | 循环列宽 1/4 → 1/3 → 1/2 → 2/3 |
| `Mod+F` / `Mod+Shift+F` | 列最大化（仍并排）/ 窗口真全屏           |
| `Mod+Shift+E`           | 退出 Niri 回登录界面              |
| `Super+Alt+L`           | 锁屏（swaylock）               |

### 2. 焦点移动（`Mod` = Super 键）

| 键 | 作用 |
|----|------|
| `Mod+←/→` 或 `Mod+H/L` | 焦点左右移（列间） |
| `Mod+↑/↓` 或 `Mod+K/J` | 焦点上下移（列内堆叠窗口间） |
| `Mod+Home` / `Mod+End` | 跳到条带最左 / 最右 |
| `Mod+U` / `Mod+I` | 上 / 下一个工作区 |
| `Mod+1..9` | 直达工作区（每显示器独立编号） |
| `Mod+WheelScroll↑/↓` | 滚轮切工作区；`←/→` 滚轮切列 |

### 3. 移动窗口 / 调整大小

| 键 | 作用 |
|----|------|
| `Mod+Ctrl+方向` 或 `Mod+Ctrl+H/J/K/L` | **移动窗口**（注意：不是 Shift） |
| `Mod+-` / `Mod+=` | 列宽 ±10% |
| `Mod+Shift+=` / `Mod+Shift+-` | 窗口高度 ±10% |
| `Mod+Ctrl+R` | 循环预设窗口高度 |
| `Mod+V` | 浮动 / 平铺切换 |
| `Mod+W` | 列内 tab 页模式切换 |
| `Mod+Comma` | 把下方窗口吞进当前列（堆叠）；`Mod+[` `Mod+]` 吞/吐左右列 |

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

### 7. 主题套件：改哪里（Tokyonight Moon · dotfriedrice 移植版）

| 想改什么 | 文件 |
|----------|------|
| 状态栏模块/样式 | `~/.config/waybar/config.jsonc` + `style.css` |
| 启动器外观 | `~/.config/walker/themes/base/theme.css`（只动色板；布局在 style.css） |
| 通知气泡 | `~/.config/mako/config`（改完 `makoctl dismiss -a` 生效） |
| 锁屏配色 | `~/.config/swaylock/config` |
| 终端配色 | `~/.config/alacritty/alacritty.toml` |
| 焦点环渐变 / gaps / 列宽档 | `~/.config/niri/config.kdl`（**保存即热重载**） |
| 壁纸 | 换图后改 config.kdl 里 swaybg 那行的路径 |
| 电源菜单脚本 | `~/.local/bin/power-menu`（锁屏/注销/重启/关机） |
| 旧 Mocha 主题回滚 | `~/niri-mocha-backup-1252/`（整套旧配置） |

> Tokyonight Moon 常用色：青 `#33ccff` 蓝 `#7aa2f7` 绿 `#9ece6a` 橙 `#e0af68` 粉红 `#ff007c` 紫 `#bb9af7` 底 `#1a1b26`/`#1e2030` 深底 `#14151f`。

### 7.5 Walker：比 fuzzel 强在哪

`Mod+D` 弹出（常驻服务，首弹无延迟）：

- **应用 + 命令合一**：输入 `fire` 开 Firefox，输入 `alacritty` 直接当 runner 用
- **内置计算器**：输入 `233*7+1` 直接出结果回车复制
- 备用启动器 fuzzel 在 `Mod+Shift+D`（Walker 出问题时用）
- 配置：`~/.config/walker/config.toml`（providers 决定搜什么）

### 8. 常见症状速查

| 症状 | 原因 / 解决 |
|------|-------------|
| 浏览器上传不弹文件框 | portal 没跑：`pgrep xdg-desktop-portal`，装的是 `xdg-desktop-portal-gnome/gtk` |
| VSCode / 微信打不了中文 | 启动参数加 `--enable-wayland-ime` |
| 顶栏图标是方块 | Nerd Font 丢了：`fc-list \| grep -i nerd`，重装 `~/.local/share/fonts` |
| 出现两条状态栏 | config.kdl 里重复 spawn waybar，或手动又起了一个 |
| X11 老程序起不来（Steam 等） | xwayland-satellite 没跑：`pgrep xwayland-satellite` |
| 想看 niri 眼里的屏幕/窗口 | `niri msg outputs` / `niri msg windows` |

相关笔记：[[Ubuntu 上安装 Niri]]、[[Arch Linux 调研]]、[[Linux]]
