---
createTime: 2026-07-16 17:39
笔记ID: 20260716173953
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Hooks】useDeferredValue」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Hooks】useDeferredValue

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/hooks/useDeferredValue.html)
> 作者：小满 message163（sister man）

---

`useDeferredValue` 用于延迟某些状态的更新，直到主渲染任务完成。这对于高频更新的内容（如输入框、滚动等）非常有用，可以让 UI 更加流畅，避免由于频繁更新而导致的性能问题。

## 关联问题：useTransition 和 useDeferredValue 的区别

`useTransition` 和 `useDeferredValue` 都涉及延迟更新，但它们关注的重点和用途略有不同：

- useTransition 主要关注点是状态的过渡。它允许开发者控制某个更新的延迟更新，还提供了过渡标识，让开发者能够添加过渡反馈。
- useDeferredValue 主要关注点是单个值的延迟更新。它允许你把特定状态的更新标记为低优先级。

## 用法

```typescript
const deferredValue = useDeferredValue(value)
```

### 参数

- value: 延迟更新的值（支持任意类型）

### 返回值

- deferredValue: 延迟更新的值，在初始渲染期间，返回的延迟值将与您提供的值相同。

### 注意事项

当 `useDeferredValue` 接收到与之前不同的值（使用 `Object.is` 进行比较）时，除了当前渲染（此时它仍然使用旧值），它还会安排一个后台重新渲染。这个后台重新渲染是可以被中断的，如果 value 有新的更新，React 会从头开始重新启动后台渲染。举个例子，如果用户在输入框中的输入速度比接收延迟值的图表重新渲染的速度快，那么图表只会在用户停止输入后重新渲染。

## 案例：延迟搜索数据的更新

```bash
npm install mockjs antd
```

- antd UI 组件库
- mockjs 模拟数据

以下示例展示了如何使用 `useDeferredValue` 延迟处理输入内容，以提高大型数据的搜索性能。

```tsx
import React, { useState, useTransition, useDeferredValue } from 'react'
import { Input, List } from 'antd'
import mockjs from 'mockjs'
interface Item {
   name: number
   address: string
}
export const App = () => {
   const [val, setVal] = useState('')
   const [list] = useState<Item[]>(() => {
    // 使用 Mock.js 生成模拟数据
      return mockjs.mock({
         'list|10000': [
            {
               'id|+1': 1,
               name: '@natural',
               'address': '@county(true)',
            }
         ]
      }).list
   })
   const deferredQuery = useDeferredValue(val)
   const isStale = deferredQuery !== val // 检查是否为延迟状态
   const findItem = () => {
      //过滤列表，仅在 deferredQuery 更新时触发
      return list.filter(item => item.name.toString().includes(deferredQuery))
   }
   return (
      <div>
         <Input value={val} onChange={(e) => setVal(e.target.value)} />
         <List style={{opacity: isStale ? '0.2' : '1', transition: 'all 1s'}} renderItem={(item) => <List.Item>
            <List.Item.Meta title={item.name} description={item.address} />
         </List.Item>} dataSource={findItem()}>
         </List>
      </div>
   )
}

export default App
```

### 效果

使用 useDeferredValue 后，输入框中的搜索内容不会立即触发列表过滤，避免频繁的渲染。输入停止片刻后（看起来像节流），列表会自动更新为符合条件的数据，确保了较流畅的交互体验。

## 陷阱

`useDeferredValue` 并不是防抖。防抖是需要一个固定的延迟时间，譬如 1 秒后再处理某些行为，但是 useDeferredValue 并不是一个固定的延迟，它会根据用户设备的情况进行延迟，当设备情况好，那么延迟几乎是无感知的。
