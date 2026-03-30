---
createTime: <% tp.file.creation_date() %>
笔记ID: <% tp.date.now("YYYYMMDDHHmmss") %>
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

##  Dart的类
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>
### 1. 类的定义与实例化
*   **定义**：类（Class）是对象的蓝图，它定义了对象的属性（状态）和方法（行为）。
*   **语法**：
    ```dart
    class ClassName {
      // 属性 (Instance variables)
      // 方法 (Methods)
    }
    ```
*   **实例化**：使用类名和括号 `()` 创建类的实例（对象），可通过 `new` 关键字（在Dart 2中可选）。

```dart
void main() {
  // 使用 Person() 创建一个 Person 对象
  var p1 = Person(); 
  
  // 设置对象的属性
  p1.name = "Alice";
  
  // 调用对象的方法
  p1.study(); // 输出: Alice在学习
}

class Person {
  String? name;
  int? age;

  void study() {
    print('$name在学习');
  }
}
```

---
### 2. 构造函数
*   **定义**：一种特殊的函数，用于在创建对象时初始化其属性。
*   **默认构造函数**：
    *   函数名与类名相同。
    *   **语法糖**：可以使用 `this.` 语法直接在参数列表中为属性赋值，非常便捷。
*   **命名构造函数**：
    *   允许为一个类提供多个构造函数，以提供不同的创建方式。
    *   **语法**：`ClassName.identifier(parameters)`

```dart
void main() {
  // 使用默认构造函数（语法糖形式）
  var p1 = Person("Bob", 25);
  p1.study(); // 输出: Bob在学习

  // 使用命名构造函数
  var p2 = Person.fromBirthYear("Charlie", 1995);
  print("${p2.name} 的年龄是 ${p2.age}"); // 输出: Charlie 的年龄是 31
}

class Person {
  String name;
  int age;

  // 默认构造函数（语法糖形式）
  Person(this.name, this.age);

  // 命名构造函数
  Person.fromBirthYear(this.name, int birthYear)
      : age = DateTime.now().year - birthYear;

  void study() {
    print('$name在学习');
  }
}
```

---
### 3. 私有成员与 Getter/Setter
*   **私有成员**：在Dart中，通过在变量或方法名前添加下划线 `_` 来将其标记为私有。私有成员只能在其定义的库（`.dart`文件）内部访问。
*   **Getter/Setter**：提供对对象属性的读（`get`）和写（`set`）的控制。这允许你添加逻辑，例如验证或计算。

```dart
void main() {
  var emp = Employee("David");
  // emp._name = "Eve"; // 错误：无法从外部访问私有成员

  emp.name = "Frank"; // 使用 setter
  print(emp.name);    // 使用 getter，输出: Frank
}

class Employee {
  String _name; // 私有属性

  Employee(this._name);

  // Getter：允许外部读取 _name
  String get name {
    return _name;
  }

  // Setter：允许外部以受控的方式修改 _name
  set name(String value) {
    _name = value;
  }
}
```

---
### 4. 继承 (`extends`)
*   **定义**：一个类（子类）可以继承另一个类（父类）的属性和方法，实现代码复用。Dart是单继承的。
*   **关键字**：
    *   `extends`：用于声明继承关系。
    *   `super`：用于调用父类的构造函数、属性或方法。
    *   `@override`：表示子类的方法正在重写父类的同名方法。

```dart
void main() {
  var student = Student("Grace", "10A");
  student.display(); // 调用子类重写的方法
}

// 父类
class Person {
  String name;
  Person(this.name);

  void display() {
    print("Name: $name");
  }
}

// 子类继承父类
class Student extends Person {
  String grade;

  // 使用 super 调用父类的构造函数
  Student(String name, this.grade) : super(name); 

  @override // 重写父类的方法
  void display() {
    super.display(); // 可以选择性地调用父类的方法
    print("Grade: $grade");
  }
}
```

---
### 5. 抽象类 (`abstract class`)
*   **定义**：不能被直接实例化的类，通常用作其他类的基类。它可以包含已实现的方法和未实现的抽象方法。
*   **抽象方法**：只有方法签名，没有方法体的方法。子类必须实现所有抽象方法。

```dart
void main() {
  // var shape = Shape(); // 错误：抽象类不能被实例化
  var circle = Circle(10);
  print(circle.area); // 输出: 314.159...
}

abstract class Shape {
  // 抽象方法，没有方法体
  double get area; 
}

class Circle extends Shape {
  double radius;
  Circle(this.radius);

  @override // 必须实现父类的抽象方法
  double get area => 3.1415926535 * radius * radius;
}
```

---
### 6. 接口 (`implements`)
*   **定义**：在Dart中，没有专门的 `interface` 关键字。任何 `class` 或 `abstract class` 都可以作为接口。当一个类实现一个接口时，它必须提供接口中所有方法的具体实现。
*   **关键字**：`implements`

```dart
void main() {
  var tv = Television();
  tv.turnOn();  // 输出: TV turned on
  tv.turnOff(); // 输出: TV turned off
}

// 定义一个接口（使用抽象类）
abstract class Device {
  void turnOn();
  void turnOff();
}

// Television 类实现 Device 接口
class Television implements Device {
  @override
  void turnOn() {
    print("TV turned on");
  }

  @override
  void turnOff() {
    print("TV turned off");
  }
}
```

---
### 7. 混入 (`mixin`)
*   **定义**：一种在多个类层次结构中复用代码的方式。当你想为一个类添加某些行为，但又不想使用继承时，`mixin` 非常有用。
*   **关键字**：
    *   `mixin`：用于定义一个混入。
    *   `with`：用于将一个或多个混入应用到一个类中。

```dart
void main() {
  var duck = Duck();
  duck.swim(); // 来自 Swimmer mixin
  duck.fly();  // 来自 Flyer mixin
}

mixin Swimmer {
  void swim() {
    print("Swimming");
  }
}

mixin Flyer {
  void fly() {
    print("Flying");
  }
}

// Duck 类使用了 Swimmer 和 Flyer 的能力
class Duck with Swimmer, Flyer {}
```

---
### 8. 泛型 (`<T>`)
*   **定义**：允许在定义类、方法或集合时使用类型参数，从而提供类型安全，同时保持代码的灵活性。
*   **应用**：
    *   **泛型集合**：如 `List<String>` 确保列表只包含字符串。
    *   **泛型方法**：使方法可以处理多种类型。
    *   **泛型类**：创建可容纳不同类型数据的容器类。

```dart
void main() {
  // 泛型集合
  var names = <String>["Heidi", "Ivy"];
  // names.add(123); // 错误：不能向 List<String> 中添加整数

  // 泛型方法
  String middleName = getMiddle(names);
  print(middleName); // 输出: Heidi

  // 泛型类
  var box = Box<int>();
  box.put(100);
  print(box.get()); // 输出: 100
}

// 泛型方法
T getMiddle<T>(List<T> items) {
  return items.first;
}

// 泛型类
class Box<T> {
  late T _content;

  void put(T item) {
    _content = item;
  }

  T get() {
    return _content;
  }
}
```

