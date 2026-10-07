---
name: defuddle
description: 网页搜索与正文获取。用户明确要求联网、查询最新信息、核验外部资料或提供 URL 时使用。只调用原生 search / fetch
---

# 网页访问


| 目标       | Agent 调用    | 主通道                 | 仅在主通道不可用时的回退 |
| -------- | ----------- | ------------------- | ------------ |
| 搜索网络     | 原生 `search` | `metaso_web_search` | `web_search` |
| 读取已知 URL | 原生 `fetch`  | `metaso_web_reader` | `web_fetch`  |


- 只发起一次原生 `search` 或 `fetch` function call。主通道选择和回退由插件运行时自动完成。
- 不要手动调用、输出或模拟 `metaso_web_search`、`metaso_web_reader`、`web_search` 或 `web_fetch`。

## 决策流程

1. 需要发现来源时，调用原生 `search`，传入清晰的 `query`。
2. 按目标选择 `scope`：普通网页或时效信息用 `webpage`，报告、手册或 PDF 类资料用 `document`，论文与期刊用 `scholar`。
3. 先判断搜索 Observation 是否已足以回答；足够就立即收尾。
4. 只有关键事实必须依赖页面正文时，才对少量最相关的正文链接调用原生 `fetch`。
5. 用户已提供具体 URL 时，直接调用原生 `fetch`，无需先搜索。



## 调用约束



### search

- 使用原生 function call，必填 `query`，按需传入 `scope`。
- 互不依赖的查询可在同一轮并列调用；需要根据首轮结果细化时，先等待 Observation。
- 不要用 Obsidian vault 搜索代替互联网搜索。



### fetch

- 使用原生 function call，必填完整的 `http://` 或 `https://` URL。
- 优先读取官方文档、权威来源和与问题最相关的正文页；不要抓取搜索引擎跳转页。
- 多个独立来源可在同一轮分别调用 `fetch`，不要把多个 URL 拼进一个参数。
- 单页正文可能被截断；已有内容足够时不再追加读取。



## 失败处理

- 若回退后仍遇到拒绝访问、超时、登录限制或 robots 限制，跳过该来源；关键事实仍缺失时可换一个独立来源。
- 已有证据足够时直接谨慎回答，必要时说明资料限制。
- 网页访问失败是可降级结果，不需要“修复”，也不得通过无关的 vault 写入消除失败状态。

