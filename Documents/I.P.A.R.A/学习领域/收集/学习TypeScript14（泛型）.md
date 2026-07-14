---
createTime: 2026-06-29 18:54
笔记ID: 2026062918545902
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript14（泛型）」笔记。素材来源 CSDN 博客 122490830。
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

## 学习TypeScript14（泛型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122490830)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-14 18:42:41

---

泛型在TypeScript 是很重要的东西 例如vue3 是用ts编写的 里面用到了非常多的泛型



ok:我们看一个小例子



### 函数泛型



我写了两个函数一个是数字类型的函数，另一个是字符串类型的函数,其实就是类型不同，



实现的功能是一样的，这时候我们就可以使用泛型来优化



```typescript
function num (a:number,b:number) : Array {
    return [a ,b];
}
num(1,2)
function str (a:string,b:string) : Array {
    return [a ,b];
}
str('独孤','求败')
```



泛型优化



语法为函数名字后面跟一个 参数名可以随便写 例如我这儿写了T



当我们使用这个函数的时候把参数的类型传进去就可以了 （也就是动态类型）



```typescript
function Add(a: T, b: T): Array  {
    return [a,b]
}

Add(1,2)
Add('1','2')
```



我们也可以使用不同的泛型参数名，只要在数量上和使用方式上能对应上就可以。



```typescript
function Sub(a:T,b:U):Array {
    const params:Array = [a,b]
    return params
}

Sub(false,1)
```



### 定义泛型接口



声明接口的时候 在名字后面加一个



使用的时候传递类型



```typescript
interface MyInter {
   (arg: T): T
}

function fn(arg: T): T {
   return arg
}

let result: MyInter = fn

result(123)
```



### 对象字面量泛型



```typescript
let foo: { (arg: T): T }

foo = function (arg:T):T {
   return arg
}

foo(123)
```



### 泛型约束



我们期望在一个泛型的变量上面，获取其`length`参数，但是，有的数据类型是没有`length`属性的



```typescript
function getLegnth(arg:T) {
  return arg.length
}
```



 这时候我们就可以使用泛型约束



于是，我们就得对使用的泛型进行约束，我们约束其为具有`length`属性的类型，这里我们会用到`interface`,代码如下



```typescript
interface Len {
   length:number
}

function getLegnth(arg:T) {
  return arg.length
}

getLegnth('123')
```



### 使用keyof 约束对象



其中使用了TS泛型和泛型约束。首先定义了T类型并使用extends关键字继承object类型的子类型，然后使用keyof操作符获取T类型的所有键，它的返回 类型是联合 类型，最后利用extends关键字约束 K类型必须为keyof T联合类型的子类型



```typescript
function prop(obj: T, key: K) {
   return obj[key]
}

let o = { a: 1, b: 2, c: 3 }

prop(o, 'a')
prop(o, 'd') //此时就会报错发现找不到
```



### 泛型类



声明方法跟函数类似名称后面定义



使用的时候确定类型new Sub()



```typescript
class Sub{
   attr: T[] = [];
   add (a:T):T[] {
      return [a]
   }
}

let s = new Sub()
s.attr = [1,2,3]
s.add(123)

let str = new Sub()
str.attr = ['1','2','3']
str.add('123')
```



[学习TypeScript15（tsconfig.json配置文件）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122525099?spm=1001.2014.3001.5501)
