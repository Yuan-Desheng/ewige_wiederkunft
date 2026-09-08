---
createTime: 2026-09-02 16:42
description:
multiFile:
multiMedia:
笔记ID: 20260902164215
笔记类型: 项目笔记
阐述日期:
---

##  tiktok带货视频
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 提示词

```
ultracode 我看过视频里，我认为现在生成的视频效果不够好，不像是带货视频。

我生成商品带货视频的目的是为了上传到tiktok商家后台，为商品进行引流，具体操作流程是：“Documents/I.P.A.R.A/工作领域/项目/tiktok_跨境电商”文档

我之前使用的，比较好的带货视频生成方式为，
使用 fastmoss 中的 要上品的视频 https://www.fastmoss.com/zh/e-commerce/detail/1735896116290422626 中的“达人，高销售额视频”
进入视频详情页面 https://www.fastmoss.com/zh/media-source/video/7678719184817212693，进行“复刻视频”
进入 https://www.oumomo.ai 后，
会将爆款视频链接提供给 oumomo
并且要求我填写、上传和选择：“
### 原视频预览

## 爆款复刻配置

设置你的复刻参数，AI将基于原视频生成全新内容

请上传商品图*

![Example Product](https://uscdn.fastmoss.com/oumomo//video-remake/remake-product-img-example1.png)

示例

上传

已上传 0/9

复刻提示词（选填）0/2000

视频设置

视频比例

9:16

时长新增 30s

15s

文案语言

英语

清晰度

720P

生成数量

1
”
等信息，图片可以上传多个（这一步在咱们生成视频的流程中可以优化一下，从1688和fastmoss中获取更加干净更加容易使用来生成视频的图片）

复刻提示词，要从fastmoss中商品简介中获取商品的卖点，从1688的商品详情信息（主要是从产品图片中）总结出类似：“
Portable Rechargeable Zoom Flashlight – 100M Long-Range Beam Light up outdoor adventures and emergency situations with this compact high-power flashlight.The bright white LED provides clear illumination at distances of up to approximately 100 metres, while the telescopic zoom allows easy switching between a focused spotlight and wide-area floodlight. Three lighting modes—High, Low and Strobe—can be changed with one button to suit different situations.The reinforced body offers reliable impact resistance, while the efficient heat-dissipation design helps prevent overheating during extended use. Product Highlights: • Bright white high-power LED • Beam distance up to approximately 100 metres • Telescopic zoom: spotlight and floodlight • Three modes: High, Low and Strobe • Type-C rechargeable design • High-capacity lithium battery • Four-level battery indicator • Water-resistant for rainy outdoor conditions • Reinforced, impact-resistant body • Lightweight and portable Specifications: • Size: Approximately 153 × 35 mm • Weight: Approximately 75 g • Suitable for camping, hiking, fishing, night patrols, car emergencies and household use Do not shine directly into the eyes.Keep the charging port dry and do not submerge the flashlight in water.
”的产品简介，然后去生成带货视频提示词（这一步请你帮我找找生成带货视频的skill）
生成视频设置一般默认，这样生成出来的带货视频效果会比较好。
请你分析我现有的流程，帮我制定计划，优化使用fal生成带货视频的方式。
```

```
评价一下你生成出来的视频，是否有优化方案
生成的时间可以长一点，再精细一点
```

```
ultracode
请分析实际情况，帮我优化并执行提示词：“好的，请pull一下代码，
1.我昨天又学习了一些上品知识，请你根据授课文本 @跨境销售学习.txt 帮我看看能否继续优化选品上品的流程
商品主要上20新币左右的商品比较值，因为咱们是跨境电商物流成本比较高，并且后续还需要生成视频对商品进行宣传，如果商品价格比较低的话容易亏损
跨境销售学习.txt 中的后半段生成视频部分你不需要管。

2.上品到seller.tiktokshopglobalselling之后还有一些工作要做，请你读取 ewige_wiederkunft/Documents/I.P.A.R.A/工作领域/项目/tiktok_跨境电商.md 看看“妙手ERP发布成功后，进入tiktok商家中心后台进行商品管理”部分，需要分析笔记中的图片”

```

```
1.fastmoss已经重新登录，选品的时候，多记录一些 shop.tiktok.com 的商品链接。因为这个fastmoss账号是多人共用的
2.商品主要上20新币左右的商品，是指上品后的价格，我确认一下你应该没有理解错吧
```



```

请帮我基于商品
https://detail.1688.com/offer/1057790331136.html?spm=a26352.b28411319/2508.0.0&cosite=-&tracelog=p4p&_p_isad=1&clickid=ef78fd6fadb54b7f8bf44c6b86d683f6&sessionid=538e687cae0b10f58b7603a5b9e5f691&sourceId=V1-f07669ef9b8ff17538ca0743625f4fa5-S04
制定一个生成视频的计划，先给我看计划我确认过后再去生成

```

```

请帮我基于商品
https://detail.1688.com/offer/1037091953279.html?sourceId=V1-f07669ef9b8ff17538ca0743625f4fa5-S04&spm=a26352.b28411319/2508.0.0
制定一个生成视频的计划，先给我看计划我确认过后再去生成.

```

