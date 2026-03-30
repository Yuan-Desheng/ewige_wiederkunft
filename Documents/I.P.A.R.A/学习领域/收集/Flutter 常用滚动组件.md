---
createTime: 2026-02-25 18:29
笔记ID: 20260225182919
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中常用的滚动组件，包括 SingleChildScrollView、ListView、GridView、CustomScrollView 以及 PageView。
笔记类型:
阐述日期:
tags:
  - Flutter
  - Widget
  - Scroll
  - ListView
  - GridView
  - PageView
aliases:
  - 滚动组件
  - ListView
  - PageView
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 常用滚动组件

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="90" max="100" style="width: 100%;"></progress>

## 1. 常用滚动组件概览

| 组件 | 特点 | 使用场景 |
| :--- | :--- | :--- |
| **SingleChildScrollView** | 让单个子组件可以用滚动，所有内容一次性渲染 | 长表单、设置页、内容不固定但是总量不多的页面 |
| **ListView** | 线性列表，通过 builder 可以实现懒加载，性能优异 | 聊天记录、新闻、常见的单列滚动的数据列表 |
| **GridView** | 网格布局列表，支持懒加载，可以固定列数 | 图片墙、商品网格、应用图标列表 |
| **CustomScrollView** | 复杂布局方案，通过组合多个 Sliver 组件实现滚动 | 电商首页、社交 App 个人主页多个滚动紧密联动 |
| **PageView** | 整页滚动效果，支持横向和纵向 | 应用引导页、图片轮播图、书籍翻页 |

---

## 2. SingleChildScrollView

### 2.1 核心用法与特点
- **用法**：包裹一个子组件，让单个子组件具备滚动能力。
![[Pasted image 20260225183020.png]]
- **子组件**：只能包含一个子组件，如果滚动多个组件，通常将其 nesting 在 `Column` 或 `Row` 组件中。
- **滚动方向**：通过 `scrollDirection` 属性控制，默认为垂直方向 (`Axis.vertical`)，也可设置为水平方向 (`Axis.horizontal`)。
- **特点**：一次性构建所有子组件，如果 nesting 的 `Column` 或 `Row` 中包含大量子项，可能会导致性能问题，建议使用 `ListView`。

### 2.2 控制滚动 (ScrollController)
- **控制方式**：绑定一个 `ScrollController` 对象给 `controller` 属性，使用 `animateTo/jumpTo` 方法控制滚动。
- **滚动到顶部**：`_controller.jumpTo(0)`
- **滚动到底部**：`_controller.jumpTo(_controller.position.maxScrollExtent)`

### 2.3 示例代码 (SingleChildScrollView + 堆叠控制)
```dart
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
class MainPage extends StatefulWidget {  
  MainPage({Key? key}) : super(key: key);  
  
  @override  
  _MainPageState createState() => _MainPageState();  
}  
  
class _MainPageState extends State<MainPage> {  
  ScrollController _controller = ScrollController(); //滚动条控制器  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
        home: Scaffold(  
            appBar: AppBar(title: Text("登录")),  
            body: Stack(  
              children: [  
                SingleChildScrollView(  
                  controller: _controller,  
                  padding: EdgeInsets.all(20),  
                  child: Column(  
                    children: List.generate(100, (index) {  
                      return Container(  
                        margin: EdgeInsets.only(top: 10),  
                        width: double.infinity,  
                        color: Colors.blue,  
                        height: 100,  
                        child: Text("我是第${index + 1}个", style: TextStyle(color: Colors.white, fontSize: 30)),  
                        alignment: Alignment.center,  
                      );  
                    }),  
                  ),  
                ),  
                Positioned(  
                  right: 10, top: 10,  
                  child: GestureDetector(  
                      onTap: () {  
                        _controller.animateTo(_controller.position.maxScrollExtent, duration: Duration(seconds: 1), curve: Curves.easeIn);  
                      },  
                      child: Container(  
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(40)),  
                        width: 80, height: 80, alignment: Alignment.center,  
                        child: Text("去底部", style: TextStyle(color: Colors.white)),  
                      )),  
                ),  
                Positioned(  
                  right: 10, bottom: 10,  
                  child: GestureDetector(  
                      onTap: () {  
                        _controller.animateTo(0, duration: Duration(seconds: 1), curve: Curves.bounceIn);  
                      },  
                      child: Container(  
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(40)),  
                        width: 80, height: 80, alignment: Alignment.center,  
                        child: Text("去顶部", style: TextStyle(color: Colors.white)),  
                      )),  
                )  
              ],  
            )));  
  }  
}
```

