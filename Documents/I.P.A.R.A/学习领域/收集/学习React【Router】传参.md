---
createTime: 2026-07-16 17:38
笔记ID: 20260716173829
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】传参」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】传参

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/params.html)
> 作者：小满 message163（sister man）

---

## 参数传递

React-router 一共有三种方式进行参数传递，参数传递指的是在路由跳转时，将参数传递给目标路由。

## Query 方式

Query 的方式就是使用 `?` 来传递参数，多个参数用 `&` 连接：

```bash
# 多个参数用 & 连接
/user?name=小满zs&age=18
```

跳转方式：

```tsx
<NavLink  to="/about?id=123">About</NavLink> // 1. NavLink 跳转
<Link to="/about?id=123">About</Link> // 2. Link 跳转
import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/about?id=123') // 3. useNavigate 跳转
```

获取参数（`useSearchParams` 用法查看 useSearchParams）：

```tsx
// 1. 获取参数
import { useSearchParams } from 'react-router'
const [searchParams, setSearchParams] = useSearchParams()
console.log(searchParams.get('id')) // 获取 id 参数

// 2. 获取参数
import { useLocation } from 'react-router'
const { search } = useLocation()
console.log(search) // 获取 search 参数 ?id=123
```

## Params 方式

Params 的方式就是使用 `:[name]` 来传递参数：

```bash
/user/:id
```

跳转方式：

```tsx
<NavLink to="/user/123">User</NavLink> // 1. NavLink 跳转
<Link to="/user/123">User</Link> // 2. Link 跳转
import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/user/123') // 3. useNavigate 跳转
```

获取参数（`useParams` 用法查看 useParams）：

```tsx
import { useParams } from 'react-router'
const { id } = useParams()
console.log(id) // 获取 id 参数
```

## State 方式

state 在 URL 中不显示，但是可以传递参数：

```bash
/user
```

跳转方式：

```tsx
<Link to="/user" state={{ name: '小满zs', age: 18 }}>User</Link> // 1. Link 跳转
<NavLink to="/user" state={{ name: '小满zs', age: 18 }}>User</NavLink> // 2. NavLink 跳转
import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/user', { state: { name: '小满zs', age: 18 } }) // 3. useNavigate 跳转
```

获取参数（`useLocation` 用法查看 useLocation）：

```tsx
import { useLocation } from 'react-router'
const { state } = useLocation()
console.log(state) // 获取 state 参数
console.log(state.name) // 获取 name 参数
console.log(state.age) // 获取 age 参数
```

## 总结

React Router 提供了三种参数传递方式，各有特点：

### 1. Params 方式（`/user/:id`）

- 适用于：传递必要的路径参数（如 ID）
- 特点：符合 RESTful 规范，刷新不丢失
- 限制：只能传字符串，参数显示在 URL 中

### 2. Query 方式（`/user?name=xiaoman`）

- 适用于：传递可选的查询参数
- 特点：灵活多变，支持多参数
- 限制：URL 可能较长，参数公开可见

### 3. State 方式

- 适用于：传递复杂数据结构
- 特点：支持任意类型数据，参数不显示在 URL
- 限制：刷新可能丢失，不利于分享

选择建议：必要参数用 Params，筛选条件用 Query，临时数据用 State。
