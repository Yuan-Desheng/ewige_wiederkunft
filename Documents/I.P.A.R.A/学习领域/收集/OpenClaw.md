---
createTime: 2026-03-29 22:04
笔记ID: 20260329220401
multiFile:
multiMedia:
description:
笔记类型:
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/OpenClaw.canvas|OpenClaw]]"
---

##  OpenClaw
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>
## 待办
- [ ] 

## 资料
[OpenClaw](https://docs.openclaw.ai/zh-CN)
[在Ubuntu24.04里面安装OpenClaw](https://jishubiji.com/p/771)
[安装、部署&使用教程](https://my.feishu.cn/wiki/LmRgwgGbDi58OBkLnfycpfNBnlf)
[# OpenClaw + 飞书机器人：如何让 AI 助手发送图片](https://apifox.com/apiskills/openclaw-fei-shu/)

## 笔记
[[OpenClaw安装、部署&使用教程]]
[[OpenClaw技能清单]]
[[OpenClaw常用命令]]
[[frontend-dev Agent Claude Code 集成方案]]

## 提示词
[[openclaw提示词-04-01]]
[[openclaw提示词-04-02]]
[[openclaw提示词-04-03]]
[[openclaw提示词-04-07]]
[[openclaw提示词-04-08]]



## 飞书机器人
```
workspace

sgcc-vpp-expert

product-manager

frontend-dev
```

### 临时提示词
workspace
```

```

frontend-dev
```
@yuan-frontend-dev 请使用claude,继续帮我修改 **融合大模型智能体的虚拟电厂仿真系统** 项目，/adjustable-capability-prediction路由下的，可调能力预测页面:请帮我将风险预警、实操指标 模块 去掉，因为业务需求，将 浙江省可调能力热力图 的地图模式和热力图模式分开，不需要tab切换就能直接在页面当中进行展示。
```

```
@yuan-frontend-dev MapPanel中的地图和热力图，可以分两个模块进行展示，甚至可以拆分为两个vue组件，页面上展示为两个模块，不要挤在一个模块里。
将“可调负荷结构深度拆解”模块移动到页面右侧，将拆分后的热力图移动到现在“可调负荷结构深度拆解”的位置上。
```

```
curl 'https://open.bigmodel.cn/api/biz/pay/preview' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: zh' \
  -H 'authorization: eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX3R5cGUiOiJQRVJTT05BTCIsInVzZXJfY2hhbm5lbCI6IldFQ0hBVF9PUEVOIiwidXNlcl9pZCI6NzczMTE4NywidXNlcl9rZXkiOiJkYTZiMTFlNC04OTI3LTQ2ZTMtOTFlNC04MDY3NDBjYjJhMWUiLCJjdXN0b21lcl9pZCI6IjcwNDAxNzc1NzE1NDkwNTI0IiwidXNlcm5hbWUiOiJqem1lbXg0MCJ9.0cKmYMmfIogGlsuX2xyLwX76HpGv1iisfvuTg88aMkPqrUbXFwUyo5b4PDn4Sv_7tl8nlL8adrEmg3IJ57Mddg' \
  -H 'bigmodel-organization: org-f21392E08f3b4E6E80A5C684cE619E0E' \
  -H 'bigmodel-project: proj_0DB16967Bd2B4c17b2731D7cDa12D0d7' \
  -H 'content-type: application/json;charset=UTF-8' \
  -b 'sensorsdata2015jssdkchannel=%7B%22prop%22%3A%7B%22_sa_channel_landing_url%22%3A%22%22%7D%7D; _ga=GA1.1.1259135326.1775628654; TDC_itoken=1154733481%3A1775715465; bigmodel_token_production=eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX3R5cGUiOiJQRVJTT05BTCIsInVzZXJfY2hhbm5lbCI6IldFQ0hBVF9PUEVOIiwidXNlcl9pZCI6NzczMTE4NywidXNlcl9rZXkiOiJkYTZiMTFlNC04OTI3LTQ2ZTMtOTFlNC04MDY3NDBjYjJhMWUiLCJjdXN0b21lcl9pZCI6IjcwNDAxNzc1NzE1NDkwNTI0IiwidXNlcm5hbWUiOiJqem1lbXg0MCJ9.0cKmYMmfIogGlsuX2xyLwX76HpGv1iisfvuTg88aMkPqrUbXFwUyo5b4PDn4Sv_7tl8nlL8adrEmg3IJ57Mddg; _tea_utm_cache_586864={%22utm_source%22:%22bigmodel%22%2C%22utm_medium%22:%22link%22%2C%22utm_campaign%22:%22Platform_Ops%22%2C%22utm_term%22:%22%E7%BC%96%E7%A0%81%E5%A5%97%E9%A4%90%E6%8E%A5%E5%85%A5%E6%95%99%E7%A8%8B%22}; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2270401775715490524%22%2C%22first_id%22%3A%2219d6bb71349561-0a121ec31b9a058-11462c69-2073600-19d6bb7134aa7e%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_utm_source%22%3A%22bigmodel%22%2C%22%24latest_utm_medium%22%3A%22link%22%2C%22%24latest_utm_campaign%22%3A%22Platform_Ops%22%2C%22%24latest_utm_term%22%3A%22%E7%BC%96%E7%A0%81%E5%A5%97%E9%A4%90%E6%8E%A5%E5%85%A5%E6%95%99%E7%A8%8B%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTlkNmJiNzEzNDk1NjEtMGExMjFlYzMxYjlhMDU4LTExNDYyYzY5LTIwNzM2MDAtMTlkNmJiNzEzNGFhN2UiLCIkaWRlbnRpdHlfbG9naW5faWQiOiI3MDQwMTc3NTcxNTQ5MDUyNCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%2270401775715490524%22%7D%7D; acw_tc=3ccdc16e17757851737687281e5083b1f1e0fb9ead2fca4d0f4d506cfcbe2d; Hm_lvt_a1b1a5545a8f11fdd72d54f10971c4ea=1775718554,1775785175; HMACCOUNT=C7C2AF9E197E2521; Hm_lpvt_a1b1a5545a8f11fdd72d54f10971c4ea=1775786642; _ga_SF8X67RPF9=GS2.1.s1775785175$o5$g1$t1775786642$j40$l0$h0; ssxmod_itna=1-eqGOAKYvkbD5GQG08DRD9DedqUhDIgL40dGMD3dq7U3GcD8x40pNgxtRkUqtvdD8GDh0XewKlT2rDlh7eDZDG9dDqx0ErX/gG02dz70AoetoKCQ20IeB9CD0poUCOogpz8II0S9qCC7X4tBwp9LLuDGoDbqDyDAtD0qDiGn5D/4ArK8eD4R3Dt4rD3bbDixGm7eDStxD9DGPoxAETWr4oTpcFdPDEDYPoVeDgmDDB_brDKTPTgPDAilPDIRy7xBE_Nh2ipl5OU0yp/eGyK5Gu8ZeCOQOOQ=HHZausfMvrSfLq8SqVbB5iReeFDrQG5tnxW0DGGq9hZS4etRZKhut_xtROSRNzuYYygbyS8yYC0rnvh3WhK25BDeUDxt0P7ArtGZnxNl2PbDrb05Kh4muNFgxGBq=_DD; ssxmod_itna2=1-eqGOAKYvkbD5GQG08DRD9DedqUhDIgL40dGMD3dq7U3GcD8x40pNgxtRkUqtvdD8GDh0XewKlT2YDi=bBvxwtex035IbPRnqox0yLqWVrPSy0wVDgdmjmTlLMDfeA9BTCgXbiIiyLWsgvdBdt44MPNYn5DNG6NSMv2_gqRKYto1GQBRlpQhYh4xexRWkYDh705ww67ATclKkGh/_T3TMLZzrUkxktb=uHasOi56lP3c6tOM_UDoM4IxnFwrdLdGtIQN0cqQdT5BG0h5L3haGfLPVwQVD=cnpb9MLy1176GsvT5ss0wPHR12XTotO2AsELIhm3ZPDS3w2f7ZwcP=SBhMGQkcv/==lDAWOoTEvsoer6L/CqNbAxGjW1RIp2axYycpiUvHPt1P0dxY9OEKYf0Af_Y6G955YEdBA/mG/2xp9pe03GiYjeYk95bKYSmD4ltYioToQYYvxnRciFtzjx=Dg2i9Q3hctp607QI0aK1PIWZU4YIqF6NG=9jai=QV_y0BYBBQgY2XY5S0DKKQjPI1OQ0UiSiFvtg115vgA4qOfBq3IpGjBaFvMtNAmpL8KSlw94KkhKHT5b397PM7iFkRHdMMQaF2OOH673cSX7dylBqNNRZHfBk3p3idv00DvCnsCegBGeetY0hZlIi2wYsh0rki=D6vAq0zpxv/Ra1uhc3myd5lvPZLnBGnL5j4SkY/xs3/nKSkploSilKwRTk3dMx/36yDDdtqoWbf6MDFtWEwliLDeLq40xKhrGDF2Fmdt4t75ShLhL3_NBYt4wD/tD0q4FrxD; sensorsdata2015jssdksession=%7B%22session_id%22%3A%2219d750b6a611e7700df0209694791511462c69207360019d750b6a6228a4%22%2C%22first_session_time%22%3A1775785175649%2C%22latest_session_time%22%3A1775786690503%7D' \
  -H 'origin: https://open.bigmodel.cn' \
  -H 'priority: u=1, i' \
  -H 'referer: https://open.bigmodel.cn/glm-coding' \
  -H 'sec-ch-ua: "Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'set-language: zh' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36' \
  --data-raw '{"productId":"product-5643e6"}'
```