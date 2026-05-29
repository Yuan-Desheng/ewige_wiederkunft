---
createTime: 2026-02-19 13:33
笔记ID: 20260219133353
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - 开发环境
aliases:
  - Flutter开发环境安装
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

## 安装Flutter开发环境
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 1. 环境配置与项目创建

要完成Flutter的安装、环境配置以及创建第一个项目，请参考官方文档或以下手册：
- [[Flutter从入门到实战-Flutter框架.pdf]]

## 2. Flutter工程目录结构解析

一个典型的Flutter项目包含以下文件和目录：

![[Pasted image 20260219133720.png]]

- **`.dart_tool`**: Dart工具生成的文件和缓存。
- **`.idea`**: IntelliJ IDEA 或 Android Studio 的配置文件。
- **`build`**: 构建产物目录，包含编译后生成的文件。
- **`lib`**: 项目的主要源代码目录。
    - **`main.dart`**: 应用程序的入口文件。
- **`test`**: 存放测试代码的目录。
- **`web`**: 如果项目支持Web，这里存放Web平台特定的配置和资源文件。
- **`.gitignore`**: Git版本控制的忽略文件配置。
- **`metadata`**: Flutter项目标识文件（自动生成）。
- **`analysis_options.yaml`**: 配置静态代码分析工具（Linter）的规则。
- **`flutter_core.iml`**: IntelliJ模块文件，用于存储模块的特定设置。
- **`pubspec.lock`**: 项目所有依赖项的锁定版本文件，由`pub get`自动生成。
- **`pubspec.yaml`**: 项目的配置文件，用于声明项目依赖、字体、图片资源等。
- **`README.md`**: 项目说明文档。

## 3. Flutter核心概念入门

### 启动应用: `runApp()`

`runApp()` 函数是Flutter应用的入口。Flutter应用启动时，会调用此函数，并传入一个Widget作为应用的根组件。

### 万物皆Widget

在Flutter中，“万物皆Widget”。Widget可以理解为UI界面上的一个组件或控件。整个Flutter应用就是由一个Widget树构成的。

### Material Design 设计风格

- **Material** 是Google推出的一套跨平台的设计语言和规范，涵盖颜色、排版、动画等多个方面。
- Flutter内置了丰富的Material风格的Widget，使得开发者可以轻松构建出符合Material设计规范、在不同平台上拥有一致视觉和交互体验的应用。

### 总结
- Flutter应用通过 `runApp()` 方法启动。
- `runApp()` 方法需要传入一个 `Widget`。
- `Widget` 是构成Flutter界面的基本单位。
- Flutter内置了Material Design库，提供了大量开箱即用的 `Widget`。
