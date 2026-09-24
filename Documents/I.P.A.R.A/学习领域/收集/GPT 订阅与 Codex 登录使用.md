---
createTime: 2026-08-25 17:03
笔记ID: 20260825170349
multiFile:
multiMedia:
description: 订阅 ChatGPT、登录 Codex CLI 及日常使用中的问答记录
笔记类型: 收集笔记
阐述日期:
tags:
  - codex
  - chatgpt
  - ai-cli
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## GPT 订阅与 Codex 登录使用

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="20" max="100" style="width: 100%;"></progress>

> 本篇按「问 → 答」逐条累积记录订阅 ChatGPT、登录 Codex CLI 与日常使用中遇到的问题，随对话持续追加。

## 一、Codex 登录卡在「电话号码是必填项」

### 问

已下载安装好 Codex，执行登录时弹出页面要求：

```text
电话号码是必填项
添加您的电话号码以继续。我们会向该号码发送一次性验证码进行验证。
电话号码国家代码：美国 (+1)
通过以下方式发送验证码：短信 / WhatsApp
```

### 答（结论先行）

这不是 Codex 的问题，是 **OpenAI 账号级别的安全验证**：账号没有绑定过手机号，任何入口（网页版 ChatGPT / Codex CLI / API 平台）第一次都会拦。绑定一次，之后所有终端都不再问。

### 关键事实

| 项 | 说明 |
|---|---|
| 谁在要号码 | OpenAI 账号系统，不是 Codex |
| 中国大陆 +86 | 不在 OpenAI 支持的号码地区，选了大概率提示不支持或收不到码 |
| 号码复用限制 | 同一号码能绑定的 OpenAI 账号数量有限，接码平台的号码常已被绑满 → 报「该号码已被使用过多次」 |
| WhatsApp 选项 | 只要号码已注册 WhatsApp，走 WhatsApp 收码常比短信更容易到 |
| 与订阅的关系 | 无关。没订阅也要绑；绑了不代表能用 Codex，Codex 需要 Plus / Pro / Business 订阅或 API 付费 |

### 三条可选路径

1. **首选：改到浏览器里绑**
   先在浏览器打开 `chatgpt.com` 登录同一账号，在弹出的手机验证页完成绑定，再回终端执行 `codex login`。CLI 内嵌的登录页有时会吞掉错误提示，浏览器里能看清失败原因。
2. **号码选择**：国家代码从「美国 (+1)」改成实际能收码的地区（香港 +852、美国 +1 实体号、新加坡 +65 等），优先用**自己实名的真实号码**而不是接码平台。收不到短信就切 WhatsApp。
3. **绕开路径：改用 API Key 模式**
   不走 ChatGPT 账号登录，用 OpenAI 平台的 API Key 跑 Codex，不需要手机验证走完这一步（但 API 平台充值本身也可能要验证）。这条路按用量计费，**不消耗 ChatGPT 订阅额度**。

```bash
# 方式一：ChatGPT 账号登录（会触发手机号验证）
codex login

# 方式二：用 API Key 登录
codex login --api-key "sk-xxxxxxxx"

# 或者用环境变量
export OPENAI_API_KEY="sk-xxxxxxxx"
codex
```

### 踩坑提示

- **网络必须稳定直连 OpenAI**：代理要全局 / TUN 模式，且 IP 地区尽量与账号注册地、手机号地区一致，地区来回跳容易触发风控，表现就是「验证码一直发不出来」或登录后立刻掉线。
- 反复提交手机号失败会被临时限流，隔几十分钟再试，别连续猛点。
- 号码绑定成功后，`codex login` 会在浏览器完成 OAuth 并把凭据写到本地（`~/.codex/`），后续免登录。

## 二、如何查看 ChatGPT 账号当前绑定的手机号

### 问

怎么查我现在的 ChatGPT 绑的是哪个手机号？

### 答

**先看一个判断依据**：Codex 登录时弹的是「**添加**您的电话号码以继续」——文案是"添加"不是"验证"，基本可以确定这个账号**当前没有绑定过手机号**。绑过的账号触发验证时会显示掩码尾号（如 `+1 ••• ••• ••34`）而不是让你从头填。

### 查看路径（OpenAI 界面改版频繁，按顺序试）

| 入口 | 路径 | 能看到什么 |
|---|---|---|
| API 平台（最靠谱） | `platform.openai.com` → 右上角头像 → Settings / Your profile | Profile 页有 Phone number 字段，绑了会显示掩码尾号 |
| ChatGPT 网页版 | `chatgpt.com` → 左下角头像 → 设置 → 账户 / 安全 | 主要显示邮箱、订阅、MFA；**手机号通常不在这里展示** |
| 触发式验证 | 退出后重新登录，或在平台里点一次需要验证的操作 | 系统会显示当前绑定号码的掩码尾号 |
| 官方支持 | `help.openai.com` 右下角气泡提工单 | 号码彻底不可用（换号/丢号）时走这条解绑 |

### 结论与下一步

- ChatGPT 的产品设计上**不提供一个明确的「我绑的号是多少」展示页**，只在验证场景显示掩码。想确认，最快是去 `platform.openai.com` 的 Profile 页看。
- 你现在这个情况大概率是**没绑**，所以不用查，直接按第一节的路径去绑一个能收码的号码即可。

## 三、待补充

（后续问答继续追加）
