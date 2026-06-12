---
createTime: 2026-02-16 18:12
笔记ID: 20260216181235
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
## Dart的流程控制
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

### 1. If-Else 语句
*   **应用场景**：根据一个或多个布尔条件来执行不同的代码逻辑。
*   **核心语法**：
    *   **单分支**：`if (condition) { ... }`
    *   **双分支**：`if (condition) { ... } else { ... }`
    *   **多分支**：`if (condition1) { ... } else if (condition2) { ... } else { ... }`

```dart
void main(List<String> args) {  
  int score = 81;  

  // 单分支：单个条件判断
  if (score > 60) {  
    print("恭喜你及格");  
  }  

  // 双分支：两个条件判断
  bool isMarry = false;  
  if (isMarry) {  
    print("恭喜你成家");  
  } else {  
    print("还没结婚哦");  
  }  
  
  // 多分支：多个条件判断
  if (score > 80) {  
    print("优秀");  
  } else if (score >= 60) {  
    print("及格");  
  } else {  
    print("不及格");  
  }  
}
```

---
### 2. 三元运算符
*   **应用场景**：`if-else` 双分支语句的简化形式，用于根据条件在两个表达式中选择一个。
*   **核心语法**：`condition ? expression1 : expression2;`
*   **特点**：如果 `condition` 为 `true`，表达式的值为 `expression1`；否则，为 `expression2`。

```dart
void main(List<String> args) {
  int score = 59;
  String result = score >= 60 ? "及格" : '不及格';
  print(result);
}
```

---
### 3. Switch-Case 语句
*   **应用场景**：当有多个固定值需要匹配时，作为 `if-else if` 的替代方案，使代码更清晰。
*   **核心语法**：
    ```dart
    switch (variable) {
      case value1:
        // code
        break;
      case value2:
        // code
        break;
      default:
        // code
    }
    ```
*   **特点**：
    *   每个 `case` 语句必须以 `break`、`continue`、`throw` 或 `return` 结束。
    *   `default` 子句是可选的，用于处理所有其他未匹配的情况。

```dart
void main(List<String> args) {  
  int state = 3; // 1:待付款 2:待发货 3:待收货 4:待评价
  switch (state) {  
    case 1:  
      print("待付款");  
      break;  
    case 2:  
      print("待发货");  
      break;  
    case 3:  
      print("待收货");  
      break;  
    case 4:  
      print("待评价");  
      break;  
    default:  
      print("未知状态");  
  }  
}
```

---
### 4. While 循环
*   **应用场景**：当循环次数不确定，但循环继续的条件很明确时使用。
*   **核心语法**：`while (condition) { ... }`
*   **特点**：在每次循环开始前检查条件。如果条件为 `true`，则执行循环体。
*   **循环控制**：
    *   `break`：立即终止并跳出整个循环。
    *   `continue`：跳过当前迭代的剩余部分，并开始下一次迭代。

```dart
void main(List<String> args) {  
  List foods = ["第一个包子", "第二个包子", "第三个包子", "第四个包子", "第五个包子"];  
  int index = 0;  
  while (index < foods.length) {  
    if (index == 2) { // 假设第三个包子不吃
      index += 1;  
      continue; // 跳过当前迭代
    }  
    print("正在吃: ${foods[index]}");  
    index += 1;  
  }  
}
```

---
### 5. For 循环
*   **应用场景**：当循环次数已知时，常用于遍历一个集合或执行固定次数的操作。
*   **核心语法**：`for (initialization; condition; increment) { ... }`
*   **特点**：集初始化、条件检查和增量/减量于一体，结构清晰。
*   **循环控制**：同样支持 `break` 和 `continue`。

```dart
void main(List<String> args) {  
  List foods = ["第一个包子", "第二个包子", "第三个包子", "第四个包子", "第五个包子"];  
  for (var i = 0; i < foods.length; i++) {  
    if (i == 2) { // 假设吃到第三个就饱了
      print("吃饱了，不吃了");
      break; // 跳出整个循环
    }  
    print("正在吃: ${foods[i]}");  
  }  
}
```
