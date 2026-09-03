---
createTime: 2026-09-01 15:28
笔记ID: 20260901152800
multiFile:
multiMedia:
description: 在Ubuntu中使用OpenCLI控制已登录Chrome，从FastMoss或商品机会选品，经TikTok Shop原商品页采集、1688核价、妙手ERP上品，并在本地保存商品与货源映射。
笔记类型: AI整理
阐述日期:
tags:
  - OpenCLI
  - TikTok
  - 跨境电商
  - 浏览器自动化
aliases:
  - TikTok OpenCLI 自动化计划
cssclasses:
  - ai-note
卡片盒笔记主题:
updated: 2026-09-03
---

## OpenCLI-TikTok自动选品上品执行计划

```meta-bind-embed
[[笔记抬头模块]]
```

> 目标：在 Ubuntu 的新 Codex 对话中，使用 OpenCLI 控制一个已登录的专用 Chrome／Chromium Profile，跑通「FastMoss／商品机会选品 → 1688 核实货源并核价 → 跳转 TikTok Shop 原商品页采集 → 妙手 ERP 创建商品 → TikTok Seller Center 核对和设置 → 本地保存商品与货源映射」闭环。业务规则以 [[tiktok_跨境电商（优化版）]] 为准。

> [!warning] 先统一认识
> 页面操作跨 Windows／Linux，但流程并非完全与环境无关。Ubuntu 上的 Chrome 登录状态、扩展、本地核价文件、图片路径和下载目录都要重新准备。账号安全更依赖正确的浏览器 Profile、稳定的既有网络方案和正确店铺；不要在普通 Chrome、陌生网络或错误店铺中直接执行写操作。

## 一、自动化范围和控制边界

### 本轮自动化包含

1. 检查 Ubuntu、Node.js、OpenCLI、Chrome 扩展和 Browser Bridge。
2. 打开 FastMoss、TikTok Shop 商品页、1688、妙手 ERP、TikTok Seller Center，并核对登录账号、店铺和地区。
3. 从 FastMoss 和 Seller Center“商品机会”提取候选品，按需求、供需差、可比性、履约与合规条件排序。
4. 到 1688 查找对应货源，记录 SKU、采购价、供应条件、货源链接以及缺失信息。
5. 使用本地、可审计的核价脚本计算各国目标成交价和规划挂牌价。
6. 从 FastMoss 商品详情跳转到 `https://shop.tiktok.com/` 的原商品页，通过跨境 ERP 助手采集；在妙手建立商品草稿并完成核验和定价。
7. 经一次发布确认后提交；到 Seller Center 核对发布状态并设置通过核价的国家、SKU、库存和物流。
8. 把每个已发布 TikTok 商品、TikTok 来源商品、1688 货源、SKU 映射、核价和发布结果保存到本地台账，使流程可以查重、中断后继续并长期追溯。

### 默认不自动执行

- 不代替用户输入密码、短信验证码、2FA 或处理 CAPTCHA。
- 不绕过平台风控、限流、机器人检测或品牌审核。
- 不自动联系供应商、达人或客服；可以生成待发送文案，发送前另行确认。
- 不在未知包装重量、尺寸、授权或费用参数下发布商品。
- 不自动开启所有国家、虚构库存、品牌、原产地、质保或商品属性。
- 不自动报名促销、设置达人佣金或广告计划；这些是下一阶段，需单独核价和确认。
- 不读取、输出或保存登录密码、Cookie、Token、买家信息和完整 Seller ID。
- 不把本地商品台账、运行记录或含业务敏感信息的截图提交到公开仓库。

## 二、Ubuntu 新对话开始前准备

### 1. 同步资料

Ubuntu 本地应有两个资料目录，实际路径可以不同，但要在新对话开始时明确：

```text
<VAULT_ROOT>/Documents/I.P.A.R.A/工作领域/项目/
  tiktok_跨境电商（优化版）.md
  OpenCLI-TikTok自动选品上品执行计划.md

<TK_PROJECT_ROOT>/00-资料/
  八国核价系统.xlsx
  TikTok东南亚五国自动核价系统-户外运动类目.xlsx
  上品操作详细步骤.docx

<TK_PROJECT_ROOT>/素材/
```

先 `git pull --ff-only` 同步相关仓库。不要把含账号密码的 Office 文件上传到公开位置；新对话只需读取安全的业务参数，凭据由用户在浏览器里手动登录。

### 2. 建立运行目录

建议在 `tk-sea-seller` 内新建一个不提交敏感内容的运行目录：

