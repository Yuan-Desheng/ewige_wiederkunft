---
createTime: 2026-06-29 18:59
笔记ID: 2026062918595218
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip11（类型推论|类型别名）」笔记。素材来源 CSDN 博客 122398245。
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

## 学习TypeScrip11（类型推论|类型别名）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122398245)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-09 20:21:38

---

###



### 什么是类型推论



```typescript
let str = "小满zs"
```



1.我声明了一个变量但是没有定义类型



TypeScript 会在没有明确的指定类型的时候推测出一个类型，这就是类型推论





所以TS帮我推断出来这是一个string类型





不能够在赋值给别的类型



2.如果你声明变量没有定义类型也没有赋值这时候TS会推断成any类型可以进行任何操作





## 类型别名



type 关键字（可以给一个类型定义一个名字）多用于复合类型



 定义类型别名



```typescript
type str = string

let s:str = "我是小满"

console.log(s);
```



 定义函数别名



```typescript
type str = () => string

let s: str = () => "我是小满"

console.log(s);
```



 定义联合类型别名



```typescript
type str = string | number

let s: str = 123

let s2: str = '123'

console.log(s,s2);
```



定义值的别名



```typescript
type value = boolean | 0 | '213'

let s:value = true
//变量s的值  只能是上面value定义的值
```



**type 和 interface 还是一些区别的 虽然都可以定义类型**



1.interface可以继承  type 只能通过 & 交叉类型合并



2.type 可以定义 联合类型 和 可以使用一些操作符 interface不行



3.interface 遇到重名的会合并 type 不行





**type高级用法**



左边的值会作为右边值的子类型遵循图中上下的包含关系



```typescript
type a = 1 extends number ? 1 : 0 //1

type a = 1 extends Number ? 1 : 0 //1

type a = 1 extends Object ? 1 : 0 //1

type a = 1 extends any ? 1 : 0 //1

type a = 1 extends unknow ? 1 : 0 //1

type a = 1 extends never ? 1 : 0 //0
```







[学习TypeScrip12（never类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122407704?spm=1001.2014.3001.5501)
