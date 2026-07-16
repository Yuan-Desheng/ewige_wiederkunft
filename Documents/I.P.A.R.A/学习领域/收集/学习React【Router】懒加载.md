---
createTime: 2026-07-16 17:38
笔记ID: 20260716173846
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】懒加载」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】懒加载

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/lazy.html)
> 作者：小满 message163（sister man）

---

## 什么是懒加载

懒加载是一种优化技术，用于延迟加载组件，直到需要时才加载。这样可以减少初始加载时间，提高页面性能。

## 懒加载的实现

通过在路由对象中使用 `lazy` 属性来实现懒加载。

```typescript
import { createBrowserRouter } from 'react-router';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // 模拟异步请求
const router = createBrowserRouter([
    {
        Component: Layout,
            {
                path: 'about',
                lazy: async () => {
                    await sleep(2000); // 模拟异步请求
                    const Component = await import('../pages/About'); // 异步导入组件
                    console.log(Component);
                    return {
                        Component: Component.default,
                    }
                }
            },
        ],
    },
]);
```

当切换到 `about` 路由时，才会进行加载。

> 如果配置了 `loader`，则每次都会进入 `loading` 状态；如果没有配置 `loader`，则只执行一次。

## 体验优化

例如 `about` 是一个懒加载的组件，在切换到 `about` 路由时，展示的还是上一个路由的组件，直到懒加载的组件加载完成，才会展示新的组件，这样用户会感觉页面卡顿，用户体验不好。

### 使用状态优化 useNavigation

速查文档 useNavigation。

- `src/layout/Content/index.tsx`

```typescript
import { Outlet, useNavigation } from 'react-router';
import { Alert, Spin } from 'antd';
export default function Content() {
    const navigation = useNavigation();
    console.log(navigation.state);
    const isLoading = navigation.state === 'loading';
    return <div>
        {isLoading ? <Spin size='large' tip='loading...'  >
            <Alert description="小满zs小满zs小满zs小满zs小满zs小满zs小满zs小满zsv"   message="加载中" type='info' />
        </Spin> : <Outlet />
        }
    </div>
}
```

## 性能优化

使用懒加载打包后，会把懒加载的组件打包成一个独立的文件，从而减小主包的大小。
