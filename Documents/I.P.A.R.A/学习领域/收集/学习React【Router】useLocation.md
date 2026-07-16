---
createTime: 2026-07-16 17:38
笔记ID: 20260716173834
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useLocation」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useLocation

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useLocation.html)
> 作者：小满 message163（sister man）

---

`useLocation` 是一个 React-router 的钩子函数，用于获取当前路由的 location 对象。

## 使用

返回当前 URL 的 location 对象。

```tsx
import { useLocation } from 'react-router'

function SomeComponent() {
  let location = useLocation()
  return <div>{JSON.stringify(location)}</div>
}
```

## 类型

```typescript
function useLocation(): Location;
// 类型定义
interface Location<State> {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state: State;
}
```

## Location

### hash

URL 片段标识符，以 `#` 开头。

---

### key

当前路由的唯一标识符。

---

### pathname

URL 路径名，以 `/` 开头。

---

### search

URL 搜索字符串，以 `?` 开头。

---

### state

```typescript
state: State;
State = any
```

传递到当前路径的 state 对象。

---
