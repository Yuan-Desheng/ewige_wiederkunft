---
createTime: 2026-02-26 16:42
笔记ID: 20260226164215
multiFile:
multiMedia:
description: 详细介绍了 Flutter 中的路由管理机制，包括基本路由、命名路由、跳转方法、参数传递以及动态路由拦截（onGenerateRoute）等高级用法。
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - Navigation
  - Route
aliases:
  - 路由管理
  - Navigator
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 路由管理

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="70" max="100" style="width: 100%;"></progress>

## 1. 路由管理核心概念

路由管理是构建多页面应用的核心，它通过 **Navigator** 和 **Route** 来管理页面栈，实现页面跳转和返回。

![[Pasted image 20260226164256.png]]

---

## 2. 基本路由

- **场景**：基本路由适合页面不多、跳转逻辑简单的场景。
- **用法**：无需提前注册路由，跳转时创建 `MaterialPageRoute` 实例即可。
- **核心操作**：
    - **跳转新页面**：`Navigator.push(BuildContext context, Route route)`
    - **返回上一页**：`Navigator.pop(BuildContext context)`
- **注意**：`MaterialApp` 是路由系统的根组件，应用中只能有一个 `MaterialApp` 包裹。

![[Pasted image 20260226164339.png]]

### 2.1 示例代码 (基本路由跳转)
```dart
import 'package:dio/dio.dart';  
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
// 路由跳转-Material风格 只能有一个MaterialApp  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(home: ListPage() // 列表页 详情页  
        );  
  }  
}  
  
// 列表页  
class ListPage extends StatefulWidget {  
  ListPage({Key? key}) : super(key: key);  
  
  @override  
  _ListPageState createState() => _ListPageState();  
}  
  
class _ListPageState extends State<ListPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("列表页"),  
        ),  
        body: ListView.builder(  
            padding: EdgeInsets.all(10),  
            itemCount: 100,  
            itemBuilder: (BuildContext context, int index) {  
              return GestureDetector(  
                onTap: () {  
                  // 跳转到详情页  
                  Navigator.push(context,  
                      MaterialPageRoute(builder: (context) => DetailPage()));  
                },  
                child: Container(  
                  color: Colors.blue,  
                  margin: EdgeInsets.only(top: 10),  
                  height: 100,  
                  alignment: Alignment.center,  
                  child: Text('列表项${index + 1}',  
                      style: TextStyle(color: Colors.white, fontSize: 16)),  
                ),  
              );  
            }));  
  }  
}  
  
// 详情页  
class DetailPage extends StatefulWidget {  
  DetailPage({Key? key}) : super(key: key);  
  
  @override  
  _DetailPageState createState() => _DetailPageState();  
}  
  
class _DetailPageState extends State<DetailPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("详情页"),  
        ),  
        body: Center(  
          child: TextButton(  
              onPressed: () {  
                Navigator.pop(context);  
              },  
              child: Text("返回上一个页面")),  
        ));  
  }  
}
```

---

## 3. 命名路由

- **场景**：应用页面增多后，使用命名路由提升代码可维护性。
- **用法**：需要先在 `MaterialApp` 中注册一个路由表（`routes`）并设置 `initialRoute`（首页）。

![[Pasted image 20260226164427.png]]

### 3.1 示例代码 (命名路由注册与使用)
```dart
import 'package:dio/dio.dart';  
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
// 路由跳转-Material风格 只能有一个MaterialApp  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    // 注册路由表  
    return MaterialApp(  
        initialRoute: "/list",  
        routes: {  
          "/list": (context) => ListPage(),  
          "/detail": (context) => DetailPage()  
        },  
        home: ListPage() // 列表页 详情页  
        );  
  }  
}  
  
// 列表页  
class ListPage extends StatefulWidget {  
  ListPage({Key? key}) : super(key: key);  
  
  @override  
  _ListPageState createState() => _ListPageState();  
}  
  
class _ListPageState extends State<ListPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("列表页"),  
        ),  
        body: ListView.builder(  
            padding: EdgeInsets.all(10),  
            itemCount: 100,  
            itemBuilder: (BuildContext context, int index) {  
              return GestureDetector(  
                onTap: () {  
                  // 通过命名跳转到详情页  
                  Navigator.pushNamed(context, "/detail");  
                },  
                child: Container(  
                  color: Colors.blue,  
                  margin: EdgeInsets.only(top: 10),  
                  height: 100,  
                  alignment: Alignment.center,  
                  child: Text('列表项${index + 1}',  
                      style: TextStyle(color: Colors.white, fontSize: 16)),  
                ),  
              );  
            }));  
  }  
}  
  
// 详情页  
class DetailPage extends StatefulWidget {  
  DetailPage({Key? key}) : super(key: key);  
  
  @override  
  _DetailPageState createState() => _DetailPageState();  
}  
  
class _DetailPageState extends State<DetailPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("详情页"),  
        ),  
        body: Center(  
          child: Column(  
            children: [  
              TextButton(  
                  onPressed: () {  
                    Navigator.pushNamed(context, "/list");  
                  },  
                  child: Text("去列表页")),  
              TextButton(  
                  onPressed: () {  
                    Navigator.pop(context);  
                  },  
                  child: Text("返回上一个页面"))  
            ],  
          ),  
        ));  
  }  
}
```

