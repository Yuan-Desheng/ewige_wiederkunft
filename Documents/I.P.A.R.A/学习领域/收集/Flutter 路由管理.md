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

## 2. 路由的基本形式

### 2.1 基本路由 (匿名路由)
- **场景**：适合页面不多、跳转逻辑简单的场景。
- **用法**：无需提前注册路由，跳转时直接创建 `MaterialPageRoute` 实例。
    - **跳转新页面**：`Navigator.push(context, route)`
    - **返回上一页**：`Navigator.pop(context)`
- **注意**：`MaterialApp` 是路由系统的根组件，应用中只能有一个 `MaterialApp`。

![[Pasted image 20260226164339.png]]
示例代码：
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

### 2.2 命名路由
- **场景**：应用页面增多后，提升代码可维护性。
- **用法**：在 `MaterialApp` 中预先注册路由表（`routes`）并设置 `initialRoute`。
- **跳转**：`Navigator.pushNamed(context, "/path")`

![[Pasted image 20260226164427.png]]
示例代码：
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
                  // 跳转到详情页  
                  // Navigator.push(context,  
                  //     MaterialPageRoute(builder: (context) => DetailPage()));                  Navigator.pushNamed(context, "/detail");  
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

## 3. 常用路由跳转方法对照表

| 方法 | 核心作用 | 使用场景 | 典型场景 |
| :--- | :--- | :--- | :--- |
| **pushNamed** | 进入新页面 | `[A, B]` → `[A, B, C]` | 常规跳转，如列表页进入详情页。 |
| **pushReplacementNamed** | 替换当前页面 | `[A, B]` → `[A, C]` | 登录成功后跳转主页，无法返回登录页。 |
| **pushNamedAndRemoveUntil** | 跳转新页面并清理栈 | `[A, B, C]` → `[A, E]` | 退出登录后跳转登录页，并清空历史。 |
| **popAndPushNamed** | 返回并立即跳转 | `[A, B, C]` → `[A, B, D]` | 结算后，返回列表并同时跳转订单页。 |
| **popUntil** | 连续返回直到条件满足 | `[A, B, C, D]` → `[A, B]` | 从深层级一键返回到主设置页面。 |

---

## 4. 路由参数传递

### 4.1 命名路由传参
- **传递方式**：`Navigator.pushNamed(context, 地址, arguments: { 参数 })`
- **接收方式**：`ModalRoute.of(context)?.settings.arguments`
- **接收时机**：`initState` 获取不到路由参数，需放置在 `Future.microtask`（异步微任务）中处理。

![[Pasted image 20260226164535.png]]
示例代码：
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
                  // 跳转到详情页  
                  // Navigator.push(context,  
                  //     MaterialPageRoute(builder: (context) => DetailPage()));                  Navigator.pushNamed(context, "/detail",  
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
    // TODO: implement initState  
    super.initState();  
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

### 4.2 基础路由传参
- **传递/接收**：通过组件构造函数传递（父传子）。
- **接收时机**：`initState` 即可直接获取到构造函数传入的参数。

![[Pasted image 20260226164616.png]]
示例代码：
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
    // TODO: implement initState  
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

## 5. 高级控制：动态路由与 404

### 5.1 onGenerateRoute (动态路由拦截)
允许根据 `RouteSettings`（包含名称和参数）动态创建路由。常用于路由鉴权（如判断是否登录）。

![[Pasted image 20260226164707.png]]
![[Pasted image 20260226164747.png]]
示例代码：
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
      routes: {"/goodsList": (context) => GoodsList()}, // 登录页和购物车列表页不在路由表里  
      onGenerateRoute: (settings) {  
        print(settings.name);  
        // 去的是不是 购物车列表页  
        if (settings.name == "/cartList") {  
          bool isLogin = true;  
          if (isLogin) {  
            return MaterialPageRoute(builder: (context) => CartList());  
          } else {  
            return MaterialPageRoute(builder: (context) => LoginPage());  
          }  
        }  
        // settings.name  
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
      appBar: AppBar(  
        title: Text("商品列表"),  
      ),  
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
      appBar: AppBar(  
        title: Text("购物车列表"),  
      ),  
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
      appBar: AppBar(  
        title: Text("登录页面"),  
      ),  
      body: Center(  
        child: TextButton(onPressed: () {}, child: Text("去登录")),  
      ),  
    );  
  }  
}
```

### 5.2 onUnknownRoute (404 处理)
当跳转一个未在路由表注册、也未在 `onGenerateRoute` 处理的路由时调用，通常用于显示“404”页面。

![[Pasted image 20260226164848.png]]
示例代码：
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
      routes: {"/goodsList": (context) => GoodsList()}, // 登录页和购物车列表页不在路由表里  
      onGenerateRoute: (settings) {  
        print(settings.name);  
        // 去的是不是 购物车列表页  
        if (settings.name == "/cartList") {  
          bool isLogin = true;  
          if (isLogin) {  
            return MaterialPageRoute(builder: (context) => CartList());  
          } else {  
            return MaterialPageRoute(builder: (context) => LoginPage());  
          }  
        }  
        // settings.name  
      },  
      // 处理显示的是404页面  
      onUnknownRoute: (settings) {  
        return MaterialPageRoute(builder: (context) => NotFound());  
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
      appBar: AppBar(  
        title: Text("商品列表"),  
      ),  
      body: Center(  
        child: TextButton(  
            onPressed: () {  
              Navigator.pushNamed(context, "abc");  
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
      appBar: AppBar(  
        title: Text("购物车列表"),  
      ),  
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
      appBar: AppBar(  
        title: Text("登录页面"),  
      ),  
      body: Center(  
        child: TextButton(onPressed: () {}, child: Text("去登录")),  
      ),  
    );  
  }  
}  
  
// 404页面组件  
class NotFound extends StatelessWidget {  
  const NotFound({Key? key}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return Container(  
      child: Center(  
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

---

## 6. 综合示例代码：动态路由与拦截实现

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MainPage());

class MainPage extends StatelessWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: "/goodsList",
      // 静态路由表
      routes: {"/goodsList": (context) => const GoodsList()}, 
      
      // 1. 动态路由生成 (路由拦截)
      onGenerateRoute: (settings) {
        if (settings.name == "/cartList") {
          bool isLogin = true; // 模拟鉴权逻辑
          return MaterialPageRoute(
            builder: (context) => isLogin ? const CartList() : const LoginPage()
          );
        }
        return null;
      },
      
      // 2. 处理未知路由 (404 页面)
      onUnknownRoute: (settings) => MaterialPageRoute(builder: (context) => const NotFound()),
    );
  }
}

// 404 页面组件示例
class NotFound extends StatelessWidget {
  const NotFound({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Image.asset("lib/images/github.jpg", width: 300, height: 400),
      ),
    );
  }
}

// ... 其余业务组件 (GoodsList, CartList, LoginPage) 的实现
```
