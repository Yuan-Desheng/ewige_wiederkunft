---
createTime: 2026-07-16 17:39
笔记ID: 20260716173929
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】导航」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】导航

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/nav.html)
> 作者：小满 message163（sister man）

---

## 导航

在 React-router V7 中，大致有四种导航方式：

1. 使用 `Link` 组件
2. 使用 `NavLink` 组件
3. 使用编程式导航 `useNavigate`
4. 使用 `redirect` 重定向

> 此页面为导航方式链接合集，具体使用方法请查看对应链接。

## 1. Link 组件

`Link` 组件用于声明式导航，渲染为一个 `<a>` 标签，通过 `to` 属性指定目标路径。

```tsx
import { Link } from 'react-router'

export default function Home() {
  return (
    <div>
      <Link to="/about">跳转到 About</Link>
    </div>
  )
}
```

## 2. NavLink 组件

`NavLink` 是特殊的 `Link`，当路由匹配时会自动添加 `active` 类名，常用于菜单高亮。

```tsx
import { NavLink } from 'react-router'

export default function Menu() {
  return (
    <nav>
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/about">About</NavLink>
    </nav>
  )
}
```

## 3. useNavigate 编程式导航

`useNavigate` 返回一个函数，可在事件回调、异步逻辑中触发跳转，支持传参、替换历史记录等。

```tsx
import { useNavigate } from 'react-router'

export default function Login() {
  const navigate = useNavigate()
  const handleLogin = () => {
    // 登录逻辑...
    navigate('/home')
    // replace 模式，不留下历史记录
    // navigate('/home', { replace: true })
    // 携带 state
    // navigate('/home', { state: { name: '小满zs' } })
  }
  return <button onClick={handleLogin}>登录</button>
}
```

## 4. redirect 重定向

`redirect` 用于在路由配置或 loader / action 中进行重定向，常用于权限拦截、旧路径迁移。

```tsx
import { createBrowserRouter, redirect } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => {
      const isLogin = false // 鉴权逻辑
      if (!isLogin) {
        return redirect('/login')
      }
      return null
    },
    Component: Home,
  },
  {
    path: '/login',
    Component: Login,
  },
])
```

## 小结

| 方式 | 触发场景 | 特点 |
| --- | --- | --- |
| `Link` | 模板中声明跳转 | 最基础，渲染为 a 标签 |
| `NavLink` | 菜单 / 导航栏 | 匹配路由时自动高亮 |
| `useNavigate` | 事件回调 / 异步逻辑 | 最灵活，支持传参、replace、state |
| `redirect` | loader / action / 路由配置 | 服务端也能用，适合鉴权拦截 |
