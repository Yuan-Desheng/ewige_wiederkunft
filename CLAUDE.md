# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an **Obsidian vault** — a personal knowledge management system based on the IPARA (Inbox + PARA) structure. It is NOT a traditional software project. There are no build commands, tests, or linters.

The vault is a "预制仓库" (pre-built template vault) designed by "鱼先生", providing modular Obsidian configurations for note-taking, daily journals, book reading, and contact management.

**This machine is a headless Linux server — Obsidian does NOT run here** (Obsidian doesn't support Linux per the vault's usage guide). The vault on this machine is managed as a git repository only; the user syncs and renders it on their own computer. Never attempt to launch Obsidian or verify rendering locally — verify by file content and conventions instead.

## Vault Structure

- **Assistants/** — Modules, templates (Templater), base files, and chart modules. **Do not rename or delete existing files/folders here** — the author pushes remote updates that overwrite same-path files. To customize, copy and rename first.
  - `模块、模板数据库-Bases.base` — Central database view for all templates and modules.
  - `Templater/` — Template folders: `笔记/`, `辅助/`, `片段/`, `主页/`, `日记/`, `人脉/`, `移动/`, `其他/`.
  - `Templater/Scrip（用于更新，勿删）/` — JS scripts for Templater. **Do not delete.**
- **Books/** — Book-related notes, PDF books, e-book shelf (`电子书架.md`), reading notes.
- **Connections/** — Contact/people management (`人物/`, `公司/`, `部门/`), items.
- **Documents/** — Main content area:
  - `I.P.A.R.A/` — Core PARA structure with 4 areas: `工作领域/`, `学习领域/`, `生活领域/`, `0-收集箱/`. Each area has subfolders: `收集/`, `归档/`, `项目/`, `资源/`. Additional structures inside:
    - `0-收集箱/AI笔记/` — daily AI conversation notes; `0-收集箱/raw/` — LLM Wiki raw sources (articles/papers/transcripts)
    - `学习领域/资源/concepts|entities|comparisons|queries/` — LLM Wiki pages (conventions in root `SCHEMA.md`); `wiki-index.md` / `wiki-log.md` live in `学习领域/资源/`
    - `<领域>/归档/卡片盒笔记主题索引卡/*.canvas` — theme index cards (see 卡片盒笔记主题 rules below)
  - `Canvas/` — Canvas files
  - `Dailynote/` — Daily notes (named `YYYY-MM-DD.md`) and weekly notes (`周记/`)
  - `Douban/` — Douban media entries
  - `Excalidraw/` — Excalidraw drawings with custom scripts in `Scripts/`
- **Extras/** — Attachments (images, covers, avatars, etc.). Excluded from git via `.gitignore`.
- **使用指南/** — Usage guides for the vault system.
- **`数据库与导航.md`** — Top-level navigation hub. Uses Datacore queries and Meta Bind embeds to provide search, navigation links, and heatmaps across the vault.
- **`SCHEMA.md`** — LLM Wiki structure conventions (root level): page types, frontmatter extensions (`type`, `sources`, `confidence`) compatible with the 鱼先生 frontmatter, and the tag taxonomy.

## Key Obsidian Plugins

This vault relies heavily on these community plugins:
- **Templater** — Templates in `Assistants/Templater/` with JS scripts in `Scrip（用于更新，勿删）/`
- **Dataview** — Query-based dynamic content
- **Datacore** — Advanced data queries (experimental, used in `数据库与导航.md` via `数据库模块-datacore` embed)
- **Meta Bind** — Interactive form fields and embeds (e.g., `meta-bind-embed` blocks)
- **Bases View** — Database views (`.base` files like `模块、模板数据库-Bases.base`)
- **Excalidraw** — Visual drawings with custom scripts in `Documents/Excalidraw/Scripts/`
- **Spaced Repetition** — Flashcard review
- **Dida Sync** — TickTick (滴答清单) integration, config tracked in `data.json`
- **QuickAdd** — Quick note capture workflows
- **obsidian-douban-plugin** / **obsidian-weread-plugin** — Import from Douban and WeRead
- **Custom plugins**: FlowText, PDF Flow, Imagen, Title Manager, Note Rambler, Tags Master, DockSpace, etc.

## Editing Conventions

- File names and folder paths under `Assistants/`, `Books/`, `Connections/`, `Documents/` must not be renamed — automation depends on them.
- `.base` files are Bases View database definitions.
- `.canvas` files are Obsidian Canvas JSON files.
- CSS snippets live in `.obsidian/snippets/`.
- Templater JS scripts (`.js`) are in `Assistants/Templater/Scrip（用于更新，勿删）/` and `Assistants/Templater/辅助/JS辅助脚本/`.

## Note Creation Rules

- New notes must be created under `Documents/I.P.A.R.A/` in the correct area subdirectory (`工作领域/`, `学习领域/`, `生活领域/`, `0-收集箱/`). Each area has `收集/`, `归档/`, `项目/`, `资源/` subfolders.
- The default note placement for new ideas is `收集/` (inbox). Move to `项目/`, `资源/`, or `归档/` once classified.
- Use the existing areas (`工作领域/`, `学习领域/`, `生活领域/`). Do NOT create custom areas unless the user explicitly requests it.
- Note title (first `## ` heading) should match the file name. Title Manager plugin keeps them in sync.

## Required Frontmatter

Every note under `Documents/I.P.A.R.A/` should include this frontmatter structure:

```yaml
---
createTime: YYYY-MM-DD HH:mm
笔记ID: YYYYMMDDHHmmss
multiFile:
multiMedia:
description:
笔记类型:
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
---
```

Key fields:
- `笔记ID` — Unique ID, format `YYYYMMDDHHmmss` (timestamp of creation)
- `笔记类型` — Note type classification (used by database views). Standard values from the card-box method: `闪念笔记`, `项目笔记`, `永久笔记`; AI-generated notes use `AI整理`; other observed values: `收集笔记`, `wiki笔记`. Do not invent new types.
- `阐述日期` — Review/elaboration date (for spaced review scheduling)
- `卡片盒笔记主题` — Links the note to a theme index card. Rules:
  - The value MUST reference an **existing** canvas under `<领域>/归档/卡片盒笔记主题索引卡/`. Never invent a theme name without creating its canvas file.
  - Format (YAML list of quoted wiki links, full path + alias):
    ```yaml
    卡片盒笔记主题:
      - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
    ```
  - Cross-area linking is allowed (e.g. a 0-收集箱 note may link a 工作领域 theme).
  - When creating a new theme, also create the `.canvas` index card: `{"edges": [], "nodes": [...]}` with one `file` node per member note (`id: "note-<epoch-ms>-<4digits>"`, 440×500, x step 490, wrap every 4 nodes with y step 550).
  - Setting the frontmatter alone does NOT embed the note into an existing canvas (that is plugin behavior) — either add the file node to the canvas too, or tell the user to run `Alt+Shift+B` on their machine.
- `tags` — Freeform tags; auto-complete is configured via Content Protection plugin

## Note Body Structure

**Every note under `Documents/I.P.A.R.A/` (including AI notes) MUST follow the card-box format:**
1. `## Title` (matches filename). A few legacy notes use `# Title` (h1) — tolerate them; do NOT retitle existing notes (Title Manager syncs heading ↔ filename on the user's machine and may rename files)
2. The card-box note header module embed (interactive buttons for type, tags, theme, move, progress) — **required**, immediately after the title:

   ````markdown
   ```meta-bind-embed
   [[笔记抬头模块]]
   ```
   ````
3. `<progress value="N" max="100">` — Progress tracker (0-100, in multiples of 10); optional for AI notes
4. Content sections with `## ` or `### ` headings

## Content Placement Rules

- PDF books → `Books/pdf书籍/` (subfolders allowed)
- Person photos → `Extras/人物/`
- Task management → Use Dida Sync (滴答清单), NOT Tasks plugin or Dataview task queries
- AI-generated/rewritten content → Use `笔记类型: AI整理` and `cssclasses: ai-note` to distinguish from hand-written notes
- AI daily notes (Layer 1 digest) → `Documents/I.P.A.R.A/0-收集箱/AI笔记/YYYY-MM-DD.md`
- 复现主题篇 (Layer 2, extracted from AI sessions) → the relevant area's `收集/` (e.g. `Documents/I.P.A.R.A/学习领域/收集/<主题>.md`), as a normal `收集笔记` — see AI Conversation Organization Rules
- Douban media entries → `Documents/Douban/` (via Douban plugin)

## AI Conversation Organization Rules

**Purpose (this drives the whole format):** AI notes exist to make it easy to **复现操作 later** (rebuild the same feature / redo the same setup), NOT to archive what was said. So do not dump transcripts — distill each session into something you could rebuild from without rereading the conversation. Canonical model: `Documents/I.P.A.R.A/学习领域/收集/MinIO 视频直传.md`.

Output is **two layers**:

### Layer 1 — 日 AI 笔记（捞取 / 索引层）

`Documents/I.P.A.R.A/0-收集箱/AI笔记/YYYY-MM-DD.md` — a **lightweight per-day digest**, NOT a verbatim transcript.

- **Note format:** frontmatter (Required Frontmatter with `笔记类型: AI整理`, `cssclasses: ai-note`) → `## YYYY-MM-DD` title → `meta-bind-embed [[笔记抬头模块]]` block → content (per Note Body Structure above).
- **Theme (fixed):** every daily AI note uses the `AI笔记` theme — NOT a per-content/project theme:
  ```yaml
  卡片盒笔记主题:
    - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/AI笔记.canvas|AI笔记]]"
  ```
  When creating a new daily AI note, also append its `file` node to `AI笔记.canvas`.
- **Per session, record concisely** (a `###` block per session): 项目 / 会话标识 + 日期范围 → 做了什么（任务一句话）→ 关键结论与决策 → 改动文件清单 → 一句话踩坑。**Do NOT paste the full Q&A.**
- For each session that produced reproducible work, **link to its 复现篇** (Layer 2) with `[[...]]`. A pure Q&A / 概念讨论 session with nothing to reproduce stays digest-only (no Layer 2 note) — but if it taught a reusable concept, a short `知识点` bullet list here is fine.

### Layer 2 — 复现主题篇（the real deliverable）

One standalone topic note **per reproducible outcome**, placed in the relevant area's `收集/` (e.g. `Documents/I.P.A.R.A/学习领域/收集/<主题>.md` — cross-area allowed), named by the real topic. **Template = the MinIO note above.**

- **笔记类型:** `收集笔记` (an ordinary collection note — NOT `AI整理`); no `ai-note` cssclass.
- **Theme:** the relevant 领域 theme (e.g. `前端开发`), NOT `AI笔记`. Reference an existing canvas per the 卡片盒笔记主题 rules.
- **Lead blockquote:** one-line 定位 + 来源项目 / 技术栈 + 「用于复现到其他项目」+ 脱敏声明 (if any).
- **Structure (复现导向 — adapt headings to the topic):**
  1. `## 一、原理` — 目标（要解决什么）+ 流程图（ASCII）/ 关键设计
  2. `## 二、代码` — **完整、可直接复制的代码，逐字保留，不裁剪、不省略、不缩成"关键片段"** (this verbatim-completeness rule is the one thing carried over from the old format)
  3. `## 三、配置 / 命令` — 服务器 / 环境 / 依赖配置，可直接执行
  4. `## 四、复现 Checklist` — `[ ]` 勾选项，按 前端 / 服务器 / 验证 分组
  5. `## 五、踩坑记录` — 现象 → 原因 → 解决，复现时对照（这一节吸收了旧格式 `知识点解析` 的「为什么 / 坑」职责）
  6. `## 六、文件清单` — 复现需 copy / 改的文件表（必须 / 视情况 / 修改）
- Replaces the old「对话原文照搬 + 知识点解析」format. Keep underlying-concept explanations and official doc links where they aid reproduction (inline in 原理/踩坑, or a short 延伸阅读), but do not reproduce the conversation.

**Markdown-safe formatting (rendering-critical):** all code MUST be wrapped in fenced code blocks (` ``` ` with a language tag) or inline backticks. Never leave raw angle-bracket tokens bare in prose — e.g. `<IndustryDetailVO>`, `<div ...>`, generics, HTML/Vue fragments — Obsidian parses bare `<...>` as HTML and breaks the rendering of everything after it. This applies especially to verbatim user pastes (DOM dumps, JSON+HTML mixes, garbled OCR code): keep the content verbatim but wrap the code portion in a fence, leaving surrounding prose outside.

**Sensitive information (CRITICAL — this vault is pushed to a public GitHub remote):**
- Conversation transcripts may contain plaintext passwords, tokens, or keys (e.g., service credential lists the user pasted). Replace each with `【已脱敏】` before writing, then verify the written file contains no remaining secrets before committing.
- SSH **public** keys may be kept verbatim; private keys must never be written.

**Scan scope (this is a shared multi-user machine):**
- `~/.claude/projects/` contains sessions from other colleagues' project directories (e.g., `-home-work-hu`, `-home-work-Yuchi`, `-home-work-weiyuanyong-*`). By default organize ONLY sessions from the user's own projects (paths containing `yuandesheng`); list other projects in the plan only as excluded context, and include them only if the user explicitly chooses to.

**Extraction exclusions (jsonl parsing):**
- Skip harness-injected pseudo-user messages: compaction summaries (text starting with "This session is being continued"), and messages starting with `<local-command`, `<command-name>`, or `Caveat`.
- Strip `<system-reminder>...</system-reminder>` blocks from user message text.
- The user's own terminal commands appear as `<bash-input>`/`<bash-stdout>` messages — keep their content (unescape HTML entities like `&gt;`), but NEVER write the raw tags into the note (they break rendering): reformat as 终端命令：`<inline code>` and 终端输出： + fenced ` ```text ` block. Same for `/`-command injections (`<command-message>`/`<command-name>`): replace with a one-line description like （用户执行 `/init` 命令）.
- Sessions spanning multiple days are allowed in one daily note — label each session's actual date range; timestamps in jsonl are UTC (local is UTC+8).

**Distillation (replaces the old verbatim-transcript rule):**
- Do NOT paste the original Q&A. Read the session, then write the Layer-1 digest and, for reproducible work, the Layer-2 复现篇.
- The ONE thing kept verbatim is **code**: in the 复现篇, preserve complete code as-is — do not trim, summarize, or reduce to "key snippets". A reproduction note with abridged code is useless.
- Capture the「为什么 / 坑 / 概念」that the old `知识点解析` carried — but inside 原理 / 踩坑记录, framed as "what you need to know to redo this", not as a post-hoc explainer.

**When content is too large for one pass:**
- Create a prioritized plan: list every session found, and which ones look worth a 复现篇 vs. digest-only.
- Ask the user which topics need a full 复现篇 now, which can stay digest-only for now.
- Do not silently skip or truncate content.

**Cross-conversation scanning:**
- Source: `~/.claude/projects/<project>/<session>.jsonl` — by default only the user's own projects (see Scan scope above), files modified within 24h (`find -mtime 0`; this is a rolling 24h window, NOT calendar-today — a `.organized.json` watermark mechanism is planned to replace it, see 待办① in the Hermes note)
- User messages: `type: user` → `message.content` (type=text items)
- Assistant responses: `type: assistant` → `message.content` items where type=text and length > 100
- Group by project, sort by timestamp
- There is no dedup yet: re-running on the same day re-appends already-organized content — warn the user instead of organizing the same sessions twice

## Template System

- Templates live in `Assistants/Templater/` subfolders: `笔记/`, `辅助/`, `片段/`, `主页/`, `日记/`, `人脉/`, `移动/`, `其他/`
- Snippet templates (frequently used) go in `Assistants/Templater/片段/`
- Do not modify templates in `Assistants/` directly — copy and rename first, as author updates overwrite originals

## Git

- Branch: `master` (single-branch workflow); remote is GitHub (`github.com:Yuan-Desheng/ewige_wiederkunft.git`, public)
- `.gitignore` excludes `Extras/` only — `.obsidian/` plugin configs are tracked
- Commit messages follow Chinese convention: `feat: MMDD - 简要描述` (e.g. `feat: 0612 - AI笔记：前端项目两会话整理`)
- Author identity is configured repo-local as `yuandesheng <desheng.lailai@gmail.com>` (no global git identity on this machine)

## Important Note Conventions

- YAML frontmatter uses properties like `Tag`, `searchText`, `searchTag`, `areaPath`, `maxline`, etc. These power Dataview/Datacore queries and Bases View filters.
- `![[filename]]` and `![[filename#heading]]` syntax is used for note embedding (Obsidian transclusion).
- Dataview queries use ````dataview` blocks; Datacore uses ````datacore` blocks.
- Navigation across the vault is mediated by `.base` database views and `数据库与导航.md` — not traditional folder browsing.
