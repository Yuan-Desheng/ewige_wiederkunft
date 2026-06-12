---
createTime: 2026-05-28 10:12
笔记ID: 20260528101224
multiFile:
multiMedia:
description: Hermes Agent + LLM Wiki知识库 + 鱼先生Obsidian框架打通方案
笔记类型: 收集笔记
阐述日期:
tags:
  - hermes
  - llm-wiki
  - obsidian
  - 知识管理
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

##  Hermes Agent + LLM Wiki知识库 + Obsidian图谱
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

## 待办
- [ ] 每天按日期整理的ai笔记功能有了，现在需要增加整理一个对话，或者上下文中的内容到制定的笔记中的功能，并列出基础知识点和官网文档地址。 [🔗Dida](obsidian://dida-task?didaId=6a1909b8e4b037c374061c07)
- [ ] ① **水位线增量整理**：在 AI笔记目录维护 `.organized.json`（会话ID → 已整理到的消息时间戳），提示词从"按 -mtime 0 扫描"改为"整理所有未整理消息"——一次解决重复追加、隔天遗漏、跨天归属三个问题
- [ ] ② **复习闭环**：整理时自动将 `阐述日期` 设为 +7 天（进入 Alt+X 复习流）；知识点解析输出 `[[wikilink]]` 连接概念页（涉及格式变更，先出样例确认）
- [ ] ③ **多 agent 采集**：openclaw / hermes 会话日志接入整理流水线，或收窄 frontmatter `来源` 枚举为 claude-code
- [ ] ④ **定时兜底**：每日固定时间（如 21:30）自动执行整理，手动触发保留用于即时需要

## 原始提示词
```
使用ai分析obsidian-鱼先生-快速上手打卡任务，整理为skill
1.实现根据整理的skill中的规则整理现有笔记，主要整理分类，需要的时候再详细整理笔记中的内容。
2.之后和claude、openclaw、hermes等agent的对话内容整理到笔记当中，需要与手写笔记区分开AI整理的笔记内容单独存放在一个区域。可能需要搭建llm知识库进行整理。（可以分手动触发和自动触发）
3.我还想要我之后每天和ai的对话，由我主动或者ai自动整理到obsidian @/home/yuan/obsidian/ewige_wiederkunft/Documents/I.P.A.R.A 目录下创建一个AI笔记目录，然后笔记名称按照日期划分，主要目的是为了回顾知识点，我是一名程序员，现在有了ai之后，在编程的时候已经很少手动写代码，对于代码的基础编写长时间不接触有些遗忘，我想让你在整理这些笔记的时候，将基础知识点也讲解一番，最好附带上官方文档 中文和英文的都可以我也可以访问外网进行查询。
```

## 原始提示词问题分析

1. **目标模糊** — "整理为skill"未指定skill类型（Claude Code skill？Hermes skill？通用SOP？），不同agent的skill格式完全不同
2. **目标混杂** — 三个独立目标放在一个提示词中，导致AI难以确定优先级和执行顺序
3. **缺少上下文** — 未说明当前vault的IPARA结构、笔记数量、现有分类状况，AI无法做出合理判断
4. **路径硬编码** — 本地文件路径只在特定对话上下文中有意义，换一个agent就失效
5. **"AI整理"定义不清** — 未定义AI整理内容的格式标准（frontmatter格式、存放路径、与手写笔记的视觉区分方式）
6. **技术方案未落地** — "可能需要搭建LLM知识库"是模糊的愿望，未分析Hermes LLM Wiki与鱼先生IPARA结构是否兼容

## 资料
https://www.bilibili.com/opus/1190405075833454616
- Hermes Agent GitHub: https://github.com/NousResearch/hermes-agent
- LLM Wiki Skill: https://github.com/NousResearch/hermes-agent/blob/main/skills/research/llm-wiki/SKILL.md

## 整理规则（唯一来源：CLAUDE.md）

> [!important] 规则不在本笔记中复制
> AI 对话整理的全部规则以 vault 根目录 **CLAUDE.md → "AI Conversation Organization Rules"** 为准（git 跟踪，规则随仓库走）。修改规则请改 CLAUDE.md，不要改本笔记——本笔记曾复制过一份规则副本（原"提示词 D"），后因规则演进产生漂移，已于 2026-06-12 删除。

当前规则速览（仅索引，细节看 CLAUDE.md）：
- **笔记格式**：Required Frontmatter（`笔记类型: AI整理` + `cssclasses: ai-note`）→ `## YYYY-MM-DD` 标题 → `meta-bind-embed [[笔记抬头模块]]` → 内容
- **敏感信息脱敏**（CRITICAL）：vault 推送到公网 GitHub，密码/token/密钥替换为【已脱敏】并在提交前校验；SSH 公钥可保留
- **扫描范围**：本机多人共用，默认只整理路径含 `yuandesheng` 的项目会话
- **提取排除项**：跳过压缩摘要伪消息、`<local-command>`/`Caveat` 消息，剥离 `<system-reminder>`，保留 `<bash-input>/<bash-stdout>`；jsonl 时间戳为 UTC（本地 +8）
- **内容要求**：对话原文照搬（代码和非代码）、之后加 `### 知识点解析`（修改原因、基础知识点、官方文档链接）
- **过大先列计划**：列主题清单问用户哪些详细整理，不静默截断

## 历史提示词归档（2026-05-28 已执行，仅留作设计记录）

### 提示词 A：Claude Code场景 — 将鱼先生操作规范写入CLAUDE.md
```
你是一个Claude Code agent，工作在我的Obsidian vault（鱼先生预制仓库，IPARA结构）中。

请阅读以下文件，提炼出核心操作规范：
- 文件：快速上手打卡任务（完成后，请删除）.md（vault根目录）

要求：
1. 从文件中提取与Claude Code操作相关的规则（如：不可重命名Assistants/下的文件、笔记必须使用特定frontmatter格式、笔记存放在IPARA对应子目录下等）
2. 忽略纯UI操作指南（如快捷键、主题切换、视频链接等）
3. 输出格式：直接追加到 CLAUDE.md 的 "Editing Conventions" 和 "Important Note Conventions" 部分，不要创建新文件

约束：
- 不修改 Assistants/、Books/、Connections/ 下的文件名和路径
- 新建笔记必须放在 Documents/I.P.A.R.A/ 下对应领域目录中
- 笔记frontmatter必须包含：createTime、笔记ID、tags
```

### 提示词 B：Claude Code场景 — 整理现有笔记分类
```
你是一个Claude Code agent，工作在我的Obsidian vault中。

任务：扫描 Documents/I.P.A.R.A/ 下的所有笔记，检查并修正以下问题：
1. 缺少frontmatter或frontmatter不完整的笔记 → 补全必填字段（createTime、笔记ID、tags）
2. 位于错误目录的笔记 → 建议移动到正确的领域/子目录（仅列出建议，不自动移动）
3. 缺少笔记类型（笔记类型字段为空）→ 根据内容推断并填充

输出格式：
- 生成一个 markdown 表格，列出：文件路径 | 问题类型 | 建议操作
- 不修改 Assistants/、Books/、Connections/ 下的任何文件
```

### 提示词 C：Hermes Agent场景 — 在IPARA框架内搭建LLM Wiki
```
你是一个Hermes Agent，使用 llm-wiki skill。

目标：在现有Obsidian vault的 IPARA 结构内建立 LLM Wiki，而非创建独立的wiki目录。

具体方案：
1. WIKI_PATH 设为 vault 根目录：/home/yuan/obsidian/ewige_wiederkunft
2. raw/ 目录映射到 Documents/I.P.A.R.A/收集/ 下，按来源分：raw/articles/、raw/papers/、raw/transcripts/
3. concepts/ 和 entities/ 映射到 Documents/I.P.A.R.A/学习领域/资源/ 下
4. SCHEMA.md 放在 vault 根目录，但需与鱼先生框架的 frontmatter 规范（createTime、笔记ID、tags）兼容
5. index.md 和 log.md 放在 Documents/I.P.A.R.A/学习领域/资源/ 下

约束：
- 不破坏现有的 IPARA 目录结构
- 新建的 wiki 页面使用鱼先生笔记模板的 frontmatter 格式（createTime、笔记ID、tags），同时增加 LLM Wiki 所需的 type、sources、confidence 字段
- 使用 [[wikilinks]] 建立双向链接，确保 Obsidian 图谱视图可正常工作
```

## 实施计划

### 第一阶段：基础规范建立（1-2天）
- [x] 执行提示词A，将鱼先生操作规范写入CLAUDE.md ✅ 2026-05-28
- [x] 在 vault 中创建 `Documents/I.P.A.R.A/学习领域/收集/AI笔记/` 目录 ✅ 2026-05-28
- [x] 确认 Hermes Agent 的安装和 WIKI_PATH 配置 ✅ 2026-05-28
  - Hermes 已安装在 `~/.local/bin/hermes`，配置目录 `~/.hermes/`
  - `llm-wiki` skill 已存在于 `~/.hermes/skills/research/llm-wiki/`
  - `WIKI_PATH` 尚未配置（需在第三阶段设置）

### 第二阶段：现有笔记整理（3-5天）
- [x] 执行提示词B，生成笔记分类检查报告 ✅ 2026-05-28（见下方报告）
- [x] 人工审核报告，确认批量修改范围 ✅ 2026-05-28（用户选择"全部执行"）
- [x] 执行分类修正（frontmatter补全、标签整理） ✅ 2026-05-28
  - 2篇无frontmatter笔记已补充（FLutter 路由.md 已有frontmatter，仅补充笔记类型）
  - 68篇空笔记类型已设为"收集笔记"（含FLutter 路由）
  - 19篇项目笔记已添加 tags: 字段
  - 1篇旧格式frontmatter（手动启动服务.md）已迁移为新格式
- [x] 第二轮全库补全 ✅ 2026-06-12（见下方第二轮报告）
  - 110 篇笔记全部补齐 `meta-bind-embed [[笔记抬头模块]]`（卡片盒格式强制化）
  - 笔记类型缺失清零、tags 缺失清零（80 篇修改）
  - 卡片盒笔记主题补 29 篇（只从已有索引卡选取）、20 篇无对应索引卡有意留空
- [ ] 在 Obsidian 数据库视图中验证整理结果

### 第三阶段：LLM Wiki搭建（3-5天）
- [x] 执行提示词C，在IPARA框架内初始化LLM Wiki ✅ 2026-05-28
  - raw/ → `0-收集箱/raw/`（articles, papers, transcripts）
  - concepts/ → `学习领域/资源/concepts/`
  - entities/ → `学习领域/资源/entities/`
  - comparisons/ → `学习领域/资源/comparisons/`
  - queries/ → `学习领域/资源/queries/`
- [x] 编写兼容鱼先生frontmatter的 SCHEMA.md ✅ 2026-05-28
  - 位置：vault根目录 `/SCHEMA.md`
  - 兼容鱼先生 frontmatter（createTime、笔记ID、tags）+ LLM Wiki字段（type、sources、confidence）
  - 定义了标签分类体系：编程语言、AI/ML、工具链、平台、领域、元类型
- [x] 创建 wiki-index.md 和 wiki-log.md ✅ 2026-05-28
  - 位置：`学习领域/资源/` 下
- [x] 配置 WIKI_PATH 环境变量 ✅ 2026-05-28
  - 在 `~/.hermes/.env` 中添加 `WIKI_PATH=/home/yuan/obsidian/ewige_wiederkunft`
- [ ] 将已有对话记录作为第一批 source ingest 到 wiki（需在Hermes中执行）
- [ ] 验证 Obsidian 图谱视图中 wiki 链接是否正确显示

### 第四阶段：自动化工作流（持续优化）
- [x] AI笔记目录调整 ✅ 2026-05-28
  - 从 `学习领域/收集/AI笔记/` 移动到 `0-收集箱/AI笔记/`
- [x] 整理规则制定并收敛到 CLAUDE.md ✅ 2026-05-28（05-29 修正，06-12 规则 v2）
  - 06-12 新增：敏感信息脱敏、多用户机器扫描范围、jsonl 提取排除项、卡片盒格式强制
  - 本笔记不再保留规则副本，见上方「整理规则」一节
- [ ] ① 水位线增量整理（`.organized.json`，见顶部待办）
- [ ] ② 复习闭环（阐述日期 +7 天、知识点 wikilink，见顶部待办）
- [ ] 建立 AI笔记 → 学习领域/资源/ 的定期归档流程
- [ ] 设置定期 lint 检查（孤立页面、断链、frontmatter完整性）

### 注意事项
- 每个阶段完成后在 Obsidian 中验证结果，不要跳过验证直接进入下一阶段
- Hermes LLM Wiki 的 raw/ 目录不可变原则需与鱼先生的"收集箱"概念协调——建议 raw/ 仅存放AI处理的原始对话，收集箱继续存放手动收集的内容
- AI整理的笔记使用 `cssclasses: ai-note` 或 `笔记类型: AI整理` 进行区分，配合 Obsidian CSS snippet 实现视觉区分（如不同背景色）
- 直接写 frontmatter 的 `卡片盒笔记主题` **不会**自动把笔记嵌入主题 canvas（那是插件按钮的行为）——需在本地 Obsidian 打开对应 canvas 后用 `Alt+Shift+B` 批量嵌入反链笔记

## 笔记分类检查报告

### 第一轮（2026-05-28）

> [!success] 修正已完成
> 扫描时间：2026-05-28 | 总笔记数：104 | 修正前问题：87篇 | 已全部修正

| 问题类型 | 数量 | 修正状态 | 执行的操作 |
|---|---|---|---|
| 完全缺少frontmatter | 3 | ✅ 已修复 | 2篇补充完整frontmatter；1篇已有frontmatter仅补充笔记类型 |
| 缺少 `tags` 字段 | 19 | ✅ 已修复 | 批量在frontmatter中添加 `tags:` 字段 |
| `笔记类型` 为空 | 68 | ✅ 已修复 | 统一设为 `收集笔记` |
| 非标准frontmatter | 1 | ✅ 已修复 | `手动启动服务.md` 旧格式迁移为新格式 |

### 第二轮（2026-06-12）

> [!success] 卡片盒格式全库对齐
> 总笔记数：110 | 修改：80篇（frontmatter）+ 10篇（补抬头模块）

| 项目 | 结果 |
|---|---|
| `meta-bind-embed [[笔记抬头模块]]` | 110/110 全覆盖（补 10 篇，其中 05-29/05-30 同时补了与文件名一致的标题头） |
| 笔记类型 | 缺失 0（补 1 篇） |
| tags | 缺失 0（补 70 篇，按内容语义 1-3 个标签） |
| 卡片盒笔记主题 | 补 29 篇（只从现存 15 张索引卡选取：Flutter/峰华Vue3/OpenClaw/Artificial Intelligence/海媒/虚拟电厂/Gemini）；20 篇无对应索引卡暂时留空 |

✅ 2026-06-12 后续：为留空的 20 篇新建 12 张索引卡并全部关联（Linux、前端开发、DevOps、算法刷题、LLM Wiki、软件工程、英语学习、ThingsBoard、工业数据采集公司官网、空军推门听课交接、跑步、MAD剪辑），canvas 中已内置成员笔记 file 节点。至此全库 110 篇主题无缺失。

## 待办事项

> [ ] ① 水位线增量整理 `.organized.json`（最高优先级，解决重复/遗漏/跨天）
> [ ] ② 复习闭环：阐述日期 +7 天 + 知识点解析 `[[wikilink]]`（先出样例确认格式）
> [ ] ③ openclaw / hermes 会话采集接入（或收窄 `来源` 枚举）
> [ ] ④ 每日定时兜底整理（如 21:30）
> [ ] Hermes Agent 中执行第一批 source ingest（将已有对话记录导入 wiki）
> [ ] 配置 Obsidian QuickAdd 手动触发按钮
> [ ] 建立 AI笔记 → 学习领域/资源/ 的定期归档流程
> [ ] 设置定期 lint 检查（孤立页面、断链、frontmatter完整性）

## 配置文件位置汇总

> [!note] 多机说明
> vault 同时存在于多台机器（如 `/home/yuan/obsidian/ewige_wiederkunft`、`/home/work/yuandesheng/ewige_wiederkunft`），因此下表使用 **vault 相对路径**；绝对路径一律通过提示词第一步的 `find` 动态定位。

| 配置项               | 路径（vault 相对）                                    | 说明                            |
| ----------------- | ----------------------------------------------- | ----------------------------- |
| Obsidian vault 规则 | `CLAUDE.md`                                     | 笔记创建规则、frontmatter格式、AI对话整理规则（唯一规则来源） |
| LLM Wiki Schema   | `SCHEMA.md`                                     | 知识库结构和约定                      |
| Wiki 索引           | `Documents/I.P.A.R.A/学习领域/资源/wiki-index.md`     | 所有 wiki 页面目录                  |
| Wiki 日志           | `Documents/I.P.A.R.A/学习领域/资源/wiki-log.md`       | 操作记录                          |
| AI 笔记输出           | `Documents/I.P.A.R.A/0-收集箱/AI笔记/YYYY-MM-DD.md`  | 每日AI对话整理笔记                    |
| Hermes 环境变量       | `~/.hermes/.env`（机器本地，不在 vault 内）               | WIKI_PATH 配置                  |

## 每日使用指南

### 手动触发（Obsidian vault 项目中）

在 vault 项目的 Claude Code 对话框中，直接输入：

```
整理今天的对话
```

Claude Code 会按 CLAUDE.md 规则自动：
1. 扫描 `~/.claude/projects/` 下当天会话（默认只取本人项目，路径含 `yuandesheng`）
2. 解析对话（剔除压缩摘要等注入消息），按项目/会话分组
3. 对话原文照搬 + 知识点解析；密码/token 自动脱敏
4. 输出到 `0-收集箱/AI笔记/YYYY-MM-DD.md`（已存在则追加）

### 在对话中指定范围

```
# 只整理某个项目的对话
整理今天 vpp-simulator 项目的对话

# 追加整理（不覆盖已有内容）
把今天其他对话也追加到AI笔记里

# 只整理代码相关的部分
整理今天对话中的代码修改部分
```

### 输出笔记的结构（现行版，2026-06-12 定版）

```
0-收集箱/AI笔记/2026-06-12.md
├── frontmatter（Required Frontmatter，笔记类型: AI整理 / cssclasses: ai-note / 卡片盒笔记主题按内容归属）
├── ## 2026-06-12（标题 = 文件名）
├── meta-bind-embed [[笔记抬头模块]]
├── 引言（整理范围、时区、脱敏说明）
├── 会话一：主题概述（会话ID、实际日期范围）
│   ├── 对话原文（逐条 用户/Claude，按时间序）
│   └── 知识点解析（修改原因、基础知识点、官方文档链接）
├── 会话二：……
│   ├── 对话原文
│   └── 知识点解析
```

### 注意事项

- 仅在 **Obsidian vault 项目** 中可用（其他项目用下方跨项目提示词）
- ⚠️ **同一天重复运行会重复追加已整理过的内容**——去重机制见待办①（水位线），落地前请勿对同一天的对话跑两次
- 如果对话量很大，会先列出目录计划让你选择哪些需要详细整理
- 整理时必须使用**当天实际日期**（`date +%Y-%m-%d`），不要用会话开始时的日期
- 对话内容必须**原文照搬**，不要对 AI 的回复做任何压缩、改写或分析

## 跨项目整理提示词

在**非 Obsidian vault 项目**的 Claude Code 会话中，复制以下提示词即可整理对话（2026-06-12 更新：预过滤本人项目）：

```
整理今天的AI对话到Obsidian笔记。

第一步：定位 Obsidian vault
执行 find ~ -maxdepth 4 -path "*/ewige_wiederkunft/CLAUDE.md" 2>/dev/null | head -1
取其父目录作为 VAULT_PATH。如果找不到，问我 vault 路径。

第二步：读取笔记规则
cat "$VAULT_PATH/CLAUDE.md"，重点关注 AI Conversation Organization Rules 和 Required Frontmatter 部分。
这些规则定义了笔记格式、存放路径、脱敏要求和提取排除项，请严格遵循。

第三步：扫描当天对话（只取我自己的项目）
find ~/.claude/projects/ -path "*yuandesheng*" -name "*.jsonl" -mtime 0

第四步：按 CLAUDE.md 规则整理
- 输出路径：$VAULT_PATH/Documents/I.P.A.R.A/0-收集箱/AI笔记/$(date +%Y-%m-%d).md
- 文件已存在则追加，不存在则创建
- 所有对话原文照搬（代码和非代码），不做压缩改写
- 对话原文之后加知识点解析（修改原因、基础知识点、官方文档链接）
- 密码/token 等敏感信息替换为【已脱敏】并校验
- 内容过多时先列计划问我

现在开始执行。
```

### 工作原理

1. **自动定位 vault** — 通过 `find` 搜索特征文件 `ewige_wiederkunft/CLAUDE.md`，无需记忆路径
2. **规则随仓库走** — 详细规则存储在 vault 的 `CLAUDE.md` 中（git 跟踪），换机器无需额外配置；本笔记只保留引导提示词
3. **跨项目扫描** — 扫描 `~/.claude/projects/` 下本人项目的当天对话，按项目分组整理

### 适配其他机器

如果 vault 目录名不同，修改 find 命令中的路径特征即可：

```bash
# 示例：vault 在 ~/notes/my-vault/
find ~ -maxdepth 4 -name "CLAUDE.md" -path "*/my-vault/*" 2>/dev/null | head -1
```
