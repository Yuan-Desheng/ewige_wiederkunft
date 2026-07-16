---
createTime: 2026-07-16 17:37
笔记ID: 20260716173752
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useNavigate」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useNavigate

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useNavigate.html)
> 作者：小满 message163（sister man）

---

`useNavigate` 是一个 React-router 的钩子，用于编程式导航，进行路由跳转。

例如倒计时结束后，自动返回跳转等。因为这种操作属于逻辑性操作，这时候组件方式的跳转就不合适了，这时候就需要使用编程式跳转。

```tsx
import { useNavigate } from 'react-router';

const navigate = useNavigate();
setTimeout(() => {
    navigate('/home');
}, 1000);
```

## 参数

跟 Link 组件的参数类似。

- 第一个参数：`to` 跳转的路由 `navigate(to)`
- 第二个参数：`options` 配置对象 `navigate(to, options)`
  - `replace`：是否替换当前路由
  - `state`：传递的数据
  - `relative`：相对路径
  - `preventScrollReset`：是否阻止滚动重置

### to

```tsx
import { useNavigate } from 'react-router'; // 导入useNavigate
const navigate = useNavigate(); // 获取navigate函数
navigate('/home'); // 跳转路由
```

### options-replace

跳转页面的时候，是否替换当前路由。

```tsx
navigate('/home',{replace:true});
```

### options-state

传递数据，在跳转的页面中通过 `useLocation` 的 `state` 属性获取。

```tsx
navigate('/home',{state:{name:'张三'}});
```

### options-relative

跳转的方式，默认是绝对路径，如果想要使用相对路径，需要设置为 `relative:'path'`。

```tsx
navigate('/home',{relative:'path'});
```

### options-preventScrollReset

跳转页面的时候，是否阻止滚动重置。

```tsx
navigate('/home',{preventScrollReset:true});
```

### options-viewTransition

跳转页面的时候，是否启用视图过渡，自动增加页面跳转的动画效果。

```tsx
navigate('/home',{viewTransition:true});
```
