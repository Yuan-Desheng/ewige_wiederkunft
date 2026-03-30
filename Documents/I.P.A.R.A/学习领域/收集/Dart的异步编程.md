---
createTime: 2026-02-16 18:38
笔记ID: 20260216183817
multiFile:
multiMedia:
description: 整理 Dart 语言的异步编程核心概念，包括事件循环机制、Future 的使用、async/await 语法糖以及微任务和事件队列的区别。
笔记类型: 技术笔记
阐述日期: 2026-02-16
tags:
  - Dart
  - 异步
  - Future
  - async
  - await
aliases:
  - Dart Async Programming
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Dart.canvas|Dart]]"
---

## Dart的异步编程
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

### 1. Dart的单线程与事件循环
*   **背景**：Dart 是一种单线程语言，意味着在任何给定时刻，它只能执行一个操作。如果遇到耗时操作（如网络请求、文件读写），程序会“阻塞”，等待该操作完成，导致应用无响应。
*   **解决方案**：为了解决这个问题，Dart 采用**事件循环（Event Loop）**机制来处理异步操作。
*   **事件循环简述**：
    1.  首先执行所有的同步代码。
    2.  同步代码执行完毕后，检查**微任务队列（Microtask Queue）**，并执行其中所有的微任务。
    3.  然后，从**事件队列（Event Queue）**中取出一个事件并处理。处理完后，回到第2步，重复循环。

---
### 2. `Future` 与 `.then()`
*   **定义**：`Future` 对象代表一个异步操作的最终结果。它像一个“未来才会有的值”的占位符。
*   **三种状态**：
    1.  **Uncompleted**：未完成，异步操作正在进行中。
    2.  **Completed with a value**：操作成功完成，并返回一个值。
    3.  **Completed with an error**：操作失败，并抛出一个错误或异常。
*   **处理 `Future`**：
    *   `.then((value) { ... })`：用于注册一个回调函数，当 `Future` 成功完成时，该函数会被调用，并接收 `Future` 的结果作为参数。
    *   `.catchError((error) { ... })`：用于处理 `Future` 失败时的情况。
    *   **链式调用**：多个 `.then()` 可以链接在一起，形成一个异步任务链，前一个 `.then()` 的返回值会传递给后一个 `.then()`。

```dart
void main() {
  print("开始执行 main 函数");

  // 创建一个 Future
  Future<String> future = Future.delayed(Duration(seconds: 2), () {
    // return "异步操作成功";
    throw Exception("异步操作失败");
  });

  // 使用 then 和 catchError 处理 Future
  future.then((value) {
    print("Future 成功: $value");
  }).catchError((error) {
    print("Future 失败: $error");
  });

  print("main 函数执行完毕"); // 这句会先于 Future 的结果被打印
}
```

---
### 3. `async` 和 `await`
*   **定义**：`async` 和 `await` 是 Dart 提供的用于编写异步代码的语法糖，它能让异步代码看起来像同步代码一样直观。
*   **关键字**：
    *   `async`：用于标记一个函数是异步函数。异步函数的返回值总是一个 `Future`。
    *   `await`：必须在 `async` 函数内部使用。它会“暂停”函数的执行，直到它后面的 `Future` 完成，然后返回 `Future` 的结果。
*   **错误处理**：可以使用标准的 `try-catch` 语句来捕获 `await` 等待的 `Future` 中可能发生的异常。

```dart
void main() async {
  print("开始获取用户数据...");
  await fetchUserData();
  print("所有任务完成。");
}

Future<void> fetchUserData() async {
  try {
    // 使用 await 等待一个耗时2秒的 Future 完成
    String userData = await Future.delayed(Duration(seconds: 2), () {
      return "用户数据: Alice";
      // throw "网络请求超时"; // 可以取消注释来测试错误情况
    });
    
    // 只有在 await 成功后，才会执行这里的代码
    print(userData);

  } catch (error) {
    // 如果 Future 失败，会在这里捕获到错误
    print("捕获到错误: $error");
  }
}
```

---
### 4. 微任务与事件队列
*   **事件队列（Event Queue）**：包含所有外部事件，如 I/O 操作、绘图事件、定时器、`Future` 等。
*   **微任务队列（Microtask Queue）**：用于处理非常短、需要在当前事件循环结束前立即执行的异步任务。它的优先级高于事件队列。
*   **执行顺序**：事件循环总是先清空整个微任务队列，然后再去事件队列中取下一个事件。
*   **创建微任务**：可以使用 `Future.microtask()` 来向微任务队列添加一个任务。

```dart
void main() {
  print("1. main start");

  Future(() => print("4. Event: Future")); // 添加到事件队列

  Future.microtask(() => print("3. Microtask: Future.microtask")); // 添加到微任务队列

  print("2. main end");
}

// 输出顺序:
// 1. main start
// 2. main end
// 3. Microtask: Future.microtask (微任务队列优先执行)
// 4. Event: Future (事件队列后执行)
```
