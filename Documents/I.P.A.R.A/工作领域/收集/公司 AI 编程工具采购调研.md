---
createTime: 2026-08-23 16:00
笔记ID: 20260823160031
multiFile:
multiMedia:
description: 老板提出「员工自行付费找公司报销 + 每月汇报 + 开通 Claude Code/Codex/Kimi Code」三条要求后做的采购调研。关键发现：成员级用量报表只有 Claude Team 现成能出，Codex Business 和 Kimi Business 都拿不到。推荐分层——国内平台做全员底座（阿里云百炼 Token Plan 团队版 ¥198/席·月，兼容 Claude Code 客户端、开专票、按 Key 出月报），核心 2-3 人配 Claude Code Max 个人月付，10 人年 ¥4.4-5.0 万。含三家价格对照、月报可行性表、风险清单、全部官方来源链接。
笔记类型: 收集笔记
阐述日期:
tags:
  - AI编程
  - Claude Code
  - Codex
  - Kimi
  - 采购
  - 成本
aliases:
  - AI 编程工具采购
  - Claude Code 团队版调研
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Artificial Intelligence.canvas|Artificial Intelligence]]"
---

## 公司 AI 编程工具采购调研
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

> 老板的三条要求：① 员工自行付费找公司报销；② 使用情况每月汇报；③ 开通 Claude Code + Codex + Kimi Code。
> **结论：这三条在任何单一平台上都凑不齐。分层是唯一解——国内平台做全员底座（能对公、能开专票、能出报表），核心几个人单独配 Claude 顶配。**
> 价格为 2026-08 官网实抓，每张表下面附了出处；标 ⚠️ 的是二手数字，下单前以支付页为准。完整来源见文末第七节。

## 一、三家价格（只列决策要用的）

