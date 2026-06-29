---
createTime: 2026-06-29 18:53
笔记ID: 2026062918535401
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习typeScript（weakMap，weakSet，set，map）」笔记。素材来源 CSDN 博客 129778612。
笔记类型: 收集笔记
阐述日期:
tags:
  - TypeScript
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
---

## 学习typeScript（weakMap，weakSet，set，map）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/129778612)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2023-03-26 14:02:14

---

在es5的时候常用的Array object ，在es6又新增了两个类型，Set和Map，类似于数组和对象。

#### 1.set

集合是由一组无序且唯一(即不能重复)的项组成的，可以想象成集合是一个既没有重复元素，也没有顺序概念的数组



属性



size：返回字典所包含的元素个数




操作方法




add(value)：添加某个值，返回 Set 结构本身。




delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。




has(value)：返回一个布尔值，表示该值是否为 Set 的成员。




clear()：清除所有成员，无返回值。




size: 返回set数据结构的数据长度



```typescript
let set:Set = new Set([1,2,3,4])

set.add(5)

set.has(5)

set.delete(5)

set.size //4
```

去重

```typescript
let arr = [...new Set([1,1,1,2,2,3,4,5,5,5,5])]

console.log(arr); //[ 1, 2, 3, 4, 5 ]
```

#### 2.Map

它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键，是一种更完善的 Hash 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适

```typescript
let obj = { name: '小满' }
let map: Map = new Map()

map.set(obj, () => 123)

map.get(obj)

map.has(obj)

map.delete(obj)

map.size
```

操作方法同set

#### 3.WeakSet 和 WeakMap

Weak 在英语的意思就是弱的意思，weakSet 和 weakMap 的键都是弱引用，不会被计入垃圾回收，我们来演示一下。

首先obj引用了这个对象 + 1，aahph也引用了 + 1，wmap也引用了，**但是不会  + 1，**应为他是弱引用，不会计入垃圾回收，因此 obj 和 aahph 释放了该引用 weakMap 也会随着消失的，但是有个问题你会发现控制台能输出，值是取不到的，应为V8的GC回收是需要一定时间的，你可以延长到500ms看一看，并且为了避免这个问题不允许读取键值，也不允许遍历，同理weakSet 也一样

```typescript
let obj:any = {name:'小满zs'} //1
let aahph:any = obj //2
let wmap:WeakMap = new WeakMap()

wmap.set(obj,'爱安徽潘慧') //2 他的键是弱引用不会计数的

obj = null // -1
aahph = null;//-1
//v8 GC 不稳定 最少200ms

setTimeout(()=>{
    console.log(wmap)
},500)
```
