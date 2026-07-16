---
createTime: 2026-07-16 17:38
笔记ID: 20260716173844
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useLoaderData」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useLoaderData

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useLoaderData.html)
> 作者：小满 message163（sister man）

---

`useLoaderData` 是一个 React-router 的钩子函数，用于获取路由的 loader 数据。

## 使用

返回 loader 处理完之后的数据。

```tsx
//router/index.tsx
import { createBrowserRouter } from "react-router";
const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    loader: async () => {
      const response = await fetch("xxxxxxxxxx");
      const data = await response.json();
      return {
        data: data,
        message: "success",
      }
    },
  },
]);

//App.tsx
import { useLoaderData } from "react-router";
const App = () => {
  const { data, message } = useLoaderData();
  return <div>{data}</div>;
}
```

> WARNING
>
> `useLoaderData` 不会额外触发 `fetch`，它只是读取 `loader` 返回的数据，因此无需担心重复数据请求。