```text
automation/
  config/
    expected-identity.example.yaml
    expected-identity.local.yaml     # 必须写入 .gitignore
    pricing-source.yaml
  data/
    product-ledger.local.jsonl       # 全部上品提交与发布状态的本地总台账，必须写入 .gitignore
  src/
    pricing.py
    validate_run.py
  runs/<RUN_ID>/
    identity-check.json
    candidates.json
    sourcing.json
    pricing.json
    product-draft.json
    publish-check.json
    product-record.json              # 本次商品、TikTok来源与1688货源的完整映射
    run-log.md
```

运行 ID 使用 `YYYYMMDD-HHmm-国家-类目`，例如 `20260901-1530-SG-outdoor`。同一次执行始终复用该 ID，避免重复上架。

### 3. 建立本地商品台账

`product-ledger.local.jsonl` 是跨运行的上品总索引，每行一个 JSON 对象；`runs/<RUN_ID>/product-record.json` 保存该商品的完整快照。两者都只保存在 `TK_PROJECT_ROOT` 本地并加入 `.gitignore`。首次运行先创建目录与空台账：

```bash
mkdir -p "$TK_PROJECT_ROOT/automation/data" "$TK_PROJECT_ROOT/automation/runs"
touch "$TK_PROJECT_ROOT/automation/data/product-ledger.local.jsonl"
```

每条记录至少包含：

```json
{
  "record_version": 1,
  "run_id": "20260903-1530-SG-outdoor",
  "recorded_at": "2026-09-03T15:30:00+08:00",
  "status": "PUBLISHED",
  "selection_source": "FASTMOSS",
  "selection_url": "https://...",
  "selection_keyword": "【商品机会或SEO关键词，可空】",
  "tiktok_source_url": "https://shop.tiktok.com/view/product/...",
  "published_tiktok_product_id": "【发布后填写】",
  "published_tiktok_url": "【发布后填写】",
  "shop_name": "【目标店铺名】",
  "region": "SG",
  "category": "【三级类目】",
  "product_title": "【最终标题】",
  "selected_1688_url": "https://detail.1688.com/offer/...",
  "alternate_1688_urls": ["https://detail.1688.com/offer/..."],
  "sku_mappings": [
    {
      "tiktok_source_sku": "【来源SKU】",
      "miaoshou_sku": "【妙手SKU】",
      "sku_1688": "【采购SKU】",
      "purchase_price_cny": 0,
      "package_weight_kg": 0,
      "target_price": 0,
      "currency": "SGD",
      "stock": 0
    }
  ],
  "pricing_snapshot": {
    "source_file": "【核价参数文件】",
    "calculated_at": "【核价时间】"
  },
  "miaoshou_draft_id": "【可安全记录的草稿ID】",
  "published_at": "【平台提交时间】",
  "seller_check_status": "PASS|PENDING|FAILED"
}
```

`selection_source` 只使用 `FASTMOSS` 或 `PRODUCT_OPPORTUNITY`；SEO 修改记录使用 `SEO_UPDATE`，并保存原值与新值。

保存规则：

1. 候选阶段把链接和证据写入本次 `candidates.json`、`sourcing.json`，不提前写成 `PUBLISHED`。
2. 妙手草稿完成后生成或更新 `product-record.json`，必须同时包含 TikTok 原商品页和最终选定的 1688 链接。
3. Seller Center 找到已发布商品后，补齐商品 ID、商品链接、SKU、价格、库存、审核状态和时间。
4. 只有执行发布并取得正确店铺的返回结果后，才把一行完整记录追加到总台账；发布处理中写 `PENDING`，失败写 `FAILED`，后续用同一 `run_id` 追加状态事件，不覆盖历史行。
5. 写入前以 `shop_name + region + published_tiktok_product_id` 查重；尚无商品 ID 时以 `shop_name + tiktok_source_url + selected_1688_url + SKU` 查重。
6. 使用临时文件写完并校验 JSON 后再原子替换 `product-record.json`；总台账每次追加后重新逐行解析，损坏时立即停止。
7. 不保存密码、Cookie、Token、买家资料、供应商联系人或完整 Seller Code。

### 4. 创建账号身份清单

`expected-identity.local.yaml` 只记录**可用于识别账号的非密码信息**，由用户在 Ubuntu 本地填写：

```yaml
target_country: SG
target_category: 运动户外
fastmoss_account_label: "【套餐名／脱敏用户名】"
account_1688_label: "【公司名／脱敏用户名】"
miaoshou_account_label: "【妙手子账号显示名】"
miaoshou_store_name: "【目标店铺完整名称】"
tiktok_shop_name: "【目标店铺完整名称】"
tiktok_region: SG
seller_code_suffix: "【仅末4位，可选】"
```

