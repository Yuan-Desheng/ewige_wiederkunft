---
createTime: 2026-10-16 16:49
笔记ID: 20261016164925
multiFile:
multiMedia:
description: Codex CLI 安装登录、权限控制、项目指令、上下文与会话管理、脚本执行及扩展速查
笔记类型: AI整理
阐述日期:
tags:
  - codex
  - AI
  - CLI
  - tutorial
aliases:
  - Codex 终端使用
cssclasses: ai-note
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## Codex CLI-终端使用

```meta-bind-embed
[[笔记抬头模块]]
```

> 参考 [[Claude Code-指令]] 的指令讲解与 [[Grok Build]] 的速查结构，整理 OpenAI Codex 的终端工作流。核对日期：2026-10-16；本机：`codex-cli 0.162.1`。命令行参数已对照本机 `--help`，斜杠命令对照官方文档；不同版本以实际帮助和 `/` 菜单为准。

### 一、安装与登录

已安装 Node.js/npm 时，可安装或更新 CLI：

```bash
npm install -g @openai/codex@latest
codex --version
codex --help
codex login                 # ChatGPT 登录
codex login --device-auth   # SSH / 无浏览器服务器，按提示到浏览器输入设备码
codex login status         # 查看登录状态
```

设备码登录需要账号或工作区允许此功能。API Key 登录读取标准输入；以下示例假设密钥已通过安全方式注入环境变量：

```bash
printenv OPENAI_API_KEY | codex login --with-api-key
```

