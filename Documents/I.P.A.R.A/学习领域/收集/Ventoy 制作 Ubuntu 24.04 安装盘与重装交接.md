---
createTime: 2026-10-28 11:05
笔记ID: 20261028110514
multiFile:
multiMedia:
description: 记录原微PE文件备份、Ventoy与Ubuntu 24.04安装盘制作和校验，保留完整执行脚本与新对话拍照问答提示词。
笔记类型: 收集笔记
阐述日期:
tags:
  - linux
  - Ubuntu
  - Ventoy
  - 系统安装
  - 数据备份
aliases:
  - Ubuntu 24.04 安装U盘
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Ventoy 制作 Ubuntu 24.04 安装盘与重装交接

```meta-bind-embed
[[笔记抬头模块]]
```

> 为另一台电脑准备 Ubuntu 24.04 安装介质。来源：2026-10-28 本次 Codex 本地执行会话；环境为 Linux、Ventoy 与 Ubuntu Desktop，用于复现到其他电脑。设备唯一标识已用 `【已脱敏】` 替换；不收录密码、业务文件内容或备份文件明细。

## 一、原理与本次操作记录

### 已完成的结果

**2026-10-28 10:45:04（Asia/Shanghai），启动 U 盘制作、镜像校验和卸载均已完成；另一台电脑的 Ubuntu 安装尚未执行。**

| 项目 | 本次结果 |
| --- | --- |
| 原 U 盘 | SanDisk 3.2Gen1，57.3 GiB，原挂载点 `/run/media/yuan/微PE工具箱` |
| 制盘时的设备名 | `/dev/sda`，仅用于记录当时环境，不能套用到其他电脑 |
| 备份目的地 | 另一块 HGST 外接硬盘上的 `/run/media/yuan/新加卷`，当时为 `/dev/sdb2` |
| 文件备份 | 3,950 个文件、868 个目录，包括隐藏文件；ZIP 为 34,000,731,979 字节，约 31.67 GiB；全部文件 CRC 校验通过 |
| Ventoy | 1.1.18，MBR 分区布局，Secure Boot Support 为 YES |
| 最终分区 | 数据分区为 exFAT、卷标 `Ventoy`；EFI 分区为 FAT、32 MiB、卷标 `VTOYEFI` |
| Ubuntu | `ubuntu-24.04.5.1-desktop-amd64.iso`，属于 Ubuntu 24.04 LTS 桌面版，面向 Intel/AMD 64 位电脑 |
| ISO 大小 | 6,250,332,160 字节，约 5.82 GiB |
| 校验与卸载 | 官方校验清单签名验证通过；下载镜像、新加卷副本及 U 盘副本 SHA-256 均匹配；两个 U 盘分区最后均未挂载 |

Ubuntu ISO 的 SHA-256：

```text
4da4a0c9035da8e68a59a838674f403f0a54472c78a83b4fb7f78d03588f85a7
```

Ventoy Linux 安装包的 SHA-256：

```text
d86ff9de63d94c8b8f1f6b14d23c55af4b88e8207bf2893890892a6a97b1ad54
```

### 执行顺序

1. 读取前置分享对话，确定采用 Ventoy 加 Ubuntu ISO 制作安装 U 盘。
2. 用 `lsblk`、`df` 和设备唯一标识区分 SanDisk U 盘、备份外接硬盘以及制盘主机内置硬盘，避免混淆两个名为“新加卷”的分区。
3. 原文件约 32.9 GiB，原压缩任务把 ZIP 写回同一个 U 盘；可供 ZIP 使用的总空间仅约 23.8 GiB。用户取消原任务后，改为直接备份到“新加卷”。
4. 备份脚本遍历所有原文件和目录，排除已取消任务生成的 `微pe工具箱.zip`；视频、ISO、已有 ZIP 等文件直接装入 ZIP，其余文件使用低压缩级别。写入落盘后逐项读取并核验 CRC，再比较源文件清单、大小及修改时间，确认备份期间源文件未变化。
5. 下载官方 Ventoy 1.1.18 Linux 包，校验 SHA-256；下载 Ubuntu 的签名校验清单，并使用本机 Ubuntu 镜像签名公钥验证签名。Ubuntu ISO 最终使用本机下载目录和多连接下载，关闭预分配，下载完成后核验 SHA-256，再复制到“新加卷”并核验副本。
6. 完成系统管理员认证。写盘脚本再次核对设备唯一标识、容量、可移动属性、挂载点、备份状态、源文件清单和 ISO 校验值。
7. 另行保存原分区表、原磁盘前 1 MiB、原微PE EFI 分区镜像；随后仅对已识别的 SanDisk U 盘安装 Ventoy。
8. 读取 Ventoy 的盘内版本信息，确认版本 1.1.18、MBR、Secure Boot 支持开启。复制 Ubuntu ISO、安装说明与校验值，执行落盘和 U 盘副本 SHA-256 校验，最后卸载并清理临时挂载目录。

