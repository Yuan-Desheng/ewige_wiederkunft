---
createTime: 2026-07-23 13:44
笔记ID: 20260723134401
multiFile:
multiMedia:
description: 在 Ubuntu 24.04 上把内网 NAS（DXP4800 极空间）挂为网络磁盘位置，局域网 + Tailscale 双路径智能切换，失败自动回退。
笔记类型: 收集笔记
阐述日期:
tags:
  - NAS
  - SMB
  - Tailscale
  - cifs
  - fstab
  - systemd
  - Linux
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## NAS SMB 网络磁盘挂载

> Ubuntu 24.04 笔记本挂载内网极空间 DXP4800 NAS（已自带 Tailscale `100.92.228.2`）为 `~/nas-dxp4800`；**局域网优先、挂了走 Tailscale、局域网恢复自动切回**。
> 技术栈：SMB3（cifs-utils） + Tailscale（已就绪） + systemd oneshot + bash 切换脚本。
> **用于复现到任何「带 Tailscale 的家用 NAS → Ubuntu 桌面」**。⚠️ 凭据已脱敏（nas-admin 密码占位为 `【已脱敏】`）。

## 一、原理

### 要解决的问题

1. 把 NAS 上的 `personal_folder` 共享挂成 `~/nas-dxp4800`，开机自动挂载。
2. 笔记本在不同网络下（家里 / 公司 / 咖啡厅）都能访问同一份 NAS 数据。
3. 局域网 SMB 走直连（最快，1ms），远程走 Tailscale（穿墙，几十 ms），局域网恢复后自动切回。
4. NAS 关 SMB 服务时不能误挂、不能阻塞开机。

### 流程

```
开机 → systemd nas-switch.service → 跑 nas-switch prefer
                                      │
                  ┌───────────────────┴───────────────────┐
                  ▼                                       ▼
        nc -zw 2 192.168.66.170 445                nc -zw 2 100.92.228.2 445
        通? → sudo mount -t cifs //LAN/...             通? → sudo mount -t cifs //TS/...
                  │                                       │
                  └────→ 同一个 mount point ←──────────────┘
                  ~/nas-dxp4800 → 当前是 LAN 还是 TS，看 nas-switch status
```

### 关键设计

- **凭据分离**：密码放 `/etc/samba/nas-dxp4800.cred`（600 root），fstab / 脚本都用 `credentials=...` 引用，不留明文在共享配置。
- **sudo 限定**：sudoers 允许 yuan 无密码跑 `mount` / `umount` / `mount.cifs` 三条命令，不开 `NOPASSWD: ALL`。
- **脱 fstab**：fstab 同 target 不能写两条 cifs entry（`mount` 命令永远选第一条，路径切换失效）。所以 fstab 不放 NAS 条目，挂载完全由脚本 + systemd 控制。
- **`sec=ntlmssp`**：极空间 / 多数国产 NAS 默认 NTLMv2，加这个参数避免 SMB 协议协商失败。

## 二、代码

### `~/bin/nas-switch`（核心切换脚本）