**这里不填写密码、手机号、邮箱、Cookie 或完整 Seller Code。** 如果尚未确定目标店铺，新对话必须先让用户填写这份清单，不能从“最近打开的店铺”猜测。

## 三、阶段 0：安装并验证 OpenCLI

以 [OpenCLI 官方仓库](https://github.com/jackwener/opencli) 的当前说明为准。2026-09-01 官方 npm 安装要求是 Node.js `>= 20.18.1`；旧笔记中的版本号和 `>= 21` 不作为固定要求。

### 1. 安装检查

```bash
uname -a
node --version
npm --version
google-chrome --version || chromium --version || chromium-browser --version
npm install -g @jackwener/opencli
opencli --version
```

若 Node.js 不满足当前要求，先通过 Ubuntu 已采用的 Node 版本管理方式升级。不要为绕过版本检查修改 OpenCLI 源码。

### 2. 安装 Browser Bridge 和 Agent Skill

1. 在目标 Chrome Profile 中，从官方链接安装 Browser Bridge 扩展。
2. 安装 OpenCLI 的浏览器技能：

```bash
npx skills add jackwener/opencli --skill opencli-browser
npx skills add jackwener/opencli --skill opencli-browser-sitemap
npx skills add jackwener/opencli --skill opencli-sitemap-author
```

第一轮用 `opencli-browser` 做探索和操作；流程稳定后，再用 sitemap 或私有 adapter 固化页面结构。不要一开始就编写大量硬编码选择器。

### 3. 固定专用 Profile

```bash
opencli doctor
opencli profile list
opencli profile rename <contextId> tk-sea
opencli profile use tk-sea
opencli --profile tk-sea browser env-check state
```

通过标准：`doctor` 全部正常，只有预期 Profile 被选中，`state` 能读取当前 Chrome 标签页。多 Profile 时必须显式加 `--profile tk-sea`，不能依赖默认选择。

## 四、阶段 1：网址、登录账号与店铺身份闸门

这是整个计划的第一个硬门槛。在四个账号平台的身份以及 TikTok Shop 商品页域名都显示 `PASS` 前，只允许读取，不允许填表、修改或发布。

### 1. URL 白名单

| 平台 | 预期入口或域名 | 必须核对的身份 |
| --- | --- | --- |
| FastMoss | `https://www.fastmoss.com/zh/e-commerce/newProducts` | 脱敏用户名／套餐标签、国家筛选能力 |
| TikTok Shop 商品页 | `https://shop.tiktok.com/` | 官方域名、目标国家、候选商品与 FastMoss／商品机会记录一致 |
| 1688 | `https://re.1688.com/` | 公司或脱敏采购账号标签 |
| 妙手 ERP | `https://erp.91miaoshou.com/` | 子账号显示名、已授权目标店铺 |
| TikTok Seller Center | `https://seller.tiktokshopglobalselling.com/` | 店铺全名、地区、Seller Code 后四位（如可见） |

登录跳转可以经过平台官方认证域名；若最终落到拼写相似、非官方或未知域名，立即停止并提示用户，不输入任何信息。

### 2. 每个平台的检查动作

对每个平台使用独立、固定 session。先打开或绑定用户已手动登录的标签页，再读取页面：

```bash
opencli --profile tk-sea browser fastmoss open "https://www.fastmoss.com/zh/e-commerce/newProducts"
opencli --profile tk-sea browser fastmoss state

opencli --profile tk-sea browser product-source open "https://shop.tiktok.com/"
opencli --profile tk-sea browser product-source state

opencli --profile tk-sea browser sourcing open "https://re.1688.com/"
opencli --profile tk-sea browser sourcing state

opencli --profile tk-sea browser miaoshou open "https://erp.91miaoshou.com/"
opencli --profile tk-sea browser miaoshou state

opencli --profile tk-sea browser seller open "https://seller.tiktokshopglobalselling.com/"
opencli --profile tk-sea browser seller state
```

实际操作时，每次页面跳转后重新 `state`，使用本次快照的 numeric ref；不要复用笔记里的旧 ref 或猜 CSS。

### 3. 输出身份核对表

Agent 将可见信息脱敏后写入 `identity-check.json`，并在对话中展示：

| 平台 | 当前登录身份 | 预期身份 | URL／地区 | 结论 |
| --- | --- | --- | --- | --- |
| FastMoss | 脱敏标签 | 清单值 | 当前域名 | PASS／FAIL |
| TikTok Shop 商品页 | 不记录个人身份 | 官方域名 | 域名／当前地区 | PASS／FAIL |
| 1688 | 脱敏标签 | 清单值 | 当前域名 | PASS／FAIL |
| 妙手 | 子账号 + 目标店铺 | 清单值 | 当前域名 | PASS／FAIL |
| TikTok | 店铺全名 + 地区 + Code 后四位 | 清单值 | 当前域名 | PASS／FAIL |

### 4. 给用户的固定提醒

遇到未登录时，Agent 必须明确说：

> 当前【平台】未登录。请在 Ubuntu 当前 `tk-sea` Chrome Profile 的可见窗口中，手动登录 **expected-identity.local.yaml 指定的正确账号**。不要把密码或验证码发到对话中。登录完成后告诉我继续，我会重新核对显示身份。

遇到账号或店铺不匹配时，Agent 必须明确说：

> 当前显示为【脱敏当前身份／店铺／地区】，计划目标是【预期身份／店铺／地区】。账号不一致，已停止后续操作。请在当前 Profile 中切换到正确账号，完成后我会重新检查；在 PASS 前不会选品、建草稿或发布。

如果出现验证码、2FA、CAPTCHA、设备确认或风险提示，停止自动操作，让用户在可见浏览器中完成。不得尝试自动绕过。

## 五、阶段 2：核价基线与运行校验

核价不应依赖浏览器页面中的临时心算。它是跨平台的本地确定性计算，输入来自浏览器，输出再回填网页。

### 1. 选择唯一参数源

两套现有核价表参数不同，且五国表存在已记录的公式问题。自动化前必须由用户确定本次参数源：

- 推荐起点：`八国核价系统.xlsx`，但仍需确认国家 × 类目费率、汇率和物流渠道是否为当前值。
- 五国表只能在修复并复核公式后作为主计算源。
- 选定后把文件名、sheet、参数更新时间和维护人写进 `pricing-source.yaml`。

### 2. 建立可审计的核价函数

新对话在 `automation/src/pricing.py` 实现并测试以下公式，不直接改原工作簿：

```text
计费重量 = 按渠道选择实重，或 max(实重, 长×宽×高÷体积重除数)
跨境物流 = 计费重量×公斤价 + 票费
固定成本 = 采购 + 国内物流 + 包装/打包 + 跨境物流
目标成交价RMB = 固定成本 ÷ (1 - 平台费率 - 销售成本率 - 目标净利率)
当地币成交价 = 目标成交价RMB ÷ 汇率
规划挂牌价 = 当地币成交价 ÷ 折扣系数
```

要求：

- 参数显式记录来源和快照日期，不写死在公式中。
- 每个国家、每个成本不同的 SKU 分别计算。
- 空白参数为 `UNKNOWN`，不能按 0 处理。
- 校验费率分母大于 0、折扣系数在 `(0, 1]`、重量和尺寸为正值。
- 输出成本明细、目标利润、价格舍入前后结果，以及重量 `+10%`、物流 `+10%` 的敏感性结果。
- 用优化笔记中的新加坡羽毛球拍复算值作回归测试；误差来自舍入时必须能解释。

### 3. 通过标准

只有以下条件全部满足才进入选品：

- [ ] 参数源已由用户确认。
- [ ] 回归测试通过。
- [ ] 输出可从输入和参数逐项算回。
- [ ] 没有读取或写回凭据工作表。

## 六、阶段 3：FastMoss 与商品机会自动选品

首轮仅做一个目标：一个国家、一个类目，FastMoss 与商品机会合计最多 10 个候选品。流程稳定后再扩大，不做盲目批量采集。

### 1. 来源 A：FastMoss

从 `expected-identity.local.yaml` 读取国家和类目。页面中依次设置：

1. 目标国家。
2. 三级类目或尽可能细的类目。
3. 店铺类型必须选择**跨境店**；本土店数据只能另作市场对照，不进入同一价格判断。
4. 新品榜的明确数据周期。
5. 记录币种、销售价格区间、SKU、上架时间、店铺经营时间和渠道构成。

进入候选商品详情，确认可跳转到 `https://shop.tiktok.com/` 的原商品页，并保存完整 `tiktok_source_url`。无法取得原商品页、商品已失效或页面内容与 FastMoss 记录不一致时，标为 `NEEDS_DATA`，不能进入采集。

### 2. 来源 B：Seller Center 商品机会与 SEO

进入正确店铺和站点的 Seller Center“商品机会”，读取平台推荐的高潜力商品；同时在 SEO 功能中添加与店铺类目真实相关的关键词，查看搜索次数与在售商品数。

每个候选项记录：

```text
opportunity_type, keyword, country, category, observed_period,
search_count, listed_product_count, recommendation_reason,
representative_product_url, captured_at
```

判断规则：

1. 搜索次数明显高于在售商品数，只表示值得继续验证，不直接等于低竞争或可发布。
2. 关键词必须与商品、SKU 和站点语言真实相关，不为流量添加无关词。
3. 检查时间范围、趋势稳定性、价格带、代表性竞品、品牌／IP、物流和供应难度。
4. 为保留项找到一个可访问的 TikTok Shop 原商品页作为采集来源，并记录 `tiktok_source_url`；只有后台概念词而没有可核实商品页的候选，暂不采集。
5. 已上架商品的 SEO 优化单独记录为 `SEO_UPDATE`，不得伪装成新商品发布，也要保留修改前后的标题、曝光和点击基线。

### 3. 统一提取字段

每个候选品保存：

```text
selection_source, selection_url, tiktok_source_url,
country, category_l1/l2/l3, product_title,
store_type, listing_date, observed_period, observed_sales,
price_min/max, currency, sku_summary,
product_card/video/live_share, seller_age,
keyword, search_count, listed_product_count,
brand_or_ip_signal, captured_at
```

每次翻页或筛选后 `state`；优先使用 numeric ref。长列表优先 `extract` 或经过筛选的 `network` 读取，不抓取无关流量；缓存输出不得包含 Cookie 或认证头。

合并两个来源时，以标准化后的 `tiktok_source_url + country + SKU` 去重，并保留所有选品证据，不因同一商品出现两次而重复进入上品流程。

### 4. 初筛规则

直接拒绝：

- 明显品牌／联名／IP 商品，但没有授权证据。
- 价格来自无法交付的引流 SKU，或与目标套装不可比。
- 平台类目限制、资质要求或物流限制无法满足。
- 页面缺失到无法判断的商品。

保留并评分：需求证据、价格可比性、供应匹配、重量／体积、差异化空间、内容可做性和数据可信度。输出 `candidates.json` 和一个 3–5 个商品的候选表，不直接决定发布。

## 七、阶段 4：1688 找货与候选核价

### 1. 以图或关键词找货

对每个入围候选：

1. 使用商品图或关键词搜索。
2. 只比较相同规格、数量和配件。
3. 每个候选保留最多 3 个完整、可重新打开的 1688 商品链接，并明确标出最终选定链接。
4. 记录采购价、起订量、一件代发、国内运费、可见库存、发货地和页面声明。

`sourcing.json` 必须建立以下映射，不能只在对话中描述：

```text
tiktok_source_url
→ selected_1688_url / alternate_1688_urls
→ TikTok来源SKU / 1688采购SKU / 套装与配件
→ 采购价 / 国内运费 / 包装重量尺寸 / 供货状态 / 授权状态 / 核实时间
```

如果 OpenCLI 已有 1688 适配命令，先用适配命令；不足部分再用 browser primitives。不要自动接受弹窗协议或发送采购消息。

### 2. 缺失信息闸门

以下信息不能可靠从页面确认时标为 `NEEDS_SUPPLIER_CONFIRMATION`：

- 完整发货包裹重量与长宽高。
- 每个 SKU 的套装组成和实际采购价。
- 库存与补货、截单和发货时点。
- 品牌、图片和商品销售授权。
- 退换货及质量问题处理。

Agent 可以生成询价文本，由用户决定是否发送。没有完整包装重量和授权结论的候选品不能进入发布阶段。

### 3. 自动核价与排序

将已确认输入交给 `pricing.py`，对目标国家及备选国家计算：

- 目标成交价和规划挂牌价。
- 与同口径竞品价格的价差。
- 目标利润额、敏感性利润和缺失参数。
- 物流、类目和授权是否通过。

排序结果分为：`REJECT`、`NEEDS_DATA`、`READY_FOR_REVIEW`。不能仅因“任一国家保得住”就自动发布。

## 八、检查点 A：用户选择商品和 SKU

Agent 完成所有可做的只读分析后，一次性给出：

- 候选商品、选品入口、证据链接和 TikTok Shop 原商品页链接。
- 1688 对应 SKU 与供应商。
- 各国家核价明细和参数来源。
- 缺失信息、品牌与履约风险。
- 推荐的一个商品、具体 SKU 和目标国家。

只有用户确认 `RUN_ID + 商品 + 供应商 + SKU + 国家` 后，才进入妙手草稿。确认只授权创建草稿，不等于授权发布。

## 九、阶段 5：从 TikTok Shop 采集并在妙手创建完整草稿

### 1. 再做一次身份检查

进入妙手后重新读取：当前子账号、目标店铺、地区、已授权状态。与身份清单或检查点 A 不一致立即停止。

### 2. 防重复检查

先查询 `product-ledger.local.jsonl`，再以 `RUN_ID`、TikTok Shop 原商品页链接、1688 货源链接、商品标题、SKU 和目标店铺检查采集箱、草稿及发布记录。发现疑似重复时展示已有本地与平台记录，不能再次采集。

### 3. 按顺序操作

1. 在 FastMoss 候选详情中打开已确认的 `tiktok_source_url`；商品机会候选则打开其已记录的 TikTok Shop 原商品页。
2. 重新核对地址栏域名必须为 `shop.tiktok.com`，页面商品、国家和 SKU 与候选记录一致。
3. 在该 TikTok Shop 商品页使用跨境 ERP 助手采集到妙手公共采集箱；**不再从 1688 商品页采集**。
4. 回到妙手采集箱，按来源链接、标题和采集时间找到本次商品，再关联身份清单指定的 TikTok 店铺。
5. 选择真实类目，并核对英文标题、描述和图片。来源为英文只能减少翻译步骤，不能跳过事实、授权和合规检查。
6. 删除无授权品牌／IP 声明；不能用遮挡 Logo 规避审核。
7. 用已确认的 1688 实际供货信息修正标题和详情，并保留中文核对稿。
8. 逐项填写属性；未知内容不猜。
9. 建立 TikTok 来源 SKU、妙手 SKU 与 1688 采购 SKU 的一一对应关系。
10. 上传有权使用、与实物一致的主图、详情图和规格图。
11. 每个 SKU 回填本次核价的国家价格，并复算舍入后利润；竞品售价不能替代 1688 采购成本。
12. 填写可兑现库存，不使用统一虚假值。
13. 填写完整包裹重量和尺寸。
14. 保存为草稿，不点击最终发布；立即生成本次 `product-record.json`，写入两个来源链接和 SKU 映射。

每次页面跳转后重新 `state`；每次填写后用 `get value` 或页面摘要回读。遇到 `reidentified`、多匹配或字段含义不清时停止该字段，重新检查，不猜测点击。

### 4. 草稿验收文件

把以下内容写入 `product-draft.json`，不包含密码或 Cookie：

- 店铺、国家、类目。
- 选品来源、选品证据 URL、TikTok Shop 原商品页 URL。
- 最终 1688 货源链接、备选链接、供应商、商品和三方 SKU 对应。
- 标题、属性、详情、图片文件清单。
- 重量、尺寸、价格、库存。
- 每个字段的证据来源和待确认项。
- 妙手草稿 ID 或可安全记录的定位信息。

## 十、检查点 B：发布前唯一确认

Agent 在对话中展示一份紧凑预览：

```text
RUN_ID / 妙手账号 / 目标店铺 / 国家
商品 / 类目 / 选品入口 / TikTok Shop原商品页 / 1688货源链接
SKU → 采购价 → 完整重量 → 目标成交价 → 挂牌价 → 库存
品牌状态 / 图片清单 / 物流预估
所有警告与未解决项
```

只有用户明确回复 `批准发布 <RUN_ID>`，才能点击发布。只要还有 `UNKNOWN`、身份不匹配、价格不一致或品牌授权问题，就不能请求批准，应先解决问题。

## 十一、阶段 6：发布与 TikTok Seller Center 设置

### 1. 妙手发布

1. 发布前再次回读目标店铺。
2. 点击发布一次，记录时间和返回状态。
3. 等待平台响应，不因“处理中”连续重复提交。
4. 记录成功、处理中或失败原因。

### 2. Seller Center 三重匹配

进入商品管理前再次确认：

- 店铺名完全匹配。
- 站点／国家完全匹配。
- Seller Code 后四位匹配（如可见）。

根据本次妙手发布记录、标题和 SKU 找到刚发布商品，并与本地记录中的 TikTok 来源页和 1688 货源映射核对；不能只点列表第一条。

### 3. 发布后设置顺序

按 [[tiktok_跨境电商（优化版）#六、发布与多国家校验]] 执行：

1. 确认商品审核和可售状态。
2. 检查标题、品牌、属性、详情、图片和 SKU 名称。
3. 检查每个 SKU 的价格与币种。
4. 检查完整包裹重量、尺寸和卖家跨境物流预估。
5. 只开启核价和物流均通过的国家。
6. 设置可兑现库存。
7. 预览并复算页面最终价格。
8. 更新／同步后重新读取页面确认结果。

所有写操作完成后生成 `publish-check.json`：商品 ID、商品链接、店铺、国家、SKU、页面价格、库存、物流预估、审核状态和检查时间。截图仅在页面无法用结构化状态核实时使用，并保存在本地私有运行目录。

### 4. 回写本地商品台账

1. 把 `publish-check.json` 的商品 ID、商品链接、审核状态和检查时间合并进 `product-record.json`。
2. 重新核对 `tiktok_source_url`、`selected_1688_url`、最终上架 SKU 与采购 SKU 均非空；备选供应商可以为空。
3. 校验 `product-record.json` 可解析且不含凭据或买家信息。
4. 在 `product-ledger.local.jsonl` 中执行查重，再追加一条 `PUBLISHED`、`PENDING` 或 `FAILED` 状态记录。
5. 重新逐行解析总台账，并在 `run-log.md` 写下台账行数、记录时间和本次 `run_id`；台账写入失败时，本次流程不能标记完成。

### 5. 本计划到此结束

促销、平台活动、达人联盟和广告属于第二条自动化链。需要拿发布后的真实商品 ID 和最终价格重新核价，再单独制定确认点；本计划不顺手开启。

## 十二、失败处理与恢复规则

| 情况 | 处理 |
| --- | --- |
| OpenCLI doctor 失败 | 修复 Chrome、扩展、daemon 或 Profile；不继续 |
| 未登录／登录过期 | 提醒用户在当前 Profile 手动登录，再重查身份 |
| 账号、店铺或国家不匹配 | 硬停止；切换正确账号后从身份闸门重跑 |
| CAPTCHA／2FA／风险验证 | 用户手动处理；禁止自动绕过 |
| DOM 或 ref 失效 | 重新 `state`／`find`；不使用旧 ref |
| 页面字段多匹配或语义不清 | 不点击；读取上下文或请用户处理该字段 |
| 核价参数冲突或缺失 | 标为 `NEEDS_DATA`，不选择或发布 |
| 包装重量／授权未知 | 停在候选或草稿阶段 |
| 妙手疑似重复商品 | 查草稿和发布记录；不再次创建 |
| TikTok Shop 原商品页无法打开或与候选不一致 | 不采集；回到候选阶段重新核对链接 |
| 发布处理中 | 等待并查询，不重复提交 |
| 发布失败 | 记录平台原始原因，只修明确字段后重试 |
| 本地台账写入或解析失败 | 保留本次运行文件，修复台账后再标记完成；不得静默丢失映射 |
| 用户中途停止 | 写入当前阶段、最后成功动作和下一动作；关闭 owned session |

## 十三、完成标准

- [ ] Ubuntu 环境检查和 `opencli doctor` 通过。
- [ ] FastMoss、1688、妙手和 Seller Center 身份全部 `PASS`，TikTok Shop 商品页域名正确。
- [ ] 核价参数源、日期和回归测试明确。
- [ ] 候选、货源、核价和淘汰原因可追溯。
- [ ] 用户确认了具体商品、供应商、SKU 和国家。
- [ ] 妙手草稿字段均能回读，没有未知关键属性。
- [ ] 用户按 RUN_ID 批准发布。
- [ ] 妙手仅提交一次，发布结果可定位。
- [ ] Seller Center 店铺身份再次通过，商品与 SKU 定位准确。
- [ ] 国家、价格、库存、重量、尺寸和物流检查完成。
- [ ] 每个发布商品都有 TikTok 来源页、最终 1688 货源链接和 SKU 映射。
- [ ] `product-record.json` 与 `product-ledger.local.jsonl` 已校验并成功写入。
- [ ] 输出中没有密码、Cookie、Token 或买家隐私。
- [ ] 运行日志记录了成功、失败、人工介入和下一步。

## 十四、Ubuntu 新对话启动提示词

复制下面整段到 Ubuntu 的新对话，并把路径和身份清单填写好：

```text
请在这台 Ubuntu 电脑上执行《OpenCLI-TikTok自动选品上品执行计划》；目标是使用 OpenCLI 控制当前可见、已登录的 Chrome/Chromium，从 FastMoss 和 Seller Center 商品机会选品，到 1688 核实货源并本地核价，从 shop.tiktok.com 原商品页采集到妙手 ERP，完成草稿、发布、Seller Center 校验，并把每个发布商品与 1688 货源的映射保存到本地台账。

项目路径：
- VAULT_ROOT=【填写 ewige_wiederkunft 的 Ubuntu 绝对路径】
- TK_PROJECT_ROOT=【填写 tk-sea-seller 的 Ubuntu 绝对路径】

开始前必须读取：
1. $VAULT_ROOT/AGENTS.md
2. $VAULT_ROOT/Documents/I.P.A.R.A/工作领域/项目/OpenCLI-TikTok自动选品上品执行计划.md
3. $VAULT_ROOT/Documents/I.P.A.R.A/工作领域/项目/tiktok_跨境电商（优化版）.md
4. $TK_PROJECT_ROOT/AGENTS.md

执行约束：
- 使用 OpenCLI 官方 opencli-browser 工作流；先运行 node、Chrome、opencli 版本检查和 opencli doctor。
- 固定使用名为 tk-sea 的 Chrome Profile；每个网站使用独立 session。
- 第一阶段只做环境和账号身份检查。依次打开 FastMoss、shop.tiktok.com、1688、妙手 ERP、TikTok Seller Center，核对官方域名，并读取当前可见账号、妙手目标店铺、TikTok 店铺名、地区和 Seller Code 后四位，与 automation/config/expected-identity.local.yaml 对比。
- 如果未登录，明确提醒我在当前可见的 tk-sea Profile 中手动登录正确账号；不要让我把密码、验证码或 Cookie 发到对话中。
- 如果当前账号、店铺或国家不匹配，立即停止，并告诉我“当前是谁、预期是谁、应切换什么”；在重新核验 PASS 前不得继续。
- 遇到 CAPTCHA、2FA、设备确认或平台风控提示时停止，让我手动完成，不得绕过。
- 每次页面跳转后先 state，再使用本次快照的 numeric ref；不要从旧笔记猜 selector 或 ref。每次写入后回读校验。
- 不读取或输出密码、Token、Cookie、买家信息；运行记录只保存脱敏身份和业务字段。
- 按计划建立 RUN_ID、运行目录和 automation/data/product-ledger.local.jsonl；确认 .local 台账与 runs/ 已被 gitignore，先查本地台账和平台记录再采集或发布。
- 核价使用本地可审计脚本，不用页面心算。两套表参数冲突时先整理差异并等我确认唯一参数源；空白值不能按 0。
- 候选品同时来自 FastMoss 跨境店和 Seller Center 商品机会／SEO；合并去重并保留各自证据。每个准备上品的候选都必须取得可核实的 shop.tiktok.com 原商品页链接。
- 到 1688 只做货源、SKU、采购价、包装重量尺寸、库存、授权和核价核实，并保存最终链接及备选链接；不要从 1688 页面采集到妙手。
- 自动完成所有只读研究后，在检查点 A 一次性给我候选表、TikTok Shop 原商品页、1688 货源和推荐商品；由我确认商品、供应商、SKU 和国家后再建妙手草稿。
- 从已确认的 shop.tiktok.com 原商品页使用跨境 ERP 助手采集到妙手。妙手只保存完整草稿，并保存 TikTok 来源 SKU、妙手 SKU 与 1688 采购 SKU 的映射。把账号、店铺、两个来源链接、SKU、图片、属性、价格、库存、重量、尺寸和风险全部回读并展示后，在检查点 B 等我回复“批准发布 <RUN_ID>”。没有该批准不得发布。
- 发布后到 TikTok Seller Center 再核对一次店铺、国家和商品，只开启核价与物流通过的国家，并逐 SKU 校验价格、库存、重量和物流。
- 每个商品发布后必须更新 runs/<RUN_ID>/product-record.json 和 automation/data/product-ledger.local.jsonl，至少保存选品来源、TikTok Shop 原商品页、最终 1688 链接、SKU 映射、核价快照、发布商品 ID／链接与审核状态。台账写入和逐行解析未通过时不得宣布完成。
- 本次不自动开启促销、平台活动、达人佣金或广告。

请先检查文件是否齐全、读取计划，然后执行“阶段 0：安装并验证 OpenCLI”和“阶段 1：网址、登录账号与店铺身份闸门”。不要直接进入选品或发布。完成身份检查后向我展示 PASS/FAIL 表，并继续处理所有无需我介入的问题。
```

## 十五、依据与维护

- OpenCLI 安装、Profile、Browser Bridge、Agent Skill 与 browser 命令以 [OpenCLI 官方 README](https://github.com/jackwener/opencli) 和 [opencli-browser 官方 Skill](https://github.com/jackwener/opencli/blob/main/skills/opencli-browser/SKILL.md) 为准。
- OpenCLI 官方要求先 `doctor`，页面交互前先 `state`／`find`，优先使用当前快照 numeric ref，并在页面跳转后等待再检查；这些规则已写入本计划。
- Codex 新对话通过项目文件获得可复核上下文。本计划、优化笔记和两个仓库的 `AGENTS.md` 共同作为交接材料；不要依赖旧对话记忆。
- 业务字段、核价规则和 Seller Center 检查以 [[tiktok_跨境电商（优化版）]] 为准；平台规则与页面会更新，每次运行需记录日期和当前界面。