### 安装现场还要确认的事情

本次备份保护的是**原 U 盘内容**，没有备份另一台待重装电脑的系统盘。另一台电脑的型号、现有系统、磁盘布局、是否整盘重装以及重要数据是否备份，留待安装现场确认。启动 U 盘已完成文件与分区检查，但尚未在目标电脑实机启动测试。

### 新对话拍照问答提示词

将下面整段复制到可拍照上传的新对话：

```text
你是我的 Ubuntu 安装现场助手。我会上传屏幕照片，请用中文根据实际界面逐步指导我。

已知背景：
- 我要给另一台电脑安装 Ubuntu 24.04 LTS 桌面版。SanDisk 57.3 GiB U 盘已装好 Ventoy 1.1.18，采用 MBR 分区，Secure Boot 支持开启，数据卷标为 Ventoy。
- U 盘已有 ubuntu-24.04.5.1-desktop-amd64.iso，适用于 Intel/AMD 64 位电脑。下载文件和 U 盘副本的 SHA-256 均通过校验，U 盘已安全卸载，无需重新制作。
- 原 U 盘文件已备份到另一块硬盘并校验通过。这不是待重装电脑的数据备份。目标电脑的型号、现有系统、磁盘布局、是否整盘重装及重要数据是否备份，仍需确认。
- 之前的 /dev/sda 是制盘主机上的 U 盘，不能套用到目标电脑。

请按以下方式协助：
1. 根据照片判断当前是启动菜单、Ventoy、Ubuntu 安装器还是安装后系统。每次只给接下来 1—3 个操作，写明按钮名称、预期结果及下一张照片拍哪里。
2. 照片不清楚或磁盘身份不明时，让我补拍，不要猜测。
3. 在擦除磁盘、删除分区、格式化或最终提交磁盘变更前，先核对目标硬盘型号、容量和要保留的数据，说明影响，等我明确确认；避免选中安装 U 盘或外接备份盘。
4. 遇到 Secure Boot、证书注册、看不到硬盘、黑屏或报错时，先识别具体问题，不要默认关闭安全功能或随意切换存储控制器模式。需要查询时优先使用 Ubuntu、Ventoy、电脑厂商官方文档。
5. 安装完成后，继续指导我按提示拔 U 盘、重启，以及检查网络、显示和基本驱动。

请先问我目标电脑的品牌型号、是否整盘重装、重要数据是否已备份，并告诉我第一张应该拍什么画面。
```

## 二、完整执行脚本

以下为本次实际使用的两个完整脚本。安装脚本中的两处 `/dev/disk/by-id/【已脱敏】` 分别对应目标 U 盘和备份卷，不能直接运行；跨设备复现时还必须调整挂载路径、任务目录、预期容量、用户 UID/GID 和版本校验值。当前 U 盘已经做好，后续在另一台电脑安装系统时**不要再次运行制盘脚本**。

### 直接生成备份

原文件：`/home/yuan/Downloads/ubuntu-usb-prep-20261028/backup_direct.py`。

