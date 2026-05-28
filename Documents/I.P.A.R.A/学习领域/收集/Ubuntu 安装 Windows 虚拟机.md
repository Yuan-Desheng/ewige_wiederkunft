# Ubuntu 安装 Windows 虚拟机

## 概述

在 Ubuntu 22.04 上通过 QEMU/KVM + virt-manager 安装 Windows 11 虚拟机，用于运行原版 Microsoft Office，实现最佳兼容性。

> 参考："Linux 下最佳兼容性还是 QEMU/KVM 然后装原版 Microsoft Office。"

## 环境信息

- 系统：Ubuntu 22.04.5 LTS (Jammy), x86_64
- CPU：Intel，支持 VT-x（vmx）
- 内存：23GB
- 磁盘：311GB 可用

## 第一步：安装 QEMU/KVM 和 virt-manager

```bash
sudo apt update && sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager qemu-utils spice-client-gtk gir1.2-spiceclientgtk-3.0
```

将用户加入 kvm 和 libvirt 组（免 sudo 管理虚拟机）：

```bash
sudo usermod -aG kvm,libvirt yuan
```

> 注意：组变更需要**重新登录**后才会生效。当前会话可用 `sg libvirt -c "命令"` 临时获取权限。

验证安装：

```bash
kvm-ok          # 应输出 "KVM acceleration can be used"
systemctl is-active libvirtd  # 应输出 "active"
```

## 第二步：下载 Windows 11 ISO

- 微软官方下载页：https://www.microsoft.com/zh-cn/software-download/windows11
- 由于是 Linux 系统，微软会直接显示 ISO 下载选项
- 选择 "Windows 11 (multi-edition ISO for x64 devices)" -> 简体中文 -> 下载

## 第三步：创建虚拟机

```bash
# 创建虚拟磁盘（80GB 动态分配）
mkdir -p ~/KVM/images
qemu-img create -f qcow2 ~/KVM/images/win11.qcow2 80G

# 创建虚拟机（注意用 os-variant win10 避免强制 UEFI）
sg libvirt -c 'virt-install \
  --name win11 \
  --ram 8192 \
  --vcpus 4 \
  --os-variant win10 \
  --machine q35 \
  --cpu host-passthrough \
  --features hyperv_relaxed=on,hyperv_vapic=on,hyperv_spinlocks=on,hyperv_spinlocks_retries=8191 \
  --disk path=/home/yuan/KVM/images/win11.qcow2,bus=sata,format=qcow2 \
  --cdrom "/home/yuan/下载/Win11_25H2_Pro_Chinese_Simplified_x64_v2.iso" \
  --network network=default,model=virtio \
  --graphics spice,gl.enable=no \
  --video virtio \
  --channel spicevmc \
  --noautoconsole'
```

### 关键参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `--ram` | 8192 | 8GB 内存 |
| `--vcpus` | 4 | 4核 CPU |
| `--os-variant` | win10 | 用 win10 而非 win11，避免强制 UEFI |
| `--disk bus=` | sata | 必须用 sata，不能用 virtio（Windows 安装程序无 virtio 驱动） |
| `--network model=` | virtio | 网卡可用 virtio，安装完系统后再装驱动 |

## 第四步：连接虚拟机控制台

```bash
# 获取 SPICE 连接地址
sg libvirt -c "virsh domdisplay win11"
# 输出：spice://127.0.0.1:5900

# 启动 remote-viewer 连接
DISPLAY=:0 sg libvirt -c "remote-viewer spice://127.0.0.1:5900"
```

## 第五步：Windows 安装过程

### 绕过 TPM 2.0 和安全启动检查

Windows 11 安装时会提示"该电脑必须支持 TPM 2.0"和"该电脑必须支持安全启动"。绕过方法：

1. 在报错界面按 **Shift + F10** 打开命令提示符
2. 输入以下命令：
```
reg add HKLM\System\Setup\LabConfig /v BypassTPMCheck /t reg_dword /d 1 /f
reg add HKLM\System\Setup\LabConfig /v BypassSecureBootCheck /t reg_dword /d 1 /f
```
3. 关闭命令窗口，点**后退箭头**，再点"下一步"