---

## 3. ListView

### 3.1 核心作用与机制
- **作用**：用于构建可滚动列表的核心部件，并提供流畅滚动体验。
- **构造方式**：提供多种构造函数，如默认构造函数、`ListView.builder`、`ListView.separated`。
- **机制**：采用**按需渲染**（懒加载），只构建当前可见区域的列表项，极大提升长列表性能。
![[Pasted image 20260225183342.png]]
- **特点**：默认构造函数适用于静态数量有限数据，一次性构建所有表项。

### 3.2 ListView-builder 模式
- **作用**：处理**长列表或动态数据**的首选和推荐方式。
- **方式**：接受一个 `itemBuilder` 回调函数来按需构建列表项，通过 `itemCount` 控制列表长度。
![[Pasted image 20260225183432.png]]
- **优势**：按需构建，不会在初始化时将所有列表项都创建，而是根据用户的滚动行为，动态地创建和销毁列表项。

### 3.3 ListView-separated 模式
- **作用**：在 `ListView.builder` 的基础上，额外提供了构建**分割线**的能力。
- **方式**：需要同时提供 `itemBuilder`、`separatorBuilder`、`itemCount` 三个属性。
![[Pasted image 20260225183719.png]]

### 3.4 示例代码 (ListView 演示)
```dart
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
class MainPage extends StatefulWidget {  
  MainPage({Key? key}) : super(key: key);  
  @override  
  _MainPageState createState() => _MainPageState();  
}  
  
class _MainPageState extends State<MainPage> {  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
        home: Scaffold(  
      appBar: AppBar(title: Text("ListView示例")),  
      body: ListView.separated(  
          itemBuilder: (BuildContext context, int index) {  
            return Container(  
              color: Colors.blue,  
              width: double.infinity,  
              height: 80,  
              child: Text('第${index + 1}个', style: TextStyle(color: Colors.white, fontSize: 30)),  
              alignment: Alignment.center,  
            );  
          },  
          separatorBuilder: (BuildContext context, int index) {  
            return Container(height: 10, width: double.infinity, color: Colors.amber);  
          },  
          itemCount: 100),  
    ));  
  }  
}
```

---

## 4. GridView

### 4.1 核心作用与方式
- **作用**：用于创建二维可滚动网格布局的核心组件。
- **构建方式**：
    - **GridView.count**：基于固定列数的网格布局（最常用之一）。
    - **GridView.extent**：基于固定子项最大宽度/高度的网格布局（最常用之二）。
    - **GridView.builder**：用于网格项数量巨大或动态生成的情况。

### 4.2 布局委托 (gridDelegate)
- **SliverGridDelegateWithFixedCrossAxisCount**：固定列数。
- **SliverGridDelegateWithMaxCrossAxisExtent**：最大宽度。

### 4.3 构造详解
- **GridView.count**：指定网格多少列，Flutter 自动计算列的宽度，在空间内均匀排列。
![[Pasted image 20260225184258.png]]
- **GridView.extent**：通过 `maxCrossAxisExtent` 设置子项最大宽度/高度来计算横向或者纵向有多少列。
![[Pasted image 20260225184443.png]]
- **GridView.builder**：实现动态长网格（懒加载，只渲染可见区域）。注意接收 `gridDelegate` 布局委托、`itemBuilder` 构建函数、`itemCount` 构建数量。
![[Pasted image 20260225184528.png]]

---

## 5. CustomScrollView (自定义滚动)

### 5.1 作用与用法
- **作用**：用于组合多个可滚动组件（如列表、网格），实现统一协调的滚动效果。
- **Sliver**：Flutter 中滚动视图的"切片"。
- **用法**：通过 `slivers` 属性接收一个 Sliver 组件列表。

### 5.2 Sliver 组件对应关系
| 普通 Widget | 对应的 Sliver 组件 |
| :--- | :--- |
| **ListView** | SliverList |
| **GridView** | SliverGrid |
| **AppBar** | SliverAppBar |
| **Padding** | SliverPadding |
| **ToBoxAdapter** | SliverToBoxAdapter |
| **粘性吸顶** | SliverPersistentHeader |

![[Pasted image 20260225184742.png]]

### 5.3 案例实现详解

