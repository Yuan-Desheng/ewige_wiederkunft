---
createTime: 2026-06-29 18:58
笔记ID: 2026062918583807
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript23（TS进阶用法proxy & Reflect）」笔记。素材来源 CSDN 博客 122740383。
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

## 学习TypeScript23（TS进阶用法proxy & Reflect）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122740383)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-29 11:45:22

---

学习proxy对象代理



**Proxy** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）



**`target`**



要使用 `Proxy` 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。



**`handler`**



一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为。



[handler.get()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get) 本次使用的get



属性读取操作的捕捉器。



[handler.set()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/set) 本次使用的set



属性设置操作的捕捉器。



## Reflect



与大多数全局对象不同`Reflect`并非一个构造函数，所以不能通过[new运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)对其进行调用，或者将`Reflect`对象作为一个函数来调用。`Reflect`的所有属性和方法都是静态的（就像[Math](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math)对象）



#### Reflect.get(target, name, receiver)



`Reflect.get`方法查找并返回`target`对象的`name`属性，如果没有该属性返回undefined



#### Reflect.set(target, name,value, receiver)



`Reflect.set`方法设置`target`对象的`name`属性等于`value`。



```typescript
type Person = {
    name: string,
    age: number,
    text: string
}

const proxy = (object: any, key: any) => {
    return new Proxy(object, {
        get(target, prop, receiver) {
            console.log(`get key======>${key}`);
            return Reflect.get(target, prop, receiver)
        },

        set(target, prop, value, receiver) {
            console.log(`set key======>${key}`);

            return Reflect.set(target, prop, value, receiver)
        }
    })
}

const logAccess = (object: Person, key: 'name' | 'age' | 'text') => {
    return proxy(object, key)
}

let man: Person = logAccess({
    name: "小满",
    age: 20,
    text: "我的很小"
}, 'age')

man.age  = 30

console.log(man);
```



使用泛型+keyof优化



```typescript
type Person = {
    name: string,
    age: number,
    text: string
}

const proxy = (object: any, key: any) => {
    return new Proxy(object, {
        get(target, prop, receiver) {
            console.log(`get key======>${key}`);
            return Reflect.get(target, prop, receiver)
        },

        set(target, prop, value, receiver) {
            console.log(`set key======>${key}`);

            return Reflect.set(target, prop, value, receiver)
        }
    })
}

const logAccess = (object: T, key: keyof T): T => {
    return proxy(object, key)
}

let man: Person = logAccess({
    name: "小满",
    age: 20,
    text: "我的很小"
}, 'age')

let man2 = logAccess({
    id:1,
    name:"小满2"
}, 'name')

man.age = 30

console.log(man);
```







**案例简单实现一个mobx观察者模式**



```typescript
const list: Set = new Set()

const autorun = (cb: Function) => {
    if (cb) {
        list.add(cb)
    }
}

const observable = (params: T) => {
    return new Proxy(params, {
        set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver)
            list.forEach(fn => fn())
            console.log(list)
            return result
        }
    })
}

const person = observable({ name: "小满", attr: "威猛先生" })

autorun(()=>{
    console.log('我变化了')
})

person.attr = '威猛个捶捶'
```