---

## 4. 常用跳转方法对照表

| 方法名称 | 核心作用 | 使用场景 | 典型场景 |
| :--- | :--- | :--- | :--- |
| **pushNamed** | 进入新页面 | `[A, B]` → `[A, B, C]` | 常规页面跳转，如列表页进入详情页 |
| **pushReplacementNamed** | 替换当前页面 | `[A, B]` → `[A, C]` | 登录成功后跳转主页，并无法返回登录页 |
| **pushNamedAndRemoveUntil** | 跳转新页面并清理栈 | `[A, B, C, D]` → `[A, E]` | 退出登录后跳转登录页，并清空所有历史页面 |
| **popAndPushNamed** | 返回并立即跳转新页面 | `[A, B, C]` → `[A, B, D]` | 购物车结算后，返回商品列表并跳转到订单页 |
| **popUntil** | 连续返回直到条件满足 | `[A, B, C, D]` → `[A, B]` | 从设置页的深层级，一键返回到主设置页面 |

---

## 5. 路由传递参数

### 5.1 命名路由传参
- **传递**：`Navigator.pushNamed(context, 地址, arguments: { 参数 })`
- **接收**：`ModalRoute.of(context)?.settings.arguments`
- **接收时机**：`initState` 获取不到路由参数，需放置在 `Future.microtask`（异步微任务）中。

![[Pasted image 20260226164535.png]]

#### 示例代码 (命名路由参数接收)
```dart
import 'package:dio/dio.dart';  
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
// 路由跳转-Material风格 只能有一个MaterialApp  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    // 注册路由表  
    return MaterialApp(  
        initialRoute: "/list",  
        routes: {  
          "/list": (context) => ListPage(),  
          "/detail": (context) => DetailPage()  
        },  
        home: ListPage() // 列表页 详情页  
        );  
  }  
}  
  
// 列表页  
class ListPage extends StatefulWidget {  
  ListPage({Key? key}) : super(key: key);  
  
  @override  
  _ListPageState createState() => _ListPageState();  
}  
  
class _ListPageState extends State<ListPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("列表页"),  
        ),  
        body: ListView.builder(  
            padding: EdgeInsets.all(10),  
            itemCount: 100,  
            itemBuilder: (BuildContext context, int index) {  
              return GestureDetector(  
                onTap: () {  
                  // 跳转并传递 arguments  
                  Navigator.pushNamed(context, "/detail",  
                      arguments: {"id": index + 1});  
                },  
                child: Container(  
                  color: Colors.blue,  
                  margin: EdgeInsets.only(top: 10),  
                  height: 100,  
                  alignment: Alignment.center,  
                  child: Text('列表项${index + 1}',  
                      style: TextStyle(color: Colors.white, fontSize: 16)),  
                ),  
              );  
            }));  
  }  
}  
  
// 详情页  
class DetailPage extends StatefulWidget {  
  DetailPage({Key? key}) : super(key: key);  
  
  @override  
  _DetailPageState createState() => _DetailPageState();  
}  
  
class _DetailPageState extends State<DetailPage> {  
  String _id = "";  
  @override  
  void initState() {  
    super.initState();  
    // 通过 Future.microtask 接收 arguments  
    Future.microtask(() {  
      if (ModalRoute.of(context) != null) {  
        Map<String, dynamic> params =  
            ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;  
        _id = params["id"].toString();  
        setState(() {});  
      }  
    });  
  }  
  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("详情页"),  
        ),  
        body: Center(  
          child: Column(  
            children: [  
              TextButton(  
                  onPressed: () {  
                    Navigator.pushNamed(context, "/list");  
                  },  
                  child: Text("去列表页$_id")),  
              TextButton(  
                  onPressed: () {  
                    Navigator.pop(context);  
                  },  
                  child: Text("返回上一个页面"))  
            ],  
          ),  
        ));  
  }  
}
```

### 5.2 基础路由传参
- **传递/接收**：通过组件构造函数传递参数 (父传子)。
- **接收时机**：`initState` 可获取到基础路由的构造函数传参。

![[Pasted image 20260226164616.png]]

