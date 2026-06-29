---
createTime: 2026-06-29 18:59
笔记ID: 2026062918591312
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript18（声明文件d.ts）」笔记。素材来源 CSDN 博客 122558474。
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

## 学习TypeScript18（声明文件d.ts）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122558474)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-19 20:49:23

---

## 声明文件 declare



当使用第三方库时，我们需要引用它的声明文件，才能获得对应的代码补全、接口提示等功能。



```typescript
declare var 声明全局变量
declare function 声明全局方法
declare class 声明全局类
declare enum 声明全局枚举类型
declare namespace 声明（含有子属性的）全局对象
interface 和 type 声明全局类型
///  三斜线指令
```



例如我们有一个express 和 axios





 发现express 报错了



让我们去下载他的声明文件



npm install @types/node -D



那为什么axios 没有报错



我们可以去node_modules 下面去找axios 的package json





 发现axios已经指定了声明文件 所以没有报错可以直接用



通过语法declare 暴露我们声明的axios 对象



declare  const axios: AxiosStatic;



如果有一些第三方包确实没有声明文件我们可以自己去定义



名称.d.ts 创建一个文件去声明



## 案例手写声明文件



index.ts



```typescript
import express from 'express'

const app = express()

const router = express.Router()

app.use('/api', router)

router.get('/list', (req, res) => {
    res.json({
        code: 200
    })
})

app.listen(9001,()=>{
    console.log(9001)
})
```



express.d.ts



```typescript
declare module 'express' {
    interface Router {
        get(path: string, cb: (req: any, res: any) => void): void
    }
    interface App {

        use(path: string, router: any): void
        listen(port: number, cb?: () => void): void
    }
    interface Express {
        (): App
        Router(): Router

    }
    const express: Express
    export default express
}
```



## 关于这些第三发的声明文件包都收录到了 [npm](https://www.npmjs.com/~types?activeTab=packages)



npm js



[学习TypeScript19（Mixins混入）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122602896?spm=1001.2014.3001.5501)
