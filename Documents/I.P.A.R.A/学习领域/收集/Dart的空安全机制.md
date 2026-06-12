---
createTime: 2026-02-13 11:04
笔记ID: 20260213110412
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - Dart
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
---

##  Dart的空安全机制
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

### 1. 什么是空安全 (Null Safety)
*   **定义**：Dart 语言通过编译时静态检查，确保变量在被使用前不能为 `null`。这可以将潜在的空指针异常从运行时提前到编译时发现。
*   **特点**：
    *   **减少运行时错误**：将空指针异常从运行时提前至编译时，显著减少线上崩溃。
    *   **提高代码健壮性**：强制开发者在编写代码时处理 `null` 的可能性，使代码更可靠。
    *   **优化性能**：编译器可以更好地优化代码，因为无需在运行时检查 `null`。

---
### 2. 默认非空 (Non-nullable by Default)
*   **核心概念**：在开启空安全的 Dart 中，所有类型默认都是非空的。这意味着你不能将 `null` 值赋给一个非空的变量，除非你明确声明该变量为可空类型。
*   **示例**：

```dart
void main() {
  int a = 10;
  // a = null; // 编译时报错：A value of type 'Null' can't be assigned to a variable of type 'int'.
  print(a);
}
```
---
### 3. 可空类型 (Nullable Types)
*   **核心概念**：如果你需要一个变量可以持有 `null` 值，你必须通过在类型后面添加 `?` 来明确声明它为可空类型。
*   **示例**：

```dart
void main() {
  int? nullableInt = null; // 声明一个可空的整型变量
  print(nullableInt);

  String? nullableString; // 可空的字符串变量，默认值为 null
  print(nullableString);

  nullableString = "Hello Null Safety";
  print(nullableString);
}
```
---
### 4. 空感知操作符 (Null-aware Operators)
*   **核心概念**：Dart 提供了一系列操作符，用于安全地处理可空类型，避免不必要的 `null` 检查和潜在的运行时错误。

#### 4.1. 安全访问 (?. )
*   **作用**：当对象可能为 `null` 时，用于安全地访问其成员（属性或方法）。如果对象为 `null`，则整个表达式的结果为 `null`，而不会抛出 `NoSuchMethodError`。
*   **示例**：

```dart
class User {
  String name;
  User(this.name);
}

void main() {
  User? user1 = User('Alice');
  print(user1?.name); // 输出: Alice

  User? user2 = null;
  print(user2?.name); // 输出: null (不会报错)
}
```
---
#### 4.2. 非空断言 (!. )
*   **作用**：当你作为开发者确信一个可空变量在特定时刻绝不为 `null` 时，可以使用 `!` 操作符将其“断言”为非空。如果该变量在运行时确实为 `null`，则会抛出 `Null check operator used on a null value` 的运行时错误。
*   **⚠️ 注意**：这是一个危险的操作符，只在你万分确定变量非空时使用，否则应优先考虑其他空感知操作符。
*   **示例**：

```dart
void main() {
  String? name = 'Bob';
  print(name!.length); // 开发者断言 name 非空，输出 3

  String? nullableName;
  // print(nullableName!.length); // 运行时错误：Null check operator used on a null value
}
```
---
#### 4.3. 空合并 (??)
*   **作用**：如果 `??` 左侧的表达式非 `null`，则返回左侧表达式的值；否则返回 `??` 右侧表达式的值。这提供了一种为可空值设置默认值的简洁方式。
*   **示例**：

```dart
void main() {
  String? username;
  String displayName = username ?? 'Guest'; // username 为 null，使用 'Guest'
  print(displayName); // 输出: Guest

  String? realUsername = 'Alice';
  String realDisplayName = realUsername ?? 'Guest'; // realUsername 非 null，使用 'Alice'
  print(realDisplayName); // 输出: Alice
}
```
---
#### 4.4. 空合并赋值 (??=)
*   **作用**：如果变量当前为 `null`，则将其赋值为 `??=` 右侧的表达式的值；否则变量保持不变。这提供了一种为可空变量进行懒初始化或设置默认值的便捷方式。
*   **示例**：