```bash
#!/bin/bash
# nas-switch.sh — 智能切换 ~/nas-dxp4800 的后端(局域网 IP / Tailscale IP)
# 优先局域网,挂了走 Tailscale,局域网恢复再切回
# 不用 fstab(避免同 target 双 entry),靠 mount -t cifs 命令挂
set -u

MOUNT="/home/yuan/nas-dxp4800"
CRED="/etc/samba/nas-dxp4800.cred"
SHARE="personal_folder"
LAN_IP="192.168.66.170"
TS_IP="100.92.228.2"
OPTS_BASE="credentials=${CRED},uid=1000,gid=1000,vers=3.0,iocharset=utf8,soft,sec=ntlmssp"

log() { logger -t nas-switch "$*"; echo "$(date +%H:%M:%S) $*"; }

current_addr() {
    findmnt -n -o SOURCE "$MOUNT" 2>/dev/null | sed -n 's|^//\([^/]*\).*|\1|p'
}

reachable() {
    nc -zw 2 "$1" 445 >/dev/null 2>&1
}

pick_best() {
    if reachable "$LAN_IP"; then echo "$LAN_IP"
    elif reachable "$TS_IP"; then echo "$TS_IP"
    else echo ""; fi
}

do_mount() {
    local ip="$1"
    log "→ 挂载 $ip 到 $MOUNT"
    if sudo -n mount -t cifs "//${ip}/${SHARE}" "$MOUNT" -o "$OPTS_BASE" 2>/tmp/nas-mount-err; then
        log "  ✓ 挂载成功"
        return 0
    fi
    log "  ✗ 挂载失败:$(cat /tmp/nas-mount-err)"
    return 1
}

remount_if_busy() {
    if mountpoint -q "$MOUNT"; then
        if ! sudo -n umount "$MOUNT" 2>/tmp/nas-umount-err; then
            log "  umount 失败,尝试 lazy:$(cat /tmp/nas-umount-err)"
            sudo -n umount -l "$MOUNT" 2>/dev/null
            sleep 1
        fi
    fi
}

case "${1:-prefer}" in
    prefer)
        best=$(pick_best)
        cur=$(current_addr)

        [ -z "$best" ] && { log "两个后端都不可达,跳过"; exit 0; }
        [ "$best" = "$cur" ] && { log "当前已是 ${best},无需切换"; exit 0; }

        log "从 ${cur:-未挂载} 切到 ${best}"
        remount_if_busy
        do_mount "$best"
        ;;
    status)
        cur=$(current_addr)
        if [ -n "$cur" ]; then
            echo "当前挂载: $cur"
            case "$cur" in
                "$LAN_IP") echo "模式: 局域网(在家,最快)" ;;
                "$TS_IP")  echo "模式: Tailscale 远程(出门,穿墙)" ;;
                *)         echo "模式: 未知 ($cur)" ;;
            esac
        else
            echo "未挂载"
        fi
        ;;
    *)
        echo "用法: $0 {prefer|status}" >&2
        exit 1
        ;;
esac
```

### `/etc/systemd/system/nas-switch.service`

```ini
[Unit]
Description=Switch ~/nas-dxp4800 mount to best backend (LAN / Tailscale)
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=oneshot
User=root
ExecStart=/home/yuan/bin/nas-switch prefer
RemainAfterExit=no

[Install]
WantedBy=multi-user.target
```

### `/etc/sudoers.d/nas-mount`

```sudoers
yuan ALL=(root) NOPASSWD: /usr/bin/mount, /usr/bin/umount, /usr/sbin/mount.cifs
```

### 凭据文件 `/etc/samba/nas-dxp4800.cred`（chmod 600 root）

```
username=nas-admin
password=【已脱敏】
```

> ⚠️ 真机上用真实密码；本笔记保留脱敏占位以防 vault 推到 GitHub 公共仓时泄露。

## 三、配置 / 命令

### 一次性设置（按顺序执行）

```bash
# 1. NAS 后台启用 SMB（浏览器操作）
#    打开 http://dxp4800-fddb.local:9999
#    用管理员登录 → 控制面板 → 文件服务 → SMB → 启用
#    记下想挂的共享名（这里用 personal_folder）

# 2. 装依赖
sudo apt install -y cifs-utils smbclient

# 3. 列共享确认（应能看到 personal_folder / docker / 供应链文档 / 项目汇总 等）
smbclient -L //192.168.66.170 -U nas-admin%【已脱敏】 -m SMB3

# 4. 建挂载点
mkdir -p /home/yuan/nas-dxp4800

# 5. 写凭据（权限 600）
sudo tee /etc/samba/nas-dxp4800.cred > /dev/null <<'EOF'
username=nas-admin
password=【已脱敏】
EOF
sudo chmod 600 /etc/samba/nas-dxp4800.cred

# 6. sudoers 允许 yuan 无密码挂载
echo 'yuan ALL=(root) NOPASSWD: /usr/bin/mount, /usr/bin/umount, /usr/sbin/mount.cifs' \
  | sudo tee /etc/sudoers.d/nas-mount > /dev/null
sudo chmod 440 /etc/sudoers.d/nas-mount

# 7. 写脚本（见上面"二、代码"）
cat > /home/yuan/bin/nas-switch <<'SCRIPT'
... (粘贴上面的脚本正文) ...
SCRIPT
chmod +x /home/yuan/bin/nas-switch

# 8. 写 systemd unit（见上面"二、代码"）
sudo tee /etc/systemd/system/nas-switch.service > /dev/null <<'EOF'
... (粘贴上面的 unit 正文) ...
EOF

# 9. 启用开机自动跑
sudo systemctl daemon-reload
sudo systemctl enable nas-switch.service

# 10. 首次挂载 + 验证
/home/yuan/bin/nas-switch prefer
/home/yuan/bin/nas-switch status
echo "NAS 测试" > /home/yuan/nas-dxp4800/.test-write
ls /home/yuan/nas-dxp4800/.test-write && rm /home/yuan/nas-dxp4800/.test-write && echo OK
```

