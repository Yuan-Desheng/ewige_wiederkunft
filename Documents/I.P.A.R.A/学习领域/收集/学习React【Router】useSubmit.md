---
createTime: 2026-07-16 17:39
笔记ID: 20260716173913
multiFile:
multiMedia:
description: 小满 React 教程「学习React【Router】useSubmit」笔记。素材来源 message163.github.io/react-docs。
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

## 学习React【Router】useSubmit

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react/router/hooks/useSubmit.html)
> 作者：小满 message163（sister man）

---

`useSubmit` 是一个 React-router 的钩子函数，用于提交表单。

## 使用

> TIP
>
> 默认情况下，`useSubmit` 会提交 formData 数据，如果需要提交其他数据，可以通过 `submit` 的第二个参数传递。

### 1. 提交 formData 数据

```tsx
import { useSubmit } from "react-router";
const formData = new FormData();
formData.append("email", "test@test.com");
formData.append("password", "123456");
const submit = useSubmit();
submit(formData);
```

### 2. 提交 json 数据

```tsx
import { useSubmit } from "react-router";
const submit = useSubmit();
submit(JSON.stringify({ email: "test@test.com", password: "123456" }), {
  method: "POST",
  encType: "application/json",
});
```

### 3. 提交 text 数据

```tsx
import { useSubmit } from "react-router";
const submit = useSubmit();
submit("test", { method: "POST", encType: "text/plain" });
```

### 4. 提交 urlencoded 数据

```tsx
import { useSubmit } from "react-router";
const submit = useSubmit();
submit({ email: "test@test.com", password: "123456" }, { method: "POST", encType: "application/x-www-form-urlencoded" });
```

### 5. 提交 queryString 数据

```tsx
import { useSubmit } from "react-router";
const submit = useSubmit();
submit([["email", "test@test.com"], ["password", "123456"]], { method: "POST"});
```
