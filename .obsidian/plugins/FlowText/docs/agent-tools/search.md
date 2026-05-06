# search / web_search — 联网搜索

## 格式

`[Action] search: 关键词 [engine=baidu|bing|ddg]`

- 默认引擎可省略（实现里常见默认 `baidu`）。
- 用于用户**明确需要**网络信息时；整理本地笔记时不要滥用。

## 失败常见原因

- 网络错误、引擎不可用、被限流。
- 查询词为空。
