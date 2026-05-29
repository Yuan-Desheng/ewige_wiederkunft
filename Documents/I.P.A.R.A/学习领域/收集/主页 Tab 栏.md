---
createTime: 2026-02-28 22:10
笔记ID: 20260228221055
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

##  主页 Tab 栏
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 主页 Tab 栏

### 1. 核心组件说明

*   **SafeArea**：避开安全区组件（如下划线、刘海屏等区域）。
*   **IndexedStack**：堆叠组件，根据索引（index）显示对应组件，保持子组件状态。
*   **BottomNavigationBar**：底部导航栏（上图下字风格），负责切换索引。

![[Pasted image 20260228145648.png]]

---

### 2. 代码实现步骤

#### **Step 1: 准备素材**
将素材拷贝到项目 `lib/assets` 目录下。

#### **Step 2: 配置资源路径**
在 `pubspec.yaml` 中注册资源：
```yaml
flutter:
  assets:  
   - lib/assets/
```

#### **Step 3: 定义底部导航数据**
在 `lib/pages/main/index.dart` 中定义导航项配置：
```dart
final List<Map<String, String>> _tabList = [  
  {  
    "icon": "lib/assets/ic_public_home_normal.png", 
    "active_icon": "lib/assets/ic_public_home_active.png", 
    "text": "首页",  
  },  
  {  
    "icon": "lib/assets/ic_public_pro_normal.png", 
    "active_icon": "lib/assets/ic_public_pro_active.png", 
    "text": "分类",  
  },  
  {  
    "icon": "lib/assets/ic_public_cart_normal.png", 
    "active_icon": "lib/assets/ic_public_cart_active.png", 
    "text": "购物车",  
  },  
  {  
    "icon": "lib/assets/ic_public_my_normal.png", 
    "active_icon": "lib/assets/ic_public_my_active.png", 
    "text": "我的",  
  },  
];
```

#### **Step 4: 生成导航项函数**
```dart
List<BottomNavigationBarItem> _getTabarWidget() {  
  return List.generate(_tabList.length, (int index) {  
    return BottomNavigationBarItem(  
        icon: Image.asset(  
          _tabList[index]["icon"]!,  
          width: 30,  
          height: 30,  
        ),  
        activeIcon: Image.asset(  
          _tabList[index]["active_icon"]!,  
          width: 30,  
          height: 30,  
        ),  
        label: _tabList[index]["text"]  
    );  
  });  
}
```

#### **Step 5: 配置 BottomNavigationBar**
```dart
bottomNavigationBar: BottomNavigationBar(  
  showSelectedLabels: true,  
  selectedItemColor: Colors.black,  
  unselectedItemColor: Colors.black,  
  onTap: (index) {  
    setState(() {  
      _currentIndex = index;  
    });  
  },  
  currentIndex: _currentIndex,  
  items: _getTabarWidget(),  
),
```

#### **Step 6: 定义子页面视图**
```dart
List<Widget> _getChildren() {  
  return [homeView(), categoryView(), cartView(), mineView()];  
}

#### **Step 7: 使用 IndexedStack 放置主体内容**
```dart
body: SafeArea(child: IndexedStack(  
  index: _currentIndex,  
  children: _getChildren(), // 放置“首页-分类-购物车-我的”组件  
)),
```
```

---

### 3. lib/pages/main/index.dart 完整代码

```dart
import 'package:flutter/material.dart';  
import 'package:hm_shop/pages/cart/index.dart';  
import 'package:hm_shop/pages/category/index.dart';  
import 'package:hm_shop/pages/home/index.dart';  
import 'package:hm_shop/pages/mine/index.dart';  
  
class MainPage extends StatefulWidget {  
  const MainPage({super.key});  
  
  @override  
  State<MainPage> createState() => _MainPageState();  
}  
  
class _MainPageState extends State<MainPage> {  
  // 当前选中的索引  
  int _currentIndex = 0;  
  
  // 定义数据 根据数据进行渲染4个导航  
  final List<Map<String, String>> _tabList = [  
    {  
      "icon": "lib/assets/ic_public_home_normal.png", 
      "active_icon": "lib/assets/ic_public_home_active.png", 
      "text": "首页",  
    },  
    {  
      "icon": "lib/assets/ic_public_pro_normal.png", 
      "active_icon": "lib/assets/ic_public_pro_active.png", 
      "text": "分类",  
    },  
    {  
      "icon": "lib/assets/ic_public_cart_normal.png", 
      "active_icon": "lib/assets/ic_public_cart_active.png", 
      "text": "购物车",  
    },  
    {  
      "icon": "lib/assets/ic_public_my_normal.png", 
      "active_icon": "lib/assets/ic_public_my_active.png", 
      "text": "我的",  
    },  
  ];  
  
  // 返回底部渲染的四个分类  
  List<BottomNavigationBarItem> _getTabarWidget() {  
    return List.generate(_tabList.length, (int index) {  
      return BottomNavigationBarItem(  
          icon: Image.asset(  
          _tabList[index]["icon"]!,  
            width: 30,  
            height: 30,  
          ),  
          activeIcon: Image.asset(  
            _tabList[index]["active_icon"]!,  
            width: 30,  
            height: 30,  
          ),  
          label: _tabList[index]["text"]  
      );  
    });  
  }  
  
  List<Widget> _getChildren() {  
    return [homeView(), categoryView(), cartView(), mineView()];  
  }  
  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
      body: SafeArea(child: IndexedStack(  
        index: _currentIndex,  
        children: _getChildren(),  
      )),  
      bottomNavigationBar: BottomNavigationBar(  
        showSelectedLabels: true,  
        selectedItemColor: Colors.black,  
        unselectedItemColor: Colors.black,  
        onTap: (index) {  
          setState(() {  
            _currentIndex = index;  
          });  
        },  
        currentIndex: _currentIndex,  
        items: _getTabarWidget(),  
      ),  
    );  
  }  
}
```
