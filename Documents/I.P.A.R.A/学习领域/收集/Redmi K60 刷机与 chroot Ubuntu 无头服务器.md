---
createTime: 2026-10-07 15:15
笔记ID: 20261007151538
multiFile:
multiMedia:
description: Redmi K60 (mondrian) BL 解锁 + Magisk root + chroot Ubuntu 22.04 无头服务器全流程：分段断点续传下载线刷包、MiUnlock 解锁、Magisk 修补 boot、Termux chroot 部署 sshd/git/Claude Code，全套可执行脚本与踩坑记录。
笔记类型: 收集笔记
阐述日期:
tags:
  - Android刷机
  - Magisk
  - chroot
  - Ubuntu
  - Termux
  - 无头服务器
  - ClaudeCode
aliases:
  - K60 Linux
  - mondrian 刷机
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Redmi K60 刷机与 chroot Ubuntu 无头服务器

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="80" max="100"></progress>

> 把 Redmi K60 变成随身 Linux 无头服务器（SSH + Git + Claude Code，≈98% 原生性能）的完整复现手册。来源：2026-08~09 Windows 机器上的 AI 辅助刷机会话存档（`K60刷机-交接手册.md`、`K60-Linux计划-现状.md` + `k60-flash/` 全套脚本）。技术栈：MIUI 14 / MiUnlock / Magisk v30.7 / Termux / Ubuntu 22.04 arm64 chroot。「用于复现到其他小米机型」。IMEI、adb 序列号、SSH root 密码已脱敏（原值见外部存档）。

---

## 一、原理

**目标**：K60 不越狱不换系统，在 Android 之上跑一个真 Linux 用户态，对外提供 SSH，成为可装 Claude Code 的随身服务器。

**路线选型**（为什么是 chroot）：

| 路线 | 说明 | 结论 |
|---|---|---|
| L1 proot | Termux + proot 跑 Debian | ❌ 10-20% 翻译损耗；新版 Claude Code 需 glibc，Termux 原生装不上 |
| **L2 BL解锁 + Magisk + chroot** | root 后 chroot 真 Ubuntu | ✅ 选定，≈98% 原生性能 |
| L3 原生 Linux | pmOS / Mobian / UT / Sailfish | ❌ **K60（mondrian）无任何现成支持**，主线内核无 sm8475 DTS；K20 Pro（raphael）镜像全部不通用 |

**最终架构**：

```text
┌─────────────── Redmi K60 (mondrian, 骁龙8+ Gen1, MIUI 14) ───────────────┐
│                                                                          │
│  Android (Magisk root)                                                   │
│    └─ Termux (F-Droid 版, tsu 提权)                                      │
│         └─ su -c sh /data/local/start_server.sh                         │
│              ├─ mount --bind  /dev /proc /sys  → /data/local/linux       │
│              └─ chroot /data/local/linux  (Ubuntu 22.04 arm64 base)     │
│                   ├─ sshd  (root 可占 22 端口)  ←── ssh root@手机IP      │
│                   ├─ git 2.34.1                                          │
│                   ├─ node v20.19.0 (/usr/local)                          │
│                   └─ claude-code 2.1.197 (npm -g, 需 glibc)              │
└──────────────────────────────────────────────────────────────────────────┘
```

**关键设计**：
- **老解锁政策窗口**：手机保持 MIUI 14 不升 HyperOS → 绑定小米账号等 168h 即可解锁（无需社区等级/答题）；升级则政策作废。
- **下全量线刷包（7.3GB）当救砖保险**，不只取 boot.img；下载用 256MB 分段 + 断点续传（直连 44KB/s，走代理 2.6MB/s）。
- **Claude Code 必须装在 chroot 的 glibc Ubuntu 里**（Termux 是 bionic，装不上）；npm 全局 prefix 显式钉死 `/usr/local`，防止装进 Termux 目录。
- **chroot 内必须 unset Termux 泄漏的 PREFIX/TMPDIR**，否则 apt/dpkg 出现半安装状态。

