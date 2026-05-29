---
createTime: 2026-02-25 14:55
笔记ID: 20260225145508
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中的弹性布局体系，重点分析了 Flex 组件及其核心子组件 Expanded 和 Flexible 的空间分配逻辑与差异。
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - Layout
  - Flex
  - Expanded
  - Flexible
aliases:
  - 弹性布局
  - 比例布局
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 布局组件 - 弹性布局

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="60" max="100" style="width: 100%;"></progress>

## 1. 弹性布局核心：Flex

### 1.1 定义与作用
`Flex` 组件允许沿一个主轴（水平或垂直）排列其子组件，并能极其灵活地控制子组件在主轴上的**尺寸比例**和**空间分配**。

> [!tip] 提示
> `Column` 和 `Row` 实际上都是 `Flex` 的封装。`Flex` 是它们的结合体，通过 `direction` 属性来切换排列方向。

### 1.2 核心属性对照表

| 属性                     | 类型                            | 作用说明                                                |
| :--------------------- | :---------------------------- | :-------------------------------------------------- |
| **direction**          | Axis.horizontal/Axis.vertical | **主轴方向**。Axis.horizontal (水平) 或 Axis.vertical (垂直)。 |
| **mainAxisAlignment**  | MainAxisAlignment             | 子组件在**主轴方向**上的对齐方式。                                 |
| **crossAxisAlignment** | CrossAxisAlignment            | 子组件在**交叉轴方向**上的对齐方式。                                |
| **mainAxisSize**       | MainAxisSize                  | Flex 容器自身在主轴上的尺寸策略（max 或 min）。                      |

---

## 2. 空间分配组件：Expanded & Flexible

`Flex`、`Row` 或 `Column` 的子组件常被包裹在 `Expanded` 或 `Flexible` 中，用于通过 `flex` 属性（比例系数）来瓜分剩余空间。

### 2.1 比例分配
通过设置 `flex` 属性的值，子组件将按照各自 flex 值的比例分配剩余空间。
![[Pasted image 20260225145712.png]]

### 2.2 Expanded 与 Flexible 的核心区别

| 组件 | 是否强制填满 | 行为特点 |
| :--- | :--- | :--- |
| **Expanded** | **是** | 强制子组件填满分配到的所有剩余空间。 |
| **Flexible** | **否** | 允许子组件根据自身大小调整，不强制占满全部分配空间。 |

---

## 3. 弹性布局代码示例

### 3.1 基础比例分配 (Vertical Flex)
```dart
Flex(
  direction: Axis.vertical, 
  children: [
    Expanded(
      flex: 2, // 分配 2/3 的剩余空间
      child: Container(color: Colors.red),
    ),
    Expanded(
      flex: 1, // 分配 1/3 的剩余空间
      child: Container(color: Colors.green),
    )
  ],
)
```

### 3.2 经典布局案例：固定两端，中间弹性
**场景**：顶部和底部高度固定，中间区域自动充满剩余空间（常用于复杂的 App 页面结构）。
![[Pasted image 20260225145757.png]]

```dart
Flex(
  direction: Axis.vertical,
  children: [
    // 顶部固定高度
    Container(color: Colors.blue, height: 100),
    
    // 中间自动填满剩余空间
    Expanded(
      child: Container(color: Colors.blueGrey, child: const Center(child: Text("中间内容区"))),
    ),
    
    // 底部固定高度
    Container(color: Colors.red, height: 100),
  ],
)
```

---

## 4. 注意事项与总结

- **约束依赖**：Flex 布局受其父组件传递的约束影响。确保父组件提供了适当的布局约束。
- **比例计算**：`flex: 0`（默认值）意味着该组件不参与弹性分配，仅根据自身内容大小占据空间。
- **性能建议**：虽然 `Flex` 很强大，但如果只是简单的水平或垂直排列，优先使用语义更明确的 `Row` 或 `Column`。
