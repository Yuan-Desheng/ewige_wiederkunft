---
createTime: 2026-02-26 10:32
笔记ID: 20260226103257
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中组件间通信的多种方式，包括父传子（构造函数）、子传父（回调函数）的步骤、注意事项及实战案例。
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - Widget
  - Communication
aliases:
  - 组件通信
  - 父子通信
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 组件通信

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="50" max="100" style="width: 100%;"></progress>

## 1. 组件通信方式概览

| 通信方式 | 方向 | 适用场景 |
| :--- | :--- | :--- |
| **构造函数传递** | 父 => 子 | 简单的数据传递 |
| **回调函数** | 子 => 父 | 子组件通知父组件 |
| **InheritedWidget** | 祖先 => 后代 | 跨层级数据共享 |
| **Provider** | 任意组件间 | 状态管理推荐方案 |
| **EventBus** | 任意组件间 | 全局事件通信 |
| **Bloc / Riverpod** | 任意组件间 | 复杂状态管理方案 |

---

## 2. 组件通信 - 父传子 (构造函数传参)

### 2.1 核心步骤
1.  **子组件定义接收属性**。
2.  **子组件在构造函数中接收参数**。
3.  **父组件传递属性给子组件**。
4.  **获取属性方式**：有状态组件在“对外的类”接收属性，“对内的类”通过 `widget` 对象获取对应属性。

### 2.2 注意事项 ⚠
- **final 关键字**：子组件定义接收属性需要使用 `final` 关键字。因为属性由父组件决定，子组件不能随意更改。
- **required 标记**：子组件属性如果没有初始值，需要在构造函数中用 `required` 来接收属性。

### 2.3 需求案例
定义父子组件，父组件传递一个 `message` 变量给子组件并显示。
![[Pasted image 20260226104240.png]]
![[Pasted image 20260226105917.png]]

### 2.4 代码示例 (父传子列表展示)
```dart
import 'package:flutter/material.dart';

void main() => runApp(MainPage());

// 父组件
class MainPage extends StatefulWidget {
  MainPage({Key? key}) : super(key: key);
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  List<String> _list = ["鱼香肉丝", "宫保鸡丁", "麻婆豆腐", "京酱肉丝", "溜肉片"];
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: GridView.count(
          padding: EdgeInsets.all(10),
          crossAxisCount: 2,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          children: List.generate(_list.length, (int index) {
            return Child(foodName: _list[index]); // 传递属性
          }),
        ),
      ),
    );
  }
}

// 子组件
class Child extends StatefulWidget {
  final String foodName;
  Child({Key? key, required this.foodName}) : super(key: key);

  @override
  _ChildState createState() => _ChildState();
}

class _ChildState extends State<Child> {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blue,
      alignment: Alignment.center,
      child: Text(
        widget.foodName,
        style: TextStyle(color: Colors.white, fontSize: 20),
      ),
    );
  }
}
```

---

## 3. 组件通信 - 子传父 (通过回调函数)

### 3.1 核心步骤
1.  **父组件传递一个函数给子组件**。
2.  **子组件调用该函数**。
3.  **父组件通过回调函数获取参数并执行逻辑**（如 `setState`）。

### 3.2 需求案例
点击子组件删除按钮，通知父组件删除该菜品数据并更新列表。
![[Pasted image 20260226105948.png]]

### 3.3 代码示例 (子传父通知删除)
```dart
import 'package:flutter/material.dart';

void main() => runApp(MainPage());

// 父组件
class MainPage extends StatefulWidget {
  MainPage({Key? key}) : super(key: key);
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  List<String> _list = ["鱼香肉丝", "宫保鸡丁", "麻婆豆腐", "京酱肉丝", "溜肉片"];
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: GridView.count(
          padding: EdgeInsets.all(10),
          crossAxisCount: 2,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          children: List.generate(_list.length, (int index) {
            return Child(
              foodName: _list[index],
              index: index,
              // 1. 父组件传递回调函数
              delFood: (int i) {
                _list.removeAt(i);
                setState(() {});
              },
            );
          }),
        ),
      ),
    );
  }
}

// 子组件
class Child extends StatefulWidget {
  final String foodName;
  final int index; 
  final Function(int index) delFood; // 声明函数属性

  Child({Key? key, required this.foodName, required this.index, required this.delFood}) : super(key: key);

  @override
  _ChildState createState() => _ChildState();
}

class _ChildState extends State<Child> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topRight,
      children: [
        Container(
          color: Colors.blue,
          alignment: Alignment.center,
          child: Text(widget.foodName, style: TextStyle(color: Colors.white, fontSize: 20)),
        ),
        IconButton(
            color: Colors.red,
            onPressed: () {
              // 2. 子组件触发调用
              widget.delFood(widget.index);
            },
            icon: Icon(Icons.delete))
      ],
    );
  }
}
```

---

## 4. 附录：其他代码尝试 (备考归档)

*(保留笔记中原本注释掉的代码段，方便回顾思路)*

```dart
/* 
// 无状态组件子组件接收示例
class Child extends StatelessWidget {
  final String? message; 
  const Child({Key? key, this.message}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text("子组件-$message", style: TextStyle(color: Colors.red, fontSize: 18)),
    );
  }
}
*/
```
