---
createTime: 2026-02-16 18:21
笔记ID: 20260216182127
multiFile:
multiMedia:
description: 整理 Dart 语言中关于函数的知识，包括函数的定义、返回值、各类参数（必传、可选位置、可选命名）以及匿名函数和箭头函数的用法。
笔记类型: 技术笔记
阐述日期: 2026-02-16
tags:
  - Dart
  - 函数
aliases:
  - Dart Functions
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
---

## Dart的函数
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

### 1. 函数定义与返回值
*   **定义**：在Dart语言中，函数是用于组织和复用代码的核心单元。
*   **返回值分类**：
    *   **有返回值**：在函数名前声明返回的具体类型，如 `int`、`String` 等。
    *   **无返回值**：使用 `void` 关键字声明，表示函数不返回任何值。
*   **语法**：`返回类型 函数名(参数列表) { 函数体 }`
*   **注意**：
    *   如果省略返回值类型，Dart 会自动推断其类型为 `dynamic`。
    *   为了代码清晰和可维护性，**推荐明确声明返回值类型**。

```dart
void main(List<String> args) {  
  print(add(1, 2)); // 调用有返回值的函数
  printUserInfo();    // 调用无返回值的函数
  print(getDynamicValue()); // 调用省略返回值类型的函数
}  
  
// 有返回值：返回类型为 int
int add(int a, int b) {  
  return a + b;  
}  
  
// 无返回值：void
void printUserInfo() {  
  print("这是一个无返回值的函数");  
}  
  
// 省略返回值类型（不推荐）
getDynamicValue() {  
  return "hello world";
}
```

---
### 2. 必传参数
*   **定义**：在调用函数时必须传递的参数。
*   **语法**：`函数名(类型 参数1, 类型 参数2, ...)`
*   **特点**：参数按顺序定义，调用时也必须按顺序传递，且不能为空。

```dart
void main(List<String> args) {
  // 必须按顺序传递所有必传参数
  print(getUserInfo("Alice", 25)); 
}

// name 和 age 都是必传参数
String getUserInfo(String name, int age) {
  return "姓名: $name, 年龄: $age";
}
```

---
### 3. 可选位置参数
*   **定义**：可以根据需要选择性传递的参数，通过参数的位置来识别。
*   **语法**：`函数名(必传参数, [可选参数1, 可选参数2, ...])`
*   **特点**：
    *   必须位于所有必传参数之后，并用中括号 `[]` 包裹。
    *   调用时，参数按顺序传递。
    *   可以为可选参数提供默认值，使用 `=` 赋值。

```dart
void main(List<String> args) {
  print(combine("a")); // 使用默认值 "b", "c"
  print(combine("a", "B")); // 覆盖第一个可选参数
  print(combine("a", "B", "C")); // 传递所有参数
}

// b 和 c 是可选位置参数，并带有默认值
String combine(String a, [String b = "b", String c = "c"]) {
  return a + b + c;
}
```

---
### 4. 可选命名参数
*   **定义**：通过名称来传递的可选参数，使函数调用更具可读性。
*   **语法**：`函数名(必传参数, {可选参数1, 可选参数2, ...})`
*   **特点**：
    *   必须位于所有必传参数之后，并用大括号 `{}` 包裹。
    *   调用时，通过 `参数名: 值` 的方式传递，无需关心顺序。
    *   非常适用于参数较多或含义不直观的函数。
    *   同样可以设置默认值。

```dart
void main(List<String> args) {
  // 只传递必传参数，可选参数使用默认值
  showPerson("老高"); 
  // 按名称传递部分可选参数，顺序随意
  showPerson("Alice", sex: "女", age: 30);
}

// age 和 sex 是可选命名参数，并带有默认值
void showPerson(String username, {int age = 18, String sex = "男"}) {
  print('姓名：$username, 年龄: $age, 性别： $sex');
}
```

---
### 5. 匿名函数
*   **定义**：没有函数名称的函数，通常用于作为参数传递或赋值给变量。
*   **语法**：`(参数列表) { 函数体 }`
*   **应用**：常用于 `forEach` 循环或需要回调函数的场景。

```dart
void main(List<String> args) {
  // 1. 将匿名函数赋值给一个变量
  var printMessage = () {
    print("这是一个匿名函数");
  };
  printMessage(); // 调用

  // 2. 作为参数传递给另一个函数
  List<String> names = ["Alice", "Bob", "Charlie"];
  names.forEach((name) {
    print("你好, $name");
  });
}
```

---
### 6. 箭头函数
*   **定义**：`当函数体只有一行代码时，可以使用箭头语法 `=>` 来简化函数。`
*   **语法**：`返回类型 函数名(参数) => 表达式;`
*   **特点**：
    *   箭头 `=>` 右侧必须是一个表达式，其计算结果会自动作为函数返回值。
    *   使用箭头函数时，可以省略 `{}` 和 `return` 关键字。

```dart
void main(List<String> args) {
  print(add(1, 2));
}

// 普通函数
// int add(int a, int b) {
//   return a + b;
// }

// 使用箭头函数简化
int add(int a, int b) => a + b;
```
