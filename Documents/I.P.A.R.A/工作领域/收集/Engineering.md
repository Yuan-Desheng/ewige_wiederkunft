---
createTime: 2026-06-26 10:30
笔记ID: 20260626103035
multiFile:
multiMedia:
description: 运维小组与多云（火山/华为/阿里）服务器统一管理方案。初期主张「飞书在线文档/多维表格 + Hermes 智能体 + 一个巡检脚本」极简起步，重工具（Ansible/1Panel/Prometheus/Loki/JumpServer）降级为阶段2+按需扩展；含现状风险、安全整改 P0/P1/P2、巡检脚本与 Hermes 只读护栏。
笔记类型: 收集笔记
阐述日期:
tags:
  - 运维
  - DevOps
  - 多云
  - 飞书
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
> **初期主张：别堆工具。用「飞书文档/多维表格 + Hermes 智能体 + 一个巡检脚本」起步（见 §三）；Ansible/1Panel/Prometheus/Loki/JumpServer 等重工具降级为阶段 2+ 按需扩展（§四）。**
> ⚠️ **安全**：本仓库推送到公开 GitHub。原始资料里的明文密码、宝塔安全入口、手机号、云账号 ID **一律不入库**，下方以 `【已脱敏】` 记录；完整 IP 与凭据只进**私有密码管理器 / 受限飞书表**。

---

## 待办

> [!success] 初期方案搭建（飞书 + Hermes，与安全 P0 并行，详见 §三）
> - [ ] 建飞书运维空间：多维表格（服务器资产 / 项目映射 / 故障记录）+ 文档库（规范 / runbook）+ 值班排期
> - [ ] 配飞书**自定义机器人**，拿到群 Webhook（告警/巡检结果的统一落点）
> - [ ] 部署巡检脚本 `ops-probe.sh`（cron 每 3 分钟），把分销小程序后端 / 官网 / 关键端口加进去
> - [ ] 配 **Hermes 只读运维账号 + 命令白名单 + 审计**，跑通「飞书报红 → Hermes 排障 → 回飞书」
> - [ ] 沉淀第一条 runbook（以分销小程序为例）

> [!danger] P0 · 安全止血（本周内必须做完）
> - [ ] 全部服务器 root/登录密码改为**强随机且每台唯一**（杜绝当前那种弱口令跨机跨云复用）
> - [ ] 部署 **Vaultwarden**（或先用受限飞书表过渡），唯一强口令统一入库；从此不在任何文档/聊天里贴明文
> - [ ] SSH 改**密钥登录 + 禁用密码**（`PasswordAuthentication no`），先验证密钥可登录再关
> - [ ] **禁用 root 直接 SSH**（`PermitRootLogin no`），改普通用户 + sudo
> - [ ] **宝塔面板从公网收敛**：改高位端口 + 限可信 IP + 开 2FA + 强制 HTTPS
> - [ ] 火山/阿里/华为**主账号开启 MFA**，停止用主账号做日常运维

> [!todo] P1 · 一周内（加固 + 账号体系）
> - [ ] 各云安全组**最小开放**，SSH 仅放行可信 IP；主机内 `ufw`/`nftables` 双层
> - [ ] 每台装 **fail2ban**（SSH 暴破封禁）
> - [ ] 多云建 **RAM/IAM 子账号**最小权限替代主账号，子账号强制 MFA，开启操作审计

> [!note] P2 · 一月内 / 飞书+脚本扛不住再上（→ §四）
> - [ ] 拨测升级为 **Uptime Kuma**（要历史曲线/证书到期/状态页时）
> - [ ] **Ansible + Semaphore** 批量运维；每台 **1Panel/Cockpit** 单机面板
> - [ ] 指标 **Netdata / Prometheus+Grafana**；日志 **Loki + Alloy**；告警统一 **PrometheusAlert**
> - [ ] 按需 **JumpServer**（统一入口 + 审计录屏 + 离职回收）
> - [ ] 系统自动安全更新；云上用 **STS/RAM 角色** 替代明文 AccessKey

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

