---
createTime: 2026-07-16 17:39
笔记ID: 20260716173906
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】操作」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】操作

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/operation.html)
> 作者：小满 message163（sister man）

---

## 路由操作

路由的操作由两个部分组成：

- `loader`
- `action`

在平时工作中大部分都是在做增删查改（CRUD）的操作，所以一个界面的接口过多之后就会使逻辑臃肿复杂，难以维护，所以需要使用路由的高级操作来优化代码。

## loader

useLoaderData 速查文档。

> 只有 GET 请求才会触发 loader，所以适合用来获取数据。

在之前是：`RenderComponent（渲染组件）` -> `Fetch（获取数据）` -> `RenderView（渲染视图）`。

有了 loader 之后是：`loader（通过 fetch 获取数据）` -> `useLoaderData（获取数据）` -> `RenderComponent（渲染组件）`。

```typescript
// router/index.tsx
import { createBrowserRouter } from "react-router";
const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    loader: async () => {
      const data = await response.json();
      const response = await getUser(data); // 获取数据
      return {
        data: response.list,
        message: "success",
      }
    },
  },
]);
// App.tsx
import { useLoaderData } from "react-router";
const App = () => {
  const { data, message } = useLoaderData(); // 获取数据
  return <div>{data}</div>;
}
```

## action

一般用于表单提交，删除，修改等操作。

useSubmit 速查文档；useActionData 速查文档。

> 只有 POST / DELETE / PATCH / PUT 等请求才会触发 action，所以适合用来提交表单。

```tsx
// router/index.tsx
import { createBrowserRouter } from "react-router";
const router = createBrowserRouter([
    {
        // path: '/index',
        Component: Layout,
        children: [
            {
                path: 'about',
                Component: About,
                action: async ({ request }) => {
                    const formData = await request.formData();
                    await createUser(formData); // 创建用户
                    return {
                        data: table,
                        success: true
                    }
                }
            },
        ],
    },
]);
// App.tsx
import { useSubmit } from 'react-router';
import { Card, Form, Input, Button } from 'antd';
export default function About() {
  const submit = useSubmit();
  return <Card>
    <Form onFinish={(values) => {
      submit(values, { method: 'post'}) // 提交表单
    }}>
      <Form.Item name='name' label='姓名'>
        <Input />
      </Form.Item>
      <Form.Item name='age' label='年龄'>
        <Input />
      </Form.Item>
      <Button type='primary' htmlType='submit'>提交</Button>
    </Form>
  </Card>;
}
```

## 状态变更

可以配合 `useNavigation` 来管理表单提交的状态。

useNavigation 速查文档。

1. GET 提交会经过以下状态：

```text
idle -> loading -> idle
```

2. POST 提交会经过以下状态：

```text
idle -> submitting -> loading -> idle
```

所以可以根据这些状态来控制 `disabled`、`loading` 等行为。

```tsx
import { useNavigation, useSubmit } from "react-router";
const submit = useSubmit();
const navigation = useNavigation();

return (
    <div>
         {navigation.state === 'loading' && <div>loading...</div>}
        <button disabled={navigation.state === 'submitting'}>提交</button>
    </div>
)
```
