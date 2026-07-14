---
createTime: 2026-07-14 17:43
description:
multiFile:
multiMedia:
笔记ID: 20260714174324
笔记类型: 项目笔记
阐述日期:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/工作领域/归档/卡片盒笔记主题索引卡/ultracode.canvas|ultracode]]"
---

##  ultracode
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 相关资料

[[工作流技能]]

## 提示词

```
请分析 @/Users/cuizhanwei/yuandesheng/ultracode/资料/Claude-迁移包/Claude/workflows
目录下的内容，帮我检查一下 @Documents/I.P.A.R.A/工作领域/收集/工作流技能 是否需要更新
```

```
这个‘’流水线应当如何使用
```

```
我搜集了一些项目资料：“

Agentic Software Factory 软件工厂平台 它不是 Skill，而是一整套 **AI Software Factory**
macaron-software/software-factory 开源软件工厂
KotyV/claude-code-pipeline Feature Pipeline

我主要想让你参考：“KotyV/claude-code-pipeline项目，从我阅读你之前上传的文档来看，你的工作流与 **KotyV/claude-code-pipeline** 的目标都是**提高 Claude Code 的软件开发质量**，但它们的设计理念和定位实际上有比较大的区别。

下面我按照几个维度进行对比。

|对比维度|你的工作流技能|KotyV/claude-code-pipeline|
|---|---|---|
|**定位**|软件工厂（Software Factory）|企业研发流程（Enterprise SDLC）|
|**关注点**|从需求一直到部署|从需求一直到实现（Implementation）|
|**核心思想**|流水线自动推进|多个质量检查点（Quality Gates）|
|**阶段之间关系**|前一个阶段产生下一个阶段输入|每个 Skill 都围绕 Feature 文档不断完善|
|**Workflow**|有独立 Workflow Engine（`workflow.js`）|主要依赖 Claude Skills 顺序执行|
|**最终目标**|自动完成一个完整项目|自动完成一个高质量 Feature|

---

# ① 最大区别：你的项目是纵向流水线

你的文档属于：

```text
需求
    ↓
原型
    ↓
设计
    ↓
开发
    ↓
测试
    ↓
部署
```

这是典型的软件生命周期（SDLC）。

特点：

- 每个阶段都有明确输入和输出。
    
- 阶段之间具有依赖关系。
    
- 更强调**交付（Delivery）**。
    

例如：

```text
Requirement
      ↓
生成 Prototype

Prototype
      ↓
生成 Design

Design
      ↓
生成 Code
```

整个流程天然适合持续推进一个项目。

---

# ② KotyV 更像"质量门"

KotyV 作者认为：

不要：

```text
Idea
↓

直接 Coding
```

而应该：

```text
Idea

↓

Functional Doc

↓

Technical Doc

↓

Complexity

↓

Priority

↓

Security

↓

QA

↓

Implementation
```

每一个 Skill 都是在**同一个 Feature**上不断补充不同维度的信息，而不是推进到新的开发阶段。作者介绍中明确强调，这套流程是在传统产品与工程团队的 Feature Delivery 流程基础上抽象出来的，并通过文档在各 Skill 之间持续传递上下文。([Reddit](https://www.reddit.com/r/ClaudeAI/comments/1s51fup/after_9_months_working_with_claude_code_daily_i/?utm_source=chatgpt.com "After 9 months working with Claude Code daily, I turned my feature workflow into reusable skills (open source pipeline)"))

所以：

你的：

```text
Requirement
↓

Prototype
```

属于：

> 下一阶段

而 KotyV：

```text
Functional

↓

Security
```

属于：

> 同一阶段增加检查项

---

# ③ Workflow Engine 是最大的区别

你的文档里（根据之前上传内容）：

```text
SKILL.md

↓

workflow.js

↓

多个 Agent

↓

继续
```

说明 Skill 更像入口，真正的逻辑在 Workflow 中。

而 KotyV：

更多是：

```text
Skill A

↓

写 functional.md

↓

Skill B

↓

写 technical.md

↓

Skill C

↓

更新 technical.md
```

Workflow 相对简单。

也就是说：

你的：

```text
Skill

↓

Workflow

↓

Agent
```

KotyV：

```text
Skill

↓

Claude
```

这一点与你的设计思路差异比较明显。

---

# ④ 文档驱动方式不同

你的文档：

更偏：

```text
Prototype

↓

Design

↓

Code
```

每一步都会生成新的产物。

KotyV：

一直维护：

```text
functional.md

technical.md

qa.md

security.md
```

每个 Skill：

```text
Read

↓

Update
```

作者特别强调：每个 Skill 开始时读取已有文档，结束时更新文档，以避免 Claude 在多轮开发过程中丢失上下文。([Reddit](https://www.reddit.com/r/ClaudeAI/comments/1s51fup/after_9_months_working_with_claude_code_daily_i/?utm_source=chatgpt.com "After 9 months working with Claude Code daily, I turned my feature workflow into reusable skills (open source pipeline)"))

因此：

你的：

> 新阶段

KotyV：

> 同一批文档持续演化

---

# ⑤ 思维方式不同

你的工作流更像：

```text
PM

↓

产品

↓

UI

↓

架构

↓

开发

↓

测试

↓

运维
```

是真正的软件工厂。

KotyV：

更像：

```text
开发

↓

评审

↓

评审

↓

评审

↓

Coding
```

强调的是：

> 不要急着 Coding。

---

# ⑥ 扩展能力

你的：

很容易继续增加：

```text
Deploy

↓

Monitor

↓

Feedback

↓

Requirement v2
```

形成：

```text
闭环
```

KotyV：

如果继续扩展：

通常会增加：

```text
Performance Review

Architecture Review

Accessibility Review
```

也就是：

越来越多：

```text
Review Skill
```

而不是新的生命周期阶段。

---

# ⑦ 哪个更先进？

如果从**软件工程完整性**来看，我认为你的工作流覆盖范围更广。

你的文档已经形成了一条完整的软件交付流水线：

```text
Requirement
↓

Prototype
↓

Design
↓

Code
↓

Test
↓

Deploy
```

而 KotyV 的核心优势在于**质量控制（Quality Gates）**，通过功能文档、技术文档、安全、QA、复杂度等多个检查点来降低直接编码的风险。([Reddit](https://www.reddit.com/r/ClaudeAI/comments/1s51fup/after_9_months_working_with_claude_code_daily_i/?utm_source=chatgpt.com "After 9 months working with Claude Code daily, I turned my feature workflow into reusable skills (open source pipeline)"))

## 我建议的融合方式

我认为这两个方案不是竞争关系，而是可以互补。比较理想的流程可以是：

```text
Requirement（你的）
        │
        ▼
Prototype（你的）
        │
        ▼
Functional Doc（KotyV）
        │
        ▼
Technical Doc（KotyV）
        │
        ▼
Design（你的）
        │
        ▼
Complexity Review（KotyV）
        │
        ▼
Security Review（KotyV）
        │
        ▼
QA Review（KotyV）
        │
        ▼
Code（你的）
        │
        ▼
Test（你的）
        │
        ▼
Deploy（你的）
```

这样可以把 **KotyV 的质量门（Quality Gates）** 嵌入到你现有的**软件工厂流水线**中，既保留完整的生命周期，又在关键节点增加企业级的质量控制，而不是二选一。”
”
对我的工作流提出优化方案

```