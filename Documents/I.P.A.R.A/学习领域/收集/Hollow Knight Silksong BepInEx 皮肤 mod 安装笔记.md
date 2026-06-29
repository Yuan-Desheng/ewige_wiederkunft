---
createTime: 2026-06-28 22:07
笔记ID: 20260628220700
multiFile:
multiMedia:
description: 在 Steam Linux 版 Hollow Knight: Silksong 上通过 BepInEx + SSCustomizer 加载器安装第三方皮肤 mod(以「星见雅皮肤 1.5」为例)的完整复现步骤。
笔记类型: 收集笔记
阐述日期:
tags:
  - Linux
  - Steam
  - HollowKnight
  - Silksong
  - BepInEx
  - Modding
  - SSCustomizer
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

# Hollow Knight: Silksong BepInEx 皮肤 mod 安装笔记

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="100" max="100">100%</progress>

> **2026-06-28 22:40 验证通过**:游戏主菜单已显示星见雅皮肤(由 CustomizerT2D 的 `UI.Image.set_sprite` Hook 触发)。本文早期"mod 失效诊断"那一节是基于源码推测的错误结论,已被实际验证推翻,详情见末尾"✅ mod 实际生效"节。

## 概述

在 Steam Linux 版 Hollow Knight: Silksong 上安装第三方皮肤 mod,把主角 Hornet 的纹理替换为「星见雅」形象。安装涉及三个组件:**BepInEx 框架**(Unity 通用 mod 注入)、**SSCustomizer + CustomizerT2D**(Silksong 专属皮肤加载器)、**XJY-Zycl_dhth 资源包**(实际换皮 atlas PNG)。

> **关键认知校正**: 网上不少教程说"Silksong 没有 CustomKnight 等价 mod",这是**错的**。**SSCustomizer(RatherChaotic 开发)就是 Silksong 端的等价品**,GitHub: https://github.com/RatherChaotic/SSCustomizer 。GitHub 搜索 `silksong custom skin` 没直接命中是因为 mod 名是 "Customizer",不是 "custom-skin"。

## 环境信息

- 系统:Ubuntu 24.04.4 LTS (Noble Numbat), x86_64
- Steam 客户端:已登录,本地安装路径 `~/.steam/debian-installation/`
- 游戏: Hollow Knight: Silksong (App ID 1030300), Unity v6000.0.50f1 + Mono BleedingEdge x86_64
- 磁盘:游戏根目录 + mods 占用 ~1.5GB(含备份)

## 关键路径速查

| 类别 | 路径 |
|------|------|
| 游戏根目录 | `~/.steam/debian-installation/steamapps/common/Hollow Knight Silksong/` |
| BepInEx 框架 | `<游戏根目录>/BepInEx/` |
| mod 加载器 | `<游戏根目录>/BepInEx/plugins/Customizer/` + `CustomizerT2D/` |
| 皮肤资源 | `<游戏根目录>/Hollow Knight Silksong_Data/Mods/Customizer/<皮肤名>/` |
| 启动脚本 | `<游戏根目录>/run_bepinex.sh`(BepInEx 注入入口) |
| 验证日志 | `<游戏根目录>/BepInEx/LogOutput.log` |

> 教程中写的 `Hollow Knight_Silksong_Data`(下划线)是**笔误**,**实际是空格**(`Hollow Knight Silksong_Data`)。

## 第一步:安装必备工具

```bash
# unar 支持 RAR 5.x(unzip / bsdtar 不行,1.0 包的 BepInEx.rar 是 RAR5)
sudo apt-get install -y unar
```

## 第二步:安装 BepInEx 框架(如已装可跳)

```bash
GAME_DIR="/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong"

# 1.0 包内带的 BepInEx.rar 是 v5.4.23.4
cd ~/下载/丝之歌x星见雅皮肤1.0
unar BepInEx.rar                       # 默认解到当前目录 ./BepInEx/

# 把 BepInEx 整个文件夹、doorstop 配置、winhttp.dll 等都移到游戏根目录
cp -rv BepInEx/ "$GAME_DIR/"
cp -v changelog.txt doorstop_config.ini .doorstop_version winhttp.dll "$GAME_DIR/"
cp -v run_bepinex.sh "$GAME_DIR/"
chmod +x "$GAME_DIR/run_bepinex.sh" "$GAME_DIR/libdoorstop.so" "$GAME_DIR/Hollow Knight Silksong"

# 自动注入验证: 启动一次游戏,游戏目录会自动生成 BepInEx/plugins/、cache/、config/、LogOutput.log
```

