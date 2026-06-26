---
createTime: 2026-06-26 10:30
笔记ID: 20260626103035
multiFile:
multiMedia:
description: 运维小组与多云（火山/华为/阿里）服务器统一管理方案：现状风险（弱密码复用/root直连/宝塔公网暴露）→ 开源自托管栈（资产台账+Ansible/Semaphore+1Panel+Uptime Kuma+Prometheus/Loki+JumpServer+Vaultwarden）→ 安全整改 P0/P1/P2 → 只读运维智能体 → 分阶段路线图。
笔记类型: 收集笔记
阐述日期:
tags:
  - 运维
  - DevOps
  - 多云
  - 监控告警
  - 安全基线
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/DevOps.canvas|DevOps]]"
---

##  Engineering
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="25" max="100" style="width: 100%;"></progress>

> 本篇是「运维小组 + 多云服务器统一管理」的可行性方案（2026-06-26 整理，含联网调研）。
> ⚠️ **安全**：本仓库推送到公开 GitHub。原始资料里的明文密码、宝塔安全入口、手机号、云账号 ID **一律不入库**，下方以 `【已脱敏】` 记录；完整 IP 与凭据只进**私有密码管理器（Vaultwarden）+ 私有资产台账（NocoDB）**。

---

## 待办

> [!danger] P0 · 安全止血（本周内必须做完）
> - [ ] 全部服务器 root/登录密码改为**强随机且每台唯一**（杜绝当前那种弱口令跨机跨云复用）
> - [ ] 部署 **Vaultwarden**，唯一强口令统一入库；从此不在任何文档/聊天里贴明文
> - [ ] SSH 改**密钥登录 + 禁用密码**（`PasswordAuthentication no`），先验证密钥可登录再关
> - [ ] **禁用 root 直接 SSH**（`PermitRootLogin no`），改普通用户 + sudo
> - [ ] **宝塔面板从公网收敛**：改高位端口 + 限可信 IP + 开 2FA + 强制 HTTPS
> - [ ] 火山/阿里/华为**主账号开启 MFA**，停止用主账号做日常运维

> [!todo] P1 · 一周内（加固 + 账号体系 + 第一道监控）
> - [ ] 各云安全组**最小开放**，SSH 仅放行可信 IP；主机内 `ufw`/`nftables` 双层
> - [ ] 每台装 **fail2ban**（SSH 暴破封禁）
> - [ ] 上 **Uptime Kuma**（拨测：分销小程序后端/官网/各 API/端口/证书到期 → 钉钉/飞书/企微告警）
> - [ ] 建**资产台账**（哪台机器跑哪个项目/负责人/用途），先用 NocoDB 或本库一张表
> - [ ] 多云建 **RAM/IAM 子账号**最小权限替代主账号，子账号强制 MFA，开启操作审计

> [!note] P2 · 一月内（统一运维能力 + 纵深防御）
> - [ ] **Ansible + Semaphore UI** 跨云批量装/查/改（同一套 playbook 管三朵云）
> - [ ] 每台装 **1Panel 社区版** 或 **Cockpit**（单机管理）
> - [ ] 指标监控 **Netdata**（最轻）或 **Prometheus + Grafana + node_exporter**
> - [ ] 日志聚合 **Loki + Grafana Alloy**（出故障翻日志定根因）
> - [ ] 告警统一收口（**PrometheusAlert** 汇钉钉/飞书/企微）
> - [ ] 按需上 **JumpServer**（统一入口 + 操作审计/录屏 + 离职回收）
> - [ ] 系统自动安全更新；云上用 **STS/RAM 角色** 替代明文 AccessKey
> - [ ] 起步级**只读运维智能体**（见下文）+ 沉淀 runbook 到本知识库

---

## 资料

### 服务器清单（脱敏版；完整信息在私有台账/密码管理器）

> 原始资料含明文凭据，已全部脱敏。IP 仅保留厂商网段、末位打码。

| # | 云厂商 | 用途 / 项目 | 公网 IP（脱敏） | 登录方式 | 凭据 | 备注 |
|---|---|---|---|---|---|---|
| 1 | 阿里云 | 机智视达（宝塔面板机） | `39.106.45.**` | 宝塔面板 8888 / user | 【已脱敏】 | 宝塔安全入口【已脱敏】，**当前暴露公网，待收敛** |
| 2 | 火山引擎 | 机智视达 | `115.190.175.**` | 子账号 `yuandesheng` | 【已脱敏】 | 主账号手机/ID【已脱敏】 |
| 3 | 火山引擎 | 机智视达 2 | `115.190.233.**` | root（SSH） | 【已脱敏】 | 账号【已脱敏】，**root 直连待整改** |
| 4 | 阿里云 | 机智视达官网（`jizhishida-portal`，https://www.jizhishida.com/ ） | `47.94.147.**` | root（SSH） | 【已脱敏】 | 站点目录 `/www/wwwroot/jizhishida-portal/`，**root 直连待整改** |
| — | 华为云 | （规划保留，暂无在册机器） | — | — | — | 需求要求多平台，待补充 |