| 原话 | 拆解为 | 初期怎么做（§三） |
|---|---|---|
| 需要一个运维小组 | 角色与职责、值班、变更/上线规范 | 飞书文档 + 排班表 |
| 服务器统一规划、统一管理 | 统一登录、批量运维、单机面板 | 先统一规范；批量/面板放阶段 2+（§四） |
| 交付项目纳入运维体系 | 资产台账：哪台跑哪个项目/负责人 | 飞书**多维表格**（现成 CMDB） |
| 分销小程序挂了能很快排查 | 拨测告警（检测）+ 排障（诊断） | 巡检脚本 → 飞书告警；Hermes 诊断 |
| 搞个运维智能体 / 或用 hermes | LLM 只读排障助手 + runbook | Hermes 只读 + 飞书 runbook 库 |
| 已有火山/华为/阿里，保持多平台 | 多云统一**规范**而非一个大平台 | 台账标厂商；Hermes 跨云 SSH |

### 二、核心判断

> **5 台机、几个人、三朵云——别追求"一个系统管所有云"，更别一上来堆一长串工具。**

阿里/华为/火山的控制台、API、网络模型各不相同，开源多云大平台（CMP）对小团队是**维护负担 > 收益**。真正能跨云统一的是**服务器层面的操作**（登录、巡检、排障），不是云资源编排。

**初期落地的最优解 = 飞书（文档/多维表格 + 机器人）+ Hermes（只读排障）+ 一个巡检脚本**。它覆盖了"资产台账 / 规范 / runbook / 告警通道 / 排障"五件事，几乎零额外平台；唯一需要补的是"持续探活"（一个 cron 脚本即可）。重工具等飞书 + 脚本**真的扛不住了再上**（§四给了升级触发条件）。

### 三、★ 初期极简方案（飞书 + Hermes）—— 先做这个

#### 3.1 架构

```
飞书多维表格  →  服务器资产台账（厂商/IP指针/项目/负责人/凭据位置） + 项目映射 + 故障记录 + 排班
飞书文档库    →  运维规范 + runbook（排障手册）
飞书机器人    →  告警 / 巡检结果 / Hermes 报告 的统一群通知（Webhook）
ops-probe.sh  →  cron 每几分钟探活关键服务，挂了/恢复推飞书   ← 唯一的“检测”
Hermes        →  飞书报红后按需/定时排障：只读 SSH 读日志、查状态、对照 runbook 出建议
密码管理器    →  真实凭据（Vaultwarden；或受限飞书表过渡）
```

分工记忆：**脚本负责"知道挂了"，Hermes 负责"为什么挂了/怎么修"，飞书负责"记录 + 通知 + 知识库"。**

#### 3.2 需求 → 工具 映射

| 需求 | 谁来做 | 够不够 |
|---|---|---|
| 运维小组/规范/值班 | 飞书文档 + 多维表格排班 | ✅ |
| 服务器台账（哪台跑哪个项目） | 飞书多维表格（替代 NocoDB） | ✅ |
| runbook / 故障记录 | 飞书文档库 + Hermes 检索 | ✅ |
| 「挂了第一时间知道」（检测） | `ops-probe.sh` + 飞书机器人 | ✅ |
| 「挂了很快排查」（诊断） | Hermes 只读 SSH + runbook | ✅（强项） |
| 多云保持 | 台账标厂商 + Hermes 跨云 SSH | ✅ |

> 诚实缺口：飞书不会主动探活，Hermes 也不适合当 7×24 探针（LLM 按分钟轮询又慢又贵又不稳）。所以**检测交给下面这个十几行的脚本**，Hermes 只在"红了"之后去诊断。

#### 3.3 巡检脚本 `ops-probe.sh`（检测，唯一要写的代码）

放一台**非业务、常开**的机器，`crontab -e` 加：`*/3 * * * * /opt/ops/ops-probe.sh >> /var/log/ops-probe.log 2>&1`

