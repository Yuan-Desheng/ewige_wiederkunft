---
createTime: 2026-09-17 18:48
笔记ID: 20260917184811
multiFile:
multiMedia:
description: niri + xwayland-satellite 剪贴板双向镜像（clip-sync-wl-x11 v3）与「微信/飞书粘贴图片整体卡死」故障排障全记录：X11 选择协议无失败通知、僵死 xclip 持有者、timeout 自愈、hcheap 256K 哈希、pkill 自匹配坑。
笔记类型: 收集笔记
阐述日期:
tags:
  - niri
  - Wayland
  - X11
  - 剪贴板
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Niri 剪贴板镜像卡死排障

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="0" max="100"></progress>

> **定位**：niri + xwayland-satellite 下 Wayland ↔ X11 剪贴板双向镜像脚本 `clip-sync-wl-x11`（v3 加固版），以及「微信/飞书粘贴任何图片整体卡死」故障的完整排障链。**来源**：本机 AI 会话（2026-09-17），故障现场为 Legion 笔记本日常环境。**用于复现**：任何 niri/wayland + X11 应用（微信、飞书）混合环境。**声明**：全文无敏感信息。

## 一、原理

**环境背景**：本机跑 niri（Wayland 合成器）+ xwayland-satellite（X11 应用如微信、飞书经卫星桥运行）。实测卫星的剪贴板桥**双向都不可靠**：Chrome（原生 Wayland）复制 → 微信（X11）粘贴不到；微信复制 → Chrome 同样收不到。

**解决思路**：不走卫星桥，自写守护进程在两侧剪贴板之间做双向镜像：

```text
Wayland → X11 :  wl-paste --watch 监听 Wayland 剪贴板变化
                 └─▶ xclip 常驻持有写入 X11 CLIPBOARD
                     （X11 应用直接向这个 xclip 发选择协议请求，完全绕开卫星桥）

X11 → Wayland :  每 0.5s 轮询 X11 CLIPBOARD（TARGETS 探测 + 内容哈希对比）
                 └─▶ 变化则 wl-copy 写回 Wayland

回环保护      :  每次代写后把内容哈希记入 /tmp/clip-sync-wl-x11.last，
                 见到同哈希即认为「是自己刚镜像过去的」，跳过不回写

自愈          :  TARGETS 探测超时(2s) → 判定 X11 侧持有者僵死
                 → pkill 掉 xclip 常驻 fork → 重新从 Wayland 镜像
```

**X11 选择协议的关键语义（本次故障的机理）**：X11 剪贴板是「所有权」模型——粘贴方直接向当前持有者窗口发请求并阻塞等数据。**协议没有失败通知**：持有者僵死后，收到的请求永远等不到应答，也不会报错。表现就是应用在粘贴时**整体冻住**，而不是弹错误。

**哈希策略**：对比用哈希只读每段内容的前 256KB（`hcheap`），真正的镜像传输仍走完整内容——否则 X11→Wayland 轮询每 0.5s 对整张大图做 md5，等价于全量反复传输。

## 二、代码

`~/.local/bin/clip-sync-wl-x11` 完整脚本（v3 加固版），逐字保留：