### 现状风险速判（来自上表的安全问题）

- **一破全破**：多台用弱密码（字典词 + 常见变形），且**同一口令跨机跨云复用**——任一台被爆破即可能拿下全部 root。这是当前**最高危**项（→ P0）。
- **root 直连 + 密码登录**：#3 #4 直接 root + 密码 SSH，暴露面大（→ P0）。
- **宝塔公网暴露**：#1 面板 8888 + 安全入口暴露公网，面板历来是高危入口（→ P0）。
- **主账号明文 + 无 MFA**：火山主账号手机/ID 以明文流转，主账号直接用于运维（→ P0/P1）。

---

## 笔记

### 一、原始需求拆解（→ 6 条工作线）

| 原话 | 拆解为 | 对应方案 |
|---|---|---|
| 需要一个运维小组 | 角色与职责、值班、变更/上线规范 | 规范先行（§三·0） |
| 服务器统一规划、统一管理 | 统一登录、批量运维、单机面板 | Ansible+Semaphore / 1Panel（§三） |
| 交付项目纳入运维体系 | 资产台账：哪台跑哪个项目/负责人 | NocoDB 资产表（§三） |
| 分销小程序挂了能很快排查 | 拨测告警 + 指标 + 日志三层 | Uptime Kuma → Prometheus/Netdata → Loki（§三·监控） |
| 搞个运维智能体 / 或用 hermes | LLM 只读排障助手 + runbook | §五 |
| 已有火山/华为/阿里，保持多平台 | 多云统一**规范**而非一个大平台 | §三·多云结论 |

### 二、核心判断

> **5 台机、几个人、三朵云 —— 不要追求"一个系统管所有云"。**

阿里/华为/火山的控制台、API、计费、网络模型各不相同，开源的多云管理大平台（CMP）对小团队是**维护负担 > 收益**。真正能跨云统一的是**服务器层面的操作**（登录、批量执行、监控），不是云资源编排。结论：**统一规范 + 轻量工具组合**，全部可自托管、对 5 台机无负担。

### 三、推荐技术栈（开源 / 自托管 / 轻量）

**0. 规范先行（零成本，最重要）**
统一 SSH 公钥登录、禁密码、各云安全组只放必要端口；一张资产台账记清"机器 ↔ 项目 ↔ 负责人 ↔ 用途"。工具都是放大器，规范是地基。

**1. 资产台账（CMDB）—— NocoDB**
小团队记"哪台跑哪个项目"最轻量就是 **NocoDB**（把数据库变 Airtable 式表格，自托管，几分钟搭好），或先用本知识库一张 Markdown 表起步。资产多到要条码盘点再上 Snipe-IT。iTop/NetBox 对 5 台机属过度工程。

**2. 批量运维（跨云统一的真正落地层）—— Ansible + Semaphore UI**
Ansible **无需被控端装 agent**、纯 SSH、剧本化；Semaphore 是单个 Go 二进制 + SQLite，几分钟装好，给可视化/定时/RBAC。一套 playbook 管三朵云。**不建议**为 5 台上 AWX（要 K8s 且开发暂停）或 SaltStack（偏大规模）。

**3. 单机面板 —— 1Panel 社区版 / Cockpit**
- **1Panel**：Go + 容器化现代面板，GPLv3 全开源、不绑手机号、内存省、UI 现代；适合要 Docker/建站。注意**多机节点管理是专业版付费**，社区版偏单机（5 台各装一套分别登录）。
- **Cockpit**：Red Hat 出品，随系统自带、零额外架构、可从一台 SSH 连多台，只做系统级管理（不做应用商店那套）。
- 宝塔：功能全、中文生态好，但仅部分开源、需绑手机号、历史安全争议多——**逐步用 1Panel 替代，存量宝塔按 P0 收敛**。

**4. 监控告警日志（三层，对应"挂了能很快排查"）**

