---
createTime: 2026-06-29 18:57
笔记ID: 2026062918575401
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript27（infer 类型提取）」笔记。素材来源 CSDN 博客 126314150。
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

## 学习TypeScript27（infer 类型提取）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/126314150)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-08-13 02:20:20

---

[视频教程  小满TypeScript27（TS 进阶用法infer 提取元素的妙用）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1wR4y1377K?p=31&vd_source=7313597670b28c3c44c50e326d82d040)



我们用infer 实现四个简单的例子



#### 1.提取头部元素



```typescript
type Arr = ['a','b','c']

type First =  T extends [infer First,...any[]] ? First : []

type a = First
```



类型参数 T 通过extends 约束 只能是数组类型，然后通过infer 声明局部 First 变量做提取，后面的元素可以是任意类型，然后把局部变量返回



#### 2.提取尾部元素



```typescript
type Arr = ['a', 'b', 'c']

type Last = T extends [...any[], infer Last,] ? Last : []

type c = Last
```



其实就是反过来就可以了



#### 3.剔除第一个元素 Shift



```typescript
type Arr = ['a','b','c']

type First =  T extends [unknown,...infer Rest] ? Rest : []

type a = First
```



思路就是 我们除了第一个的元素把其他的剩余元素声明成一个变量 直接返回 就实现了我们的要求 剔除第一个元素



#### 4.剔除尾部元素 pop



```typescript
type Arr = ['a','b','c']

type First =  T extends [...infer Rest,unknown] ? Rest : []

type a = First
```



道理一样的 反过来就行了