**已部署架构备忘（2026-09-19 定稿）**：

| 项 | 值 |
|---|---|
| chroot 位置 | `/data/local/linux`（Ubuntu 22.04 arm64 base） |
| 交互进入 | Termux → `su -c sh /data/local/start_linux.sh` |
| 服务启动（重启后必做） | Termux → `su -c sh /data/local/start_server.sh` |
| SSH | 端口 22，root / 密码【已脱敏】，手机 IP 例 `192.168.8.62` |
| 已装 | git 2.34.1 / node v20.19.0 / claude-code 2.1.197（prefix=/usr/local） |

---

## 二、代码

以下脚本按执行顺序排列，来自 `k60-flash/`，逐字保留（仅密码行脱敏）。

### 2.1 `dl_segments.sh` — 线刷包分段并行下载（bash，Linux/GitBash 通用）

```bash
#!/bin/bash
# 分段并行下载 K60 线刷包 v3（走 Clash 代理，8并发，断点续传）
# v3 改进（2026-09-19）：临时块失败不再丢弃——断在哪、从哪续，任何已下字节都保留
URL="https://cdnorg.d.miui.com/V14.0.26.0.TMNCNXM/mondrian_images_V14.0.26.0.TMNCNXM_20230711.0000.00_13.0_cn_b57eed5de3.tgz"
PROXY="http://127.0.0.1:7890"
TOTAL=7372993076
SEG=268435456              # 256MB per segment
N=28
CONC=8
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

# ⚠️ 重启本脚本前必须先精确清杀旧实例（bash: cmdline 含 dl_segments.sh；curl: cmdline 含 mondrian_images），
# 否则多代 worker 并发写同一文件会损坏进度（2026-09-19 教训）。Git Bash 下勿用 $$ 做守卫——MSYS PID 与 Windows PID 不一致。
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

seg_range() {
  local i=$1
  local s=$(( i * SEG ))
  local e=$(( s + SEG - 1 ))
  [ $e -ge $TOTAL ] && e=$(( TOTAL - 1 ))
  echo "$s $e"
}

dl_seg() {
  local i=$1
  read s e < <(seg_range $i)
  local want=$(( e - s + 1 ))
  local f="part_$(printf '%02d' $i)"
  local attempt=0
  while :; do
    local have=0 tsize=0
    [ -f "$f" ] && have=$(stat -c %s "$f" 2>/dev/null || echo 0)
    [ -f "tmp_$f" ] && tsize=$(stat -c %s "tmp_$f" 2>/dev/null || echo 0)
    local got=$(( have + tsize ))
    if [ "$got" -ge "$want" ]; then
      # 分段完成：把临时块并入正式块，并截掉可能多出的字节
      [ "$tsize" -gt 0 ] && cat "tmp_$f" >> "$f" && rm -f "tmp_$f"
      have=$(stat -c %s "$f")
      if [ "$have" -gt "$want" ]; then
        head -c "$want" "$f" > "$f.trim" && mv "$f.trim" "$f"
      fi
      echo "seg $i OK"
      return 0
    fi
    local from=$(( s + got ))
    # -f: HTTP错误(4xx/5xx)不写body；网络中断的部分数据仍会写进 tmp2，非空就保留
    curl -fsS -x "$PROXY" -A "$UA" -r "$from-$e" -o "tmp2_$f" --max-time 1800 --connect-timeout 30 --speed-time 30 --speed-limit 10240 "$URL" 2>/dev/null
    [ -s "tmp2_$f" ] && cat "tmp2_$f" >> "tmp_$f"
    rm -f "tmp2_$f"
    attempt=$((attempt+1))
    [ $((attempt % 30)) -eq 0 ] && echo "seg $i still trying (attempt $attempt, $got/$want)"
    sleep 3
  done
}

running=0
for i in $(seq 0 $((N-1))); do
  dl_seg $i &
  running=$((running+1))
  sleep 2   # 错峰启动
  if [ $running -ge $CONC ]; then wait -n; running=$((running-1)); fi
done
wait

fail=0
for i in $(seq 0 $((N-1))); do
  read s e < <(seg_range $i)
  w=$(( e - s + 1 ))
  f="part_$(printf '%02d' $i)"
  have=$(stat -c %s "$f" 2>/dev/null || echo 0)
  [ "$have" -ne "$w" ] && { echo "BAD $f: $have != $w"; fail=1; }
done
[ $fail -eq 1 ] && { echo "SEGMENTS_INCOMPLETE"; exit 1; }

cat part_00 part_01 part_02 part_03 part_04 part_05 part_06 part_07 part_08 part_09 part_10 part_11 part_12 part_13 part_14 part_15 part_16 part_17 part_18 part_19 part_20 part_21 part_22 part_23 part_24 part_25 part_26 part_27 > mondrian_images_V14.0.26.0.TMNCNXM_cn.tgz
final=$(stat -c %s mondrian_images_V14.0.26.0.TMNCNXM_cn.tgz)
if [ "$final" -eq "$TOTAL" ]; then
  rm -f part_*
  echo "DOWNLOAD_COMPLETE $final"
else
  echo "MERGE_SIZE_MISMATCH $final != $TOTAL"; exit 1
fi
```

