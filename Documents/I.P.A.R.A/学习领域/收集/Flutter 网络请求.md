---
createTime: 2026-02-26 13:54
笔记ID: 20260226135406
multiFile:
multiMedia:
description: 深入讲解了 Flutter 中使用 Dio 插件进行网络请求的实战案例，涵盖工具类封装、拦截器配置、Web 端跨域解决及 UI 渲染。
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - Network
  - Dio
  - Http
  - Web
aliases:
  - 网络请求
  - Dio 封装
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## Flutter 网络请求

```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="90" max="100" style="width: 100%;"></progress>

## 1. 网络请求核心：Dio 插件

### 1.1 安装与基础使用
网络请求是 Flutter 移动应用开发的核心功能，Dio 是目前最常用的插件。
- **安装**: `flutter pub add dio`
- **基本语法**: `Dio().get(地址).then().catchError()`

### 1.2 数据获取时机：initState
一般情况下，在有状态组件的 `initState` 中初始化获取页面数据。

---

## 2. 网络请求实战案例：频道管理

### 2.1 Dio 工具类封装步骤
1.  **创建工具类**：封装内部 Dio 实例。
2.  **配置基础参数**：在构造函数中设置基础地址 (`baseUrl`) 和超时时间。
3.  **添加拦截器**：包含请求拦截器、响应拦截器、错误拦截器。
4.  **封装请求方法**：如统一的 `get` 方法。
5.  **跨域处理**：配置支持 CORS 的接口。
6.  **UI 渲染**：获取数据后进行循环渲染。

![[Pasted image 20260226153703.png]]
![[Pasted image 20260226154908.png]]

### 2.2 解决 Web 端跨域问题
默认情况下，Flutter Web 加载网络资源会报跨域错误：
1.  修改 `flutter/packages/flutter_tools/lib/src/web/chrome.dart`，添加 `'--disable-web-security'` 参数。
    ![[Pasted image 20260226155032.png]]
2.  删除 `flutter/bin/cache/` 下的 `flutter_tools.snapshot` 和 `flutter_tools.stamp`。
3.  执行 `flutter doctor -v` 并重新运行项目。

---

## 3. 知识点汇总与技巧

- **基础配置**：Dio 基础配置包含基础地址、连接超时、发送/接收超时时间。
- **拦截器逻辑**：通过 `handler.next()` 放过，通过 `handler.reject()` 拦截或抛出异常。
- **级联运算符 (`..`)**：想要连续对同一个对象赋值可以使用 `..` 语法。
- **类型转换**：`List` 的数据类型想要转化 `List<具体类型>` 可以使用 `cast` 方法。

![[Pasted image 20260226154937.png]]
![[Pasted image 20260226155128.png]]

---

## 4. 完整实战代码

```dart
import 'package:dio/dio.dart';  
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
  void initState() {  
    // TODO: implement initState  
    super.initState();  
    // 发起网络请求  
    _getChannels(); // 获取频道数据  
  }  
  
  List<Map<String, dynamic>> _list = []; // 用来接收数据的  
  void _getChannels() async {  
    DioUtils util = DioUtils(); // 创建实例化对象  
    Response<dynamic> result = await util.get("channels");  
    Map<String, dynamic> res = result.data as Map<String, dynamic>;  
    // print(res["data"]["channels"] as List<Map<String, dynamic>>);  
    List data = res["data"]["channels"] as List;  
    _list = data.cast<Map<String, dynamic>>() as List<Map<String, dynamic>>;  
    // cast方法强制转化列表项的类型  
    setState(() {}); // 执行方法 UI才会更新  
    print(_list);  
    // channels是一个后端支持前端跨域访问的接口 cors 支持任何的域名进行访问  
    // www.baidu.com  
    // localhost:60791  }  
  
  @override  
  Widget build(BuildContext context) {  
    return MaterialApp(  
      home: Scaffold(  
        appBar: AppBar(title: Text("频道管理")),  
        body: GridView.extent(  
          padding: EdgeInsets.all(10),  
          maxCrossAxisExtent: 140,  
          mainAxisSpacing: 10,  
          crossAxisSpacing: 10,  
          childAspectRatio: 3,  
          children: List.generate(_list.length, (index) {  
            return ChannelItem(item: _list[index]);  
          }),  
        ),  
      ),  
    );  
  }  
}  
  
// 用来绘制每个频道的UI内容  
class ChannelItem extends StatelessWidget {  
  final Map<String, dynamic> item;  
  const ChannelItem({Key? key, required this.item}) : super(key: key);  
  
  @override  
  Widget build(BuildContext context) {  
    return Container(  
      color: Colors.blue,  
      alignment: Alignment.center,  
      child: Text(  
        item["name"] ?? "空",  
        style: TextStyle(color: Colors.white, fontSize: 14),  
      ),  
    );  
  }  
}  
  
// 封装一个工具类  
class DioUtils {  
  final Dio _dio = Dio(); // 内部Dio实例对象  
  DioUtils() {  
    // 做些基本的操作  
    // 配置基础地址 和超时时间  
    // _dio.options.baseUrl = "https://geek.itheima.net/v1_0/";  
    // _dio.options.connectTimeout = Duration(seconds: 10); // 连接超时  
    // _dio.options.sendTimeout = Duration(seconds: 10); // 发送超时  
    // _dio.options.receiveTimeout = Duration(seconds: 10); // 接收超时  
    // 简写 ..连续赋值的写法  
    _dio.options  
      ..baseUrl = "https://geek.itheima.net/v1_0/"  
      ..connectTimeout = Duration(seconds: 10)  
      ..sendTimeout = Duration(seconds: 10)  
      ..receiveTimeout = Duration(seconds: 10);  
  
    // 拦截器  
    _addInterceptor(); // 注册添加拦截器  
  }  
  void _addInterceptor() {  
    _dio.interceptors.add(InterceptorsWrapper(  
        // 请求拦截器  
        onRequest: (context, handler) {  
      //  handler.next(requestOptions) 放过请求  
      // handler.reject(error) 拦截请求  
      handler.next(context);  
    },  
        // 响应拦截器  
        onResponse: (context, handler) {  
      // http状态吗 2xx 成功 3 4 5      // handler.reject(error)      if (context.statusCode! >= 200 && context.statusCode! < 300) {  
        handler.next(context); // 放过  
        return;  
      }  
      // 说明出异常  
      handler.reject(DioException(requestOptions: context.requestOptions));  
      // 抛出异常  
    },  
        // 错误拦截器  
        onError: (context, handler) {  
      handler.reject(context); // 直接抛出异常  
    }));  
  }  
  
  // 向外暴露一个get方法  
  Future<Response<dynamic>> get(String url, {Map<String, dynamic>? params}) {  
    return _dio.get(url, queryParameters: params);  
  }  
}
```