```bash
#!/bin/bash
# clip-sync-wl-x11 — Wayland ↔ X11 剪贴板双向镜像守护
#
# 背景：niri + xwayland-satellite 环境下，satellite 的剪贴板桥接实测不可靠：
#   - Chrome(原生Wayland) 复制 → 微信(X11) 粘贴不到（Wayland→X11 方向桥死）
#   - 微信(X11) 复制 → Chrome 同样收不到（X11→Wayland 方向桥死）
# 原理：
#   Wayland→X11：wl-paste --watch 监听 Wayland 剪贴板变化 → xclip 常驻持有写入 X11 CLIPBOARD，
#                X11 应用直接向 xclip 发起选择协议请求，完全绕开卫星桥。
#   X11→Wayland：0.5s 轮询 X11 CLIPBOARD，变化则 wl-copy 写回 Wayland。
# 回环保护：每次代写后把内容哈希记入 $LASTFILE；见到的哈希若与上次代写相同则跳过，
#           防止两个 watcher 互相触发成死循环。
#
# 2026-09-17 加固（会话重启后微信/飞书贴图卡死的修复）：
#   1. 所有 xclip -o 探测/读取加 timeout —— X11 所有权交接空窗期发出的请求
#      永远等不到应答（协议无失败通知），不设超时会积累挂死进程；
#   2. TARGETS 探测超时 → 判定持有者僵死：清理 xclip 常驻 fork 并重新镜像（自愈）；
#   3. 对比哈希只读前 256K（hcheap），避免轮询全图传输造成粘贴排队；
#   4. 启动延迟 3s，避开会话启动期 Xwayland 初始化竞态（本次卡死的诱因）。

export DISPLAY=${DISPLAY:-:0}
LASTFILE=/tmp/clip-sync-wl-x11.last
EMPTY=d41d8cd98f00b204e9800998ecf8427e   # 空内容的 md5

md5() { md5sum | cut -d' ' -f1; }

# 对比用哈希只读前 256K：整图 md5 会让轮询每 0.5s 全量传输大图，
# 应用粘贴请求在 X11 选择协议里排队 → 贴图卡顿。真正的镜像传输仍走完整内容。
hcheap() { head -c 262144 | md5sum | cut -d' ' -f1; }

wl2x() {  # Wayland → X11
    local hw hx last types
    types=$(timeout 2 wl-paste --list-types 2>/dev/null) || return 0
    if echo "$types" | grep -q '^image/png$'; then
        hw=$(wl-paste -t image/png --no-newline 2>/dev/null | hcheap)
        [ "$hw" = "$EMPTY" ] && return 0
        last=$(cat "$LASTFILE" 2>/dev/null)
        [ "$hw" = "$last" ] && return 0        # 是刚从 X11 镜像来的，不回写
        hx=$(timeout 2 xclip -o -selection clipboard 2>/dev/null | hcheap)
        [ "$hw" = "$hx" ] && return 0
        wl-paste -t image/png --no-newline | xclip -selection clipboard -t image/png 2>/dev/null
    else
        hw=$(wl-paste -t 'text/plain;charset=utf-8' --no-newline 2>/dev/null | hcheap)
        [ "$hw" = "$EMPTY" ] && return 0
        last=$(cat "$LASTFILE" 2>/dev/null)
        [ "$hw" = "$last" ] && return 0        # 是刚从 X11 镜像来的，不回写
        hx=$(timeout 2 xclip -o -selection clipboard 2>/dev/null | hcheap)
        [ "$hw" = "$hx" ] && return 0
        # 关键：文本写入不带 -t，让 xclip 广播标准目标集（UTF8_STRING/STRING/TEXT），
        # 带 -t 只广播 text/plain;charset=utf-8，Qt/GTK 应用请求 UTF8_STRING 会取空 → 粘贴无反应
        wl-paste --no-newline | xclip -selection clipboard 2>/dev/null
    fi
    echo "$hw" > "$LASTFILE"
}

x2wl() {  # X11 → Wayland
    local hx hw last probe
    probe=$(timeout 2 xclip -o -selection clipboard -t TARGETS 2>/dev/null) || {
        # 探测超时 = 持有者僵死（请求永无应答）：清掉常驻 fork 重新镜像（自愈）
        pkill -f 'xclip -selection clipboar[d]' 2>/dev/null
        sleep 0.2
        wl2x
        return 0
    }
    # X11 侧类型探测：有 image/png 就镜像图片，否则按文本
    if echo "$probe" | grep -q '^image/png$'; then
        hx=$(timeout 3 xclip -o -selection clipboard -t image/png 2>/dev/null | hcheap)
        [ "$hx" = "$EMPTY" ] && return 0
        last=$(cat "$LASTFILE" 2>/dev/null)
        [ "$hx" = "$last" ] && return 0
        hw=$(wl-paste -t image/png --no-newline 2>/dev/null | hcheap)
        [ "$hx" = "$hw" ] && return 0
        timeout 3 xclip -o -selection clipboard -t image/png 2>/dev/null | wl-copy -t image/png 2>/dev/null
    else
        hx=$(timeout 2 xclip -o -selection clipboard 2>/dev/null | hcheap)
        [ "$hx" = "$EMPTY" ] && return 0
        last=$(cat "$LASTFILE" 2>/dev/null)
        [ "$hx" = "$last" ] && return 0
        hw=$(wl-paste --no-newline 2>/dev/null | hcheap)
        [ "$hx" = "$hw" ] && return 0
        timeout 3 xclip -o -selection clipboard 2>/dev/null | wl-copy 2>/dev/null
    fi
    echo "$hx" > "$LASTFILE"
}

case "${1:-}" in
    --wl2x) wl2x ;;
    --x2wl) x2wl ;;
    *)
        rm -f "$LASTFILE"
        sleep 3   # 避开会话启动期 Xwayland/卫星初始化竞态
        wl2x      # 启动先把 Wayland 现有内容送过去
        wl-paste --watch "$0" --wl2x &
        while sleep 0.5; do x2wl; done
        ;;
esac
```

