---
createTime: 2026-05-14 10:32
笔记ID: 20260514103205
multiFile:
multiMedia:
description: AI Agent 平台，Rust 原生，支持多渠道、多租户、工具系统
笔记类型:
阐述日期: 2026-05-14
tags:
  - AI
  - Agent
  - Rust
  - Octos
aliases:
  - Octos AI Agent Platform
cssclasses:
卡片盒笔记主题:
---

## Octos 安装与配置笔记

## 待办


## 资料
https://github.com/octos-org/octos#
https://octos-org.github.io/octos/zh/installation.html

---

## 安装步骤

### 系统依赖

```bash
# 安装系统依赖
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev

# 安装 Rust（如果还没有）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 安装可选依赖（注意：nodejs/npm 不要用 apt，直接用 nodejs.org 二进制）
sudo apt install -y ffmpeg poppler-utils
```

### 安装 Node.js / npm（重要：不要用 apt）

如果 apt 报 `nodejs : 冲突: npm`，原因是 NodeSource apt 源和手动装的 nodejs 二进制冲突。

**解决**：删除 NodeSource apt 源，然后从 nodejs.org 安装二进制：

```bash
# 1. 删除 NodeSource apt 源（nodejs 和 npm 已通过 nodejs.org 二进制手动安装，不需要 apt）
sudo rm /etc/apt/sources.list.d/nodesource.sources

# 2. 从 nodejs.org 安装 Node.js 22.x（二进制，不依赖 apt）
#    下载地址：https://nodejs.org/dist/v22.12.0/node-v22.12.0-linux-x64.tar.xz
#    解压到 /usr/local/ 后，node 和 npm 位于 /usr/local/bin/
```

### 克隆并部署

```bash
git clone https://github.com/octos-org/octos.git
cd octos
./scripts/local-tenant-deploy.sh --full
```

### 启动服务

```bash
# 启动 dashboard + gateway
octos serve --port 8080 --host 0.0.0.0 --auth-token <token>

# 或通过 systemd 服务
sudo systemctl start octos-serve
sudo systemctl enable octos-serve
```

Dashboard 地址：
http://localhost:8080/admin/login
token：
```
G5clouTiGDHlpi8MlAcDFDZmC79CkAw8
```

---

## 配置 MiniMax 模型（踩坑记录）

### 坑1：Base URL 必须用 api.minimaxi.com（不是 api.minimax.io）

octos 默认的 minimax provider base_url 是 `https://api.minimax.io/v1`，这是错的。正确地址是 `https://api.minimaxi.com/v1`。

修改 `~/.octos/config.json`：
```json
{
  "api_key_env": "MINIMAX_API_KEY",
  "base_url": "https://api.minimaxi.com/v1",
  "model": "MiniMax-M2.7",
  "provider": "minimax"
}
```

### 坑2：API Key 不要加 GroupId 前缀，直接用纯 Key

MiniMax API Key 格式是纯字符串 `sk-cp-...`，不需要 `GroupId:` 前缀。

### 坑3：环境变量必须放在 ~/.profile，不能放 ~/.bashrc

`.bashrc` 开头有这段代码：
```bash
case $- in
    *i*) ;;
      *) return;;
esac
```
非交互 shell（比如 octos 启动时）会直接 return，后面的环境变量根本读不到。

**正确做法**：把 key 写入 `~/.profile`：
```bash
# 编辑 ~/.profile，在最后添加：
export MINIMAX_API_KEY="sk-cp-fd4x..."
```

### 验证配置

```bash
# 必须用 login shell 读取 ~/.profile
bash -l -c 'echo ${#MINIMAX_API_KEY}'  # 应输出 125

# 测试 API 连通性
bash -l -c 'curl -s -X POST "https://api.minimaxi.com/v1/chat/completions" \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"MiniMax-M2.7\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"max_tokens\":5}"'
```

### Dashboard Token 位置

Dashboard 登录需要 admin token，位置在 **systemd service 文件**或**进程启动参数**：

```bash
# 方法1：从 systemd service 查看
cat /etc/systemd/system/octos-serve.service | grep auth-token

# 方法2：从运行中的进程查看
ps aux | grep "octos serve" | grep auth-token

# 方法3：从环境变量查看
cat /etc/systemd/system/octos-serve.service | grep OCTOS_AUTH_TOKEN
```

当前 token：`cf0c70eea22e76eebc56df236d3dd4971251b7cc0cfc35c94ba328eec94c4ed8`

> 注意：token 在 `local-tenant-deploy.sh` 时自动生成并打印。部署后如需重置，修改 service 文件里的 `--auth-token` 参数，然后 `sudo systemctl daemon-reload && sudo systemctl restart octos-serve`。

---

## Web Dashboard 配置 LLM（Custom 模式）

### 坑4：MiniMax 必须用 Custom，不能用内置的 minimax family

Web Dashboard 的 LLM 配置页面中，MiniMax 有两种模式：

1. **内置 minimax family** — Base URL 固定为 `api.minimax.io`，这个地址不接受当前 key，报 2049
2. **Custom model family** — 可自定义 Base URL，必须填 `https://api.minimaxi.com/v1`

### 正确填写方式

地址：http://localhost:8080/admin/profile/admin/llm

| 字段           | 填写值                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Model Family | Custom model family…                                                                                                            |
| Family ID    | `minimax`                                                                                                                       |
| Base URL     | `https://api.minimaxi.com/v1`                                                                                                   |
| Model Name   | `MiniMax-M2.7`                                                                                                                  |
| API Key      | `sk-cp-fd4xX34VKhKwvjSw2i9P3jewxgpNhPLwRHgmSX2OSdXQ7lu5nzRb4mfjq-3DUvCK3NCDoeZqdRDmt__HzyieWVJFiNsOBWFZkPmlGnWp_YwuS2wA9m6ADb4` |

填写完成后点击"测试连接"，应显示成功。

### Base URL 关键区别

| Base URL | 结果 |
|----------|------|
| `https://api.minimax.io/v1` | ❌ 2049 invalid api key |
| `https://api.minimaxi.com/v1` | ✅ 正常 |

---

## 配置文件位置

| 用途 | 路径 |
|------|------|
| Octos 主配置 | `~/.octos/config.json` |
| Octos 数据目录 | `~/.octos/` |
| Auth 凭证 | `~/.octos/auth.json` |
| Dashboard token | `/etc/systemd/system/octos-serve.service` |
| Rust 环境 | `~/.cargo/` |
| Cargo bin | `~/.cargo/bin/octos` |

## 常用命令

```bash
octos init              # 初始化配置（配置版本迁移时需要）
octos chat              # 交互式 CLI 对话
octos status            # 查看状态
octos skills list       # 查看已安装技能
octos serve             # 启动 dashboard + gateway
```

## 架构简介

- Rust 原生，8-crate workspace，支持插件系统
- LLM Provider 支持 Anthropic、OpenAI、MiniMax（OpenAI兼容）、DeepSeek 等
- 工具系统：Shell、File、Grep、WebSearch、WebFetch 等
- 支持多渠道：Telegram/Discord/Slack/WhatsApp/Email 等（通过 octos-bus）
- 记忆系统：redb 数据库 + HNSW 向量索引
- Pipeline 引擎：DOT-graph 多步工作流

## 配置飞书机器人
App ID
```
cli_aa8fd5a07a7b9cd1
```

App Secret
```
r0pbh2fkEvUwo909gWLp2eofEI7xvLp3
```




