### 2.2 `k60_setup1.sh` — chroot 部署 stage 1（Termux 内执行）

```bash
#!/data/data/com.termux/files/usr/bin/bash
# K60 chroot setup - stage 1 (Termux 侧)  2026-09-19
set -e
echo "[1/5] 换清华镜像源"
sed -i 's@https://packages.termux.dev/apt/termux-main@https://mirrors.tuna.tsinghua.edu.cn/termux/apt/termux-main@g' $PREFIX/etc/apt/sources.list
pkg update -y 2>&1 | tail -2
echo "[2/5] 安装 tsu + wget"
pkg install -y tsu wget 2>&1 | tail -2
echo "[3/5] 下载 Ubuntu base arm64 (~30MB)"
cd ~
if [ ! -s ubuntu-base.tar.gz ]; then
  wget "https://mirrors.tuna.tsinghua.edu.cn/ubuntu-cdimage/ubuntu-base/releases/22.04/release/ubuntu-base-22.04.5-base-arm64.tar.gz" -O ubuntu-base.tar.gz
fi
ls -l ubuntu-base.tar.gz
echo "[4/5] 解压到 /data/local/linux（如弹出 Magisk 授权框请点授予）"
su -mm -c '
set -e
mkdir -p /data/local/linux
cd /data/local/linux
tar -xzf /data/data/com.termux/files/home/ubuntu-base.tar.gz
echo "nameserver 223.5.5.5" > etc/resolv.conf
echo "127.0.0.1 localhost" > etc/hosts
echo "k60" > etc/hostname
ls -l /data/local/linux
'
echo "[5/5] 生成 chroot 入口脚本 /data/local/start_linux.sh"
su -mm -c "cat > /data/local/start_linux.sh << 'EOF'
#!/system/bin/sh
# K60 chroot Ubuntu 入口：root 执行，挂载内核文件系统并 chroot
mount --bind /dev /data/local/linux/dev 2>/dev/null
mount --bind /dev/pts /data/local/linux/dev/pts 2>/dev/null
mount --bind /proc /data/local/linux/proc 2>/dev/null
mount --bind /sys /data/local/linux/sys 2>/dev/null
chroot /data/local/linux /bin/bash
EOF
chmod 755 /data/local/start_linux.sh
ls -l /data/local/start_linux.sh"
echo "STAGE1_DONE"
```

### 2.3 `stage2.sh` — chroot 内装 openssh/git（Ubuntu 容器内执行）