## 三、配置 / 命令

**依赖**：`wl-clipboard`（wl-paste / wl-copy）、`xclip`、`md5sum`（coreutils）。

**niri 自启**（`~/.config/niri/config.kdl`）：

```kdl
// 剪贴板历史（cliphist，约 737 行）
spawn-at-startup "cliphist" "watch"
// 双向镜像守护（约 741 行）
spawn-at-startup "clip-sync-wl-x11"
```

**重启脚本**（kill 与 start 必须分开两条命令执行，原因见踩坑⑤）：

```bash
# 方括号模式防止 pkill -f 自匹配到执行它的 shell
pkill -f 'clip-sync-wl-x1[1]'
# ↓ 确认杀干净后，再单独执行启动
nohup clip-sync-wl-x11 >/tmp/clip-sync.log 2>&1 &
```

**快速诊断三连**（再遇卡死先跑这个，别急着改代码）：

```bash
# 1. 有没有挂死的 xclip 读取进程（卡死的直接证据，看启动时间）
ps aux | grep 'xclip' | grep -v grep

# 2. 探测 X11 侧持有者是否应答：2 秒无输出 = 僵死
timeout 2 xclip -o -selection clipboard -t TARGETS | head

# 3. 看镜像守护日志
tail -n 50 /tmp/clip-sync.log
```

## 四、复现 Checklist

**Wayland 侧**：

- [ ] 安装 `wl-clipboard`、`xclip`
- [ ] 脚本放入 `~/.local/bin/clip-sync-wl-x11` 并 `chmod +x`
- [ ] `~/.config/niri/config.kdl` 加 `spawn-at-startup "clip-sync-wl-x11"`
- [ ] 重新登录 niri 会话（脚本自带 3s 启动延迟，避开 Xwayland 初始化竞态）

**X11 侧**：

- [ ] Chrome（Wayland）复制**文本** → 微信/飞书（X11）可粘贴
- [ ] Chrome 复制**图片** → 微信可粘贴图片
- [ ] 微信截图/复制图片 → Chrome、wl-paste 侧可取到（`wl-paste --list-types` 应含 `image/png`）

**验证**：

- [ ] 连续快速复制粘贴多张大图，应用不卡顿
- [ ] `ps aux | grep xclip` 长时间观察无挂死进程积累
- [ ] 重启会话一次，粘贴功能正常（启动竞态已被 3s 延迟覆盖）

## 五、踩坑记录

**① 粘贴任何图片应用整体冻住（本次主故障）**

