---
createTime: 2026-06-29 19:00
笔记ID: 2026062919003826
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript 加餐环节」笔记。素材来源 CSDN 博客 128053531。
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

## 学习TypeScript 加餐环节

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/128053531)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-11-27 01:30:25

---

#### object、Object 以及{} 这三个类型大家可能不太理解

#### 1.Object

`Object`类型是所有`Object`类的实例的类型。 由以下两个接口来定义：

`Object` 接口定义了 `Object.prototype` 原型对象上的属性；`ObjectConstructor` 接口定义了 Object 类的属性， 如上面提到的 `Object.create()`。

这个类型是跟原型链有关的原型链顶层就是Object，所以值类型和引用类型最终都指向Object，所以他包含所有类型。

#### 2.object

object 代表所有非值类型的类型，例如 数组 对象 函数等，常用于泛型约束

```typescript
let o:object = {}//正确
let o1:object = []//正确
let o2:object = ()=>123 //正确
let b:object = '123' //错误
let c:object = 123 //错误
```

#### 3.{}

看起来很别扭的一个东西 你可以把他理解成new Object 就和我们的第一个Object基本一样 包含所有类型

tips 字面量模式是不能修改值的

```typescript
let a1: {} = {name:1} //正确
let a2: {} =  () => 123//正确
let a3: {} = 123//正确
```