#### ① 案例代码实现-顶部轮播图
![[Pasted image 20260225194805.png]]

#### ② 案例代码实现-粘性吸顶分类
`SliverPersistentHeader`：给 `delegate` 属性赋值一个继承 `SliverPersistentHeaderDelegate` 的对象实例。
![[Pasted image 20260225194845.png]]

#### ③ 案例代码实现-列表实现
![[Pasted image 20260225195004.png]]

---

## 6. 整页滚动容器：PageView

### 6.1 核心作用与机制
- **作用**：用于实现**分页滚动视图**的核心组件。
- **方式**：提供多种构建方式，默认构造方式、`PageView.builder` 等。
- **优势**：支持懒加载（按需渲染）。
- **场景**：PageView 经常构建整页滚动切换场景（如 App 引导页、轮播图）。
![[Pasted image 20260225195106.png|740]]

### 6.2 跳转与控制 (PageController)
- **控制器**：PageView 绑定 `controller` 属性，对象类型为 `PageController`。
- **切换方法**：使用 `controller.jumpToPage` 或 `controller.animateToPage`。
![[Pasted image 20260225195147.png]]

### 6.3 综合代码示例：PageView + 粘性吸顶 + 列表联动
```dart
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
class MainPage extends StatefulWidget {  
  MainPage({Key? key}) : super(key: key);  
  @override  
  _MainPageState createState() => _MainPageState();  
}  
  
class _MainPageState extends State<MainPage> {  
  int _currentIndex = 0; // 当前激活索引  
  PageController _controller = PageController();  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
        home: Scaffold(  
            appBar: AppBar(title: Text("综合滚动案例")),  
            body: CustomScrollView(  
              slivers: [  
                // 1. 顶部轮播图 (PageView.builder + 指示器)  
                SliverToBoxAdapter(  
                    child: Stack(  
                  children: [  
                    Container(  
                      color: Colors.blue, height: 260,  
                      child: PageView.builder(  
                          controller: _controller,  
                          itemCount: 10,  
                          onPageChanged: (index) => setState(() => _currentIndex = index),  
                          itemBuilder: (context, index) => Center(  
                            child: Text("轮播图 ${index + 1}", style: TextStyle(color: Colors.white, fontSize: 20)),  
                          )),  
                    ),  
                    Positioned(  
                      bottom: 0, left: 0, right: 0, height: 40,  
                      child: Row(  
                        mainAxisAlignment: MainAxisAlignment.center,  
                        children: List.generate(10, (index) => GestureDetector(  
                          onTap: () {  
                            _controller.animateToPage(index, duration: Duration(milliseconds: 300), curve: Curves.linear);  
                          },  
                          child: Container(  
                            margin: EdgeInsets.only(left: 10), width: 10, height: 10,  
                            decoration: BoxDecoration(  
                                color: _currentIndex == index ? Colors.red : Colors.white,  
                                borderRadius: BorderRadius.circular(5)),  
                          ),  
                        )),  
                      ),  
                    )  
                  ],  
                )),  
                const SliverToBoxAdapter(child: SizedBox(height: 10)),  
                // 2. 粘性吸顶分类栏  
                SliverPersistentHeader(  
                  delegate: _StickyCategory(),  
                  pinned: true,   
                ),  
                const SliverToBoxAdapter(child: SizedBox(height: 10)),  
                // 3. 网格列表内容  
                SliverGrid.count(  
                  crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10,  
                  children: List.generate(100, (index) => Container(  
                    color: Colors.blue, alignment: Alignment.center,  
                    child: Text('列表项 ${index + 1}', style: TextStyle(color: Colors.white, fontSize: 20)),  
                  )),  
                )  
              ],  
            )));  
  }  
}  
  
class _StickyCategory extends SliverPersistentHeaderDelegate {  
  @override  
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {  
    return Container(  
      color: Colors.white,  
      child: ListView.builder(  
          itemCount: 30, scrollDirection: Axis.horizontal,  
          itemBuilder: (context, index) => Container(  
            width: 100, margin: EdgeInsets.symmetric(horizontal: 10),  
            color: Colors.blue, alignment: Alignment.center,  
            child: Text('分类 ${index + 1}', style: TextStyle(color: Colors.white)),  
          )),  
    );  
  }  
  @override  
  double get maxExtent => 80;  
  @override  
  double get minExtent => 40;  
  @override  
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;  
}
```
