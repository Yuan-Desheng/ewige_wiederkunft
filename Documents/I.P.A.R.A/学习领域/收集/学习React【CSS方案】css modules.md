---
createTime: 2026-07-16 17:40
笔记ID: 20260716174044
multiFile:
multiMedia:
description: 小满 React 教程「学习React【CSS方案】css modules」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【CSS方案】css modules

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/css/css-modules.html)
> 作者：小满 message163（sister man）

---

## 什么是 css modules

因为 React 没有 Vue 的 Scoped，但是 React 又是 SPA（单页面应用），所以需要一种方式来解决 css 的样式冲突问题，也就是把每个组件的样式做成单独的作用域，实现样式隔离，而 css modules 就是一种解决方案，但是我们需要借助一些工具来实现，比如 `webpack`、`postcss`、`css-loader`、`vite` 等。

## 如何在 Vite 中使用 css modules

css modules 可以配合各种 css 预处理去使用，例如 `less`、`sass`、`stylus` 等。

```bash
npm install less -D # 安装less 任选其一
npm install sass -D # 安装sass 任选其一
npm install stylus -D # 安装stylus 任选其一
```

> 在 Vite 中 css Modules 是开箱即用的，只需要把文件名设置为 `xxx.module.[css|less|sass|stylus]`，就可以使用 css modules 了。

- src/components/Button/index.module.scss

```scss
.button {
  color: red;
}
```

- src/components/Button/index.tsx

```tsx
//使用方法，直接引入即可
import styles from './index.module.scss';

export default function Button() {
  return <button className={styles.button}>按钮</button>;
}
```

- 编译结果，可以看到 `button` 类名被编译成了 `button_pmkzx_6`，这就是 css modules 的实现原理，通过在类名前添加一个唯一的哈希值，来实现样式隔离。

```html
<button class="button_pmkzx_6">按钮</button>
```

## 修改 css modules 规则

- 在 vite.config.ts 中配置 css modules 的规则

```ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'dashes', // 修改css modules的类名规则 可以改成驼峰命名 或者 xxx-xxx命名等
      generateScopedName: '[name]__[local]___[hash:base64:5]', // 修改css modules的类名规则
    },
  },
});
```

### 例子 例如设置为 `(localsConvention:camelCaseOnly)` 驼峰命名

> camelCase 和 camelCaseOnly 区别在于，camelCase 会把非驼峰的命名转为驼峰，并保留之前的类名，而 camelCaseOnly 只会把非驼峰的命名转为驼峰，并删除之前的类名。

- src/components/Button/index.module.scss

```scss
.button-red {
  color: red;
}
```

- src/components/Button/index.tsx

> 设置为驼峰之后，使用的时候需要使用驼峰命名，例如 `buttonRed`，而不是 `button-red`。

```tsx
import styles from './index.module.scss';

export default function Button() {
  return <button className={styles.buttonRed}>按钮</button>;
}
```

### 例子 例如设置为 `(localsConvention:dashesOnly)` 会将所有 - 的类名转化为驼峰，并且原始的类名会被删除

> dashes 和 dashesOnly 区别在于，dashes 会保留原始的类名，而 dashesOnly 会删除原始的类名。

- src/components/Button/index.module.scss

```scss
.button-red {
  color: red;
}
```

- src/components/Button/index.tsx

> 设置为原始命名之后，使用的时候需要使用驼峰命名，例如 `buttonRed`，而不是 `button-red`。

```tsx
import styles from './index.module.scss';

export default function Button() {
  return <button className={styles.buttonRed}>按钮</button>;
}
```

> 如果想同时支持驼峰命名和 `-` 连接的命名，可以设置为 `localsConvention:[camelCase|dashes]`，这样就可以同时支持驼峰命名和 `-` 连接的命名。

### 例子 修改 css modules 的类名规则

- 在 vite.config.ts 中配置 css modules 的规则

```ts
export default defineConfig({
  css: {
    modules: {
        generateScopedName: '[local]_[hash:base64:5]' // 只保留类名和哈希值
        // 或者
        generateScopedName: '[hash:base64:8]' // 只使用哈希值
        // 或者
        generateScopedName: '[name]_[local]' // 只使用文件名和类名，没有哈希
        // 或者
        generateScopedName: '[local]--[hash:base64:4]' // 自定义分隔符
    },
  },
});
```

编译结果：

```html
<button class="button_pmkzx_6">类名 + 哈希值</button>
<button class="pmkzx_6">哈希值</button>
<button class="index-module_button">文件名 + 类名</button>
<button class="button--pmkzx_6">类名 + 分隔符 + 哈希值</button>
```

## 维持类名

意思就是说在样式文件中的某些样式，不希望被编译成 css modules，可以设置为 `global`，例如：

```scss
.app{
    background: red;
    width: 200px;
    height: 200px;
    :global(.button){
        background: blue;
        width: 100px;
        height: 100px;
    }
}
```

```tsx
//在使用的时候，就可以直接使用原始的类名 button
import styles from './index.module.scss';
const App: React.FC = () => {
  return (
    <>
      <div className={styles.app}>
        <button className='button'>按钮</button>
      </div>
    </>
  );
}
```