#### 示例代码 (基础路由构造函数传参)
```dart
import 'package:dio/dio.dart';  
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
// 路由跳转-Material风格 只能有一个MaterialApp  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(home: ListPage() // 列表页 详情页  
        );  
  }  
}  
  
// 列表页  
class ListPage extends StatefulWidget {  
  ListPage({Key? key}) : super(key: key);  
  
  @override  
  _ListPageState createState() => _ListPageState();  
}  
  
class _ListPageState extends State<ListPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("列表页"),  
        ),  
        body: ListView.builder(  
            padding: EdgeInsets.all(10),  
            itemCount: 100,  
            itemBuilder: (BuildContext context, int index) {  
              return GestureDetector(  
                onTap: () {  
                  // 跳转并传参  
                  Navigator.push(  
                      context,  
                      MaterialPageRoute(  
                          builder: (context) => DetailPage(  
                                id: index + 1,  
                              )));  
                },  
                child: Container(  
                  color: Colors.blue,  
                  margin: EdgeInsets.only(top: 10),  
                  height: 100,  
                  alignment: Alignment.center,  
                  child: Text('列表项${index + 1}',  
                      style: TextStyle(color: Colors.white, fontSize: 16)),  
                ),  
              );  
            }));  
  }  
}  
  
// 详情页  
class DetailPage extends StatefulWidget {  
  final int? id;  
  DetailPage({Key? key, this.id}) : super(key: key);  
  
  @override  
  _DetailPageState createState() => _DetailPageState();  
}  
  
class _DetailPageState extends State<DetailPage> {  
  @override  
  void initState() {  
    super.initState();  
    print(widget.id);  
  }  
  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
        appBar: AppBar(  
          title: Text("详情页"),  
        ),  
        body: Center(  
          child: TextButton(  
              onPressed: () {  
                Navigator.pop(context);  
              },  
              child: Text("返回上一个页面${widget.id}")),  
        ));  
  }  
}
```

---

## 6. 动态路由与高级控制

- **场景**：复杂的业务逻辑，如需根据参数动态生成页面，或实现路由鉴权。

### 6.1 onGenerateRoute (路由拦截)
允许你根据 `RouteSettings` 动态创建不同的 `Route`。

![[Pasted image 20260226164707.png]]
![[Pasted image 20260226164747.png]]

#### 示例代码 (onGenerateRoute 登录鉴权案例)
```dart
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
      initialRoute: "/goodsList",  
      routes: {"/goodsList": (context) => GoodsList()}, // 路由表  
      onGenerateRoute: (settings) {  
        print(settings.name);  
        // 动态判断购物车页面权限  
        if (settings.name == "/cartList") {  
          bool isLogin = true;  
          if (isLogin) {  
            return MaterialPageRoute(builder: (context) => CartList());  
          } else {  
            return MaterialPageRoute(builder: (context) => LoginPage());  
          }  
        }  
        return null;  
      },  
    );  
  }  
}  
  
// 商品列表  
class GoodsList extends StatefulWidget {  
  GoodsList({Key? key}) : super(key: key);  
  @override  
  _GoodsListState createState() => _GoodsListState();  
}  
  
class _GoodsListState extends State<GoodsList> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
      appBar: AppBar(title: Text("商品列表")),  
      body: Center(  
        child: TextButton(  
            onPressed: () {  
              Navigator.pushNamed(context, "/cartList");  
            },  
            child: Text("加入购物车")),  
      ),  
    );  
  }  
}  
  
// 购物车列表  
class CartList extends StatefulWidget {  
  CartList({Key? key}) : super(key: key);  
  @override  
  _CartListState createState() => _CartListState();  
}  
  
class _CartListState extends State<CartList> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
      appBar: AppBar(title: Text("购物车列表")),  
      body: Center(  
        child: TextButton(onPressed: () {}, child: Text("去支付")),  
      ),  
    );  
  }  
}  
  
// 登录页面  
class LoginPage extends StatefulWidget {  
  LoginPage({Key? key}) : super(key: key);  
  @override  
  _LoginPageState createState() => _LoginPageState();  
}  
  
class _LoginPageState extends State<LoginPage> {  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
      appBar: AppBar(title: Text("登录页面")),  
      body: Center(  
        child: TextButton(onPressed: () {}, child: Text("去登录")),  
      ),  
    );  
  }  
}
```

### 6.2 onUnknownRoute (404 页面)
跳转一个未在路由表注册、也未在 `onGenerateRoute` 中处理的路由时触发。通常显示 "404" 页面。

![[Pasted image 20260226164848.png]]

#### 示例代码 (onUnknownRoute 实现 404)
```dart
import 'package:flutter/material.dart';  
  
void main(List<String> args) {  
  runApp(MainPage());  
}  
  
class MainPage extends StatelessWidget {  
  const MainPage({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
      initialRoute: "/goodsList",  
      routes: {"/goodsList": (context) => GoodsList()},  
      onGenerateRoute: (settings) {  
        if (settings.name == "/cartList") {  
          bool isLogin = true;  
          if (isLogin) {  
            return MaterialPageRoute(builder: (context) => CartList());  
          } else {  
            return MaterialPageRoute(builder: (context) => LoginPage());  
          }  
        }  
        return null;  
      },  
      // 处理 404 页面  
      onUnknownRoute: (settings) {  
        return MaterialPageRoute(builder: (context) => NotFound());  
      },  
    );  
  }  
}  
  
// 商品列表省略...

// 404 页面组件  
class NotFound extends StatelessWidget {  
  const NotFound({Key? key}) : super(key: key);  
  @override  
  Widget build(BuildContext context) {  
    return Scaffold(  
      body: Center(  
        child: Image.asset(  
          "lib/images/github.jpg",  
          width: 300,  
          height: 400,  
        ),  
      ),  
    );  
  }  
}
```
