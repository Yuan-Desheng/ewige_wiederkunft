---
createTime: 2026-11-24 16:45
笔记ID: "20261124164514"
multiFile:
multiMedia:
description: 在同一局域网用 Ubuntu 通过 WireGuard 连接 Mac 的 RustDesk，配置键鼠、双向剪贴板和 SFTP 文件传输。
笔记类型: 收集笔记
阐述日期:
tags:
  - Ubuntu
  - macOS
  - RustDesk
  - WireGuard
  - SFTP
aliases:
  - RustDesk 局域网远控
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Linux.canvas|Linux]]"
---

## Ubuntu 局域网远程控制 Mac

```meta-bind-embed
[[笔记抬头模块]]
```

> 在同一局域网从 Ubuntu 操作 Mac、复制代码和传输文件。两端使用 RustDesk 1.5.3，连接走点对点 WireGuard。实际地址、账号和凭证【已脱敏】。

### 日常使用

1. 在 Ubuntu 应用菜单打开 **RustDesk**，从「最近访问过」选择 Mac，或输入 `MAC_WG_IP:21118`。如果忘了 Mac 的隧道地址，可运行 `ip -4 route show dev wgmac-lan` 查看该连接的对端路由。
2. 输入在 Mac 端设置的 RustDesk 固定密码。也可以选择 **Request approval**，由 Mac 端点击 **Accept**。
3. 传几个文件可以用 RustDesk 的 **File Transfer**。需要独立传目录时，在 Ubuntu 文件管理器按 `Ctrl + L`，打开 `sftp://MAC_USER@MAC_WG_IP`，用 Mac 上获准远程登录的账号登录。常用目录可以加到侧栏书签。

`MAC_WG_IP` 和 `MAC_USER` 是占位符，使用时替换成实际的隧道地址和 Mac 用户名。

### 键鼠与剪贴板

