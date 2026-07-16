---
createTime: 2026-07-16 17:39
笔记ID: 20260716173903
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useRouteError」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useRouteError

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useRouteError.html)
> 作者：小满 message163（sister man）

---

`useRouteError` 是一个 React-router 的钩子函数，用于在错误边界组件（`ErrorBoundary`）中获取抛出的错误对象。

## 使用

在路由配置中为某一路由配置 `ErrorBoundary`，并在 loader 中抛出错误：

```tsx
import { createBrowserRouter } from 'react-router'
import Error from '../layout/error'

const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
                loader: async () => {
                    throw {
                        message: 'Home Error',
                        status: 404,
                        statusText: 'Not Found',
                        data: '132131',
                    }
                },
                ErrorBoundary: Error,
            },
        ],
    },
    {
        path: '*',
        Component: NotFound,
    },
]);
```

在错误边界组件中通过 `useRouteError` 读取错误信息：

```tsx
import { useRouteError } from 'react-router'

export default function Error() {
    const error = useRouteError()
    return <div>{error.message}</div>
}
```
