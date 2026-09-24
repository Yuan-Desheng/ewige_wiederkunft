---
createTime: 2026-09-24 11:07
笔记ID: 20260924110736
multiFile:
multiMedia:
description: tare —— 让 Claude Code 读自己的本地日志，诊断 token 用量去向与撞额度原因；安装、提问方式、命令速查、排障
笔记类型: 收集笔记
阐述日期:
tags:
  - claude-code
  - skill
  - token用量
  - ai-cli
aliases:
  - tare
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## Claude Code 用量诊断 tare 使用手册

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="30" max="100" style="width: 100%;"></progress>

> 定位：Claude Code 的 skill，读本机 `~/.claude/projects/**/*.jsonl` 会话日志，回答「token 花哪了 / 为什么撞 5 小时或周额度」。
> 来源：<https://github.com/kelviq/tare>（MIT，v0.2.0）· 技术栈：Python 3.9+ 标准库，无依赖、不联网。
> 本机已于 2026-09-24 安装到 `~/.claude/skills/tare/`。本篇用于复现安装到其他机器 + 日常查阅。

## 一、原理

### 目标

撞额度时不知道原因：是自己用得多、模型太贵、某个文件反复被带进上下文，还是后台脚本在偷偷跑。tare 把本地日志统计成「结论 + 证据 + 该改什么」。

### 流程

```text
~/.claude/projects/**/*.jsonl   (Claude Code 每次请求的日志，只读)
            │
            ▼
   ccaudit.py ──按 requestId 去重──► 汇总表 / --panel / --html / --csv / --share
            │ --csv usage.csv
            ▼
   forensics.py usage.csv ──► 日趋势突变、5h/周窗口负载、会话形态、并发、自动化特征
            │
            ▼
   Claude（SKILL.md 指导）──► 先给结论，再给证据、机制、建议
```

### 需要懂的三个概念

| 概念 | 含义 | 为什么重要 |
|---|---|---|
| **去重** | 一次 API 响应在日志里按 content block 写多行，每行都带同一个 `usage` | 直接累加会虚高（作者数据上虚高 86%）；tare 按 requestId 去重并报告折叠数 |
| **Injected vs Amplified** | Injected = 工具输出进上下文的 token；Amplified = Injected × 之后被重发的次数 | 会话早期读一个 20K 的文件，后面 200 次调用都重发 ≈ 4M token。**按 Amplified 排序找元凶** |
| **滚动窗口** | 5 小时额度是滚动的，走开不会清零 | 窗口已 60%+ 时再开工，10 分钟撞限是正常现象，不是 bug |

另外：`weight` 列是按 `ccaudit.py` 顶部 `MODEL_RATES` 折算的「美元等价」相对权重，**不是账单**；标 `*` 的模型无公开价，用 Opus 价占位，比较时看请求数/token 数而不是 weight 占比。

## 二、安装

### 方式 A：skills CLI（推荐，本机用的就是这个）

```bash
npx skills add kelviq/tare -g -y --copy --agent claude-code
```

装完**开一个新会话**才生效，输入 `/` 能看到 `tare` 即成功。

### 方式 B：手动

```bash
git clone --depth 1 https://github.com/kelviq/tare /tmp/tare
mkdir -p ~/.claude/skills && cp -r /tmp/tare/skills/tare ~/.claude/skills/tare
```

### 验证

```bash
ls ~/.claude/skills/tare            # 应有 SKILL.md ccaudit.py forensics.py ccreport.py
python3 ~/.claude/skills/tare/ccaudit.py --help
python3 ~/.claude/skills/tare/ccaudit.py --days 1 --panel
```

### 更新 / 卸载

```bash
npx skills add kelviq/tare -g -y --copy --agent claude-code   # 重跑即覆盖更新
rm -rf ~/.claude/skills/tare ~/.agents/skills/tare             # 卸载
```

## 三、日常用法（在 Claude Code 里）

### 直接用中文问（最推荐）

不用记命令，抱怨额度就会触发：

| 场景 | 可以这样问 |
|---|---|
| 撞限了 | 为什么昨天撞到用量上限？/ 我撞的是 5 小时限还是周限？ |
| 看去向 | 这周 token 都花哪了？/ 哪个项目最耗额度？/ 哪个模型最贵？ |
| 找元凶 | 哪个文件被反复读最费？/ MCP 服务器占了多少上下文？/ 子代理和 skill 开销多大？ |
| 开工前 | 现在 5 小时窗口满了多少？能不能开始一个大重构？ |
| 查后台 | 是不是有东西在后台跑 Claude Code？/ 我睡觉时它在跑吗？ |
| 调优 | 我开始用 `/clear` 了，和上周比有改善吗？/ 升级版本后用量变了吗？/ 做哪一件事最省？ |
| 报告 | 生成浏览器能看的用量报告 / 导出成表格 / 给我一份能公开发的脱敏总结 |