```bash
#!/usr/bin/env bash
# ops-probe.sh —— 极简巡检：探活关键服务，状态变化时推送飞书机器人
# 只在“可用↔不可用”状态翻转时告警（含恢复通知），避免每轮刷屏
set -uo pipefail

FEISHU_WEBHOOK="【已脱敏-飞书自定义机器人 webhook】"
STATE_DIR="/var/tmp/ops-probe"; mkdir -p "$STATE_DIR"

# 监控目标：名称|类型(http/tcp)|目标|关键字(http 可选：校验响应体是否含此串；空=只看状态码)
TARGETS=(
  "分销小程序后端|http|https://api.你的域名.com/health|ok"
  "机智视达官网|http|https://www.jizhishida.com/|"
  "核心数据库|tcp|10.0.0.5:3306|"
)

notify() { # $1=emoji $2=标题 $3=详情
  local text
  printf -v text '%s %s\n%s\n时间：%s' "$1" "$2" "$3" "$(date '+%F %T')"
  curl -s -m 10 -X POST "$FEISHU_WEBHOOK" -H 'Content-Type: application/json' \
    --data "$(printf '{"msg_type":"text","content":{"text":%s}}' "$(printf '%s' "$text" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')")" >/dev/null
}

check_http() { # url, keyword
  local out code
  out=$(curl -sS -m 10 -w $'\n%{http_code}' "$1" 2>&1) || return 1
  code=${out##*$'\n'}; [[ $code =~ ^(2|3) ]] || return 1
  [[ -z $2 ]] || grep -q -- "$2" <<<"$out"
}
check_tcp() { # host:port
  local h=${1%:*} p=${1##*:}
  timeout 5 bash -c "exec 3<>/dev/tcp/$h/$p" 2>/dev/null
}

for t in "${TARGETS[@]}"; do
  IFS='|' read -r name typ target kw <<<"$t"
  flag="$STATE_DIR/$(printf '%s' "$name" | md5sum | cut -c1-8).down"
  if [[ $typ == http ]]; then check_http "$target" "$kw"; else check_tcp "$target"; fi
  if [[ $? -eq 0 ]]; then
    [[ -f $flag ]] && { notify "✅" "$name 已恢复" "$target"; rm -f "$flag"; }
  else
    [[ -f $flag ]] || { notify "🔴" "$name 不可用" "$target"; : > "$flag"; }
  fi
done
```

要点：① `TARGETS` 一行加一个监控项；② **关键字校验**能识破"假活"（进程在、接口返 500/空）；③ 状态文件做去抖，只在翻转时通知 + 自动报恢复；④ 这台巡检机自己也要被盯（用第二台 cron 互探，或外部免费拨测）。

#### 3.4 Hermes 只读护栏（诊断）

让 Hermes 接运维，**第一阶段只读**，护栏分层叠加（详见 §六）：

- **专用低权限账号**：每台建 `ops-readonly`（无 sudo / 不属 wheel；为读日志可加入 `adm`、`systemd-journal` 组），密钥单独管理，**绝不用 root**。
- **命令白名单（默认拒绝）**——只放只读：
  - 允许：`systemctl status/list-units *`、`journalctl *`、`tail/less/grep` 日志、`df`/`free`/`top`/`ss`/`ps`、`docker ps`/`docker logs`、`curl http://127.0.0.1:*/health`、`nginx -t`。
  - 拒绝：`rm`/`mv`/重定向写、`systemctl restart|stop`、`kill`、`reboot`、`apt`/`yum`、`git push`、任何 `sudo`。
- **全量审计**：记录 Hermes 跑过的每条命令；写操作（重启/改配置/删除）一律**人工确认后再由人执行**，不给 agent。
- **闭环用法**：飞书报红 → 触发 Hermes 用 `ops-readonly` 上对应机器，读日志/查状态 → 对照飞书 runbook → 把「根因假设 + 建议命令」发回飞书群 → 人确认后处置 → 故障记录回填多维表格、补 runbook。

#### 3.5 飞书多维表格字段建议

- **服务器资产**：主机名 / 云厂商(单选) / 公网IP / 内网IP / 用途项目 / 负责人 / 系统 / 配置 / 登录方式 / **凭据位置**(指向密码库条目，**不存明文**) / 监控状态 / 到期日 / 备注。
- **项目映射**：项目 / 所在主机 / 域名 / 健康检查URL（喂给 `ops-probe.sh`）/ 负责人。
- **故障记录**：时间 / 影响项目 / 现象 / 根因 / 处理 / runbook链接（Hermes 排障后回填，越攒越值钱）。

#### 3.6 密码红线

