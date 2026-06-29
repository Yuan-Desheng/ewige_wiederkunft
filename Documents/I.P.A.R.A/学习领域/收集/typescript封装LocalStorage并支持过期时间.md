---
createTime: 2026-06-29 18:52
笔记ID: 2026062918524900
multiFile:
multiMedia:
description: 小满 TypeScript 教程「typescript封装LocalStorage并支持过期时间」笔记。素材来源 CSDN 博客 128691340。
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

## typescript封装LocalStorage并支持过期时间

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/128691340)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2023-01-15 01:50:46

---

## 思考

在我们使用`cookie`的时候是可以设置有效期的，但是`localStorage`本身是没有该机制的，只能人为的手动删除，否则会一直存放在浏览器当中，可不可以跟cookie一样设置一个有效期。如果一直存放在浏览器又感觉有点浪费，那我们可以把`localStorage`进行二次封装实现该方案。

## 实现思路

在存储的时候设置一个过期时间，并且存储的数据进行格式化方便统一校验，在读取的时候获取当前时间进行判断是否过期，如果过期进行删除即可。

## 代码实现

**目录结构**

enum ts 定义枚举

```typescript
//字典 Dictionaries    expire过期时间key    permanent永久不过期
export enum Dictionaries {
    expire = '__expire__',
    permanent = 'permanent'
}
复制代码
```

type ts 定义类型

```typescript
import { Dictionaries } from "../enum"
export type Key = string //key类型
export type expire = Dictionaries.permanent | number //有效期类型
export interface Data {  //格式化data类型
    value: T
    [Dictionaries.expire]: Dictionaries.expire | number
}
export interface Result { //返回值类型
    message: string,
    value: T | null
}
export interface StorageCls { //class方法约束
    set: (key: Key, value: T, expire: expire) => void
    get: (key: Key) => Result
    remove: (key: Key) => void
    clear: () => void
}
复制代码
```

index.ts 主要逻辑实现

```typescript
import { StorageCls, Key, expire, Data,Result } from "./type";
import { Dictionaries } from "./enum";
export class Storage implements StorageCls {
    //存储接受 key value 和过期时间 默认永久
    public set(key: Key, value: T, expire: expire = Dictionaries.permanent) {
    //格式化数据
        const data = {
            value,
            [Dictionaries.expire]: expire
        }
        //存进去
        localStorage.setItem(key, JSON.stringify(data))
    }

    public get(key: Key):Result {
        const value = localStorage.getItem(key)
        //读出来的数据是否有效
        if (value) {
            const obj: Data = JSON.parse(value)
            const now = new Date().getTime()
            //有效并且是数组类型 并且过期了 进行删除和提示
            if (typeof obj[Dictionaries.expire] == 'number' && obj[Dictionaries.expire]  {
            const a = sl.get('a')
            console.log(a)
        },500)


复制代码
```

测试五秒后过期增加计时器观察值

过期之后 成功删除 测试成功
