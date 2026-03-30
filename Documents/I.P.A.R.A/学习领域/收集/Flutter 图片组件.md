---
createTime: 2026-02-25 17:02
笔记ID: 20260225170208
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中图片显示组件 Image 的四种加载方式（Asset, Network, File, Memory）以及核心适配属性。
笔记类型:
阐述日期:
tags:
  - Flutter
  - Widget
  - Image
aliases:
  - 图片组件
  - Image
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 图片组件

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="50" max="100" style="width: 100%;"></progress>

## 1. 图片加载分类

Flutter 的 `Image` 组件提供了多种命名构造函数，用于从不同的来源加载图片。

| 分类 | 构造函数 | 作用说明 |
| :--- | :--- | :--- |
| **项目资源** | `Image.asset()` | 加载项目资源目录（assets）中的图片（需在 `pubspec.yaml` 中声明）。 |
| **网络图片** | `Image.network()` | 直接通过网络地址（URL）加载图片。 |
| **本地文件** | `Image.file()` | 加载设备本地存储中的图片文件。 |
| **内存数据** | `Image.memory()` | 加载内存中的图片字节数据（Uint8List）。 |

---

## 2. 常用属性详解

| 属性 | 类型 | 作用说明 |
| :--- | :--- | :--- |
| **width / height** | `double` | 设置图片显示区域的宽度和高度。 |
| **fit** | `BoxFit` | **核心属性**。控制图片如何适应其显示区域（如拉伸、裁剪或保持原比例）。 |
| **alignment** | `AlignmentGeometry` | 图片在其显示区域内的对齐方式，如 `Alignment.center`。 |
| **repeat** | `ImageRepeat` | 当图片小于显示区域时，设置是否以及如何重复平铺图片。 |

![[Pasted image 20260225170344.png]]

---

## 3. 注意事项

> [!warning] 网络权限配置
> 在 Android、HarmonyOS 或 iOS 上使用 `Image.network()` 加载网络图片时，**需要配置网络权限**。具体配置方法将在后续环境讲解中详细介绍。

![[Pasted image 20260225170519.png]]

---

## 4. 代码示例

### 4.1 基础网络图片加载
```dart
Image.network(
  'https://example.com/image.png',
  width: 300,
  height: 200,
  fit: BoxFit.cover, // 裁剪并铺满
)
```

### 4.2 完整演示代码
```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: MainPage()));

class MainPage extends StatelessWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Image代码实例"),
      ),
      body: Container(
        alignment: Alignment.center,
        width: double.infinity,
        height: double.infinity,
        color: Colors.amber,
        child: Image.network(
          "https://docs.flutter.dev/assets/images/dash/dash-fainting.gif",
          width: 300,
          height: 300,
          fit: BoxFit.contain, // 缩放以完整显示
        ),
      ),
    );
  }
}
```
