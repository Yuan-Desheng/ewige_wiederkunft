search — Function Calling 联网搜索指南

本文在 search 调用失败后注入。使用原生 search function call；不要输出 [Action] search:、web_search 文本协议或伪造搜索结果。

参数





必填 query：清晰、非空的查询词。



可选 scope：webpage（普通网页/时效信息）、document（报告/手册/PDF/文库）、scholar（论文/期刊/学术研究）。



engine 仅用于旧兼容模式；Metaso MCP 模式会忽略它，通常不要传。

参数对象示意：

{"query":"Obsidian CLI official documentation","scope":"webpage"}

Loop 行为





搜索用于外部网络信息；查本地 vault 使用 obsidian_search_*，不要混用。



互不依赖的查询可在同一 assistant turn 并列；依赖首轮结果的细化查询应等待 Observation。



搜索摘要足够时直接回答。只有关键事实依赖网页正文时，才对少量结果调用 fetch。

失败后修正





空查询或范围不匹配：改写为更具体的查询，并选择正确 scope。



网络、配置、限流失败属于可降级失败；不要完全相同地反复调用。



已有资料足够时直接谨慎回答并说明来源限制；关键事实仍缺失时可换查询词或独立来源。



网络工具失败不能通过无关的 vault 写入来“修复”。