```dart
void main() {
  String? message;
  message ??= 'Default Message'; // message 为 null，赋值 'Default Message'
  print(message); // 输出: Default Message

  message ??= 'Another Message'; // message 已非 null，保持不变
  print(message); // 输出: Default Message

  int? count;
  count ??= 0; // count 为 null，赋值 0
  print(count); // 输出: 0
}
```
---
### 5. late 关键字
*   **作用**：`late` 关键字有两个主要用途：
    1.  **延迟初始化非空变量**：当你声明一个非空变量，但不能在声明时立即初始化它，而你知道它在使用前一定会被初始化时，可以使用 `late`。这允许你避免编译器错误，同时保持变量的非空性。
    2.  **懒加载**：对于一些计算成本较高的变量，你可能希望只在第一次使用时才进行初始化。`late` 变量支持这种懒加载行为。
*   **应用场景**：
    *   **循环依赖**：例如，A 依赖 B，B 依赖 A，可以在其中一个使用 `late`。
    *   **初始化时机不明**：变量在构造函数体中，或者在 setter 中初始化。
    *   **性能优化**：只在需要时才创建对象。
*   **示例**：

```dart
class MyClass {
  late String description; // 声明一个 late 非空字符串

  MyClass() {
    // 可以在构造函数体中初始化 late 变量
    description = 'My description is set later.';
  }

  void printDescription() {
    print(description); // 在使用前确保 description 已被初始化
  }
}

late String globalMessage = _longInitialization(); // late 用于懒加载全局变量

String _longInitialization() {
  print('Performing long initialization...');
  return 'Global message initialized.';
}

void main() {
  var obj = MyClass();
  obj.printDescription(); // 输出: My description is set later.

  print(globalMessage); // 第一次访问时才执行 _longInitialization()
}
```
---
### 6. required 关键字
*   **作用**：在 Dart 中，`required` 关键字用于标记命名参数是强制性的。当一个方法或构造函数有命名参数时，这些参数默认是可选的，除非它们被 `required` 标记。在空安全的环境下，`required` 结合非空类型使用尤其重要，确保在对象创建时这些非空字段被赋值。
*   **示例**：

```dart
class Person {
  String name;
  int age;

  // 使用 required 关键字，使 name 和 age 成为强制性的命名参数
  Person({required this.name, required this.age});

  void greet() {
    print('Hello, my name is $name and I am $age years old.');
  }
}

void main() {
  // 必须提供 name 和 age 参数
  var person1 = Person(name: 'Alice', age: 30);
  person1.greet(); // 输出: Hello, my name is Alice and I am 30 years old.

  // var person2 = Person(name: 'Bob'); // 编译时报错：The named parameter 'age' is required.
}
```
---
### 7. 类型提升 (Type Promotion)
*   **核心概念**：Dart 的静态分析能够智能地判断，在经过 `null` 检查之后，一个可空类型的变量在特定的代码块内实际上不可能为 `null`，从而将其类型“提升”为非空类型。这使得你可以在无需使用 `!` 非空断言的情况下，安全地访问其成员。
*   **示例**：

```dart
void main() {
  String? message = 'Hello Dart';

  if (message != null) {
    // 在这个 if 块内，Dart 知道 message 不为 null，
    // 因此将其类型从 String? 提升为 String。
    print(message.length); // 可以安全地访问 length 属性
  }

  // 另一种类型提升的场景
  Object name = 'Alice';
  if (name is String) {
    // 在这个 if 块内，name 的类型从 Object 提升为 String。
    print(name.length);
  }

  String? greeting;
  // 模拟从外部获取一个值
  bool fetched = true; // 假设从外部获取到了值
  if (fetched) {
    greeting = "Welcome!";
  }

  // 类型提升也适用于局部变量
  if (greeting != null) {
    print("Greeting length: ${greeting.length}");
  }
}
```
---

