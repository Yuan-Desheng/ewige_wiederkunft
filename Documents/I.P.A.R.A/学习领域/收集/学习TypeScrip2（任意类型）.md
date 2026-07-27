---
createTime: 2026-06-29 19:00
笔记ID: 2026062919004327
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip2（任意类型）」笔记。素材来源 CSDN 博客 122170624。
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

## 学习TypeScrip2（任意类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122170624)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2021-12-27 14:20:42

---

### Any 类型 和 unknown 顶级类型



```typescript
nodejs 环境执行ts
npm i @types/node --save-dev （node环境支持的依赖必装）
npm i ts-node --g
```



1.没有强制限定哪种类型，随时切换类型都可以 我们可以对 any 进行任何操作，不需要检查类型



```typescript
let anys:any = 123
anys = '123'
anys = true
```



2.声明变量的时候没有指定任意类型默认为any



```typescript
let anys;
anys = '123'
anys = true
```



3.弊端如果使用any 就失去了TS类型检测的作用



4.TypeScript 3.0中引入的 unknown 类型也被认为是 top type ，但它更安全。与 any 一样，所有类型都可以分配给unknown



unknow  unknow类型比any更加严格当你要使用any 的时候可以尝试使用unknow



```typescript
//unknown 可以定义任何类型的值
let value: unknown;

value = true;             // OK
value = 42;               // OK
value = "Hello World";    // OK
value = [];               // OK
value = {};               // OK
value = null;             // OK
value = undefined;        // OK
value = Symbol("type");   // OK

//这样写会报错unknow类型不能作为子类型只能作为父类型 any可以作为父类型和子类型
//unknown类型不能赋值给其他类型
let names:unknown = '123'
let names2:string = names

//这样就没问题 any类型是可以的
let names:any = '123'
let names2:string = names

//unknown可赋值对象只有unknown 和 any
let bbb:unknown = '123'
let aaa:any= '456'

aaa = bbb
```



区别2



```typescript
如果是any类型在对象没有这个属性的时候还在获取是不会报错的
let obj:any = {b:1}
obj.a

如果是unknow 是不能调用属性和方法
let obj:unknown = {b:1,ccc:():number=>213}
obj.b
obj.ccc()
```



第三章



[学习TypeScrip3（接口和对象类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122173993)
