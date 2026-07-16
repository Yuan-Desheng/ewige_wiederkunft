---
createTime: 2026-07-16 17:38
笔记ID: 20260716173807
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】路由」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】路由

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/router.html)
> 作者：小满 message163（sister man）

---

## 路由

React-Router V7 的路由种类非常多，有嵌套路由、布局路由、索引路由、前缀路由、动态路由，大致分为这五种，下面一一介绍。

## Layout 布局

在演示上面几种路由之前，先对界面进行一个布局，方便后续演示，UI 组件使用 `antd`。

```bash
npm install antd
npm install @ant-design/icons
```

创建一个 `layout` 文件夹，在文件夹中创建 `Content`、`Header`、`Menu` 文件夹，在文件夹中创建 `index.tsx` 文件。

- `src/layout/Menu/index.tsx`（菜单页面）

```tsx
import { Menu as AntdMenu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router';
export default function Menu() {
    const navigate = useNavigate(); // 编程式导航
    const handleClick: MenuProps['onClick'] = (info) => {
         navigate(info.key) // 点击菜单项时，导航到对应的页面
    };
    const menuItems = [
        {
            key: '/home',
            label: 'Home',
            icon: <AppstoreOutlined />,
        },
        {
            key: '/about',
            label: 'About',
            icon: <AppstoreOutlined />,
        },
    ];
    return <AntdMenu onClick={handleClick} style={{ height: '100vh' }} items={menuItems} />;
}
```

- `src/layout/Header/index.tsx`（头部页面）

```tsx
import { Breadcrumb } from 'antd';

export default function Header() {
  return <Breadcrumb
    items={[
      {
        title: 'Home',
      },
      {
        title: 'List',
      },
      {
        title: 'App',
      },
    ]}
  />;
}
```

- `src/layout/Content/index.tsx`（内容页面）

```tsx
import { Outlet } from 'react-router';
export default function Content() {
  return <Outlet />;
}
```

- `src/layout/index.tsx`（布局页面实现串联）

```tsx
import Header from "./Header";
import Menu from "./Menu";
import Content from "./Content";
import { Layout as AntdLayout } from 'antd';
export default function Layout() {
    return (
        <AntdLayout>
            <AntdLayout.Sider>
                <Menu />
            </AntdLayout.Sider>
            <AntdLayout>
                <Header />
                <AntdLayout.Content>
                    <Content />
                </AntdLayout.Content>
            </AntdLayout>
        </AntdLayout>
    );
}
```

## 嵌套路由

嵌套路由就是父路由中嵌套子路由 `children`，子路由可以继承父路由的布局，也可以有自己的布局。

注意事项：

- 父路由的 path 以 `index` 开始，所以访问子路由时需要加上父路由的 path，例如 `/index/home`、`/index/about`
- 子路由不需要增加 `/`，直接写子路由的 path 即可
- 子路由默认是不显示的，需要父路由通过 `Outlet` 组件来显示子路由（Outlet 类似于 Vue 的 `<router-view>`，展示子路由的容器）
- 子路由的层级可以无限嵌套，但一般实际工作中就是 2-3 层

```tsx
const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout, // 父路由
        children: [
            {
                path: 'home',
                Component: Home, // 子路由
            },
            {
                path: 'about',
                Component: About, // 子路由
            },
        ]
    },
]);

import { Outlet } from 'react-router';
function Content() {
  return <Outlet />;
}
```

## 布局路由

布局路由是一种特殊的嵌套路由，父路由可以省略 `path`，这样不会向 URL 添加额外的路径段：

```tsx
const router = createBrowserRouter([
    {
        // path: '/index', // 省略
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
        ]
    },
]);
```

## 索引路由

索引路由使用 `index: true` 来定义，作为父路由的默认子路由：

```typescript
{ index: true, Component: Home }
```

索引路由在其父级的 URL 处呈现到其父级的 Outlet 中。

```tsx
const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                index: true,
                // path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ]
    },
]);
```

## 前缀路由

前缀路由只设置 `path` 而不设置 `Component`，用于给一组路由添加统一的路径前缀：

```tsx
const router = createBrowserRouter([
    {
        path: '/project',
        // Component: Layout, // 省略
        children: [
            {
                path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ]
    },
]);
```

## 动态路由

动态路由通过 `:参数名` 语法来定义动态段。

访问规则如下：`http://localhost:3000/home/123`

```tsx
const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                path: 'home/:id',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ]
    },
]);

// 在组件中获取参数
import { useParams } from "react-router";

function Card() {
  let params = useParams();
  console.log(params.id);
}
```