## 第三步:安装 SSCustomizer + CustomizerT2D(BepInEx plugins)

```bash
GAME_DIR="/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong"
SRC="/home/yuan/下载/丝之歌x星见雅皮肤1.0"

cp -rv "$SRC/Customizer/"    "$GAME_DIR/BepInEx/plugins/Customizer/"
cp -rv "$SRC/CustomizerT2D/" "$GAME_DIR/BepInEx/plugins/CustomizerT2D/"
```

每个目录内容:
- `Customizer/Customizer.dll` (8 KB, .NET/Mono assembly)
- `Customizer/icon.png`、`manifest.json`、`README.md`(README 内容:A Simple mod that allows for customization of textures in Hollow Knight : Silksong)
- `CustomizerT2D/CustomizerT2D.dll` (16 KB)

## 第四步:安装星见雅皮肤资源(Silksong Data Mods)

```bash
GAME_DIR="/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong"
SRC="/home/yuan/下载/丝之歌x星见雅皮肤1.0"

# 路径: <game_root>/Hollow Knight Silksong_Data/Mods/Customizer/XJY-Zycl_dhth/
mkdir -pv "$GAME_DIR/Hollow Knight Silksong_Data/Mods/Customizer"
cp -rv "$SRC/XJY-Zycl_dhth" "$GAME_DIR/Hollow Knight Silksong_Data/Mods/Customizer/"
```

## 第五步:升级 mod 版本(1.0 → 1.5)

```bash
SRC="/home/yuan/下载/丝之歌x星见雅皮肤1.5"
GAME_DIR="/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong"

# 1. 备份当前版本
mv "$GAME_DIR/Hollow Knight Silksong_Data/Mods/Customizer/XJY-Zycl_dhth" \
   "$GAME_DIR/Hollow Knight Silksong_Data/Mods/Customizer/XJY-Zycl_dhth.v1.0.bak"

# 2. 部署新版本(Customizer / CustomizerT2D 不动,只换资源包)
cp -rv "$SRC/XJY-Zycl_dhth" "$GAME_DIR/Hollow Knight Silksong_Data/Mods/Customizer/"
```

> **升级原则**: Customizer 和 CustomizerT2D 是 mod **加载器**,**与皮肤版本无关**,不要动。**只换资源包 `XJY-Zycl_dhth/` 整个目录**。本次升级:108MB → 204MB,11 个子目录 → 33 个子目录,新增 Dustroach / EnemyHitEffects / Farmer Scissors / Gloom Beast / Lost Lace / Phantom / Silk Boss / Slab 等。

## 第六步:验证 mod 加载

```bash
GAME_DIR="/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong"
mkdir -p /tmp/silksong
cd "$GAME_DIR"
DISPLAY=:1 timeout 30 ./run_bepinex.sh "$GAME_DIR/Hollow Knight Silksong" > /tmp/silksong/launch.log 2>&1
```

`exit code 124` 是 timeout 退出,**正常**(只跑了 30 秒),mod 已加载并开始 hook。

**关键成功标志**(`BepInEx/LogOutput.log`):
```
[Message:   BepInEx] BepInEx 5.4.23.4 - Hollow Knight Silksong
[Message:   BepInEx] Preloader started
[Info   :   BepInEx] Patching [UnityEngine.CoreModule] with [BepInEx.Chainloader]
[Message:   BepInEx] Preloader finished
[Info   :CustomizerT2DOnly] [T2D] Patched UI.Image.set_sprite         ← ★ T2D 加载
[Info   :   BepInEx] Loading [Customizer 0.1.0]
[Info   :Customizer] Plugin customizer has loaded!                      ← ★ 加载器 OK
[Message:   BepInEx] Chainloader startup complete
[Info   : Unity Log] Steam initializing
[Info   : Unity Log] Steam logged in as <username>                       ← ★ Steam 登录 OK
[Info   :Customizer] Loaded scene: Pre_Menu_Loader                       ← ★ 进入场景
[Info   :Customizer] Loaded scene: Menu_Title                            ← ★ 主菜单
```

