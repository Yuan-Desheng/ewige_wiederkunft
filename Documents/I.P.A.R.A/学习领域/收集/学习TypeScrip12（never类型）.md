---
createTime: 2026-06-29 18:59
笔记ID: 2026062918594817
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip12（never类型）」笔记。素材来源 CSDN 博客 122407704。
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

## 学习TypeScrip12（never类型）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122407704)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-10 18:29:47

---

TypeScript 将使用 never 类型来表示不应该存在的状态(很抽象是不是)



```typescript
// 返回never的函数必须存在无法达到的终点

// 因为必定抛出异常，所以 error 将不会有返回值
function error(message: string): never {
    throw new Error(message);
}

// 因为存在死循环，所以 loop 将不会有返回值
function loop(): never {
    while (true) {
    }
}
```



### never 与 void 的差异



```typescript
//void类型只是没有返回值 但本身不会出错
    function Void():void {
        console.log();
    }

    //只会抛出异常没有返回值
    function Never():never {
    throw new Error('aaa')
    }
```



差异2   当我们鼠标移上去的时候会发现 只有void和number    never在联合类型中会被直接移除



```typescript
type A = void | number | never
```



#### never 类型的一个应用场景



举一个我们可能会见到的例子



```typescript
type A = '小满' | '大满' | '超大满'

function isXiaoMan(value:A) {
   switch (value) {
       case "小满":
           break
       case "大满":
          break
       case "超大满":
          break
       default:
          //是用于场景兜底逻辑
          const error:never = value;
          return error
   }
}
```



比如新来了一个同事他新增了一个篮球，我们必须手动找到所有 switch 代码并处理，否则将有可能引入 BUG 。



而且这将是一个“隐蔽型”的BUG，如果回归面不够广，很难发现此类BUG。



那 TS 有没有办法帮助我们在类型检查阶段发现这个问题呢？



```typescript
type A = '小满' | '大满' | '超大满' | "小小满"

function isXiaoMan(value:A) {
   switch (value) {
       case "小满":
           break
       case "大满":
          break
       case "超大满":
          break
       default:
          //是用于场景兜底逻辑
          const error:never = value;
          return error
   }
}
```



由于任何类型都不能赋值给 `never` 类型的变量，所以当存在进入 `default` 分支的可能性时，TS的类型检查会及时帮我们发现这个问题



[学习TypeScrip13（symbol类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122463630?spm=1001.2014.3001.5501)