ChatGPT 登录和 API Key 是不同的计费入口，API 使用不等于消费 ChatGPT 订阅额度。不要把密钥或 `~/.codex/auth.json` 写入公开笔记。参考：[安装入口](https://learn.chatgpt.com/docs/codex/cli)、[认证说明](https://learn.chatgpt.com/docs/auth)。

### 二、进入项目与启动会话

**Shell 命令在终端执行；以 `/` 开头的命令在 Codex 对话输入框执行。**

```bash
cd /home/yuan/obsidian/ewige_wiederkunft
codex
# 也可以直接携带任务启动
codex "读取 AGENTS.md，说明这个知识库的目录与笔记规范，先不要修改文件"
# 从其他目录启动时指定工作目录
codex -C /home/yuan/obsidian/ewige_wiederkunft
codex --search             # 启用实时网络搜索
codex --no-alt-screen      # 保留终端滚动历史，适合 SSH / tmux
```

一次任务建议写清：**目标 + 参考文件 + 修改范围 + 完成标准**。例如：

```text
读取 Documents/I.P.A.R.A/学习领域/收集/Claude Code-指令.md 和 Grok Build.md，
整理一篇 Codex CLI 使用笔记到同目录。保留源笔记，遵循 AGENTS.md 和
CLAUDE.md 的格式；核对官方文档中的命令，最后检查 frontmatter、链接与差异。
```

### 三、权限控制：沙箱与审批分别设置

沙箱决定命令可以访问或修改的范围，审批决定何时询问用户。以下为本机 `0.162.1` 帮助中支持的组合：

```bash
codex -s read-only -a on-request       # 以只读为起点，按需请求升级
codex -s workspace-write -a on-request # 工作区写入，按需审批
codex -s workspace-write -a never      # 不弹审批；仍受沙箱限制，越界操作会失败
codex --approve-for-me                # workspace-write + 自动审核审批请求
```

- `read-only`：限制写入；`workspace-write`：允许工作区等指定范围内写入；`danger-full-access`：不施加沙箱限制。
- `-a never` **不等于获得所有权限**，`--approve-for-me` 也可能拒绝操作；会话中可用 `/permissions` 查看或调整权限。
- 本机另支持 `--dangerously-bypass-approvals-and-sandbox`，会同时关闭审批与沙箱，仅适合已有外部隔离的环境。
- 本机帮助已无 `--full-auto`，也不支持 Grok 的 `--always-approve`。复制旧教程前先查 `codex --help`。

#### 对应 Claude 的 `--dangerously-skip-permissions`

Codex 对应的完整参数是 `--dangerously-bypass-approvals-and-sandbox`：跳过命令执行审批，同时关闭 Codex 沙箱。两种工具的权限实现不同，这里按用途对应。

```bash
# 新开会话，同时跳过审批与沙箱
codex --dangerously-bypass-approvals-and-sandbox
```

只希望不弹审批、仍保留工作区沙箱时，用 `codex -s workspace-write -a never`。完整绕过参数也不会赋予当前系统用户原本没有的操作系统权限；官方将其定位于已有外部隔离的环境。[官方参数说明](https://learn.chatgpt.com/docs/developer-commands?surface=cli)

### 四、项目指令：`/init` 与 `AGENTS.md`

在 Codex 对话里执行 `/init`，生成当前目录的 `AGENTS.md` 草稿，然后人工核对目录、常用命令、风格和禁改范围。已有规则时先读取，按需补充。

| 位置 | 用途 |
| --- | --- |
| `~/.codex/AGENTS.md` | 跨项目个人约定 |
| 仓库根目录 `AGENTS.md` | 项目约定，如构建、检查和目录规范 |
| 子目录 `AGENTS.md` | 更细范围的约定 |
| 同目录 `AGENTS.override.md` | 优先于该目录的 `AGENTS.md` |

发现规则从全局及项目根目录走到当前工作目录，较近目录的指令可覆盖较早指令。默认项目指令文件名是 `AGENTS.md`；已有 `CLAUDE.md` 可要求显式读取，或配置 fallback，不能假定总会自动加载。[官方指令发现规则](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

### 五、上下文与会话：压缩、换题、恢复

| 目的 | 会话内命令 | 使用说明 |
| --- | --- | --- |
| 压缩当前上下文 | `/compact` | 长任务继续做，保留关键摘要 |
| 新开对话 | `/new` | 切到另一项任务 |
| 清屏并新开对话 | `/clear` | 同时重置可见界面和当前对话上下文 |
| 只清屏 | `Ctrl+L` | 当前对话仍保留 |
| 恢复历史 | `/resume` | 选择保存过的会话 |
| 从当前对话分叉 | `/fork` | 探索另一方案；注意检查所用工作目录 |
| 查看状态 | `/status` | 查看会话、上下文用量及可用的限额信息 |

`/compact` 适合继续同一任务，`/new` 或 `/clear` 适合换题；这些操作不会撤销已经写入磁盘的文件。不要照搬其他工具的固定压缩百分比或 Token 数。

#### 对应 Claude 的 `-r`：`codex resume`

Claude 的 `claude -r` 用于选择并恢复历史会话；Codex 使用 **`resume` 子命令**，不是 `codex -r`。先进入项目目录再执行，默认按当前目录筛选；需要跨目录查找时加 `--all`。

```bash
codex resume               # 会话选择器
codex resume --last        # 继续最近会话
codex resume --all         # 跨工作目录查找会话
codex resume SESSION_ID    # 恢复指定会话，将 SESSION_ID 替换为实际 ID
codex fork --last          # 从最近会话创建分支会话
```

#### 组合使用：恢复会话 + 跳过审批与沙箱

对应 `claude -r --dangerously-skip-permissions`，需要先选历史会话时执行：

```bash
codex resume --dangerously-bypass-approvals-and-sandbox
```

不打开选择器、直接继续最近会话：

```bash
codex resume --last --dangerously-bypass-approvals-and-sandbox
```

指定会话恢复时：`codex resume SESSION_ID --dangerously-bypass-approvals-and-sandbox`。这些组合已对照本机 `codex resume --help` 核对参数；此处仅记录用法，未实际启动绕过权限的会话。

执行压缩前，可先让 Codex 汇总「已完成、待办、修改文件、验证结果」。长期规则写进 `AGENTS.md`，重要结论落到项目文件。[官方会话命令](https://learn.chatgpt.com/docs/developer-commands?surface=cli)

### 六、模型、计划与变更检查

| 命令 | 用途 |
| --- | --- |
| `/model` | 选择当前账号可用的模型及推理强度 |
| `/plan` | 切换到计划模式，先梳理多步骤任务 |
| `/diff` | 检查当前 Git 差异 |
| `/review` | 启动代码审查 |
| `/exit` 或 `/quit` | 退出 CLI |

也可用 `codex -m MODEL_ID` 启动（将 `MODEL_ID` 替换为实际可用模型）。模型列表和额度会变化，优先查看 `/model`、`/status`，不把教程中的某个型号当作永久默认值。[官方命令说明](https://learn.chatgpt.com/docs/developer-commands?surface=cli)

### 七、非交互模式：脚本与批处理

`codex exec` 执行一次任务，完成后退出，适合脚本或 CI。本机支持以下参数：

```bash
codex exec -s read-only "总结当前项目结构，不修改文件"
codex exec -s read-only -o /tmp/codex-summary.md "输出项目结构摘要"
codex exec -s read-only --json "检查项目结构并总结" > /tmp/codex-events.jsonl
codex exec -s read-only - < /tmp/codex-task.txt
# 明确允许工作区写入的任务
codex exec -s workspace-write "修复已定位的问题，运行项目已有检查并报告结果"
```

- `-o` 保存最后一条回答；`--json` 输出 JSONL 事件流，两者用途不同。
- `--output-schema FILE` 可要求最终回答符合给定 JSON Schema。
- 非 Git 目录运行 `exec` 时，确认目录正确后可加 `--skip-git-repo-check`。
- Shell 重定向会覆盖目标文件；无人值守任务应明确目录和写入范围。

独立代码审查：`codex review --uncommitted`；相对基线审查：`codex review --base main`（将 `main` 换成仓库实际基线）。完整语法用 `codex exec --help`、`codex review --help` 核对。[官方 CLI 参考](https://developers.openai.com/codex/cli/reference)

### 八、Skills、插件与 MCP

| 类型 | 解决什么问题 | 常用入口 |
| --- | --- | --- |
| Skills | 可复用的任务流程与操作规范 | `/skills` |
| 插件 | 分发技能、连接器等能力 | `/plugins`、`codex plugin --help` |
| MCP | 接入外部工具服务 | `/mcp`、`codex mcp list` |

本地技能通常放在 `~/.agents/skills/技能名/SKILL.md`（个人）或 `.agents/skills/技能名/SKILL.md`（项目）。技能文件用 YAML 头声明 `name`、`description`，正文写适用流程。[官方技能说明](https://learn.chatgpt.com/docs/build-skills)

本机插件子命令是 `add / list / marketplace / remove`，不要直接照搬 Claude Code 的 `/plugin install`。MCP 支持 `list / get / add / remove / login / logout`；配置前查看 `codex mcp add --help`，再按服务提供方说明填写。

### 九、日常使用顺序与踩坑

1. 进入正确目录，运行 `git status --short`，确认已有改动。
2. 启动 `codex`，检查项目指令；复杂任务先 `/plan`。
3. 指明参考文件、目标与验收方式，按任务设置权限。
4. 长任务按需 `/compact`，中断后用 `codex resume --last` 继续。
5. 完成后查看 `/diff`，运行项目已有检查；确认差异后再决定提交。

| 现象 | 排查与处理 |
| --- | --- |
| `command not found` | 确认安装成功及可执行文件所在目录已加入 `PATH` |
| SSH 登录回调失败 | 尝试 `codex login --device-auth`，检查账号是否允许设备码登录 |
| 参数无法识别 | 运行 `codex --version` 和对应 `--help`，避免混用旧版或其他工具语法 |
| `-a never` 仍执行失败 | 查看沙箱边界、系统权限及网络限制；无审批不代表无限访问 |
| 换题后仍受旧上下文影响 | 用 `/new` 或 `/clear` 开新对话，重新说明任务范围 |

延伸阅读：[[GPT 订阅与 Codex 登录使用]] 记录了历史登录问题，其中旧 `--api-key` 写法不适用于本机版本，应以本篇 `--with-api-key` 和当前官方说明为准。
