---
createTime: 2026-07-16 17:38
笔记ID: 20260716173802
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useNavigation」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useNavigation

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useNavigation.html)
> 作者：小满 message163（sister man）

---

## 什么是 useNavigation

`useNavigation` 是一个 React-Router 的钩子，用于获取当前路由的导航状态。

## 如何使用 useNavigation

```typescript
import { useNavigation } from 'react-router';

const navigation = useNavigation();
```

## navigation.state

- `idle` 空闲状态
- `submitting` 提交状态
- `loading` 加载状态

在使用正常导航的情况或者 `GET` 提交表单的时候会经过以下状态转换：

在使用 POST、PUT、PATCH 或 DELETE 提交的表单会经历以下状态转换：

```text
idle → submitting → loading → idle
```

> TIP
>
> 如果没有 loader，则不会经历 `loading` 状态。

可以编写自己的逻辑来处理这些状态：

```typescript
const navigation = useNavigation();

const isLoading = navigation.state === 'loading';
const isSubmitting = navigation.state === 'submitting';
const isIdle = navigation.state === 'idle';
```

## navigation.formData

当使用原生表单 `<form>` 提交的时候，并且是 POST、PUT、PATCH 或 DELETE 请求的时候，可以获取到表单的数据。

如果是 GET 请求则 `formData` 为空，需要在 `navigation.location.search` 中获取 GET 请求的数据。

## navigation.json

当提交表单的时候，如果表单的 `enctype` 为 `application/json` 的时候，可以获取到表单的数据。

## navigation.text

当提交表单的时候，如果表单的 `enctype` 为 `text/plain` 的时候，可以获取到表单的数据。

## navigation.location

获取当前路由的位置，跟 `useLocation` 的返回值是一样的。

## navigation.formAction

获取表单的提交地址，例如：`/login`，如果是 `GET` 则为空，如果是 `/detail/id` 则返回 `/id`。

## navigation.formMethod

获取表单的提交方式，例如：`POST`、`GET`、`PUT`、`PATCH`、`DELETE`。

## navigation.formEncType

获取表单的提交方式，例如：`application/x-www-form-urlencoded`、`multipart/form-data`、`application/json`、`text/plain`。
