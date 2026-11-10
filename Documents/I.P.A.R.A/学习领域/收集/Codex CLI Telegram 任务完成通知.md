---
createTime: 2026-10-27 11:30
笔记ID: 20261027113013
multiFile:
multiMedia:
description: 2026 年 10 月 27—29 日 Codex Telegram 通知实录，含 Mac/Linux 配置、长会话参数长度根因、Stop 标准输入钩子与同会话投递验收
笔记类型: 收集笔记
阐述日期:
tags:
  - codex
  - telegram
  - python
  - tutorial
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## Codex CLI Telegram 任务完成通知

```meta-bind-embed
[[笔记抬头模块]]
```

> 为 Mac 与 Linux 上的所有 Codex CLI 项目配置 Telegram 轮次结束通知。来源：2026-10-27 Mac 配置会话与 2026-10-28 Linux 迁移会话，Python 标准库与 Telegram Bot API；用于复现到其他项目。Bot Token、Chat ID、SSH 密码和一次性绑定口令均不收录，涉及秘密时统一以 `【已脱敏】` 代替。

阅读范围：第一至六章保留 2026-10-27 的 Mac 实录和完整代码；第七章记录 2026-10-28 的 Linux 迁移、新机器人及独立 CLI／普通 CLI 的实际验收。Mac 的历史后台待办不能视为 Linux 当前状态；桌面已有会话仍需单独观察通知。

> **Linux 当前采用第八章的标准输入完成钩子。** 第二章与第七章的单 JSON 命令参数 notify 保留为历史快照；长会话会在启动脚本前触发 `Argument list too long`。重装时按第八章安装，不要用历史转换脚本覆盖现行维护工具。

## 分享会话的前置准备与执行提示词

