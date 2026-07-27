---
createTime: 2026-06-29 18:58
笔记ID: 2026062918580202
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript26（TS进阶用法infer ）」笔记。素材来源 CSDN 博客 122760342。
笔记类型: 收集笔记
阐述日期:
tags:
  - TypeScript
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-typescript.canvas|小满zs-typescript]]"
---

## 学习TypeScript26（TS进阶用法infer ）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122760342)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-31 16:08:50

---

## infer

言简意赅，infer就是**推导泛型参数**

infer声明只能出现在extends子语句中

简单的例子获取Promise的返回值

```typescript
interface User {
    name:string
    age:number
}

type Result = Promise

type PromiseRes = T extends Promise ? R : never

type r = PromiseRes
```

 如果遇到了多层的情况可以使用递归

```typescript
interface User {
    name:string
    age:number
}

type Result = Promise>>

type PromiseRes = T extends Promise ? PromiseRes : T

type r = PromiseRes
```

 infer 的协变

```typescript
let obj = {
    name:'小满',
    age:123
}
type protyKey = T extends {name:infer N,age:infer A}  ? [N,A]  : T

type res = protyKey
```

获取对象属性的类型并且返回元组类型

```typescript
let obj = {
    name:'小满',
    age:123
}
type protyKey = T extends {name:infer U,age:infer U}  ? U  : T

type res = protyKey
```

 如果同一个对象使用一个变量就会产生协变，返回值就是联合类型

infer的逆变

```typescript
type FnType = T extends {
    a:(args:infer U)=>void,
    b:(args:infer U)=>void
} ? U : never

type T = FnTypevoid,b:(args:string)=>void}>
```

 函数会产生逆变，此时返回的值是一个交叉类型 string & number 怎么可能一个类型同时是string又是number不可能所以是never

#### 总结

在协变位置上同一个类型变量的多个候选类型会被推断为联合类型；在逆变位置上，同一个类型变量的多个候选类型则会被推断为交叉类型
