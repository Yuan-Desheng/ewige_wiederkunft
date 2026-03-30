---
createTime: 2026-02-22 23:03
笔记ID: 20260222230327
multiFile:
multiMedia:
description: Flutter中的组件根据其状态是否可变，分为无状态组件（StatelessWidget）和有状态组件（StatefulWidget）。
笔记类型:
阐述日期:
tags:
  - Flutter
  - Widget
  - StatelessWidget
  - StatefulWidget
aliases:
  - Flutter自定义组件
  - 无状态组件
  - 有状态组件
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter自定义组件

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="40" max="100" style="width: 100%;"></progress>

## 1. 自定义组件：Stateless vs. Stateful

在Flutter中，根据组件内部状态（State）是否可以在其生命周期内发生变化，自定义组件被分为两大类。

| 特性 | StatelessWidget (无状态) | StatefulWidget (有状态) |
| :--- | :--- | :--- |
| **核心特征** | 一旦创建，内部状态不可变 | 持有可在其生命周期内改变的状态 |
| **使用场景** | 静态内容展示，外观仅由配置参数决定 | 交互式组件，如计数器、表单输入框 |
| **生命周期** | 相对简单，主要是构建 (`build`) | 更为复杂，包含状态创建、更新和销毁 |
| **代码结构** | 单个类 | 两个关联的类：Widget 类和 State 类 |

---

## 2. 无状态组件：StatelessWidget

`StatelessWidget` 用于构建那些创建后外观就不会再改变的组件。其渲染的视图完全由外部传入的配置参数决定。

### 核心要点
- **继承 `StatelessWidget`**: 创建一个新类，继承自 `StatelessWidget`。
- **实现 `build` 方法**: 这是唯一必须实现的方法，负责描述 UI 结构，必须返回一个 `Widget`。
- **触发时机**: 当组件被创建或父组件状态变化导致其需要重新构建时，`build` 方法会被调用。

---

## 3. 有状态组件：StatefulWidget

`StatefulWidget` 用于构建需要与用户交互或 UI 会随时间、数据变化而改变的动态组件。

### 实现步骤
1. **创建 Widget 类**: 继承 `StatefulWidget`。该类本身不可变，主要职责是创建 `State` 对象。
2. **创建 State 类**: 继承 `State<YourWidgetName>`。该类负责持有可变数据、处理业务逻辑并实现 `build` 方法渲染视图。

### 核心机制
- **`createState()`**: `StatefulWidget` 必须实现的方法，返回关联的 `State` 实例。
- **`setState()`**: 在 `State` 类中调用。通知框架状态已改变，触发 `build` 方法重新执行以反映新 UI。

---

## 4. 组件生命周期 (Widget Lifecycle)

### 4.1 无状态组件生命周期
无状态组件生命周期非常简单：
- **`build`**: 唯一阶段。在组件创建或配置变更时调用。

### 4.2 有状态组件生命周期
有状态组件的生命周期伴随其对应的 `State` 对象。
![[Pasted image 20260224184605.png]]

| 阶段        | 函数名                     | 调用时机与核心任务                                   | 执行频率 |
| :-------- | :---------------------- | :------------------------------------------ | :--- |
| **创建阶段**  | createState()           | Widget 初始化时调用，创建 State 对象。                  | 1次   |
|           | initState()             | State 对象插入树后立即执行，常用于初始化变量。                  | 1次   |
|           | didChangeDependencies() | initState 后立即执行；或依赖的 InheritedWidget 更新时调用。 | 可能多次 |
| **构建/更新** | build()                 | 构建 UI 方法，初始化或 `setState` 后执行。               | 多次   |
|           | didUpdateWidget()       | 父组件传入新配置（如属性变更）时调用。                         | 多次   |
| **销毁阶段**  | deactivate()            | 当 State 对象从树中暂时移除时调用（如路由切换）。                | 多次   |
|           | dispose()               | 当 State 对象被永久移除时调用，用于释放资源（如控制器）。            | 1次   |

### 4.3 生命周期代码演示

```dart
import 'package:flutter/material.dart';

class LifecycleDemo extends StatefulWidget {
  const LifecycleDemo({super.key});

  @override
  _LifecycleDemoState createState() {
    print("1. createState 执行");
    return _LifecycleDemoState();
  }
}

class _LifecycleDemoState extends State<LifecycleDemo> {
  @override
  void initState() {
    super.initState();
    print("2. initState 执行");
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print("3. didChangeDependencies 执行");
  }

  @override
  void didUpdateWidget(covariant LifecycleDemo oldWidget) {
    super.didUpdateWidget(oldWidget);
    print("更新. didUpdateWidget 执行");
  }

  @override
  Widget build(BuildContext context) {
    print("4. build 执行 (渲染视图)");
    return const Center(child: Text("查看控制台日志"));
  }

  @override
  void deactivate() {
    print("销毁前. deactivate 执行");
    super.deactivate();
  }

  @override
  void dispose() {
    print("销毁. dispose 执行");
    super.dispose();
  }
}
```

---

## 总结

- **无状态 (Stateless)**: 核心只有 `build`。
- **有状态 (Stateful)**: 
    - **创建**: `createState` -> `initState` -> `didChangeDependencies` -> `build`
    - **更新**: `didUpdateWidget` -> `build`
    - **销毁**: `deactivate` -> `dispose`
- **单次执行函数**: `createState`、`initState`、`dispose`。
- **数据共享**: `InheritedWidget` 专门用于在 Widget 树中自顶向下高效地共享数据。