来源：[设置 Telegram 通知](https://chatgpt.com/share/6ae03b2c-26ec-83ec-a355-d35f617a81bd)。这段前置讨论发生于 2026-10-27 10:32—10:46（Asia/Shanghai），随后才进入本机实际实施。本节补充创建机器人、初版参考方案和交给 Agent 的完整执行提示词；正文第二章仍是最终验收版本，后续后台问题以 3.4 节为准。分享中的 Bot Token 已替换为 `【已脱敏】`。

### 需求如何转为可执行任务

| 顺序 | 分享中的需求或进展 | 沉淀到本次实施的决定 |
| --- | --- | --- |
| 1 | 用户询问如何让 Codex CLI 完成任务后提示 Telegram | 使用用户级 notify 调用 Python，再通过 Bot API 单向发送消息 |
| 2 | 初步给出创建 Bot、查询 Chat ID、手写脚本与模拟事件方案 | 先理解流程；手动模拟只能证明脚本可运行，仍需真实 CLI 验收 |
| 3 | 在 BotFather 创建名称 Codex Notification，用户名 my_codex_alert_bot 被占用 | 在同一 /newbot 流程中换一个唯一用户名，不需从头重建 |
| 4 | 最终使用 my_codex_notify_1027_bot，BotFather 返回创建成功信息 | 后续初始化严格校验该用户名，避免配到其他机器人 |
| 5 | 用户把 Bot Token 贴到分享会话 | 该凭证已暴露，先 /revoke；新 Token 只在本地隐藏输入 |
| 6 | 用户要求“请帮我写提示词，我让 agent 去执行” | 明确要求 Agent 实际检查、实现、注册及测试，避免只返回教程 |

### 创建机器人与获取 Chat ID 的前置知识

在 [BotFather](https://t.me/BotFather) 发送 `/newbot`，名称填 `Codex Notification`；普通 Bot 用户名通常以 bot 结尾且必须唯一。此次 `my_codex_alert_bot` 被占用后，改用 `my_codex_notify_1027_bot` 成功。该机器人已创建，后续实施和换 Token 不再重复创建。

打开 [机器人私人聊天](https://t.me/my_codex_notify_1027_bot)，点击 Start 或发送 `/start`，Bot 才能收到私人消息用于识别聊天。早期方案建议再发一条 hello，然后查看 `getUpdates` 结果中 `message.chat.id`，同时确认 `type` 为 private。示例数字仅说明字段形状，不是真实 Chat ID：

```json
{
  "chat": {
    "id": 123456789,
    "type": "private"
  }
}
```

分享最初使用 `read -rs TG_TOKEN` 和 curl 查询；本机实施改为 `getpass` 与标准库 HTTP 请求，避免通过扩展后的 curl URL 进程参数携带 Token，并用一次性 `/start` 口令识别本人的聊天。仅在当前 Shell 读入变量，并不会自动配置 Agent 或其他终端。

### 初版方案与最终实现的区别

| 项目 | 分享中的初版参考 | 本机最终验收实现 |
| --- | --- | --- |
| 配置位置 | 手写 `~/.codex/telegram.json`，字段 bot_token / chat_id | 本机工具写入 `telegram-notify/credentials.json`，目录 700、文件 600 |
| 输入凭证 | 终端读变量或手工编辑 JSON | getpass 隐藏输入，拒绝回退到回显输入 |
| 查询 Chat ID | 从 getUpdates 中查找私人聊天 | 随机 /start 口令、时间和发送者身份校验 |
| 内容处理 | 拼接用户消息、取字符前缀 | 只取本轮最后一条用户消息，敏感信息遮蔽、UTF-16 保守截断 |
| 异常输出 | 直接打印异常并退出 1 | 固定安全错误码，通知处理器返回 0，不影响 Codex |
| 初始化网络 | 单次调用 | 只读请求有限退避重试；发送消息不自动重试 |
| 验证 | 先模拟事件，再建议手工跑 CLI | A/B/C/D 明确区分，并实测独立原生触发和投递；共享后台另行验证 |

以下初版代码完整保留为来源方案，**没有重新部署，不应覆盖第二章的本机版本**。它没有最终版本的完整脱敏、CA 兼容、去重与错误隔离；直接打印异常也可能暴露请求 URL。初版凭证文件位置与最终实现不同，不能混用。

### 分享中的完整初版通知脚本

初版目标文件：`~/.codex/telegram_notify.py`；依赖文件为 `~/.codex/telegram.json`，而不是最终凭证目录。

```python
#!/usr/bin/env python3

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path


CODEX_DIR = Path.home() / ".codex"
CONFIG_FILE = CODEX_DIR / "telegram.json"


def main():
    if len(sys.argv) < 2:
        return

    # Codex 将事件 JSON 作为第一个参数传入
    event = json.loads(sys.argv[1])

    if event.get("type") != "agent-turn-complete":
        return

    # 读取 Telegram 配置
    config = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    token = config["bot_token"]
    chat_id = config["chat_id"]

    # 项目信息
    cwd = event.get("cwd", "")
    project = Path(cwd).name if cwd else "未知项目"

    # 用户任务
    input_messages = event.get("input-messages") or []
    task = " ".join(str(x) for x in input_messages)
    task = task[:500] or "未提供任务描述"

    # Codex 的最后回复
    result = event.get("last-assistant-message") or "无结果摘要"
    result = result[:2000]

    message = (
        "🤖 Codex 本轮任务已结束\n\n"
        f"📁 项目：{project}\n"
        f"📍 路径：{cwd}\n\n"
        f"📝 用户任务：\n{task}\n\n"
        f"📋 Codex 回复：\n{result}"
    )

    # Telegram 单条文本消息最长 4096 字符
    message = message[:4000]

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": message,
    }).encode("utf-8")

    with urllib.request.urlopen(url, data=payload, timeout=10) as response:
        data = json.load(response)
        if not data.get("ok"):
            raise RuntimeError(f"Telegram API error: {data}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Telegram notification failed: {exc}", file=sys.stderr)
        sys.exit(1)
```

### 分享中的初版配置与模拟事件

以下为来源方案的占位示例，不是当前机器需要再次执行的安装步骤：

```json
{
  "bot_token": "【已脱敏】",
  "chat_id": "这里填写私人聊天的 Chat ID"
}
```

```toml
# 初版示例：顶层配置，yourname 为占位符
notify = ["python3", "/Users/yourname/.codex/telegram_notify.py"]
```

```bash
# 初版的手动模拟示例；成功不代表 Codex 原生触发已验证
python3 ~/.codex/telegram_notify.py \
'{
  "type": "agent-turn-complete",
  "cwd": "/tmp/my-project",
  "input-messages": ["修复登录页面 Bug"],
  "last-assistant-message": "测试成功，Codex 通知系统已启用。"
}'
```

分享同时强调：`agent-turn-complete` 只表示一轮结束，一个较长任务可能涉及多轮；通过 Telegram 接收审批提醒或远程批准，需要额外设计，不能当作当前单向通知已实现。分享中“之后启动的会话自动通知”的简略表述，现已由 3.4 节补充共享后台复用与重载的实际限制。

### 交给 Agent 的完整执行提示词

以下保留分享最后生成的任务书正文，去掉页面专用 WritingBlock 包装；这是本次实际实施的需求来源，不能把其中的要求本身当作执行完成的证据。

````markdown
# 任务：为 Codex CLI 配置 Telegram 任务完成通知

你是一名熟悉 Codex CLI、Python、Telegram Bot API 和操作系统环境配置的高级开发工程师。

请直接在当前计算机上完成 Codex CLI 的 Telegram 自动通知集成，而不是仅仅提供操作教程。

## 一、背景与目标

我已经通过 Telegram BotFather 创建了机器人：

- Bot 名称：Codex Notification
- Bot Username：@my_codex_notify_1027_bot
- Bot 地址：https://t.me/my_codex_notify_1027_bot
- Bot Token：需要安全配置，不能在代码或日志中明文展示
- Chat ID：尚未获取，需要协助自动获取

最终实现：

每当 Codex CLI 完成一轮任务时，自动通过 Telegram Bot 向我的私人聊天发送通知。

通知内容包括：

- 任务结束时间
- 当前计算机名称
- 当前项目名称和工作目录
- 本轮用户任务描述
- Codex 最终回复摘要
- 任务状态（只能根据可靠事件或结果判断，不得将轮次结束直接等同于执行成功）

该功能需要全局生效，适用于当前机器上的所有 Codex CLI 项目。

## 二、执行要求

### 1. 自动检查环境

请先检查：

- 当前操作系统（Linux、macOS 或 Windows）
- Codex CLI 安装位置及版本
- Codex 配置目录（优先使用实际生效的 CODEX_HOME）
- 已有 config.toml 配置
- Python 3 是否可用
- 是否能访问 Telegram Bot API
- 是否已经存在通知脚本或 notify 配置

尽量使用现有环境和 Python 标准库，不引入不必要的依赖。

### 2. 安全配置 Telegram Bot

机器人已经创建，不需要重新创建。

此前的 Bot Token 曾在聊天中暴露，因此必须先提醒我通过 BotFather 的 /revoke 更换 Token，不能继续使用已泄露的旧 Token。

新 Token 应通过安全方式在本地输入，不要要求我把它粘贴进 Agent 聊天。

要求：

1. 引导我打开 Telegram 机器人并发送 /start。
2. 使用 Bot API 的 getUpdates 获取 Chat ID。
3. 如果缺少 Token，仅在这一必要环节请求我通过本地安全输入方式提供。
4. 如果当前 Agent 终端不支持安全交互，生成一个可由我在本地终端运行的安全初始化命令。
5. 将 Token 和 Chat ID 存放在仅当前用户可读取的配置文件中，或使用适当的系统凭证存储。
6. 确保 Token 不出现在 Git 仓库、终端历史、调试日志、最终报告或其他 Agent 可见输出中。
7. 不得擅自删除 Telegram Webhook 或修改其他机器人的配置。

### 3. 编写 Telegram 通知脚本

建议使用 Python 3 实现，保存到 Codex 的用户配置目录中，例如：

`~/.codex/telegram_notify.py`

要求：

- 通过官方 Telegram Bot API 的 sendMessage 发送通知。
- 接收 Codex CLI notify 事件的 JSON 参数。
- 处理 agent-turn-complete 事件。
- 解析 cwd、input-messages、last-assistant-message 等字段。
- 正确处理字段缺失、空值、中文、特殊字符和长文本。
- 使用 Telegram 消息长度限制内的安全截断。
- 默认发送简洁摘要，不发送完整对话记录。
- 不发送 Token、API Key、密码等疑似敏感信息。
- 网络请求设置合理超时时间。
- 网络异常不得影响 Codex 的正常使用。
- 失败时记录不包含敏感信息的简要错误。
- 脚本可以重复执行，不产生多余副作用。
- 优先使用 Python 标准库，不额外安装第三方包。

Telegram 消息格式示例：

🤖 Codex 任务通知

📁 项目：my-project

💻 设备：dev-machine

📝 任务：
修复登录页面的 TypeScript 类型错误。

📋 执行结果：
已完成类型修复，相关测试通过。

🕒 时间：2026-10-27 10:45

### 4. 修改 Codex CLI 配置

请检查当前实际生效的用户级 config.toml。

优先使用 Codex CLI 官方支持的 notify 配置，参考：

https://developers.openai.com/codex/config-advanced

通过类似以下配置注册通知脚本：

`notify = ["python3", "/absolute/path/to/telegram_notify.py"]`

要求：

- 使用实际存在的解释器和绝对路径。
- 将 notify 写在正确的 TOML 顶层位置。
- 如果配置文件已有内容，不得覆盖其他设置。
- 修改前备份原配置。
- 如果已经有 notify 配置，先检查现有用途，尽可能保留既有功能。
- 保证 TOML 格式正确。
- 不修改现有模型、推理等级、MCP、审批策略、沙盒权限等其他配置。
- 配置操作必须可重复执行，不得反复添加重复配置。

### 5. 自动测试

配置完成后执行完整验证：

测试 A：Telegram API 连通性

调用 getMe，确认 Bot Token 有效，并验证 Telegram API 可以正常访问。

测试 B：发送测试消息

通过 sendMessage 发送一条：

`✅ Codex Telegram 通知系统配置成功`

确认 Telegram API 返回成功状态。

测试 C：模拟 Codex 通知事件

构造一个合法的 agent-turn-complete JSON 事件，直接运行通知脚本，确认消息内容正确。

测试 D：Codex CLI 集成检查

验证 config.toml 可以正常加载。

如果当前环境允许，启动新的 Codex CLI 测试会话，完成一个简单任务，确认原生 notify 能触发 Telegram 通知。

注意：不要将手动执行通知脚本成功当作 Codex CLI 自动通知集成成功。

如果实际集成测试无法完成，必须明确报告尚未验证的部分，并提供最短验证命令。

### 6. 可维护性

额外提供：

- 手动发送测试通知的方法
- 后续更换 Telegram Token 的方法
- 如何临时关闭通知
- 如何彻底移除这项集成
- 网络超时、Chat ID 错误、Token 失效的排查方法

尽量不要安装常驻后台服务，不需要 Docker，不需要额外服务器。

## 三、验收标准

只有满足以下条件，才可以报告配置完成：

1. Codex CLI 原有功能和配置未遭到破坏。
2. Telegram Bot Token 已安全配置。
3. 能正常向指定 Telegram 私人聊天发送消息。
4. 通知脚本能够正确处理 Codex 原生事件。
5. Codex CLI 用户级 notify 已正确注册。
6. 提供可核验的测试结果。
7. 没有在任何输出中泄露敏感凭证。

## 四、执行方式

请自主完成检查、实施、测试和必要的修复。

除涉及 Token 安全输入等确实需要我操作的步骤外，不要反复向我询问确认。

遇到错误，请先自行定位并尝试修复，不要在第一个错误处停止。

不要修改无关项目文件，也不要为了完成通知集成放宽 Codex 原有安全权限。

如果发现 Codex CLI 当前版本的配置或事件机制与上述描述不同，请优先依据已安装版本及最新官方文档调整实现。

最后用中文报告：

- 配置是否成功
- 修改了哪些文件
- Telegram 消息是否发送成功
- Codex CLI 原生触发是否验证成功
- 后续是否需要重启 Codex CLI
- 如何开启、关闭及测试通知

请现在开始实际执行，不要停留在方案设计阶段。
````

## 一、原理

### 目标与最终结果

在当前机器的用户级 Codex 配置中注册通知脚本。每当 Codex 发出 `agent-turn-complete` 事件时，将设备、项目、工作目录、本轮最后一条用户任务、最终回复摘要和本地结束通知时间发送到自己的 Telegram 私人聊天。

2026-10-27 已完成端到端验收：`getMe`、固定测试消息、模拟事件消息、CLI 配置加载、真实 Codex 原生触发及对应 Telegram 投递全部通过。原生会话退出码为 0，最终回复与随机自检标记匹配，并通过任务哈希关联到通知脚本接收及发送记录。不能用手动运行脚本成功代替原生集成成功。

```text
Codex CLI 完成一轮回复
        │ 原生 notify 传入单个 JSON 参数
        ▼
用户级 telegram_notify.py
        │ 校验事件 → 读取私人凭证 → 脱敏与截断
        │ 普通失败只记录固定错误码，返回 0
        ▼
Telegram Bot API sendMessage
        ▼
经一次性 /start 口令绑定的本人私人聊天
```

`agent-turn-complete` 证明轮次已结束，不证明用户任务执行成功。通知状态明确写为“轮次已结束；执行结果未验证”；最终回复只是摘要，不能替代测试或执行证据。时间取脚本收到事件时的本地时区时间，接近轮次结束时间。

### 本次实际环境

| 项目 | 本次取值 |
| --- | --- |
| 操作系统 | macOS |
| Codex CLI | `0.163.0-alpha.10.2` |
| CLI 入口 | `/usr/local/bin/codex`，调用 ChatGPT.app 内置 CLI |
| 实际 Codex 配置目录 | `/Users/apple/.codex`；环境未设置其他 `CODEX_HOME` |
| Python | 3.12.9，配置中使用真实解释器绝对路径 |
| Bot | `@my_codex_notify_1027_bot` |
| 凭证存储 | 用户配置目录的 `telegram-notify/credentials.json`，文件 600、目录 700 |
| 网络 | 本机 HTTPS 代理 `127.0.0.1:7890`，保留 TLS 证书校验 |
| 依赖 | 仅 Python 标准库，无 Docker、额外服务器或新后台服务 |

脚本快照面向 macOS / Unix，使用 `fcntl`；`tomllib` 要求 Python 3.11 及以上。换到 Windows 时需改造文件权限与锁逻辑，不宜原样照搬。

### 安全与通知边界

- 旧 Token 曾暴露在聊天中，先通过 BotFather `/revoke` 换发；新 Token 只在本机 `getpass` 隐藏输入，不进入命令参数、终端历史或公开笔记。
- `getMe` 校验机器人用户名；检查已有 Webhook，发现已配置则停止，不删除或修改。
- 初始化生成随机 `/start` 口令，只接受近期、发送者与 Chat ID 一致的私人消息，不直接采用第一条 update 的 Chat ID。
- 摘要不读取完整历史；遮蔽已知 Token、常见 API Key、密码字段、Markdown 包裹的密钥标签、私钥、JWT 和 URI 用户信息。
- 按 UTF-16 长度保守截断，纯文本发送并关闭链接预览；不使用不可信 Markdown 解析模式。
- 自动脱敏无法识别所有未标记短秘密；处理高度敏感任务前可关闭通知。
- 读取请求在初始化中最多尝试 4 次，间隔 1/2/4 秒；消息发送不自动重试，避免网络结果不明时重复投递。
- 最近 500 个带 thread-id 和 turn-id 的成功事件去重；这不是网络故障下的严格恰好一次投递保证。

## 二、完整代码

以下三个代码块是本次验收后本机文件的完整快照，不包含真实凭证。将前两个文件放在实际 `CODEX_HOME` 下；测试文件放在其 `telegram-notify/` 子目录中。换机器时由初始化工具重新生成解释器和通知脚本的绝对路径。

### 2.1 通知处理器

文件：`telegram_notify.py`

```python
#!/usr/local/bin/python3
"""Codex notify handler. Credentials and event contents are never logged."""
from __future__ import annotations

import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import ssl
import stat
import sys
import tempfile
import time
import urllib.error
import urllib.request

CODEX_DIR = Path(__file__).resolve().parent
STATE_DIR = CODEX_DIR / 'telegram-notify'
TIMEOUT = 8


class SafeError(Exception):
    """Contains only a fixed error code, never a URL or remote description."""


def ensure_state() -> None:
    if STATE_DIR.is_symlink():
        raise SafeError('unsafe_state_directory')
    STATE_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    if STATE_DIR.stat().st_uid != os.getuid():
        raise SafeError('unsafe_state_owner')
    os.chmod(STATE_DIR, 0o700)


def write_private(path: Path, data: dict) -> None:
    ensure_state()
    fd, temp = tempfile.mkstemp(prefix='.private-', dir=STATE_DIR)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(data, stream, ensure_ascii=False)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def save_credentials(data: dict) -> None:
    write_private(STATE_DIR / 'credentials.json', data)


def load_credentials() -> dict:
    path = STATE_DIR / 'credentials.json'
    try:
        fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    except FileNotFoundError:
        raise SafeError('credentials_missing') from None
    except OSError:
        raise SafeError('credentials_unreadable') from None
    with os.fdopen(fd, 'r', encoding='utf-8') as stream:
        info = os.fstat(stream.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
            raise SafeError('unsafe_credentials_permissions')
        try:
            data = json.load(stream)
        except (ValueError, UnicodeError):
            raise SafeError('invalid_credentials') from None
    if (not isinstance(data, dict) or not isinstance(data.get('token'), str)
            or not data['token'] or type(data.get('chat_id')) is not int or data['chat_id'] <= 0):
        raise SafeError('invalid_credentials')
    return data


def tls_context() -> ssl.SSLContext:
    # The python.org macOS interpreter may ship without its cert.pem symlink.
    if sys.platform == 'darwin' and not ssl.get_default_verify_paths().cafile:
        if Path('/etc/ssl/cert.pem').is_file():
            return ssl.create_default_context(cafile='/etc/ssl/cert.pem')
    return ssl.create_default_context()


def api_call(token: str, method: str, params: dict | None = None):
    if method not in {'getMe', 'getUpdates', 'getWebhookInfo', 'getChat', 'sendMessage'}:
        raise SafeError('unsupported_api_method')
    request = urllib.request.Request(
        'https://api.telegram.org/bot' + token + '/' + method,
        data=json.dumps(params or {}, ensure_ascii=False).encode('utf-8'),
        headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=tls_context()) as response:
            data = json.loads(response.read(2_000_000))
    except urllib.error.HTTPError as error:
        code = error.code
        error.close()
        raise SafeError('telegram_http_' + str(code)) from None
    except urllib.error.URLError as error:
        reason = error.reason
        code = ('tls_certificate_error' if isinstance(reason, ssl.SSLCertVerificationError)
                else 'network_timeout' if isinstance(reason, (TimeoutError, socket.timeout))
                else 'network_unavailable')
        raise SafeError(code) from None
    except (TimeoutError, socket.timeout):
        raise SafeError('network_timeout') from None
    except (ValueError, UnicodeError):
        raise SafeError('invalid_api_response') from None
    except OSError:
        raise SafeError('network_unavailable') from None
    if not isinstance(data, dict) or data.get('ok') is not True:
        code = data.get('error_code') if isinstance(data, dict) else None
        raise SafeError('telegram_api_' + str(code) if type(code) is int else 'invalid_api_response')
    return data.get('result')


def redact(text: str, secrets=()) -> str:
    for secret in secrets:
        if isinstance(secret, str) and secret:
            text = text.replace(secret, '[已隐藏]')
    text = re.sub(r'-----BEGIN [^-\n]*PRIVATE KEY-----.*?(?:-----END [^-\n]*PRIVATE KEY-----|\Z)',
                  '[私钥已隐藏]', text, flags=re.S)
    text = re.sub(r'\b([a-z][a-z0-9+.-]*://)[^\s/@]+@', r'\1[凭证已隐藏]@', text, flags=re.I)
    text = re.sub(r'\b\d{5,}:[A-Za-z0-9_-]{20,}\b', '[Token已隐藏]', text)
    text = re.sub(r'\b(?:sk-[A-Za-z0-9_-]{12,}|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})\b',
                  '[密钥已隐藏]', text)
    text = re.sub(r'\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[JWT已隐藏]', text)
    labels = (r'(?:[A-Za-z0-9_-]*(?:token|password|passwd|pwd|api[ \t_-]*key|secret|authorization|'
              r'access[ \t_-]*key|private[ \t_-]*key|client[ \t_-]*secret)[A-Za-z0-9_-]*|密码|口令|密钥|令牌)')
    text = re.sub(r'(?i)(["\'`*_~]*' + labels + r'["\'`*_~]*\s*(?:[:=：]|是|为)\s*)[^\r\n]+',
                  r'\1[已隐藏]', text)
    text = re.sub(r'(?i)\bBearer\s+[^\s"\'<>]+', 'Bearer [已隐藏]', text)
    # Suppress unlabeled long credential-like strings as well as named credentials.
    text = re.sub(r'(?<![\w])[A-Za-z0-9_+/=-]{40,}(?![\w])', '[长凭证已隐藏]', text)
    return ''.join(c for c in text if c in '\n\t' or (ord(c) >= 32 and not 0xD800 <= ord(c) <= 0xDFFF))


def text_value(value, fallback='（未提供）') -> str:
    return value.strip() if isinstance(value, str) and value.strip() else fallback


def clip(text: str, units: int) -> str:
    encoded = text.encode('utf-16-le')
    if len(encoded) <= units * 2:
        return text
    return encoded[:(units - 1) * 2].decode('utf-16-le', errors='ignore') + '…'


def task_text(event: dict) -> str:
    messages = event.get('input-messages')
    if isinstance(messages, str):
        return text_value(messages)
    if isinstance(messages, list):
        strings = [item for item in messages if isinstance(item, str) and item.strip()]
        if strings:
            return strings[-1].strip()
    return '（未提供）'


def format_message(event: dict, secrets=()) -> str:
    cwd = text_value(event.get('cwd'), '（未知目录）')
    project = Path(cwd).name or cwd
    hostname = socket.gethostname()
    clean = lambda value, size: clip(redact(value, secrets), size)
    now = dt.datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %Z')
    message = ('🤖 Codex 任务通知\n\n'
               f'📁 项目：{clean(project, 180)}\n'
               f'📂 目录：{clean(cwd, 400)}\n'
               f'💻 设备：{clean(hostname, 160)}\n\n'
               f'📝 任务：\n{clean(task_text(event), 750)}\n\n'
               f'📋 最终回复摘要：\n{clean(text_value(event.get("last-assistant-message")), 1400)}\n\n'
               '🔎 状态：轮次已结束；执行结果未验证\n'
               f'🕒 结束通知时间：{now}')
    return clip(message, 4000)


def task_hash(event: dict) -> str:
    return hashlib.sha256(task_text(event).encode('utf-8', errors='replace')).hexdigest()


def log_event(stage: str, event: dict | None = None, code: str | None = None) -> None:
    # No raw event, message, path, credentials or exception text is persisted.
    try:
        ensure_state()
        path = STATE_DIR / 'events.jsonl'
        if path.exists() and path.stat().st_size > 256_000:
            os.replace(path, STATE_DIR / 'events.previous.jsonl')
        record = {'time': dt.datetime.now(dt.timezone.utc).isoformat(), 'stage': stage}
        if event is not None:
            record['task_hash'] = task_hash(event)
        if code:
            record['code'] = code
        fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'a', encoding='utf-8') as stream:
            os.fchmod(stream.fileno(), 0o600)
            stream.write(json.dumps(record) + '\n')
    except Exception:
        pass


def send_message(credentials: dict, text: str):
    result = api_call(credentials['token'], 'sendMessage', {
        'chat_id': credentials['chat_id'], 'text': text,
        'link_preview_options': {'is_disabled': True}})
    if not isinstance(result, dict) or type(result.get('message_id')) is not int:
        raise SafeError('invalid_send_response')
    return result


def handle_event(event: dict) -> int:
    if not isinstance(event, dict) or event.get('type') != 'agent-turn-complete':
        return 0
    try:
        ensure_state()
        if (STATE_DIR / 'disabled').exists():
            return 0
        log_event('received', event)
        credentials = load_credentials()
        # Serialize concurrent handlers and remember only hashes of delivered event IDs.
        fd = os.open(STATE_DIR / 'dispatch.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'w') as lock:
            deadline = time.monotonic() + 2
            while True:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    break
                except BlockingIOError:
                    if time.monotonic() >= deadline:
                        raise SafeError('dispatch_busy') from None
                    time.sleep(0.05)
            thread, turn = event.get('thread-id'), event.get('turn-id')
            key = None
            if isinstance(thread, str) and thread and isinstance(turn, str) and turn:
                key = hashlib.sha256((thread + '\0' + turn).encode()).hexdigest()
            sent_path = STATE_DIR / 'sent.json'
            try:
                sent = json.loads(sent_path.read_text()) if sent_path.exists() else {}
                if not isinstance(sent, dict):
                    sent = {}
            except (ValueError, OSError):
                sent = {}
            if key and key in sent:
                log_event('duplicate_skipped', event)
                return 0
            send_message(credentials, format_message(event, [credentials['token']]))
            log_event('sent', event)
            if key:
                sent[key] = dt.datetime.now(dt.timezone.utc).isoformat()
                write_private(sent_path, dict(list(sent.items())[-500:]))
    except SafeError as error:
        log_event('failed', event, str(error))
    except Exception:
        log_event('failed', event, 'unexpected_error')
    return 0


def main() -> int:
    try:
        if len(sys.argv) == 2:
            event = json.loads(sys.argv[1])
            return handle_event(event)
    except Exception:
        log_event('ignored', code='invalid_event')
    return 0


if __name__ == '__main__':
    sys.exit(main())
```

### 2.2 安全初始化和维护工具

文件：`telegram_setup.py`

```python
#!/usr/local/bin/python3
"""Local-only Telegram setup and maintenance. Never pass a token on the CLI."""
from __future__ import annotations

import argparse
import datetime as dt
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
import tomllib
import warnings

import telegram_notify as n

BOT_USERNAME = 'my_codex_notify_1027_bot'
PYTHON = str(Path(sys.executable).resolve())
NOTIFY = str(Path(n.__file__).resolve())
COMMAND = [PYTHON, NOTIFY]
CONFIG = n.CODEX_DIR / 'config.toml'
BEGIN = '# BEGIN CODEX TELEGRAM NOTIFY (managed by telegram_setup.py)\n'
END = '# END CODEX TELEGRAM NOTIFY\n\n'


def config_block(command: list[str]) -> str:
    return BEGIN + 'notify = ' + json.dumps(command, ensure_ascii=False) + '\n' + END


def config_write(config: Path, before: str, after: str) -> Path:
    # Validate before touching the original; preserve all non-notify parsed values.
    old, new = tomllib.loads(before), tomllib.loads(after)
    old.pop('notify', None)
    new.pop('notify', None)
    if old != new:
        raise n.SafeError('other_settings_would_change')
    suffix = dt.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    backup = config.with_name(config.name + '.telegram-backup-' + suffix)
    fd = os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as stream:
        stream.write(before)
    fd, temp = tempfile.mkstemp(prefix='.telegram-config-', dir=config.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(after)
        if config.exists() and config.read_text() != before:
            raise n.SafeError('config_changed_concurrently')
        os.replace(temp, config)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return backup


def register_notify(config: Path = CONFIG, command: list[str] = COMMAND):
    if config.is_symlink():
        raise n.SafeError('config_symlink_not_modified')
    before = config.read_text() if config.exists() else ''
    parsed = tomllib.loads(before)
    if parsed.get('notify') == command:
        return None
    if 'notify' in parsed:
        raise n.SafeError('existing_notify_preserved')
    return config_write(config, before, config_block(command) + before)


def unregister_notify(config: Path = CONFIG, command: list[str] = COMMAND):
    before = config.read_text()
    if tomllib.loads(before).get('notify') != command:
        raise n.SafeError('different_notify_preserved')
    block = config_block(command)
    if not before.startswith(block):
        raise n.SafeError('managed_notify_block_changed')
    return config_write(config, before, before[len(block):])


def matching_chat(updates: list, challenge: str, since: float):
    matches = set()
    for update in updates:
        if not isinstance(update, dict):
            continue
        message = update.get('message')
        if not isinstance(message, dict):
            continue
        chat, sender = message.get('chat'), message.get('from')
        if not isinstance(chat, dict) or not isinstance(sender, dict):
            continue
        text, date = message.get('text'), message.get('date')
        if (not isinstance(text, str) or type(date) not in (int, float)
                or date < since or chat.get('type') != 'private'
                or type(chat.get('id')) is not int or chat['id'] <= 0
                or sender.get('id') != chat['id'] or sender.get('is_bot') is not False):
            continue
        parts = text.strip().split()
        if len(parts) == 2 and parts[0].split('@')[0] == '/start' and parts[1] == challenge:
            matches.add(chat['id'])
    if len(matches) > 1:
        raise n.SafeError('ambiguous_private_chat')
    return next(iter(matches)) if matches else None


def report_check(name: str, passed: bool, detail: str = '') -> None:
    path = n.STATE_DIR / 'verification.json'
    try:
        report = json.loads(path.read_text()) if path.exists() else {}
    except (ValueError, OSError):
        report = {}
    report[name] = {'passed': passed, 'time': dt.datetime.now(dt.timezone.utc).isoformat(),
                    'detail': detail}
    n.write_private(path, report)


def read_api_call(token: str, method: str, params: dict | None = None):
    """Retry bounded read-only calls; never retry potentially delivered messages."""
    if method not in {'getMe', 'getWebhookInfo', 'getUpdates', 'getChat'}:
        raise n.SafeError('read_retry_method_not_allowed')
    retryable = {'network_unavailable', 'network_timeout',
                 'telegram_http_500', 'telegram_http_502', 'telegram_http_503', 'telegram_http_504',
                 'telegram_api_500', 'telegram_api_502', 'telegram_api_503', 'telegram_api_504'}
    for attempt in range(4):
        try:
            return n.api_call(token, method, params)
        except n.SafeError as error:
            code = str(error)
            if code not in retryable or attempt == 3:
                # method and code are fixed strings; exception/URL text is never printed.
                raise n.SafeError(method + '_' + code) from None
            delay = 2 ** attempt
            print(f'{method}：临时连接故障（{code}），{delay} 秒后重试 {attempt + 2}/4；无需重新输入 Token。',
                  flush=True)
            time.sleep(delay)


def validate_bot(token: str):
    bot = read_api_call(token, 'getMe')
    if (not isinstance(bot, dict) or bot.get('is_bot') is not True
            or bot.get('username', '').lower() != BOT_USERNAME.lower()):
        raise n.SafeError('unexpected_bot_identity')
    return bot


def setup_credentials() -> None:
    if not sys.stdin.isatty():
        raise n.SafeError('local_interactive_terminal_required')
    print('旧 Token 已泄露。先在 @BotFather 用 /revoke 更换此机器人的 Token。')
    if input('已撤销旧 Token 并取得新 Token 后，输入 REVOKED：').strip() != 'REVOKED':
        raise n.SafeError('token_rotation_not_confirmed')
    with warnings.catch_warnings():
        # Refuse getpass's echoed fallback when terminal echo cannot be disabled.
        warnings.simplefilter('error', getpass.GetPassWarning)
        token = getpass.getpass('新 Bot Token（隐藏输入，回车提交）：').strip()
    if not re.fullmatch(r'\d{5,}:[A-Za-z0-9_-]{20,}', token):
        raise n.SafeError('invalid_token_format')
    validate_bot(token)
    print('A：getMe 成功，机器人身份匹配。')
    print('正在检查 Webhook（只读取，不修改）……', flush=True)
    webhook = read_api_call(token, 'getWebhookInfo')
    if not isinstance(webhook, dict) or webhook.get('url'):
        raise n.SafeError('webhook_exists_not_modified')
    challenge = 'codex_' + secrets.token_hex(12)
    since = time.time() - 5
    print('\n请在 Telegram 打开此链接并点击 Start（开始），或给机器人发送下列完整命令：')
    print('https://t.me/' + BOT_USERNAME + '?start=' + challenge)
    print('/start ' + challenge)
    print('正在等待私人聊天绑定，最多 3 分钟；不会删除 Webhook 或确认/清空已有更新。', flush=True)
    deadline = time.monotonic() + 180
    chat_id = None
    while time.monotonic() < deadline:
        # No offset/allowed_updates: do not acknowledge updates or change subscriptions.
        updates = read_api_call(token, 'getUpdates', {'timeout': 0, 'limit': 100})
        if not isinstance(updates, list):
            raise n.SafeError('invalid_updates_response')
        chat_id = matching_chat(updates, challenge, since)
        if chat_id:
            break
        time.sleep(2)
    if not chat_id:
        raise n.SafeError('private_start_not_received')
    chat = read_api_call(token, 'getChat', {'chat_id': chat_id})
    if not isinstance(chat, dict) or chat.get('type') != 'private' or chat.get('id') != chat_id:
        raise n.SafeError('private_chat_validation_failed')
    n.save_credentials({'token': token, 'chat_id': chat_id, 'bot_username': BOT_USERNAME})
    token = None
    n.write_private(n.STATE_DIR / 'verification.json', {})
    (n.STATE_DIR / 'disabled').unlink(missing_ok=True)
    register_notify()
    print('新凭证已保存（目录 700，文件 600）；Chat ID 已安全绑定。')
    verify()


def read_records():
    records = []
    for path in [n.STATE_DIR / 'events.previous.jsonl', n.STATE_DIR / 'events.jsonl']:
        try:
            for line in path.read_text().splitlines():
                try:
                    record = json.loads(line)
                    if isinstance(record, dict):
                        records.append(record)
                except ValueError:
                    pass
        except OSError:
            pass
    return records


def simulate() -> bool:
    event = {'type': 'agent-turn-complete', 'thread-id': 'telegram-self-test',
             'turn-id': secrets.token_hex(10), 'cwd': str(n.CODEX_DIR),
             'input-messages': ['Telegram 模拟事件自检 ' + secrets.token_hex(8)],
             'last-assistant-message': '中文、特殊字符 <>& 和摘要格式检查；这是模拟通知，不代表原生触发。'}
    result = subprocess.run(COMMAND + [json.dumps(event, ensure_ascii=False)],
                            capture_output=True, timeout=15)
    passed = result.returncode == 0 and any(
        record.get('task_hash') == n.task_hash(event) and record.get('stage') == 'sent'
        for record in read_records())
    report_check('C_simulated_event_delivery', passed)
    print('C：模拟事件发送' + ('成功。' if passed else '未成功；请检查安全日志。'))
    return passed


def config_check() -> bool:
    config = tomllib.loads(CONFIG.read_text())
    registered = config.get('notify') == COMMAND
    cli = shutil.which('codex')
    if not cli:
        raise n.SafeError('codex_not_found')
    # This alpha rejects --strict-config on features; exec supports it below.
    result = subprocess.run([cli, 'features', 'list'], capture_output=True, timeout=20)
    passed = registered and result.returncode == 0
    report_check('D_config_load', passed)
    print('D：用户级 notify 注册和 CLI 配置加载' + ('通过。' if passed else '未通过。'))
    return passed


def native_test() -> bool:
    report_check('D_native_trigger', False, 'test_started_not_yet_verified')
    report_check('D_native_delivery', False, 'test_started_not_yet_verified')
    if (n.STATE_DIR / 'disabled').exists():
        raise n.SafeError('notifications_disabled')
    if not config_check():
        return False
    cli = shutil.which('codex')
    marker = 'CODEX_TELEGRAM_NATIVE_TEST_' + secrets.token_hex(8)
    prompt = '这是通知集成自检。不要调用工具，不要读写文件，仅回复：' + marker
    target_hash = hashlib.sha256(prompt.encode()).hexdigest()
    print('D：正在启动真实 Codex CLI 只读会话；最多等待 120 秒。', flush=True)
    try:
        with tempfile.TemporaryDirectory(prefix='codex-telegram-test-') as directory:
            result = subprocess.run([cli, '--no-daemon', 'exec', '--strict-config', '--sandbox', 'read-only',
                                     '--skip-git-repo-check', '--json', '-C', directory, prompt],
                                    capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        report_check('D_native_trigger', False, 'codex_session_timeout')
        print('D：原生测试会话超时；未确认 notify 触发。')
        return False
    final_seen = False
    completed = False
    for line in result.stdout.splitlines():
        try:
            event = json.loads(line)
            if event.get('type') == 'turn.completed':
                completed = True
            item = event.get('item', {})
            if isinstance(item, dict) and item.get('type') == 'agent_message' and marker in item.get('text', ''):
                final_seen = True
        except (ValueError, AttributeError, TypeError):
            pass
    deadline = time.monotonic() + 12
    received = delivered = False
    while time.monotonic() < deadline:
        matching = [r for r in read_records() if r.get('task_hash') == target_hash]
        received = any(r.get('stage') == 'received' for r in matching)
        delivered = any(r.get('stage') == 'sent' for r in matching)
        if delivered or (received and any(r.get('stage') == 'failed' for r in matching)):
            break
        time.sleep(0.5)
    passed = result.returncode == 0 and completed and final_seen and received
    report_check('D_native_trigger', passed,
                 'cli_exit_' + str(result.returncode) + ';final=' + str(final_seen) + ';event=' + str(received))
    report_check('D_native_delivery', passed and delivered)
    print('D：真实会话退出码：' + str(result.returncode) + '；最终回复匹配：' + str(final_seen))
    print('D：Codex 原生 notify 触发：' + ('已验证。' if passed else '未验证。'))
    print('D：该原生事件 Telegram 投递：' + ('成功。' if delivered else '未成功。'))
    return passed and delivered


def verify() -> None:
    cfg = n.load_credentials()
    validate_bot(cfg['token'])
    report_check('A_getMe', True)
    print('A：getMe 成功，机器人身份匹配。')
    result = n.send_message(cfg, '✅ Codex Telegram 通知系统配置成功')
    report_check('B_test_message', True, 'telegram_message_id_' + str(result['message_id']))
    print('B：指定测试消息已发送，Telegram API 返回成功。')
    if not simulate():
        raise n.SafeError('simulated_delivery_failed')
    if not native_test():
        raise n.SafeError('native_trigger_or_delivery_not_verified')
    print('测试记录：' + str(n.STATE_DIR / 'verification.json'))


def status() -> None:
    print('配置目录：' + str(n.CODEX_DIR))
    print('通知开关：' + ('关闭' if (n.STATE_DIR / 'disabled').exists() else '开启'))
    try:
        n.load_credentials()
        print('凭证：已配置且权限通过（内容不显示）')
    except n.SafeError as error:
        print('凭证：' + str(error))
    parsed = tomllib.loads(CONFIG.read_text())
    print('全局 notify：' + ('已注册' if parsed.get('notify') == COMMAND else '未注册'))
    path = n.STATE_DIR / 'verification.json'
    if path.exists():
        print(path.read_text().strip())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['setup', 'verify', 'test', 'simulate', 'native-test',
                                         'register', 'status', 'enable', 'disable', 'uninstall'])
    action = parser.parse_args().action
    try:
        n.ensure_state()
        if action == 'setup':
            setup_credentials()
        elif action == 'verify':
            verify()
        elif action == 'test':
            n.send_message(n.load_credentials(), '✅ Codex Telegram 通知系统配置成功')
            print('Telegram 测试消息发送成功。')
        elif action == 'simulate':
            return 0 if simulate() else 1
        elif action == 'native-test':
            return 0 if native_test() else 1
        elif action == 'register':
            backup = register_notify()
            print('notify 已注册。' + ('备份：' + str(backup) if backup else '配置无需重复修改。'))
            return 0 if config_check() else 1
        elif action == 'enable':
            register_notify()
            (n.STATE_DIR / 'disabled').unlink(missing_ok=True)
            print('通知已开启。')
        elif action == 'disable':
            fd = os.open(n.STATE_DIR / 'disabled', os.O_CREAT | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
            os.close(fd)
            print('通知已关闭，后续事件立即生效。')
        elif action == 'status':
            status()
        elif action == 'uninstall':
            unregister_notify()
            for path in [Path(NOTIFY), Path(__file__).resolve()]:
                path.unlink(missing_ok=True)
            shutil.rmtree(n.STATE_DIR)
            print('通知注册、脚本和凭证已移除；原始配置备份保留。')
        return 0
    except n.SafeError as error:
        print('操作未完成：' + str(error), file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print('\n已取消；输入的 Token 不会显示。', file=sys.stderr)
        return 1
    except Exception:
        print('操作未完成：local_operation_failed（为保护凭证，不输出异常详情）。', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
```

### 2.3 离线安全与行为回归测试

文件：`telegram-notify/test_telegram_notify.py`

```python
"""Offline security and event regression tests; no real credentials used."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

SCRIPT = Path(__file__).resolve().parent.parent / 'telegram_notify.py'
spec = importlib.util.spec_from_file_location('telegram_notify', SCRIPT)
notify = importlib.util.module_from_spec(spec)
if SCRIPT.exists():
    spec.loader.exec_module(notify)
    sys.modules['telegram_notify'] = notify

sys.path.insert(0, str(SCRIPT.parent))
setup_spec = importlib.util.spec_from_file_location('telegram_setup', SCRIPT.parent / 'telegram_setup.py')
setup = importlib.util.module_from_spec(setup_spec)
if (SCRIPT.parent / 'telegram_setup.py').exists():
    setup_spec.loader.exec_module(setup)


class NotificationTests(unittest.TestCase):
    def test_event_formats_project_task_and_result_without_claiming_success(self):
        self.assertTrue(hasattr(notify, 'format_message'), 'event formatter is missing')
        message = notify.format_message({'cwd': '/tmp/中文项目', 'input-messages': ['修复登录错误'],
                                        'last-assistant-message': '测试通过。', 'status': 'success'})
        for expected in ['中文项目', '/tmp/中文项目', '修复登录错误', '测试通过。', '执行结果未验证']:
            self.assertIn(expected, message)
        self.assertNotIn('状态：成功', message)

    def test_null_and_wrong_typed_fields_are_safe(self):
        self.assertTrue(hasattr(notify, 'format_message'), 'event formatter is missing')
        for event in [{}, {'cwd': None, 'input-messages': None, 'last-assistant-message': None},
                      {'cwd': {}, 'input-messages': [{'secret': 'private'}], 'last-assistant-message': []}]:
            self.assertIn('执行结果未验证', notify.format_message(event))
            self.assertNotIn('private', notify.format_message(event))

    def test_old_conversation_is_not_included(self):
        self.assertTrue(hasattr(notify, 'format_message'), 'event formatter is missing')
        message = notify.format_message({'input-messages': ['OLD_CONVERSATION', '本轮任务']})
        self.assertNotIn('OLD_CONVERSATION', message)
        self.assertIn('本轮任务', message)

    def test_secrets_are_redacted_before_truncation(self):
        self.assertTrue(hasattr(notify, 'redact'), 'redactor is missing')
        values = ['123456789:AA' + 'x' * 32, 'sk-proj-' + 'z' * 40,
                  'ghp_' + 'g' * 36, 'my-password-value', 'a-secret-with-spaces',
                  'q' * 40, 'key-on-next-line', 'hidden-uri-password']
        text = ('Token: ' + values[0] + '\napi_key="' + values[1] + '"\n' + values[2]
                + '\npassword=' + values[3] + '\n密码：' + values[4]
                + '\nAuthorization: Bearer ' + values[5]
                + '\napi-key:\n' + values[6]
                + '\nhttps://user:' + values[7] + '@example.com/private\n')
        clean = notify.redact(text)
        for value in values:
            self.assertNotIn(value, clean)

    def test_private_key_and_known_token_never_appear(self):
        self.assertTrue(hasattr(notify, 'redact'), 'redactor is missing')
        clean = notify.redact('a KNOWN_SECRET b\n-----BEGIN RSA PRIVATE KEY-----\nKEY_BODY\n-----END RSA PRIVATE KEY-----', ['KNOWN_SECRET'])
        self.assertNotIn('KNOWN_SECRET', clean)
        self.assertNotIn('KEY_BODY', clean)

    def test_markdown_labels_spaced_keys_and_database_uris_are_redacted(self):
        for text in ['**Password**: demo1234', 'API Key: demo1234', '`access key`: demo1234',
                     'postgresql://user:demo1234@localhost/db', 'redis://:demo1234@localhost',
                     '密码为 demo1234', '**API_KEY** = "demo1234"']:
            self.assertNotIn('demo1234', notify.redact(text), text)

    def test_lock_contention_is_bounded_and_does_not_send(self):
        import fcntl
        import time
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(notify, 'STATE_DIR', Path(temp)):
            notify.save_credentials({'token': 'fake-secret', 'chat_id': 123})
            with (Path(temp) / 'dispatch.lock').open('w') as lock:
                fcntl.flock(lock, fcntl.LOCK_EX)
                started = time.monotonic()
                # A separate process retains normal OS lock semantics.
                code = ("import sys; from pathlib import Path; sys.path.insert(0, sys.argv[1]); "
                        "import telegram_notify as n; n.STATE_DIR=Path(sys.argv[2]); "
                        "n.handle_event({'type':'agent-turn-complete'})")
                try:
                    result = subprocess.run([sys.executable, '-c', code, str(SCRIPT.parent), temp],
                                            capture_output=True, timeout=4)
                except subprocess.TimeoutExpired:
                    self.fail('notifier blocked indefinitely behind another handler')
                self.assertEqual(result.returncode, 0)
                self.assertLess(time.monotonic() - started, 4)
                self.assertIn('dispatch_busy', (Path(temp) / 'events.jsonl').read_text())

    def test_emoji_and_long_text_fit_telegram_limit(self):
        self.assertTrue(hasattr(notify, 'format_message'), 'event formatter is missing')
        message = notify.format_message({'cwd': '/tmp/' + '😀' * 4000,
                                        'input-messages': ['中文😀' * 5000],
                                        'last-assistant-message': '结果😀' * 10000})
        self.assertLessEqual(len(message.encode('utf-16-le')) // 2, 4096)
        self.assertIn('🕒', message)

    def test_notifier_ignores_other_events_and_invalid_json(self):
        import shutil
        with tempfile.TemporaryDirectory() as temp:
            isolated = Path(temp) / SCRIPT.name
            shutil.copyfile(SCRIPT, isolated)
            for payload in ['{invalid', 'null', '[]', '{"type":"approval-requested"}']:
                result = subprocess.run([sys.executable, str(isolated), payload], capture_output=True)
                self.assertEqual(result.returncode, 0)
                self.assertEqual(result.stdout, b'')
                self.assertNotIn(b'Traceback', result.stderr)

    def test_missing_credentials_and_network_failures_do_not_break_codex(self):
        self.assertTrue(hasattr(notify, 'handle_event'), 'handler is missing')
        with tempfile.TemporaryDirectory() as temp:
            with mock.patch.object(notify, 'STATE_DIR', Path(temp)):
                self.assertEqual(notify.handle_event({'type': 'agent-turn-complete'}), 0)
                cfg = {'token': 'fake-secret', 'chat_id': 123}
                with mock.patch.object(notify, 'load_credentials', return_value=cfg), \
                     mock.patch.object(notify, 'api_call', side_effect=OSError('fake-secret network-error')):
                    self.assertEqual(notify.handle_event({'type': 'agent-turn-complete'}), 0)
                logs = (Path(temp) / 'events.jsonl').read_text()
                self.assertNotIn('fake-secret', logs)
                self.assertNotIn('network-error', logs)

    def test_credentials_and_logs_are_user_only(self):
        self.assertTrue(hasattr(notify, 'save_credentials'), 'credential writer is missing')
        with tempfile.TemporaryDirectory() as temp:
            with mock.patch.object(notify, 'STATE_DIR', Path(temp)):
                notify.save_credentials({'token': 'fake-secret', 'chat_id': 123})
                self.assertEqual((Path(temp) / 'credentials.json').stat().st_mode & 0o777, 0o600)
                self.assertEqual(Path(temp).stat().st_mode & 0o777, 0o700)
                self.assertEqual(notify.load_credentials()['chat_id'], 123)
                os.chmod(Path(temp) / 'credentials.json', 0o644)
                with self.assertRaises(notify.SafeError):
                    notify.load_credentials()

    def test_api_uses_https_post_and_validates_response_without_leaking_errors(self):
        self.assertTrue(hasattr(notify, 'api_call'), 'API client is missing')
        response = mock.MagicMock()
        response.__enter__.return_value.read.return_value = b'{"ok":true,"result":{"id":123}}'
        with mock.patch.object(notify.urllib.request, 'urlopen', return_value=response) as request:
            self.assertEqual(notify.api_call('fake-secret', 'getMe'), {'id': 123})
            req = request.call_args.args[0]
            self.assertTrue(req.full_url.startswith('https://api.telegram.org/bot'))
            self.assertEqual(req.method, 'POST')
            self.assertLessEqual(request.call_args.kwargs['timeout'], 10)
            self.assertTrue(request.call_args.kwargs['context'].check_hostname)
        response.__enter__.return_value.read.return_value = b'{"ok":false,"error_code":401,"description":"fake-secret"}'
        with mock.patch.object(notify.urllib.request, 'urlopen', return_value=response):
            with self.assertRaises(notify.SafeError) as caught:
                notify.api_call('fake-secret', 'getMe')
            self.assertNotIn('fake-secret', str(caught.exception))

    def test_duplicate_real_event_is_sent_once(self):
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(notify, 'STATE_DIR', Path(temp)):
            notify.save_credentials({'token': 'fake-secret', 'chat_id': 123})
            event = {'type': 'agent-turn-complete', 'thread-id': 'thread-1', 'turn-id': 'turn-1'}
            with mock.patch.object(notify, 'api_call', return_value={'message_id': 12}) as api:
                notify.handle_event(event)
                notify.handle_event(event)
                self.assertEqual(api.call_count, 1)


class SetupTests(unittest.TestCase):
    def setUp(self):
        # Keep mocked live-test messages out of the offline regression output.
        output = mock.patch('builtins.print')
        output.start()
        self.addCleanup(output.stop)

    def test_setup_retries_temporary_read_failure_without_reentering_token(self):
        self.assertTrue(hasattr(setup, 'read_api_call'), 'setup read retry is missing')
        with mock.patch.object(notify, 'api_call', side_effect=[notify.SafeError('network_unavailable'),
                                                               {'url': ''}]) as api, \
             mock.patch.object(setup.time, 'sleep'):
            self.assertEqual(setup.read_api_call('fake-secret', 'getWebhookInfo'), {'url': ''})
            self.assertEqual(api.call_count, 2)

    def test_setup_read_retries_are_bounded_and_token_errors_are_not_retried(self):
        self.assertTrue(hasattr(setup, 'read_api_call'), 'setup read retry is missing')
        for code, calls in [('network_timeout', 4), ('telegram_http_401', 1),
                            ('tls_certificate_error', 1), ('telegram_http_503', 4)]:
            with mock.patch.object(notify, 'api_call', side_effect=notify.SafeError(code)) as api, \
                 mock.patch.object(setup.time, 'sleep'):
                with self.assertRaises(notify.SafeError) as error:
                    setup.read_api_call('fake-secret', 'getWebhookInfo')
                self.assertEqual(api.call_count, calls)
                self.assertNotIn('fake-secret', str(error.exception))

    def test_read_retry_helper_rejects_send_message(self):
        self.assertTrue(hasattr(setup, 'read_api_call'), 'setup read retry is missing')
        with mock.patch.object(notify, 'api_call') as api:
            with self.assertRaises(notify.SafeError):
                setup.read_api_call('fake-secret', 'sendMessage')
            api.assert_not_called()

    def test_verify_propagates_failed_native_trigger_or_delivery(self):
        with mock.patch.object(setup.n, 'load_credentials', return_value={'token': 'fake-secret', 'chat_id': 123}), \
             mock.patch.object(setup, 'validate_bot'), mock.patch.object(setup, 'report_check'), \
             mock.patch.object(setup.n, 'send_message', return_value={'message_id': 1}), \
             mock.patch.object(setup, 'simulate', return_value=True), \
             mock.patch.object(setup, 'native_test', return_value=False):
            with self.assertRaises(notify.SafeError):
                setup.verify()

    def test_native_timeout_clears_previous_delivery_result(self):
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(notify, 'STATE_DIR', Path(temp)):
            setup.report_check('D_native_delivery', True)
            with mock.patch.object(setup, 'config_check', return_value=True), \
                 mock.patch.object(setup.subprocess, 'run', side_effect=subprocess.TimeoutExpired('codex', 120)):
                self.assertFalse(setup.native_test())
            report = json.loads((Path(temp) / 'verification.json').read_text())
            self.assertFalse(report['D_native_delivery']['passed'])

    def test_config_check_handles_cli_without_strict_features_support(self):
        # Installed alpha explicitly rejects strict-config for the features command.
        def run_command(args, **kwargs):
            return subprocess.CompletedProcess(args, 1 if '--strict-config' in args else 0, '', '')
        with tempfile.TemporaryDirectory() as temp:
            config = Path(temp) / 'config.toml'
            config.write_text('notify = ' + json.dumps(setup.COMMAND))
            with mock.patch.object(setup, 'CONFIG', config), \
                 mock.patch.object(notify, 'STATE_DIR', Path(temp)), \
                 mock.patch.object(setup.subprocess, 'run', side_effect=run_command):
                self.assertTrue(setup.config_check())

    def test_only_matching_recent_private_start_is_accepted(self):
        self.assertTrue(hasattr(setup, 'matching_chat'), 'private-chat binding is missing')
        def update(chat_id, text, date=100, kind='private'):
            return {'message': {'date': date, 'text': text, 'chat': {'id': chat_id, 'type': kind},
                                'from': {'id': chat_id, 'is_bot': False}}}
        updates = [update(10, '/start wrong'), update(20, '/start challenge', kind='group'),
                   update(30, '/start challenge', date=1), update(40, '/start challenge')]
        self.assertEqual(setup.matching_chat(updates, 'challenge', 95), 40)
        self.assertIsNone(setup.matching_chat(updates[:3], 'challenge', 95))

    def test_registration_preserves_existing_values_and_is_idempotent(self):
        self.assertTrue(hasattr(setup, 'register_notify'), 'config registration is missing')
        import tomllib
        with tempfile.TemporaryDirectory() as temp:
            config = Path(temp) / 'config.toml'
            before = 'model = "existing-model"\nmodel_reasoning_effort = "high"\n\n[mcp_servers.example]\ncommand = "example"\n'
            config.write_text(before)
            command = ['/absolute/python3', '/absolute/telegram_notify.py']
            setup.register_notify(config, command)
            after = config.read_bytes()
            parsed = tomllib.loads(after.decode())
            self.assertEqual(parsed.pop('notify'), command)
            self.assertEqual(parsed, tomllib.loads(before))
            self.assertEqual(len(list(Path(temp).glob('config.toml.telegram-backup-*'))), 1)
            setup.register_notify(config, command)
            self.assertEqual(config.read_bytes(), after)
            self.assertEqual(len(list(Path(temp).glob('config.toml.telegram-backup-*'))), 1)

    def test_existing_unrelated_notify_is_never_overwritten(self):
        self.assertTrue(hasattr(setup, 'register_notify'), 'config registration is missing')
        with tempfile.TemporaryDirectory() as temp:
            config = Path(temp) / 'config.toml'
            before = 'notify = ["/existing/notifier"]\n[features]\n'
            config.write_text(before)
            with self.assertRaises(notify.SafeError):
                setup.register_notify(config, ['/python', '/new'])
            self.assertEqual(config.read_text(), before)

    def test_unregistration_removes_only_our_notify(self):
        self.assertTrue(hasattr(setup, 'unregister_notify'), 'config unregistration is missing')
        with tempfile.TemporaryDirectory() as temp:
            config = Path(temp) / 'config.toml'
            before = 'model = "keep-this"\n[tui]\nnotifications = true\n'
            config.write_text(before)
            command = ['/python', '/notify.py']
            setup.register_notify(config, command)
            setup.unregister_notify(config, command)
            self.assertEqual(config.read_text(), before)


if __name__ == '__main__':
    unittest.main()
```

## 三、配置与命令

### 3.1 放置脚本与注册用户级 notify

本机文件已安装。复制到另一台机器时，先把上述代码分别保存到实际配置目录，再执行：

```bash
# 本机 Python 入口；其他机器替换为可用的 Python 3.11+ 解释器
/usr/local/bin/python3 /Users/apple/.codex/telegram_setup.py register
```

工具先备份 `config.toml`，只添加顶层 `notify`，不会覆盖模型、推理等级、MCP、审批或沙箱设置。重复执行不会重复添加。已有其他 notifier 时停止，保留已有用途，避免静默覆盖。

本机注册结果（应位于 TOML 首个表声明之前）：

```toml
notify = ["/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12", "/Users/apple/.codex/telegram_notify.py"]
```

### 3.2 首次安全初始化

先在 `@BotFather` 对目标机器人执行 `/revoke`，取得新 Token。仅因网络错误重跑初始化时，可继续使用刚刚换发且未再暴露的同一个新 Token，无需再次撤销。

```bash
/usr/local/bin/python3 /Users/apple/.codex/telegram_setup.py setup
```

1. 第一条提示输入大写 `REVOKED`，确认已经撤销旧 Token。这里不能输入 Token，且大小写必须匹配。
2. 下一条“新 Bot Token（隐藏输入）”提示中输入新 Token，回车提交；不要粘贴到 Agent 聊天。
3. 按终端输出打开本次专属 Telegram 绑定链接并点击 Start，或发送完整的一次性 `/start` 命令。
4. 工具读取 `getUpdates`、校验私人聊天后，以权限 600 保存凭证，随后执行 A/B/C/D 验证。
5. 凭证只有在聊天校验成功后才保存；此前退出需要重新隐藏输入，但不需要因临时网络错误再次 `/revoke`。

`read -rs TG_TOKEN` 只在执行它的当前 Shell 中保存变量；代理执行的另一个进程不会自动继承未导出的变量。本次最终使用初始化工具的 `getpass`，避免依赖跨终端传递 Token。

### 3.3 日常维护

```bash
# 一条固定测试消息
python3 ~/.codex/telegram_setup.py test

# 直接运行脚本模拟事件，不能替代原生集成测试
python3 ~/.codex/telegram_setup.py simulate

# 启动真实 Codex 只读会话，验证原生触发与 Telegram 投递
python3 ~/.codex/telegram_setup.py native-test

# 完整复测 A/B/C/D
python3 ~/.codex/telegram_setup.py verify

# 查看安全状态和测试结果，不显示凭证
python3 ~/.codex/telegram_setup.py status

# 立即关闭 / 开启后续通知
python3 ~/.codex/telegram_setup.py disable
python3 ~/.codex/telegram_setup.py enable

# Token 轮换：先去 BotFather revoke，再重新隐藏输入和绑定
python3 ~/.codex/telegram_setup.py setup

# 移除受管 notify、两个脚本、凭证及私有状态，保留原配置备份
python3 ~/.codex/telegram_setup.py uninstall

# 离线回归，不访问 Telegram、不读取真实凭证
python3 -m unittest discover -s ~/.codex/telegram-notify -p 'test_*.py' -v
```

开关文件会在脚本后续调用时读取，单纯开关不需要重新注册。

### 3.4 日常启动与后台配置生效

> 当前状态（2026-10-27，用户确认）：**后台尚未重启**。下面的后台重启和普通 `codex` 通知复测仍为待办，不能记作已完成或已验证。

**不必为了 Telegram 通知永久给每条启动命令加 `--no-daemon`。** 它的含义是绕过共享后台，启动独立进程，适合排障和自检；通知机制本身并不要求禁用 daemon。共享后台加载最新配置并验证普通启动路径后，日常继续使用 `codex` 即可。

新开对话与重新加载后台配置是两件事。新聊天仍可能连接已运行的共享后台；完全退出桌面应用也不保证独立后台服务已经停止。旧对话同样可以在新进程中通过 resume 继续，不必为了通知丢弃会话历史。

本次后续检查（2026-10-27）：通知开关开启、凭证权限正常、全局 notify 已登记；最近成功投递时间为 11:43，12:06 检查时之后没有新的脚本触发记录。当前会话父进程是从 10 月 20 日运行的共享 app-server；`codex app-server daemon version` 显示后台版本 `0.162.0-alpha.17.2`，CLI 入口版本 `0.163.0-alpha.10.2`。这些证据与旧后台或客户端路径没有触发新配置的情况一致，尚不能单凭进程运行时间确定全部原因。

等所有任务结束后，重启一次后台，再正常启动。重启会影响连接它的会话；当前还没有执行这一步，也没有修改后台或 CLI 版本。

```bash
# 只读检查入口和后台版本
codex app-server daemon version

# 所有任务结束后，重启一次共享后台；不会自动更新后台版本
codex app-server daemon restart

# 日常启动：先用普通入口完成一个简单任务并检查 Telegram
codex

# 共享后台路径仍有问题时的临时排障方式
codex --no-daemon

# 在独立进程中选择继续已有对话
codex --no-daemon resume
```

用普通 `codex` 完成一个简单任务，确认收到通知后，日常就无需加参数。**重启后的共享后台路径目前仍待验证；若仍无通知，可暂时继续用 `--no-daemon`。**

CLI 会话中也可输入 `/daemon` 查看后台管理选项。若重启后普通 `codex` 仍没有收到通知，先检查版本、运行主机、实际 CODEX_HOME 以及 events.jsonl 是否出现 received/sent；必要时通过 `/daemon` 查看使用当前 CLI 构建的选项，确认影响后再操作。不要把“独立进程自检通过”写成“当前共享后台和桌面会话也已验证”。`codex agents` 使用共享服务，不支持 `--no-daemon`。

`test` 只能验证 Telegram 发送，`native-test` 默认通过独立 CLI 验证原生触发；两者都不能证明普通共享后台入口已验证。普通启动路径是否恢复，需要在后台处理后实际完成任务并确认 Telegram 投递。

参考：[官方 CLI 参数](https://learn.chatgpt.com/docs/cli/reference)、[后台与会话命令](https://learn.chatgpt.com/docs/developer-commands)。

## 四、复现 Checklist

### 脚本与配置

- [ ] 确认 `codex --version`、Python 版本及实际 `CODEX_HOME`，检查已有 notify 用途。
- [ ] 将完整脚本和离线测试保存到对应目录，脚本使用当前用户可读权限。
- [ ] 备份配置并添加顶层 notify，解析 TOML，比较其余字段没有变化。
- [ ] 运行离线测试；本次最终 23 项通过。

### 凭证与聊天

- [ ] 已撤销聊天中暴露的旧 Token，只在本地隐藏输入新 Token。
- [ ] `getMe` 返回成功且用户名匹配；检查 Webhook 时没有修改现有配置。
- [ ] 用本次随机 `/start` 口令绑定本人私人聊天。
- [ ] 凭证文件 600、目录 700，当前用户拥有，Token 不进入仓库。

### A/B/C/D 验收

| 验证项 | 本次结果 | 核验依据 |
| --- | --- | --- |
| A getMe | 通过 | Telegram API 返回成功，Bot 用户名匹配 |
| B 指定测试消息 | 通过 | 发送“✅ Codex Telegram 通知系统配置成功”，API 返回成功 |
| C 模拟事件发送 | 通过 | 构造合法 JSON 并实际运行通知处理器，记录 sent |
| D 配置加载 | 通过 | CLI 读入用户配置，notify 解释器和脚本存在 |
| D 原生触发 | 通过 | 真实 Codex 只读会话 exit 0，最终标记匹配，脚本收到对应任务哈希 |
| D 原生投递 | 通过 | 同一原生事件出现 sent 记录 |
| 原配置与权限 | 通过 | 非 notify 字段与原备份一致，凭证 600、目录 700 |

最终验收记录时间：2026-10-27 11:22:08，Asia/Shanghai；记录在本机 `~/.codex/telegram-notify/verification.json`。原生触发和投递对应的布尔结果分别为 `D_native_trigger`、`D_native_delivery`，两者都必须为 true。23 项离线回归在此前已通过，不能把它们当作真实 Telegram API 测试。

## 五、踩坑记录

| 会话中遇到的现象 | 原因或已定位环节 | 实际处理 |
| --- | --- | --- |
| `read -rs TG_TOKEN` 没有给 Agent 配上 Token | 变量仅在执行命令的 Shell 内有效 | 改用本地初始化工具隐藏输入 |
| Token 粘贴进聊天 | 该 Token 已暴露，不能继续配置 | 明确拒绝使用，要求 BotFather revoke；笔记仅保留 `【已脱敏】` |
| `token_rotation_not_confirmed` | 输入了小写 `revoked`，或第一条确认文字不匹配 | 第一条输入大写 `REVOKED`，下一条隐藏提示才输入 Token |
| Python 首次 HTTPS 失败 | python.org 安装的解释器缺少默认 CA 文件，复现为证书校验错误 | macOS 下使用现有 `/etc/ssl/cert.pem`，保持证书与主机名校验 |
| 严格 CLI 配置检查失败 | alpha 版本不支持对 `codex features` 使用 `--strict-config` | 普通 features 命令验证配置加载，真实 exec 会话使用其支持的严格模式 |
| getMe 成功后 `network_unavailable` | 后续 getWebhookInfo 请求中断；当时还未落盘凭证 | 网络探测恢复后补入只读请求 4 次退避重试，并增加阶段提示 |
| getUpdates 读取时又出现短暂失败 | 绑定等待期间网络请求中断 | 自动重试后收到匹配 /start，最终安全保存 Chat ID 和新凭证 |
| 手动发送成功但原生未测 | 手动脚本执行不等于 CLI 已触发 | 用随机标记真实 CLI 会话关联收到及投递事件，最终双通过 |
| 独立原生自检成功，但已有会话完成后无通知 | 旧共享后台或客户端路径可能未触发新配置；后台与 CLI 版本也不一致 | 任务结束后重启后台，普通 codex 单独复测；no-daemon 仅作临时绕过 |

独立审查还修复了 Markdown 包裹密码标签、带空格的 API Key 标签和数据库 URI 中的凭证遗漏；同时修复完整验证丢弃原生失败返回值、全局锁无限等待、原生超时保留旧成功结果，以及测试写入真实日志目录的问题。相应回归用例先观察失败，再修复通过。

### 常见错误处理

- `credentials_missing`：尚未完成 setup，重新本地初始化；不要将 Token 发给 Agent。
- `telegram_http_401` / `telegram_api_401` / `telegram_http_404`：Token 无效或已撤销，换发后重新 setup。
- HTTP/API 400：Chat ID 可能无效，重新绑定自己的私人聊天；403 时检查是否屏蔽机器人。
- `network_timeout` / `network_unavailable`：检查本机网络和 HTTPS 代理；初始化会对只读请求有限重试。
- `tls_certificate_error`：检查可信 CA、代理证书及系统时间，不要关闭 TLS 验证。
- `webhook_exists_not_modified` / HTTP 409：已有 Webhook 或并行 getUpdates 消费者，先确认用途，不擅自删除。
- `private_start_not_received`：使用本次初始化链接，3 分钟内发送完整口令。超过 100 条未确认更新时，当前不确认队列的策略可能无法读取后续新口令。
- `dispatch_busy`：其他通知处理器占用锁，等待上限 2 秒后本次通知安全退出，不影响 Codex。

## 六、文件清单

| 文件 | 必须或视情况 | 作用 |
| --- | --- | --- |
| `~/.codex/telegram_notify.py` | 必须 | Codex 单 JSON 参数事件处理与 Telegram 发送 |
| `~/.codex/telegram_setup.py` | 必须 | 安全输入、绑定、注册、验证和维护 |
| `~/.codex/config.toml` | 修改 | 顶层全局 notify，其他设置保留 |
| `~/.codex/config.toml.telegram-backup-*` | 自动生成 | 变更前备份，不应提交到公开仓库 |
| `~/.codex/telegram-notify/credentials.json` | 运行时私密文件 | Token 和 Chat ID，禁止复制进此笔记库 |
| `~/.codex/telegram-notify/test_telegram_notify.py` | 建议 | 本笔记附完整离线测试 |
| `~/.codex/telegram-notify/verification.json` | 自动生成 | A/B/C/D 可核验状态 |
| `~/.codex/telegram-notify/events.jsonl` | 自动生成 | 固定错误码、时间及任务哈希，轮转日志 |
| `~/.codex/telegram-notify/disabled` | 可选 | 存在时关闭后续通知 |
| `~/.codex/telegram-notify/README.txt` | 本机维护文档 | 开关、轮换、卸载与排障说明 |

相关笔记：[[Codex CLI-终端使用]]、[[GPT 订阅与 Codex 登录使用]]。

参考：[Codex 官方 notify 配置](https://developers.openai.com/codex/config-advanced#notifications)、[Telegram Bot API](https://core.telegram.org/bots/api)、[getUpdates](https://core.telegram.org/bots/api#getupdates)、[sendMessage](https://core.telegram.org/bots/api#sendmessage)。这些链接为本次实施时使用的官方资料，版本行为以实际安装的 CLI 为准。

## 七、2026-10-28 Linux 本机迁移与验收

### 7.1 环境与结果

本次在 `yuan-Legion-Y7000-IRX9` 安装用户级通知，未修改笔记库以外的项目配置，未重启共享后台，也未更新 CLI 或后台版本。

| 项目 | Linux 本机取值或结果 |
| --- | --- |
| 操作系统 | Linux |
| Codex CLI | `0.164.0` |
| CLI 入口 | `/home/yuan/.nvm/versions/node/v22.20.0/bin/codex` |
| 已运行的共享后台 | `0.165.0`，本次未重启 |
| 实际配置目录 | `/home/yuan/.codex`，未设置其他 `CODEX_HOME` |
| Python | 3.13.13，初始化命令使用 `/home/yuan/miniconda3/bin/python3` |
| 新机器人 | 名称 `yuan`，用户名 `@yuan_codex_notify_1028_bot` |
| 网络预检 | Telegram HTTPS 返回 200，无需新增代理配置 |
| 全局配置 | 原来没有 `notify`；新增顶层设置，其余解析后的 TOML 字段与备份一致 |
| 文件权限 | 凭证 600、状态目录 700；配置与备份 600、两个脚本 700 |
| 离线回归 | 原有 23 项全部通过 |

本机实际登记的解释器路径由 `sys.executable` 解析得到：

```toml
notify = ["/home/yuan/miniconda3/bin/python3.13", "/home/yuan/.codex/telegram_notify.py"]
```

本次配置备份为 `~/.codex/config.toml.telegram-backup-20261028-102101-109124`。备份也可能含原有私密配置，保留在用户目录，不复制进笔记库。

### 7.2 从第二章完整代码复现 Linux 安装

第二章的通知处理器和 23 项测试继续复用；Linux 版初始化工具有三处行为差异：

- 校验本机新建的 `yuan_codex_notify_1028_bot`，不再校验 Mac 使用的机器人。
- 接受大写 `SAFE` 或 `REVOKED`，新建且未泄露的 Token 不要求撤销；只有已泄露的 Token 才需先换发。若两台电脑共用同一个机器人，再次撤销会使使用旧 Token 的电脑失效。
- 独立 CLI 自检增加 `--ephemeral`，其余原生事件关联和投递判定保持不变。

下面是完整的安装转换脚本：直接读取本笔记第二章三个完整代码块，替换上述差异和 shebang；仅允许创建文件或保留内容完全相同的已有文件，遇到不同内容先停止。它不会读取或生成真实凭证，也不会自动重跑初始化。换到其他机器时替换笔记路径，并使用该机器的 Python 3.11+；若换机器人，同时修改代码中的目标用户名和提示文字。

```bash
/home/yuan/miniconda3/bin/python3 - "/home/yuan/obsidian/ewige_wiederkunft/Documents/I.P.A.R.A/学习领域/收集/Codex CLI Telegram 任务完成通知.md" <<'PY'
from pathlib import Path
import ast
import os
import sys

source = Path(sys.argv[1]).read_text(encoding='utf-8')
codex_dir = Path(os.environ.get('CODEX_HOME', Path.home() / '.codex'))
state_dir = codex_dir / 'telegram-notify'
files = []
for heading, name in [
    ('### 2.1 通知处理器', 'telegram_notify.py'),
    ('### 2.2 安全初始化和维护工具', 'telegram_setup.py'),
    ('### 2.3 离线安全与行为回归测试', 'telegram-notify/test_telegram_notify.py'),
]:
    section = source.split(heading, 1)[1]
    code = section.split('```python\n', 1)[1].split('\n```', 1)[0] + '\n'
    if code.startswith('#!/usr/local/bin/python3'):
        code = '#!' + sys.executable + '\n' + code.split('\n', 1)[1]
    if name == 'telegram_setup.py':
        replacements = [
            ("BOT_USERNAME = 'my_codex_notify_1027_bot'",
             "BOT_USERNAME = 'yuan_codex_notify_1028_bot'"),
            ("    print('旧 Token 已泄露。先在 @BotFather 用 /revoke 更换此机器人的 Token。')\n"
             "    if input('已撤销旧 Token 并取得新 Token 后，输入 REVOKED：').strip() != 'REVOKED':",
             "    print('请使用 @yuan_codex_notify_1028_bot 的新 Token，只在下一条隐藏输入提示中输入。')\n"
             "    print('新创建且未泄露的 Token 无需 /revoke；若已泄露，先在 @BotFather 撤销并换发。')\n"
             "    if input('确认将使用安全 Token 后输入 SAFE（也接受 REVOKED）：').strip() not in {'SAFE', 'REVOKED'}:"),
            ("'--skip-git-repo-check', '--json', '-C', directory, prompt]",
             "'--skip-git-repo-check', '--ephemeral', '--json', '-C', directory, prompt]"),
        ]
        for old, new in replacements:
            if code.count(old) != 1:
                raise SystemExit('Source snapshot changed: ' + name)
            code = code.replace(old, new, 1)
    ast.parse(code)
    target = codex_dir / name
    if target.is_symlink() or (target.exists() and target.read_text(encoding='utf-8') != code):
        raise SystemExit('Existing different file preserved: ' + str(target))
    files.append((target, code, 0o700 if '/' not in name else 0o600))
if state_dir.is_symlink():
    raise SystemExit('State directory symlink preserved; installation stopped')
state_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
if state_dir.stat().st_uid != os.getuid():
    raise SystemExit('State directory is not owned by current user')
os.chmod(state_dir, 0o700)
for target, code, mode in files:
    if not target.exists():
        fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(code)
    print('Ready:', target)
PY
```

文件放置完成后，先离线验证，再注册用户级配置。注册工具自动备份原配置并检查其他字段不变；若已有不同的 `notify`，保留并停止，先确认原用途。

```bash
/home/yuan/miniconda3/bin/python3 -m unittest discover -s /home/yuan/.codex/telegram-notify -p 'test_*.py' -v
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py register
```

### 7.3 创建机器人与隐藏输入绑定

本次为 Linux 单独创建机器人：在 [BotFather](https://t.me/BotFather) 发送 `/newbot`，名称输入 `yuan`，用户名输入 `yuan_codex_notify_1028_bot`。以后重装这台电脑时复用已创建的机器人，无需再次创建。

BotFather 返回的真实 Token 只在本地交互终端的隐藏输入提示中粘贴，不写进命令参数、聊天或本笔记。

```bash
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py setup
```

1. 第一条确认提示输入大写 `SAFE`，回车；不要在这里输入 Token。
2. 下一条隐藏输入提示中粘贴这个新机器人的有效 Token，回车；屏幕不显示输入内容是正常现象。
3. `getMe` 成功后，保持终端程序等待，立即打开它**本次生成的新链接**，在 Telegram 点击 **Start／开始**。
4. 若没有 Start 按钮，给 [本机机器人](https://t.me/yuan_codex_notify_1028_bot) 发送终端本次显示的完整 `/start codex_…` 命令；不能只发送 `/start`，也不能复用上一次初始化的口令。
5. 工具在 3 分钟内识别匹配的近期私人消息，保存凭证，随后自动执行 A/B/C/D 验收。

链接示意只说明结构，不是可复用的实际绑定链接：

```text
https://t.me/yuan_codex_notify_1028_bot?start=【已脱敏】
/start 【已脱敏】
```

第一次绑定已通过 `getMe`，中途出现一次 `network_timeout` 并自动重试，最后为 `private_start_not_received`。可确认的是等待期内没有读到符合本次口令的私人消息，不能仅凭该输出认定 Token 无效或确定网络是唯一原因。重新执行 setup、使用新链接完成绑定后成功，未创建第二个机器人、未换发 Token，也未删除 Webhook。

### 7.4 已验证的入口与证据

时间均为 2026-10-28，Asia/Shanghai；记录位于本机 `~/.codex/telegram-notify/verification.json`，只查安全状态，不展示凭证。

| 验证项 | 结果 | 证据与范围 |
| --- | --- | --- |
| A 机器人身份 | 通过 | 10:35:02，`A_getMe=true`，用户名匹配新机器人 |
| B 指定测试消息 | 通过 | 10:35:03，`B_test_message=true`，Telegram API 返回成功 |
| C 模拟事件投递 | 通过 | 10:35:06，`C_simulated_event_delivery=true` |
| D 用户级配置加载 | 通过 | `D_config_load=true`，最后一次检查 10:36:10 |
| D 独立 CLI 原生触发与投递 | 通过 | 10:35:22，`D_native_trigger=true`、`D_native_delivery=true`；exit 0、最终标记匹配且事件已投递 |
| E 普通 CLI 入口触发与投递 | 通过 | 10:36:33，`E_default_cli_trigger=true`、`E_default_cli_delivery=true`；没有传 `--no-daemon`，exit 0、标记匹配且事件已投递 |
| 凭证与原配置 | 通过 | 凭证 600、状态目录 700；非 notify 字段与变更前备份一致 |
| 桌面端已有会话 | 待单独确认 | 用户尚未确认本桌面会话结束后收到对应通知；普通 CLI 测试不能替代这项验收 |

普通 CLI 测试复用了初始化工具的原生验证函数，仅在本次测试进程内去掉 `--no-daemon`，并把原生检查记录写到 `E_default_cli_*`，未修改持久化脚本或启动／重启后台。完整复测命令如下，会产生一条真实 Telegram 自检通知：

```bash
/home/yuan/miniconda3/bin/python3 - <<'PY'
import sys
sys.path.insert(0, '/home/yuan/.codex')
import telegram_setup as setup

original_run = setup.subprocess.run
original_report = setup.report_check

def ordinary_run(args, **kwargs):
    return original_run([arg for arg in args if arg != '--no-daemon'], **kwargs)

def shared_report(name, passed, detail=''):
    if name.startswith('D_native_'):
        name = name.replace('D_native_', 'E_default_cli_', 1)
    original_report(name, passed, detail)

setup.subprocess.run = ordinary_run
setup.report_check = shared_report
print('Testing ordinary CLI entry (without --no-daemon); shared backend will not be restarted.', flush=True)
sys.exit(0 if setup.native_test() else 1)
PY
```

结论：**本机普通 CLI 入口已验证，无需为了通知永久添加 `--no-daemon`；本次也没有为此重启后台。** 这不代表第 3.4 节 Mac 的历史待办已完成，也不能直接证明桌面已有会话已经加载新配置。

桌面端应实际完成一个简单任务并确认收到对应通知；若没有，先重新打开应用复测。若仍无通知，再检查后台版本、实际 `CODEX_HOME` 和安全事件日志；如需重启共享后台，等连接它的任务结束后再操作，避免中断任务。

### 7.5 本机维护与复现检查

```bash
# 查看开关、凭证权限、注册和验收记录，不打印 Token 或 Chat ID
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py status

# 固定测试消息；只能证明 Telegram 发送
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py test

# 完整 A/B/C/D 复测；其 native-test 默认使用独立 CLI
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py verify

# 暂停或恢复后续通知
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py disable
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py enable
```

- [x] 安装两个脚本和完整离线测试，23 项通过。
- [x] 注册顶层全局 notify，保留其他设置并生成私有备份。
- [x] 新机器人身份、私人聊天绑定、凭证权限通过。
- [x] 固定测试消息、模拟事件和独立 CLI 原生投递通过。
- [x] 未加 `--no-daemon` 的普通 CLI 入口投递通过。
- [ ] 桌面已有会话结束后收到对应通知，单独记录用户确认。

本机脚本与私密运行文件仍位于 `~/.codex`；本笔记只收录复现代码、公开机器人用户名与验收结论，不收录凭证、真实 Chat ID、一次性口令或完整通知内容。维护说明见本机 `~/.codex/telegram-notify/README.txt`。

### 7.6 终端旧会话未通知：共享后台重启记录

2026-10-28，用户明确反馈未收到通知的是**终端 Codex**，并授权重启。此前按桌面端排查的判断不适用于这条反馈；第 7.4 节的新建 CLI 自检通过，也不能证明 09:25 已启动的原终端会话已加载通知配置。

检查发现：终端 CLI 客户端和共享后台均于 09:25 启动，早于 10:21 注册 notify；通知开关、凭证和全局配置正常。旧进程或既有会话未加载新配置是待验证原因，不能仅凭启动时间认定根因。

经用户授权，于 13:40 执行：

```bash
codex app-server daemon restart
```

命令返回 `status=restarted`，共享后台版本仍为 `0.165.0`；没有更新版本，也没有重启整个终端窗口或桌面应用。13:41 通过不带 `--no-daemon` 的普通 CLI 入口重新完成真实自检，退出码为 0、最终标记匹配、原生事件已接收且 Telegram 投递成功。安全验收记录另存为 `F_after_restart_cli_trigger=true` 和 `F_after_restart_cli_delivery=true`。

原终端 CLI 客户端进程仍在；原会话重连后是否发送通知，仍需在原终端完成一个短任务确认。若界面未重连或仍无通知，可退出当前 Codex 客户端，再用会话选择器恢复原对话：

```bash
codex resume
```

无需再次绑定机器人或输入 Token。第 7.1、7.4 节“未重启后台”描述的是首次安装验收时的状态；本节记录其后实际执行的重启。桌面会话的通知仍未单独验收。

## 八、2026-10-29 长会话漏通知：参数长度根因与标准输入修复

### 8.1 根因与已完成的修复

用户在 `codex/tksea-20261027-012-logistics-prefill` 分支的原终端长会话中持续收不到通知。固定测试消息与短 `codex exec` 自检成功，不能证明这个交互会话的通知正常；此前依据这些自检建议重启，未覆盖实际故障。

这次将原会话 `task_complete` 时间与本机 Codex 运行日志对照，发现多次明确报错：

```text
run_legacy_after_agent_hook: after_agent hook failed; continuing
hook_name=legacy_notify error=Argument list too long (os error 7)
```

旧 notify 通过一个命令行参数传递事件 JSON。长会话中的事件参数超过本机 Linux 单参数长度上限时，系统在启动 Python 之前就拒绝进程；因此 `telegram_notify.py` 无法运行，安全日志也没有 received/failed 记录。此时在通知脚本内截断消息已经太晚，换 Token、重启终端或反复发送短测试均不能修复原因。

回归测试用 200,000 字节的单参数稳定复现 `E2BIG`；改为标准输入后，同样规模的事件可正常处理。本机现改用官方生命周期钩子，所有命令参数都是固定短字符串：

```text
UserPromptSubmit → JSON stdin → 缓存本轮脱敏摘要（最多 750 UTF-16 单位）
Stop             → JSON stdin → 同进程调用原通知处理器 → Telegram
```

已移除用户配置中的受管旧 notify，保留原通知处理器的凭证保护、脱敏、消息截断、事件去重和异常隔离。新钩子不读取对话历史，不缓存原始长提示词，处理结束后删除当前摘要；过期的中断轮次摘要在后续提交时清理。钩子输出空 JSON 决策，不阻断任务、不追加提示、不要求继续执行。

原终端长会话在 **2026-10-29 10:54:24（Asia/Shanghai）** 完成的新一轮任务，已按相同 thread/turn 去重标识匹配到真实 Telegram sent 记录，确认本次修复覆盖原会话；并非只验证了另一个短会话。此次未再次重启后台，也未重新绑定机器人。

### 8.2 标准输入适配器完整代码

文件：`~/.codex/telegram_hook.py`。它复用第二章完整的 `telegram_notify.py`；Mac shebang 改为实际 Python 路径即可，通知处理器本身没有逻辑改动。

```python
#!/home/yuan/miniconda3/bin/python3
"""Telegram lifecycle transport: JSON stdin, never full conversation argv."""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shlex
import sys
import time
import telegram_notify as n

HOOKS_FILE = n.CODEX_DIR / 'hooks.json'
COMMAND = shlex.join([str(Path(sys.executable).resolve()), str(Path(__file__).resolve())])
EVENTS = ('UserPromptSubmit', 'Stop')


def read_hooks():
    if HOOKS_FILE.is_symlink():
        raise n.SafeError('hooks_symlink_preserved')
    data = json.loads(HOOKS_FILE.read_text()) if HOOKS_FILE.exists() else {}
    if not isinstance(data, dict) or not isinstance(data.get('hooks', {}), dict):
        raise n.SafeError('invalid_hooks_file_preserved')
    return data


def registered() -> bool:
    try:
        hooks = read_hooks().get('hooks', {})
        return all(any(handler.get('command') == COMMAND and handler.get('type') == 'command'
                       for group in hooks.get(event, []) for handler in group.get('hooks', []))
                   for event in EVENTS)
    except Exception:
        return False


def register() -> None:
    data = read_hooks()
    hooks = data.setdefault('hooks', {})
    changed = False
    for event in EVENTS:
        groups = hooks.setdefault(event, [])
        if not any(handler.get('command') == COMMAND for group in groups for handler in group.get('hooks', [])):
            groups.append({'hooks': [{'type': 'command', 'command': COMMAND, 'timeout': 15}]})
            changed = True
    if changed:
        if HOOKS_FILE.exists():
            backup = HOOKS_FILE.with_name('hooks.json.telegram-backup-' + str(time.time_ns()))
            fd = os.open(backup, os.O_CREAT | os.O_WRONLY | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'w') as stream:
                stream.write(HOOKS_FILE.read_text())
        n.write_private(HOOKS_FILE, data)


def unregister() -> None:
    if not HOOKS_FILE.exists():
        return
    data = read_hooks()
    for event in EVENTS:
        groups = []
        for group in data.get('hooks', {}).get(event, []):
            handlers = [handler for handler in group.get('hooks', []) if handler.get('command') != COMMAND]
            if handlers:
                groups.append(dict(group, hooks=handlers))
        if groups:
            data['hooks'][event] = groups
        else:
            data.get('hooks', {}).pop(event, None)
    if data.get('hooks') or any(k != 'hooks' for k in data):
        n.write_private(HOOKS_FILE, data)
    else:
        HOOKS_FILE.unlink()


def cache_path(session: str, turn: str) -> Path:
    key = hashlib.sha256((session + '\0' + turn).encode()).hexdigest()
    return n.STATE_DIR / ('prompt-' + key + '.json')


def handle_hook(payload: dict) -> None:
    if not isinstance(payload, dict):
        return
    event = payload.get('hook_event_name')
    if event not in EVENTS:
        return
    n.ensure_state()
    if (n.STATE_DIR / 'disabled').exists():
        return
    session, turn = payload.get('session_id'), payload.get('turn_id')
    if not isinstance(session, str) or not session or not isinstance(turn, str) or not turn:
        raise n.SafeError('hook_identity_missing')
    path = cache_path(session, turn)
    if event == 'UserPromptSubmit':
        # Retain only a redacted, bounded task summary, never raw prompts or history.
        try:
            secrets = [n.load_credentials()['token']]
        except n.SafeError:
            secrets = []
        task = n.clip(n.redact(n.text_value(payload.get('prompt')), secrets), 750)
        n.write_private(path, {'task': task})
        for old in n.STATE_DIR.glob('prompt-*.json'):
            if old.stat().st_mtime < time.time() - 86400:
                old.unlink(missing_ok=True)
        return
    task = '（未捕获本轮任务描述）'
    try:
        fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
        with os.fdopen(fd, 'r') as stream:
            task = n.text_value(json.load(stream).get('task'), task)
    except (OSError, ValueError, AttributeError):
        pass
    event = {'type': 'agent-turn-complete', 'thread-id': session, 'turn-id': turn,
             'cwd': payload.get('cwd'), 'input-messages': [task],
             'last-assistant-message': payload.get('last_assistant_message')}
    n.log_event('hook_stop', event)
    n.handle_event(event)
    path.unlink(missing_ok=True)


def main() -> int:
    try:
        raw = sys.stdin.buffer.read(16 * 1024 * 1024 + 1)
        if len(raw) > 16 * 1024 * 1024:
            raise n.SafeError('hook_input_too_large')
        handle_hook(json.loads(raw))
    except n.SafeError as error:
        n.log_event('hook_failed', code=str(error))
    except Exception:
        n.log_event('hook_failed', code='invalid_hook_event')
    # An empty decision never changes, blocks or resumes the Codex task.
    print('{}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
```

### 8.3 现行维护工具完整代码

文件：`~/.codex/telegram_setup.py`。本版本的 live register、enable、setup 和 uninstall 管理标准输入钩子；临时配置文件上的旧 notify 注册函数仍保留，以兼容历史测试。`test` 只检查 Telegram 发送，`simulate` 只模拟通知处理器，二者均不能替代交互终端和长输入验收。

```python
#!/home/yuan/miniconda3/bin/python3
"""Local-only Telegram setup and maintenance. Never pass a token on the CLI."""
from __future__ import annotations

import argparse
import datetime as dt
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
import tomllib
import warnings

import telegram_notify as n
import telegram_hook as hook_transport

BOT_USERNAME = 'yuan_codex_notify_1028_bot'
PYTHON = str(Path(sys.executable).resolve())
NOTIFY = str(Path(n.__file__).resolve())
COMMAND = [PYTHON, NOTIFY]
CONFIG = n.CODEX_DIR / 'config.toml'
BEGIN = '# BEGIN CODEX TELEGRAM NOTIFY (managed by telegram_setup.py)\n'
END = '# END CODEX TELEGRAM NOTIFY\n\n'


def config_block(command: list[str]) -> str:
    return BEGIN + 'notify = ' + json.dumps(command, ensure_ascii=False) + '\n' + END


def config_write(config: Path, before: str, after: str) -> Path:
    # Validate before touching the original; preserve all non-notify parsed values.
    old, new = tomllib.loads(before), tomllib.loads(after)
    old.pop('notify', None)
    new.pop('notify', None)
    if old != new:
        raise n.SafeError('other_settings_would_change')
    suffix = dt.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    backup = config.with_name(config.name + '.telegram-backup-' + suffix)
    fd = os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as stream:
        stream.write(before)
    fd, temp = tempfile.mkstemp(prefix='.telegram-config-', dir=config.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(after)
        if config.exists() and config.read_text() != before:
            raise n.SafeError('config_changed_concurrently')
        os.replace(temp, config)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return backup


def register_notify(config: Path = CONFIG, command: list[str] = COMMAND):
    if config == n.CODEX_DIR / 'config.toml' and command == COMMAND:
        before = config.read_text() if config.exists() else ''
        parsed = tomllib.loads(before)
        if 'notify' in parsed and parsed['notify'] != command:
            raise n.SafeError('existing_notify_preserved')
        if 'notify' in parsed and not before.startswith(config_block(command)):
            raise n.SafeError('managed_notify_block_changed')
        hook_transport.register()
        if 'notify' in parsed:
            return config_write(config, before, before[len(config_block(command)):])
        return None
    if config.is_symlink():
        raise n.SafeError('config_symlink_not_modified')
    before = config.read_text() if config.exists() else ''
    parsed = tomllib.loads(before)
    if parsed.get('notify') == command:
        return None
    if 'notify' in parsed:
        raise n.SafeError('existing_notify_preserved')
    return config_write(config, before, config_block(command) + before)


def unregister_notify(config: Path = CONFIG, command: list[str] = COMMAND):
    if config == n.CODEX_DIR / 'config.toml' and command == COMMAND:
        hook_transport.unregister()
        if 'notify' not in tomllib.loads(config.read_text()):
            return None
    before = config.read_text()
    if tomllib.loads(before).get('notify') != command:
        raise n.SafeError('different_notify_preserved')
    block = config_block(command)
    if not before.startswith(block):
        raise n.SafeError('managed_notify_block_changed')
    return config_write(config, before, before[len(block):])


def matching_chat(updates: list, challenge: str, since: float):
    matches = set()
    for update in updates:
        if not isinstance(update, dict):
            continue
        message = update.get('message')
        if not isinstance(message, dict):
            continue
        chat, sender = message.get('chat'), message.get('from')
        if not isinstance(chat, dict) or not isinstance(sender, dict):
            continue
        text, date = message.get('text'), message.get('date')
        if (not isinstance(text, str) or type(date) not in (int, float)
                or date < since or chat.get('type') != 'private'
                or type(chat.get('id')) is not int or chat['id'] <= 0
                or sender.get('id') != chat['id'] or sender.get('is_bot') is not False):
            continue
        parts = text.strip().split()
        if len(parts) == 2 and parts[0].split('@')[0] == '/start' and parts[1] == challenge:
            matches.add(chat['id'])
    if len(matches) > 1:
        raise n.SafeError('ambiguous_private_chat')
    return next(iter(matches)) if matches else None


def report_check(name: str, passed: bool, detail: str = '') -> None:
    path = n.STATE_DIR / 'verification.json'
    try:
        report = json.loads(path.read_text()) if path.exists() else {}
    except (ValueError, OSError):
        report = {}
    report[name] = {'passed': passed, 'time': dt.datetime.now(dt.timezone.utc).isoformat(),
                    'detail': detail}
    n.write_private(path, report)


def read_api_call(token: str, method: str, params: dict | None = None):
    """Retry bounded read-only calls; never retry potentially delivered messages."""
    if method not in {'getMe', 'getWebhookInfo', 'getUpdates', 'getChat'}:
        raise n.SafeError('read_retry_method_not_allowed')
    retryable = {'network_unavailable', 'network_timeout',
                 'telegram_http_500', 'telegram_http_502', 'telegram_http_503', 'telegram_http_504',
                 'telegram_api_500', 'telegram_api_502', 'telegram_api_503', 'telegram_api_504'}
    for attempt in range(4):
        try:
            return n.api_call(token, method, params)
        except n.SafeError as error:
            code = str(error)
            if code not in retryable or attempt == 3:
                # method and code are fixed strings; exception/URL text is never printed.
                raise n.SafeError(method + '_' + code) from None
            delay = 2 ** attempt
            print(f'{method}：临时连接故障（{code}），{delay} 秒后重试 {attempt + 2}/4；无需重新输入 Token。',
                  flush=True)
            time.sleep(delay)


def validate_bot(token: str):
    bot = read_api_call(token, 'getMe')
    if (not isinstance(bot, dict) or bot.get('is_bot') is not True
            or bot.get('username', '').lower() != BOT_USERNAME.lower()):
        raise n.SafeError('unexpected_bot_identity')
    return bot


def setup_credentials() -> None:
    if not sys.stdin.isatty():
        raise n.SafeError('local_interactive_terminal_required')
    print('请使用 @yuan_codex_notify_1028_bot 的新 Token，只在下一条隐藏输入提示中输入。')
    print('新创建且未泄露的 Token 无需 /revoke；若已泄露，先在 @BotFather 撤销并换发。')
    if input('确认将使用安全 Token 后输入 SAFE（也接受 REVOKED）：').strip() not in {'SAFE', 'REVOKED'}:
        raise n.SafeError('token_rotation_not_confirmed')
    with warnings.catch_warnings():
        # Refuse getpass's echoed fallback when terminal echo cannot be disabled.
        warnings.simplefilter('error', getpass.GetPassWarning)
        token = getpass.getpass('新 Bot Token（隐藏输入，回车提交）：').strip()
    if not re.fullmatch(r'\d{5,}:[A-Za-z0-9_-]{20,}', token):
        raise n.SafeError('invalid_token_format')
    validate_bot(token)
    print('A：getMe 成功，机器人身份匹配。')
    print('正在检查 Webhook（只读取，不修改）……', flush=True)
    webhook = read_api_call(token, 'getWebhookInfo')
    if not isinstance(webhook, dict) or webhook.get('url'):
        raise n.SafeError('webhook_exists_not_modified')
    challenge = 'codex_' + secrets.token_hex(12)
    since = time.time() - 5
    print('\n请在 Telegram 打开此链接并点击 Start（开始），或给机器人发送下列完整命令：')
    print('https://t.me/' + BOT_USERNAME + '?start=' + challenge)
    print('/start ' + challenge)
    print('正在等待私人聊天绑定，最多 3 分钟；不会删除 Webhook 或确认/清空已有更新。', flush=True)
    deadline = time.monotonic() + 180
    chat_id = None
    while time.monotonic() < deadline:
        # No offset/allowed_updates: do not acknowledge updates or change subscriptions.
        updates = read_api_call(token, 'getUpdates', {'timeout': 0, 'limit': 100})
        if not isinstance(updates, list):
            raise n.SafeError('invalid_updates_response')
        chat_id = matching_chat(updates, challenge, since)
        if chat_id:
            break
        time.sleep(2)
    if not chat_id:
        raise n.SafeError('private_start_not_received')
    chat = read_api_call(token, 'getChat', {'chat_id': chat_id})
    if not isinstance(chat, dict) or chat.get('type') != 'private' or chat.get('id') != chat_id:
        raise n.SafeError('private_chat_validation_failed')
    n.save_credentials({'token': token, 'chat_id': chat_id, 'bot_username': BOT_USERNAME})
    token = None
    n.write_private(n.STATE_DIR / 'verification.json', {})
    (n.STATE_DIR / 'disabled').unlink(missing_ok=True)
    register_notify()
    print('新凭证已保存（目录 700，文件 600）；Chat ID 已安全绑定。')
    verify()


def read_records():
    records = []
    for path in [n.STATE_DIR / 'events.previous.jsonl', n.STATE_DIR / 'events.jsonl']:
        try:
            for line in path.read_text().splitlines():
                try:
                    record = json.loads(line)
                    if isinstance(record, dict):
                        records.append(record)
                except ValueError:
                    pass
        except OSError:
            pass
    return records


def simulate() -> bool:
    event = {'type': 'agent-turn-complete', 'thread-id': 'telegram-self-test',
             'turn-id': secrets.token_hex(10), 'cwd': str(n.CODEX_DIR),
             'input-messages': ['Telegram 模拟事件自检 ' + secrets.token_hex(8)],
             'last-assistant-message': '中文、特殊字符 <>& 和摘要格式检查；这是模拟通知，不代表原生触发。'}
    result = subprocess.run(COMMAND + [json.dumps(event, ensure_ascii=False)],
                            capture_output=True, timeout=15)
    passed = result.returncode == 0 and any(
        record.get('task_hash') == n.task_hash(event) and record.get('stage') == 'sent'
        for record in read_records())
    report_check('C_simulated_event_delivery', passed)
    print('C：模拟事件发送' + ('成功。' if passed else '未成功；请检查安全日志。'))
    return passed


def config_check() -> bool:
    config = tomllib.loads(CONFIG.read_text())
    registered = (config.get('notify') == COMMAND or
                  (CONFIG == n.CODEX_DIR / 'config.toml' and hook_transport.registered()))
    cli = shutil.which('codex')
    if not cli:
        raise n.SafeError('codex_not_found')
    # This alpha rejects --strict-config on features; exec supports it below.
    result = subprocess.run([cli, 'features', 'list'], capture_output=True, timeout=20)
    passed = registered and result.returncode == 0
    report_check('D_config_load', passed)
    print('D：用户级完成通知注册和 CLI 配置加载' + ('通过。' if passed else '未通过。'))
    return passed


def native_test() -> bool:
    report_check('D_native_trigger', False, 'test_started_not_yet_verified')
    report_check('D_native_delivery', False, 'test_started_not_yet_verified')
    if (n.STATE_DIR / 'disabled').exists():
        raise n.SafeError('notifications_disabled')
    if not config_check():
        return False
    cli = shutil.which('codex')
    marker = 'CODEX_TELEGRAM_NATIVE_TEST_' + secrets.token_hex(8)
    prompt = '这是通知集成自检。不要调用工具，不要读写文件，仅回复：' + marker
    target_hash = hashlib.sha256(prompt.encode()).hexdigest()
    print('D：正在启动真实 Codex CLI 只读会话；最多等待 120 秒。', flush=True)
    try:
        with tempfile.TemporaryDirectory(prefix='codex-telegram-test-') as directory:
            result = subprocess.run([cli, '--no-daemon', 'exec', '--strict-config', '--sandbox', 'read-only',
                                     '--skip-git-repo-check', '--ephemeral', '--json', '-C', directory, prompt],
                                    capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        report_check('D_native_trigger', False, 'codex_session_timeout')
        print('D：原生测试会话超时；未确认 notify 触发。')
        return False
    final_seen = False
    completed = False
    for line in result.stdout.splitlines():
        try:
            event = json.loads(line)
            if event.get('type') == 'turn.completed':
                completed = True
            item = event.get('item', {})
            if isinstance(item, dict) and item.get('type') == 'agent_message' and marker in item.get('text', ''):
                final_seen = True
        except (ValueError, AttributeError, TypeError):
            pass
    deadline = time.monotonic() + 12
    received = delivered = False
    while time.monotonic() < deadline:
        matching = [r for r in read_records() if r.get('task_hash') == target_hash]
        received = any(r.get('stage') == 'received' for r in matching)
        delivered = any(r.get('stage') == 'sent' for r in matching)
        if delivered or (received and any(r.get('stage') == 'failed' for r in matching)):
            break
        time.sleep(0.5)
    passed = result.returncode == 0 and completed and final_seen and received
    report_check('D_native_trigger', passed,
                 'cli_exit_' + str(result.returncode) + ';final=' + str(final_seen) + ';event=' + str(received))
    report_check('D_native_delivery', passed and delivered)
    print('D：真实会话退出码：' + str(result.returncode) + '；最终回复匹配：' + str(final_seen))
    print('D：Codex 原生 notify 触发：' + ('已验证。' if passed else '未验证。'))
    print('D：该原生事件 Telegram 投递：' + ('成功。' if delivered else '未成功。'))
    return passed and delivered


def verify() -> None:
    cfg = n.load_credentials()
    validate_bot(cfg['token'])
    report_check('A_getMe', True)
    print('A：getMe 成功，机器人身份匹配。')
    result = n.send_message(cfg, '✅ Codex Telegram 通知系统配置成功')
    report_check('B_test_message', True, 'telegram_message_id_' + str(result['message_id']))
    print('B：指定测试消息已发送，Telegram API 返回成功。')
    if not simulate():
        raise n.SafeError('simulated_delivery_failed')
    if not native_test():
        raise n.SafeError('native_trigger_or_delivery_not_verified')
    print('测试记录：' + str(n.STATE_DIR / 'verification.json'))


def status() -> None:
    print('配置目录：' + str(n.CODEX_DIR))
    print('通知开关：' + ('关闭' if (n.STATE_DIR / 'disabled').exists() else '开启'))
    try:
        n.load_credentials()
        print('凭证：已配置且权限通过（内容不显示）')
    except n.SafeError as error:
        print('凭证：' + str(error))
    parsed = tomllib.loads(CONFIG.read_text())
    print('完成通知传输：' + ('Stop 标准输入钩子已注册' if hook_transport.registered() else
                            '旧 notify 已注册' if parsed.get('notify') == COMMAND else '未注册'))
    path = n.STATE_DIR / 'verification.json'
    if path.exists():
        print(path.read_text().strip())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['setup', 'verify', 'test', 'simulate', 'native-test',
                                         'register', 'status', 'enable', 'disable', 'uninstall'])
    action = parser.parse_args().action
    try:
        n.ensure_state()
        if action == 'setup':
            setup_credentials()
        elif action == 'verify':
            verify()
        elif action == 'test':
            n.send_message(n.load_credentials(), '✅ Codex Telegram 通知系统配置成功')
            print('Telegram 测试消息发送成功。')
        elif action == 'simulate':
            return 0 if simulate() else 1
        elif action == 'native-test':
            return 0 if native_test() else 1
        elif action == 'register':
            backup = register_notify()
            print('完成通知已注册。' + ('备份：' + str(backup) if backup else '配置无需重复修改。'))
            return 0 if config_check() else 1
        elif action == 'enable':
            register_notify()
            (n.STATE_DIR / 'disabled').unlink(missing_ok=True)
            print('通知已开启。')
        elif action == 'disable':
            fd = os.open(n.STATE_DIR / 'disabled', os.O_CREAT | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
            os.close(fd)
            print('通知已关闭，后续事件立即生效。')
        elif action == 'status':
            status()
        elif action == 'uninstall':
            unregister_notify()
            for path in [Path(NOTIFY), Path(__file__).resolve(), Path(hook_transport.__file__).resolve()]:
                path.unlink(missing_ok=True)
            shutil.rmtree(n.STATE_DIR)
            print('通知注册、脚本和凭证已移除；原始配置备份保留。')
        return 0
    except n.SafeError as error:
        print('操作未完成：' + str(error), file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print('\n已取消；输入的 Token 不会显示。', file=sys.stderr)
        return 1
    except Exception:
        print('操作未完成：local_operation_failed（为保护凭证，不输出异常详情）。', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
```

### 8.4 新增传输回归测试完整代码

文件：`~/.codex/telegram-notify/test_telegram_hook.py`。与第二章原有 23 项测试一起执行，本次共 28 项通过；测试只使用临时目录和假凭证，不访问 Telegram。

```python
"""Stdin transport regressions: no network or real credentials."""
import errno
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import telegram_notify as n
import telegram_hook as h


class HookTests(unittest.TestCase):
    def test_linux_rejects_large_single_argument(self):
        with self.assertRaises(OSError) as caught:
            subprocess.run(['/bin/true', 'x' * 200000], check=True)
        self.assertEqual(caught.exception.errno, errno.E2BIG)

    def test_large_json_uses_stdin_without_exec_argument_limit(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for name in ['telegram_notify.py', 'telegram_hook.py']:
                shutil.copyfile(Path(h.__file__).parent / name, root / name)
            common = {'session_id': 'fake-session', 'turn_id': 'fake-turn', 'cwd': '/tmp/test'}
            prompt = dict(common, hook_event_name='UserPromptSubmit', prompt='任务描述 ' + '文' * 100000)
            stop = dict(common, hook_event_name='Stop', last_assistant_message='完成 ' + '文' * 100000)
            for payload in [prompt, stop]:
                result = subprocess.run([sys.executable, str(root / 'telegram_hook.py')],
                                        input=json.dumps(payload).encode(), capture_output=True, timeout=10)
                self.assertEqual(result.returncode, 0)
                self.assertEqual(json.loads(result.stdout), {})
                self.assertEqual(result.stderr, b'')
            logs = (root / 'telegram-notify/events.jsonl').read_text()
            self.assertIn('hook_stop', logs)
            self.assertIn('credentials_missing', logs)
            self.assertNotIn('任务描述', logs)

    def test_only_redacted_current_prompt_is_cached_and_sent_once(self):
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(n, 'STATE_DIR', Path(temp)), \
             mock.patch.object(n, 'load_credentials', return_value={'token': 'known-secret', 'chat_id': 123}), \
             mock.patch.object(n, 'send_message') as send:
            common = {'session_id': 'fake-session', 'turn_id': 'fake-turn', 'cwd': '/tmp/test'}
            h.handle_hook(dict(common, hook_event_name='UserPromptSubmit',
                               prompt='仅本轮任务\npassword: hidden-password\nknown-secret'))
            cache = h.cache_path('fake-session', 'fake-turn')
            text = cache.read_text()
            self.assertNotIn('hidden-password', text)
            self.assertNotIn('known-secret', text)
            self.assertEqual(cache.stat().st_mode & 0o777, 0o600)
            payload = dict(common, hook_event_name='Stop', last_assistant_message='已结束')
            h.handle_hook(payload)
            h.handle_hook(payload)
            self.assertEqual(send.call_count, 1)
            self.assertIn('仅本轮任务', send.call_args.args[1])
            self.assertFalse(cache.exists())

    def test_disabled_and_other_events_do_not_send_or_cache(self):
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(n, 'STATE_DIR', Path(temp)), \
             mock.patch.object(n, 'handle_event') as send:
            (Path(temp) / 'disabled').touch()
            h.handle_hook({'hook_event_name': 'Stop', 'session_id': 's', 'turn_id': 't'})
            h.handle_hook({'hook_event_name': 'SubagentStop'})
            send.assert_not_called()
            self.assertEqual(list(Path(temp).glob('prompt-*.json')), [])

    def test_registration_and_unregistration_preserve_other_hooks(self):
        with tempfile.TemporaryDirectory() as temp, mock.patch.object(n, 'STATE_DIR', Path(temp)), \
             mock.patch.object(h, 'HOOKS_FILE', Path(temp) / 'hooks.json'):
            other = {'hooks': {'Stop': [{'hooks': [{'type': 'command', 'command': '/other-hook'}]}]}}
            h.HOOKS_FILE.write_text(json.dumps(other))
            h.register()
            self.assertTrue(h.registered())
            first = h.HOOKS_FILE.read_text()
            h.register()
            self.assertEqual(h.HOOKS_FILE.read_text(), first)
            h.unregister()
            self.assertEqual(json.loads(h.HOOKS_FILE.read_text()), other)


if __name__ == '__main__':
    unittest.main()
```

### 8.5 安装、审阅与持久化

本机已经安装、通过 CLI 的 `/hooks` 逐项审阅并信任两个钩子；无需重复初始化 Token。换到新机器时，从第二章取得完整通知处理器及原测试，从第 8.2—8.4 节取得三个现行文件，保存到相应位置并调整 Python 路径。仅在已迁移机器上执行下面命令，不要先运行旧的第 7.2 节安装转换脚本：

```bash
# 先检查 Python 代码与离线回归
/home/yuan/miniconda3/bin/python3 -m unittest discover -s /home/yuan/.codex/telegram-notify -p 'test_*.py' -v

# 注册两个标准输入钩子；移除本工具管理的旧 notify，其余配置保留并备份
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py register

# 安全状态查询；应显示 Stop 标准输入钩子已注册
/home/yuan/miniconda3/bin/python3 /home/yuan/.codex/telegram_setup.py status
```

当前 `~/.codex/hooks.json` 的完整通知定义：

```json
{"hooks": {"UserPromptSubmit": [{"hooks": [{"type": "command", "command": "/home/yuan/miniconda3/bin/python3.13 /home/yuan/.codex/telegram_hook.py", "timeout": 15}]}], "Stop": [{"hooks": [{"type": "command", "command": "/home/yuan/miniconda3/bin/python3.13 /home/yuan/.codex/telegram_hook.py", "timeout": 15}]}]}}
```

首次配置或修改钩子定义后，在 Codex CLI 输入 `/hooks`，查看 UserPromptSubmit 和 Stop：只审阅并信任指向自己 `telegram_hook.py` 的两个命令，确认两者 Active 为 1。本次实际通过该界面逐项检查了命令路径、同步执行模式和 15 秒超时，再按 `t` 信任。不要用跳过钩子信任的启动参数代替审阅。

钩子定义保存在用户级 `hooks.json`；精确版本的信任哈希由 Codex 写入 `config.toml` 的 `hooks.state`，重启电脑后仍保留，不应把其他机器的信任哈希直接复制过来。已有会话如未刷新，先查看 `/hooks`；必要时退出 Codex 客户端，再用 `codex resume` 选择原对话，不需要重启整台电脑或重新输入 Token。

开关及凭证轮换继续使用现行维护工具的 `disable`、`enable` 和 `setup`。卸载会移除本工具的两个钩子、脚本及私人运行目录，保留其他钩子和配置备份；Codex 写入的失效信任元数据可能保留，但没有对应定义时不会执行命令。

### 8.6 验收与诊断边界

| 检查 | 本次结果与范围 |
| --- | --- |
| 故障复现 | 单参数 200,000 字节稳定触发 Linux `E2BIG` |
| 标准输入离线回归 | 超长 JSON 经 stdin 正常进入适配器；脱敏、去重、开关、保留其他钩子通过；总计 28 项 |
| 原配置与权限 | 除移除受管 notify、新增钩子信任外，解析后的其他 TOML 字段与迁移备份一致；凭证 600、状态目录 700 |
| 真正的交互 TUI 长输入 | 在普通 CLI 交互终端提交约 150 KB 的提示词，完成标记匹配，出现 hook_stop → received → sent |
| 原终端长会话 | 10:54:24 的同一 thread/turn 有成功投递记录 |
| 重启后的持久化 | 定义和信任已落盘；本次未为了验收再次重启电脑，不把持久化文件检查写成实际重启复测 |

本次新增安全验收标记为 `G_stdin_tui_large_payload=true` 和 `H_original_terminal_delivery=true`，保存于本机 `~/.codex/telegram-notify/verification.json`。历史 A/B/C/D/E/F 仍表示此前对应测试的结果，不能当成所有会话都已验证。

诊断时按链路检查：没有 `hook_stop` 则检查定义加载、信任和 Codex 运行日志；有 `received` 但没有 `sent`，再查固定错误码和网络。单独看到短测试 sent，不能否定某个长会话存在参数长度故障。`Context 21% used` 是当前上下文占用，累计输入／输出 Token 是另一项统计；它们都不是通知脚本是否运行的证据。

参考：[官方 Hooks：事件通过标准输入传递及信任机制](https://learn.chatgpt.com/docs/hooks)、[官方旧 notify 配置](https://learn.chatgpt.com/docs/config-file/config-advanced#notifications)。