- **Mac 系统权限**。在 **System Settings → Privacy & Security** 中，给 RustDesk 开启 **Accessibility** 和 **Screen & System Audio Recording**。前者用于键鼠控制，后者用于显示远端画面。找不到 RustDesk 时，在对应权限页添加 `/Applications/RustDesk.app`。如果系统提示退出并重新打开，按提示操作后再连。 [RustDesk macOS 权限指南](https://rustdesk.com/docs/en/client/mac/)
- **RustDesk 剪贴板权限**。在 Mac 的 RustDesk 中打开 **Settings → Security → Permissions**，确认 **Enable clipboard** 已开启。Ubuntu 远控窗口的 **Disable clipboard** 保持未勾选。先复制一段中文和多行代码，在另一端用 **Edit → Paste** 粘贴，再反向测试。单独验证图片剪贴板和文件复制粘贴，文件也可以通过 **File Transfer** 或 SFTP 传送。 [RustDesk 剪贴板和文件传输设置](https://rustdesk.com/docs/en/self-host/client-configuration/advanced-settings/)

### 配置复现

#### WireGuard 连接

Mac 监听局域网 UDP `51820`，Ubuntu 连接 Mac 的局域网地址。双方各生成一对密钥，只交换公钥。先选一对与现有网络不冲突的隧道地址，然后把下面的占位符替换成实际配置。使用 `/32` 只为对端安装路由。 [WireGuard 快速入门](https://www.wireguard.com/quickstart/)

Mac 的 `/etc/wireguard/wgmac-lan.conf` 由 root 管理，文件权限为 `0600`。

```ini
[Interface]
PrivateKey = MAC_PRIVATE_KEY
Address = MAC_WG_IP/32
ListenPort = 51820

[Peer]
PublicKey = UBUNTU_PUBLIC_KEY
AllowedIPs = UBUNTU_WG_IP/32
```

Ubuntu 的 NetworkManager 导入以下内容作为 `wgmac-lan.conf`。

```ini
[Interface]
PrivateKey = UBUNTU_PRIVATE_KEY
Address = UBUNTU_WG_IP/32

[Peer]
PublicKey = MAC_PUBLIC_KEY
AllowedIPs = MAC_WG_IP/32
Endpoint = MAC_LAN_IP:51820
PersistentKeepalive = 25
```

在 Apple Silicon Mac 上通过 Homebrew 安装 `wireguard-tools`。用 Homebrew 的 Bash 启动 `wg-quick`。需要开机启动时，用 launchd 执行同一条命令并把 `/opt/homebrew/bin` 加入服务的 `PATH`。若 Mac 的局域网 IP 变了，更新 Ubuntu 配置里的 `Endpoint`，也可在 DHCP 服务端为 Mac 保留地址。

```bash
brew install wireguard-tools
sudo env PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  /opt/homebrew/bin/bash /opt/homebrew/bin/wg-quick up /etc/wireguard/wgmac-lan.conf
```

在 Ubuntu 上导入并启用自动连接。导入后将含私钥的临时配置从日常工作目录移走。

```bash
nmcli connection import type wireguard file ./wgmac-lan.conf
nmcli connection modify wgmac-lan connection.autoconnect yes ipv4.never-default yes
nmcli connection up wgmac-lan
ip -4 route show dev wgmac-lan
```

#### RustDesk 和 SFTP

1. 在两端安装对应架构的 RustDesk 客户端。Mac 端授予本笔记列出的系统权限。 [RustDesk 官方安装包](https://github.com/rustdesk/rustdesk/releases/tag/1.5.3)
2. 在 Mac 端 **Settings → Security** 开启 **Enable direct IP access**，端口用 `21118`，在 **Use IP Whitelisting** 里只填 Ubuntu 的 WireGuard 地址。按需在 **Password** 处设置独立的 RustDesk 固定密码。直接 IP 模式由 WireGuard 提供传输加密，从 Ubuntu 连接 Mac 的隧道地址。 [RustDesk 直连设置](https://rustdesk.com/docs/en/self-host/client-configuration/advanced-settings/) · [RustDesk 维护者的加密说明](https://github.com/rustdesk/rustdesk/issues/3714)
3. 在 Mac 的 **System Settings → General → Sharing → Remote Login** 开启远程登录，把允许范围设为指定账号。Ubuntu 可以通过端口 `22` 使用 SSH 或 SFTP。 [Apple 远程登录指南](https://support.apple.com/guide/mac-help/allow-a-remote-computer-to-access-your-mac-mchlp1066/mac)

### 常见故障

| 现象 | 处理 |
| --- | --- |
| RustDesk 连不上 | 先运行 `nmcli connection up wgmac-lan`，再检查 `ip -4 route show dev wgmac-lan`。确认 Mac 开机、局域网 IP 和 WireGuard 端点一致。 |
| 能看到画面，但无法操作键鼠 | 在 Mac 的 **Accessibility** 开启 RustDesk，并确认本次会话允许键盘和鼠标。已可通过 ToDesk 或现场操作时，从那里进入 Mac 的系统设置。 |
| 两台电脑能操作，文字无法粘贴 | 排查 Mac 的 **Enable clipboard** 和 Ubuntu 会话的 **Disable clipboard**，双向分别测试。 |
| 最近记录出现两张相同设备卡片 | 同一个地址写成 `MAC_WG_IP` 或 `MAC_WG_IP:21118` 会留下两条记录。保留常用那条，从另一张卡片的 **⋮ → 删除** 清理重复记录。 |
| Mac 重启后远控不可用 | 分别检查 WireGuard 和 RustDesk。当前只配置了 WireGuard 开机启动，RustDesk 后台服务和整机重启后的远控待验收。 |

### 验收记录

- [x] WireGuard 隧道已连通，RustDesk 图形会话已打开。
- [x] Mac 补齐辅助功能授权后，键盘和鼠标可用。
- [x] RustDesk 固定密码已保存，SFTP 上传和下载已往返比对。
- [ ] 分别验证两个方向的文字剪贴板，以及 RustDesk 自带的文件传输。
- [ ] 验证公网断开时能新建连接，以及 Mac 锁屏和重启后的重连。

### 新增 Windows 和 Ubuntu 受控端

主控端为每台受控机使用独立的 WireGuard 连接。RustDesk 的直连白名单只填主控端在对应隧道上的地址。在 Ubuntu 主控端用下面的命令查对端路由，然后在 RustDesk 输入对应的隧道地址和端口 `21118`。

```bash
ip -4 route show dev wgwin-lan
ip -4 route show dev wgubu-lan
```

| 受控机 | 主控端配置 | 受控端服务和首次连接 |
| --- | --- | --- |
| Windows 11 | `wgwin-lan` | WireGuard 隧道服务和 RustDesk 服务均配置自动启动。首次用受控端的一次性密码，或在 Windows 接受连接请求。 |
| Ubuntu 24.04 | `wgubu-lan` | `wg-quick@wgubu-lan.service` 和 `rustdesk.service` 均配置自动启动。Wayland 首次连接时，在受控端接受请求，再在系统共享提示里选择屏幕。 |

两台新增设备均已验证主控端能通过各自的隧道连接 RustDesk 端口。画面、键鼠、剪贴板和重启后重连需分别验收。 [WireGuard Windows 服务文档](https://git.zx2c4.com/wireguard-windows/about/docs/enterprise.md) · [RustDesk Linux 与 Wayland 说明](https://rustdesk.com/docs/en/client/linux/)
