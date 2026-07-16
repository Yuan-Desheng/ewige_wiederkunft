---
createTime: 2026-07-16 17:39
笔记ID: 20260716173946
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】边界处理」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】边界处理

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/boundary.html)
> 作者：小满 message163（sister man）

---

## 边界处理

边界处理包含了错误处理、`ErrorBoundary`、404 页面等错误处理。

## 404 页面处理

404 页面指的是当 React-router 路由匹配不到时显示的页面。例如路由是 `/home`、`/about`，当跳转到一个不存在的路由比如 `/aaa` 时，就会显示 404 页面。不过 react-router 自带的 404 页面太丑了，更多的时候需要自定义 404 页面。

配置：

- 使用 `*` 作为通配符，当路由匹配不到时，显示 404 页面
- 使用 `Component: NotFound` 作为 404 页面组件

```typescript
const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ],
    },
    {
        path: '*', // 通配符，当路由匹配不到时，显示 404 页面
        Component: NotFound, // 404 页面组件
    },
]);
```

`404.tsx`：

```tsx
import { Link } from 'react-router'
export default function NotFound() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
        }}>
            <h1 style={{ fontSize: 96, color: '#1890ff', margin: 0 }}>404</h1>
            <p style={{ fontSize: 24, color: '#888', margin: '16px 0 0 0' }}>
                抱歉，您访问的页面不存在
            </p>
            <Link
                to="/"
                style={{
                    marginTop: 32,
                    color: '#1890ff',
                    fontSize: 18,
                    textDecoration: 'underline'
                }}
            >
                返回首页
            </Link>
        </div>
    )
}
```

## ErrorBoundary

`ErrorBoundary` 用于捕获路由 loader 或 action 的错误，并进行处理。

如果 loader 或 action 抛出错误，会调用 `ErrorBoundary` 组件。

```tsx
import NotFound from '../layout/404'; // 404 页面组件
import Error from '../layout/error'; // 错误处理组件
const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
                ErrorBoundary: Error, // 如果组件抛出错误，会调用 ErrorBoundary 组件
            },
            {
                path: 'about',
                loader: async () => {
                    // throw new Response('Not Found', { status: 404, statusText: 'Not Found' }); 可以返回 Response 对象
                    // 也可以返回 json 等等
                    throw {
                        message: 'Not Found',
                        status: 404,
                        statusText: 'Not Found',
                        data: '132131',
                    }
                },
                Component: About,
                ErrorBoundary: Error, // 如果 loader 或 action 抛出错误，会调用 ErrorBoundary 组件
            },
        ],
    },
    {
        path: '*',
        Component: NotFound,
    },
]);
```

并且返回的错误信息可以通过一个 hooks 获取到。

`error.tsx`：

```tsx
import { useRouteError } from 'react-router'

export default function Error() {
    const error = useRouteError()
    return <div>{error.message}</div>
}
```
