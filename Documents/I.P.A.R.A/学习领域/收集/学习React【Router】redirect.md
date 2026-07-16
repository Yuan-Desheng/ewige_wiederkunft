---
createTime: 2026-07-16 17:43
笔记ID: 20260716174343
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】redirect」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】redirect

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/apis/redirect.html)
> 作者：小满 message163（sister man）

---

redirect 是用于重定向，通常用于 `loader` 中，当 `loader` 返回 `redirect` 的时候，会自动重定向到 `redirect` 指定的路由。

## 案例以及用法

权限验证，例如这个路由需要登录才能访问，如果未登录则重定向到登录页。

```tsx
import { redirect } from "react-router";
{
  path: "/home",
  loader: async ({request}) => {
    const isLogin = await checkLogin();
    if(!isLogin) return redirect('/login');
    return {
        data: 'home'
    }
  }
}
```
