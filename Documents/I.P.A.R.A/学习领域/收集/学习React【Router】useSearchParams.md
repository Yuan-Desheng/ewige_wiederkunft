---
createTime: 2026-07-16 17:38
笔记ID: 20260716173824
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useSearchParams」笔记。素材来源 message163.github.io/react-docs。
笔记类型: 收集笔记
阐述日期:
tags:
  - React
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-react.canvas|小满zs-react]]"
---

## 学习React【Router】useSearchParams

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useSearchParams.html)
> 作者：小满 message163（sister man）

---

`useSearchParams` 是一个 React-router 的钩子函数，用于获取当前 URL 的搜索参数，也就是 `?` 后面的参数。

## 使用

返回一个包含当前 URL 搜索参数的 `URLSearchParams` 对象。

```tsx
import { useSearchParams } from 'react-router'

function SomeComponent() {
  let [searchParams, setSearchParams] = useSearchParams()
}
```

例如当前 URL 为 `http://localhost:5173/search?name=张三&age=18`：

```tsx
// 获取当前 URL 的搜索参数
let [searchParams, setSearchParams] = useSearchParams()
console.log(searchParams.get('name')) // 张三
console.log(searchParams.get('age')) // 18
//修改当前 URL 的搜索参数
<button onClick={() => setSearchParams(prev => {
    prev.set('age','30');
    prev.set('name','小满zs');
    return prev;
})}>change</button>
//修改完成之后的 URL 为 `http://localhost:5173/search?age=30&name=小满zs`
```

## 类型

```typescript
function useSearchParams(
  defaultInit?: URLSearchParamsInit
): [URLSearchParams, SetURLSearchParams];

type ParamKeyValuePair = [string, string];

type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams;

type SetURLSearchParams = (
  nextInit?:
    | URLSearchParamsInit
    | ((prev: URLSearchParams) => URLSearchParamsInit),
  navigateOpts?: NavigateOptions
) => void;

interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
}
```
