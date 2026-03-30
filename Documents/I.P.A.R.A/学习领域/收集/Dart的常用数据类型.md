---
createTime: 2026-02-13 10:33
笔记ID: 20260213103330
multiFile:
multiMedia:
description:
笔记类型:
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
---

##  Dart的常用数据类型
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

### 1. 字符串 (String)
*   **应用场景**：存储文本数据，如描述、名称、消息等。
*   **关键字**：`String`
*   **核心语法**：`String 变量名 = '文本内容';` 或 `String 变量名 = "文本内容";`
*   **特点**：
    *   支持使用单引号 (`'`) 或双引号 (`"`) 定义字符串。
    *   支持字符串拼接。
    *   **模板字符串 (Interpolation)**：
        *   使用 `${变量名}` 或 `$变量名` 将变量值直接嵌入字符串。
        *   当嵌入内容是简单变量时，可使用 `$变量名`。
        *   当嵌入内容是表达式或需要明确边界时，**推荐使用 `${表达式}`**。

```dart
void main(List<String> args) {  
  String text = "今天是个好日子"; // 是个变量 var  print(text);  
  text = "明天同样是个好日子";  
  print(text);  
  // 我要在当前的时间吃饭  
  String content = '我要在${DateTime.now()}吃饭';  
  print(content);  
  String flag = "张三";  
  String content1 = '我和$flag是好朋友';  
  print(content1);  
}
```

---
### 2. 数字类型 (int, num, double)
*   **应用场景**：表示数值数据，如计数、价格、测量值等。
*   **关键字**：`int`, `num`, `double`
*   **核心特点**：
    *   `int`：表示整数，如 `1`, `100`, `-5`。
    *   `double`：表示双精度浮点数（小数），如 `1.0`, `3.14`, `-0.5`。
    *   `num`：是 `int` 和 `double` 的父类，可以表示整数或小数。当你不确定变量是整数还是小数时，可以使用 `num`。
    *   **赋值关系注意**：`double` 和 `int` 不能直接相互赋值（需要显式转换）；`num` 不能直接赋值给 `double`；`double` 可以直接赋值给 `num`。

```dart
void main(List<String> args) {  
  // int  
  // num  
  // double  
  int friendCount = 3;  
  print('我有$friendCount个朋友');  
  num rest = 1.5;  
  print('我有$rest月的假期');  
  double appleCount = 1.5;  
  print('我买了$appleCount斤苹果');  
  //friendCount = appleCount; // 不允许直接赋值  
  //friendCount = appleCount.toInt();  
  appleCount = friendCount.toDouble();  
  appleCount = rest.toDouble(); // num可以转化成double给double赋值  
  rest = appleCount; // double可以直接给num赋值  
}
```

---
### 3. 布尔类型 (bool)
*   **应用场景**：表示逻辑真/假状态，常用于条件判断。
*   **关键字**：`bool`
*   **核心语法**：`bool 变量名 = true;` 或 `bool 变量名 = false;`

```dart
void main(List<String> args) {  
  bool isFinishWork = false;  
  print("同学当前的作业状态是$isFinishWork");  
  isFinishWork = true;  
  print("同学当前的作业状态是$isFinishWork");  
}
```

---
### 4. 列表类型 (List)
*   **应用场景**：存储一系列有序的值，支持查找、新增、删除、循环等操作。
*   **关键字**：`List`
*   **核心语法**：`List<类型> 变量名 = [值1, 值2, ...];` (推荐指定类型) 或 `List 变量名 = [值1, 值2, ...];`
*   **常用操作与属性**：
    *   **添加元素**：
        *   `add(内容)`：在列表尾部添加单个元素。
        *   `addAll(列表)`：在列表尾部添加另一个列表的所有元素。
    *   **删除元素**：
        *   `remove(内容)`：删除满足内容的第一个元素。
        *   `removeLast()`：删除列表的最后一个元素。
        *   `removeRange(start, end)`：删除指定索引范围内的元素（`end` 不包含在删除范围内）。
    *   **遍历**：
        *   `forEach((item) { ... })`：对列表中的每个元素执行操作。
    *   **条件检查与筛选**：
        *   `every((item) { return 布尔值 })`：检查是否所有元素都满足给定条件。
        *   `where((item) { return 布尔值 })`：筛选出满足条件的所有元素，返回一个新的可迭代对象。
    *   **属性**：
        *   `length`：列表的长度（元素数量）。
        *   `first`：列表的第一个元素。
        *   `last`：列表的最后一个元素。
        *   `isEmpty`：判断列表是否为空。

