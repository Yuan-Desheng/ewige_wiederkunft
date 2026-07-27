---
createTime: 2026-06-29 18:59
笔记ID: 2026062918592814
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript16（namespace命名空间）」笔记。素材来源 CSDN 博客 122544685。
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

## 学习TypeScript16（namespace命名空间）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122544685)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-17 18:11:30

---

我们在工作中无法避免全局变量造成的污染，TypeScript提供了namespace 避免这个问题出现


内部模块，主要用于组织代码，避免命名冲突。命名空间内的类默认私有通过 `export` 暴露通过 `namespace` 关键字定义

### TypeScript与ECMAScript 2015一样，任何包含顶级import或者export的文件都被当成一个模块。相反地，如果一个文件不带有顶级的import或者export声明，那么它的内容被视为全局可见的（因此对模块也是可见的）





ok，让我们看一个小例子



命名空间中通过`export`将想要暴露的部分导出



如果不用export 导出是无法读取其值的



```typescript
namespace a {
    export const Time: number = 1000
    export const fn = (arg: T): T => {
        return arg
    }
    fn(Time)
}

namespace b {
     export const Time: number = 1000
     export const fn = (arg: T): T => {
        return arg
    }
    fn(Time)
}

a.Time
b.Time
```



嵌套命名空间



```typescript
namespace a {
    export namespace b {
        export class Vue {
            parameters: string
            constructor(parameters: string) {
                this.parameters = parameters
            }
        }
    }
}

let v = a.b.Vue

new v('1')
```



抽离命名空间



a.ts



```typescript
export namespace V {
    export const a = 1
}
```



b.ts



```typescript
import {V} from '../observer/index'

console.log(V);
```



 //{a:1}



简化命名空间



```typescript
namespace A  {
    export namespace B {
        export const C = 1
    }
}

import X = A.B.C

console.log(X);
```



合并命名空间



重名的命名空间会合并





[学习TypeScript17（模块解析）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122554824?spm=1001.2014.3001.5501)
