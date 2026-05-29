---
createTime: 2026-04-30 10:54
笔记ID: 20260430105420
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
---

##  Claude Code-命令
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

### claude -c (--continue)

`claude -c` 是 `claude --continue` 的简写，**直接继续最近一次的对话会话**，无需进入交互式选择界面。

**核心功能**

- **自动定位**：自动找到当前目录下最近一次对话的 session
- **完整恢复**：恢复全部历史消息、工具调用记录、文件修改上下文
- **立即就绪**：恢复后直接进入交互模式

**使用示例**

```bash
# 基本用法
claude -c

# 继续上次会话并立即执行任务
claude -c -p “继续完成之前的登录功能，添加表单验证”
```

**`claude -c` vs. `claude -r` 对比**

| 命令 | 行为 | 适用场景 |
|------|------|----------|
| `claude -c` | 直接继续最近一次会话 | 只有一个活跃项目 |
| `claude -r` | 打开交互列表手动选择 | 有多个历史会话需切换 |

**注意事项**

1. **目录相关性**：基于**当前工作目录**定位最近会话
2. **无会话时**：等同于直接运行 `claude`，启动全新会话
3. **会话损坏时**：会报错，提示使用 `claude -r` 手动选择

**高级用法**

```bash
# 继续会话并静默执行命令
claude -c -p “输出当前会话的项目路径” --output-format json

# 继续会话但只读模式
claude -c --permission-mode plan

# 指定上下文行数
claude -c --context-limit 20000
```

> **`claude -c` = “上次聊到哪儿了？继续”**

## 