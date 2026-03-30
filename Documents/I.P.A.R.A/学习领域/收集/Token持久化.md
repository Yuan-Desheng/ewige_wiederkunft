---
createTime: 2026-03-02 14:41
笔记ID: 20260302144114
multiFile:
multiMedia:
description:
笔记类型:
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
---

## Token持久化

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="10" max="100" style="width: 100%;"></progress>

### 持久化 Token 步骤概览
1. **安装插件**：安装 `shared_preferences` 插件。
2. **封装工具**：封装一个 `TokenManager` 工具，具备初始化、设置、获取、删除方法。
3. **写入 Token**：登录成功将 Token 写入持久化存储。
4. **封装 API**：封装获取用户信息（Member Profile）的 API。
5. **Token 注入**：在 Dio 请求工具中进行 Token 拦截注入。
6. **状态同步**：在应用首页判断 Token 状态并赋值给 Getx 数据。
7. **逻辑调整**：将“我的页面”中的 Getx 调用方式从 `put` 调整为 `find`。

**常用命令与接口：**
- **安装命令**：`flutter pub add shared_preferences`
- **用户信息接口 (GET)**：`/member/profile`

![[Pasted image 20260302144136.png]]

---

### 1. 安装插件
执行以下命令安装持久化插件：
```bash
flutter pub add shared_preferences
```

### 2. 封装 TokenManager 对象
**文件路径：** `lib/stores/TokenManager.dart`
```dart
import 'package:hm_shop/constants/index.dart';  
import 'package:shared_preferences/shared_preferences.dart';  
  
class TokenManager {  
  // 初始化token  
  // 返回持久化对象的实例对象  
  Future<SharedPreferences> _getInstance() {  
    return SharedPreferences.getInstance();  
  }  
  
  String _token = '';  
  Future<void> init() async {  
    final prefs = await _getInstance();  
    _token = prefs.getString(GlobalConstants.TOKEN_KEY) ?? "";  
  }  
  
  // 设置token  
  Future<void> setToken(String val) async {  
    // 1.获取持久化实例  
    final prefs = await _getInstance();  
    prefs.setString(GlobalConstants.TOKEN_KEY, val); // token写入到持久化 磁盘  
    _token = val;  
  }  
  
  // 获取token  
  String getToken() {  
    return _token;  
  }  
  
  // 删除token  
  Future<void> removeToken() async {  
    final prefs = await _getInstance();  
    prefs.remove(GlobalConstants.TOKEN_KEY); // 磁盘  
    _token = ""; // 内存  
  }  
}  
  
final tokenManager = TokenManager();
```

### 3. 登录成功写入 Token
![[Pasted image 20260302144544.png]]

### 4. 封装获取用户信息 API
![[Pasted image 20260302144753.png]]

### 5. Dio 拦截器注入 Token
**文件路径：** `lib/utils/dioRequest.dart`
```dart
// 注入token request headers Authorization = "Bearer token"  
if (tokenManager.getToken().isNotEmpty) {  
  request.headers = {  
    "Authorization": "Bearer ${tokenManager.getToken()}",  
  };  
}
```
![[Pasted image 20260302145024.png]]

### 6. 主页初始化获取用户信息
![[Pasted image 20260302145159.png]]

### 7. 我的页面 Getx 调整为 find 方式
![[Pasted image 20260302145212.png]]
