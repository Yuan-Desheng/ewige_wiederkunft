---
createTime: 2026-06-29 18:56
笔记ID: 2026062918560503
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip5（函数扩展）」笔记。素材来源 CSDN 博客 122191746。
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

## 学习TypeScrip5（函数扩展）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122191746)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2021-12-28 14:53:15

---

##



## 函数的类型



```typescript
//注意，参数不能多传，也不能少传 必须按照约定的类型来
const fn = (name: string, age:number): string => {
    return name + age
}
fn('张三',18)
```



函数的可选参数?



```typescript
//通过?表示该参数为可选参数
const fn = (name: string, age?:number): string => {
    return name + age
}
fn('张三')
```



函数参数的默认值



```typescript
const fn = (name: string = "我是默认值"): string => {
    return name
}
fn()
```



接口定义函数



```typescript
//定义参数 num 和 num2  ：后面定义返回值的类型
interface Add {
    (num:  number, num2: number): number
}

const fn: Add = (num: number, num2: number): number => {
    return num + num2
}
fn(5, 5)

interface User{
    name: string;
    age: number;
}
function getUserInfo(user: User): User {
  return user
}
```



定义剩余参数



```typescript
const fn = (array:number[],...items:any[]):any[] => {
       console.log(array,items)
       return items
}

let a:number[] = [1,2,3]

fn(a,'4','5','6')
```



函数重载



重载是方法名字相同，而参数不同，返回类型可以相同也可以不同。



如果参数类型不同，则参数类型应设置为 **any**。



参数数量不同你可以将不同的参数设置为可选。



```typescript
function fn(params: number): void

function fn(params: string, params2: number): void

function fn(params: any, params2?: any): void {

    console.log(params)

    console.log(params2)

}

fn(123)

fn('123',456)
```



[下一篇进阶教程学习TypeScrip6进阶（类型断言 | 联合类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122193979?spm=1001.2014.3001.5501)
