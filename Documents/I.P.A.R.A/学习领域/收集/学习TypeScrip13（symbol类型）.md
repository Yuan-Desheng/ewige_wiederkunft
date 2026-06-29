---
createTime: 2026-06-29 18:59
笔记ID: 2026062918594216
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip13（symbol类型）」笔记。素材来源 CSDN 博客 122463630。
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

## 学习TypeScrip13（symbol类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122463630)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-12 22:22:58

---

## [Symbols · TypeScript中文网 · TypeScript——JavaScript的超集 ts官网https://www.tslang.cn/docs/handbook/symbols.html](https://www.tslang.cn/docs/handbook/symbols.html)



## Symbol



## 自ECMAScript 2015起，symbol成为了一种新的原生类型，就像number和string一样。



`symbol`类型的值是通过`Symbol`构造函数创建的。



可以传递参做为唯一标识 只支持 string 和 number类型的参数



```typescript
let sym1 = Symbol();
let sym2 = Symbol("key"); // 可选的字符串key
```



## Symbol的值是唯一的



```typescript
const s1 = Symbol()
const s2 = Symbol()
// s1 === s2 =>false
```



## 用作对象属性的键



```typescript
let sym = Symbol();

let obj = {
    [sym]: "value"
};

console.log(obj[sym]); // "value"
```



## 使用symbol定义的属性，是不能通过如下方式遍历拿到的



```typescript
const symbol1 = Symbol('666')
const symbol2 = Symbol('777')
const obj1= {
   [symbol1]: '小满',
   [symbol2]: '二蛋',
   age: 19,
   sex: '女'
}
// 1 for in 遍历
for (const key in obj1) {
   // 注意在console看key,是不是没有遍历到symbol1
   console.log(key)
}
// 2 Object.keys 遍历
Object.keys(obj1)
console.log(Object.keys(obj1))
// 3 getOwnPropertyNames
console.log(Object.getOwnPropertyNames(obj1))
// 4 JSON.stringfy
console.log(JSON.stringify(obj1))
```



如何拿到



```typescript
// 1 拿到具体的symbol 属性,对象中有几个就会拿到几个
Object.getOwnPropertySymbols(obj1)
console.log(Object.getOwnPropertySymbols(obj1))
// 2 es6 的 Reflect 拿到对象的所有属性
Reflect.ownKeys(obj1)
console.log(Reflect.ownKeys(obj1))
```



## Symbol.iterator 迭代器 和 生成器 for of



支持遍历大部分类型迭代器 arr nodeList argumetns set map 等



```typescript
var arr = [1,2,3,4];
let iterator = arr[Symbol.iterator]();

console.log(iterator.next());  //{ value: 1, done: false }
console.log(iterator.next());  //{ value: 2, done: false }
console.log(iterator.next());  //{ value: 3, done: false }
console.log(iterator.next());  //{ value: 4, done: false }
console.log(iterator.next());  //{ value: undefined, done: true }
```



测试用例



```typescript
interface Item {
    age: number,
    name: string
}

const array: Array = [{ age: 123, name: "1" }, { age: 123, name: "2" }, { age: 123, name: "3" }]

type mapTypes = string | number
const map:Map = new Map()

map.set('1','王爷')
map.set('2','陆北')

const obj = {
    aaa:123,
    bbb:456
}

let set:Set = new Set([1,2,3,4,5,6])
// let it:Iterator = array[Symbol.iterator]()
const gen = (erg:any): void => {
    let it: Iterator = erg[Symbol.iterator]()
    let next:any= { done: false }
    while (!next.done) {
        next =  it.next()
        if (!next.done) {
            console.log(next.value)
        }
    }
}
gen(array)
```



我们平时开发中不会手动调用iterator 应为 他是有语法糖的就是for of  记住 for of 是不能循环对象的应为对象没有 iterator



```typescript
for (let value of map) {
    console.log(value)
}
```



数组解构的原理其实也是调用迭代器的



```typescript
var [a,b,c] = [1,2,3]

var x = [...xxxx]
```



 那我们可以自己实现一个迭代器让对象支持for of



```typescript
const obj = {
    max: 5,
    current: 0,
    [Symbol.iterator]() {
        return {
            max: this.max,
            current: this.current,
            next() {
                if (this.current == this.max) {
                    return {
                        value: undefined,
                        done: true
                    }
                } else {
                    return {
                        value: this.current++,
                        done: false
                    }
                }
            }
        }
    }
}
console.log([...obj])

for (let val of obj) {
   console.log(val);

}
```



以下为这些symbols的列表：



**Symbol.hasInstance**
 方法，会被instanceof运算符调用。构造器对象用来识别一个对象是否是其实例。



**Symbol.isConcatSpreadable**
 布尔值，表示当在一个对象上调用Array.prototype.concat时，这个对象的数组元素是否可展开。



**Symbol.iterator**
 方法，被for-of语句调用。返回对象的默认迭代器。



**Symbol.match**
 方法，被String.prototype.match调用。正则表达式用来匹配字符串。



**Symbol.replace**
 方法，被String.prototype.replace调用。正则表达式用来替换字符串中匹配的子串。



**Symbol.search**
 方法，被String.prototype.search调用。正则表达式返回被匹配部分在字符串中的索引。



**Symbol.species**
 函数值，为一个构造函数。用来创建派生对象。



**Symbol.split**
 方法，被String.prototype.split调用。正则表达式来用分割字符串。



**Symbol.toPrimitive**
 方法，被ToPrimitive抽象操作调用。把对象转换为相应的原始值。



**Symbol.toStringTag**
 方法，被内置方法Object.prototype.toString调用。返回创建对象时默认的字符串描述。



**Symbol.unscopables**
 对象，它自己拥有的属性会被with作用域排除在外。



学习[学习TypeScript14（泛型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122490830?spm=1001.2014.3001.5501)
