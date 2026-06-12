---
createTime: 2026-03-04 10:31
笔记ID: 20260304103112
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - Flutter
  - APP上架
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Flutter.canvas|Flutter]]"
---

##  APP打包上架
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 待办清单

## 参考资料
[【总结】从零上架一款APP，梳理整个流程_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1rN9tYQEMz/?spm_id_from=0.0.favlist.content.click&vd_source=8084410e3cc6827800d6f9584a3788b5)
[11路从零到上架](https://lovely-motion-9c8.notion.site/11-2651ec48cace4c2d92a482645f234a43)

## 从开发到上架
### 开通各平台的开发者账号
#### 苹果
- 用 Apple ID 登陆苹果开发者平台，并加入开发者计划
    [https://support.apple.com/zh-cn/108647](https://support.apple.com/zh-cn/108647)
    [https://developer.apple.com/cn/](https://developer.apple.com/cn/)
    ![[Pasted image 20260304104838.png]]
    点击顶部菜单的「账户」，加入苹果开发者计划（**688元/年**）
- App Store 中下载 Xcode，并绑定 Apple ID
    ![[Pasted image 20260304104849.png]]
    菜单栏 Xcode -> Settings -> Accounts
- 是否支持个人开发者：✅
- 如果要升级到企业账号，需要为企业申请邓白氏码
    [D-U-N-S® 编号 - 支持 - Apple Developer](https://developer.apple.com/cn/support/D-U-N-S/)
    简单来说，邓白氏码相当于企业在国际上的一个身份证号

#### 小米
- 注册&认证 小米开发者平台
    [开发者账号注册认证操作指南 | 小米澎湃OS开发者平台](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1145)
- 是否支持个人开发者：❌
    ![[Pasted image 20260304104933.png]]
    参考资料：[https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1731](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1731)

#### 华为
- 注册&认证 华为开发者联盟
    [文档中心](https://developer.huawei.com/consumer/cn/doc/start/registration-and-verification-0000001053628148)
    注册账号
    [文档中心](https://developer.huawei.com/consumer/cn/doc/start/rna-0000001062530373)
    实名认证
- 是否支持个人开发者：✅

#### 荣耀
- 注册&认证 荣耀开发者平台
    [developer.honor.com](https://developer.honor.com/cn/doc/guides/100272)
    账号注册
    [developer.honor.com](https://developer.honor.com/cn/doc/guides/100619)
    实名认证
- 是否支持个人开发者：❌
    ![[Pasted image 20260304105048.png]]
    参考资料：[https://developer.honor.com/cn/doc/guides/100619](https://developer.honor.com/cn/doc/guides/100619)
#### VIVO
- 注册&认证 VIVO开发者平台
    [vivo开放平台](https://dev.vivo.com.cn/documentCenter/doc/2)
- 是否支持个人开发者：❌
    ![[Pasted image 20260304110144.png]]
    参考资料：[https://dev.vivo.com.cn/documentCenter/doc/2](https://dev.vivo.com.cn/documentCenter/doc/2)
#### OPPO
- 注册&认证 OPPO开发者平台
    [OPPO 开放平台-OPPO开发者服务中心](https://open.oppomobile.com/new/developmentDoc/info?id=10446)
- 是否支持个人开发者：❌
    ![[Pasted image 20260304112617.png]]
    参考资料：[https://open.oppomobile.com/new/developmentDoc/info?id=10446](https://open.oppomobile.com/new/developmentDoc/info?id=10446)
### 提交上架审核
|平台|指南|软著要求|备案要求|审核时长|
|---|---|---|---|---|
|苹果|[https://developer.apple.com/cn/help/app-store-connect/manage-your-apps-availability/overview-of-publishing-your-app/](https://developer.apple.com/cn/help/app-store-connect/manage-your-apps-availability/overview-of-publishing-your-app/)|不需要|需要|半天|
|小米|[https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1072](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1072)|需要|需要|1～2天|
|华为|[https://developer.huawei.com/consumer/cn/doc/app/agc-help-release-overview-0000001272395372](https://developer.huawei.com/consumer/cn/doc/app/agc-help-release-overview-0000001272395372)|需要|需要|2～3天|
|荣耀|[https://developer.honor.com/cn/doc/guides/100882](https://developer.honor.com/cn/doc/guides/100882)|需要|需要|1～2天|
|VIVO|[https://dev.vivo.com.cn/documentCenter/doc/52](https://dev.vivo.com.cn/documentCenter/doc/52)|需要|需要|1～2天|
|OPPO|[https://open.oppomobile.com/new/developmentDoc/info?id=10035](https://open.oppomobile.com/new/developmentDoc/info?id=10035)|需要|需要|1～2天|

### 软著&ICP备案
> **软著申请**
- 阿里云软著服务：[https://wanwang.aliyun.com/swcopyright/ruanzhu](https://wanwang.aliyun.com/swcopyright/ruanzhu)
- 耗时：**60个自然日**
- 费用：**399元**
- 建议：在APP开发到一半时就去申请；或使用替代方案：电子版权（10个工作日内）
- 软著和电子版权的区别：[https://zhuanlan.zhihu.com/p/672867885](https://zhuanlan.zhihu.com/p/672867885)
- 软著查询地址：[https://register.ccopyright.com.cn/query.html](https://register.ccopyright.com.cn/query.html)

> **ICP备案**
- 阿里云备案服务：[https://wanwang.aliyun.com/qualificationrec/bagjfw](https://wanwang.aliyun.com/qualificationrec/bagjfw)
- 网站（如有）和APP都需要备案
- 耗时：**15天左右**，最长20个工作日（我实际是7天）
- 费用：**1440元**（官网+APP）
- 备案查询地址：[https://beian.miit.gov.cn/#/Integrated/recordQuery](https://beian.miit.gov.cn/#/Integrated/recordQuery)

# 实操

## 资料
[Android APP打包上架完整指南](https://chat.deepseek.com/a/chat/s/aa2a9076-4024-417c-9ee6-deeee8fcaf2e)

## 火山云ICP备案
网站、APP备案
https://console.volcengine.com/beian/overview/

### 资料
[App备案FAQ](https://www.volcengine.com/docs/6428/1126969?lang=zh)
[一图读懂APP备案](https://www.miit.gov.cn/jgsj/xgj/hlwgl/art/2023/art_fd468b6fe66b4c05b8e3546566fd8265.html)
[查看备案结果](https://beian.miit.gov.cn/#/Integrated/index)

## 软著申请
[中国版权保护中心官网](http://www.ccopyright.com.cn/)
[2026软著申请教程【简洁版】](https://ruanzhubao.com/blogs/ruanzhu-shenqing-jiandan-jiaocheng)

## 上架华为应用市场

https://developer.huawei.com/
```
desheng.lailai@gmail.com
!P@ssword1
```

创建并配置应用

1. **创建应用**：登录[AppGallery Connect](https://developer.huawei.com/consumer/cn/service/josp/agc/index.html)平台，点击“我的应用” -> “创建应用”，按提示填写应用名称、分类等基本信息[](http://www.metabaas.cn/news/471/)。