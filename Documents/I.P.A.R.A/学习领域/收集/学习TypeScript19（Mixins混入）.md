---
createTime: 2026-06-29 18:59
笔记ID: 2026062918590711
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript19（Mixins混入）」笔记。素材来源 CSDN 博客 122602896。
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

## 学习TypeScript19（Mixins混入）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122602896)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-20 21:06:38

---

TypeScript 混入 Mixins 其实vue也有mixins这个东西 你可以把他看作为合并



### 1.对象混入



可以使用es6的Object.assign 合并多个对象



此时 people 会被推断成一个交差类型 Name & Age & sex;



```typescript
interface Name {
    name: string
}
interface Age {
    age: number
}
interface Sex {
    sex: number
}

let people1: Name = { name: "小满" }
let people2: Age = { age: 20 }
let people3: Sex = { sex: 1 }

const people = Object.assign(people1,people2,people3)
```



### 2.类的混入



首先声明两个mixins类 （严格模式要关闭不然编译不过）



```typescript
class A {
    type: boolean = false;
    changeType() {
        this.type = !this.type
    }
}

class B {
    name: string = '张三';
    getName(): string {
        return this.name;
    }
}
```



下面创建一个类，结合了这两个mixins



首先应该注意到的是，没使用`extends`而是使用`implements`。 把类当成了接口



我们可以这么做来达到目的，为将要mixin进来的属性方法创建出占位属性。 这告诉编译器这些成员在运行时是可用的。 这样就能使用mixin带来的便利，虽说需要提前定义一些占位属性



```typescript
class C implements A,B{
    type:boolean
    changeType:()=>void;
    name: string;
    getName:()=> string
}
```



最后，创建这个帮助函数，帮我们做混入操作。 它会遍历mixins上的所有属性，并复制到目标上去，把之前的占位属性替换成真正的实现代码



Object.getOwnPropertyNames()可以获取对象自身的属性，除去他继承来的属性，
 对它所有的属性遍历，它是一个数组，遍历一下它所有的属性名



```typescript
Mixins(C, [A, B])
function Mixins(curCls: any, itemCls: any[]) {
    itemCls.forEach(item => {
        Object.getOwnPropertyNames(item.prototype).forEach(name => {
            curCls.prototype[name] = item.prototype[name]
        })
    })
}
```



[学习TypeScript20（装饰器Decorator）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122630296?spm=1001.2014.3001.5501)
