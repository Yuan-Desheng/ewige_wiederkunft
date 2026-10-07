Obsidian functions — Function Calling 修正指南

本文在 Obsidian 工具调用失败后注入，用于修正下一轮调用。FlowText 已把 Obsidian CLI 封装为原生、结构化的 obsidian_* functions。当前请求中实际提供的 function schema 是参数的唯一权威来源。

不要输出 [Action] cli:、obsidian ... 文本命令、shell 命令或伪造的 [Observation]。只通过模型的 function-calling 通道提交工具名称与 JSON arguments。

选择顺序





当前已暴露匹配任务的 obsidian_* function：直接使用，并严格遵守其 schema。



普通笔记正文：读取优先 read；新建/完整写入优先 edit.write；不要调用 create 类 CLI。



当前 schema 没有覆盖但确属 Obsidian CLI 能力：仅在明确使用 obsidian_raw_cli 时，先调用 obsidian_show_help 查询精确子命令；结构化 obsidian_* function 失败时不得改用旧 CLI 参数。



不要猜测不存在的 function 名、参数名、命令 ID、插件 ID、主题名或工作区名。

obsidian_show_help 的参数对象示意：

{"command":"property:set"}

obsidian_raw_cli 仅在结构化 function 无法表达时使用：

{"command":"obsidian <已由 help 确认的子命令与参数>"}

以上仅表示 function arguments，不得作为普通文本回复。

高频结构化路由





普通文本搜索：obsidian_search_text



属性、标签、文件名、任务文本搜索：obsidian_search_by_property、obsidian_search_by_tag、obsidian_search_by_file_name、obsidian_search_by_task_text



列文件/文件夹：obsidian_list_files、obsidian_list_folders



文件移动、重命名、删除：obsidian_move_note、obsidian_rename_note、obsidian_delete_note



日记：obsidian_get_daily_path、obsidian_read_daily_note、obsidian_append_to_daily_note



任务：obsidian_list_tasks、obsidian_update_task



属性：obsidian_read_property、obsidian_set_property、obsidian_batch_set_property、obsidian_remove_property



模板文件：其 .md 路径仍是普通 vault 文件路径，只能用 read({\"path\":\"...\"}) 读取，再通过 edit.write 写入目标笔记；不要把文件路径传给 obsidian_read_template / template:read



链接/标签：使用对应的 obsidian_list_* / obsidian_get_* function



主题、插件、命令、工作区、历史、同步、开发调试：先使用当前暴露的专用 function；闭集值先枚举再操作

完整能力还包括 Bases、书签、CSS snippets、标签页、vault/app 信息等。按需暴露意味着本轮可能只看到其中一部分，不代表能力不存在。

参数与路径规则





只传 schema 声明的字段；不要添加 format、ext、total 等未暴露参数。



当前 vault 内路径使用相对路径和 /。非根路径无前导/尾随 /，不含 vault 名、系统绝对路径或 [[wikilink]]。



文件夹参数的根目录通过省略 folder 表示；不要把文件路径传给 folder。



若路径来自 <vault_resource> 或工具结果，使用 JSON 解码后的完整值并原样复制，保留空格、中文、标点和大小写。



工具同时提供 file 与 path 时，已知精确位置优先 path；不要把同一路径同时塞进多个字段。



布尔值、整数、数组保持其 JSON 类型，不要写成字符串。



搜索、发现与批量处理





不知道真实路径时，先搜索或列目录，再读取/修改；不要猜路径。



按属性、标签、文件名、任务搜索时，把纯值传给对应结构化字段；不要再手写 [属性:值]、tag:#...、file:"..." 或 task:... 查询语法。



搜索/列目录默认需要返回路径，因此不要请求只返回数量。



得到多篇路径后，用一次 read 的 paths 批量读取正文，而不是逐篇占用多轮。



批量设置同一属性优先 obsidian_batch_set_property，paths 必须是字符串数组。



Loop 与同轮多 Action





多个互不依赖的只读 functions 可放在同一个 assistant turn；loop 会并行执行。



多个相互独立的写操作也可同轮提交；loop 会依据资源冲突和安全策略调度，不需要把它们拼成一个字符串命令。



有数据依赖时必须分轮：例如先列文件，等待 Observation 获得路径，再读取或修改。



同一资源的后续操作依赖前一操作结果时，等待 Observation；不要在同轮猜测新路径、行号或 ID。



每个 function call 都会返回独立 Observation。只有成功结果才能作为完成依据，不得自行合并或伪造结果。



易混淆操作





创建/覆盖自定义笔记正文：edit 的 op: "write"。



删除笔记内的行：edit 的 op: "delete"；删除整篇文件：obsidian_delete_note。



修改 .canvas：只用 canvas。



勾选任务：使用 obsidian_update_task。line 必须来自 obsidian_list_tasks、obsidian_read_daily_note 或 read 返回的真实任务行号，不得猜测。



执行 Obsidian command：先 obsidian_list_commands，再把返回的精确 ID 传给 obsidian_run_command。



安装、启停、删除插件/主题，加载/删除工作区等操作：先枚举或查询详情，再使用精确名称/ID。



失败后修正





schema 校验失败：保留正确工具，按当前 schema 删除未知字段、补齐 required 字段并修正 JSON 类型。



路径不存在：从资源或工具结果复制真实路径；未知时先搜索/列目录。



结构化 obsidian_* function 参数失败：以当前请求携带的 JSON schema 为唯一依据修正；不要调用 obsidian_show_help。



文件、模板、插件等资源 not found：先用对应 search/list/info function 获取真实路径或闭集值；这不是 CLI 语法错误。



只有显式 obsidian_raw_cli 返回 unknown command / command not found 时，才调用 obsidian_show_help 查询该精确子命令。



闭集值无效：先调用相应 list/info function，再用返回的精确值重试。



权限、用户拒绝、缺少插件或功能未启用：停止盲目重试，说明阻塞条件；不要注入无关写操作。



相同工具、相同参数已经失败时，不得原样重复。必须根据 Observation 改变参数、改用正确工具，或在无法安全继续时调用 ask_user。