- 现象：微信、飞书粘贴截图/浏览器复制的图片时整个应用卡死几秒到十几秒；纯文本相对正常。当天症状突然出现。
- 误判过程：先按性能问题修（对比哈希改只读前 256K），装完仍卡 → 转向抓进程证据：`ps aux` 里躺着 **3 个 18:09 启动后一直挂死的 `xclip -o` 进程**。计时测试（56KB / 5.3MB 均即时完成）证明吞吐没问题，是**死等**不是慢。
- 真因链：当天按过 `Win+Shift+E` → 该键在 niri 默认绑定是 `Mod+Shift+E { quit; }`（**退出整个会话**，用户并不知道）→ 会话重启后 clip-sync 自启，启动窗口期 Xwayland 尚未就绪，镜像脚本的 xclip 常驻 fork 被打僵 → 此后所有向它发的 X11 选择请求（包括应用的粘贴请求）**排队且永不超时**（协议无失败通知）→ 应用冻住。
- 解决：所有 `xclip -o` 读取加 `timeout 2/3`；`x2wl` 的 TARGETS 探测超时即自愈（pkill 常驻 fork + 重新镜像）；启动延迟 3s 避开竞态。修后用户确认恢复正常。
- **教训：性能优化之前先抓进程状态**——`ps aux | grep xclip` 一眼就能看到挂死进程，「慢」和「死等」是两种病。

**② 镜像后 X11 应用粘贴文本无反应**

- 现象：文本镜像过去，微信里 Ctrl+V 没有任何反应。
- 原因：写入 xclip 时带了 `-t text/plain;charset=utf-8`，xclip 就只广播这一个 TARGET；Qt/GTK 应用按惯例请求 `UTF8_STRING`，取到空。
- 解决：**文本写入不带 `-t`**，让 xclip 广播标准目标集（UTF8_STRING / STRING / TEXT）；图片仍需显式 `-t image/png`。

**③ 两个 watcher 互相触发生死循环**

- 现象：镜像守护 CPU 飙高，剪贴板内容反复抖动。
- 原因：wl2x 写入触发 x2wl 轮询发现「变化」，又往回写。
- 解决：每次代写后把内容哈希记入 `/tmp/clip-sync-wl-x11.last`，任一方向见到同哈希即跳过。

**④ 复制大图后系统变卡**

- 原因：X11→Wayland 轮询每 0.5s 对整张大图做 md5，等价于全量反复传输，粘贴请求在协议里排队。
- 解决：对比哈希改 `hcheap()` 只读前 256KB，镜像传输仍走全量。

**⑤ `pkill -f` 自匹配把自己杀掉（exit 144）**

- 现象：用 `pkill -f clip-sync-wl-x11` 重启脚本，命令自身异常退出（144），脚本没被杀或连同执行环境一起出问题。
- 原因：`pkill -f` 匹配的是**完整命令行文本**，执行它的 shell（交互终端或自动化工具的 Bash 子进程）自身命令行里就含这个字符串，被一起匹配。
- 解决：方括号模式 `pkill -f 'clip-sync-wl-x1[1]'`（正则匹配目标但字面文本不再含目标串），且 **kill 与 start 分成两条命令执行**。同坑适用一切 `pkill -f xclip` 场景（脚本内自愈用的就是 `'xclip -selection clipboar[d]'`）。

**⑥ `Mod+Shift+E` 是 niri 的退出会话键（遗留待办）**

- 现象：想调起截图/工具类快捷键按了 `Win+Shift+E`，整个桌面会话直接退出重启。
- 原因：`~/.config/niri/config.kdl` 约 708 行有 `Mod+Shift+E { quit; }`，属高危默认绑定。
- 解决：**尚未处理**——待改绑或删除该键位（改 config.kdl 后 `niri msg action reload-config` 或重新登录生效）。

## 六、文件清单

| 文件 | 作用 | 复现动作 |
|------|------|----------|
| `~/.local/bin/clip-sync-wl-x11` | 双向镜像守护（本笔记「二、代码」逐字一致） | **必须**：copy + `chmod +x` |
| `~/.config/niri/config.kdl` | `spawn-at-startup` 自启（约 741 行）；`Mod+Shift+E` 高危键位（约 708 行，待改） | **必须**：加一行自启 |
| `/tmp/clip-sync.log` | 守护运行日志 | 视情况：排障用 |
| `/tmp/clip-sync-wl-x11.last` | 回环保护哈希记录 | 自动生成，勿手改 |