**Claude Code（美元）** — 出处：[claude.com/pricing](https://claude.com/pricing)

| 档位 | 价格 | 备注 |
|---|---|---|
| Pro | $20/月，年付 $17/月 | 含 Claude Code，额度最低 |
| [Max 5x](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) | $100/月 | **只有月付，没有年付** |
| Max 20x | $200/月 | 同上 |
| [Team 标准席](https://support.claude.com/en/articles/12004354-purchase-and-manage-seats-on-team-plans) | $25/席·月，年付 $20 | **2 席起**（7 月刚从 5 席降下来） |
| Team 高级席 | $125/席·月，年付 $100 | 额度约 6.25× Pro |
| [Enterprise](https://support.claude.com/en/articles/11526368-how-am-i-billed-for-my-enterprise-plan) | $20/席·月 + 用量按 API 计 | **最低 20 席**，我们够不着 |

Free 档不含 Claude Code，网上说免费能跑的是老信息——官方帮助中心文章标题写得很清楚：[Use Claude Code with your **Pro or Max** plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)。额度规则见 [用量与长度限制说明](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)，超额可开 [usage credits](https://support.claude.com/en/articles/12429409-manage-usage-credits-for-paid-claude-plans) 按 [API 价](https://platform.claude.com/docs/en/about-claude/pricing) 续。

**OpenAI Codex（美元）** — 出处：[openai.com/chatgpt/pricing](https://openai.com/chatgpt/pricing/) + [Codex 定价页](https://developers.openai.com/codex/pricing)

| 档位 | 价格 |
|---|---|
| Plus | $20/月 |
| Pro | $100/月（5x）/ $200/月（20x） |
| [Business](https://help.openai.com/en/articles/8792536-managing-billing-and-seats-in-chatgpt-business) | $20/席·月年付、$25 月付，2 席起 |
| Enterprise | 不公开，得联系销售 |

**这里有个坑**：Business 的 Codex 额度和 $20 的 Plus 完全一样，[官方额度表](https://developers.openai.com/codex/enterprise/usage-limits) 逐格相同。多花的钱买的是 SSO、不拿数据训练、统一账单，**不包含用量报表**（见 [workspace analytics 页](https://developers.openai.com/codex/enterprise/workspace-analytics)）。

**Kimi Code（人民币）** — 出处：[会员定价页](https://www.kimi.com/zh-cn/help/membership/membership-pricing) + [Kimi Code 权益页](https://www.kimi.com/zh-cn/help/kimi-code/benefits)

| 档位 | 价格 |
|---|---|
| Andante | ¥49/月 |
| Moderato | ¥99/月 |
| Allegretto | ¥199/月（重度实际起步档，K3 1M 上下文） |
| Allegro | ¥699/月 |
| [Business 企业版](https://www.kimi.com/zh-cn/help/kimi-business/kimi-business-purchase) | **¥4,200/座·年（≈¥350/月），5 座起，¥21,000/年起** |

两个现实问题：Kimi 自 2026-07-19 起因算力**暂停新用户订阅**（[官方套餐调整公告](https://www.kimi.com/zh-cn/help/kimi-blackboard/plan-adjustment-notice)、[新浪财经报道](https://finance.sina.com.cn/tech/roll/2026-07-20/doc-iniimeas4936270.shtml)），到 8-23 没看到恢复公告，能不能买到得登录订阅页试；官方同时预告会员体系要改、Kimi Code 权益从会员里拆出来单卖，现价大概率要重构。别按现价做预算。

## 二、老板另外两条想法的可行性

### ② 「每月汇报使用情况」——只有 Claude Team 现成能做

Codex Business 和 Kimi Business 的团队版都拿不到成员级用量。这条需求直接决定买哪个档位，不是买了团队版就自动有的。详见下一节。

### ③ 「三家都开」——方向对，组合错

问题不是贵（虽然也贵：重度档 $100 + $100 + ¥199，一人一月 ¥1,650，10 人一年 ~20 万），而是 **Claude 和 Codex 是同一类风险资产**——都是合同禁止 + 随时封 + 不退款。同时开两家不是分散风险，是同时押两个可能归零的东西。

## 三、月度用量报表，谁能出

| 平台 | 成员级报表 | 怎么拿 |
|---|---|---|
| **Claude Team** | 有，最强 | [后台 Analytics](https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans) 可导 CSV：邮箱、模型、请求数、tokens、花费；回溯 90 天，延迟 1 天。另有 [Claude Code 专项看板](https://support.claude.com/en/articles/12157520-claude-code-usage-analytics)（PR 数、代码行数、采纳率、cost per PR）。**坑**：席位额度内的用量不计美元，只有开了 usage credits 的超额部分才有钱数 |
| Claude Enterprise | 有，还带 API | [Analytics API](https://platform.claude.com/docs/en/manage-claude/analytics-api) 可程序化拉，但要 20 席起 |
| Codex Business | **没有** | [官方 feature matrix](https://developers.openai.com/codex/enterprise/workspace-analytics) 里 Analytics dashboard / API / Compliance API 全标 unavailable。只有[工作区级的花费上限](https://help.openai.com/en/articles/20001155-managing-credits-and-spend-controls-in-chatgpt-business)，不是按人 |
| Kimi Business | **没有** | [权限说明](https://www.kimi.com/zh-cn/help/kimi-business/kimi-business-faq)里角色只有管理员/成员两级，没有「查看成员用量」这项 |
| **Kimi 开放平台 API** | 有 | [组织最佳实践](https://platform.kimi.com/docs/guide/org-best-practice)：一人一项目一把 Key，按项目导月度账单，还能设预算超限自动拒 |
| **阿里云百炼 / 智谱 GLM 团队版** | 有 | 云厂商标准账单，按席位和 Key 拆，一张增值税专票 |
| 任何个人订阅 | 没有 | 只能靠 `ccusage` 读本地日志，员工自报 |

**要按人出月报，路径只有两条：Claude Team，或者国内平台按 Key 拆账。**

## 四、推荐

### 主方案：国内底座（全员）+ Claude 顶配（核心 3 人）

**底座 —— [阿里云百炼 Token Plan 团队版](https://help.aliyun.com/zh/model-studio/token-plan-team-overview)，标准坐席 ¥198/席·月**（限时 ¥150，限时价只给包月）

- **客户端不用换**：百炼提供 Anthropic 协议入口 `https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic`，Claude Code 原样跑，只改 base_url 和 key（[官方接入文档](https://help.aliyun.com/zh/model-studio/claude-code)），模型换成 Qwen3-Coder / GLM-5 / Kimi K2.5 / MiniMax，一张阿里云发票覆盖多家模型
- 对公转账、增值税专票、国内直连不用 VPN、不存在封号
- 每坐席 25,000 Credits/月，按 Key 拆用量，月报直接从阿里云账单导
- 10 席约 **¥1,500–1,980/月**
- 另有[个人版 Coding Plan Pro ¥200/月](https://help.aliyun.com/zh/model-studio/coding-plan)（无团队版、禁止共享账号），不适合统一采购

**顶配 —— 2~3 个核心开发配 Claude Code Max 5x（$100/月）**

- 个人注册，**只月付不年付**（封号不退款，年付等于押一整年）
- 员工自行付费，凭 invoice 找公司报销；抬头是个人，走福利/技能补贴科目比走采购发票顺，具体口径先问财务
- 用量靠 `ccusage` 自报，或者干脆不管——这几个人的产出本来就看得见
- 3 人约 $300/月 ≈ **¥2,160/月**

**10 人总盘子：¥3,700–4,150/月，年 ¥4.4–5.0 万。** 其中 ¥1.8–2.4 万是能开专票、能对公、能出报表的干净部分。

备选底座：[智谱 GLM Coding Plan 团队标准版](https://docs.bigmodel.cn/cn/coding-plan/team) ⚠️¥598/席·月（2 席起），也兼容 Claude Code（`https://open.bigmodel.cn/api/anthropic`，见 [FAQ](https://docs.bigmodel.cn/cn/coding-plan/faq)），比百炼贵但模型是自家的 GLM-5.3。官网定价页是 JS 渲染抓不到，¥598 这个数字来自[二手整理](https://tokenplan.vip/zhipu-token-plan/glm-coding-plan-tier-selection-guide)，**下单前必须以支付页为准**。

### 备选方案：Claude 走云厂商

Claude Code [官方支持](https://code.claude.com/docs/en/third-party-integrations) Amazon Bedrock / Google Cloud / Microsoft Foundry 做后端。付钱给 AWS/GCP，拿云账单发票走正规服务贸易付汇，账单天然按 key 出量，也不吃消费级风控那套（IP 跳变、拼车检测都不适用）。

代价：按 token 计费，[官方成本文档](https://code.claude.com/docs/en/costs)给的企业侧经验值 $150–250/开发者·月，10 人就是 **¥1.1–1.8 万/月，年 13–21 万**，是主方案的 3–4 倍。而且 AWS/GCP 国际账号对中资控股公司同样可能在合规审查后拒户，开户能不能过要先实测；[AWS 中国区服务列表](https://www.amazonaws.cn/en/about-aws/regional-product-services/)里没有 Bedrock，必须走国际区。

如果 Claude 模型对我们不可替代且预算能接受，这是唯一「合法拿发票 + 不怕封号」的 Claude 路径。建议先用一个人的量试跑一个月，用真实账单反推 10 人成本。

### 明确不做

- 以公司名义签 Claude Team / Enterprise（股权条款直接排除 + 不收对公款 + 一封全灭不退款）
- 任何形式的年付
- 公司资金走代充平台（账号法律上不归公司，上游常是盗刷卡链，票货不符属虚开风险区）
- 多人拼一个 Max 账号（[条款](https://www.anthropic.com/legal/consumer-terms)明文禁止共享凭据，多 IP 并发是风控头号特征）

## 五、风险

1. **合同层面就违约** —— Anthropic [明文拒绝](https://www.anthropic.com/news/updating-restrictions-of-sales-to-unsupported-regions)中资持股 >50% 的实体（含其海外子公司），OpenAI [支持国家列表](https://developers.openai.com/api/docs/supported-countries)也无中国。公司名义采购不是擦边，是明确违约。
2. **封号不退款，申诉成功率约 10.6%** —— 年付等于把整年预算押在一个随时可判违约的账号上（[透明度报告](https://www.anthropic.com/transparency/system-trust-reporting)、[申诉机制说明](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals)）。
3. **报销口径要先问财务** —— 海外订阅拿到的是美元 invoice、抬头是个人，无进项税可抵；国内双币卡在 Stripe 常被拒付，实际能不能刷成、能不能报，得先跑通一单再推给全员。
4. **Kimi 现在可能买不到、价格还要变** —— [7-19 起暂停新用户订阅](https://www.kimi.com/zh-cn/help/kimi-blackboard/plan-adjustment-notice)至今未恢复，且官方预告 Kimi Code 权益要从会员里拆出来单卖。

## 六、下一步要确认的

- [ ] 登录 [Kimi 订阅页](https://www.kimi.com/zh-cn/help/membership/membership-overview)，确认能不能下单、现价是否已变
- [ ] [智谱 GLM 团队版](https://docs.bigmodel.cn/cn/coding-plan/team) ¥598 走一遍下单流程，核实真实价格（官网定价页是 JS 渲染，抓不到）
- [ ] [百炼 Token Plan 团队版](https://help.aliyun.com/zh/model-studio/token-plan-team-overview)开 1 席试跑一周，验证 Claude Code 接上去的实际体验和 Credits 消耗速度
- [ ] 问财务：美元 invoice 个人抬头能不能报、走补贴科目的个税口径

## 七、来源

### Anthropic / Claude Code

- [定价总页](https://claude.com/pricing) · [Anthropic 定价页](https://www.anthropic.com/pricing) · [API 按量定价](https://platform.claude.com/docs/en/about-claude/pricing)
- 档位说明：[Pro](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan) · [Max](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) · [Team](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) · [选择套餐](https://support.claude.com/en/articles/11049762-choose-a-claude-plan)
- 席位与计费：[Team 席位管理](https://support.claude.com/en/articles/12004354-purchase-and-manage-seats-on-team-plans) · [Team 计费 FAQ](https://support.claude.com/en/articles/12997503-team-plan-billing-faqs) · [Enterprise 计费](https://support.claude.com/en/articles/11526368-how-am-i-billed-for-my-enterprise-plan) · [Enterprise 席位](https://support.claude.com/en/articles/13393991-purchase-and-manage-seats-on-enterprise-plans) · [付费计划计费 FAQ](https://support.claude.com/en/articles/8325618-paid-plan-billing-faqs)
- Claude Code 用量：[Pro/Max 用 Claude Code](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) · [Team/Enterprise 用 Claude Code](https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan) · [模型与限额](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) · [用量与长度限制](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work) · [usage credits](https://support.claude.com/en/articles/12429409-manage-usage-credits-for-paid-claude-plans)
- 报表：[Team/Enterprise 用量分析](https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans) · [Claude Code 用量分析](https://support.claude.com/en/articles/12157520-claude-code-usage-analytics) · [Enterprise Analytics API](https://platform.claude.com/docs/en/manage-claude/analytics-api) · [Claude Code 团队用量分析文档](https://code.claude.com/docs/en/analytics)
- 合规与封号：[支持国家列表](https://www.anthropic.com/supported-countries) · [限制向不支持地区销售的公告](https://www.anthropic.com/news/updating-restrictions-of-sales-to-unsupported-regions) · [消费者条款](https://www.anthropic.com/legal/consumer-terms) · [透明度报告](https://www.anthropic.com/transparency/system-trust-reporting) · [申诉机制](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals) · [实名验证](https://support.claude.com/en/articles/14328960-identity-verification-on-claude)
- 部署：[Claude Code 第三方后端（Bedrock/GCP/Foundry）](https://code.claude.com/docs/en/third-party-integrations) · [Claude Code 成本管理](https://code.claude.com/docs/en/costs) · [Claude Code 上线 Team/Enterprise 的公告](https://www.anthropic.com/news/claude-code-on-team-and-enterprise)

### OpenAI / Codex

- [ChatGPT 定价页](https://openai.com/chatgpt/pricing/) · [API 定价](https://openai.com/api/pricing/) · [Codex 定价](https://developers.openai.com/codex/pricing)
- [用 ChatGPT 套餐跑 Codex](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) · [Codex rate card](https://help.openai.com/en/articles/20001106-codex-rate-card) · [Codex 认证方式](https://developers.openai.com/codex/auth)
- [Business 席位与计费](https://help.openai.com/en/articles/8792536-managing-billing-and-seats-in-chatgpt-business) · [Business 额度与花费上限](https://help.openai.com/en/articles/20001155-managing-credits-and-spend-controls-in-chatgpt-business) · [企业版用量限制](https://developers.openai.com/codex/enterprise/usage-limits) · [工作区分析（标 unavailable 的那张表）](https://developers.openai.com/codex/enterprise/workspace-analytics) · [企业管理员配置](https://developers.openai.com/codex/enterprise/admin-setup)
- [支持国家列表](https://developers.openai.com/api/docs/supported-countries) · [不支持地区的说明](https://help.openai.com/en/articles/9131992-chatgpt-and-api-services-in-unsupported-countries-and-territories)

### 月之暗面 / Kimi

- [会员定价](https://www.kimi.com/zh-cn/help/membership/membership-pricing) · [会员总览](https://www.kimi.com/zh-cn/help/membership/membership-overview) · [Kimi Code 权益](https://www.kimi.com/zh-cn/help/kimi-code/benefits) · [Kimi Code 文档](https://www.kimi.com/code/docs/)
- [套餐调整公告（暂停新用户订阅）](https://www.kimi.com/zh-cn/help/kimi-blackboard/plan-adjustment-notice) · [支付问题](https://www.kimi.com/zh-cn/help/membership/membership-payment-issues) · [开发票](https://www.kimi.com/zh-cn/help/membership/membership-invoice)
- 企业版：[Kimi Business](https://www.kimi.com/zh-cn/help/kimi-business/kimi-business) · [购买](https://www.kimi.com/zh-cn/help/kimi-business/kimi-business-purchase) · [FAQ](https://www.kimi.com/zh-cn/help/kimi-business/kimi-business-faq)
- 开放平台：[API 定价](https://platform.kimi.com/docs/pricing/chat) · [K3 定价](https://platform.kimi.com/docs/pricing/chat-k3) · [限流](https://platform.kimi.com/docs/pricing/limits) · [账号与付费](https://platform.kimi.com/docs/guide/account-and-payments) · [组织最佳实践](https://platform.kimi.com/docs/guide/org-best-practice) · [接入 Claude Code](https://www.kimi.com/code/docs/third-party-tools/claude-code.html)

### 国内备选平台

- 阿里云百炼：[Token Plan 团队版](https://help.aliyun.com/zh/model-studio/token-plan-team-overview) · [Coding Plan](https://help.aliyun.com/zh/model-studio/coding-plan) · [接入 Claude Code](https://help.aliyun.com/zh/model-studio/claude-code) · [Qwen Code](https://help.aliyun.com/zh/model-studio/qwen-code) · [新用户免费额度](https://help.aliyun.com/zh/model-studio/new-free-quota)
- 智谱：[GLM Coding Plan 概览](https://docs.bigmodel.cn/cn/coding-plan/overview) · [团队版](https://docs.bigmodel.cn/cn/coding-plan/team) · [FAQ（含 Claude Code base URL）](https://docs.bigmodel.cn/cn/coding-plan/faq) · ⚠️[价格二手整理](https://tokenplan.vip/zhipu-token-plan/glm-coding-plan-tier-selection-guide)
- DeepSeek：[API 定价](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) · [Anthropic 兼容接口](https://api-docs.deepseek.com/zh-cn/guides/anthropic_api)
- 阿里 Qoder CN（原通义灵码）：[计费说明](https://help.aliyun.com/zh/lingma/product-overview/billing-description)
- 字节 Trae：[企业版计费](https://docs.trae.cn/enterprise_billing-overview-for-trae-enterprise)

### 海外备选（不建议统一采购，无中国发票）

- GitHub Copilot：[套餐](https://github.com/features/copilot/plans) · [plans 参考页](https://docs.github.com/en/copilot/get-started/plans) · [支持的付款方式](https://docs.github.com/en/billing/reference/supported-payment-methods) · [走 Azure 计费](https://docs.github.com/en/copilot/reference/copilot-billing/azure-billing)
- Cursor：[定价](https://cursor.com/pricing) · [团队定价文档](https://cursor.com/docs/account/teams/pricing) · [2026-06 团队定价调整公告](https://cursor.com/blog/teams-pricing-june-2026)

### 财税与合规

- [广东税务：境外服务凭证的税前扣除口径（国税总局 28 号公告解读）](https://guangdong.chinatax.gov.cn/gdsw/sltydyl_jlct_wtjd/2025-01/22/content_af815c6611be4fc48ee8607f69261be9.shtml)
- [外汇局：服务贸易对外付汇说明](https://www.safe.gov.cn/tianjin/2024/0430/2469.html)
- [AWS 中国区服务列表（确认无 Bedrock）](https://www.amazonaws.cn/en/about-aws/regional-product-services/)

### 媒体与社区（旁证，非官方）

- [Tom's Hardware：Anthropic 封禁中资控股企业](https://www.tomshardware.com/tech-industry/anthropic-blocks-chinese-firms-from-claude)
- [TechCrunch：Claude 可能要查身份证](https://techcrunch.com/2026/06/22/anthropic-says-claude-may-want-to-see-your-id/)
- [新浪财经：Kimi 暂停新用户订阅](https://finance.sina.com.cn/tech/roll/2026-07-20/doc-iniimeas4936270.shtml) · [观察者网](https://www.guancha.cn/economy/2026_07_21_824589.shtml)
- [V2EX：国内用 Claude 封号讨论](https://cn.v2ex.com/t/1227079) · [知乎：海外 AI 订阅支付实测](https://zhuanlan.zhihu.com/p/1989702813698266379) · [小林 coding：ChatGPT Plus 开通记录](https://www.xiaolincoding.com/other/chatgptplus.html)
