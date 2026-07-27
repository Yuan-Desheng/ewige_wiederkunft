---
createTime: 2026-06-29 18:58
笔记ID: 2026062918583006
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript类型守卫」笔记。素材来源 CSDN 博客 135249620。
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

## 学习TypeScript类型守卫

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/135249620)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2023-12-27 17:13:23

---

#### 类型守卫

在 TypeScript 中，类型守卫（`Type Guards`）是一种用于在运行时检查类型的机制。它们允许你在代码中执行特定的检查，以确定变量的类型，并在需要时执行相应的操作。

typeof 类型收缩

```typescript
const isString = (str:any) => {
   return typeof str === 'string';
}
```

在这个例子里面我们声明一个函数可以接受任意类型，只筛选出字符串类型，进行类型收缩。

instanceof

```typescript
const isArr = (value:unknown) => {
    if(value instanceof Array){
        value.length
    }
}
```

使用 instanceof 类型守卫可以检查一个对象是否是特定类的实例

#### typeof 和 instanceof 区别

typeof 和 instanceof 是 TypeScript 中用于类型检查的两个不同的操作符，它们有不同的作用和使用场景。

typeof 和 instanceof 是 TypeScript 中用于类型检查的两个不同的操作符，它们有不同的作用和使用场景。

```typescript
const str = "Hello";
console.log(typeof str); // 输出: "string"

const num = 42;
console.log(typeof num); // 输出: "number"

const bool = true;
console.log(typeof bool); // 输出: "boolean"
```

注意事项：typeof 只能返回有限的字符串类型，包括 “string”、“number”、“boolean”、“symbol”、“undefined” 和 “object”。对于函数、数组、null 等类型，typeof 也会返回 “object”。因此，typeof 对于复杂类型和自定义类型的判断是有限的。

instanceof

作用：instanceof 操作符用于检查一个对象是否是某个类的实例。它通过检查对象的原型链来确定对象是否由指定的类创建。

```typescript
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person("Alice");
console.log(person instanceof Person); // 输出: true

const obj = {};
console.log(obj instanceof Person); // 输出: false
```

注意事项：instanceof 操作符主要用于检查对象是否是特定类的实例，它无法检查基本类型。此外，它也无法检查对象是通过字面量创建的，因为字面量对象没有显式的构造函数。

#### 自定义守卫

结合题目实现

实现一个函数支持任意类型

如果是对象，就检查里面的属性，

如果里面的属性是number就取两位，如果是string就去除左右空格

如果是函数就执行

```typescript
const isString = (str:any)=> typeof str === 'string'

const isNumber = (num:any)=> typeof num === 'number'

const isFn = (fn:any)=> typeof fn === 'function'

const isObj = (obj:any)=> ({}).toString.call(obj) === '[object Object]'

const fn = (data:any) => {
    let value;
    if(isObj(data)){
        Object.keys(data).forEach(key=>{
            value = data[key]
            if(isString(value)){
                data[key] = value.trim()
            }
            if(isNumber(value)){
                data[key] = value.toFixed(2)
            }
            if(isFn(value)){
                value()
            }
        })
    }
}
const obj = {
    a: 100.22222,
    b: ' test  ',
    c: function () {
        console.log(this.a);
        return this.a;
    }
}

fn(obj)
```

乍一看没啥问题 一运行就报错

他说找不到a

`当函数被单独调用时（例如 value()），函数内部的 this 会指向全局对象（在浏览器环境下是 window）`

修改如下

```typescript
const isString = (str:any)=> typeof str === 'string'

const isNumber = (num:any)=> typeof num === 'number'

const isFn = (fn:any)=> typeof fn === 'function'

const isObj = (obj:any)=> ({}).toString.call(obj) === '[object Object]'

const fn = (data:any) => {
    let value;
    if(isObj(data)){
        Object.keys(data).forEach(key=>{
            value = data[key]
            if(isString(value)){
                data[key] = value.trim()
            }
            if(isNumber(value)){
                data[key] = value.toFixed(2)
            }
            if(isFn(value)){
                data[key]() //修改这儿
            }
        })
    }
}
const obj = {
    a: 100.22222,
    b: ' test  ',
    c: function () {
        console.log(this);
        return this.a;
    }
}

fn(obj)
```

第一个问题解决了

第二个问题是我们编写的时候没有代码提示很烦

这时候就需要自定义守卫了

类型谓词的语法形式。它表示当 `isString` 返回 `true` 时，`str` 的类型被细化为 `string` 类型

```typescript
const isString = (str:any):str is string => typeof str === 'string'

const isNumber = (num:any):num is number => typeof num === 'number'

const isFn = (fn:any) => typeof fn === 'function'

const isObj = (obj:any) => ({}).toString.call(obj) === '[object Object]'

const fn = (data:any) => {
    let value;
    if(isObj(data)){
        Object.keys(data).forEach(key=>{
            value = data[key]
            if(isString(value)){
                data[key] = value.trim()
            }
            if(isNumber(value)){
                data[key] = value.toFixed(2)
            }
            if(isFn(value)){
                data[key]()
            }
        })
    }
}
const obj = {
    a: 100.22222,
    b: ' test  ',
    c: function () {
        console.log(this);
        return this.a;
    }
}

fn(obj)
```