```bash
#!/bin/bash
# K60 chroot setup - stage 2 (Ubuntu 容器内执行)  2026-09-19
set -e
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
export DEBIAN_FRONTEND=noninteractive
echo "[1/4] apt 源 -> 清华 ubuntu-ports (arm64, http 免证书依赖)"
cat > /etc/apt/sources.list << 'EOF'
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse
EOF
echo "[2/4] apt update + 安装 openssh-server git curl sudo"
apt-get update -qq
apt-get install -y -qq openssh-server git curl sudo ca-certificates locales 2>&1 | tail -3
echo "[3/4] sshd 配置：允许 root 密码登录"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
mkdir -p /run/sshd
echo "[4/4] 设置 root 密码"
echo 'root:【已脱敏】' | chpasswd
echo "STAGE2_DONE"
```

### 2.4 `stage2b.sh` — 修复 openssh-server 装不上（policy-rc.d）

```bash
#!/bin/bash
# K60 chroot setup - stage 2b (修复 openssh-server 安装)  2026-09-19
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
export DEBIAN_FRONTEND=noninteractive
echo "== mount check =="
ls /proc/1 >/dev/null 2>&1 && echo "proc OK" || echo "proc MISSING (mount failed!)"
ls /dev/null >/dev/null 2>&1 && echo "dev OK" || echo "dev MISSING"
echo "== 阻止包管理器在 chroot 内启动服务 =="
printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d
chmod 755 /usr/sbin/policy-rc.d
echo "== 重试安装 openssh-server =="
apt-get install -y openssh-server 2>&1 | tail -20
echo "== 配置 sshd =="
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
mkdir -p /run/sshd
echo 'root:【已脱敏】' | chpasswd
echo "STAGE2B_DONE"
```

### 2.5 `stage2c.sh` — 修复环境泄漏导致的半安装状态

```bash
#!/bin/bash
# K60 chroot setup - stage 2c (修复环境泄漏导致的半安装状态)  2026-09-19
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
unset TMPDIR TMP
export TMPDIR=/tmp
export DEBIAN_FRONTEND=noninteractive
echo "== 修复半安装状态 dpkg --configure -a =="
dpkg --configure -a 2>&1 | tail -5
echo "== apt -f install =="
apt-get install -f -y 2>&1 | tail -3
echo "== 确保 openssh-server =="
apt-get install -y openssh-server 2>&1 | tail -3
echo "== sshd 配置 =="
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
mkdir -p /run/sshd
echo 'root:【已脱敏】' | chpasswd
echo "== 验证 =="
which sshd && sshd -t && echo "sshd config OK"
echo "STAGE2C_DONE"
```

### 2.6 `stage3.sh` — git + node + Claude Code + 启动 sshd

```bash
#!/bin/bash
# K60 chroot setup - stage 3 (git + node + Claude Code + 启动 sshd)  2026-09-19
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
unset TMPDIR TMP
export TMPDIR=/tmp
export DEBIAN_FRONTEND=noninteractive
echo "[1/4] git"
git --version || apt-get install -y git 2>&1 | tail -2
echo "[2/4] Node.js arm64 (npmmirror)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://registry.npmmirror.com/-/binary/node/v20.19.0/node-v20.19.0-linux-arm64.tar.gz" -o /tmp/node.tar.gz
  tar -xzf /tmp/node.tar.gz -C /usr/local --strip-components=1
  rm -f /tmp/node.tar.gz
fi
node -v && npm -v
echo "[3/4] 安装 Claude Code (npmmirror registry)"
npm config set registry https://registry.npmmirror.com
npm install -g @anthropic-ai/claude-code 2>&1 | tail -3
claude --version 2>&1 | head -1
echo "[4/4] 启动 sshd (端口22)"
mkdir -p /run/sshd
/usr/sbin/sshd
ss -tlnp 2>/dev/null | grep :22 || netstat -tlnp 2>/dev/null | grep :22 || echo "port22 check skipped"
echo "STAGE3_DONE"
```