### Tailscale 路径确认（如果 NAS 没有自带 Tailscale）

```bash
# 本机
tailscale status | grep dxp4800

# 应该看到一行像:
# 100.92.228.2    dxp4800-nas    zhanwei.cui@    linux    active; ...

# 如果 NAS 不在列表里,在 NAS 后台启用 Tailscale(各家 NAS 应用中心一般有)
# 然后在本机重跑 nas-switch prefer 即可
```

### 日常命令

```bash
nas-switch prefer   # 切到最佳后端(局域网优先,挂则 Tailscale)
nas-switch status   # 看当前是局域网还是 Tailscale
```

## 四、复现 Checklist

### 前置

- [ ] NAS 在内网 SMB 服务已启用，445 端口可被本机 `nc -zv <NAS_IP> 445` 通
- [ ] NAS 在 Tailscale 网内（或装了 Tailscale），本机 `tailscale status` 能看到 NAS
- [ ] NAS 上有想挂的共享（这里用 `personal_folder`）
- [ ] 有 NAS 管理员账号密码

### 本机配置

- [ ] `apt install cifs-utils smbclient`
- [ ] `mkdir -p /home/yuan/nas-dxp4800`
- [ ] 创建 `/etc/samba/nas-dxp4800.cred`（600 root，含 `username` + `password`）
- [ ] 创建 `/etc/sudoers.d/nas-mount`（440 root，限定 yuan 跑 mount/umount 三条命令）
- [ ] 写 `/home/yuan/bin/nas-switch`（上面脚本）+ `chmod +x`
- [ ] 写 `/etc/systemd/system/nas-switch.service` + `systemctl daemon-reload` + `systemctl enable`
- [ ] **不要**在 `/etc/fstab` 写 NAS 条目（避免双 entry 冲突）

### 验证

- [ ] `nas-switch prefer` 返回"挂载成功"
- [ ] `nas-switch status` 显示"局域网"或"Tailscale 远程"
- [ ] `echo test > ~/nas-dxp4800/.test && cat ... && rm ...` 读写 OK
- [ ] 模拟出门：`sudo ip route add blackhole <LAN_IP>/32` → `nas-switch prefer` 应切到 Tailscale
- [ ] 模拟回家：`sudo ip route del blackhole <LAN_IP>/32` → `nas-switch prefer` 应切回 LAN
- [ ] 重启：`reboot` → 登录后 `nas-switch status` 显示已挂载

## 五、踩坑记录

### 1. NAS 默认只开 web 管理，SMB 没开

**现象**：`nc -zv <NAS_IP> 445` 返回 `Connection refused`。
**原因**：极空间 DXP4800 出厂默认 SMB 服务是关闭的（保护小白用户）。
**解决**：浏览器进 NAS 后台（`http://dxp4800-fddb.local:9999`，管理员账号）→ 控制面板 → 文件服务 → 启用 SMB。

### 2. fstab 同 target 写两条 cifs entry → 切换失效

**现象**：`nas-switch prefer` 日志显示"挂载 100.92.228.2 成功"，但 `findmnt` 仍显示 LAN。
**原因**：`mount //.../<mountpoint>` 命令不带 `-t` 时会去 fstab 找 entry，而 fstab 第一条永远是 LAN，所以 mount 永远挂 LAN。
**解决**：fstab **不写** NAS 条目；脚本完全用 `mount -t cifs ... -o credentials=...,sec=ntlmssp` 命令挂载。

### 3. `umount: device is busy`

**现象**：脚本里 `umount /home/yuan/nas-dxp4800` 报 busy。
**原因**：执行 umount 时 cwd 在挂载点里（或有进程持有 fd）。
**解决**：先 `cd /home/yuan` 或别的目录，再 umount。或用 `umount -l` 强制 lazy 卸（治标，可能留 stale handle）。

