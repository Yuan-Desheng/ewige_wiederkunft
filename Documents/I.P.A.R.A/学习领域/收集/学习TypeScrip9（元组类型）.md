---
createTime: 2026-06-29 19:00
笔记ID: 2026062919000320
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip9（元组类型）」笔记。素材来源 CSDN 博客 122353137。
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

## 学习TypeScrip9（元组类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122353137)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-06 21:29:14

---

如果需要一个固定大小的不同类型值的集合，我们需要使用元组。



## 元组就是数组的变种



**元组（Tuple）是固定数量的不同类型的元素的组合**。



元组与集合的不同之处在于，元组中的元素类型可以是不同的，而且数量固定。元组的好处在于可以把多个元素作为一个单元传递。如果一个方法需要返回多个值，可以把这多个值作为元组返回，而不需要创建额外的类来表示。



```typescript
let arr:[number,string] = [1,'string']

let arr2: readonly [number,boolean,string,undefined] = [1,true,'sring',undefined]
```



当赋值或访问一个已知索引的元素时，会得到正确的类型：



```typescript
let arr:[number,string] = [1,'string']
arr[0].length //error
arr[1].length //success

//数字是没有length 的
```



元组类型还可以支持自定义名称和变为可选的



```typescript
let a:[x:number,y?:boolean] = [1]
```



## 越界元素



```typescript
let arr:[number,string] = [1,'string']

arr.push(true)//error
```



对于越界的元素他的类型被限制为 联合类型（就是你在元组中定义的类型）如下图





## 应用场景 例如定义excel返回的数据



```typescript
let excel: [string, string, number, string][] = [
    ['title', 'name', 1, '123'],
    ['title', 'name', 1, '123'],
    ['title', 'name', 1, '123'],
    ['title', 'name', 1, '123'],
    ['title', 'name', 1, '123'],
]
```



 下一章[学习TypeScrip10（枚举类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122380754)