## 第六步：安装 SPICE Guest Tools

SPICE Guest Tools 提供**剪贴板共享、文件拖拽、自适应分辨率**功能。

```bash
# 下载（约 10MB）
cd ~/下载
wget -c https://www.spice-space.org/download/windows/spice-guest-tools/spice-guest-tools-latest.exe

# 制作 ISO 并挂载到虚拟机
mkdir -p /tmp/spice-iso
cp ~/下载/spice-guest-tools-latest.exe /tmp/spice-iso/
genisoimage -o /tmp/spice-guest-tools.iso -J -r /tmp/spice-iso/

# 挂载光驱（光驱设备名为 sdb，可通过 virsh dumpxml 查看）
sg libvirt -c "virsh change-media win11 sdb /tmp/spice-guest-tools.iso"
```

在 Windows 虚拟机中：打开"此电脑" → 双击光驱 → 运行 spice-guest-tools 安装程序 → 重启虚拟机。

安装完成后卸载光驱：
```bash
sg libvirt -c "virsh change-media win11 sdb --eject"
```

## 第七步：安装 virtio 驱动（网卡等）

虚拟机创建时网卡用了 `model=virtio`，Windows 需要安装驱动才能联网。

```bash
# virtio-win ISO（约 90MB，版本 0.1.285）
# 挂载到虚拟机
sg libvirt -c "virsh change-media win11 sdb /home/yuan/下载/virtio-win.iso"
```

在 Windows 中：设备管理器 → 网络适配器 → 如果有"Red Hat VirtIO Ethernet Adapter"说明驱动已自动识别。

> 实际经验：Windows 11 安装过程中 virtio 网卡驱动会被自动加载，无需手动安装。

验证联网：打开 Edge 浏览器访问任意网站，或在 cmd 中 `ping 8.8.8.8`。

## 第八步：安装 Microsoft Office 2024

### 方法：Office Deployment Tool (ODT)

**第 1 步**：在虚拟机 Edge 浏览器中访问 https://www.microsoft.com/en-us/download/details.aspx?id=49117 ，下载 Office Deployment Tool。

**第 2 步**：运行 officedeploymenttool.exe，解压到 `C:\ODT`。

**第 3 步**：创建配置文件 `C:\ODT\config.xml`：

```xml
<Configuration>
  <Add OfficeClientEdition="64-bit" Channel="PerpetualVL2024">
    <Product ID="ProPlus2024Volume" PIDKEY="">
      <Language ID="zh-cn"/>
      <ExcludeApp ID="OneDrive"/>
      <ExcludeApp ID="Teams"/>
    </Product>
  </Add>
</Configuration>
```

**第 4 步**：以管理员身份打开 cmd，执行：

```cmd
cd C:\ODT
setup.exe /download config.xml
setup.exe /configure config.xml
```

> `/download` 会下载约 3-4GB 的 Office 文件，需等待。`/configure` 开始安装。

安装完成后包含：Word、Excel、PowerPoint、Outlook、Publisher、Access。

### 向虚拟机传文件的备选方法

| 方法 | 适用场景 |
|------|----------|
| ISO 挂载 | 单个文件，`genisoimage` 制作 ISO 后 `virsh change-media` 挂载 |
| SPICE 拖拽 | 安装 spice-guest-tools 后可直接拖拽文件 |
| Samba 共享 | 需频繁传输文件，宿主机建 Samba 共享，虚拟机通过 `\\宿主机IP` 访问 |

> 注意：`virsh attach-disk` 不支持热插拔 cdrom 设备，必须用 `virsh change-media` 操作光驱。

## 踩坑记录

### 1. 权限问题

virt-manager 报错 `Failed to connect socket to '/var/run/libvirt/libvirt-sock': 权限不够`

**原因**：当前会话组未刷新（需要重新登录）
**解决**：用 `sg libvirt -c "命令"` 包裹所有 libvirt 相关命令

### 2. UEFI + UDF ISO 不兼容

OVMF (UEFI) 固件只能读取 ISO 9660 文件系统，但 Windows 11 ISO 实际是 UDF 格式。导致 UEFI 找不到启动文件。