```python
import hashlib
import json
import os
from pathlib import Path
import time
import zipfile

TASK = Path('/home/yuan/Downloads/ubuntu-usb-prep-20261028')
SOURCE = Path('/run/media/yuan/微PE工具箱')
DEST = Path('/run/media/yuan/新加卷/微PE工具箱备份-20261028')
OLD_ARCHIVE = SOURCE / '微pe工具箱.zip'

def snapshot():
    result = []
    for root, dirs, files in os.walk(SOURCE):
        for name in dirs + files:
            p = Path(root) / name
            if p == OLD_ARCHIVE:
                continue
            s = p.stat()
            result.append(dict(path=str(p.relative_to(SOURCE)), dir=p.is_dir(), size=s.st_size, mtime_ns=s.st_mtime_ns))
    return sorted(result, key=lambda x: x['path'])

# Refuse to run while the user's previous compression still has an open writer.
for proc in Path('/proc').iterdir():
    if not proc.name.isdigit():
        continue
    try:
        for fd in (proc / 'fd').iterdir():
            try:
                if os.readlink(fd) == str(OLD_ARCHIVE):
                    info = (proc / 'fdinfo' / fd.name).read_text()
                    flags = int(next(s.split()[1] for s in info.splitlines() if s.startswith('flags:')), 8)
                    assert not flags & os.O_ACCMODE, 'Previous compression is still running.'
            except (OSError, StopIteration):
                pass
    except OSError:
        pass

before = snapshot()
assert SOURCE.stat().st_dev != DEST.stat().st_dev
final = DEST / '微pe工具箱.zip'
partial = DEST / '微pe工具箱.zip.partial'
assert not final.exists() and not partial.exists(), 'Refusing to overwrite an existing backup.'
stored = {'.iso', '.zip', '.7z', '.rar', '.gz', '.xz', '.bz2', '.mp4', '.mkv', '.mov', '.mp3', '.jpg', '.jpeg', '.png', '.webp', '.dmg', '.exe', '.msi', '.pptx', '.docx', '.xlsx', '.pdf'}
total = 0
next_report = 2 * 1024**3
print(f'Backing up {len(before)} entries directly to {partial}', flush=True)
with zipfile.ZipFile(partial, mode='x', compression=zipfile.ZIP_DEFLATED, compresslevel=1, allowZip64=True, strict_timestamps=False) as z:
    for e in before:
        p = SOURCE / e['path']
        method = zipfile.ZIP_STORED if e['dir'] or p.suffix.lower() in stored else zipfile.ZIP_DEFLATED
        z.write(p, arcname=e['path'], compress_type=method, compresslevel=1)
        if not e['dir']:
            total += e['size']
        if total >= next_report:
            print(f'Source backed up: {total / 1024**3:.1f} GiB', flush=True)
            next_report += 2 * 1024**3
with partial.open('rb') as f:
    os.fsync(f.fileno())
print('Backup archive written. Verifying CRC of every file.', flush=True)
with zipfile.ZipFile(partial) as z:
    assert len(z.infolist()) == len(before)
    for n, i in enumerate(z.infolist(), 1):
        if not i.is_dir():
            with z.open(i) as f:
                while f.read(8 * 1024**2):
                    pass
        if n % 500 == 0:
            print(f'CRC verified: {n} entries', flush=True)
assert before == snapshot(), 'Source files changed during backup; refusing to mark ready.'
partial.rename(final)
report = dict(archive=str(final), archive_size=final.stat().st_size, archive_crc_verified=True, source_entries=before, supplemental_files=[], archive_stat_mtime_ns=final.stat().st_mtime_ns, ready_at=time.time(), method='direct ZIP with stored entries for precompressed formats')
(DEST / '备份校验报告.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
(TASK / 'backup-ready.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(f'BACKUP READY: {final}; all source files, including hidden files, covered.', flush=True)
```

### 保护备份并完成制盘

原文件：`/home/yuan/Downloads/ubuntu-usb-prep-20261028/install-ventoy.sh`。除设备唯一标识脱敏外，以下代码保留实际执行内容。脚本需要上一个脚本生成的 `backup-ready.json` 和已经校验过的 ISO；这些核对通过后才会格式化目标 U 盘。

