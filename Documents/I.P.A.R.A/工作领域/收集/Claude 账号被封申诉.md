---
createTime: 2026-08-25 21:30
笔记ID: 20260825213000
multiFile:
multiMedia:
description: Claude 账号被 hold（unusual activity）后的申诉分析与 Request a review 表单填写草稿，含两问答英文模板、封号原因排查表与注意事项。
笔记类型: 收集笔记
阐述日期:
tags:
  - Claude
  - 账号申诉
  - Anthropic
aliases:
cssclasses:
卡片盒笔记主题:
---

## Claude 账号被封申诉

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="50" max="100"></progress>

> 账号被 Anthropic 以 "unusual activity" 置于 hold 状态后的申诉记录。含原因判断、表单填写草稿（英文）与注意事项。
> 状态：草稿待补齐（缺 3 条个人事实，见文末）。申诉机会**只有一次**，定稿前务必核对。

---

## 一、收到的通知原文

```text
Your account is on hold

We put your account on hold on Mar 15, 2024, 1:40 PM because of unusual
activity. Your chats and data are safe.

If you think this hold is an error, you can request an account review.

What happens next:
1  Request a review — Tell us more about what happened.
2  We'll review your account — A team member will review your request and
   account activity together.
3  We'll email you the outcome — Reviews take about 10 days.

What you can do
  Export your data — We'll package up your account information for download.
  Delete your account — You can permanently remove your account and data.
                        This can't be undone.
```

申诉表单两个问题：

```text
Request a review
Share details about how you were using your account on Mar 15 to help us
understand the full picture.

Q1. What do you use your account for?
    Describe your typical workflow and which Claude products you use
    (chat, API, Claude Code).

Q2. Anything else we should know?
    Describe what was happening on Mar 15. Any extra context we should know?

We'll email you once we've reached a decision. Review decisions are final.
```

---

## 二、原因判断

Anthropic 不会说明具体触发哪一条，但常见就这几类：

| 类型 | 具体表现 | 中招概率 |
|---|---|---|
| **地区 / 网络** | 从不支持的地区访问、频繁跨国 IP 跳变、机场/共享出口 IP 被他人滥用 | **高**（中国大陆） |
| **账号共享** | 同一账号多人、多地同时登录 | 视实际情况 |
| **自动化流量** | 脚本高频调用、并发 session 异常、疑似代跑 / 转售 | 中（Claude Code 多 subagent 会有并发，但正常量不至于） |
| **支付** | 虚拟卡 / 他人卡 / 被拒付 | 中 |
| **内容策略** | 触发 Usage Policy 的对话 | 低 |

---

## 三、注意事项（动手前先看）

- [ ] **不要编造。** 确实用了代理 / VPN、确实是虚拟卡，要么如实说、要么不提，**绝不主动否认** —— 查得到，一否认彻底没戏。
- [ ] **先点 Export your data。** 不管申诉结果如何，先把数据导出，这一步无副作用。
- [ ] **绝对不要点 Delete account。** 不可逆。
- [ ] **Review decisions are final** —— 一次性机会，提交前逐句核对。
- [ ] 核对通知上的日期：收到的是 `Mar 15, 2024`，但当前是 2026-08，相隔两年多。确认页面显示的是否真是 2024 年，若实为今年需同步改文案里的日期。

---

## 四、填写草稿（英文）

### Q1: What do you use your account for?

```text
I'm an individual professional user. I use Claude primarily through Claude Code
(CLI) and the Claude.ai chat interface for my own work — I do not use the API,
and I have never resold, shared, or given anyone else access to my account.

My typical workflow:

- Claude Code: day-to-day software engineering on my own machine and my own
  servers — writing and refactoring Python/JS services, debugging production
  issues, writing tests, and drafting git commits. I also use it to maintain a
  personal Obsidian knowledge vault (a git repository of my own notes).

- Chat: drafting and editing documents, translation between Chinese and
  English, and general technical Q&A.

The work is ordinary business software: internal tooling and e-commerce
order/data integrations for the small health-products company I work at.
Nothing in my usage involves scraping, bulk automated generation, running
Claude as a service for third parties, or any of the prohibited uses in the
Usage Policy.

Because Claude Code runs agentic sessions, a single task of mine can produce
many API calls in a short window and sometimes several parallel sub-agent
sessions. If the volume or concurrency of my traffic is what looked unusual,
that is what it was — one person running Claude Code on real engineering tasks.
```

### Q2: Anything else we should know?

```text
On Mar 15 I was doing my normal work — 【填当天实际在做的事】. I wasn't doing
anything I knew to be outside the Terms of Service, and I was the only person
using the account.

Two things that might explain what the system flagged:

- Network / location. I work from China, and my traffic goes out through
  【a company VPN / a commercial VPN endpoint】, so my IP address changes
  between sessions and is shared with other users of that provider. That could
  look like access from multiple locations, but it has always been just me on
  one laptop.

- Concurrency. I use Claude Code with parallel sub-agents, so bursts of many
  simultaneous requests from one account are normal for my workflow.

I rely on Claude daily for my job and I'd like to keep using it within the
rules. If any part of my usage is a problem, I'm happy to change it — please
tell me what to stop doing. Thank you for taking the time to review this.
```

---

## 五、待补的 3 条事实

| # | 需要确认 | 影响 |
|---|---|---|
| 1 | **Mar 15 那天到底在做什么**（哪个项目、跑了多久、有无长时间跑批 / 高并发） | Q2 最关键的一段，越具体越可信 |
| 2 | **网络怎么出去的**（公司 VPN / 商业机场 / 云服务器中转 / 直连） | 用了就如实写；没用过则整段删除 |
| 3 | **付款方式**（境内虚拟卡 / 他人代付 / 正规境外卡） | 前两种很可能是真正触发点，需换一段写法 |

补齐后再定稿提交。