### 斜杠命令

| 命令 | 作用 |
|---|---|
| `/tare` | 完整诊断：用量去向 + 原因 |
| `/tare usage` | 一屏面板，类似内置 `/usage`，但带项目/工具归因 |
| `/tare window` | 当前 5 小时窗口负载，能不能开工 |
| `/tare report [天数]` | 生成 HTML 报告并打开（默认 7 天） |
| `/tare tools [天数]` | 什么在填满上下文 + 最省的一项改动 |
| `/tare week` | 本周 vs 上周 |
| `/tare share [天数]` | 脱敏总结（默认 30 天），可公开 |
| `/tare 任意问题` | 如 `/tare 为什么昨天撞限` |

### 面板输出示例（已脱敏）

```text
tare · last 1 day(s) · from local transcripts, this machine only
822 requests · 10 sessions · 368.04M tokens · 99% cache reads
Breakdown         opus-4-8        opus-5      opus-5-5         total
Cache read         352.15M        10.40M       689.89K       364.62M
Weight               624.6          22.9           2.3         650.8
What's using your limits?                     share of weight
  项目A                               ███████████·   92%
Context, by tool                              share of amplified
  Read                                █████████···   77%
5h window now: 42.7 (8% of the peak seen in this range) · oldest work ages out 14:45
```

读法：cache read 占 99% 说明成本主要来自「上下文被反复重发」；`Read` 占 amplified 77% → 优先查被读进来的大文件。

## 四、命令行直接用（不经过 Claude）

先设路径变量：

```bash
TARE=~/.claude/skills/tare
```

### 常用配方

```bash
# 一屏面板
python3 $TARE/ccaudit.py --days 1 --panel

# 30 天深度报告（带自动发现的问题）
python3 $TARE/ccaudit.py --days 30 --doctor --html report.html && open report.html

# 导出 CSV（forensics 的输入，也可进 Excel/pandas）
python3 $TARE/ccaudit.py --days 30 --csv usage.csv

# 全量取证：日趋势突变、会话形态、自动化特征
python3 $TARE/forensics.py usage.csv

# 撞 5 小时限时，那一刻窗口有多满（填被锁的时间）
python3 $TARE/forensics.py usage.csv --at 2026-09-24T19:46

# 周限：168 小时窗口
python3 $TARE/forensics.py usage.csv --window 168

# 单日剖析
python3 $TARE/forensics.py usage.csv --day 2026-09-23

# 找失控会话，再按 id 前缀深挖
python3 $TARE/ccaudit.py --days 7 --by session --top 10
python3 $TARE/forensics.py usage.csv --session 2d4f21e3

# 找占上下文的工具 → 具体文件/命令/主机
python3 $TARE/ccaudit.py --days 7 --by tool --top 20
python3 $TARE/ccaudit.py --days 7 --by detail --top 20

# 模型分布 / 版本对比 / 两周按天对比
python3 $TARE/ccaudit.py --days 30 --by model
python3 $TARE/ccaudit.py --days 30 --by version
python3 $TARE/ccaudit.py --days 14 --by day

# 脱敏总结（无提示词、路径、命令参数、会话 id）
python3 $TARE/ccaudit.py --days 30 --share share.md

# 解析器自检（Claude Code 升级后先跑）
python3 $TARE/ccaudit.py --dump-sample
```

### 参数速查

`ccaudit.py`：

| 参数 | 作用 | 默认 |
|---|---|---|
| `--days N` | 回看天数 | 7 |
| `--by X` | 分组：`day` `hour` `model` `session` `project` `version` `tool` `detail`（可重复） | day, model, tool, session |
| `--top N` | 每表行数 | 15 |
| `--doctor` | 自动发现问题 | 关 |
| `--panel` | 一屏面板 | 关 |
| `--html PATH` / `--csv PATH` / `--share PATH` | 输出 HTML / CSV / 脱敏 md | — |
| `--dir PATH` | 换日志目录（如从服务器拷来的 projects） | `~/.claude/projects` |
| `--tz H` | 时区偏移小时 | 系统时区 |
| `--dump-sample` | 打印一条原始 usage 记录 | — |

