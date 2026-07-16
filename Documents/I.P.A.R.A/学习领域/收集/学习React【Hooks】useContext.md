---
createTime: 2026-07-16 17:43
笔记ID: 20260716174302
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Hooks】useContext」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Hooks】useContext

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/hooks/useContext.html)
> 作者：小满 message163（sister man）

---

`useContext` 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。设计的目的就是解决组件树间数据传递的问题。

![useContext 数据流向](https://message163.github.io/react-docs/assets/useContext.DUgSm-JN.png)

## 用法

```typescript
const MyThemeContext = React.createContext({theme: 'light'}); // 创建一个上下文
function App () {
   return (
      <MyThemeContext.Provider value={{theme: 'light'}}>
         <MyComponent />
      </MyThemeContext.Provider>
   )
}
function MyComponent() {
    const themeContext = useContext(MyThemeContext); // 使用上下文
    return (<div>{themeContext.theme}</div>);
}
```

## 参数

入参

- `context`：是 `createContext` 创建出来的对象，他不保持信息，他是信息的载体。声明了可以从组件获取或者给组件提供信息。

返回值

- 返回传递的 Context 的值，并且是只读的。如果 context 发生变化，React 会自动重新渲染读取 context 的组件。

## 基本用法

> 我们编写一个传递主题的例子，这个 hook 在 18 版本和 19 版本是有区别的。

### 18 版本演示

首先我们先通过 `createContext` 创建一个上下文，然后通过 `createContext` 创建的组件包裹组件，传递值。

被包裹的组件，在任何一个层级都是可以获取上下文的值，那么如何使用呢？

使用的方式就是通过 `useContext` 这个 hook，然后传入上下文，就可以获取到上下文的值。

```tsx
import React, { useContext, useState } from 'react';
// 创建上下文
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
// 定义上下文类型
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}
const Child = () => {
    // 获取上下文
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         child
      </div>
   </div>
}

const Parent = () => {
    // 获取上下文
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         Parent
      </div>
      <Child />
   </div>
}

function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         <ThemeContext.Provider value={{ theme, setTheme }}>
            <Parent />
         </ThemeContext.Provider>
      </div >
   );
}

export default App;
```

### 19 版本演示

> 其实 19 版本和 18 版本是差不多的，只是 19 版本更加简单了，不需要再使用 Provider 包裹，直接使用即可。

```tsx
import React, { useContext, useState } from 'react';
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}

const Child = () => {
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         child
      </div>
   </div>
}

const Parent = () => {
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         Parent
      </div>
      <Child />
   </div>
}
function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         <ThemeContext.Provider value={{ theme, setTheme }}>
         <ThemeContext value={{ theme, setTheme }}>
            <Parent />
         </ThemeContext.Provider>
         <ThemeContext>
      </div >
   );
}

export default App;
```

## 注意事项

- 使用 ThemeContext 时，传递的 key 必须为 `value`。

```tsx
// 🚩 不起作用：prop 应该是"value"
<ThemeContext theme={theme}>
   <Button />
</ThemeContext>
// ✅ 传递 value 作为 prop
<ThemeContext value={theme}>
   <Button />
</ThemeContext>
```

- 可以使用多个 Context。

> 如果使用多个 Context，那么需要注意，如果使用的值是相同的，那么会覆盖。

```tsx
const ThemeContext = React.createContext({theme: 'light'});

function App() {
   return (
      <ThemeContext value={{theme: 'light'}}>
         <ThemeContext value={{theme: 'dark'}}> {/* 覆盖了上面的值 */}
            <Parent />
         </ThemeContext>
      </ThemeContext>
   )
}
```