20+ 个 `Couldn't find a Game Manager` 错误是**已知的**(Silksong Linux 版 + Steamworks 时序问题),**只要看到 `Menu_Title` 加载就算成功**,游戏已经在跑。

## 部署结构总览

```
~/.steam/debian-installation/steamapps/common/Hollow Knight Silksong/
├── BepInEx/                                ← BepInEx 5.4.23.4 框架
│   ├── core/                               (BepInEx.dll, BepInEx.Preloader.dll, 0Harmony.dll 等)
│   ├── plugins/                            ← mod 加载器(BepInEx plugin)
│   │   ├── Customizer/                     ← SSCustomizer 0.1.0
│   │   │   ├── Customizer.dll              (8 KB)
│   │   │   ├── icon.png  manifest.json  README.md
│   │   │   └── README.md
│   │   └── CustomizerT2D/                  ← 配套 Texture2D 替换
│   │       └── CustomizerT2D.dll           (16 KB)
│   ├── patchers/  config/  cache/  LogOutput.log
│   └── doorstop_config.ini  winhttp.dll   (BepInEx 自带)
└── Hollow Knight Silksong_Data/
    └── Mods/                               ← 注意是空格不是下划线
        └── Customizer/                     ← SSCustomizer 数据目录(默认约定)
            ├── XJY-Zycl_dhth/              ← 星见雅皮肤资源(v1.5)
            │   ├── active.txt              (空文件,标记启用)
            │   ├── Knight/                 (HK1 小骑士备用)
            │   ├── Hornet Cloakless Cln/   (Silksong 主资源)
            │   ├── Hornet CrestWeapon Dagger Cln/
            │   ├── ... 33 个子目录
            │   └── Texture2D/              (34 个 atlas PNG, 4096x4096 / 2048x4096)
            └── XJY-Zycl_dhth.v1.0.bak/     ← 升级前 1.0 备份
```

## 常见问题

### RAR 解不出来
Ubuntu 默认 `unzip` 不支持 RAR 5.x。装 `unar`(`apt-get install unar`),bsdtar 不行。

### End-of-central-directory signature not found
zip 文件下载不完整。**162MB 的 GitHub release zip 通过云端代理下载**经常因 CDN 限速截断。本地浏览器下载可绕过。

### Steam failed to initialize / Couldn't find a Game Manager
Steam 客户端**必须在线**。检查 `~/.steam/steam/steam.pid` 存在、Steam 主窗口已登录。

### BepInEx 不 hook / 没有 LogOutput.log
检查 `doorstop_config.ini` 指向 `BepInEx\core\BepInEx.Preloader.dll`、`<game_root>/run_bepinex.sh` +x、`<game_root>/libdoorstop.so` 存在。

### Customizer 加载了但皮肤没生效
检查资源路径:
```
<game_root>/Hollow Knight Silksong_Data/Mods/Customizer/<skin-name>/active.txt
```
- `active.txt` 必须存在(哪怕是 0 字节空文件)
- 资源子目录里要有 atlas PNG(atlas0.png 等)

## 升级路径速查

| 想做的事 | 操作 |
|----------|------|
| 升级皮肤资源包 | 只换 `Mods/Customizer/XJY-Zycl_dhth/`,保留 `Customizer/` `CustomizerT2D/` |
| 升级 SSCustomizer 加载器 | 从 https://github.com/RatherChaotic/SSCustomizer Releases 下新 Customizer.dll,覆盖 `BepInEx/plugins/Customizer/Customizer.dll` |
| 切换其他皮肤 | 备份当前的 `XJY-Zycl_dhth/`,把别的皮肤资源目录复制到 `Mods/Customizer/<新名字>/` |
| 卸载 mod | `rm -rf BepInEx/plugins/Customizer CustomizerT2D Mods/Customizer/*` |
| 还原游戏 | 删除 BepInEx 整个文件夹 + `doorstop_config.ini` `winhttp.dll` + 还原 `~/backup-silksong-pre-mod-20260628/` 备份 |

## 参考链接

- **SSCustomizer GitHub**: https://github.com/RatherChaotic/SSCustomizer
- **SilksongWardrobe GitHub**: https://github.com/Zmarfan/SilksongWardrobe(换 Hornet 裙子色,跟换装无关)
- **BepInEx 文档**: https://docs.bepinex.dev/
- **HK1 CustomKnight**(对照参考): https://github.com/PrashantMoar/HollowKnight.CustomKnight(SSCustomizer 的设计灵感来源)

