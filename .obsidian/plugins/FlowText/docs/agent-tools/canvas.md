canvas — Function Calling 白板指南

本文在 canvas 调用失败后注入。当前 Agent 使用原生 Function Calling；不要输出 [Action] canvas:、heredoc 或手写整条 JSON 命令。.canvas 只能由 canvas function 修改，不能使用 edit。

操作与参数





所有操作必填 op、path；path 必须是 vault 相对 .canvas 路径。



create / rewrite：必填非空 nodes，可传 edges。



add_nodes：必填非空 nodes，可同时传 edges。



add_edges：必填非空 edges。



update_node：必填 id 和非空 updates 对象。



remove_nodes：必填非空 ids: string[]。

参数对象示意：

{"op":"update_node","path":"Maps/Plan.canvas","id":"n1","updates":{"text":"新标题","color":"2","x":120}}

以上仅表示 function arguments；必须通过 canvas function call 提交。

数据约束





常用节点字段：id, type (text|file|link|group), x, y, width, height, text, file, url, color, label。



边至少包含 fromNode、toNode；可含 fromSide、toSide、label、color。



节点 ID 必须唯一；边引用的节点必须存在。



file 节点的 file 使用 vault 相对路径。



数组和对象直接作为 function arguments 传入，不要先 JSON.stringify 成字符串。



Loop 与布局





同一白板的相关变更优先合并成一次调用；后续操作依赖新节点 ID 时，等待 Observation 后再继续。



多个互不依赖的白板可在同一 assistant turn 分别调用。



布局优先单一方向（上→下或左→右）、同层共线、间距一致，减少交叉边。



失败后修正





create/rewrite/add_nodes 失败：检查 nodes 是否为非空数组、节点 ID 是否重复。



add_edges 失败：确认两端节点 ID 已存在，且 edges 不是字符串。



update/remove 失败：先读取白板或根据 Observation 确认真实节点 ID。



不要使用相同错误参数连续重试，也不要退回 edit 修改底层 JSON。

