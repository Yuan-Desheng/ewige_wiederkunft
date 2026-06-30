---
createTime: 2026-06-29 19:00
笔记ID: 2026062919005028
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip1（基础类型）」笔记。素材来源 CSDN 博客 122167155。
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

## 学习TypeScrip1（基础类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122167155)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2021-12-27 11:24:51

---

视频教程[小满TypeScript基础教程全集（完结）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1wR4y1377K?spm_id_from=333.999.0.0)



TS是JS的超集，所以JS基础的类型都包含在内



**起步安装 npm install typescript -g**



**运行tsc 文件名**

**在 Node.js 22.20.0 版本中，你可以直接使用 `node index.ts` 命令来运行 TypeScript 文件，无需任何额外标志或配置**


基础类型：Boolean、Number、String、`null`、`undefined` 以及 ES6 的  [Symbol](http://es6.ruanyifeng.com/#docs/symbol) 和 ES10 的 [BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)。



### 1.字符串类型



字符串是使用string定义的



```typescript
let a: string = '123'
//普通声明

//也可以使用es6的字符串模板
let str: string = `dddd${a}`
```



其中 ``` 用来定义 [ES6 中的模板字符串](http://es6.ruanyifeng.com/#docs/string%23%E6%A8%A1%E6%9D%BF%E5%AD%97%E7%AC%A6%E4%B8%B2)，`${expr}` 用来在模板字符串中嵌入表达式。



## 2.数字类型



支持十六进制、十进制、八进制和二进制；



```typescript
let notANumber: number = NaN;//Nan
let num: number = 123;//普通数字
let infinityNumber: number = Infinity;//无穷大
let decimal: number = 6;//十进制
let hex: number = 0xf00d;//十六进制
let binary: number = 0b1010;//二进制
let octal: number = 0o744;//八进制s
```



## 3.布尔类型



注意，使用构造函数 `Boolean` 创造的对象**不是**布尔值：



```typescript
let createdBoolean: boolean = new Boolean(1)
//这样会报错 应为事实上 new Boolean() 返回的是一个 Boolean 对象
```



事实上 new Boolean() 返回的是一个 Boolean 对象 需要改成



```typescript
let createdBoolean: Boolean = new Boolean(1)
```



```typescript
let booleand: boolean = true //可以直接使用布尔值

let booleand2: boolean = Boolean(1) //也可以通过函数返回布尔值
```



## 4.空值类型



JavaScript 没有空值（Void）的概念，在 TypeScript 中，可以用 `void` 表示没有任何返回值的函数



```typescript
function voidFn(): void {
    console.log('test void')
}
```



`void` 类型的用法，主要是用在我们**不希望**调用者关心函数返回值的情况下，比如通常的**异步回调函数**



**void也可以定义undefined 和 null类型**



```typescript
let u: void = undefined
let n: void = null;
```



## 5.Null和undefined类型



```typescript
let u: undefined = undefined;//定义undefined
let n: null = null;//定义null
```



#### void 和 undefined 和 null 最大的区别



#### 与 void 的区别是，undefined 和 null 是所有类型的子类型。也就是说 undefined 类型的变量，可以赋值给 string 类型的变量：



```typescript
//这样写会报错 void类型不可以分给其他类型
let test: void = undefined
let num2: string = "1"

num2 = test
```



```typescript
//这样是没问题的
let test: null = null
let num2: string = "1"

num2 = test

//或者这样的
let test: undefined = undefined
let num2: string = "1"

num2 = test
```



### TIPS 注意：



如果你配置了tsconfig.json 开启了严格模式



```typescript
{
    "compilerOptions":{
        "strict": true
    }
}
```



#### null 不能 赋予 void 类型





第二章学习any和unknow



[学习TypeScrip2（任意类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122170624)