**真实口令不要存进飞书普通文档**。台账只记"谁负责 / 在哪个密码库"这种**指针**；真实密码进 Vaultwarden（一个容器）。若初期就想省到底，至少把存密码的飞书表设成**单独受限、不给全员**——但这只是过渡，不是终态。

### 四、进阶技术栈（阶段 2+：飞书 + 脚本扛不住再上）

> 下列工具初期**都不用上**。每条给出"什么时候才需要"。全部开源、可自托管、轻量。

- **拨测升级 → Uptime Kuma**：当你想要历史可用率曲线、证书/域名到期提醒、对外状态页时，把 `ops-probe.sh` 换成它（一个容器，被监控端免装 agent）。
- **批量运维 → Ansible + Semaphore UI**：当"挨个 SSH 装/查/改"开始累人（机器变多、要批量打补丁/改配置）时上。Ansible 无 agent 纯 SSH，Semaphore 单二进制给可视化/定时/权限。
- **单机面板 → 1Panel 社区版 / Cockpit**：要可视化管 Docker/网站/计划任务时，每台装一个；**逐步替代宝塔**（宝塔仅部分开源、需绑手机号、历史安全争议多）。
- **指标监控 → Netdata（最轻）/ Prometheus+Grafana**：当需要看 CPU/内存/磁盘趋势、容量预警、定位"为什么变慢"时。Netdata 一行装即用；P+G 可扩展且与下面 Loki 共用 Grafana。
- **日志聚合 → Loki + Grafana Alloy**：当排障需要跨机集中翻日志时（比 ELK 轻得多；⚠️ Promtail 已 EOL，直接用 Alloy）。
- **告警统一 → PrometheusAlert**：上了 Prometheus 后，把指标告警也汇到钉钉/飞书/企微，与脚本/Kuma 告警合流。
- **堡垒机 → JumpServer 社区版**：当要集中收口入口、操作审计录屏、人员离职统一回收权限时（否则 SSH 密钥 + 安全组白名单已够）。
- **多云大平台（CMP）**：**不建议**。需要可复现建云资源时用 Terraform/OpenTofu 即可，别追求"一个系统管所有云"。

### 五、安全整改 Checklist

按 P0/P1/P2 见上方「待办」。要点：**先断"一破全破"链条**（唯一强口令 + 密码管理器 + 密钥登录 + 禁 root + 收敛宝塔 + 主账号 MFA），再做主机加固（安全组最小化 + fail2ban + 面板挪内网/堡垒机后）与账号体系（RAM/IAM 最小权限 + 子账号 MFA + 操作审计），最后纵深防御（自动补丁 + STS 临时凭据替代明文 AK + 定期轮换/离职回收）。**安全与工具选型无关，无论初期用不用飞书都要做。**

### 六、运维智能体（务实路线）

**现实边界**：能跑 shell 的 LLM agent（Claude Code / Hermes）会幻觉根因和命令，**只适合"出假设 + 给建议"，不适合无人值守自动改生产**。

**第一步只做只读排障助手 + runbook**（护栏配置见 §3.4）：plan/只读模式、命令白名单、专用低权限账号、密钥隔离、全量审计；让它读日志/查状态给"根因假设 + 建议命令"，**由人按回车**。runbook 知识库直接用飞书文档库（或本 Obsidian 库，参考[[ECharts 图表踩坑合集]]那种"现象→原因→解决"格式）。

**别干**：别给 root/生产写权限、别无人值守自动重启/删除/改配置、别裸跑（不挂权限/不隔离/不审计）、别盲信置信度。

**可选增强（阶段 2+）**：上 K8s 后加 **K8sGPT**（规则扫描 + LLM 翻译，零执行风险）；要完整根因调查再看 **HolmesGPT**（CNCF Sandbox，接 Prometheus/Grafana/Loki 的 agentic 调查）。

### 七、分阶段路线图

