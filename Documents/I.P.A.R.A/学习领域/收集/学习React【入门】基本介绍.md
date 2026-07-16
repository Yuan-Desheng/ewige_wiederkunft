---
createTime: 2026-07-16 17:42
笔记ID: 20260716174214
multiFile:
multiMedia:
description: 小满 React 教程「学习React【入门】基本介绍」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【入门】基本介绍

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/basic/introduce.html)
> 作者：小满 message163（sister man）

---

## 什么是 React

React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook（现 Meta）开发和维护，并在 2013 年开源。React 的设计初衷是帮助开发者构建复杂的用户界面，同时保持代码的可维护性和可扩展性。

## React 的特点

1. **组件化**：React 通过将 UI 分解为独立的、可重用的组件，使得代码更易于管理和维护。每个组件只关注于自身的逻辑和视图。
2. **声明式编程**：React 采用声明式的编程风格，开发者只需描述 UI 应该是什么样子的，而不需要手动操作 DOM。React 会根据数据的变化自动更新 UI。
3. **虚拟 DOM**：React 使用虚拟 DOM（Virtual DOM）来优化 UI 的更新过程。当数据发生变化时，React 会创建一个新的虚拟 DOM，然后将其与之前的虚拟 DOM 进行比较，找出最小的变化，并将这些变化应用到实际的 DOM 中，从而提高性能。
4. **单向数据流**：React 采用单向数据流（也称为单向数据绑定），这意味着数据在组件之间通过 props 进行传递，使得数据的流动更加清晰和可预测。
5. **生态系统**：React 有一个庞大且活跃的社区，提供了大量的第三方库和工具，如 React Router（用于路由管理）、Redux（用于状态管理）等，帮助开发者构建复杂的应用。

## 前置知识

你必须学会以下知识才能使用 React：

- JavaScript（es6+）
- HTML
- CSS
- TypeScript（基本使用）
- Npm 包管理器

## React 市场情况

npm 官网统计（不包含镜像）2024-9-4：

1. react 18.3.1 周下载量 `22,538,510`
2. vue 3.4.31 周下载量 `4,699,312`
3. Angular 18.1.0 周下载量 `3,216,414`
4. jQuery 3.7.10 周下载量 `10,210,940`
5. solid 1.8.18 周下载量 `288,278`

## 安装环境准备

1. node.js 下载地址：https://nodejs.org/en ，建议安装 18 以上版本，或者使用 nvm 管理 node 版本。
2. vscode 编辑器（如果安装过了请略过，或者喜欢其他编辑器） https://code.visualstudio.com/
3. vscode 插件安装可选 `Simple React Snippets`。
