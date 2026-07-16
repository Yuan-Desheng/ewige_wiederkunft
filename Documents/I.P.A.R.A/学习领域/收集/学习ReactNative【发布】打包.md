---
createTime: 2026-07-16 18:00
笔记ID: 20260716180026
multiFile:
multiMedia:
description: 小满 React Native 教程「学习ReactNative【发布】打包」笔记。素材来源 message163.github.io/react-docs。
笔记类型: 收集笔记
阐述日期:
tags:
  - ReactNative
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-react-native.canvas|小满zs-react-native]]"
---

## 学习ReactNative【发布】打包

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[小满 React 文档](https://message163.github.io/react-docs/react-native/build/build.html)
> 作者：小满 message163（sister man）

---

## 占位说明

该篇对应原文「发布 - 打包」章节。经直接抓取原始 HTML 确认：该 URL 返回 **404**（页面不存在，仅渲染 404 错误页骨架），web-reader 工具对该页 300s 超时无响应。

为避免杜撰，本笔记暂不填充内容。待原作者补充对应页面后重新抓取整理。

预期知识点（待原文补全后细化）：

- Android 打包：`cd android && ./gradlew assembleRelease` 生成 APK
- 生成签名密钥 `keytool -genkeypair`（keystore）与 `android/app/build.gradle` 签名配置
- `android/gradle.properties` 启用 `org.gradle.jvmargs` 与 ProGuard / R8 混淆
- iOS 打包：Xcode → Product → Archive 生成 `.xcarchive`，再导出 `.ipa`
- Bundle ID 与版本号 `version` / `build` 一致性
- 瘦包与多架构 ABI 拆分（`enableSeparateBuildPerCPUArchitecture`）
