---
createTime: 2026-07-16 17:42
笔记ID: 20260716174240
multiFile:
multiMedia:
description: 小满 React 教程「学习React【入门】tsx语法入门」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【入门】tsx语法入门

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/basic/tsx.html)
> 作者：小满 message163（sister man）

---

## FAQ

### tsx 跟 jsx 有什么区别

答：基本没有区别，只是在 jsx 语法上增加了类型。

### jsx 是什么

答：jsx 是 js 的语法扩展，允许在 js 中编写 html 代码。

例如：

```tsx
const fn = () => <div>小满是谁？没听说过</div>
```

## 语法编写

- 使用 tsx 绑定变量 `{value}`

> 绑定 class 需要用 className

```tsx
function App() {
  const num: number = 333
  const fn = () => 'test'
  return (
    <>
      {'11' /** 字符串用法 */}
      {num /** 变量用法 */}
      {fn() /** 函数用法 */}
      {new Date().getTime() /** 日期用法 */}
    </>
  )
}
//绑定class(className) id 属性等等 都是一样的
function App() {
  const value:string = 'A'
  return (
    <>
      <div data-index={value} className={value} id={value}>{value}</div>
    </>
  )
}
//绑定多个class(className)
function App() {
  const a:string = 'A'
  return (
    <>
      <div className={`${a} class2`}>{value}</div>
    </>
  )
}
//绑定样式style
function App() {
  const styles = { color: 'red' }
  return (
    <>
      <div style={styles}>test</div>
    </>
  )
}
```

- 使用 tsx 绑定事件 `on[Click]{fn}` 小驼峰，其他事件也是一样的

```tsx
function App() {
  const value: string = '小满'
  const clickTap = (params: string) => console.log(params)
  return (
    <>
      <div onClick={() => clickTap(value)}>{value}</div>
    </>
  )
}
```

- tsx 如何使用泛型

正常写泛型语法会跟 tsx 语法冲突，他会把泛型理解成是一个元素，解决方案后面加一个 `,` 即可。

```tsx
function App() {
  const value: string = '小满'
  const clickTap = <T,>(params: T) => console.log(params)
  return (
    <>
      <div onClick={() => clickTap(value)}>{value}</div>
    </>
  )
}
```

- tsx 如何渲染 html 代码片段（dangerouslySetInnerHTML）

`dangerouslySetInnerHTML` 的值是一个对象，该对象包含一个名为 `__html` 的属性，且值为你想要插入的 HTML 字符串。

```tsx
function App() {
  const value: string = '<section style="color:red">小满</section>'
  return (
    <>
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
    </>
  )
}
```

- tsx 如何遍历 dom 元素

使用 map 遍历返回 html 标签即可。

```tsx
function App() {
  const arr: string[] = ["小满","中满","大满"]
  return (
    <>
        {
            arr.map((item) => {
                return <div>{item}</div>
            })
        }
    </>
  )
}
```

- tsx 如何编写条件语句

使用三元表达式就可以了。

```tsx
function App() {
  const flag:boolean = true
  return (
    <>
        {
           flag ? <div>真的</div> : <div>假的</div>
        }
    </>
  )
}
```

- tsx 注意事项

**`{}` 插值语句内不允许编写 `switch`、`if`、变量声明，或者直接放入对象本体。**

下面展示错误用法和正确用法对比：

```tsx
//错误用法
function App() {
  const obj = { name: '小满' }
  return (
    <>
      {obj}
    </>
  )
}
//正确用法
function App() {
  const obj = { name: '小满' }
  return (
    <>
      {obj.name}
      {JSON.stringify(obj)}
    </>
  )
}
```

```tsx
//错误用法
function App() {
  const flag:boolean = true
  return (
    <>
       {
        if(flag){
          <p>1</p>
        }else{
          <p>2</p>
        }
       }
    </>
  )
}
//正确用法
function App() {
  const flag:boolean = true
  return (
    <>
       {
        flag ? <div>1</div> : <div>2</div>
       }
    </>
  )
}
```