## 本次操作时间线(2026-06-28)

1. 22:00 备份原版游戏到 `~/backup-silksong-pre-mod-20260628/`
2. 22:01 解压 `BepInEx.rar` 到游戏根目录,装 BepInEx 5.4.23.4
3. 22:02 装 Customizer + CustomizerT2D 到 `BepInEx/plugins/`
4. 22:02 建 `Hollow Knight Silksong_Data/Mods/Customizer/` 目录
5. 22:02 复制 `XJY-Zycl_dhth/` (1.0) 到 Mods 目录
6. 22:03 首次启动游戏 → Customizer 0.1.0 加载成功,Steam logged in as `<user>`,进入 Menu_Title
7. 22:05 升级 1.0 → 1.5: 备份 v1.0.bak,复制 1.5 资源(204MB,33 个子目录)
8. 22:07 写本笔记到 Obsidian vault(学习领域/收集/)
9. 22:20 误判"mod 失效":基于 SSCustomizer 源码推测资源格式不兼容,无实测就下结论
10. 22:25 创建 ~/.local/share/applications/Hollow-Knight-Silksong-BepInEx.desktop(GNOME 识别失败)
11. 22:30 发现 gio launch / gtk-launch 在 .desktop 上有 bug,改用 ~/桌面/启动丝之歌.sh
12. 22:35 实测游戏跑通:运行启动脚本 → BepInEx 注入 → Menu_Title → 游戏窗口出现在屏幕
13. 22:36 把启动脚本 + .desktop 移到 ~/桌面/(用户后续改主意)
14. 22:37 再移到 ~/文档/Hollow Knight Silksong/(用户最终要求)
15. 22:40 用户确认主菜单 Hornet 角色**已显示星见雅皮肤** → mod 实际生效 → 更新笔记纠正错误


---

## 配套快捷方式(应用目录 · 2026-06-28 22:25 补)

**问题**:Steam 默认启动游戏(`steam://rungameid/1030300`)只调原生 binary `Hollow Knight Silksong`,**不会**通过 BepInEx Doorstop,**mod 加载器永不工作**。

**解决**:在应用目录创建**独立 .desktop 快捷方式**,直接调 `run_bepinex.sh` 跳过 Steam 客户端 launch URL。

### 文件:`~/文档/Hollow Knight Silksong/Hollow-Knight-Silksong-BepInEx.desktop`

(原计划放 `~/.local/share/applications/`,但 GNOME 24.04 + gio 2.80 不识别,改放 `~/文档/` 由用户手动调用或拖到桌面)

```ini
[Desktop Entry]
Name=Hollow Knight: Silksong (BepInEx)
Name[zh_CN]=空洞骑士：丝之歌 (BepInEx)
Comment=Play Hollow Knight: Silksong with BepInEx framework (skin mods enabled)
Comment[zh_CN]=通过 BepInEx 框架启动空洞骑士：丝之歌(已启用皮肤 mod)
Exec=/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong/run_bepinex.sh "/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong/Hollow Knight Silksong"
Path=/home/yuan/.steam/debian-installation/steamapps/common/Hollow Knight Silksong
Icon=steam_icon_1030300
Terminal=false
Type=Application
Categories=Game;
StartupNotify=true
StartupWMClass=Hollow Knight Silksong
Keywords=steam;silksong;bepinex;mod;
```

### 关键要点

- **Exec 必须是绝对路径**(`run_bepinex.sh` 会基于绝对路径解析 `BepInEx/core/BepInEx.Preloader.dll`)
- **路径含空格要引号**(game executable `Hollow Knight Silksong` 有空格)
- **Path 设为游戏根目录**(`run_bepinex.sh` 内部用相对路径 `BepInEx/core/...`)
- **文件名避免空格 + 括号**(Linux GNOME 应用菜单对特殊字符挑剔,改为 `Hollow-Knight-Silksong-BepInEx.desktop`)
- **权限 644**:`chmod 644 file.desktop`(默认 `write_file` 写入是 600,需 chmod 改)
- **图标用 `steam_icon_1030300`**(Steam 自动写到了 `~/.local/share/icons/hicolor/`)
- **更新桌面数据库**:`update-desktop-database ~/.local/share/applications`

