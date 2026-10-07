read — Function Calling 读取指南

本文在 read 调用失败后注入，用于修正下一轮调用。当前 Agent 使用原生 Function Calling；不要输出 [Action] read:、命令字符串或伪造的 [Observation]。

参数





唯一入口：任何已知 vault 文件（包括作为模板使用的 .md 文件）都调用原生 read；不要调用 obsidian_read_note、obsidian_read_template、template:read 或 raw CLI。



单文件：传 path。



单文件局部读取：传 path、lineStart、lineEnd；行号从 1 开始，且 lineEnd >= lineStart，单次至多 300 行。



多文件：一次调用传 paths: string[]。使用 paths 时不要再传 path 或行号。



path 可为 vault 相对文件路径，也可为工具返回的 obs://... observation handle。



参数名只有 path / paths；不要自行替换成 file、filePath、name 或命令字符串。

参数对象示意：

{"path":"Notes/A.md","lineStart":10,"lineEnd":30}

{"paths":["Notes/A.md","Notes/B.md","Notes/C.md"]}

以上仅表示 function arguments；必须通过 read function call 提交，不能把 JSON 作为正文输出。

Loop 与批量规则





已知多篇路径时优先单个批量 read，通常每批不超过约 20 篇。



多个互不依赖的只读 function call 可以放在同一 assistant turn，loop 会并行调度。



依赖读取结果的编辑必须等 Observation 返回后再调用；不要猜测正文或行号。



不要重复读取本轮已经取得且仍然有效的内容。



分页结果会返回 [read_page]；仅当 has_more=true 时继续，并原样使用 next_line_start 与建议结束行。has_more=false 表示已到 EOF，不要再读。



路径与工具路由





使用当前 vault 根目录的相对路径和 /；不要传系统绝对路径、vault 名或 [[wikilink]]。



read 只读文件，不能读取文件夹。查看目录使用 obsidian_list_files；查找未知文件使用 obsidian_search_*。



.canvas 的查看可由系统处理，但修改必须使用 canvas，不能使用 edit。



失败后修正





“文件不存在”：从 <vault_resource> 或上一次工具结果原样复制路径；未知路径先搜索或列目录。



“目标是文件夹”：改用 obsidian_list_files。



“行范围无效”：先不带范围读取，依据返回的真实行号重新调用。



不要用完全相同的错误参数重复调用；修正参数后再试一次。

