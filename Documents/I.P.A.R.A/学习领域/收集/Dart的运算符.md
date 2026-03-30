---
createTime: 2026-02-14 15:24
笔记ID: 20260214152500
multiFile:
multiMedia:
description: 整理并补充Dart语言中的各类运算符，包括算术、赋值、关系、逻辑、条件、级联及类型判断等，并为每种运算符提供清晰的代码示例。
笔记类型: 技术笔记
阐述日期: 2026-02-14
tags:
  - Dart
  - 运算符
aliases:
  - Dart Operators
cssclasses:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
---
## Dart的运算符
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

### 1. 算术运算符
*   **应用场景**：对数字进行加减乘除运算。
*   **常用运算符**：
    *   `+` - 加
    *   `-` - 减
    *   `*` - 乘
    *   `/` - 除
    *   `~/` - 整除
    *   `%` - 取余数

```dart
void main(List<String> args) {  
  double item = 10.99;  
  double allPrice = item * 4;  
  double money = 100;  
  double lastMoney = money - allPrice;  
  // double everyMoney = lastMoney / 4;  
  int everyMoney = lastMoney ~/ 4;  
  print(everyMoney);  
  print(10 % 4);  
}
```

---
### 2. 赋值运算符
*   **应用场景**：对数据进行赋值运算。
*   **常用运算符**：
    *   `=` - 赋值操作
    *   `+=` - 加等，a += b 相等于 a = a + b
    *   `-=` - 减等, a -= b 相等于 a = a - b
    *   `*=` - 乘等, a *= b 相等于 a = a * b
    *   `/=` - 除等, a /= b 相等于 a = a / b

```dart
void main(List<String> args) {
  double a = 1;  
  a += 2; // a = a + 2  
  print(a);  
  a -= 1; //  a = a - 1  
  print(a);  
  a *= 2; // a = a * 2  
  print(a);  
  a /= 2; // a = a / 2;  
  print(a);  
}
```

---
### 3. 关系运算符
*   **应用场景**：对数值进行比较操作，结果是布尔类型。
*   **常用运算符**：
    *   `==` - 判断两个值是否相等
    *   `!=` - 判断两个值是否不等
    *   `>` - 判断左侧值是否大于右侧值
    *   `>=` - 判断左侧值是否大于等于右侧值
    *   `<` - 判断左侧值是否小于右侧值
    *   `<=` - 判断左侧值是否小于等于右侧值

```dart
void main(List<String> args) {  
  int a = 1;  
  int b = 2;  
  print(a == b);  
  print(a != b);  
  print(a > b);  
  print(a >= b);  
  print(a < b);  
  print(a <= b);  
}
```

---
### 4. 逻辑运算符
*   **应用场景**：对于bool类型的值进行逻辑运算。
*   **注意**：使用逻辑运算符必须保证参与的变量为布尔类型。
*   **常用运算符**：
    *   `&&` - 逻辑与，a && b, a和b同时true，得true
    *   `||` - 逻辑或，a || b，a和b有一个true，得true
    *   `!` - 逻辑非，!a，对a变量进行取反

```dart
void main(List<String> args) {  
  // 逻辑运算符  
  bool isOpenDoor = false; // 是否开门  
  bool isOpenLight = true; // 是否开灯  
  
  // 门和灯同时打开  
  print(isOpenDoor && isOpenLight);  
  print(isOpenDoor || isOpenLight); // 门和灯至少打开一个  
  print(!isOpenDoor);  
  print(!isOpenLight);  
}
```
