---
createTime: 2026-07-16 17:38
笔记ID: 20260716173812
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useParams」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useParams

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useParams.html)
> 作者：小满 message163（sister man）

---

`useParams` 是一个 React-router 的钩子函数，用于获取路由参数。

## 使用

返回当前 URL 中匹配的参数。

```tsx
import { useParams } from "react-router"
function SomeComponent() {
  let params = useParams()
  //params.id
  return <div>{JSON.stringify(params)}</div>
}
```

假设路由为 `/posts/:id`，那么 `params` 的值为：

```typescript
{
  id: '123'
}
```

## 类型

```typescript
function useParams<ParamsOrKey extends string | Record<string, string | undefined> = string>(): Readonly<
    ParamsOrKey
] extends [string] ? Params$1<ParamsOrKey> : Partial<ParamsOrKey>>;
```
