---
createTime: 2026-07-16 17:41
笔记ID: 20260716174114
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Hooks】useInsertionEffect」笔记。素材来源 message163.github.io/react-docs。
笔记类型: 收集笔记
阐述日期:
tags:
  - React
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-react.canvas|小满zs-react]]"
---

## 学习React【Hooks】useInsertionEffect

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/hooks/useInsertionEffect.html)
> 作者：小满 message163（sister man）

---

## 说明

该篇原文（`useInsertionEffect.html`）目前为空白占位页，仅有站点导航与页脚，未发布正文内容。待作者补充后可回填本笔记。

`useInsertionEffect` 是 React 18 引入的 Hook，执行时机早于 `useLayoutEffect` 和 `useEffect`，主要用于 CSS-in-JS 库在读取布局前向 DOM 插入 `<style>` / `<link>`，业务代码通常无需直接使用。
