---
createTime: 2026-02-25 14:40
笔记ID: 20260225144007
multiFile:
multiMedia:
description: 深入讲解 Flutter 中的线性布局组件 Column 和 Row，涵盖主轴与交叉轴对齐、尺寸策略及实际应用场景。
笔记类型:
阐述日期:
tags:
  - Flutter
  - Layout
  - Column
  - Row
aliases:
  - 线性布局
  - 垂直布局
  - 水平布局
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 布局组件 - 线性布局

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="65" max="100" style="width: 100%;"></progress>

## 1. 线性布局核心概念

线性布局是 Flutter 中最基础也是最常用的布局方式，分为**垂直排列（Column）**和**水平排列（Row）**。它们都继承自 `Flex` 组件，拥有相似的对齐逻辑。

### 核心属性对照表

| 属性 | 类型 | 作用说明 |
| :--- | :--- | :--- |
| **children** | `List<Widget>` | 需要被排列的子组件列表。 |
| **mainAxisAlignment** | `MainAxisAlignment` | **主轴**对齐方式（Column 为垂直，Row 为水平）。 |
| **crossAxisAlignment** | `CrossAxisAlignment` | **交叉轴**对齐方式（Column 为水平，Row 为垂直）。 |
| **mainAxisSize** | `MainAxisSize` | 尺寸策略：`max`（占满空间）或 `min`（包裹内容）。 |

---

## 2. 垂直布局：Column

### 2.1 作用
用于将子组件在**垂直方向**上依次排列。

### 2.2 对齐方式详解
- **主轴 (MainAxis)**：垂直方向。控制子组件如何分布（如：居中、靠顶、均分等）。
  ![[Pasted image 20260225144419.png]]
- **交叉轴 (CrossAxis)**：水平方向。控制子组件的水平对齐（如：靠左、居中、拉伸）。
  ![[Pasted image 20260225144504.png]]

### 2.3 应用场景
- **表单/设置页**：输入框、按钮、选项的垂直堆叠。
- **卡片内容**：新闻卡片中的标题、描述、时间的从上到下展示。
- **详情页**：图文混排的流式内容。

---

## 3. 水平布局：Row

### 3.1 作用
用于将子组件在**水平方向**上依次排列。

### 3.2 对齐方式详解
- **主轴 (MainAxis)**：水平方向。控制子组件在左右方向的分布。
  ![[Pasted image 20260225144656.png]]
- **交叉轴 (CrossAxis)**：垂直方向。控制子组件在高度方向的对齐。
  ![[Pasted image 20260225144742.png]]

### 3.3 应用场景
- **导航栏/工具栏**：按钮组、标签栏。
- **列表项 (ListTile)**：左侧图标与右侧文本的并排显示。
- **表单行**：标签名称与输入框的组合。

---

## 4. 线性布局代码示例

### 4.1 Column 演示 (垂直排列)
```dart
Column(
  // 主轴对齐：居中
  mainAxisAlignment: MainAxisAlignment.center, 
  // 交叉轴对齐：右对齐
  crossAxisAlignment: CrossAxisAlignment.end, 
  children: [
    Container(width: 100, height: 100, color: Colors.blue),
    Container(
      margin: const EdgeInsets.only(top: 10),
      width: 100, height: 100, color: Colors.blue,
    ),
    Container(
      margin: const EdgeInsets.only(top: 10),
      width: 100, height: 100, color: Colors.blue,
    )
  ],
)
```

### 4.2 Row 演示 (水平排列)
```dart
Row(
  // 主轴对齐：居中分布
  mainAxisAlignment: MainAxisAlignment.center, 
  // 交叉轴对齐：居中对齐
  crossAxisAlignment: CrossAxisAlignment.center, 
  children: [
    Container(width: 100, height: 100, color: Colors.blue),
    Container(
      margin: const EdgeInsets.only(left: 10), // 水平间距用 left
      width: 100, height: 100, color: Colors.blue,
    ),
    Container(
      margin: const EdgeInsets.only(left: 10),
      width: 100, height: 100, color: Colors.blue,
    )
  ],
)
```

---

## 5. 注意事项与总结

- **溢出处理**：`Row` 和 `Column` 本身**不支持滚动**。如果子组件总和超出屏幕，会报“溢出（Overflow）”错误。此时需改用 `ListView` 或用 `SingleChildScrollView` 包裹。
- **尺寸约束**：`mainAxisSize: MainAxisSize.max` 是默认值。在嵌套布局中（如 Column 嵌套 Column），有时需要设为 `min` 以避免布局冲突。
- **避免过度嵌套**：过深的线性布局嵌套会增加 UI 渲染开销，必要时可考虑 `Stack` 或自定义布局。
