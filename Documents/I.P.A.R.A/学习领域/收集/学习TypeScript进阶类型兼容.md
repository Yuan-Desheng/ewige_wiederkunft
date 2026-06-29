---
createTime: 2026-06-29 18:58
笔记ID: 2026062918582305
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript进阶类型兼容」笔记。素材来源 CSDN 博客 128982242。
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

## 学习TypeScript进阶类型兼容

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/128982242)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2023-02-11 12:23:02

---

所谓的类型兼容性，就是用于确定一个类型是否能赋值给其他的类型。typeScript中的类型兼容性是基于**结构类型**的（也就是形状），如果A要兼容B 那么A至少具有B相同的属性。

### 1.协变 也可以叫鸭子类型

什么是鸭子类型？

一只鸟 走路像鸭子 ，游泳也像，做什么都像，那么这只鸟就可以成为鸭子类型。

举例说明

```typescript
interface A {
    name:string
    age:number
}

interface B {
    name:string
    age:number
    sex:string
}

let a:A = {
    name:"老墨我想吃鱼了",
    age:33,
}

let b:B = {
    name:"老墨我不想吃鱼",
    age:33,
    sex:"女"
}

a = b
```

A B 两个类型完全不同但是竟然可以赋值并无报错B类型充当A类型的子类型，当子类型里面的属性满足A类型就可以进行赋值，也就是说不能少可以多，这就是协变。

### 2.逆变

逆变一般发生于函数的参数上面

举例说明

```typescript
interface A {
    name:string
    age:number
}

interface B {
    name:string
    age:number
    sex:string
}

let a:A = {
    name:"老墨我想吃鱼了",
    age:33,
}

let b:B = {
    name:"老墨我不想吃鱼",
    age:33,
    sex:"女"
}

a = b

let fna = (params:A) => {

}
let fnb = (params:B) => {

}

fna = fnb //错误

fnb = fna //正确
```

这里比较绕，注意看fna 赋值 给 fnb 其实最后执行的还是fna 而 fnb的类型能够完全覆盖fna 所以这一定是安全的，相反fna的类型不能完全覆盖fnb少一个sex所以是不安全的。

### 3.双向协变

tsconfig strictFunctionTypes 设置为false 支持双向协变 fna fnb 随便可以来回赋值
