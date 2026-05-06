---
name: defuddle
description: 网页内容获取与搜索引擎查询。用户要求搜索、查找资料、了解某个话题时用 search:；用户提供具体 URL 要求读取/分析/保存时用 fetch:。**禁止直接回答需要联网才能获取的最新信息，必须先用 search: 或 fetch: 获取内容再回答。**
---

# 网页访问：fetch: 与 search: 两种 Action

## ⚡ 快速判断

| 场景 | 使用 Action |
|------|------------|
| 用户说"搜索一下"、"查一下"、"帮我找"、"了解最新" | `search:` |
| 用户提供了具体 URL 要求读取/分析/保存 | `fetch:` |
| 不确定内容是否最新，需要联网确认 | `search:` |

---

## search: 搜索引擎查询

用于在互联网上搜索资料、最新信息、技术文档等。**默认使用百度。**

```
[Action] search: 关键词
[Action] search: 关键词 engine=bing
[Action] search: 关键词 engine=sogou
[Action] search: 关键词 engine=360
[Action] search: 关键词 engine=ddg
```

支持的引擎：`baidu`（默认）、`bing`、`sogou`、`360`、`ddg`、`google`（自动转 DDG）

**典型场景：**
1. 用户问"帮我搜索一下 XXX" → `search: XXX`
2. 用户问某个技术/产品的最新动态 → `search: XXX 最新`
3. 用户要查某个话题的资料 → `search: XXX`

---

## fetch: 获取指定网页内容

用于读取用户提供的具体 URL，提取正文转为 Markdown，去除导航/广告等干扰元素。

```
[Action] fetch: https://example.com/article
```

**典型场景：**
1. 用户提供 URL，要求阅读/摘要/分析
2. 先 search: 找到结果，再 fetch: 具体链接获取全文
3. 保存网页为笔记：fetch 后 edit: write 保存

## 注意事项

- **不要直接从记忆中回答需要联网才能获取的实时/最新信息**，必须先 search: 或 fetch:
- fetch: URL 会自动补全 https:// 前缀
- 内容超过 12000 字符自动截断
- 部分网站因反爬或需要登录可能无法获取
