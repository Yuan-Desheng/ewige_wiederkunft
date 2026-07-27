---
createTime: 2026-06-29 18:57
笔记ID: 2026062918574700
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript28（infer 递归）」笔记。素材来源 CSDN 博客 126449668。
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

## 学习TypeScript28（infer 递归）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/126449668)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-08-21 12:41:15

---

有这么一个类型

```typescript
type Arr = [1, 2, 3, 4]
```

希望通过一个 ts 工具变成

```typescript
type Arr = [4,3,2,1]
```

完整代码

```typescript
type Arr = [1, 2, 3, 4]

type ReveArr = T extends [infer First, ...infer rest] ? [...ReveArr, First] : T

type Res = ReveArr
```

 具体思路 首先使用泛型约束 约束只能传入数组类型的东西  然后从数组中提取第一个，放入新数组的末尾，反复此操作，形成递归 满足结束条件返回该类型