| 层 | 解决 | 选型 | 何时上 |
|---|---|---|---|
| **L0 拨测/存活** | "挂了第一时间知道" | **Uptime Kuma**（HTTP/端口/关键字/证书到期，被监控端**免装 agent**） | 今天 |
| **L1 指标** | CPU/内存/磁盘趋势、容量预警 | **Netdata**（最轻，一行装）或 **Prometheus+Grafana+node_exporter**（可扩展、与 Loki 共用 Grafana） | 第二步 |
| **L2 日志** | 出问题翻日志定根因 | **Loki + Grafana Alloy**（比 ELK 轻得多；⚠️ Promtail 已 EOL，新项目直接用 **Alloy**） | 第三步 |

- **关键字监控**很重要：很多"假活"（进程在、接口返 500/空）只有关键字/JSON 断言能发现——分销小程序这种最该配。
- **Uptime Kuma 自己也要被监控**（放非业务机，或外部免费拨测反向盯）。
- **告警通道**：Uptime Kuma 内置钉钉/企微、飞书走自定义机器人 Webhook；Prometheus 侧用 **PrometheusAlert** 统一转发钉钉/飞书/企微。
- **跨云抓取**：exporter/Loki 端口**别裸暴公网**，走内网/VPC 或 WireGuard 隧道，否则安全组只放行中心机 IP。

**5. 堡垒机（按需）—— JumpServer 社区版**
5 台机几个人，纯技术必要性不强（SSH 密钥 + 禁密码 + 安全组白名单已够）。但若要**集中收口入口 / 操作审计录屏 / 离职统一回收权限**，首选 JumpServer 社区版（全开源、中文）。Teleport 技术先进但 v16 后社区版有商业许可门槛，谨慎。

**6. 密码管理 —— Vaultwarden**
小团队首选 **Vaultwarden**（Bitwarden 协议 Rust 重写，<50MB 内存，Docker 5 分钟起，用官方 Bitwarden 客户端）。纯离线可 KeePassXC；要 SSO/RBAC 用官方 Bitwarden 或 Passbolt。

> **推荐组合一句话**：统一规范 +（Ansible+Semaphore 批量）+（1Panel/Cockpit 单机）+ 一张 NocoDB 资产表 + Uptime Kuma→Prometheus/Loki 三层监控 + Vaultwarden 存密码，按需补 JumpServer。

### 四、安全整改 Checklist

按 P0/P1/P2 已列入上方「待办」。要点重述：**先断"一破全破"链条**（唯一强口令 + 密码管理器 + 密钥登录 + 禁 root + 收敛宝塔 + 主账号 MFA），再做主机加固（安全组最小化 + fail2ban + 面板挪内网/堡垒机后）与账号体系（RAM/IAM 最小权限 + 子账号 MFA + 操作审计），最后纵深防御（自动补丁 + STS 临时凭据替代明文 AK + 定期轮换/离职回收）。

### 五、运维智能体（务实路线）

**现实边界**：把能跑 shell 的 LLM agent（Claude Code / 类 Hermes）用于运维，本质是"挂了语言模型的脚本"——会幻觉根因和命令，**只适合"出假设 + 给建议"，不适合无人值守自动改生产**。

**第一步只让它做（只读排障助手 + 知识库）**：
- 以 **plan / 只读模式** 运行，命令走**白名单**（`systemctl status *`、`journalctl *`、`grep 日志`、`kubectl get/describe *` 这类只读子命令），危险命令默认拒绝或需人工审批。
- 用**专用低权限账号**接入，密钥不放进 agent 可见目录，生产场景容器隔离，**全量审计**每条命令。
- 让它读日志/查状态、给"根因假设 + 建议命令"，**由人按回车**执行。
- **runbook 知识库**：本 Obsidian vault 天然就是——把历史故障与排障步骤沉淀成 runbook（参考本库[[ECharts 图表踩坑合集]]那种"现象→原因→解决"的复现篇格式），让 agent 检索后给建议。

**别干**：别给 root/生产写权限、别无人值守自动重启/删除/改配置、别裸跑（不挂权限/不隔离/不审计）、别盲信置信度。

**可选增强**：上 K8s 后可加 **K8sGPT**（规则扫描 + LLM 翻译成人话，零执行风险）做首线体检；要完整根因调查再看 **HolmesGPT**（CNCF Sandbox，接 Prometheus/Grafana/Loki 的 agentic 调查）。

### 六、分阶段路线图

- **阶段 0 · 安全止血（本周）**：完成 P0 全部 + 上 Uptime Kuma + 建资产台账初版。**先保命，再谈体系。**
- **阶段 1 · 打底（2-4 周）**：Ansible+Semaphore + 每台 1Panel/Cockpit + Netdata/Prometheus + Vaultwarden 全员用 + 完成 P1。
- **阶段 2 · 成体系（1-3 月）**：Loki+Alloy 日志 + 告警统一收口 + 按需 JumpServer + 起步级只读运维 agent + 完成 P2。华为云若上线，按同规范纳管。
- **阶段 3 · 长效（持续）**：runbook 持续沉淀、故障演练、定期巡检与凭据轮换、季度安全复查。

