---
createTime: 2026-06-29 18:59
笔记ID: 2026062918592113
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript17（模块解析）」笔记。素材来源 CSDN 博客 122554824。
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

## 学习TypeScript17（模块解析）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122554824)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-18 11:53:43

---

前端模块化规范是有非常多的



在es6模块化规范之前有



Commonjs - > Nodejs



```typescript
// 导入
require("xxx");
require("../xxx.js");
// 导出
exports.xxxxxx= function() {};
module.exports = xxxxx;
```



AMD ->   requireJs



```typescript
// 定义
define("module", ["dep1", "dep2"], function(d1, d2) {...});
// 加载模块
require(["module", "../app"], function(module, app) {...});
```



CMD ->  seaJs



```typescript
define(function(require, exports, module) {
  var a = require('./a');
  a.doSomething();

  var b = require('./b');
  b.doSomething();
});
```



UMD ->  UMD是AMD和CommonJS的糅合



```typescript
(function (window, factory) {
    // 检测是不是 Nodejs 环境
	if (typeof module === 'object' && typeof module.exports === "objects") {
        module.exports = factory();
    }
	// 检测是不是 AMD 规范
	else if (typeof define === 'function' && define.amd) {
        define(factory);
    }
	// 使用浏览器环境
	else {
        window.eventUtil = factory();
    }
})(this, function () {
    //module ...
});
```



es6模块化规范出来之后上面这些模块化规范就用的比较少了



现在主要使用 import export



#### es6模块化规范用法



.1.默认导出 和 引入



默认导出可以导出任意类型，这儿举例导出一个对象，并且默认导出只能有一个



引入的时候名字可以随便起



```typescript
//导出
export default {
    a:1,
}
//引入
import test from "./test";
```



 2.分别导出



```typescript
export default {
    a:1,
}

export function add(a: T, b: T) {
    return a + b
}

export let xxx = 123

//引入

import obj,{xxx,add} from './test'
```



3.重名问题 如果 导入的时候叫add但是已经有变量占用了可以用as重命名



```typescript
import obj,{xxx as bbb,add} from './test'

console.log(bbb)
```



 4.动态引入



import只能写在顶层，不能掺杂到逻辑里面，这时候就需要动态引入了



```typescript
if(true){
    import('./test').then(res => {
        console.log(res)
    })
}
```



[学习TypeScript18（声明文件d.ts）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122558474?spm=1001.2014.3001.5501)