- **阶段 0 · 安全止血 + 极简起步（本周）**：完成 P0 全部；建飞书运维空间（台账/runbook/排班）+ 配机器人 + 上 `ops-probe.sh` + 配 Hermes 只读护栏。**先保命 + 先能"知道挂了、查得动"。**
- **阶段 1 · 跑顺（2-4 周）**：完成 P1；台账填全、runbook 攒起来、巡检覆盖所有交付项目、Hermes 排障闭环固化、密码全进 Vaultwarden。
- **阶段 2 · 按需扩展（1-3 月，§四）**：飞书+脚本扛不住的那一项先上（多半是拨测→Uptime Kuma 或批量→Ansible），逐步补监控/日志/面板/堡垒机；完成 P2。华为云上线按同规范纳管。
- **阶段 3 · 长效（持续）**：runbook 持续沉淀、故障演练、定期巡检与凭据轮换、季度安全复查。

### 八、工具选型速查

| 能力 | 初期（推荐） | 阶段 2+ 扩展 | 不建议 |
|---|---|---|---|
| 资产台账 | 飞书多维表格 | NocoDB / Snipe-IT | iTop / NetBox |
| 知识库/runbook | 飞书文档 / 本库 | — | — |
| 检测拨测 | `ops-probe.sh` + 飞书机器人 | Uptime Kuma | — |
| 排障诊断 | Hermes 只读 + runbook | + K8sGPT / HolmesGPT | 无人值守写生产 |
| 告警通道 | 飞书自定义机器人 | PrometheusAlert | 文档/聊天明文 |
| 批量运维 | （暂不做，挨个 SSH） | Ansible + Semaphore | AWX / SaltStack |
| 单机面板 | （暂不做） | 1Panel / Cockpit | 宝塔（逐步替代） |
| 指标/日志 | （暂不做） | Netdata / Prometheus + Loki+Alloy | Zabbix / ELK（过重） |
| 堡垒机 | （暂不做） | JumpServer 社区版 | Teleport（许可注意） |
| 密码管理 | Vaultwarden / 受限飞书表 | Bitwarden/Passbolt/KeePassXC | 明文 |

### 九、参考链接

**飞书（初期方案用）**
- 飞书自定义机器人 / 群 Webhook：https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot
- 飞书多维表格（Base）：https://www.feishu.cn/product/base

**进阶工具（阶段 2+）**
- Uptime Kuma：https://uptimekuma.org/ ｜ 证书到期监控 https://devopsdaily.eu/articles/2025/monitoring-tls-certificates-with-uptime-kuma/
- Ansible：https://www.ansible.com/ ｜ Semaphore UI：https://semaphoreui.com/
- 1Panel：https://github.com/1Panel-dev/1Panel ｜ Cockpit：https://cockpit-project.org/
- Netdata vs Prometheus：https://www.netdata.cloud/netdata-vs-prometheus/ ｜ 自托管监控对比 https://blog.canadianwebhosting.com/self-hosted-monitoring-comparison-2026/
- Loki vs ELK：https://www.wallarm.com/cloud-native-products-101/grafana-loki-vs-elk-logging-stacks ｜ Promtail→Alloy https://grafana.com/docs/alloy/latest/set-up/migrate/from-promtail/
- JumpServer：https://github.com/jumpserver/jumpserver ｜ NocoDB：https://github.com/nocodb/nocodb

**运维智能体 / 安全**
- HolmesGPT（CNCF）：https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/ ｜ AI SRE 清单 https://github.com/agamm/awesome-ai-sre
- Claude Code 权限/护栏：https://www.claudedirectory.org/blog/claude-code-permissions-guide ｜ Hermes 安全 https://hermes-agent.nousresearch.com/docs/user-guide/security
- SSH 加固：https://www.digitalocean.com/community/tutorials/hardening-ssh-fail2ban ｜ 宝塔安全加固 https://docs.bt.cn/practical-tutorials/security-hardening
- 自托管密码管理器：https://kubedo.com/blog-best-self-hosted-password-managers-2025/
- 阿里云 RAM 最佳实践：https://help.aliyun.com/zh/ram/use-cases/ensure-security-of-alibaba-cloud-resources

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
```
初期收敛：能否用 飞书在线文档 + Hermes 智能体 实现需求？
→ 可以。飞书（多维表格台账 / 文档 runbook / 机器人告警）+ Hermes（只读排障）
  + 一个巡检脚本 ops-probe.sh（检测），覆盖资产/规范/runbook/告警/排障五件事；
  重工具（Ansible/1Panel/Prometheus/Loki/JumpServer）降级为阶段 2+ 按需扩展。见 §三。
```
