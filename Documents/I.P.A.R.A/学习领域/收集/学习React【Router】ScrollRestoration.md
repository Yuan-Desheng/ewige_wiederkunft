---
createTime: 2026-07-16 17:43
笔记ID: 20260716174350
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】ScrollRestoration」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】ScrollRestoration

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/apis/scrollRestoration.html)
> 作者：小满 message163（sister man）

---

### 状态：素材页尚未编写

该篇在 message163.github.io/react-docs 的对应页面（ScrollRestoration）当前为**空白占位页**，小满仅写了 `# scrollrestoration` 一级标题，尚无任何说明或代码示例（经核对站点 VitePress 内容包，对应模块除该标题外无其他渲染节点）。

因此本篇暂无正文可整理。

### ScrollRestoration 的定位（预告）

- `ScrollRestoration` 是 React Router 提供的组件，用于在路由导航时**自动恢复滚动位置**（模拟浏览器原生「后退/前进」时恢复页面滚动条位置的行为）。
- 典型用法：在根布局中渲染一次 `<ScrollRestoration />`，框架会记录每个 location 的滚动位置，导航返回时自动还原。
- 与 `Link` 的 `preventScrollReset` 属性的关系：`ScrollRestoration` 负责「记录 + 恢复」，`preventScrollReset` 负责「单次跳转不重置」，两者配合控制滚动行为。
- 具体用法（放置位置、与 `useNavigate` 的协作、SSR 注意事项）待小满补充正文后，回填至本篇。

### 待补 Checklist

- [ ] 等源页内容上线后，抓取并整理为完整笔记（用法 + 完整代码示例）
- [ ] 补充 `getKey` 自定义滚动恢复 key 的用法
- [ ] 补充与 `preventScrollReset`、`reloadDocument` 的区别