```bash
#!/bin/bash
set -euo pipefail

TASK=/home/yuan/Downloads/ubuntu-usb-prep-20261028
export TASK
[[ $EUID -eq 0 ]] || { echo 'Administrator authentication is required.'; exit 1; }
exec > >(tee -a "$TASK/install.log") 2>&1

# This script is run only after the existing compression, backup, and ISO checks finish.
python3 - <<'PY'
import hashlib, json, os, subprocess
from pathlib import Path

task = Path(os.environ['TASK'])
ready = json.loads((task / 'backup-ready.json').read_text())
assert ready['archive_crc_verified'] is True
archive = Path(ready['archive'])
assert archive == Path('/run/media/yuan/新加卷/微PE工具箱备份-20261028/微pe工具箱.zip')
assert archive.stat().st_size == ready['archive_size']
assert archive.stat().st_mtime_ns == ready['archive_stat_mtime_ns']

source = Path('/run/media/yuan/微PE工具箱')
target = Path('/dev/disk/by-id/【已脱敏】').resolve(strict=True)
backup_device = Path('/dev/disk/by-id/【已脱敏】').resolve(strict=True)
assert Path('/sys/class/block', target.name, 'size').read_text().strip() == '120164352'
assert Path('/sys/class/block', target.name, 'removable').read_text().strip() == '1'
def mounted_device(path):
    return Path(subprocess.check_output(['findmnt', '-n', '-o', 'SOURCE', '-T', str(path)], text=True).strip()).resolve(strict=True)
assert mounted_device(source) == Path(str(target) + '1')
assert mounted_device(archive) == backup_device
assert source.stat().st_dev != archive.stat().st_dev

entries = []
for root, dirs, files in os.walk(source):
    for name in dirs + files:
        p = Path(root) / name
        if p == source / '微pe工具箱.zip':
            continue
        s = p.stat()
        entries.append(dict(path=str(p.relative_to(source)), dir=p.is_dir(), size=s.st_size, mtime_ns=s.st_mtime_ns))
assert sorted(entries, key=lambda x: x['path']) == ready['source_entries'], 'Source changed after backup.'
iso = task / 'ubuntu-24.04.5.1-desktop-amd64.iso'
assert iso.stat().st_size == 6250332160
with iso.open('rb') as f:
    assert hashlib.file_digest(f, 'sha256').hexdigest() == '4da4a0c9035da8e68a59a838674f403f0a54472c78a83b4fb7f78d03588f85a7'
(task / 'verified-target-device.txt').write_text(str(target))
print('All checks passed. Target:', target, 'SanDisk 57.3 GiB. Backup:', archive, flush=True)
PY

TARGET=$(cat "$TASK/verified-target-device.txt")
BACKUP=/run/media/yuan/新加卷/微PE工具箱备份-20261028
sfdisk --dump "$TARGET" > "$BACKUP/原分区表.sfdisk"
dd if="$TARGET" of="$BACKUP/原磁盘前1MiB.img" bs=1M count=1 status=none conv=fsync
dd if="${TARGET}2" of="$BACKUP/原微PE-EFI分区.img" bs=4M status=progress conv=fsync

cd "$TASK/ventoy-1.1.18"
printf 'y\ny\n' | /bin/sh ./Ventoy2Disk.sh -i -s "$TARGET"
udevadm settle
/bin/sh ./Ventoy2Disk.sh -l "$TARGET"
date --iso-8601=seconds > "$TASK/ventoy-installed.txt"
echo 'Ventoy installed. Copying Ubuntu ISO to the USB.'
if findmnt -rn -S "${TARGET}1" > /dev/null; then
    umount "${TARGET}1"
fi
USB_MOUNT=$(mktemp -d /mnt/codex-ventoy.XXXXXX)
export USB_MOUNT TARGET
cleanup() {
    if mountpoint -q "$USB_MOUNT"; then
        umount "$USB_MOUNT" || return
    fi
    rmdir "$USB_MOUNT"
}
trap cleanup EXIT
mount -t exfat -o uid=1000,gid=1000,umask=022 "${TARGET}1" "$USB_MOUNT"
python3 -u - <<'PY'
import hashlib, json, os, time
from pathlib import Path
task = Path(os.environ['TASK'])
usb = Path(os.environ['USB_MOUNT'])
name = 'ubuntu-24.04.5.1-desktop-amd64.iso'
size = 0
next_report = 1024**3
with (task / name).open('rb') as src, (usb / name).open('xb') as dst:
    while chunk := src.read(8 * 1024**2):
        dst.write(chunk)
        size += len(chunk)
        if size >= next_report:
            print(f'ISO copied to USB: {size / 1024**3:.1f} GiB', flush=True)
            next_report += 1024**3
    dst.flush()
    os.fsync(dst.fileno())
print('Verifying SHA256 of ISO on USB.', flush=True)
with (usb / name).open('rb') as f:
    sha = hashlib.file_digest(f, 'sha256').hexdigest()
assert size == 6250332160 and sha == '4da4a0c9035da8e68a59a838674f403f0a54472c78a83b4fb7f78d03588f85a7'
(usb / '安装说明.txt').write_bytes((task / '安装说明.txt').read_bytes())
(usb / 'SHA256SUMS.txt').write_text(f'{sha}  {name}\n')
(task / 'usb-verified.json').write_text(json.dumps(dict(device=os.environ['TARGET'], iso=name, iso_bytes=size, iso_sha256=sha, verified_at=time.time()), indent=2))
print('ISO on USB verified successfully.', flush=True)
PY
sync -f "$USB_MOUNT"
umount "$USB_MOUNT"
cleanup
trap - EXIT
date --iso-8601=seconds > "$TASK/ventoy-ready.txt"
echo 'READY: Ventoy + Ubuntu USB complete, verified, and unmounted. Safe to unplug.'
```