**表现**：进入 UEFI Boot Manager 后选 CDROM 会闪退回 Boot Manager
**解决**：不使用 UEFI，改用 SeaBIOS（传统 BIOS），`--os-variant` 用 `win10` 而非 `win11`

### 3. virtio 磁盘不可见

Windows 安装程序没有 virtio 驱动，导致"选择安装位置"页面为空。

**解决**：创建虚拟机时磁盘总线用 `bus=sata` 而非 `bus=virtio`
**后续优化**：安装完系统后可以安装 virtio 驱动，然后改用 virtio 提升性能

### 4. virt-install 参数差异

Ubuntu 22.04 的 virt-install 4.0.0：
- `--noautoconsole`（正确）而非 `--no-autoconsole`
- `--boot firmware=efi` 而非 `--firmware /path/to/OVMF_CODE.fd`
- `--features` 中不支持 `kvm=on`

### 5. 光驱热插拔不支持

`virsh attach-disk win11 /path.iso hdb --type cdrom` 会报错 `cdrom/floppy device hotplug isn't supported`。

**解决**：用 `virsh change-media win11 sdb /path.iso` 代替。先通过 `virsh dumpxml win11 | grep cdrom` 确认光驱设备名（如 sdb）。

### 6. /tmp 重启后文件丢失导致虚拟机无法启动

虚拟机光驱指向 `/tmp/share.iso`，重启后 `/tmp` 被清空，启动报错：`Cannot access storage file '/tmp/share.iso': 没有那个文件或目录`。

**解决**：
```bash
# 导出 XML，清空光驱源文件，重新定义
sg libvirt -c "virsh dumpxml win11" > /tmp/win11.xml
sed -i "s|<source file='/tmp/share.iso'/>|<source file=''/>|" /tmp/win11.xml
sg libvirt -c "virsh define /tmp/win11.xml"
```

> 注意：不要把 ISO 放在 `/tmp` 目录，重启会丢失。需要持久挂载的 ISO 放到 `~/下载/` 或 `~/KVM/` 下。

### 7. 宿主机代理导致 SSL 错误

宿主机使用 HTTP 代理（端口 7890）时，wget 下载微软文件可能遇到 SSL 错误。

**解决**：加 `--no-proxy` 参数绕过代理直连。

## 常用管理命令

```bash
# 查看虚拟机列表
sg libvirt -c "virsh list --all"

# 启动虚拟机
sg libvirt -c "virsh start win11"

# 关闭虚拟机
sg libvirt -c "virsh destroy win11"    # 强制关机
sg libvirt -c "virsh shutdown win11"   # 正常关机

# 删除虚拟机
sg libvirt -c "virsh undefine win11 --keep-nvram"

# 查看 SPICE 连接地址
sg libvirt -c "virsh domdisplay win11"

# 挂载/卸载光驱 ISO
sg libvirt -c "virsh change-media win11 sdb /path/to/file.iso"   # 挂载
sg libvirt -c "virsh change-media win11 sdb --eject"             # 弹出

# 查看虚拟机 XML 配置（找光驱设备名等）
sg libvirt -c "virsh dumpxml win11" | grep -B2 -A5 "cdrom"
```

## 待完成

- [x] 完成 Windows 11 安装
- [ ] 在 Windows 虚拟机中安装 Microsoft Office（ODT 方式，待执行）
- [x] 安装 virtio 驱动（网卡已自动识别）
- [x] 安装 SPICE Guest Tools（剪贴板共享、拖拽、自适应分辨率）
- [ ] （可选）将磁盘总线从 sata 改为 virtio 提升性能

## 相关文件

- 虚拟磁盘：`~/KVM/images/win11.qcow2`
- Windows ISO：`~/下载/Win11_25H2_Pro_Chinese_Simplified_x64_v2.iso`
- virtio-win ISO：`~/下载/virtio-win.iso`（v0.1.285）
- SPICE Guest Tools：`~/下载/spice-guest-tools-latest.exe`

---
*创建日期：2026-05-26*
*最后更新：2026-05-26*