```dart
void main(List<String> args) {  
  List students = ["张三", "李四", "王五"];  
  print(students);  
  students.add("新同学"); // 在尾部进行添加  
  students.add("新同学"); // 在尾部进行添加  
  print(students);  
  students.addAll(["新来的同学1", "新来的同学2"]); // 在尾部添加一个列表  
  print(students);  
  students.remove("新同学"); // 删除满足内容的第一个  
  print(students);  
  // 删除最后一个同学  
  students.removeLast(); // 删除最后一个  
  print(students);  
  // 删除前两个同学  
  // start开始的索引 end结束的索引-不包含在删除范围内  
  students.removeRange(0, 2);  
  print(students);  
  // forEach针对每个列表每个数据进行操作  
  students.forEach((item) {  
    // 书写逻辑  
    print(item);  
  });  
  // 是不是所有的同学都以新为开头  
  print(students.every((item) {  
    return item.toString().startsWith("新"); // 返回一个条件  
  }));  
  // 筛选出所有的以新开头的同学呢  
  print(students.where((item) {  
    return item.toString().startsWith("新");  
  }).toList());  
  // List常用的一些属性 方法() .属性  
  print(students.length);  
  print(students.last); // 列表的最后一个  
  print(students.first); // 列表的第一个  
  print(students.isEmpty); // 列表是否是空的  
}
```

---
### 5. 字典类型 (Map)
*   **应用场景**：存储键值对 (key-value pairs) 数据，通过唯一的键快速查找对应的值。
*   **关键字**：`Map`
*   **核心语法**：`Map<Key类型, Value类型> 变量名 = {key1: value1, key2: value2, ...};` (推荐指定类型) 或 `Map 变量名 = {key1: value1, ...};`
*   **常用操作**：
    *   **取值与赋值**：`Map变量名[key]` 可以获取或设置对应的值。
    *   **遍历**：`forEach((key, value) { ... })`：对字典中的每个键值对执行操作。
    *   **添加**：`addAll(另一个Map)`：将另一个 Map 的所有键值对添加到当前 Map。
    *   **检查**：`containsKey(key)`：判断是否包含指定的键。
    *   **删除**：`remove(key)`：删除指定的键值对。
    *   **清空**：`clear()`：清空所有键值对。

```dart
void main(List<String> args) {  
  Map transMap = {"lunch": '午饭', "morning": "早上", "hello": '你好'};  
  print(transMap);  
  // 通过英文找到对应中文的描述  
  print(transMap["morning"]);  
  transMap["hello"] = "你非常好";  
  print(transMap["hello"]);  
  // 字典里面有很多对应关系  
  transMap.forEach((key, value) {  
    print("$key,$value");  
  });  
  // addAll 给当前字典添加一个字典  
  transMap.addAll({"fine": "非常好"});  
  print(transMap);  
  // containesKey判断字典中是否包含某个key  
  print(transMap.containsKey("fine"));  
  
  transMap.remove("fine");  
  print(transMap);  
  
// 清空字典  
  transMap.clear();  
  print(transMap);  
}
```

---
### 6. 动态类型 (dynamic)
*   **定义**：Dart 语言中，`dynamic` 用来声明动态类型。
*   **特点**：
    *   允许变量在运行时自由改变类型。
    *   绕过编译时的静态检查，即编译器不会对 `dynamic` 类型的变量进行类型检查。
    *   对 `dynamic` 类型的变量调用方法或访问属性时，不会在编译时报错，但可能在运行时出现 `NoSuchMethodError`。
*   **核心语法**：`dynamic 变量名 = 值;`

```dart
void main() {
  dynamic x = 10; // x 此时是 int
  print('x is int: $x');

  x = 'Hello';    // x 此时变为 String
  print('x is String: $x');

  x = true;       // x 此时变为 bool
  print('x is bool: $x');

  // dynamic 类型在编译时不会报错，但运行时可能出错
  // x.someMethodThatDoesNotExist(); // 运行时会抛出 NoSuchMethodError
}
```
---


---
### 7. dynamic 和 var 的区别
*   **`dynamic`**：
    *   **类型**：动态类型，允许变量在运行时自由改变类型。
    *   **编译检查**：绕过编译时的静态类型检查。
    *   **方法/属性调用**：编译时允许调用任何方法或访问任何属性，但可能在运行时抛出 `NoSuchMethodError`。
*   **`var`**：
    *   **类型**：根据初始值进行类型推断，一旦确定，类型便固定下来。
    *   **编译检查**：有编译时的静态类型检查。
    *   **方法/属性调用**：只能调用或访问推断出的类型所拥有的方法和属性。

```dart
void main() {
  // --- var 的例子 ---
  var a = 10; // var 自动推断为 int 类型
  print('var a (int): $a');
  // a = 'hello'; // 编译时报错：A value of type 'String' can't be assigned to a variable of type 'int'.
  // a.length;   // 编译时报错：The getter 'length' isn't defined for the type 'int'.

  // --- dynamic 的例子 ---
  dynamic b = 10; // dynamic 类型，不进行静态类型检查
  print('dynamic b (int): $b');
  b = 'hello';    // 允许改变类型为 String
  print('dynamic b (String): $b');
  b = true;       // 允许改变类型为 bool
  print('dynamic b (bool): $b');

  // dynamic 绕过编译时检查，但在运行时可能出错
  b.someMethodThatDoesNotExist(); // 编译时不会报错，但运行时会抛出 NoSuchMethodError
}
```

