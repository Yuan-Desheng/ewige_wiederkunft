---
createTime: 2026-09-29 15:18
笔记ID: 20260929151847
multiFile:
multiMedia:
description: Grok Build（xAI 官方终端 AI 编程代理 grok CLI）的官方文档、使用文章链接与核心用法速查
笔记类型: 收集笔记
阐述日期:
tags:
  - grok
  - grok-build
  - AI
  - CLI
aliases:
  - Grok CLI
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## Grok Build

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

> 素材来源：[Grok Build: xAI's Coding Agent | xAI Docs](https://docs.x.ai/build/overview)

Grok Build 是 xAI 官方的终端 AI 编程代理（`grok` CLI，Rust 编写，Apache 2.0 开源），支持交互式 TUI、无头脚本、ACP 嵌入三种运行方式。

## 官方文档

| 文档 | 链接 | 内容 |
| --- | --- | --- |
| 总览（必读） | https://docs.x.ai/build/overview | 安装、三种运行方式、自定义模型 |
| CLI 命令参考 | https://docs.x.ai/build/cli/reference | 全部子命令与常用 flags |
| Headless 与脚本化 | https://docs.x.ai/build/cli/headless-scripting | `-p` 无头模式、输出格式、CI 集成、ACP |
| Skills / Plugins / Marketplace | https://docs.x.ai/build/features/skills-plugins-marketplaces | 技能发现路径、插件加载、Claude Code 兼容 |
| Modes and Commands | https://docs.x.ai/build/modes-and-commands | 斜杠命令、Shift+Tab 切换模式 |
| MCP 服务器 | https://docs.x.ai/build/features/mcp-servers | `grok mcp add` 等管理命令 |
| 产品主页 | https://x.ai/build | 功能一览、订阅要求 |
| 发布公告 | https://x.ai/news/grok-build-cli | Grok Build 发布博客（2026-05-25） |
| 更新日志 | https://x.ai/build/changelog | 每个版本的新功能与修复 |
| 开源仓库 | https://github.com/xai-org/grok-build | Rust 源码、用户指南 |

> [!tip] docs.x.ai 的文档页都支持加 `.md` 后缀直接拿 Markdown（如 https://docs.x.ai/build/overview.md ），适合喂给 LLM。

## 安装与登录

```bash
# macOS / Linux
curl -fsSL https://x.ai/cli/install.sh | bash
# Windows (PowerShell)
irm https://x.ai/cli/install.ps1 | iex
```

```bash
grok login                 # 打开浏览器 OIDC 登录
grok login --device-code   # 无浏览器环境用设备码登录
```

> [!warning] 先登录再启动会话。登录前启动的旧会话会出现 `no pending auth session` 之类的授权错误，关掉重开即可。

## 三种运行方式

```bash
grok                        # 交互式全屏 TUI（默认）
grok -p "解释这个代码库"      # headless 无头模式，适合脚本/CI
grok agent stdio            # ACP 模式，嵌入 IDE/其他工具
```

## 权限控制

```bash
grok --always-approve                        # 自动批准所有工具执行
grok --permission-mode bypassPermissions     # 完全绕过权限
grok --permission-mode auto                  # 温和版：分类器自动放行，危险操作仍拦
grok --dangerously-skip-permissions ...      # Claude Code 兼容别名，直接可用
```

```
grok --resume --always-approve
```

```
grok --always-approve sessions list
```

`--permission-mode` 可选：`default` / `acceptEdits`（自动同意文件编辑）/ `auto` / `dontAsk` / `bypassPermissions` / `plan`。TUI 内 `/auto` 切换。

> [!warning] 完全绕过模式建议只在可信项目或配合 `--sandbox` 使用。

## 模型、会话与用量

```bash
grok models                     # 当前模型与可用列表（默认 grok-4.7）
grok -p "..." -m my-model       # 指定模型（自定义模型配置在 ~/.grok/config.toml）
grok sessions list              # 列出历史会话
grok sessions search "关键词"    # 按关键词搜索
grok --resume                   # 恢复当前目录最近会话（-r；可带 ID 或标题）
grok --continue                 # 继续最近会话（-c）
grok usage <SESSION_ID>         # 某会话的 token / 费用明细
grok export <SESSION_ID> 出.md  # 导出整段对话为 Markdown（-c 复制到剪贴板）
grok import                     # 从 Claude Code 导入历史会话
```

- 恢复会话：TUI 里 `Ctrl+R`；`grok dashboard` 可看所有会话（含子 agent）
- 会话文件存于 `~/.grok/sessions/`，按工作目录分目录
- 账户套餐与剩余额度：CLI 内无直接命令，上 https://grok.com 账户设置查看；Free 套餐用量到顶会弹 paywall
- TUI 状态栏的 `2.9K / 256K` 是当前会话上下文用量

## 常用管理命令

```bash
grok inspect                      # 查看当前目录被发现的配置（rules/skills/plugins/MCP）
grok mcp list|add|remove|doctor   # MCP 服务器管理
grok plugin list|install|...      # 插件管理
grok update                       # 检查/安装更新
grok --output-format streaming-json -p "..."   # 流式 JSON 输出（脚本/CI 用）
```

## TUI 内操作

- `Shift+Tab` 循环切换模式（plan / agent / ask）
- `/skills` `/plugins` `/hooks` `/mcps` 打开扩展面板（同一弹窗不同 tab）
- `/model <name>` 切换模型；`/fork` 分支出对等 agent；`/feedback` 反馈
- 配置文件：`~/.grok/config.toml`

## 第三方文章

- [Grok Build: xAI's AI Coding Agent CLI Explained (2026) — Codersera](https://codersera.com/blog/xai-grok-build-skills-connectors-guide-2026/)：2026-08 深度横评，含 Skills 实例、与 Claude Code / Codex / Cursor 对比

## 相关笔记

[[Claude Code]]
