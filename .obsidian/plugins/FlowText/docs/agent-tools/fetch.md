# fetch / web_fetch — 拉取网页

## 格式

`[Action] fetch: https://example.com/page`

- 必须包含 `http://` 或 `https://`（系统可能对裸域名补全 `https://`，但建议写全）。
- 不要用搜索引擎结果页整 URL 代替 `search:`（除非确需解析搜索 URL）。

## 失败常见原因

- URL 无效、被 CORS/网络拦截、超时。
- 将 `google.com?q=` 等搜索 URL 误用为 `fetch:`（可考虑改用 `search:`）。