### 2.7 `stage4.sh` — 验证脚本

```bash
#!/bin/bash
# K60 chroot setup - stage 4 (验证 + sshd)  2026-09-19
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
unset TMPDIR TMP
export TMPDIR=/tmp
echo "== claude =="
ls -l /usr/local/bin/claude
claude --version 2>&1 | head -1
echo "== git/node =="
git --version
node -v
echo "== sshd =="
mkdir -p /run/sshd
/usr/sbin/sshd 2>&1 && echo "sshd started"
ps aux 2>/dev/null | grep -m2 "[s]shd"
echo "STAGE4_DONE"
```

### 2.8 `stage5.sh` — 诊断脚本（Claude Code 装哪去了）

```bash
#!/bin/bash
# K60 chroot 诊断 - stage 5 (claude 去哪了)
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
unset TMPDIR TMP
export TMPDIR=/tmp
echo "npm prefix: $(npm prefix -g)"
echo "npm root: $(npm root -g)"
ls "$(npm root -g)" 2>/dev/null | head -5
echo "== node_modules check =="
ls /usr/local/lib/node_modules 2>/dev/null | head -5
ls /usr/local/bin | head -10
echo "== find claude =="
find /usr -maxdepth 5 -name "claude*" 2>/dev/null | head -5
echo "STAGE5_DONE"
```

### 2.9 `stage6.sh` — 修正 npm prefix 后重装 Claude Code

```bash
#!/bin/bash
# K60 chroot setup - stage 6 (修正 npm prefix 后安装 Claude Code)  2026-09-19
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
unset TMPDIR TMP PREFIX
export TMPDIR=/tmp
export NPM_CONFIG_PREFIX=/usr/local
export DEBIAN_FRONTEND=noninteractive
echo "== 清理误装到 Termux 目录的文件 =="
rm -rf /data/data/com.termux/files/usr/lib/node_modules/@anthropic-ai
rm -f /data/data/com.termux/files/usr/bin/claude
echo "== 安装 Claude Code (prefix=/usr/local) =="
npm install -g @anthropic-ai/claude-code 2>&1 | tail -2
ls -l /usr/local/bin/claude
echo "== 验证 =="
claude --version 2>&1 | head -1
echo "STAGE6_DONE"
```

### 2.10 `start_linux2.sh` — android 侧包装器（把脚本送进 chroot 执行）

```bash
#!/system/bin/sh
# K60 chroot stage4 包装（android 侧，root 执行，日志重定向由调用方处理）
export PATH=/system/bin:/system/xbin:$PATH
cp /sdcard/Download/stage6.sh /data/local/linux/root/stage6.sh
cp /sdcard/Download/start_server.sh /data/local/start_server.sh
chmod 755 /data/local/start_server.sh
mount --bind /dev /data/local/linux/dev
mount --bind /dev/pts /data/local/linux/dev/pts
mount --bind /proc /data/local/linux/proc
mount --bind /sys /data/local/linux/sys
chroot /data/local/linux /bin/bash /root/stage6.sh
echo "WRAPPER_DONE"
```

### 2.11 `start_server.sh` — 日常启动（手机重启后执行一次）

```bash
#!/system/bin/sh
# K60 无头服务器一键启动（Termux 里: su -c sh /data/local/start_server.sh）
export PATH=/system/bin:/system/xbin:$PATH
mount --bind /dev /data/local/linux/dev 2>/dev/null
mount --bind /dev/pts /data/local/linux/dev/pts 2>/dev/null
mount --bind /proc /data/local/linux/proc 2>/dev/null
mount --bind /sys /data/local/linux/sys 2>/dev/null
mkdir -p /data/local/linux/run/sshd
chroot /data/local/linux /usr/sbin/sshd
echo "sshd started; connect: ssh root@<phone-ip> (password: 【已脱敏】)"
```