`forensics.py <csv>`：

| 参数 | 作用 |
|---|---|
| 无 | 全量：日表、突增、窗口、会话形态、集中度 |
| `--day YYYY-MM-DD` | 单日剖析 |
| `--at YYYY-MM-DDTHH:MM` | 某时刻窗口负载 |
| `--window H` | 窗口小时数，`168` = 周限 |
| `--session ID` | 单会话时间线、上下文增长、空闲间隔（前缀即可） |
| `--tz H` | 时区偏移 |

### 分析服务器上的日志

服务器（如 `47.93.236.30`）上跑的 Claude Code 日志可拷回本机分析，tare 只读不改：

```bash
rsync -a root@47.93.236.30:/root/.claude/projects/ ./server-projects/
python3 $TARE/ccaudit.py --dir ./server-projects --days 7 --doctor --tz 8
```

服务器是 UTC 时要加 `--tz 8`，否则「夜间活动」判断会错位。

## 五、复现 Checklist

**安装**
- [ ] `python3 --version` ≥ 3.9
- [ ] 跑 `npx skills add kelviq/tare -g -y --copy --agent claude-code`
- [ ] `ls ~/.claude/skills/tare` 有 4 个文件
- [ ] 新开 Claude Code 会话，`/` 能看到 `tare`

**验证**
- [ ] `ccaudit.py --dump-sample` 输出含 `requestId` `message.usage` `message.model` `timestamp`
- [ ] `ccaudit.py --days 30 --doctor` 表头 "duplicate entries collapsed" 不为 0（为 0 说明去重没生效，数字不可信）
- [ ] `/tare usage` 出面板

## 六、踩坑记录

| 现象 | 原因 | 解决 |
|---|---|---|
| 装完 Claude 不认识 tare | `~/.claude/skills` 原本不存在，安装器只装到 `~/.agents/skills/tare` 没链接过去；或者当前会话没重启 | 带 `--agent claude-code` 重跑，或 `mkdir -p ~/.claude/skills && cp -r ~/.agents/skills/tare ~/.claude/skills/tare`；**新开会话** |
| 统计数字比别的工具少很多 | 别的工具没去重，虚高 | 以 tare 为准，看表头折叠条数 |
| 窗口几乎空还几分钟就撞限 | 本地日志只记「发了什么」，不记服务端「计了什么」 | 如实记录，别硬解释；多数「bug」其实是贵模型、窗口未清、或忘了的自动化 |
| 报告里「23:00-06:00 有请求」 | 熬夜或时区不对 | 先确认 `--tz`，再判断是否后台任务 |
| `--doctor` 说大量行解析失败 | Claude Code 升级改了日志格式 | 跑 `--dump-sample` 对字段；等上游更新 |
| 分享时泄露隐私 | 只有 `--share` 输出脱敏，`--by detail`、项目名、session id 都是私有的 | 公开只发 `--share` 产物 |

### 省额度的常见结论

- 不要 `Read` 生成文件 / 压缩包 / 大 bundle —— 早期读一次能吃掉一周
- 不相关任务之间用 `/clear`
- 大量阅读交给子代理，别留在主上下文（但子代理超过总 weight 40% 时 `--doctor` 会告警）
- 批量脚本（`claude -p` / Agent SDK / CI）先跑一次量价再上定时：每个新会话首轮都付全额 cache 写入（约为读的 12 倍）
- 工具报错率 20%+ 是配置问题，失败调用也照样花钱且常带更多上下文重试

## 七、文件清单

| 文件 | 位置 | 说明 |
|---|---|---|
| `SKILL.md` | `~/.claude/skills/tare/` | skill 定义，指导 Claude 的诊断步骤 |
| `ccaudit.py` | 同上 | 解析日志，出表 / 面板 / HTML / CSV / 脱敏总结；顶部 `MODEL_RATES` 可改 |
| `forensics.py` | 同上 | 读 CSV 做取证：突增、窗口、会话形态、并发 |
| `ccreport.py` | 同上 | HTML 报告的 SVG 渲染，被 `ccaudit.py` 引用 |
| `ccwatch.py` | 仓库根目录（**未安装**） | 实验性：轮询官方用量接口对比本地消耗，会读 OAuth token 并联网，需要时再单独评估 |
| `otel_sink.py` | 仓库根目录（**未安装**） | 本地 OpenTelemetry 收集器，逐请求实时记录（含重试、压缩、成本） |
