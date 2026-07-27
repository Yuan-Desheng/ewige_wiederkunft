---
createTime: 2026-06-29 19:00
笔记ID: 2026062919002624
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip4（数组类型）」笔记。素材来源 CSDN 博客 122177058。
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

## 学习TypeScrip4（数组类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122177058)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2021-12-27 17:49:43

---

## 数组的类型



1.类型[ ]



```typescript
//类型加中括号
let arr:number[] = [123]
//这样会报错定义了数字类型出现字符串是不允许的
let arr:number[] = [1,2,3,'1']
//操作方法添加也是不允许的
let arr:number[] = [1,2,3,]
arr.unshift('1')

var arr: number[] = [1, 2, 3]; //数字类型的数组
var arr2: string[] = ["1", "2"]; //字符串类型的数组
var arr3: any[] = [1, "2", true]; //任意类型的数组
```



### 数组泛型



规则 Array



```typescript
let arr:Array = [1,2,3,4,5]
```



### 用接口表示数组



一般用来描述类数组



```typescript
interface NumberArray {
    [index: number]: number;
}
let fibonacci: NumberArray = [1, 1, 2, 3, 5];
//表示：只要索引的类型是数字时，那么值的类型必须是数字。
```



### 多维数组



```typescript
let data:number[][] = [[1,2], [3,4]];
```



### arguments类数组



```typescript
function Arr(...args:any): void {
    console.log(arguments)
    //错误的arguments 是类数组不能这样定义
    let arr:number[] = arguments
}
Arr(111, 222, 333)

function Arr(...args:any): void {
    console.log(arguments)
    //ts内置对象IArguments 定义
    let arr:IArguments = arguments
}
Arr(111, 222, 333)

//其中 IArguments 是 TypeScript 中定义好了的类型，它实际上就是：
interface IArguments {
[index: number]: any;
length: number;
callee: Function;
}
```



### any 在数组中的应用



一个常见的例子数组中可以存在任意类型



```typescript
let list: any[] = ['test', 1, [],{a:1}]
```



[下一章节函数学习TypeScrip5（函数扩展）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122191746?spm=1001.2014.3001.5501)
