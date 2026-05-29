---
createTime: 2026-03-02 14:22
笔记ID: 20260302142214
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

## Getx 共享用户数据

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="10" max="100" style="width: 100%;"></progress>

### Getx 用法总结
1. **安装插件**：安装 `get` 插件。
2. **定义控制器**：定义一个继承 `GetxController` 的对象。
3. **共享属性**：在对象中定义需要共享的属性。
4. **响应式更新**：数据需要响应式更新时，给初始值以 `.obs` 结尾。
5. **UI 显示**：UI 显示 Getx 数据需使用 `Obx` 包裹函数。
6. **使用动作**：UI 中使用 Getx 需要 `put` 和 `find` 动作。
7. **顺序要求**：必须先 `put` 一次，才可以 `find`。
8. **次数限制**：`put` 仅需一次，`find` 可多次。

**安装命令**：`flutter pub add get`

![[Pasted image 20260302141734.png]]

---

### 1. 定义 UserController 对象
**文件路径**：`lib/stores/UserController.dart`
```dart
import 'package:get/get.dart';  
import 'package:hm_shop/viewmodels/user.dart';  
  
// 需要共享的对象，包含一些共享的属性，属性需要响应式更新  
class UserController extends GetxController {  
  var user = UserInfo.fromJSON({}).obs; // user 对象被监听了  
  
  // 想要取值的话需要 user.value  
  updateUserInfo(UserInfo newUser) {  
    user.value = newUser;  
    user.refresh(); // 强制触发监听器  
  }  
}
```

### 2. 在 MineView 中 put 控制器
![[Pasted image 20260302143330.png]]

### 3. 登录成功 find 控制器并更新数据
**文件路径**：`lib/pages/login/index.dart`
```dart
_login() async {  
  // 调用登录接口  
  try {  
    LoadingDialog.show(context, message: "努力登录中");  
    final res = await loginAPI({  
      "account": _phoneController.text,  
      "password": _codeController.text,  
    });  
    // print(res); // 用户信息  
    _userController.updateUserInfo(res);  
    tokenManager.setToken(res.token); // 写入持久化数据  
    LoadingDialog.hide(context);  
    ToastUtils.showToast(context, "登录成功");  
    Navigator.pop(context); // 返回上个页面  
  } catch (e) {  
    LoadingDialog.hide(context);  
    ToastUtils.showToast(context, (e as DioException).message);  
  }  
  // 此时一定登录成功  
  // http 状态码 2xx 业务状态码 业务执行成功 1
}
```
