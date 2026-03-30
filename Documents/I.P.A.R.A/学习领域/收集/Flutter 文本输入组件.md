---
createTime: 2026-02-25 17:48
笔记ID: 20260225174832
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中实现文本输入功能的核心组件 TextField，涵盖控制器管理、装饰定制（InputDecoration）及密码隐藏等实战技巧。
笔记类型:
阐述日期:
tags:
  - Flutter
  - Widget
  - TextField
  - Form
aliases:
  - 文本输入组件
  - TextField
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 文本输入组件

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="50" max="100" style="width: 100%;"></progress>

## 1. 文本输入核心：TextField

### 1.1 作用
`TextField` 是 Flutter 中用于实现用户文本输入功能的核心组件。

### 1.2 核心属性详解

| 属性 | 作用说明 |
| :--- | :--- |
| **controller** | **文本编辑器控制器**。用于获取、设置内容及监听变化。 |
| **decoration** | **输入装饰器**（`InputDecoration`）。定制外观，如标签、提示文字、图标、边框等。 |
| **style** | 定义输入文本的样式（颜色、大小等）。 |
| **maxLines** | 最大行数（默认 1）。 |
| **obscureText** | 设置为 `true` 可**隐藏输入内容**，用于密码输入。 |
| **onChanged** | 输入内容发生变化时执行的回调函数。 |
| **onSubmitted** | 用户提交输入（点击回车/完成）时的回调函数。 |

![[Pasted image 20260225182322.png]]

---

## 2. 使用要点与技巧

- **状态管理**：使用 `TextField` 必须配合 `StatefulWidget`。
- **内容管理**：使用 `TextEditingController` 来获取或修改输入框的内容。
- **UI 定制**：通过 `decoration` 属性下的 `InputDecoration` 来定制边框、背景颜色和提示文字（hintText）。
- **监听变化**：可以通过 `onChanged` 直接监听，也可以给 `controller` 添加监听器。

---

## 3. 代码示例：登录页面实战

```dart
import 'package:flutter/material.dart';

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  // 定义控制器
  final TextEditingController _phoneController = TextEditingController(); // 账号控制器
  final TextEditingController _codeController = TextEditingController();  // 密码控制器

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("登录"),
      ),
      body: Container(
        padding: const EdgeInsets.all(20),
        color: Colors.white,
        child: Column(
          children: [
            // 账号输入框
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.only(left: 20), // 内容内边距
                hintText: "请输入账号",
                fillColor: const Color.fromARGB(255, 222, 219, 207),
                filled: true,
                border: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(25)
                )
              ),
            ),
            const SizedBox(height: 20),
            // 密码输入框
            TextField(
              controller: _codeController,
              obscureText: true, // 隐藏输入内容，用于密码框
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.only(left: 20),
                hintText: "请输入密码",
                fillColor: const Color.fromARGB(255, 222, 219, 207),
                filled: true,
                border: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(25)
                )
              ),
            ),
            const SizedBox(height: 20),
            // 登录按钮示例
            Container(
              height: 50,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(25)
              ),
              child: TextButton(
                onPressed: () {
                  print("登录信息: 账号 - ${_phoneController.text}, 密码 - ${_codeController.text}");
                },
                child: const Text("登录", style: TextStyle(color: Colors.white)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
```