## 三、配置与命令

### 准备目录与下载来源

本次本地任务目录：`/home/yuan/Downloads/ubuntu-usb-prep-20261028/`。供保留和复用的下载文件位于 `/run/media/yuan/新加卷/Ubuntu-24.04-启动盘准备/`，包括 Ventoy 包、Ubuntu ISO、`SHA256SUMS`、`SHA256SUMS.gpg`、Ventoy 校验值与安装说明。

- [Ubuntu 24.04 官方镜像目录](https://releases.ubuntu.com/24.04/)
- [Ventoy 1.1.18 官方发布页](https://github.com/ventoy/Ventoy/releases/tag/v1.1.18)
- [Ventoy 官方安装说明](https://www.ventoy.net/en/doc_start.html)
- [前置讨论：微PE安装Ubuntu 24.04](https://chatgpt.com/share/6ae15129-20c0-83ec-876b-b7b934e839a0)，仅为方案讨论，不代表后续本机执行记录。

### 本次下载与校验方式

以下保留下载阶段的最终参数；目录需预先存在。相同版本复现前仍应核对官方发布页与签名清单，不能用固定旧校验值验证其他版本。

```bash
aria2c --file-allocation=none --max-connection-per-server=8 --split=8 --min-split-size=16M --max-tries=8 --retry-wait=5 --connect-timeout=20 --summary-interval=30 --console-log-level=warn --download-result=full --checksum=sha-256=4da4a0c9035da8e68a59a838674f403f0a54472c78a83b4fb7f78d03588f85a7 --dir='/home/yuan/Downloads/ubuntu-usb-prep-20261028' --out=ubuntu-24.04.5.1-desktop-amd64.iso.part 'https://releases.ubuntu.com/24.04/ubuntu-24.04.5.1-desktop-amd64.iso'
```

下载完成且 SHA-256 通过后，将 `.iso.part` 改为 `.iso`，保存到新加卷的副本也再次核验。官方清单的签名验证命令如下：

```bash
gpgv --keyring /usr/share/keyrings/ubuntu-archive-keyring.gpg '/run/media/yuan/新加卷/Ubuntu-24.04-启动盘准备/SHA256SUMS.gpg' '/run/media/yuan/新加卷/Ubuntu-24.04-启动盘准备/SHA256SUMS'
```

实际输出为 Ubuntu CD Image Automatic Signing Key 的 Good signature。Ventoy 包从官方 GitHub Release 下载并通过前述哈希校验，解压到任务目录的 `ventoy-1.1.18/`。

### 历史执行入口

以下仅用于记录本次执行入口。第二条命令会制作启动盘，不是安装 Ubuntu 到目标电脑的命令；当前不需要重复运行。

```bash
python3 -u /home/yuan/Downloads/ubuntu-usb-prep-20261028/backup_direct.py > /home/yuan/Downloads/ubuntu-usb-prep-20261028/backup-direct.log 2>&1
pkexec /bin/bash /home/yuan/Downloads/ubuntu-usb-prep-20261028/install-ventoy.sh
```

### U 盘中的安装说明

制盘脚本读取的 `安装说明.txt` 完整内容如下：

```text
Ubuntu 24.04 LTS 安装 U 盘

适用：普通 Intel/AMD 64 位电脑。
镜像：Ubuntu 24.04.5.1 LTS Desktop amd64（24.04 系列）。
启动工具：Ventoy 1.1.18，MBR 分区布局，开启 Secure Boot 支持。

使用方法：
1. 先备份将要安装 Ubuntu 的那台电脑中的重要文件。
2. 插入此 U 盘，开机进入启动菜单（常见为 F12、F11、Esc，具体看电脑品牌）。
3. 优先选择 UEFI USB / UEFI SanDisk 启动项。
4. 在 Ventoy 菜单中选择 ubuntu-24.04.5.1-desktop-amd64.iso，再选 Normal mode。
5. 进入 Ubuntu 后可先试用，确认显示、键盘、网络等，再运行安装程序。
6. 若要用 Ubuntu 替换原系统，可选择“擦除磁盘并安装 Ubuntu”；这会删除所选目标磁盘中的数据，务必核对磁盘型号和容量。
7. 安装结束按提示拔掉 U 盘并重启。

如果电脑出现 Secure Boot 或证书注册界面，请记录界面内容，再根据具体提示处理。
请保留已校验的原始 ISO，无需解压。
```

## 四、复现与交接 Checklist

### 已完成的制盘工作

- [x] 识别 U 盘和备份硬盘，核对设备唯一标识及容量。
- [x] 原 U 盘文件在另一块盘中备份，包含隐藏文件，CRC 校验通过。
- [x] 官方签名清单和两个安装文件的哈希校验通过。
- [x] 原 EFI 分区、分区表及磁盘前 1 MiB 已另存。
- [x] Ventoy 安装成功，盘内版本和分区布局检查通过。
- [x] U 盘 ISO 的 SHA-256 匹配官方值，两个分区均已卸载。

### 目标电脑现场待确认

- [ ] 确认品牌型号、CPU 架构、现有系统和磁盘型号及容量。
- [ ] 确认整盘重装还是保留其他系统或数据，单独备份目标电脑的重要文件。
- [ ] 通过启动菜单从 U 盘启动，并拍照确认当前界面。
- [ ] 提交磁盘变更前再次核对目标盘，避免选择安装 U 盘或备份硬盘。
- [ ] 完成安装，按提示拔 U 盘并重启，检查首次启动、网络、显示和基本驱动。

## 五、踩坑记录

| 现象 | 原因或判断 | 本次处理 |
| --- | --- | --- |
| 压缩时 U 盘空间持续减少 | 原文件与输出 ZIP 共用同一卷；原文件 32.9 GiB，最终 ZIP 31.7 GiB，无法一起容纳于原 56.7 GiB 数据分区 | 用户取消原任务后，直接向另一块硬盘生成备份 |
| 部分文件重复压缩收益很小 | 视频、ISO、ZIP、安装包占比高 | 已压缩格式使用 ZIP 存储模式，其余低级别压缩 |
| 下载预分配阶段等待较久 | 预分配写入也占用外接盘 I/O | 最终关闭 aria2 预分配，在本机下载并校验，再保留外接盘副本 |
| `sudo -n true` 提示需要交互认证 | 当前命令没有可直接使用的管理员认证 | 使用系统 `pkexec` 认证请求，用户在系统窗口完成认证后继续 |
| 不同机器的盘符可能变化 | `/dev/sda` 只是本次制盘时的设备名 | 制盘核对 by-id；新对话根据目标电脑的实际磁盘照片重新确认 |
| 文件校验通过不等于系统已装好 | 本次完成的是安装介质，目标电脑尚未执行安装 | 把安装方式、目标盘和目标电脑备份作为现场交接事项 |

## 六、文件清单

| 文件或目录 | 用途 |
| --- | --- |
| `/run/media/yuan/新加卷/微PE工具箱备份-20261028/微pe工具箱.zip` | 原 U 盘文件备份，CRC 校验通过 |
| 同目录 `备份校验报告.json` | 原文件清单、备份大小和校验结果；含私人文件名，仅保留在外接硬盘，不复制进公开笔记库 |
| 同目录 `原微PE-EFI分区.img` | 原 298 MiB EFI 分区镜像 |
| 同目录 `原分区表.sfdisk`、`原磁盘前1MiB.img` | 原布局和引导区域备份；与文件 ZIP 一起保留，不等同于整盘镜像 |
| `/run/media/yuan/新加卷/Ubuntu-24.04-启动盘准备/` | 已下载并校验的镜像、Ventoy 包和签名清单 |
| `/home/yuan/Downloads/ubuntu-usb-prep-20261028/` | 本次脚本、日志、完成标记和本地 ISO；其中源清单与备份报告不纳入公开笔记库 |
| U 盘根目录 `ubuntu-24.04.5.1-desktop-amd64.iso` | 实际用于启动安装的 ISO |
| U 盘根目录 `SHA256SUMS.txt`、`安装说明.txt` | 镜像校验值与安装入口说明 |

相关笔记：[[Documents/I.P.A.R.A/学习领域/收集/Linux|Linux]]、[[Documents/I.P.A.R.A/学习领域/收集/Windows安装Ubuntu （双系统）|Windows安装Ubuntu （双系统）]]。
