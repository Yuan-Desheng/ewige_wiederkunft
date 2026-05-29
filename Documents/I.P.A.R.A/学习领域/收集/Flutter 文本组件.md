---
createTime: 2026-02-25 16:38
笔记ID: 20260225163848
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中最基础的文本显示组件 Text，以及支持多种样式的 Text.rich 和 TextSpan 的用法。
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - Widget
  - Text
  - TextStyle
aliases:
  - 文本组件
  - Text
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 文本组件

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="50" max="100" style="width: 100%;"></progress>

## 1. 基础文本组件：Text

### 1.1 作用
`Text` 是在用户界面中显示单一样式文本的基础组件。

### 1.2 核心属性详解

| 属性            | 类型             | 作用说明                                           |
| :------------ | :------------- | :--------------------------------------------- |
| **data**      | `String`       | **必需**。要显示的文本内容。                               |
| **style**     | `TextStyle`    | 文本样式，可设置颜色、大小、粗细、字体等。                          |
| **textAlign** | `TextAlign`    | 文本在容器内的水平对齐方式（如 `.left`, `.center`, `.right`）。 |
| **maxLines**  | `int`          | 文本显示的最大行数。                                     |
| **overflow**  | `TextOverflow` | 文本溢出时的处理方式（如 `.ellipsis` 省略号）。                 |

![[Pasted image 20260225163938.png]]

---

## 2. 富文本组件：Text.rich & TextSpan

### 2.1 作用
如果需要在同一段文本中显示**不同的样式**（例如：一部分加粗，一部分变红），可以使用 `Text.rich` 构造函数配合 `TextSpan` 来实现。

- **TextSpan**：代表文本的一个片段，可以嵌套其他 `TextSpan` 形成树状结构。
- **层级继承**：子 Span 会继承父 Span 的样式，但也可以定义自己的样式进行覆盖。

![[Pasted image 20260225164220.png]]

---

## 3. 使用场景与注意事项

### 应用场景
- **基础展示**：所有的文本显示需求（标题、正文、按钮文字）。
- **复合展示**：通过 `Text.rich` 实现协议勾选页（“我已阅读并同意《用户协议》”）。

### 注意事项
- **优先级**：`Text` 组件本身和其 `TextStyle` 中都可能有 `overflow` 等属性，`Text` 组件上的属性优先级通常更高。
- **溢出处理**：如果文本内容由后端返回且长度不确定，**请务必设置 `maxLines` 和 `overflow`** 以防止布局 UI 崩溃。
- **性能优化**：大量重复使用的文本样式建议定义为常量（Constant），有助于保持一致性并提升性能。

---

## 4. 代码示例

### 4.1 富文本示例 (Text.rich)
```dart
Text.rich(
  TextSpan(
    text: "Hello ", 
    style: TextStyle(color: Colors.red, fontSize: 40, fontWeight: FontWeight.bold),
    children: [
      TextSpan(text: "Flutter", style: TextStyle(color: Colors.green)),
      TextSpan(text: "!"),
    ],
  ),
)
```

### 4.2 基础样式与溢出处理示例
```dart
// 1. 基础样式设置
/*
Text(
  "Hello Flutter!",
  style: TextStyle(
      fontSize: 50,
      color: Colors.blue,
      fontStyle: FontStyle.italic,
      fontWeight: FontWeight.w900,
      decoration: TextDecoration.underline,
      decorationColor: Colors.red),
)
*/

// 2. 溢出处理
/*
Text(
  "今天天气非常不错，" * 10, 
  style: TextStyle(color: Colors.blue, fontSize: 30),
  maxLines: 3,
  overflow: TextOverflow.ellipsis, 
)
*/
```

---

## 5. 完整代码演示

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: MainPage()));

class MainPage extends StatelessWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Text代码实例")),
      body: Container(
        alignment: Alignment.center,
        width: double.infinity,
        height: double.infinity,
        color: Colors.amber,
        child: const Text.rich(
          TextSpan(
            text: "Hello ",
            children: [
              TextSpan(text: "Flutter", style: TextStyle(color: Colors.green)),
              TextSpan(text: "!")
            ],
            style: TextStyle(
              color: Colors.red,
              fontSize: 40,
              fontWeight: FontWeight.bold
            )
          )
        ),
      ),
    );
  }
}
```
