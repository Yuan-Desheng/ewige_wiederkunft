edit — Function Calling 编辑指南

本文在 edit 调用失败后注入，用于修正下一轮调用。当前 Agent 使用原生 Function Calling；不要输出 [Action] edit:、heredoc、字符串命令或伪造的 [Observation]。

通用参数





必填：op、path。



path 是当前 vault 的相对文件路径，且不能以 .canvas 结尾。



正文直接放入 JSON 字符串字段，换行由 function arguments 正常编码；不要使用 <<<CONTENT。

操作与必需字段







op



用途



额外字段





write



新建文件或完整覆盖



content





append



在文末追加



text





replace_line



替换一行



line, text





replace_lines



替换连续行范围



start, end, text





insert_after



在指定行后插入



line, text





insert_before / insert_line



在指定行前插入



line, text





delete



删除正文行，保留文件



line，或 start, end

参数对象示意：

{"op":"replace_lines","path":"Notes/A.md","start":12,"end":16,"text":"新的多行正文"}

以上仅表示 function arguments；必须通过 edit function call 提交。

Loop 与同轮多 Action





修改 N 个不同文件时，在同一个 assistant turn 发出 N 个 edit function call，每个 path 一个。loop 会把它们视为同一轮 Action，并按安全顺序执行。



同一路径同一轮最多一个 edit。把该文件需要的修改合并进一次 append、replace_lines 或 write，不要同轮对同一路径连续写入。



多文件调用不能共用一个 edit 参数对象，也不要把多个路径塞进 path。



调用完成后等待各自 Observation；不要在工具结果返回前声称写入成功。



安全路由





修改已有内容的行号必须来自最新 read 结果；行号从 1 开始，范围首尾都包含。



新建带自定义正文的笔记使用 edit.write，不要使用 Obsidian CLI create。



删除笔记内的行使用 edit.delete；删除整篇文件才使用 obsidian_delete_note。



.canvas 只能用 canvas 修改。



regex、replace、replace_all 已禁用；先读取定位，再用行操作。



失败后修正





缺少正文：write 补 content；其他写入操作补 text。



文件不存在：只有 write 可创建；其余操作先确认真实路径或改为 write。



行号越界：重新 read，用最新行号修正；不要原参数重试。



同路径重复写入被拒绝：合并为一次调用，下一轮只提交一个该路径的 edit。



若 Observation 表示 no_effect，不要盲目重复；先判断目标内容是否已经处于期望状态。