### 4. `mount.cifs: permission denied: no match for /home/yuan/nas-dxp4800 found in /etc/fstab`

**现象**：脚本直接 `mount /home/yuan/nas-dxp4800`（不带 -t）时报这个错。
**原因**：现代 systemd 时代的 cifs 要求 mount 命令必须能在 fstab 找到对应 entry，没 entry 直接拒绝。
**解决**：用 `mount -t cifs <unc> <mountpoint> -o <opts>` 完整命令挂（不依赖 fstab 解析）。

### 5. `error 13 opening credential file`

**现象**：mount 失败，stderr 报读不到 `/etc/samba/nas-dxp4800.cred`。
**原因**：cred 文件是 `600 root:root`，普通用户 mount 读不到。
**解决**：让脚本用 `sudo -n mount ...`（依赖 sudoers 允许 yuan 无密码跑 mount）。

### 6. NAS LAN 突然 ping 不通

**现象**：Tailscale 仍可连 NAS，但 `192.168.66.170:445` ping 超时。
**原因**：NAS 网线 / WiFi 抖动、换网段、或路由器故障。
**解决**：当前 `nas-switch` 自动检测 LAN 不可达时会切到 Tailscale，挂载点不丢。但要**真查 NAS 物理层**，不能一直靠 Tailscale 续命。

### 7. `sudo` 密码含特殊字符，heredoc 喂密码失败

**现象**：`echo '<已脱敏>' | sudo -S ...` 在 hermes 终端里报"no password provided"（密码已脱敏为 `<已脱敏>`）。
**原因**：hermes 终端 wrapper 跟 sudo pty 互动有问题。
**解决**：用 `printf '%s\n' '<已脱敏>' | sudo -S ...` 替代 echo；或加 `/tmp/_ap` askpass 脚本（`SUDO_ASKPASS=/tmp/_ap sudo -A ...`）。

## 六、文件清单

### 必须创建

| 路径 | 权限 | 用途 |
|---|---|---|
| `/home/yuan/nas-dxp4800/` | 755 yuan | 挂载点 |
| `/etc/samba/nas-dxp4800.cred` | 600 root | SMB 凭据（username + password） |
| `/etc/sudoers.d/nas-mount` | 440 root | yuan 无密码跑 mount/umount 三条命令 |
| `/home/yuan/bin/nas-switch` | 755 yuan | 切换脚本 |
| `/etc/systemd/system/nas-switch.service` | 600 root | systemd unit |

### 必须修改

| 路径 | 改动 |
|---|---|
| `/etc/systemd/system/multi-user.target.wants/nas-switch.service` | 由 `systemctl enable` 自动建 symlink |

### 视情况

| 路径 | 改动 |
|---|---|
| `/home/yuan/.bashrc` | 可加 `alias nsp='nas-switch prefer'` 和 `alias nss='nas-switch status'` 方便日常用 |
| NAS 后台 SMB 设置 | 启用 SMB 共享 |

### 不要碰

| 路径 | 原因 |
|---|---|
| `/etc/fstab` NAS 条目 | 双 entry 会导致切换失效；如果非要写，只写一条（开机挂载用），脚本负责切换 |

## 七、macOS 端挂 NAS（2026-07-24 补充）

> 这块是独立的子系统，跟 Ubuntu 的 `nas-switch` 完全独立。macOS 的 SMB 鉴权机制跟 Linux Samba 不一样，必须单独处理。

### 原理

NAS 在 mac 上的访问路径有两套：

| 维度 | 值 |
|---|---|
| 局域网访问点 | `smb://nas-admin:<已脱敏>@192.168.66.170/personal_folder` |
| Tailscale 访问点 | `smb://nas-admin:<已脱敏>@100.92.228.2/personal_folder`（NAS 关机/断网时用） |
| 挂载点 | `/Volumes/personal_folder`（卷标名 macOS 自动用 SMB share 名，不能改） |
| 命令行别名 | `~/NAS`（symlink 到 /Volumes/personal_folder） |

macOS SMB 鉴权与 Linux Samba 的关键区别：
- Linux Samba：认任意密码字符串，只要 SMB 包能解析、用户能 match 就过
- macOS 26 SMB：走本地账号 + 密码认证，且 macOS 26 改用了 Apple ID / iCloud Keychain 派生，**直接拒绝登录密码做 SMB auth**（NT_STATUS_LOGON_FAILURE）

