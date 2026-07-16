---
createTime: 2026-07-16 17:38
笔记ID: 20260716173853
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useActionData」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useActionData

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useActionData.html)
> 作者：小满 message163（sister man）

---

`useActionData` 是一个 React-router 的钩子函数，用于获取路由的 action 数据。

## 使用

返回 action 处理完之后的数据，通常被用于错误处理。

```tsx
//router/index.tsx
import { createBrowserRouter } from "react-router";
const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    action: async ({ request }) => {
      //可以根据不同的格式获取不同的数据
      const formData = await request.formData(); //获取formData数据
      //const json = await request.json(); //获取json数据
      //const text = await request.text(); //获取text数据
      const email = formData.get("email");
      const password = formData.get("password");
      const errors = [];
      if (!email) {
        errors.push("Email is required");
      }
      if (!password) {
        errors.push("Password is required");
      }
      return { errors };

      return await createUser({ email, password });
    },
  },
]);

//App.tsx
import { useActionData } from "react-router";
const App = () => {
  const errors = useActionData();
  return <div>{errors}</div>;
}
```