### 验证

```bash
# 1. 格式校验
desktop-file-validate ~/文档/Hollow\ Knight\ Silksong/Hollow-Knight-Silksong-BepInEx.desktop
# → 0 退出码

# 2. 直接执行 Exec 命令(8 秒 timeout,确认游戏能跑)
DISPLAY=:1 timeout 8 "$GAME_DIR/run_bepinex.sh" "$GAME_DIR/Hollow Knight Silksong"
# → BepInEx hook + Customizer + CustomizerT2D + Steam 登录 + Loaded scene: Menu_Title

# 3. GNOME 应用菜单(九宫格)→ 应该看到 "Hollow Knight: Silksong (BepInEx)" 入口
```

⚠️ `gio launch <desktop>` 命令行工具有 bug(找不到 mime cache 子文件),**不影响 GNOME Shell 从应用菜单点击**(走 D-Bus 接口,不依赖 gio 工具)。

---

## ✅ mod 实际生效(2026-06-28 22:40 验证通过)

**实测结果**:
- 启动 `~/文档/Hollow Knight Silksong/启动丝之歌.sh`
- BepInEx 注入 + Customizer + CustomizerT2D 加载
- Steam 登录 → 加载 `Menu_Title` 场景
- **主菜单显示的 Hornet 角色已经是星见雅皮肤**(白金色调 + 不同服装样式)

**早期"mod 失效诊断"那节(22:22)是错的** —— 当时只看到 `Loaded scene: Menu_Title` 日志,推测资源格式不对所以**没在游戏中实际看到角色**就下结论"mod 失效"。**实际上主菜单场景加载时,CustomizerT2D 的 `UI.Image.set_sprite` Hook 在背后替换了贴图**,日志里看不到(BepInEx 默认日志级别只输出 info,替换是 debug 级别)。

### 实际生效的原理

SSCustomizer 的设计是**两条加载路径并行**:
1. **Customizer 0.1.0 (tk2d 路径)**:读 `tk2dSpriteCollectionData.name`,用 PNG 文件名匹配
2. **CustomizerT2DOnly 2.0.0 (UI 路径)**:Hook `UI.Image.set_sprite`,在游戏 UI 渲染前替换 Sprite 引用的 Texture2D

**星见雅 mod 1.5 资源包**(`XJY-Zycl_dhth/`)结构:
- 32 个子目录带 ` Cln` 后缀 + `atlas0.png`(CustomKnight 风格,Customizer tk2d 路径可能不识别)
- 1 个 `Texture2D` 子目录,34 个 `sactx-*.png` 格式(SSCustomizer 兼容格式)
- 1 个 `Knight` 子目录 + atlas0/1/2/3.png

**实际生效的应该是 CustomizerT2D 路径** —— UI.Image.set_sprite 被 Hook 后,从 `Texture2D/` 目录读取 `sactx-*.png` 并替换主菜单 Hornet 展示图的 texture。**这条路径不依赖子目录命名规则**(CustomizerT2D 用的可能是文件名匹配 + Material.set_mainTexture)。

### 待验证

- **游戏中角色贴图**:进入新存档,在游戏内看 Hornet 是不是也换了(主菜单验证了,游戏内没确认)
- **NPC/Boss 贴图**:Dustroach、Lost Lace、Phantom 等 22 个新增子目录是否生效(可能要走 Customizer tk2d 路径,1.5 资源名带 ` Cln` 可能不识别)

### 误判原因(自我反省)

我之前读 SSCustomizer `Customizer.cs` 源码(80 行)就下结论"mod 失效",**没有实际看到游戏画面**就判断结果。**正确的诊断流程是**:先实际启动 → 看游戏画面 → 确认效果 → 再回头分析源码。**这次反过来了**(源码 → 推断 → 错误结论),感谢用户主动确认"生效了"才纠正。

### 1.0 版本备份

`Mods/Customizer/XJY-Zycl_dhth.v1.0.bak/`(108 MB,**1.0 → 1.5 升级前手动备份**,可回滚)。

---

**1.0 版本备份保留**:`Mods/Customizer/XJY-Zycl_dhth.v1.0.bak/`(108 MB,可回滚)。