### 复现 Checklist（mac 桌面 GUI 流程）

1. mac 桌面打开 Finder → 菜单栏 前往(Go) → 连接服务器(Connect to Server…)（快捷键 ⌘K）
2. 地址栏输：`smb://nas-admin:<已脱敏>@192.168.66.170/personal_folder`（密码已脱敏为 `<已脱敏>`）
3. 弹出认证对话框，确认挂载
4. Finder 边栏出现 `personal_folder` 卷图标（卷标名固定是 share 名，**macOS 不允许改 SMB 卷标**）
5. 验证：Finder 打开这个卷能读写

### macOS 命令行挂载（SSH session 也能用，但有 owner 陷阱）

```bash
# 在 mac 的 SSH session 里跑：
mkdir -p ~/NAS                                          # 命令行访问用，symlink 到 /Volumes/personal_folder
mount_smbfs -N //nas-admin:<已脱敏>@192.168.66.170/personal_folder ~/NAS
```

⚠️ **Owner 陷阱**：SSH session 里 mount 出来的 SMB 卷，owner 是 `root:wheel`，普通用户不能写。如果一定要用 `/Volumes/NAS`（不是 ~/NAS），**必须在 mac 桌面 Finder 手动挂**，GUI 挂的卷 owner 是当前登录用户（cuizhanwei:staff），可读写。

### macOS 开机自动挂 + watchdog（launchd plist）

macOS 用 launchd 而不是 systemd。写到用户级 LaunchAgent。

⚠️ **重要演进 (2026-08-10)**：初版用 `mount_smbfs` 直接挂，SSH session 里挂出来 owner 是 `root:wheel`，普通用户写不了（见踩坑 #10）。**改为用 `open` 命令触发 Finder 挂载**，owner 自动是当前 GUI 登录用户。同时加了 **watchdog 脚本**：launchd 每 5 分钟跑一次，挂载掉了自动补回（LAN 优先 → Tailscale），彻底解决 plist 丢失 / 挂载掉线后不自动恢复的问题。

#### watchdog 脚本 `~/bin/nas-watchdog.sh`

```bash
#!/bin/bash
# nas-watchdog.sh — 检查 NAS 挂载，掉了自动补
# LAN 优先，不通走 Tailscale；已挂载则跳过
MOUNT="/Volumes/personal_folder"
SHARE="personal_folder"
USER="nas-admin"
PASS="<已脱敏>"
LAN_IP="192.168.66.170"
TS_IP="100.92.228.2"

# 已挂载就跳过（不弹窗、不重复操作）
if mount | grep -q "on ${MOUNT}"; then
    exit 0
fi

# 选最佳后端（LAN 优先）
if nc -z -w 2 "$LAN_IP" 445 >/dev/null 2>&1; then
    IP="$LAN_IP"
elif nc -z -w 2 "$TS_IP" 445 >/dev/null 2>&1; then
    IP="$TS_IP"
else
    logger -t nas-watchdog "NAS 不可达，跳过"
    exit 0
fi

logger -t nas-watchdog "重新挂载 ${IP}"
open "smb://${USER}:${PASS}@${IP}/${SHARE}"
```

#### launchd plist `~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.cuizhanwei.nas-mount</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/cuizhanwei/bin/nas-watchdog.sh</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>300</integer>
</dict>
</plist>
```

存放：`~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist`
加载：`launchctl load ~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist`

关键配置项：
- `RunAtLoad: true` — 开机登录时立刻跑一次
- `StartInterval: 300` — 之后每 300 秒（5 分钟）跑一次 watchdog
- `KeepAlive: false` — 不需要常驻（脚本本身是幂等的，靠 StartInterval 定时跑就够了）

⚠️ **安全提醒**：密码 `<已脱敏>` 明文写在了脚本里。要更安全用 Keychain：

```bash
security add-internet-password -a nas-admin -s 192.168.66.170 -w '<已脱敏>' -r 'smb ' ~/Library/Keychains/login.keychain-db
# mount_smbfs 会自动读 Keychain，不需要 -N 也不需要 URL 里带密码
```

⚠️ **plist 备份**：plist 可能被系统清理工具或 macOS 更新误删。备份一份到 `~/bin/nas-mount.plist.bak`，丢了之后一条命令恢复：

```bash
cp ~/bin/nas-mount.plist.bak ~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist
launchctl load ~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist
```

### 找不回来的时候怎么排查

```bash
# 1. 看 SMB 端口
nc -zv 192.168.66.170 445