### 2.12 `go.sh` — Termux 侧一键入口

```bash
#!/data/data/com.termux/files/usr/bin/sh
su -c 'sh /sdcard/Download/start_linux2.sh > /sdcard/Download/go_log.txt 2>&1'
echo "LOG_DONE"
```

---

## 三、配置 / 命令

**设备与账号**（复现时替换成自己的）：

| 项目 | 值 |
|---|---|
| 机型 | Redmi K60（国行 23013RK75C，代号 **mondrian**，骁龙 8+ Gen 1） |
| 系统 | MIUI 14 `V14.0.26.0.TMNCNXM`（Android 13，**保持不升级！**） |
| 小米账号 | `2280***223`（解锁工具需登录**同一账号**） |
| 序列号(adb) | 【已脱敏】 |
| IMEI | 【已脱敏】 |

**电脑端装 adb/fastboot**：

```bash
# Debian/Ubuntu
sudo apt install adb fastboot
# Arch
sudo pacman -S android-tools android-udev
# Fedora
sudo dnf install android-tools
# 设备插上显示 no permissions 时：装 android-udev / platform-tools-common 的 udev 规则，
# 或临时 sudo adb devices / sudo fastboot devices
```

**解锁 BL（三选一）**。共同前置：手机关机 → 按住 **音量− + 电源** 进 fastboot（兔子模式）→ 插 USB → `fastboot devices` 能看到设备。

