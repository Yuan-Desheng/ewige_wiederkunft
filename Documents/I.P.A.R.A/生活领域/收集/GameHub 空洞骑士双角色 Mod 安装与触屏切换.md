---
createTime: 2026-11-06 17:09
笔记ID: 20261106170904
multiFile:
multiMedia:
description: 手机盖世游戏安装空洞骑士一代与丝之歌角色互换 Mod，并用屏幕 L3 切换的实机记录。
笔记类型: 收集笔记
阐述日期:
tags:
  - 游戏
  - GameHub
  - 空洞骑士
  - 丝之歌
  - Mod
aliases:
cssclasses:
卡片盒笔记主题:
---

## GameHub 空洞骑士双角色 Mod 安装与触屏切换

```meta-bind-embed
[[笔记抬头模块]]
```

> 2026-11-06 实机记录：Android 盖世游戏运行两个 Windows 版游戏，安装角色移植 Mod 并配置触屏切换；供以后恢复或重装参考。游戏版本、Mod 和盖世游戏菜单可能变化。

## 一、结果与原理

| 游戏 | Mod | 功能 | 验证 |
| --- | --- | --- | --- |
| 《空洞骑士》一代 | [Hornet in Hallownest](https://github.com/jakobhellermann/hkmod-HornetInHallownest)，v0.4.0 Alpha | 在圣巢使用大黄蜂 | 已在存档中用 L3 成功切换为大黄蜂 |
| 《空洞骑士：丝之歌》 | [KnightInSilkSong](https://github.com/MCXGK3/KnightInSilkSong)，v0.6.7 | 在纺络使用小骑士 | 加载日志确认成功，已在存档中用 L3 成功切换为小骑士 |

两个 Mod 分别装在两个游戏里；这次没有把一代完整地图导入《丝之歌》。一代 Mod 是 Alpha，可能存在 Bug；其[发布说明](https://github.com/jakobhellermann/hkmod-HornetInHallownest/releases/tag/v0.4.0)指出不保证兼容其他 Mod。

本次一代版本为 `1.5.12620`，丝之歌版本为 `1.0.30000`。手机已有 Steam 版丝之歌；一代从电脑上的 Windows 游戏文件导入。当前绑定的 Steam 账号在盖世游戏里对一代显示“立即购买”，本次使用的电脑已有游戏文件。

## 二、日常使用：L3 切换角色

1. 在盖世游戏的游戏库中打开对应游戏并进入存档。
2. 点击屏幕左侧的 **L3**：游戏收到键盘 `F5`，在小骑士与大黄蜂之间切换。
3. 两个游戏分别配置了游戏专属映射方案：一代为 `HornetF5`，丝之歌为 `KnightF5`。在游戏侧边菜单的 **操作 → 映射方案** 可查看；需启用“虚拟手柄映射”。

### 重建屏幕按键

1. 进入游戏，打开盖世游戏侧边菜单 → **操作 → 映射方案 → 自定义 → 我的方案 → +**。
2. 输入方案名，选择**游戏布局**并创建。
3. 点击 **左摇杆按下（L3）**，在主键盘中选择 **F5**，保存并应用。
4. 回到操作菜单确认“虚拟手柄映射”已开启，再进入存档测试。L3 因而用于发送 F5；如其他功能也需要 L3，应重新选择不冲突的按键。

## 三、安装一代与大黄蜂 Mod

### 1. 导入一代本体

1. 将电脑 Steam 游戏目录 `Hollow Knight` 完整复制到手机 `/sdcard/Games/HollowKnight/`。本次约 4.9 GiB，包含 `hollow_knight.exe`、`hollow_knight_Data` 和 `MonoBleedingEdge`。
2. 在盖世游戏 → **游戏库 → 导入游戏 → 本地游戏**，选择 `/sdcard/Games/HollowKnight/hollow_knight.exe` 并确认导入。
3. 先启动原版，确认能进入语言选择或主菜单。本次选择简体中文；游戏本体显示 `1.5.12620`。
4. 本次导入时为盖世游戏开启了 Android **所有文件访问权限**，以便读取公共存储中的本地游戏和资源。

电脑来源目录：

```text
/run/media/yuan/新加卷/Software/game/Steam/steamapps/common/Hollow Knight/
```

### 2. 准备丝之歌资源

[Mod 作者说明](https://github.com/jakobhellermann/hkmod-HornetInHallownest)要求同时提供丝之歌资源。此次从电脑上的同版本 Windows 版丝之歌复制文件到手机，约 7.6 GiB：

```text
/sdcard/Games/SilksongResources/
└── Hollow Knight Silksong_Data/
    ├── boot.config
    ├── Managed/
    └── StreamingAssets/
```

`boot.config` 不可遗漏：Mod 用它识别游戏版本。本次资源源于电脑 Steam 目录 `Hollow Knight Silksong/Hollow Knight Silksong_Data/`；不要删除手机上的资源副本，否则一代 Mod 可能无法运行。

### 3. 安装作者提供的专用接口和 Mod

1. 退出一代游戏。从 [v0.4.0 发布页](https://github.com/jakobhellermann/hkmod-HornetInHallownest/releases/tag/v0.4.0)下载 `UNRELEASED-moddingapi-468f579.zip` 和 `HornetInHallownest.zip`。
2. 备份一代 `hollow_knight_Data/Managed/` 中将被覆盖的原始文件。本次覆盖的是 `Assembly-CSharp.dll` 与 `TeamCherry.Localization.dll`，备份在手机 `/sdcard/Games/HollowKnight-original-backup/`；电脑原始游戏目录也保留。
3. 将专用 Modding API 压缩包内容解压到一代的 `hollow_knight_Data/Managed/`，覆盖同名文件。
4. 将 Mod 压缩包内容放进 `hollow_knight_Data/Managed/Mods/HornetInHallownest/`，其中应直接包含 `HornetInHallownest.dll` 和两个 `.bundle` 文件。
5. 因两款游戏不在同一个 Steam 库目录，在 Mod 文件夹旁创建 `HornetInHallownest.GlobalSettings.json`，指定资源路径。本次内容为：

```json
{
  "SilksongPath": "Z:/sdcard/Games/SilksongResources",
  "Controls": {
    "SwitchHero": "F5"
  },
  "BothActive": false
}
```

`Z:` 是本次 Wine 容器中 Android 文件系统的映射；其他设备需要先确认映射路径。实际设置路径必须指向包含 `Hollow Knight Silksong_Data` 的文件夹。

6. 启动游戏。作者说明首次初始化可能提示 `Failed to initialize`；成功生成支持文件后退出并再次启动。最终主菜单左上角显示 `HornetInHallownest : 0.4.0.0`，而非初始化失败。本次已进入存档验证角色切换。

## 四、安装丝之歌小骑士 Mod

1. 从 [BepInExPack Silksong](https://thunderstore.io/c/hollow-knight-silksong/p/silksong_modding/BepInExPack_Silksong/) 和 [KnightInSilksong](https://thunderstore.io/c/hollow-knight-silksong/p/shownyoung/KnightInSilksong/) 获取发行包；按照该 Mod 的 [Required 列表](https://thunderstore.io/c/hollow-knight-silksong/p/shownyoung/KnightInSilksong/required)准备 `I18N` 与 `SilksongPrepatcher`。
2. 将 BepInEx 的 `BepInEx/`、`winhttp.dll`、`doorstop_config.ini` 放入丝之歌游戏根目录；此设备的容器中游戏根目录映射为 `X:\`。
3. 将 `KIS.dll`、`Knight.dll` 和 `languages/` 放到 `BepInEx/plugins/KnightInSilksong/`；I18N DLL 放在 `BepInEx/plugins/I18N/`；Prepatcher 包中的 `patchers/`、`plugins/` 分别合入 `BepInEx/` 下对应目录。
4. Wine 的 `winhttp` DLL 覆盖设置使用 `native,builtin`。本次原有值为 `n,b`，含义相同；不同设备应先记录原值再修改。
5. 正常启动丝之歌，在 `BepInEx/LogOutput.log` 中查看 `KnightInSilkSong` 加载信息；进入存档用 L3 验证切换。本次日志确认 `KnightInSilkSong 0.6.7` 加载，用户确认切换成功。

## 五、踩坑与恢复

- **一代重启后仍初始化失败**：先查看 `ModLog.txt`。本次日志提示找不到丝之歌的 `boot.config`；补齐后首次启动生成支持程序集，再重启即正常加载。该日志位于一代容器的 `C:\users\steamuser\AppData\LocalLow\Team Cherry\Hollow Knight\ModLog.txt`。
- **需要恢复一代原版**：先备份存档。作者的[卸载说明](https://github.com/jakobhellermann/hkmod-HornetInHallownest#uninstall)要求移除 Mod、恢复 `ScriptingAssemblies.json.hornetbak`，并清理其生成的程序集；还需用 `/sdcard/Games/HollowKnight-original-backup/` 中的两份原文件替换专用 Modding API 覆盖的文件。只删除 Mod 文件夹不能完成全部恢复。也可重新从可信原始副本导入游戏，但应先保留存档。
- **丝之歌存档备份**：安装前通过盖世游戏 **PC 引擎设置 → 备份/恢复 → 备份到本地** 创建；手机文件为 `/sdcard/backups/空洞骑士：丝之歌_1793950111842.zip`，压缩包完整性检查通过且包含存档。恢复前先确认目标和当前存档：此备份包含容器内容，恢复可能覆盖后续进度与配置。
- **空间和权限**：一代约 4.9 GiB，单独复制的丝之歌资源约 7.6 GiB；盖世游戏目前具有所有文件访问权限。本地导入依赖公共存储权限，修改前先检查游戏是否仍能访问文件。

## 六、复现检查

- [ ] 确认两款游戏和 Mod 版本匹配，并备份游戏存档与将被覆盖的文件。
- [ ] 导入一代并验证原版启动；准备丝之歌的 `boot.config`、`Managed/` 和 `StreamingAssets/`。
- [ ] 安装作者指定的专用 Modding API 与 Hornet in Hallownest，配置资源路径，按需启动两次。
- [ ] 安装丝之歌的 BepInEx、KnightInSilkSong 及其依赖，确认日志加载成功。
- [ ] 两款游戏分别设置并启用 L3 → F5，进入存档验证两个方向的切换。

相关记录：[[GameHub 运行艾尔登法环：离线启动与帧率优化]]