### 七、工具选型速查

| 能力 | 首选（小团队） | 备选 | 不建议 |
|---|---|---|---|
| 资产台账 | NocoDB / 本库表 | Snipe-IT | iTop / NetBox |
| 批量运维 | Ansible + Semaphore | — | AWX（要 K8s）/ SaltStack |
| 单机面板 | 1Panel 社区版 / Cockpit | — | 宝塔（逐步替代） |
| 拨测告警 | Uptime Kuma | — | — |
| 指标 | Netdata | Prometheus+Grafana | Zabbix（过重） |
| 日志 | Loki + Alloy | — | ELK（过重）/ Promtail（已EOL） |
| 告警转发 | PrometheusAlert | webhook-dingtalk | — |
| 堡垒机 | JumpServer 社区版（按需） | Teleport（许可注意） | — |
| 密码管理 | Vaultwarden | Bitwarden/Passbolt/KeePassXC | 文档/聊天明文 |
| 运维 agent | Claude Code/Hermes 只读 + runbook | K8sGPT / HolmesGPT | 无人值守写生产 |

### 八、参考链接

**面板 / 批量 / 资产**
- 1Panel：https://github.com/1Panel-dev/1Panel ｜ 节点管理（专业版）https://1panel.cn/docs/v2/user_manual/xpack/node/
- Cockpit：https://cockpit-project.org/ ｜ 多机 https://cockpit-project.org/guide/latest/feature-machines.html
- Ansible：https://www.ansible.com/ ｜ Semaphore UI：https://semaphoreui.com/ （AWX 对比 https://semaphoreui.com/blog/awx-vs-semaphore ）
- JumpServer：https://github.com/jumpserver/jumpserver ｜ Teleport v16 许可变更 https://goteleport.com/blog/teleport-community-license/
- NocoDB：https://github.com/nocodb/nocodb ｜ Snipe-IT：https://github.com/snipe/snipe-it

**监控 / 告警 / 日志**
- Uptime Kuma：https://uptimekuma.org/ ｜ 证书到期监控 https://devopsdaily.eu/articles/2025/monitoring-tls-certificates-with-uptime-kuma/
- Netdata vs Prometheus：https://www.netdata.cloud/netdata-vs-prometheus/
- 自托管监控对比 2026：https://blog.canadianwebhosting.com/self-hosted-monitoring-comparison-2026/
- Loki vs ELK：https://www.wallarm.com/cloud-native-products-101/grafana-loki-vs-elk-logging-stacks ｜ Promtail→Alloy 迁移 https://grafana.com/docs/alloy/latest/set-up/migrate/from-promtail/
- PrometheusAlert（钉钉/飞书/企微）：https://github.com/feiyu563/PrometheusAlert ｜ webhook-dingtalk https://github.com/timonwong/prometheus-webhook-dingtalk

**运维智能体 / 安全**
- HolmesGPT（CNCF）：https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/ ｜ AI SRE 工具清单 https://github.com/agamm/awesome-ai-sre
- Claude Code 权限/护栏：https://www.claudedirectory.org/blog/claude-code-permissions-guide ｜ Hermes 安全 https://hermes-agent.nousresearch.com/docs/user-guide/security
- SSH 加固：https://www.digitalocean.com/community/tutorials/hardening-ssh-fail2ban ｜ 宝塔安全加固 https://docs.bt.cn/practical-tutorials/security-hardening
- 自托管密码管理器：https://kubedo.com/blog-best-self-hosted-password-managers-2025/
- 阿里云 RAM 最佳实践：https://help.aliyun.com/zh/ram/use-cases/ensure-security-of-alibaba-cloud-resources ｜ 仅 MFA 用户可访问 https://help.aliyun.com/zh/ram/use-cases/allow-only-mfa-enabled-ram-users-to-access-cloud-resources

## 提示词
```
原始需求
我们需要一个运维小组
以后服务器要统一规划，统一管理
现在交付的项目都要纳入运维体系
想想弄个什么开源系统（或者自己搭建）
大家把服务器整理起来，比如分销小程序真不能用了，我们能很快排查
可以搞一个运维智能体（或者直接用hermes）
已知的服务器目前咱们有火山、华为、阿里。 规划上保持多平台
```