# 2. 看 NAS 端 eth1 是不是真的活着（SSH 进 NAS）
sshpass -p '<已脱敏>' ssh nas-admin@100.92.228.2 \
  "ip link show eth1; cat /sys/class/net/eth1/statistics/{rx,tx}_packets"

# 3. 看 mac 端 /Volumes 挂载
mount | grep personal_folder

# 4. 验证 owner（必须 cuizhanwei 才能写）
ls -ld /Volumes/personal_folder
```

## 八、新增踩坑记录（2026-07-24）

### 8. NAS 网卡 PHY 活着但 IP 协议栈死了

**现象**：LAN 端 192.168.66.170 ping 100% 丢包、445/9999 都 timeout；但 ARP 缓存里 NAS 的 MAC 还活着；NAS 系统能 SSH（Tailscale 通的 100.92.228.2）。

**原因**：NAS 端 eth1 网卡 link layer 显示 UP、收发包计数在涨，但入向包全被丢（你笔记本发的 ARP/ping 包 NAS 没回）。最常见是路由器 LAN 端口僵死，或网线虚接。**NAS 系统重启不能修**——根因在路由器/物理层。

**解决**：手动重启路由器（OpenWrt 那个 192.168.66.1），或拔插 NAS 那根 LAN 网线两端。重启后 LAN IP 立刻恢复，延迟回到 ~3.6ms。

**诊断命令**（从 NAS SSH 端）：
```bash
ip link show eth1                                       # 应该是 UP
cat /sys/class/net/eth1/statistics/rx_packets           # 计数在涨
# NAS 端 ping 路由器（NAS 出去方向）应通 → 说明 NAS 上行没问题
```

### 9. macOS 26 SMB 不认登录密码（NT_STATUS_LOGON_FAILURE）

**现象**：macOS 登录密码跟 SSH 密码一致（如 `<已脱敏>`），但用 `smbclient -L //mac-ip -U cuizhanwei%<已脱敏>` 列共享返回 `NT_STATUS_LOGON_FAILURE`。

**原因**：macOS 26 Tahoe 改了 SMB 鉴权，不再走本地账号密码认证，改用 Apple ID / iCloud Keychain 派生的密钥。SSH 走 PAM（密码哈希匹配），SMB 走 Directory Services（keychain 派生），两者独立。

**解决**：
- 走 Finder GUI 挂载（Finder 自动用当前 GUI 登录用户的 Kerberos token）
- 或在 mac 上装 Homebrew Samba（`brew install samba`），配 `smb.conf` 走老协议认密码
- **不能远程改 SMB 鉴权机制**（需要 admin unlock，SSH session 无 GUI 上下文）

### 10. SSH 密码和 macOS 登录密码是两回事

**现象**：用 `sshpass -p '<已脱敏>' ssh cuizhanwei@100.72.31.49` 能登；但 mac 上 `sudo` 要另一个密码，`sharing -l` 也认不出 SMB 共享。

**原因**：这台 mac 启用了 SSH pubkey 认证（`~/.ssh/id_ed25519_qq`），`<已脱敏>` 是这个私钥的 passphrase，不是 macOS 登录密码。SSH 认证走 key + passphrase，macOS 本地认证走另一个密码。

**诊断**：
```bash
ls ~/.ssh/                                # 看有哪些 key
cat /etc/ssh/sshd_config | grep -i auth  # 看 sshd 用哪种认证
```

### 11. macOS SMB 卷 Finder 标签不能改

**现象**：想 Finder 边栏把 `personal_folder` 显示成 "NAS"，改不了。

**原因**：macOS SMB 卷的标签是 SMB 协议层决定的（用 share 名），Finder Get Info 里只显示 mount 点目录名，改不了。`diskutil rename` 对 SMB 卷无效（`Could not find disk`）；`osascript` 改 Finder 名 `AppleEvent timed out`（SSH session 无 GUI 上下文）；`SetFile` 只能改 metadata 不能改 SMB 卷标。