- **路径 A（最稳）**：Windows 管理员运行 `MiUnlock\driver_install_64.exe` 装驱动 → `MiUnlock\miflash_unlock.exe` 登录同一账号 → 解锁（两次确认，全盘清空）。
- **路径 B（全 Linux）**：[MiForge/MiUnlockTool](https://github.com/MiForge/MiUnlockTool)，`pip install MiUnlockTool`，fastboot 下登录 cn 区账号自动解锁。⚠️ 账号密码会经过该脚本，介意可读源码或换路径 A。
- **路径 C**：Linux 主机 + Windows 虚拟机 USB 透传，走路径 A。透传偶尔不稳。

**解锁后必做 + Magisk root**：

```bash
fastboot getvar anti    # 记下防回滚版本！之后勿刷低于此版本的镜像（本次 = 1）

adb install Magisk-v30.7.apk
adb push boot.img /sdcard/Download/
# 手机上：打开 Magisk → 安装 → "修补一个文件" → 选 /sdcard/Download/boot.img
adb pull /sdcard/Download/magisk_patched-*.img .
fastboot flash boot magisk_patched-*.img
fastboot reboot
# 重启后打开 Magisk App 显示"已安装"即成功 ✅
```

**boot.img 提取（流式，不解压全部）**：

```bash
cd k60-flash
tar -tzf mondrian_images_V14.0.26.0.TMNCNXM_cn.tgz | grep boot   # 先看真实路径
tar -xzOf mondrian_images_V14.0.26.0.TMNCNXM_cn.tgz "*/boot.img" > boot.img
```

**日常使用**：

```bash
# 手机重启后，Termux 里执行一次：
su -c sh /data/local/start_server.sh

# 同 WiFi 直连（IP 在手机 WiFi 详情里看，例 192.168.8.62）：
ssh root@192.168.8.62

# USB 连接时（电脑端）：
adb forward tcp:2222 tcp:22
ssh -p 2222 root@127.0.0.1

# 交互进入 chroot 调试：
su -c sh /data/local/start_linux.sh
```

**下载源清单**：

| 资源 | URL |
|---|---|
| K60 线刷包（7.3GB） | `https://cdnorg.d.miui.com/V14.0.26.0.TMNCNXM/mondrian_images_V14.0.26.0.TMNCNXM_20230711.0000.00_13.0_cn_b57eed5de3.tgz` |
| Ubuntu base arm64 | `https://mirrors.tuna.tsinghua.edu.cn/ubuntu-cdimage/ubuntu-base/releases/22.04/release/ubuntu-base-22.04.5-base-arm64.tar.gz` |
| Node arm64 | `https://registry.npmmirror.com/-/binary/node/v20.19.0/node-v20.19.0-linux-arm64.tar.gz` |
| Magisk v30.7 | GitHub `topjohnwu/Magisk` Releases |
| MiUnlockTool（Linux 解锁） | `https://github.com/MiForge/MiUnlockTool` |
| Termux APK | F-Droid / GitHub（**勿用 Play 版**） |

---

## 四、复现 Checklist

**解锁前预检（手机端）**
- [ ] 系统仍是 MIUI 14 `V14.0.26.0.TMNCNXM`（升了 HyperOS 就停下来重估方案）
- [ ] 开发者选项 → 设备解锁状态 → 显示"已绑定账号"
- [ ] 该账号能登录（解锁时要验证）
- [ ] 数据已备份（解锁全盘清空）
- [ ] USB 调试开启，`adb devices` 能看到设备

**解锁 + root（电脑端）**
- [ ] `bash dl_segments.sh` 下完线刷包，输出 `DOWNLOAD_COMPLETE 7372993076`
- [ ] `tar -xzOf ... "*/boot.img" > boot.img` 提取 boot（192MB）
- [ ] fastboot 模式 → MiUnlock（A/B/C 任一路径）解锁 BL
- [ ] `fastboot getvar anti` 记录防回滚版本
- [ ] `adb install Magisk-v30.7.apk` → 手机上修补 boot.img → `adb pull` 回来
- [ ] `fastboot flash boot magisk_patched-*.img` → 重启后 Magisk 显示"已安装"

**chroot 部署（手机端）**
- [ ] Termux（F-Droid 版）装好，`pkg install tsu wget`
- [ ] 跑 `k60_setup1.sh`：解压 Ubuntu base 到 `/data/local/linux`，生成 `start_linux.sh`
- [ ] `su -c sh /data/local/start_linux.sh` 进 chroot，依次跑 stage2（→2b→2c 如遇同类问题）→ stage3
- [ ] 若 claude 装错位置：stage5 诊断 → stage6 修正 prefix 重装
- [ ] `start_server.sh` 放到 `/data/local/`

**验证**
- [ ] `ssh root@<手机IP>` 能登录，`git --version` / `node -v` / `claude --version` 正常
- [ ] USB 场景 `adb forward tcp:2222 tcp:22` 后 `ssh -p 2222 root@127.0.0.1` 通

**遗留待办（本项目未做完）**
- [ ] Claude Code 联网配置（Anthropic API 在手机上需代理方案）
- [ ] Termux `wake-lock` + MIUI 省电白名单（不设会被杀后台）
- [ ] 可选：Magisk 自动响应改回「提示」
- [ ] 可选：Termux:Boot 开机自启 `start_server.sh`（免手动）

---

## 五、踩坑记录

| # | 现象 | 原因 | 解决 |
|---|---|---|---|
| 1 | `bigota.d.miui.com` 下载 403 | CDN 拒绝非浏览器客户端 | 换 `bn.d.miui.com` / `cdnorg.d.miui.com` + 浏览器 UA（脚本已内置） |
| 2 | 线刷包直连只有 44KB/s | 小米 CDN 对直连限速 | 走 Clash 代理 `127.0.0.1:7890` 提速到 2.6MB/s（脚本 `PROXY` 第 4 行） |
| 3 | 分段下载脚本 v1/v2 连续两轮全错 | **bash 坑**：`local i=$1 s=.. e=$((s+X))` 单行声明时 `e` 的展开先于 `s` 赋值 | local 声明必须拆行 |
| 4 | 重启下载后续传，进度文件损坏 | 旧 worker 没死干净，多代进程并发写同一分段 | 重启脚本前精确 pkill 旧实例（按 cmdline 匹配）；Git Bash 下勿用 `$$` 做守卫——MSYS PID 与 Windows PID 不一致 |
| 5 | 断点续传丢流量（tmp 块全弃） | v2 设计上丢弃进行中的临时块 | v3 改为断在哪从哪续，任何已下字节都保留 |
| 6 | `unlock.update.miui.com` 无法访问 | 官网入口被墙/失效 | 官方工具直链在 `miuirom.xiaomi.com/rom/u1106245679/...`（miuiver.com/miunlock 存档） |
| 7 | GitHub 直连被重置 | 网络 | 走代理 |
| 8 | chroot 内 `apt install openssh-server` 失败/卡住 | 包管理器尝试在 chroot 里启动 systemd 服务 | `printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d` 阻止 |
| 9 | chroot 内 dpkg 半安装状态 | Termux 的 `TMPDIR` 等环境变量泄漏进 chroot | 脚本开头 `unset TMPDIR TMP` 并重置 `TMPDIR=/tmp`；`dpkg --configure -a` + `apt -f install` 修复 |
| 10 | `claude --version` 找不到命令 | npm 全局装到了 Termux 的 PREFIX 目录（环境变量泄漏） | stage6：`unset PREFIX` + `NPM_CONFIG_PREFIX=/usr/local` 重装，并清理误装文件 |
| 11 | Claude Code 在 Termux 原生装不上 | 新版 Claude Code 需 glibc，Termux 是 bionic | 必须装在 chroot 的 Ubuntu 里（这也是选 chroot 而非 proot 的原因之一） |
| 12 | 解锁提示未绑定/时间不够 | 登录了不同账号，或绑定未满 168h | 确认**同一**账号、设备解锁状态显示已绑定；老政策每账号 30 天仅 1 台设备 |
| 13 | sshd 起不来 | `/run/sshd` 缺失（容器无 systemd 创建） | 每次启动前 `mkdir -p /run/sshd`（start_server.sh 已含） |
| 14 | chroot 内网络不通 | 无 DNS | rootfs 里写 `etc/resolv.conf` → `nameserver 223.5.5.5` |

**延伸阅读**：B 站 `BV1uH4y1s7S5`（K50 解锁刷机教程，流程通用但镜像必须用 K60 自己的；其"德尔塔面具"已停更，改用官方 Magisk v30.7）。

---

## 六、文件清单

`k60-flash/` 目录（复现需拷走的内容）：

| 文件 | 状态 | 说明 |
|---|---|---|
| `dl_segments.sh` | ✅ 必须 | 分段下载脚本（v3，断点续传） |
| `mondrian_images_..._cn.tgz` | ✅ 必须 | 线刷包 7.3GB（救砖保险；已在手可不下） |
| `boot.img` | ✅ 必须 | 从线刷包流式提取，供 Magisk 修补 |
| `magisk_patched-30700_Sqhqt.img` | ⚠️ 本机专用 | 修补产物（换设备需重新修补，勿直接复用） |
| `Magisk-v30.7.apk` | ✅ 必须 | 官方稳定版 11.6MB |
| `MiUnlock\` + `miflash_unlock-6.5.406.31.zip` | ✅ 必须 | 官方解锁工具（Windows） |
| `platform-tools\` / `platform-tools.zip` | ✅ 必须 | adb/fastboot |
| `termux.apk` | ✅ 必须 | F-Droid 版 Termux |
| `k60_setup1.sh` `stage2~6.sh` | ✅ 必须 | 部署脚本（本文二、代码 全文收录） |
| `start_linux2.sh` `start_server.sh` `go.sh` | ✅ 必须 | 启动/入口脚本 |
| `uidump.xml` `s.png` | ❌ 可不带 | 当时 AI 驱动手机 UI 用的调试产物 |
| `tmp_part_*` | ❌ 可不带 | 下载临时块，续传自动处理 |
