---
name: flowtext-image
description: 使用 FlowText 默认图片模型文生图。用户要求生成插图、配图、AI 画图（非 Mermaid/代码绘图）时，必须用 image: 生成后再写入笔记。
---

# image: 文生图

```
[Action] image: 画面描述
[Action] image: prompt="更详细的描述"
```

- 使用插件「图片设置」中的默认图片生成模型
- 成功后 Observation 含 `![[...]]` 嵌入语法，可按需 `edit: append` 写入笔记
- 未配置图片模型时会执行失败，勿用纯文字假装已生成图片