**解决**：
- 用 symlink：`ln -s /Volumes/personal_folder ~/NAS`，命令行访问用 `~/NAS`
- Finder 边栏手动拖到 Favorites（Settings → Sidebar）
- 接受 "personal_folder" 这个名字（不影响功能）

### 12. launchd plist 文件丢失导致 NAS 不再自动挂载 (2026-08-10)

**现象**：Mac 重启后 `/Volumes/personal_folder` 不出现，Finder 边栏也没有 NAS 卷。`launchctl list | grep nas` 能看到条目但退出码是 1，且 `~/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist` 文件不存在（No such file or directory）。

**原因**：plist 文件被某次 macOS 更新或系统清理工具删除，但 launchd 的注册条目残留（变成空壳，反复报退出码 1）。NAS 本身正常（LAN + Tailscale 都能 ping 通）。

**解决**：
1. `launchctl remove com.cuizhanwei.nas-mount` 清掉旧壳
2. 重新写 plist（用 `open` 命令替代原来的 `mount_smbfs`，见踩坑 #10）
3. `launchctl load` 重新加载
4. 加 watchdog 脚本 + `StartInterval: 300`，每 5 分钟检查一次，掉了自动补
5. 备份 plist 到 `~/bin/nas-mount.plist.bak`

**预防**：watchdog 已经就位，即使 plist 再丢、挂载掉线、NAS 重启，最多 5 分钟自动恢复。

### 13. SSH session 里 mount_smbfs 挂的卷普通用户不能读写 (2026-08-10)

**现象**：`sudo mount_smbfs //nas-admin@192.168.66.170/personal_folder /Volumes/personal_folder` 成功挂载，但 `ls /Volumes/personal_folder` 报 Permission denied，owner 是 `root:wheel`。尝试 `chown -R cuizhanwei:staff` 在 SMB 网络卷上超时卡死（180 秒无响应）。

**原因**：SSH session 没有 GUI 上下文，`mount_smbfs` 挂的卷 owner 固定 root。SMB 卷上跑递归 chown 不靠谱（网络文件系统上逐个 inode 改 owner 极慢）。

**解决**：改用 `open "smb://nas-admin:<密码>@192.168.66.170/personal_folder"` 触发 Finder 挂载。Finder 挂的卷 owner 自动是当前 GUI 登录用户（cuizhanwei:staff），可读写。

**注意**：用 `open` 挂载前必须先卸载旧的 root 挂载，否则 macOS 会自动用 `-1` 后缀挂到 `/Volumes/personal_folder-1`。卸载命令：`diskutil unmount force /Volumes/personal_folder`（`umount` 会报 `Resource busy`，用 `diskutil` 更可靠）。

## 九、新增文件清单（macOS 端）

### 必须创建

| 路径 | 权限 | 用途 |
|---|---|---|
| `/Users/cuizhanwei/NAS` | 755 cuizhanwei | symlink 到 `/Volumes/personal_folder`，命令行访问 |
| `/Users/cuizhanwei/Library/LaunchAgents/com.cuizhanwei.nas-mount.plist` | 644 cuizhanwei | mac 开机自动挂 NAS + watchdog（RunAtLoad + 每5分钟检查） |
| `/Users/cuizhanwei/bin/nas-watchdog.sh` | 755 cuizhanwei | watchdog 脚本：检查挂载状态，掉了自动补（LAN 优先→Tailscale） |
| `/Users/cuizhanwei/bin/nas-mount.plist.bak` | 644 cuizhanwei | plist 备份，防 plist 丢失后无法恢复 |

### 不要碰

| 路径 | 原因 |
|---|---|
| `/etc/sudoers` (mac) | cuizhanwei SSH 登录用户没 sudo NOPASSWD 配置，需要时在 mac 桌面手动输密码 |
| `/Library/LaunchDaemons/*nas*` | 系统级 launchd 跑 mount 会变 root owner，普通用户写不进。用用户级 LaunchAgent |
| macOS SMB 卷标 (`personal_folder`) | 协议层固定，改不了，绕道用 symlink 或接受原名 |

## 相关

- 日聚合：[[../0-收集箱/AI笔记/2026-07-23|2026-07-23 AI笔记]]
- 主题卡：[[Linux.canvas|Linux]]、[[AI笔记.canvas|AI笔记]]
- Tailscale 状态：`tailscale status | grep dxp4800`
- 复现命令一览：`nas-switch prefer` / `nas-switch status`