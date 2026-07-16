---
createTime: 2026-07-16 17:43
笔记ID: 20260716174314
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】Link」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】Link

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/apis/link.html)
> 作者：小满 message163（sister man）

---

`Link` 组件是一个用于导航到其他页面的组件，他会被渲染成一个特殊的 `<a>` 标签，跟传统 a 标签不同的是，他不会刷新页面，而是会通过 router 管理路由。

## 使用

```tsx
import { Link } from "react-router";

export default function App() {
  return (
    <Link to="/about">About</Link>
  )
}
```

## 参数

- `to`：要导航到的路径
- `replace`：是否替换当前路径
- `state`：要传递给目标页面的状态
- `relative`：相对于当前路径的导航方式
- `reloadDocument`：是否重新加载页面
- `preventScrollReset`：是否阻止滚动位置重置
- `viewTransition`：是否启用视图过渡

### to

`to` 属性是一个字符串，表示要导航到的路径。

```tsx
<Link to="/about">About</Link>
```

### replace

`replace` 属性是一个布尔值，表示是否替换当前路径，如果为 `true`，则导航不会在浏览器历史记录中创建新的条目，而是替换当前条目。

```tsx
<Link replace to="/about">About</Link>
```

### state

`state` 属性是一个对象，可以把参数传递给目标页面。

```tsx
<Link state={{ from: "home" }} to="/about">About</Link>

// 在目标页面获取状态
import { useLocation } from "react-router";

export default function App() {
  const location = useLocation();
  console.log(location.state);
  return <div>Location: {location.state.from}</div>;
}
```

### relative

`relative` 属性是一个字符串，表示相对于当前路径的导航方式，默认的方式是绝对路径，如果想要使用相对路径，可以设置为 `path`。

```tsx
//默认是绝对路径
<Link relative="route" to="/about">About</Link>

//使用相对路径
<Link relative="path" to="../about">About</Link>

//例如当前的路由是/index/home，那么使用绝对路径导航到/about，会变成/about
<Link to="/about">About</Link>
//可以使用相对路径导航到/index/about
<Link relative="path" to="../about">About</Link>
```

### reloadDocument

`reloadDocument` 属性是一个布尔值，表示是否重新加载页面。

```tsx
<Link reloadDocument to="/about">About</Link>
```

### preventScrollReset

`preventScrollReset` 属性是一个布尔值，表示是否阻止滚动位置重置。

```tsx
<Link preventScrollReset to="/about">About</Link>
```

（行为示意参见源页 GIF：未设置时导航会重置滚动到顶部，加上该属性后保留原滚动位置。）

### viewTransition

`viewTransition` 属性是一个布尔值，表示是否启用视图过渡，自动增加页面跳转的动画效果。

```tsx
<Link viewTransition to="/about">About</Link>
```
