---
createTime: 2026-06-29 18:58
笔记ID: 2026062918581704
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript24（TS进阶用法-泛型工具）」笔记。素材来源 CSDN 博客 122755639。
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

## 学习TypeScript24（TS进阶用法-泛型工具）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122755639)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-30 20:38:29

---

## TypeScript 泛型工具：提升类型灵活性和重用性

泛型工具是一组预定义的泛型类型和操作符，用于操作和转换类型。它们可以帮助我们编写更灵活、更通用的代码，并提高代码的可读性和可维护性。

#### Partial 和 Required

`Partial` 是一个泛型类型，用于将一个类型的所有属性变为可选。与之相反，`Required` 是一个泛型类型，用于将一个类型的所有属性变为必选

Partial(可选)

```typescript
interface User {
    name: string;
    age: number;
}
```

```typescript
type test = Partial

//转换完成之后的结果

type test = {
    name?: string | undefined;
    age?: number | undefined;
}

//原理
type PratialUser = {
    [P in K]?: T[P]
}
```

Required(必选)

```typescript
interface User {
    name?: string;
    age?: number;
}
//原理
type CustomRequired = {
    [P in keyof T]-?: T[P]
}

type test = Required
type test2 = CustomRequired

//结果
interface User {
    name: string;
    age: number;
}
```

### Pick 和 Exclude

pick用于从一个类型中选取指定的属性

原理：为什么要搞never？

因为never在联合类型中会被忽略

```typescript
interface User {
    name?: string;
    age?: number;
}
//原理
type CoustomPick = {
    [P in K]: T[P]
}

type test = Pick

//结果
type test = {
    age?: number | undefined;
}
```

`Exclude` 是一个类型操作符，用于从一个类型的属性集合中排除指定的属性

```typescript
//原理
type CustomExclude = T extends K ? never : T

type test = Exclude

//结果

type test = "c"
```

### Omit

用于创建一个新类型，该新类型从原始类型中排除指定的属性

```typescript
interface User {
    address?: string;
    name?: string;
    age?: number;
}
//原理
type coustomOmit = Pick>

type test = Omit

//结果

type test = {
    address?: string | undefined;
    name?: string | undefined;
}
```
