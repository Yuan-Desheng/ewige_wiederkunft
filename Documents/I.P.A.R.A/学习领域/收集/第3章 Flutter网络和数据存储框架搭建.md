---
createTime: 2026-02-27 16:57
笔记ID: 20260227165706
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - 网络
  - 存储
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

##  第3章 Flutter网络和数据存储框架搭建
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## HitNet架构设计
设计要求：
1.支持网络库插拔设计，且不干扰业务层
2.简洁易用，支持配置来进行请求
3.Adapter设计，扩展性强
4.统一异常和返回处理

![[Pasted image 20260227171212.png]]