```
请连接 sshpass -p '【已脱敏】' ssh -p 22 wanglixin@192.168.66.249
将 tk-sea-seller 项目以及相关资料，拷贝到 wanglixin电脑的桌面
需要在 wanglixin电脑上复现最新的fastmoss选品 妙手erp采集上品等操作
帮我准备好环境和开启对话的提示词，wanglixin电脑上要使用codex操作
```

```
ultracode
请帮我分析当前
/Users/cuizhanwei/yuandesheng/h3VsFalStudy
/Users/cuizhanwei/yuandesheng/creator-commerce-studio
项目实际情况，帮我优化提示词：“
继续完成 creator-commerce-studio 的开发
综合 h3VsFalStudy 项目中 调用本地服务器 和 调用第三方（先打通fal.ai）
网站生成视频的整体流程上再仿照“https://www.oumomo.ai”的流程优化一下
请先帮我制定计划，然后按照计划一步步生成
”
ps：读取一下项目当前的技术栈
当前的项目好像是一个单纯的前端项目，
我想将技术栈重构为：“| 层级 | 选型 | 说明 |
|------|------|------|
| 后端框架 | **Gin (Go)** | 轻量高性能，GitHub 72k+ Star |
| 后端ORM | **GORM** | Go 主流 ORM |
| 依赖注入 | **Wire** | Google 出品，编译时依赖注入 |
| 配置管理 | **Viper** | 支持 yaml/json/env |
| API文档 | **Swag (swaggo/swag)** | 自动生成 OpenAPI |
| 数据库迁移 | **golang-migrate** 或 GORM AutoMigrate | 幂等版本化迁移 |
| 前端框架 | **React 19 + TypeScript + Vite** | 最新稳定版 |
| 前端UI | **Tailwind CSS v4 + shadcn/ui** | 组件源码可控，高度可定制 |
| 前端状态管理 | **Zustand** | 轻量，Slash Admin 标配 |
| 前端数据请求 | **TanStack Query + Axios** | 缓存、重试、分页开箱即用 |
| 前端路由 | **React Router v6** | 标准方案 |
| 前端表单 | **React Hook Form + Zod** | 类型安全表单验证 |
| 前端Mock | **MSW (Mock Service Worker)** | 配合接口契约独立开发 |
| Admin模板 | **Slash Admin** | 原生支持 React 19 + shadcn/ui + TS |
| 数据库 | **PostgreSQL 16** | 支持 JSONB/地理距离/层级查询 |
| 部署方式 | **Docker Compose** | 单机部署 |
| 工作流/状态机 | **自研枚举状态机 + 可选 Go statemachine 库** | warm-flow(Java)不可用，Go自研更轻量可控 |

**参考项目索引（请在技术选型章节明确引用）**：
- 后端脚手架参考：`youlai-gin`、`gin-scaffold`
- Go状态机库参考：`statemachine`、`looplab/fsm`
- 前端模板参考：`Slash Admin`、`react-shadcn-admin-starter`
- 全栈参考：`gin-react-monorepo`”
  先将后端技术栈记录下来只重构前端项目，目前好像还不需要后端，等需要后端的时候再做
  请帮我生成提示词，我要去 /Users/cuizhanwei/yuandesheng/creator-commerce-studio 目录下开启新对话完成任务
```

```
ultracode 请读取ozon-flow，制定将当前tiktok跨境电商流程改造为稳定的应用的计划，我只在关键地方手动点击确认一下。
帮我写好提示词我去新对话开启任务
看看技术栈能否制定为
“| 层级 | 选型 | 说明 |
|------|------|------|
| 后端框架 | **Gin (Go)** | 轻量高性能，GitHub 72k+ Star |
| 后端ORM | **GORM** | Go 主流 ORM |
| 依赖注入 | **Wire** | Google 出品，编译时依赖注入 |
| 配置管理 | **Viper** | 支持 yaml/json/env |
| API文档 | **Swag (swaggo/swag)** | 自动生成 OpenAPI |
| 数据库迁移 | **golang-migrate** 或 GORM AutoMigrate | 幂等版本化迁移 |
| 前端框架 | **React 19 + TypeScript + Vite** | 最新稳定版 |
| 前端UI | **Tailwind CSS v4 + shadcn/ui** | 组件源码可控，高度可定制 |
| 前端状态管理 | **Zustand** | 轻量，Slash Admin 标配 |
| 前端数据请求 | **TanStack Query + Axios** | 缓存、重试、分页开箱即用 |
| 前端路由 | **React Router v6** | 标准方案 |
| 前端表单 | **React Hook Form + Zod** | 类型安全表单验证 |
| 前端Mock | **MSW (Mock Service Worker)** | 配合接口契约独立开发 |
| Admin模板 | **Slash Admin** | 原生支持 React 19 + shadcn/ui + TS |
| 数据库 | **PostgreSQL 16** | 支持 JSONB/地理距离/层级查询 |
| 部署方式 | **Docker Compose** | 单机部署 |
| 工作流/状态机 | **自研枚举状态机 + 可选 Go statemachine 库** | warm-flow(Java)不可用，Go自研更轻量可控 |

**参考项目索引（请在技术选型章节明确引用）**：
- 后端脚手架参考：`youlai-gin`、`gin-scaffold`
- Go状态机库参考：`statemachine`、`looplab/fsm`
- 前端模板参考：`Slash Admin`、`react-shadcn-admin-starter`
- 全栈参考：`gin-react-monorepo`”
```