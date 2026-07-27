---
createTime: 2026-06-29 19:00
笔记ID: 2026062919002123
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip6（类型断言 | 联合类型 | 交叉类型）」笔记。素材来源 CSDN 博客 122193979。
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

## 学习TypeScrip6（类型断言 | 联合类型 | 交叉类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122193979)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2021-12-28 16:47:34

---

##



## 联合类型



```typescript
//例如我们的手机号通常是13XXXXXXX 为数字类型 这时候产品说需要支持座机
//所以我们就可以使用联合类型支持座机字符串
let myPhone: number | string  = '010-820'

//这样写是会报错的应为我们的联合类型只有数字和字符串并没有布尔值
let myPhone: number | string  = true
```



函数使用联合类型、



```typescript
const fn = (something:number | boolean):boolean => {
     return !!something
}
```



## 交叉类型



多种类型的集合，联合对象将具有所联合类型的所有成员



```typescript
interface People {
  age: number,
  height： number
}
interface Man{
  sex: string
}
const xiaoman = (man: People & Man) => {
  console.log(man.age)
  console.log(man.height)
  console.log(man.sex)
}
xiaoman({age: 18,height: 180,sex: 'male'});
```



## 类型断言



```typescript
语法：　　值 as 类型　　或　　值  value as string  value
```



```typescript
interface A {
       run: string
}

interface B {
       build: string
}

const fn = (type: A | B): string => {
       return type.run
}
//这样写是有警告的应为B的接口上面是没有定义run这个属性的
```



```typescript
interface A {
       run: string
}

interface B {
       build: string
}

const fn = (type: A | B): string => {
       return (type as A).run
}
//可以使用类型断言来推断他传入的是A接口的值
```



需要注意的是，类型断言只能够「欺骗」TypeScript 编译器，无法避免运行时的错误，反而滥用类型断言可能会导致运行时错误：



#### 使用any临时断言



```typescript
window.abc = 123
//这样写会报错因为window没有abc这个东西
```



```typescript
(window as any).abc = 123
//可以使用any临时断言在 any 类型的变量上，访问任何属性都是允许的。
```



## as const



是对字面值的**断言**，与const直接定义常量是有区别的



如果是普通类型跟直接const 声明是一样的



```typescript
const names = '小满'
names = 'aa' //无法修改

let names2 = '小满' as const
names2 = 'aa' //无法修改
```



```typescript
// 数组
let a1 = [10, 20] as const;
const a2 = [10, 20];

a1.unshift(30); // 错误，此时已经断言字面量为[10, 20],数据无法做任何修改
a2.unshift(30); // 通过，没有修改指针
```



## 类型断言是不具影响力的



在下面的例子中，将 something 断言为 boolean 虽然可以通过编译，但是并没有什么用 并不会影响结果, 因为编译过程中会删除类型断言



```typescript
function toBoolean(something: any): boolean {
    return something as boolean;
}

toBoolean(1);
// 返回值为 1
//
```



[下一章学习TypeScrip7（内置对象）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122282325?spm=1001.2014.3001.5501)
