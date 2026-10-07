dida — Function Calling 滴答清单查询指南

本文在 dida 调用失败后注入。使用原生 dida function call；不要输出 [Action] dida: 字符串或伪造任务结果。

参数





query：可选关键词。



project：可选项目名，使用真实项目名称。



status：可选状态，支持 pending、done、all、0、2。

参数对象示意：

{"query":"周报","project":"工作","status":"pending"}

工具从 vault 配置目录的 plugins/Dida Sync/data.json 读取已同步数据，只提供查询能力。

Loop 与失败处理





多个互不依赖的查询可在同一 assistant turn 分别调用。



空结果不等于调用错误；可适当放宽 query、project 或 status，但不要无边界遍历。



Dida Sync 未安装、未同步或数据文件不可读时，停止原参数重试并向用户说明依赖条件。



不要通过编辑 data.json 或其他 vault 文件来修复查询失败。

