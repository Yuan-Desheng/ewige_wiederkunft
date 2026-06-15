---
name: defuddle
description: 网页内容获取与搜索引擎查询。用户要求搜索、查找资料、了解某个话题时：先 search:，再对前列结果批量 fetch: 抓取正文（2–4 个页面）。用户提供 URL 时直接用 fetch:。**禁止仅凭搜索摘要或记忆回答需要联网的事实。**
---

# 网页访问：search → 多页 fetch（标准流程）

## ⚡ 标准流程（必须遵守）

1. **`search:`** — 获取候选链接与摘要  
2. **`fetch:` × 2～4** — 对搜索结果中 **最相关的 2～4 个外链** 抓取正文（同一轮可连续多条 `[Action] fetch:`）  
3. 基于 **fetch 到的正文** 再写 `[Final Answer]` 或 `edit:`

> 插件在 `search:` 成功后会 **自动跟抓** 结果中的前列外链（最多 4 个）；你仍应在下一轮核对是否还需补抓特定 URL。

| 场景 | 使用 Action |
|------|------------|
| 用户说「搜索一下」「查一下」「帮我找」「了解最新」 | 先 `search:`，再 **多条** `fetch:` |
| 用户提供了具体 URL | 直接 `fetch:`（可多条 URL） |
| 已有 search 的 Observation，需要深入阅读 | 同轮或下一轮输出多条 `fetch:` |

---

## search: 搜索引擎查询

默认 **百度**；可选 `engine=bing|sogou|360|ddg`。

```
[Action] search: 关键词
[Action] search: 关键词 engine=bing
```

---

## fetch: 获取网页正文（可批量）

```
[Action] fetch: https://example.com/article-a
[Action] fetch: https://example.com/article-b
[Action] fetch: https://example.com/article-c
```

- 同一轮可连续多条 `fetch:`（与 `read` / `cli` 一样属于只读批量）  
- 优先抓 **官网文档、权威媒体、与问题最相关的条目**，跳过搜索引擎跳转链  
- 单页超 12000 字会截断；失败时可换链接或缩小范围  

---

## 示例（推荐写法）

```
[Thought] 先搜索主题，再抓取前几条的完整正文。
[Action] search: Obsidian 1.7 新特性
[Action] fetch: https://obsidian.md/blog/...
[Action] fetch: https://...
```

若首轮只有 `search:`，系统会自动跟抓；你收到正文 Observation 后再总结回答。

## 注意事项

- **禁止** 用 `cli: obsidian search query=...` 代替互联网 `search:`  
- **禁止** 只看 search 摘要就写 Final Answer（除非用户明确只要链接列表）  
- URL 可省略 `https://` 前缀（会自动补全）
