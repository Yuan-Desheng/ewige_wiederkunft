---
createTime: 2026-06-29 18:58
笔记ID: 2026062918580903
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript25（TS进阶用法-泛型工具2）」笔记。素材来源 CSDN 博客 122758713。
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

## 学习TypeScript25（TS进阶用法-泛型工具2）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122758713)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-31 11:19:45

---

## Record

泛型工具Record接受两个泛型K,T

`Record`工具类型有两个类型参数K和T，其中：

K表示创建的新对象需要具有哪些属性，属性可以只有一个，也可以有多个，多个属性时采用"联合类型"的写法。T表示对象属性的类型。

案例 约束一个对象的key，value

```typescript
//record 约束对象的key和value

type Key = "c" | "x" | "k";

type Value = '唱' | '跳'  | 'rap' | '篮球'

let obj:Record = {
    'c':'唱',
    "x":'跳',
    "k":'rap'
}
```

Record 源码

```typescript
type CustomRecord = {
    [P in K]: T
}
```

对象的key 只能是symbol string number 那么keyof any正好获取这三个类型

支持嵌套约束

```typescript
//嵌套约束
let obj: CustomRecord> = {
    'c': {
        'c': '唱',
        'x': '跳',
        'k': 'rap'
    },
    "x": {
        'c': '唱',
        'x': '跳',
        'k': 'rap'
    },
    "k": {
        'c': '唱',
        'x': '跳',
        'k': 'rap'
    }
}
```

## ReturnType

这个工具主要适用于函数，能够提取函数所返回的类型。

```typescript
const fn = () => [1,2,3,'sad'];

type num = ReturnType;
```

原理

```typescript
type CustomFn  = F extends (...args:any[])=> infer Res  ? Res :never;
```
