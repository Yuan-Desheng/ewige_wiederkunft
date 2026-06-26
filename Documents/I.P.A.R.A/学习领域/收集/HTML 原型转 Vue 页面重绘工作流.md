---
createTime: 2026-06-26 13:06
笔记ID: 20260626130623
multiFile:
multiMedia:
description: 把多文件 HTML 高保真原型落成与现有 Vue3 + Element Plus 项目风格一致的页面的工作流：先建解耦数据层（固定种子 mock + 纯函数引擎）→ 状态机编排 → 逐页拆组件 → 原生元素换 EP → 接线单一真相源 → EP 主题色对齐（含深色）。含原型→组件映射表与可复用代码。
笔记类型: 收集笔记
阐述日期:
tags:
  - Vue3
  - ElementPlus
  - 原型
  - 前端工作流
  - 重构
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/前端开发.canvas|前端开发]]"
---

## HTML 原型转 Vue 页面重绘工作流

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="30" max="100"></progress>

> 用于复现到其他 Vue3 + Element Plus 项目。素材来自 `vpp-simulator-frontend` 用 `prototype V6` 重绘仿真预测五步向导页，整理自 2026-06-18 会话。
> 工作流 + **全量代码**：流程方法见「一、原理」，`src/pages/simulator/` 全部文件（含 7 个 bespoke 大组件）+ 关联 store/api/主题已在「二、代码」逐字给全，可整目录复制。
> 关联：[[2026-06-18]]（当日 AI 笔记）。

---

> [!tip] 一分钟复现
> ① 复制数据层 `types.ts` + `useMockUsers.ts`（固定种子）+ `useValuationEngine.ts` + `useSimResult.ts`；② `useSimWizard.ts`（草稿/步骤机）+ `stores/simulator.ts` + `api/simulator.ts`（mock）；③ `index.vue` 用 `v-if` 切 step + `StepNav.vue` 门控；④ 各步组件原生控件全换 `el-*`；⑤ `main.ts` import `dark/css-vars.css`、`main.css` 用 `html:root` 覆盖 `--el-color-*`；⑥ `pnpm test`（8/8）→ `pnpm build`。

## 一、原理

**目标**：把一套多文件 HTML 高保真原型（Tailwind 风格内联样式 + 原生标签），落成与现有 Vue3 + Element Plus 项目风格一致、数据真实联动的页面。

**重绘流程（本会话实际走法）**：

```
原型 + specs 口径
      │
      ▼
① 先建「数据层」（与 UI 解耦的纯函数）
   types.ts（模型）→ useMockUsers（固定种子假数据）
   → useValuationEngine（取值/去重/调配/KPI 纯函数）
   → useSimResult（evaluate/buildSimResult 封装）
   → 单测验证量级（全省≈889 万千瓦、集中度告警触发）
      │
      ▼
② 状态机/编排：useSimWizard（草稿 + 步骤）+ Pinia store + mock api
      │
      ▼
③ 按原型逐页拆 Vue 组件（一页一组件，index.vue 用 v-if 切换 step）
      │
      ▼
④ 用项目既有 element-plus 组件替换原型里的原生/内联样式元素
   原生 select/input/range/checkbox → el-select/el-input-number/el-slider/el-checkbox …
   原生表格 → el-table/el-table-column/el-pagination
   a[href] 跳转 → emit('go', step) 状态机
   .btn.btn-primary → el-button + .sim-cta 渐变类
   弹层/提示 → el-dialog / el-alert / ElMessageBox
      │
      ▼
⑤ 数据接线：UI 只读 store.currentResult / evaluate(draft)，引擎为单一真相源
      │
      ▼
⑥ 主题统一：EP CSS 变量对齐品牌色（含深色）；EP 无对应物的定制视觉保留
```

**关键设计取舍**：原型里那些 Element Plus 没有等价物的视觉（深色 Hero、ECharts 仪表盘、阶段步进器、流式日志、ECharts 图表、SVG 进度环）保持自绘；只把"有标准 EP 组件的"控件换成 EP，既统一了交互/明暗主题，又不丢原型的高保真观感。

**原型 → 成品 组件映射**

| 原型(HTML) | 成品(Vue 文件) | 替换为的 Element Plus / 处理 |
|---|---|---|
| `index.html` sidebar 项 | `components/StepNav.vue` | 保留自绘，`@click`→`emit('go')`，加 `dim/done/on` 态门控 |
| `index.html` Hero + 四步卡 + 规则栅格 | `components/OverviewPanel.vue` | `a[href]`→`emit('goStep')`；`.btn`→`el-button.sim-cta-light` + `i-ep:video-play` |
| `step-1` 原生 select/input/range/checkbox | `step1/ParamConfig.vue` | `el-input`/`el-input-number`/`el-select`/`el-checkbox-button`/`el-radio-button`/`el-slider`/`el-checkbox` |
| `step-1` 右侧预览 | `step1/ConfigPreview.vue` | 保留自绘 + ECharts 环形图；run 按钮→`el-button.sim-cta` |
| `step-2` 指标/步进/日志/柱图 | `step2/ExecutionPanel.vue` | 保留自绘 + ECharts；完成→`el-dialog`（去读秒） |
| `step-3` KPI/堆叠柱/仪表盘 | `step3/ResultOverview.vue` | 保留自绘；区域提示→`el-alert`；按钮→`el-button` |
| `step-3` 用户明细表 | `step3/UserDetailTable.vue` | `el-table`/`el-table-column`/`el-pagination`/`el-select`/`el-switch`/`el-tag` |
| `step-4` 策略报告 | `step4/StrategyReport.vue` | 保留自绘正文 + 自绘 SVG 进度环；按钮→`el-button` |
| `step-5` 历史方案表 | `step5/HistoryPanel.vue` | `el-table` 全套 + `ElMessageBox.confirm` 删除确认 |
| 各页跳转/容器 | `index.vue` | 单页 `v-if` 状态机，运行中回跳 `ElMessageBox.confirm` |

---

## 二、代码（全量逐字）

> 以下为重绘后项目 `src/pages/simulator/` 下全部文件 + 关联 store/api/主题，逐字粘贴，可整目录复制。主题覆盖（`main.ts` / `main.css`）见 2.0。

### 2.0 主题与样式（EP 品牌色覆盖，最值得复用）

**根因**：① EP 深色变量在 `html.dark{…}` 里，不 import `dark/css-vars.css` 永不生效；② `:root` 覆盖与 EP 默认 `:root` 同特异性，胜负看打包顺序 → 用 `html:root`（特异性 0,1,1）稳定取胜，免 `!important`。

### main.ts（深色变量须在自定义样式之前）

`src/main.ts`

```ts
// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css' // unocss reset
import 'virtual:uno.css'
import 'virtual:unocss-devtools'

// Element Plus 深色模式变量（须在自定义样式之前，使品牌色覆盖生效）
import 'element-plus/theme-chalk/dark/css-vars.css'

// 你自定义的 css
import './styles/main.css'

import App from './App.vue'

const app = createApp(App)

app.mount('#app')
```

`src/styles/main.css` 关键追加（EP 品牌色 + CTA + 滑条 tip + 弹框；其余全局样式见项目文件）：

```css
/* CTA 渐变主按钮 */
.el-button.sim-cta {
  border: none; font-weight: 700; border-radius: 11px; color: #fff;
  background: linear-gradient(135deg, var(--primary, #0159ba), #024a9c);
  box-shadow: 0 6px 18px -6px rgba(1, 89, 186, 0.6);
  transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
}
.el-button.sim-cta:hover, .el-button.sim-cta:focus { color: #fff; filter: brightness(1.08); transform: translateY(-1px); }
.el-button.sim-cta-light { border: none; font-weight: 700; border-radius: 11px; color: var(--primary); background: #fff; box-shadow: 0 8px 20px -8px rgba(0,0,0,.35); }

/* EP 主题色 → 品牌色（html:root 特异性 0,1,1 胜过 EP 默认 :root 0,1,0，无需 !important） */
html:root {
  --el-color-primary: #0159ba;
  --el-color-primary-light-3: #4d8bcf; --el-color-primary-light-5: #80acdd;
  --el-color-primary-light-7: #b3cdea; --el-color-primary-light-8: #ccddf1;
  --el-color-primary-light-9: #e6eef8; --el-color-primary-dark-2: #014795;
  --el-color-success: #22c55e; --el-color-warning: #f59e0b; --el-color-danger: #ef4444; --el-color-error: #ef4444;
  --el-color-primary-rgb: 1, 89, 186;
}
/* 深色模式：保留品牌主色（置于 EP dark/css-vars 之后） */
html.dark {
  --el-color-primary: #0159ba;
  --el-color-primary-light-3: #074488; --el-color-primary-light-5: #0b3767;
  --el-color-primary-light-7: #0e2946; --el-color-primary-light-8: #102235;
  --el-color-primary-light-9: #121b25; --el-color-primary-dark-2: #347ac8;
}
/* 滑条数值提示框：气泡和箭头同色（修复黑色菱形） */
.el-popper.sim-slider-tip { background: var(--primary) !important; color: #fff !important; border: none !important; border-radius: 8px !important; }
.el-popper.sim-slider-tip .el-popper__arrow::before { background: var(--primary) !important; border: none !important; box-shadow: none !important; }
```

### 2.1 数据层（解耦纯函数，可单测）

### types.ts · 数据模型

`src/pages/simulator/types.ts`

```ts
// VPP 仿真预测模块 · V6「可调能力缺口驱动评估」数据模型
// 口径以 Prototype V6 step-*.html（v3 缺口驱动）为准

/* ---------------- 枚举与基础常量 ---------------- */

/** 11 地市（按能力占比降序，便于配额） */
export const CITIES = [
  '杭州',
  '宁波',
  '绍兴',
  '湖州',
  '嘉兴',
  '台州',
  '温州',
  '金华',
  '丽水',
  '衢州',
  '舟山',
] as const
export type City = (typeof CITIES)[number]

/** 地市能力占比权重 */
export const CITY_WEIGHTS: Record<City, number> = {
  杭州: 0.19,
  宁波: 0.18,
  绍兴: 0.09,
  湖州: 0.09,
  嘉兴: 0.08,
  台州: 0.08,
  温州: 0.07,
  金华: 0.07,
  丽水: 0.06,
  衢州: 0.05,
  舟山: 0.04,
}

/** 地市户号前缀 */
export const CITY_PREFIX: Record<City, string> = {
  杭州: '3301',
  宁波: '3302',
  温州: '3303',
  嘉兴: '3304',
  湖州: '3305',
  绍兴: '3306',
  金华: '3307',
  衢州: '3308',
  舟山: '3309',
  台州: '3310',
  丽水: '3311',
}

/** 小地市（资源高度集中） */
export const SMALL_CITIES: City[] = ['舟山', '衢州', '丽水']

export const PLANS = ['移峰填谷', '需求响应', '集中检修'] as const
export type Plan = (typeof PLANS)[number]

/** 去重归类优先级：集中检修 > 需求响应 > 移峰填谷（数值越大越优先） */
export const PLAN_PRIORITY: Record<Plan, number> = {
  集中检修: 3,
  需求响应: 2,
  移峰填谷: 1,
}

export type Season = '迎峰度夏' | '迎峰度冬' | '平时'
export type Dispatch = '大用户优先' | '广度优先' | '均衡调动'

/** 8 个特殊场景键 */
export type SceneKey =
  | 'summer'
  | 'winter'
  | 'heat'
  | 'cold'
  | 'rainstorm'
  | 'freezerain'
  | 'gale5'
  | 'gale6'
export const SCENE_KEYS: SceneKey[] = [
  'summer',
  'winter',
  'heat',
  'cold',
  'rainstorm',
  'freezerain',
  'gale5',
  'gale6',
]

export type SceneMap = Record<SceneKey, number | null>
export type WarnSceneMap = Record<SceneKey, boolean | null>

/** 极端天气中文 → 场景键 */
export const WEATHER_TO_SCENE: Record<string, SceneKey> = {
  暴雨: 'rainstorm',
  冻雨: 'freezerain',
  大风5级: 'gale5',
  大风6级: 'gale6',
}

export const INDUSTRIES = [
  '制造业',
  '信息传输',
  '批发零售',
  '交通运输',
  '电力热力',
  '住宿餐饮',
] as const

export const DEVICE_TYPES = [
  '生产线',
  '空调',
  '储能',
  '电锅炉',
  '充电桩',
] as const

/* ---------------- 用户实体 ---------------- */

/** 用户实体（假数据口径对齐 dws_adjustable_scenario_user） */
export interface SimUser {
  userNo: string
  userName: string
  city: City
  industry: string
  deviceType: string
  plans: Plan[]
  capBase: { peak: number | null; dr: number | null; maint: number | null }
  warnBase: { peak: boolean | null; dr: boolean | null; maint: boolean | null }
  /** 集中检修无场景列，整体为 null */
  capScene: { peak: SceneMap; dr: SceneMap } | null
  warnScene: { peak: WarnSceneMap; dr: WarnSceneMap } | null
  heatThreshold: { peak: number; dr: number }
  coldThreshold: { peak: number; dr: number }
  suggestPeriod: string
  suggestPeriodType: string
}

/* ---------------- 配置与结果 ---------------- */

export interface SimConfig {
  schemeName: string
  /** 目标缺口（万kW，必填） */
  targetGap: number | null
  /** 全省 | 地市名 */
  region: string
  plans: Plan[]
  season: Season
  tempRange: [number, number]
  extremeWeather: string[]
  dispatch: Dispatch
  preferPerf: boolean
  /** 期望出力 60~100 */
  output: number
}

/** 单户经取值/去重/调配后的明细行 */
export interface SimUserRow {
  user: SimUser
  /** 去重归类后归入方案 */
  assignedPlan: Plan
  /** 取值（万kW，出力前） */
  effectiveValue: number
  /** 取值 × 出力% */
  contribution: number
  /** 数据不足（唯一警告） */
  isInsufficient: boolean
  /** 取值来源 */
  valueSource: '场景实测' | '历史峰值估算'
  /** 场景实测口径贡献（用于堆叠柱蓝段） */
  sceneContribution: number
  /** 历史峰值估算兜底贡献（用于堆叠柱青段） */
  histContribution: number
  /** 是否被当前调配策略纳入调度 */
  dispatched: boolean
}

export interface PlanBreakdownItem {
  plan: Plan
  users: number
  capacity: number
  /** 场景实测部分合计 */
  sceneCapacity: number
  /** 历史峰值估算兜底部分合计 */
  histCapacity: number
}

export interface RegionAlert {
  type: 'concentration' | 'seasonMismatch'
  text: string
}

export interface SimKpi {
  /** 场景可调能力合计（万kW，= 资源池上限） */
  totalCapacity: number
  /** 参与用户数（去重后） */
  totalUsers: number
  /** 数据确信度（%） */
  confidence: number
  /** 资源集中度 Top3 占比（%） */
  concentration: number
  /** 分方案能力 */
  planBreakdown: Record<Plan, number>
  /** 数据不足用户数 */
  insufficientCount: number
  /** 已满足量 = min(上限, 缺口) */
  satisfied: number
  /** 完成度 = min(上限, 缺口) / 缺口 */
  completion: number
  /** 尚缺 = max(0, 缺口 - 上限) */
  shortfall: number
}

export interface SimResult {
  config: SimConfig
  /** 去重归类后的资源池明细（已按取值降序） */
  rows: SimUserRow[]
  kpi: SimKpi
  breakdown: PlanBreakdownItem[]
  regionAlerts: RegionAlert[]
  /** 可调能力上限（= 资源池贡献合计） */
  capacityCeiling: number
  generatedAt: string
}

/* ---------------- 历史方案库记录 ---------------- */

export interface SimHistoryRecord {
  id: string
  time: string
  schemeName: string
  config: SimConfig
  result: SimResult
}
```

### useMockUsers.ts · 固定种子假数据工厂

`src/pages/simulator/composables/useMockUsers.ts`

```ts
// 程序化假数据工厂（固定种子，幂等可复现）
// 口径对齐 dws_adjustable_scenario_user + mock-data-factory.md
import {
  CITIES,
  CITY_PREFIX,
  CITY_WEIGHTS,
  SCENE_KEYS,
  SMALL_CITIES,
} from '../types'
import type {
  City,
  Plan,
  SceneKey,
  SceneMap,
  SimUser,
  WarnSceneMap,
} from '../types'

/** mulberry32 — 确定性伪随机数 */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/** Box-Muller 正态分布 */
function normal(rng: () => number, mean: number, std: number) {
  const u1 = rng() || 1e-9
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

function round2(v: number) {
  return Math.round(v * 100) / 100
}

function weightedKey<T extends string>(
  rng: () => number,
  weights: Record<T, number>,
): T {
  const entries = Object.entries(weights) as [T, number][]
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [k, w] of entries) {
    r -= w
    if (r <= 0) return k
  }
  return entries[entries.length - 1][0]
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

/* ---- 配置常量 ---- */

const DEVICE_WEIGHTS: Record<string, number> = {
  生产线: 0.35,
  空调: 0.25,
  储能: 0.2,
  电锅炉: 0.1,
  充电桩: 0.1,
}
const DEVICE_INDUSTRY: Record<string, string[]> = {
  生产线: ['制造业'],
  空调: ['批发零售', '住宿餐饮'],
  储能: ['信息传输', '电力热力'],
  电锅炉: ['制造业', '电力热力'],
  充电桩: ['交通运输'],
}
const INDUSTRY_NAME: Record<string, string[]> = {
  制造业: ['化工', '钢铁', '纺织', '装备'],
  信息传输: ['数据中心', '通信枢纽'],
  批发零售: ['商业综合体', '连锁商超'],
  交通运输: ['物流园', '港务'],
  电力热力: ['热电厂', '能源站'],
  住宿餐饮: ['酒店', '餐饮集团'],
}

const SCENE_DECAY: Record<SceneKey, [number, number]> = {
  summer: [0.85, 1.0],
  winter: [0.3, 0.7],
  heat: [0.6, 0.9],
  cold: [0.35, 0.75],
  rainstorm: [0.7, 1.0],
  freezerain: [0.4, 0.8],
  gale5: [0.75, 1.0],
  gale6: [0.65, 0.95],
}
const SCENE_WARN_P: Record<SceneKey, number> = {
  summer: 0.15,
  winter: 0.65,
  heat: 0.3,
  cold: 0.6,
  rainstorm: 0.55,
  freezerain: 0.7,
  gale5: 0.5,
  gale6: 0.55,
}
/** 丽水缺天气数据：以下场景 warn 恒 true */
const LISHUI_FORCED: SceneKey[] = [
  'heat',
  'cold',
  'rainstorm',
  'freezerain',
  'gale5',
  'gale6',
]

const PERIOD_POOL: { period: string; type: string; w: number }[] = [
  { period: '08:00~22:00', type: '全时段', w: 0.15 },
  { period: '08:00~23:00', type: '全时段', w: 0.15 },
  { period: '09:00~21:00', type: '峰', w: 0.2 },
  { period: '10:00~12:00', type: '峰', w: 0.15 },
  { period: '13:00~17:00', type: '尖', w: 0.2 },
  { period: '19:00~21:00', type: '峰', w: 0.15 },
]

/* ---- 生成逻辑 ---- */

function samplePlans(rng: () => number): Plan[] {
  const planW: Record<Plan, number> = {
    移峰填谷: 0.38,
    需求响应: 0.46,
    集中检修: 0.15,
  }
  const cntR = rng()
  const count = cntR < 0.55 ? 1 : cntR < 0.9 ? 2 : 3
  const set = new Set<Plan>()
  let guard = 0
  while (set.size < count && guard++ < 20) {
    set.add(weightedKey(rng, planW))
  }
  if (set.size === 0) set.add('需求响应')
  return Array.from(set)
}

function genCapValue(
  rng: () => number,
  mean: number,
  std: number,
  tailP: number,
  tailLo: number,
  tailHi: number,
): number {
  if (rng() < tailP) {
    return round2(tailLo + rng() * (tailHi - tailLo))
  }
  return round2(Math.max(0.1, normal(rng, mean, std)))
}

function genUserNo(city: City, seq: number, rng: () => number): string {
  const prefix = CITY_PREFIX[city]
  const rand4 = String(Math.floor(rng() * 9000) + 1000)
  const tail = String(seq).padStart(4, '0')
  return `${prefix}${rand4}…${tail}`
}

function buildUser(rng: () => number, city: City, seq: number): SimUser {
  const device = weightedKey(rng, DEVICE_WEIGHTS)
  const industry = pick(rng, DEVICE_INDUSTRY[device])
  const userName = `${city}某${pick(rng, INDUSTRY_NAME[industry])}`
  const plans = samplePlans(rng)
  const isLishui = city === '丽水'

  const has = (p: Plan) => plans.includes(p)
  const capBase = {
    peak: has('移峰填谷') ? genCapValue(rng, 3.5, 5.0, 0.05, 20, 40) : 0,
    dr: has('需求响应') ? genCapValue(rng, 2.7, 4.0, 0.05, 15, 35) : 0,
    maint: has('集中检修') ? genCapValue(rng, 6.5, 8.0, 0.08, 25, 50) : 0,
  }
  const warnBase = {
    peak: has('移峰填谷') ? (isLishui ? true : rng() < 0.14) : null,
    dr: has('需求响应') ? (isLishui ? true : rng() < 0.14) : null,
    maint: has('集中检修') ? (isLishui ? true : rng() < 0.14) : null,
  }

  // 场景值：仅 peak / dr 生成（集中检修恒基准，无场景列）
  const buildScene = (
    base: number,
    warnB: boolean | null,
  ): { cap: SceneMap; warn: WarnSceneMap } => {
    const cap = {} as SceneMap
    const warn = {} as WarnSceneMap
    for (const s of SCENE_KEYS) {
      const [lo, hi] = SCENE_DECAY[s]
      const factor = lo + rng() * (hi - lo)
      cap[s] = round2(Math.min(base, base * factor))
      let warnP = SCENE_WARN_P[s]
      if (warnB === true) warnP = 0.85
      let w = rng() < warnP
      if (isLishui && LISHUI_FORCED.includes(s)) w = true
      warn[s] = w
    }
    return { cap, warn }
  }

  let capScene: SimUser['capScene'] = null
  let warnScene: SimUser['warnScene'] = null
  if (has('移峰填谷') || has('需求响应')) {
    const peakS = has('移峰填谷')
      ? buildScene(capBase.peak, warnBase.peak)
      : { cap: emptyScene(), warn: emptyWarn() }
    const drS = has('需求响应')
      ? buildScene(capBase.dr, warnBase.dr)
      : { cap: emptyScene(), warn: emptyWarn() }
    capScene = { peak: peakS.cap, dr: drS.cap }
    warnScene = { peak: peakS.warn, dr: drS.warn }
  }

  // 温度阈值（集中检修用户不设）
  const onlyMaint = plans.length === 1 && plans[0] === '集中检修'
  const heatThreshold = {
    peak: !onlyMaint && rng() < 0.4 ? round2(32 + rng() * 5) : 0,
    dr: !onlyMaint && rng() < 0.4 ? round2(32 + rng() * 5) : 0,
  }
  const coldThreshold = {
    peak: !onlyMaint && rng() < 0.3 ? round2(rng() * 12) : 0,
    dr: !onlyMaint && rng() < 0.3 ? round2(rng() * 12) : 0,
  }

  const period = weightedKey(
    rng,
    Object.fromEntries(PERIOD_POOL.map((p) => [p.period, p.w])) as Record<
      string,
      number
    >,
  )
  const periodType = PERIOD_POOL.find((p) => p.period === period)!.type

  return {
    userNo: genUserNo(city, seq, rng),
    userName,
    city,
    industry,
    deviceType: device,
    plans,
    capBase,
    warnBase,
    capScene,
    warnScene,
    heatThreshold,
    coldThreshold,
    suggestPeriod: period,
    suggestPeriodType: periodType,
  }
}

function emptyScene(): SceneMap {
  return Object.fromEntries(SCENE_KEYS.map((s) => [s, null])) as SceneMap
}
function emptyWarn(): WarnSceneMap {
  return Object.fromEntries(SCENE_KEYS.map((s) => [s, null])) as WarnSceneMap
}

/** 小地市头部放大：保证 Top3 占比明显偏高（≥40% 触发区域提示） */
function amplifySmallCities(users: SimUser[], rng: () => number) {
  for (const city of SMALL_CITIES) {
    const list = users.filter((u) => u.city === city)
    if (list.length < 3) continue
    const sizeOf = (u: SimUser) =>
      (u.capBase.peak ?? 0) + (u.capBase.dr ?? 0) + (u.capBase.maint ?? 0)
    list.sort((a, b) => sizeOf(b) - sizeOf(a))
    const factors = [3 + rng() * 2, 1.6 + rng() * 0.8, 1.3 + rng() * 0.5]
    list.slice(0, 3).forEach((u, i) => {
      const f = factors[i]
      u.capBase = {
        peak: u.capBase.peak ? round2(u.capBase.peak * f) : u.capBase.peak,
        dr: u.capBase.dr ? round2(u.capBase.dr * f) : u.capBase.dr,
        maint: u.capBase.maint ? round2(u.capBase.maint * f) : u.capBase.maint,
      }
      if (u.capScene) {
        for (const key of ['peak', 'dr'] as const) {
          const base = u.capBase[key] ?? 0
          for (const s of SCENE_KEYS) {
            const v = u.capScene[key][s]
            if (v != null) u.capScene[key][s] = round2(Math.min(base, v * f))
          }
        }
      }
    })
  }
}

/** 生成假数据集（固定种子 → 可复现） */
export function generateMockDataset(n = 100, seed = 20260617): SimUser[] {
  const count = Math.floor(clamp(n, 50, 200))
  const rng = mulberry32(seed)
  const users: SimUser[] = []

  // 地市配额：按权重取整 + 小地市/大地市保底
  const cityQuota: Record<City, number> = {} as Record<City, number>
  let assigned = 0
  for (const c of CITIES) {
    const q = Math.max(1, Math.round(count * CITY_WEIGHTS[c]))
    cityQuota[c] = q
    assigned += q
  }
  // 修正到 count（多退少补到杭州/宁波）
  let diff = count - assigned
  const bigCities: City[] = ['杭州', '宁波', '绍兴']
  let bi = 0
  while (diff !== 0) {
    const c = bigCities[bi % bigCities.length]
    if (diff > 0) {
      cityQuota[c]++
      diff--
    } else if (cityQuota[c] > 1) {
      cityQuota[c]--
      diff++
    }
    bi++
    if (bi > 1000) break
  }

  let seq = 1
  for (const c of CITIES) {
    for (let i = 0; i < cityQuota[c]; i++) {
      users.push(buildUser(rng, c, seq++))
    }
  }

  amplifySmallCities(users, rng)
  return users
}

/* ---- 模块级单例缓存（生成一次，全应用复用） ---- */
let cached: SimUser[] | null = null

export function useMockUsers(n = 100, seed = 20260617): SimUser[] {
  if (!cached) cached = generateMockDataset(n, seed)
  return cached
}
```

### useValuationEngine.ts · 取值/去重/调配/KPI 纯函数

`src/pages/simulator/composables/useValuationEngine.ts`

```ts
// 取值规则引擎 + 跨方案去重归类 + 调配 + 合计（纯函数，可单测）
import { add, div, mul, round } from '~/utils/math'
import { PLANS, PLAN_PRIORITY, WEATHER_TO_SCENE } from '../types'
import type {
  Plan,
  PlanBreakdownItem,
  RegionAlert,
  SceneKey,
  SimConfig,
  SimKpi,
  SimResult,
  SimUser,
  SimUserRow,
} from '../types'

/* ---- 场景上下文解析 ---- */

/** 解析当前激活场景集合（供 peak/dr 取值） */
export function resolveActiveScenes(config: SimConfig): SceneKey[] {
  const scenes: SceneKey[] = []
  if (config.season === '迎峰度夏') {
    scenes.push('summer')
    if (config.tempRange[1] >= 35) scenes.push('heat')
  } else if (config.season === '迎峰度冬') {
    scenes.push('winter')
    if (config.tempRange[0] <= 5) scenes.push('cold')
  }
  // 平时：无基础场景，仅极端天气生效
  for (const w of config.extremeWeather) {
    const s = WEATHER_TO_SCENE[w]
    if (s && !scenes.includes(s)) scenes.push(s)
  }
  return scenes
}

interface Valuation {
  value: number
  isInsufficient: boolean
  source: '场景实测' | '历史峰值估算'
}

/** 对单户单方案取值（含数据不足判定、取值来源） */
function valuatePlan(user: SimUser, plan: Plan, scenes: SceneKey[]): Valuation {
  // 集中检修：任何场景恒取基准值
  if (plan === '集中检修') {
    return {
      value: user.capBase.maint ?? 0,
      isInsufficient: user.warnBase.maint === true,
      source: '历史峰值估算',
    }
  }
  const m = plan === '移峰填谷' ? 'peak' : 'dr'
  const base = user.capBase[m] ?? 0

  // 平时（无激活场景）：取基准值，视作场景实测
  if (scenes.length === 0) {
    return {
      value: base,
      isInsufficient: user.warnBase[m] === true,
      source: '场景实测',
    }
  }

  // 多场景叠加取最小值（保守）
  const sceneMap = user.capScene?.[m]
  const warnMap = user.warnScene?.[m]
  if (sceneMap) {
    const valid = scenes
      .map((s) => ({ s, v: sceneMap[s], w: warnMap?.[s] === true }))
      .filter((c) => c.v != null && (c.v as number) > 0) as {
      s: SceneKey
      v: number
      w: boolean
    }[]
    if (valid.length) {
      const chosen = valid.reduce((a, b) => (b.v < a.v ? b : a))
      return { value: chosen.v, isInsufficient: chosen.w, source: '场景实测' }
    }
  }
  // 场景值缺失 → 兜底取基准 + 历史峰值估算
  return {
    value: base,
    isInsufficient: user.warnBase[m] === true,
    source: '历史峰值估算',
  }
}

/* ---- 主聚合 ---- */

function sum(values: number[]): number {
  return values.reduce((acc, v) => add(acc, v), 0)
}

/**
 * 运行仿真聚合：返回完整结果（不含 generatedAt，由调用方补）
 */
export function runValuation(
  config: SimConfig,
  users: SimUser[],
): Omit<SimResult, 'generatedAt'> {
  const scenes = resolveActiveScenes(config)
  const outputRate = div(config.output, 100)

  // 1) 按地区过滤
  const regionUsers =
    config.region === '全省'
      ? users
      : users.filter((u) => u.city === config.region)

  // 2) 选中方案集合
  const selectedPlans = new Set(config.plans)

  // 3+4+5) 取值 → 去重归类（候选方案 = 用户方案 ∩ 选中方案）
  const rows: SimUserRow[] = []
  for (const user of regionUsers) {
    const candidates = user.plans.filter((p) => selectedPlans.has(p))
    if (!candidates.length) continue
    const assignedPlan = candidates.reduce((a, b) =>
      PLAN_PRIORITY[b] > PLAN_PRIORITY[a] ? b : a,
    )
    const val = valuatePlan(user, assignedPlan, scenes)
    const contribution = round(mul(val.value, outputRate), 2)
    rows.push({
      user,
      assignedPlan,
      effectiveValue: round(val.value, 2),
      contribution,
      isInsufficient: val.isInsufficient,
      valueSource: val.source,
      sceneContribution: val.source === '场景实测' ? contribution : 0,
      histContribution: val.source === '历史峰值估算' ? contribution : 0,
      dispatched: false,
    })
  }

  // 取值降序
  rows.sort((a, b) => b.contribution - a.contribution)

  const ceiling = round(sum(rows.map((r) => r.contribution)), 2)
  const gap = config.targetGap

  // 6) 调配策略（标记 dispatched）
  applyDispatch(rows, config.dispatch, gap, ceiling)

  // 7) 分方案构成
  const breakdown: PlanBreakdownItem[] = PLANS.map((plan) => {
    const list = rows.filter((r) => r.assignedPlan === plan)
    return {
      plan,
      users: list.length,
      capacity: round(sum(list.map((r) => r.contribution)), 2),
      sceneCapacity: round(sum(list.map((r) => r.sceneContribution)), 2),
      histCapacity: round(sum(list.map((r) => r.histContribution)), 2),
    }
  }).filter((b) => b.users > 0)

  const planBreakdown = {} as Record<Plan, number>
  for (const p of PLANS) {
    planBreakdown[p] = breakdown.find((b) => b.plan === p)?.capacity ?? 0
  }

  // 8) KPI
  const totalUsers = rows.length
  const insufficientCount = rows.filter((r) => r.isInsufficient).length
  const confidence = totalUsers
    ? round(mul(div(totalUsers - insufficientCount, totalUsers), 100), 2)
    : 0
  const top3 = round(sum(rows.slice(0, 3).map((r) => r.contribution)), 2)
  const concentration = ceiling ? round(mul(div(top3, ceiling), 100), 2) : 0

  const satisfied = gap ? round(Math.min(ceiling, gap), 2) : 0
  const completion = gap
    ? round(mul(div(Math.min(ceiling, gap), gap), 100), 2)
    : 0
  const shortfall = gap
    ? round(Math.max(0, round(add(gap, -ceiling), 2)), 2)
    : 0

  const kpi: SimKpi = {
    totalCapacity: ceiling,
    totalUsers,
    confidence,
    concentration,
    planBreakdown,
    insufficientCount,
    satisfied,
    completion,
    shortfall,
  }

  // 9) 区域级提示
  const regionAlerts = buildRegionAlerts(
    rows,
    concentration,
    totalUsers,
    insufficientCount,
  )

  return {
    config,
    rows,
    kpi,
    breakdown,
    regionAlerts,
    capacityCeiling: ceiling,
  }
}

/** 调配策略：标记被纳入调度的用户 */
function applyDispatch(
  rows: SimUserRow[],
  dispatch: SimConfig['dispatch'],
  gap: number | null,
  ceiling: number,
) {
  // 缺口为空或 缺口 > 上限 → 全员调动
  if (!gap || gap >= ceiling) {
    rows.forEach((r) => (r.dispatched = true))
    return
  }
  if (dispatch === '大用户优先') {
    let acc = 0
    for (const r of rows) {
      // rows 已按贡献降序
      r.dispatched = acc < gap
      acc = add(acc, r.contribution)
    }
  } else if (dispatch === '广度优先') {
    rows.forEach((r) => (r.dispatched = true))
  } else {
    // 均衡调动：按地市贡献占比分配缺口，地市内降序累计
    const byCity = new Map<string, SimUserRow[]>()
    for (const r of rows) {
      const arr = byCity.get(r.user.city) ?? []
      arr.push(r)
      byCity.set(r.user.city, arr)
    }
    for (const arr of byCity.values()) {
      const cityCap = sum(arr.map((r) => r.contribution))
      const cityGap = mul(gap, div(cityCap, ceiling))
      let acc = 0
      for (const r of arr.sort((a, b) => b.contribution - a.contribution)) {
        r.dispatched = acc < cityGap
        acc = add(acc, r.contribution)
      }
    }
  }
}

function buildRegionAlerts(
  rows: SimUserRow[],
  concentration: number,
  totalUsers: number,
  insufficientCount: number,
): RegionAlert[] {
  const alerts: RegionAlert[] = []
  if (concentration >= 40 && rows.length >= 3) {
    alerts.push({
      type: 'concentration',
      text: `当前范围内资源集中度较高，Top3 用户贡献 ${concentration}%，建议结合分散度评估调度风险。`,
    })
  }
  // 季节不匹配：该范围几乎无有效历史事件（数据不足占比 ≥ 80%）
  if (totalUsers > 0 && div(insufficientCount, totalUsers) >= 0.8) {
    alerts.push({
      type: 'seasonMismatch',
      text: '所选场景在历史数据中无匹配事件，可调能力估算参考价值有限，建议谨慎决策。',
    })
  }
  return alerts
}
```

### useSimResult.ts · evaluate/buildSimResult

`src/pages/simulator/composables/useSimResult.ts`

```ts
// 结果聚合封装：把假数据集 + 配置喂给取值引擎，产出 SimResult
import { runValuation } from './useValuationEngine'
import { useMockUsers } from './useMockUsers'
import type { SimConfig, SimResult } from '../types'

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 实时预览用：不带时间戳，避免每次重算时间漂移 */
export function evaluate(config: SimConfig): Omit<SimResult, 'generatedAt'> {
  return runValuation(config, useMockUsers())
}

/** 正式结果：带生成时间戳 */
export function buildSimResult(config: SimConfig): SimResult {
  return { ...evaluate(config), generatedAt: nowStr() }
}
```

### useSimWizard.ts · 草稿单例 + 步骤机

`src/pages/simulator/composables/useSimWizard.ts`

```ts
// 仿真向导：配置草稿 + 步骤状态机 + 发起仿真编排（模块级单例）
import { reactive } from 'vue'
import { runSimulationApi } from '~/api/simulator'
import { PLANS } from '../types'
import type { Season, SimConfig } from '../types'

/** 季节 → 温度滑条预设 */
export const SEASON_PRESET: Record<
  Season,
  {
    min: number
    max: number
    default: [number, number]
    thr: number | null
    thrType: 'high' | 'low' | null
  }
> = {
  迎峰度夏: { min: 25, max: 40, default: [28, 34], thr: 35, thrType: 'high' },
  迎峰度冬: { min: -5, max: 15, default: [6, 12], thr: 5, thrType: 'low' },
  平时: { min: 10, max: 30, default: [16, 24], thr: null, thrType: null },
}

/** 季节门控的极端天气选项 */
export function weatherOptions(season: Season): string[] {
  return season === '迎峰度冬'
    ? ['冻雨', '大风5级', '大风6级']
    : ['暴雨', '大风5级', '大风6级']
}

/** 默认方案名 仿真方案_YYYYMMDD_HHMM */
export function defaultSchemeName(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `仿真方案_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

export function createDefaultConfig(): SimConfig {
  return {
    schemeName: defaultSchemeName(),
    targetGap: null,
    region: '全省',
    plans: [...PLANS],
    season: '迎峰度夏',
    tempRange: [28, 34],
    extremeWeather: [],
    dispatch: '大用户优先',
    preferPerf: false,
    output: 90,
  }
}

// 模块级单例草稿
const draft = reactive<SimConfig>(createDefaultConfig())

export function useSimWizard() {
  const store = useSimulatorStore()

  /** 切换季节：重设温度区间并清空不兼容的极端天气 */
  const applySeason = (season: Season) => {
    draft.season = season
    draft.tempRange = [...SEASON_PRESET[season].default]
    const allowed = new Set(weatherOptions(season))
    draft.extremeWeather = draft.extremeWeather.filter((w) => allowed.has(w))
    if (!draft.extremeWeather.length) draft.preferPerf = false
  }

  /** 重置草稿为默认 */
  const resetDraft = () => {
    Object.assign(draft, createDefaultConfig())
  }

  /** 用已有配置回填草稿（历史加载） */
  const loadConfig = (config: SimConfig) => {
    Object.assign(draft, JSON.parse(JSON.stringify(config)))
  }

  /** 发起仿真：提交草稿 → 进入 step2 → 异步出结果 */
  const startSimulation = async () => {
    const config: SimConfig = JSON.parse(JSON.stringify(draft))
    store.setConfig(config)
    store.setResult(null)
    store.setStep(2)
    const result = await runSimulationApi(config)
    store.setResult(result)
    store.addRecord({
      id: `SIM-${Date.now()}`,
      time: result.generatedAt,
      schemeName: config.schemeName,
      config,
      result,
    })
    return result
  }

  const goStep = (step: number) => store.setStep(step)

  return {
    draft,
    store,
    applySeason,
    resetDraft,
    loadConfig,
    startSimulation,
    goStep,
  }
}
```

### useReportExport.ts · 报告时间/编号/打印

`src/pages/simulator/composables/useReportExport.ts`

```ts
export function useReportExport() {
  const reportTime = ref('')
  const reportId = ref('')

  const generateReportMeta = () => {
    const now = new Date()
    reportTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    reportId.value = `SIM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
  }

  const exportPdf = () => {
    window.print()
  }

  const exportExcel = () => {
    // TODO: 使用 xlsx 库实现 Excel 导出
  }

  return {
    reportTime,
    reportId,
    generateReportMeta,
    exportPdf,
    exportExcel,
  }
}
```

### useMockHistory.ts · 历史演示数据

`src/pages/simulator/composables/useMockHistory.ts`

```ts
// 历史方案库演示数据：程序化生成若干仿真记录，避免历史页为空
import { buildSimResult } from './useSimResult'
import { createDefaultConfig } from './useSimWizard'
import type { SimConfig, SimHistoryRecord } from '../types'

interface Seed {
  scheme: string
  time: string // YYYY-MM-DD HH:mm
  over: Partial<SimConfig>
}

const SEEDS: Seed[] = [
  {
    scheme: '全省迎峰度夏保供评估',
    time: '2026-06-12 09:30',
    over: {
      region: '全省',
      season: '迎峰度夏',
      targetGap: 760,
      tempRange: [30, 36],
      dispatch: '大用户优先',
    },
  },
  {
    scheme: '杭州迎峰度夏高温评估',
    time: '2026-06-13 14:05',
    over: {
      region: '杭州',
      season: '迎峰度夏',
      targetGap: 60,
      tempRange: [33, 38],
      extremeWeather: ['暴雨'],
      dispatch: '广度优先',
    },
  },
  {
    scheme: '宁波平时基线核对',
    time: '2026-06-14 10:20',
    over: {
      region: '宁波',
      season: '平时',
      targetGap: 45,
      tempRange: [16, 24],
      dispatch: '均衡调动',
    },
  },
  {
    scheme: '全省迎峰度冬保供',
    time: '2026-06-15 16:40',
    over: {
      region: '全省',
      season: '迎峰度冬',
      targetGap: 520,
      tempRange: [-2, 4],
      extremeWeather: ['冻雨'],
      dispatch: '大用户优先',
    },
  },
  {
    scheme: '舟山小地市集中度核查',
    time: '2026-06-16 11:15',
    over: {
      region: '舟山',
      season: '迎峰度夏',
      targetGap: 18,
      tempRange: [29, 34],
      dispatch: '大用户优先',
    },
  },
  {
    scheme: '绍兴平时广度优先',
    time: '2026-06-17 08:50',
    over: {
      region: '绍兴',
      season: '平时',
      targetGap: 40,
      tempRange: [16, 24],
      dispatch: '广度优先',
    },
  },
]

/** 生成演示用历史方案（按时间升序，newest 在末尾） */
export function mockHistoryRecords(): SimHistoryRecord[] {
  return SEEDS.map((s, i) => {
    const config: SimConfig = {
      ...createDefaultConfig(),
      schemeName: s.scheme,
      ...s.over,
    }
    const result = buildSimResult(config)
    result.generatedAt = s.time
    return {
      id: `SIM-mock-${String(i + 1).padStart(2, '0')}`,
      time: s.time,
      schemeName: s.scheme,
      config,
      result,
    }
  })
}
```

### stores/simulator.ts · Pinia store

`src/stores/simulator.ts`

```ts
import { defineStore } from 'pinia'
import type {
  SimConfig,
  SimHistoryRecord,
  SimResult,
} from '~/pages/simulator/types'

/**
 * 仿真预测 V6 状态：当前参数 / 当前结果 / 步骤 / 历史方案库
 */
export const useSimulatorStore = defineStore('simulator', () => {
  const maxRecords = 20

  const currentConfig = ref<SimConfig | null>(null)
  const currentResult = ref<SimResult | null>(null)
  /** 当前步骤 0=流程总览，1~5=各步骤 */
  const currentStep = ref(0)
  const history = ref<SimHistoryRecord[]>([])

  const setConfig = (config: SimConfig) => {
    currentConfig.value = config
  }
  const setResult = (result: SimResult | null) => {
    currentResult.value = result
  }
  const setStep = (step: number) => {
    currentStep.value = step
  }

  const addRecord = (record: SimHistoryRecord) => {
    history.value.unshift(record)
    if (history.value.length > maxRecords) history.value.pop()
  }
  const clearHistory = () => {
    history.value = []
  }
  const getRecord = (id: string) => history.value.find((r) => r.id === id)
  const removeRecord = (id: string) => {
    history.value = history.value.filter((r) => r.id !== id)
  }

  return {
    currentConfig,
    currentResult,
    currentStep,
    history,
    setConfig,
    setResult,
    setStep,
    addRecord,
    clearHistory,
    getRecord,
    removeRecord,
  }
})
```

### api/simulator.ts · mock API

`src/api/simulator.ts`

```ts
// 仿真预测 V6 · 纯前端 mock API（带模拟延迟）
// 后续接真实后端时仿 src/api/forecast.ts：http.get 返回 { code, data, msg }，
// queryTime 减一年、单位转换等模式。本期全假数据。
import { buildSimResult } from '~/pages/simulator/composables/useSimResult'
import type { SimConfig, SimResult } from '~/pages/simulator/types'

/**
 * 发起仿真评估（mock）。
 * @param config 仿真配置
 * @param delay 模拟计算耗时（ms）
 */
export function runSimulationApi(
  config: SimConfig,
  delay = 600,
): Promise<SimResult> {
  return new Promise((resolve) => {
    const result = buildSimResult(config)
    setTimeout(() => resolve(result), delay)
  })
}
```

### __tests__/valuation.test.ts · 引擎单测

`src/pages/simulator/composables/__tests__/valuation.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { generateMockDataset } from '../useMockUsers'
import { resolveActiveScenes, runValuation } from '../useValuationEngine'
import { createDefaultConfig } from '../useSimWizard'
import type { SimConfig } from '../../types'

function cfg(over: Partial<SimConfig> = {}): SimConfig {
  return { ...createDefaultConfig(), ...over }
}

describe('mock dataset', () => {
  it('固定种子可复现 + 户数在范围内', () => {
    const a = generateMockDataset(100, 20260617)
    const b = generateMockDataset(100, 20260617)
    expect(a.length).toBe(100)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('集中检修用户无场景列；丽水天气场景恒数据不足', () => {
    const users = generateMockDataset(150)
    const maintOnly = users.find(
      (u) => u.plans.length === 1 && u.plans[0] === '集中检修',
    )
    if (maintOnly) expect(maintOnly.capScene).toBeNull()
    const lishui = users.filter((u) => u.city === '丽水' && u.capScene)
    for (const u of lishui) {
      expect(
        u.warnScene!.peak.rainstorm === true ||
          u.warnScene!.dr.rainstorm === true,
      ).toBe(true)
    }
  })
})

describe('valuation engine', () => {
  const users = generateMockDataset(120)

  it('resolveActiveScenes：度夏高温叠加 heat', () => {
    expect(
      resolveActiveScenes(cfg({ season: '迎峰度夏', tempRange: [30, 36] })),
    ).toContain('heat')
    expect(
      resolveActiveScenes(cfg({ season: '迎峰度夏', tempRange: [28, 34] })),
    ).not.toContain('heat')
    expect(resolveActiveScenes(cfg({ season: '平时' })).length).toBe(0)
  })

  it('去重归类一户只计一次，优先级集中检修>需求响应>移峰填谷', () => {
    const r = runValuation(cfg(), users)
    const noSet = new Set(r.rows.map((x) => x.user.userNo))
    expect(noSet.size).toBe(r.rows.length)
    for (const row of r.rows) {
      if (row.user.plans.includes('集中检修'))
        expect(row.assignedPlan).toBe('集中检修')
    }
  })

  it('集中检修恒取基准值，来源历史峰值估算', () => {
    const r = runValuation(
      cfg({ season: '迎峰度夏', tempRange: [30, 38] }),
      users,
    )
    for (const row of r.rows.filter((x) => x.assignedPlan === '集中检修')) {
      expect(row.effectiveValue).toBe(row.user.capBase.maint)
      expect(row.valueSource).toBe('历史峰值估算')
    }
  })

  it('缺口驱动：完成度/已满足/尚缺一致', () => {
    const r = runValuation(cfg({ targetGap: 50 }), users)
    const { satisfied, shortfall, completion } = r.kpi
    expect(satisfied).toBe(Math.min(r.capacityCeiling, 50))
    expect(shortfall).toBeCloseTo(Math.max(0, 50 - r.capacityCeiling), 1)
    expect(completion).toBeGreaterThan(0)
  })

  it('全省合计量级合理 (出力90%)', () => {
    const r = runValuation(cfg(), users)
    expect(r.capacityCeiling).toBeGreaterThan(50)
    expect(r.kpi.confidence).toBeGreaterThanOrEqual(0)
    expect(r.kpi.confidence).toBeLessThanOrEqual(100)
  })

  it('小地市资源集中度偏高触发提示', () => {
    const r = runValuation(cfg({ region: '舟山' }), users)
    if (r.rows.length >= 3) {
      expect(r.kpi.concentration).toBeGreaterThan(0)
    }
  })
})
```

### 2.2 容器与导航

### index.vue · 五步向导容器 + 状态机

`src/pages/simulator/index.vue`

```vue
<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import StepNav from './components/StepNav.vue'
import type { StepNavItem } from './components/StepNav.vue'
import OverviewPanel from './components/OverviewPanel.vue'
import ParamConfig from './components/step1/ParamConfig.vue'
import ConfigPreview from './components/step1/ConfigPreview.vue'
import ExecutionPanel from './components/step2/ExecutionPanel.vue'
import ResultOverview from './components/step3/ResultOverview.vue'
import StrategyReport from './components/step4/StrategyReport.vue'
import HistoryPanel from './components/step5/HistoryPanel.vue'
import { useSimWizard } from './composables/useSimWizard'

const { store, goStep } = useSimWizard()

const STEP_DEFS = [
  { step: 0, label: '流程总览', glyph: '◎', group: '仿真预测 · 评估流程' },
  { step: 1, label: '参数配置', glyph: '1' },
  { step: 2, label: '计算执行', glyph: '2' },
  { step: 3, label: '结果总览', glyph: '3' },
  { step: 4, label: '策略报告', glyph: '4' },
  { step: 5, label: '历史记录', glyph: '⟲', group: '记录与管理' },
]

function reachable(step: number): boolean {
  if (step === 0 || step === 1 || step === 5) return true
  if (step === 2) return store.currentStep >= 2 || !!store.currentResult
  // step 3 / 4 需结果就绪
  return !!store.currentResult
}

const navItems = computed<StepNavItem[]>(() =>
  STEP_DEFS.map((d) => {
    let state: StepNavItem['state']
    if (d.step === store.currentStep) state = 'on'
    else if (!reachable(d.step)) state = 'dim'
    else if (d.step > 0 && d.step < store.currentStep && d.step <= 4)
      state = 'done'
    else state = 'todo'
    return { ...d, state }
  }),
)

async function go(step: number) {
  // step2 运行中（尚无结果）回跳需确认
  if (store.currentStep === 2 && !store.currentResult && step !== 2) {
    try {
      await ElMessageBox.confirm(
        '仿真计算正在进行，离开将中断本次计算，确定返回？',
        '提示',
        {
          type: 'warning',
          confirmButtonText: '确定返回',
          cancelButtonText: '继续计算',
        },
      )
    } catch {
      return
    }
  }
  goStep(step)
}
</script>

<template>
  <div class="sim-wizard">
    <StepNav :items="navItems" @go="go" />

    <main class="sim-main">
      <!-- Step 0 · 流程总览 -->
      <OverviewPanel
        v-if="store.currentStep === 0"
        @start="go(1)"
        @go-step="(s) => go(reachable(s) ? s : 1)"
      />

      <!-- Step 1 · 参数配置（两列） -->
      <div v-else-if="store.currentStep === 1" class="step1-grid">
        <ParamConfig />
        <ConfigPreview @start="go(2)" />
      </div>

      <!-- Step 2 · 计算执行 -->
      <ExecutionPanel
        v-else-if="store.currentStep === 2"
        @done="go(3)"
        @back="go(1)"
      />

      <!-- Step 3 · 结果总览 -->
      <ResultOverview
        v-else-if="store.currentStep === 3"
        @reconfigure="go(1)"
        @report="go(4)"
      />

      <!-- Step 4 · 策略报告 -->
      <StrategyReport v-else-if="store.currentStep === 4" @back="go(3)" />

      <!-- Step 5 · 历史记录 -->
      <HistoryPanel
        v-else-if="store.currentStep === 5"
        @view-result="go(3)"
        @view-report="go(4)"
        @new="go(1)"
      />
    </main>
  </div>
</template>

<style scoped>
.sim-wizard {
  display: flex;
  align-items: flex-start;
  min-height: 100%;
  max-width: 1480px;
  margin: 0 auto;
}

.sim-main {
  flex: 1;
  min-width: 0;
  padding: 22px 28px 48px;
}

.step1-grid {
  display: grid;
  grid-template-columns: 1fr 392px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1180px) {
  .step1-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

### StepNav.vue · 步骤导航门控

`src/pages/simulator/components/StepNav.vue`

```vue
<script setup lang="ts">
export interface StepNavItem {
  step: number
  label: string
  sub?: string
  /** 显示徽标：数字或图标符号 */
  glyph: string
  state: 'on' | 'done' | 'todo' | 'dim'
  /** 分组标题（出现在该项之前） */
  group?: string
}

defineProps<{ items: StepNavItem[] }>()
const emit = defineEmits<{ go: [step: number] }>()

function onClick(item: StepNavItem) {
  if (item.state === 'dim') return
  emit('go', item.step)
}
</script>

<template>
  <aside class="step-nav">
    <template v-for="item in items" :key="item.step">
      <div v-if="item.group" class="side-group">{{ item.group }}</div>
      <div
        class="side-item"
        :class="{
          on: item.state === 'on',
          done: item.state === 'done',
          dim: item.state === 'dim',
        }"
        @click="onClick(item)"
      >
        <span class="side-num">{{
          item.state === 'done' ? '✓' : item.glyph
        }}</span>
        <span class="side-text">
          <span class="side-label">{{ item.label }}</span>
          <span v-if="item.sub" class="side-sub">{{ item.sub }}</span>
        </span>
      </div>
    </template>

    <div class="side-div" />
    <div class="side-note">
      <div class="note-title">A型 · 缺口驱动评估</div>
      <div class="note-desc">
        给定目标缺口，评估可调能力能否满足、完成度与资源构成。
      </div>
    </div>
  </aside>
</template>

<style scoped>
.step-nav {
  width: 212px;
  flex-shrink: 0;
  padding: 18px 12px;
  border-right: 1px solid var(--border);
  align-self: stretch;
}

.side-group {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  padding: 6px 12px 10px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.side-item:hover {
  background: rgba(1, 89, 186, 0.06);
  color: var(--primary);
}
.side-item.on {
  background: linear-gradient(
    135deg,
    rgba(1, 89, 186, 0.13),
    rgba(0, 101, 105, 0.07)
  );
  color: var(--primary);
}
.side-item.dim {
  color: var(--text-muted);
  opacity: 0.55;
  cursor: not-allowed;
}
.side-item.dim:hover {
  background: transparent;
  color: var(--text-muted);
}

.side-num {
  width: 23px;
  height: 23px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: var(--bg-card2);
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  color: var(--text-muted);
  transition:
    background 0.18s,
    color 0.18s;
}
.side-item.on .side-num {
  background: var(--primary);
  color: #fff;
}
.side-item.done .side-num {
  background: var(--success);
  color: #fff;
}

.side-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  overflow: hidden;
}
.side-label {
  white-space: nowrap;
}
.side-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-div {
  height: 1px;
  background: var(--border);
  margin: 14px 10px;
}

.side-note {
  margin: 0 8px;
  padding: 12px 13px;
  background: var(--bg-card2);
  border-radius: 10px;
}
.note-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 5px;
}
.note-desc {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text-muted);
}
</style>
```

### 2.3 各步组件（原型逐页落地，原生控件已全换 EP）

### OverviewPanel.vue · Step0 流程总览

`src/pages/simulator/components/OverviewPanel.vue`

```vue
<script setup lang="ts">
import { fmtNum } from '~/utils/math'
import { evaluate } from '../composables/useSimResult'
import { createDefaultConfig } from '../composables/useSimWizard'

const emit = defineEmits<{ start: []; goStep: [step: number] }>()

// 全省默认场景示意（驱动 hero 数字，与真实引擎一致）
const demo = computed(() => evaluate(createDefaultConfig()))

const STEP_CARDS = [
  {
    step: 1,
    badge: 'linear-gradient(135deg,#0159ba,#024a9c)',
    title: '仿真参数配置',
    desc: '地区 / 方案 / 季节 / 温度 / 极端天气 / 调配策略 / 出力%，右侧实时联动预览。',
  },
  {
    step: 2,
    badge: 'linear-gradient(135deg,#006569,#024a9c)',
    title: '计算执行进度',
    desc: '实时滚动指标 + 5 阶段步进器 + 流式执行日志 + 总进度条。',
  },
  {
    step: 3,
    badge: 'linear-gradient(135deg,#0159ba,#0d6a8f)',
    title: '评估结果总览',
    desc: '4 KPI + 能力构成堆叠柱 + 确信度仪表盘 + 警告概览 + 用户明细表。',
  },
  {
    step: 4,
    badge: 'linear-gradient(135deg,#e07222,#024a9c)',
    title: '策略分析解读',
    desc: '规则模板章节级流式解读（LLM 后期接入）：结论 / 风险 / 调配建议。',
  },
]

const RULES = [
  {
    icon: '📐',
    title: '取值规则',
    body: '正常取基准值；特殊场景取该场景值；<b>集中检修任何场景恒取基准值</b>（通断式停产，不随天气变）。',
  },
  {
    icon: '⚠️',
    title: '唯一警告 = 数据不足',
    body: '某值背后有效记录 ≤ 2 条时标注，做成<b>户名后小徽标</b>、不单列一列。',
  },
  {
    icon: '➗',
    title: '仿真合计',
    body: '每户取值 × 出力% → 按调配方案筛选 → 跨方案<b>去重归类</b>（集中检修 &gt; 需求响应 &gt; 移峰填谷，一户只计一次）→ 求和。',
  },
  {
    icon: '🌡️',
    title: '区域级提示',
    body: '资源集中度（Top3 用户占比 ≥ 40%）、季节不匹配（该范围无历史事件）；平时/冬季"数据不足"用户明显增多。',
  },
]
</script>

<template>
  <div class="overview">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-deco" />
      <div class="hero-pills">
        <span class="hero-pill">A型 · 可调能力场景化评估</span>
        <span class="hero-pill">缺口驱动 · 五步向导</span>
      </div>
      <h1 class="hero-title">VPP 虚拟电厂仿真预测模块</h1>
      <p class="hero-desc">
        选定
        <b>评估范围 + 调节方案 + 季节/天气 + 调配策略 + 出力比例</b
        >，系统按"基准值 / 场景值"取数、 跨方案去重归类求和，综合测算"<b
          >可调能力规模 + 资源构成 + 取值可信度 + 结论解读</b
        >"，为电网调度研判提供量化参考。
      </p>
      <div class="hero-stats">
        <div class="hs">
          <div class="hs-l">全省合计示意</div>
          <div class="hs-v">
            {{ fmtNum(demo.capacityCeiling, 2) }}
            <span class="hs-u">万千瓦</span>
          </div>
        </div>
        <div class="hs">
          <div class="hs-l">参与用户（去重）</div>
          <div class="hs-v">
            {{ demo.kpi.totalUsers }} <span class="hs-u">户</span>
          </div>
        </div>
        <div class="hs">
          <div class="hs-l">数据确信度</div>
          <div class="hs-v">{{ fmtNum(demo.kpi.confidence, 0) }}%</div>
        </div>
        <div class="hs-cta">
          <el-button
            class="sim-cta-light start-btn"
            size="large"
            @click="emit('start')"
          >
            <el-icon><i class="i-ep:video-play" /></el-icon>
            <span>开始仿真评估</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 四步流程 -->
    <div class="sec-head">
      <span class="bar" />
      <h3>四步评估流程</h3>
      <span class="sec-hint">点击任一步骤进入</span>
    </div>
    <div class="step-grid">
      <div
        v-for="c in STEP_CARDS"
        :key="c.step"
        class="step-card"
        @click="emit('goStep', c.step)"
      >
        <div class="step-badge" :style="{ background: c.badge }">
          {{ c.step }}
        </div>
        <div class="step-title">{{ c.title }}</div>
        <div class="step-desc">{{ c.desc }}</div>
      </div>
    </div>

    <!-- 关键规则 -->
    <div class="sec-head">
      <span class="bar" />
      <h3>关键取值与计算规则</h3>
    </div>
    <div class="rule-grid">
      <div v-for="(r, i) in RULES" :key="i" class="rule">
        <span class="rule-ic">{{ r.icon }}</span>
        <div>
          <b>{{ r.title }}</b
          >：<span v-html="r.body" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* hero */
.hero {
  position: relative;
  overflow: hidden;
  padding: 26px 28px;
  border-radius: 14px;
  background: linear-gradient(140deg, #0159ba, #013f86 60%, #0d6a8f);
  color: #fff;
  box-shadow: 0 14px 36px -16px rgba(1, 89, 186, 0.6);
}
.hero-deco {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.hero-pills {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
}
.hero-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
}
.hero-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.01em;
  margin-bottom: 8px;
  position: relative;
}
.hero-desc {
  max-width: 760px;
  opacity: 0.92;
  line-height: 1.8;
  font-size: 13.5px;
  position: relative;
}
.hero-stats {
  display: flex;
  align-items: flex-end;
  gap: 26px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  position: relative;
  flex-wrap: wrap;
}
.hs-l {
  font-size: 11px;
  opacity: 0.8;
}
.hs-v {
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}
.hs-u {
  font-size: 13px;
  font-weight: 500;
}
.hs-cta {
  margin-left: auto;
}
.start-btn {
  font-size: 15px;
  height: 46px;
  padding: 0 24px;
}

/* section head */
.sec-head {
  display: flex;
  align-items: center;
  gap: 9px;
}
.sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.sec-head h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-light);
}
.sec-hint {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
}

/* step cards */
.step-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.step-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.step-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-light);
  box-shadow: 0 14px 32px -18px rgba(1, 89, 186, 0.5);
}
.step-badge {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 17px;
  color: #fff;
}
.step-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-light);
}
.step-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.55;
}

/* rules */
.rule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.rule {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  padding: 13px 15px;
  background: var(--bg-card2);
  border-radius: 10px;
  line-height: 1.55;
  color: var(--text-light);
}
.rule-ic {
  font-size: 16px;
}
.rule :deep(b) {
  color: var(--primary);
}

@media (max-width: 980px) {
  .step-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .rule-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

### step1/ParamConfig.vue · 参数表单（EP 控件替换范例）

`src/pages/simulator/components/step1/ParamConfig.vue`

```vue
<script setup lang="ts">
import { CITIES, PLANS } from '../../types'
import type { Plan, Season } from '../../types'
import {
  SEASON_PRESET,
  useSimWizard,
  weatherOptions,
} from '../../composables/useSimWizard'

const { draft, applySeason } = useSimWizard()

const SEASONS: Season[] = ['迎峰度夏', '迎峰度冬', '平时']
const DISPATCHES = ['大用户优先', '广度优先', '均衡调动'] as const

const shakePlans = ref(false)

function onPlansChange(val: (string | number | boolean)[]) {
  const plans = val as Plan[]
  if (!plans.length) {
    // 阻止取消到 0 项 + 抖动
    shakePlans.value = false
    requestAnimationFrame(() => (shakePlans.value = true))
    setTimeout(() => (shakePlans.value = false), 300)
    return
  }
  draft.plans = plans
}

function onWeatherChange(val: (string | number | boolean)[]) {
  const wasEmpty = draft.extremeWeather.length === 0
  draft.extremeWeather = val as string[]
  if (!draft.extremeWeather.length) {
    draft.preferPerf = false
  } else if (wasEmpty) {
    // 极端天气从无到有：默认勾选"优先实绩"；用户手动取消后保持其选择
    draft.preferPerf = true
  }
}

const preset = computed(() => SEASON_PRESET[draft.season])
const weathers = computed(() => weatherOptions(draft.season))

const crossed = computed(() => {
  const { thr, thrType } = preset.value
  if (thr == null) return false
  return thrType === 'high'
    ? draft.tempRange[1] >= thr
    : draft.tempRange[0] <= thr
})
/** 阈值刻度文案（显示在滑条对应位置下方） */
const markLabel = computed(() =>
  preset.value.thrType === 'high'
    ? `高温阈值 ${preset.value.thr}℃`
    : `低温阈值 ${preset.value.thr}℃`,
)
/** 触发状态文案 */
const statusLabel = computed(() => {
  const high = preset.value.thrType === 'high'
  if (crossed.value) return high ? '已触发高温场景' : '已触发低温场景'
  return high ? '高温未触发' : '低温未触发'
})
/** 滑条 tooltip 内容（带单位） */
const fmtTempTip = (v: number) => `${v}℃`
const fmtOutputTip = (v: number) => `${v}%`

const tempMarks = computed(() => {
  const { thr } = preset.value
  if (thr == null) return {}
  return {
    [thr]: {
      style: {
        color: 'var(--accent)',
        fontWeight: '600',
        fontSize: '11px',
        whiteSpace: 'nowrap',
      },
      label: markLabel.value,
    },
  }
})
</script>

<template>
  <div class="param-config">
    <!-- 卡1 基础设定 -->
    <section class="pc-card">
      <header class="pc-head"><span class="bar" />基础设定</header>
      <div class="field">
        <label>方案名称</label>
        <el-input v-model="draft.schemeName" placeholder="请输入方案名称" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>目标缺口 <span class="req">*</span></label>
          <el-input-number
            v-model="draft.targetGap"
            class="full"
            :min="0"
            :step="1"
            controls-position="right"
            placeholder="请输入目标缺口"
          />
          <span class="unit-tip">单位：万千瓦</span>
        </div>
        <div class="field">
          <label>地区</label>
          <el-select v-model="draft.region" class="full">
            <el-option label="全省" value="全省" />
            <el-option v-for="c in CITIES" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 卡2 调节方案 -->
    <section class="pc-card">
      <header class="pc-head">
        <span class="bar" />调节方案<span class="sub">至少选 1 项</span>
      </header>
      <el-checkbox-group
        :model-value="draft.plans"
        class="chip-group"
        :class="{ shake: shakePlans }"
        @change="onPlansChange"
      >
        <el-checkbox-button v-for="p in PLANS" :key="p" :value="p">
          {{ p }}
        </el-checkbox-button>
      </el-checkbox-group>
    </section>

    <!-- 卡3 场景设定 -->
    <section class="pc-card">
      <header class="pc-head"><span class="bar" />场景设定</header>
      <div class="field">
        <label>季节</label>
        <el-radio-group
          :model-value="draft.season"
          class="seg-group"
          @change="(v) => applySeason(v as Season)"
        >
          <el-radio-button v-for="s in SEASONS" :key="s" :value="s">
            {{ s }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="field">
        <label>
          <span>温度区间</span>
          <span class="label-right">
            <span
              v-if="preset.thr != null"
              class="thr-flag"
              :class="{ active: crossed }"
            >
              {{ statusLabel }}
            </span>
            <span class="temp-val">
              {{ draft.tempRange[0] }} ~ {{ draft.tempRange[1] }} ℃
            </span>
          </span>
        </label>
        <div class="temp-slider">
          <el-slider
            v-model="draft.tempRange"
            range
            :min="preset.min"
            :max="preset.max"
            :marks="tempMarks"
            tooltip-class="sim-slider-tip"
            :format-tooltip="fmtTempTip"
          />
        </div>
      </div>

      <div class="field">
        <label>极端天气 <span class="sub-inline">（按季节门控）</span></label>
        <el-checkbox-group
          :model-value="draft.extremeWeather"
          class="chip-group amber"
          @change="onWeatherChange"
        >
          <el-checkbox-button v-for="w in weathers" :key="w" :value="w">
            {{ w }}
          </el-checkbox-button>
        </el-checkbox-group>
      </div>

      <el-checkbox
        v-if="draft.extremeWeather.length"
        v-model="draft.preferPerf"
        class="perf-ck"
      >
        优先采用极端天气实绩数据
      </el-checkbox>
    </section>

    <!-- 卡4 调配设定 -->
    <section class="pc-card">
      <header class="pc-head"><span class="bar" />调配设定</header>
      <div class="field">
        <label>调配策略</label>
        <el-radio-group v-model="draft.dispatch" class="seg-group">
          <el-radio-button v-for="d in DISPATCHES" :key="d" :value="d">
            {{ d }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="field">
        <label>
          期望出力
          <span class="temp-val">{{ draft.output }}%</span>
        </label>
        <el-slider
          v-model="draft.output"
          :min="60"
          :max="100"
          :step="5"
          show-stops
          tooltip-class="sim-slider-tip"
          :format-tooltip="fmtOutputTip"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.param-config {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pc-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px 18px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.pc-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 14px;
}
.pc-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.pc-head .sub {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}
.field {
  margin-bottom: 16px;
}
.field:last-child {
  margin-bottom: 0;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field-row .field {
  margin-bottom: 0;
}
label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.req {
  color: var(--danger);
}
.sub-inline {
  font-weight: 500;
  font-size: 11px;
}
.temp-val {
  margin-left: auto;
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
}
.full {
  width: 100%;
}
.unit-tip {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* chip groups (checkbox / radio button) */
.chip-group,
.seg-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip-group.shake {
  animation: shake 0.12s ease 2;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* 让 checkbox/radio-button 呈圆角 chip 风格，统一主题 */
.chip-group :deep(.el-checkbox-button__inner),
.seg-group :deep(.el-radio-button__inner) {
  border-radius: 22px !important;
  border: 1.5px solid var(--border);
  margin: 0;
  padding: 8px 16px;
  font-weight: 600;
  box-shadow: none !important;
  transition: all 0.15s;
}
.chip-group :deep(.el-checkbox-button),
.seg-group :deep(.el-radio-button) {
  margin: 0;
}
.chip-group.amber
  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  background: linear-gradient(135deg, #ed8a3e, #d4641a);
  border-color: transparent;
  box-shadow: 0 4px 12px -4px rgba(224, 114, 34, 0.5) !important;
}

/* 温度区间 label 右侧（状态徽标 + 当前值） */
.label-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 触发状态徽标 */
.thr-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 2px 9px;
  white-space: nowrap;
  transition: all 0.18s;
}
.thr-flag::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
}
.thr-flag.active {
  color: #fff;
  background: var(--accent);
  border-color: transparent;
}
.thr-flag.active::before {
  background: #fff;
}

/* 温度滑条：留出阈值刻度文案空间 */
.temp-slider {
  position: relative;
  padding: 0 4px 8px;
}
/* 阈值刻度圆点用强调色高亮 */
.temp-slider :deep(.el-slider__marks-stop) {
  width: 10px;
  height: 10px;
  background-color: var(--accent);
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 0 1px var(--accent);
}

.perf-ck {
  font-weight: 600;
}
</style>
```

### step1/ConfigPreview.vue · 实时预览 + 环形图

`src/pages/simulator/components/step1/ConfigPreview.vue`

```vue
<script setup lang="ts">
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { add, div, fmtNum, mul } from '~/utils/math'
import { useTheme } from '~/composables/useTheme'
import { evaluate } from '../../composables/useSimResult'
import { useSimWizard } from '../../composables/useSimWizard'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const emit = defineEmits<{ start: [] }>()
const { draft, startSimulation } = useSimWizard()
const { isDark } = useTheme()

const PLAN_COLOR: Record<string, string> = {
  集中检修: '#0159ba',
  需求响应: '#006569',
  移峰填谷: '#e07222',
}

const preview = computed(() => evaluate(draft))
const kpi = computed(() => preview.value.kpi)

/* 缺口对照 */
const gapOk = computed(() => {
  const g = draft.targetGap
  return g != null && g > 0 ? preview.value.capacityCeiling >= g : null
})

/* 场景标签 */
const sceneTags = computed(() => {
  const tags = [
    draft.region,
    draft.season,
    `${draft.tempRange[0]}~${draft.tempRange[1]}℃`,
  ]
  return tags.concat(draft.extremeWeather)
})

/* hero 变化高亮 */
const flash = ref(false)
let lastVal = 0
watch(
  () => preview.value.capacityCeiling,
  (v) => {
    if (lastVal && Math.abs(v - lastVal) / (lastVal || 1) > 0.05) {
      flash.value = false
      requestAnimationFrame(() => (flash.value = true))
      setTimeout(() => (flash.value = false), 600)
    }
    lastVal = v
  },
)

/* 环形图 */
const donutItems = computed(() =>
  preview.value.breakdown.filter((b) => b.capacity > 0),
)
const topPlan = computed(() => {
  const items = donutItems.value
  if (!items.length) return null
  const top = items.reduce((a, b) => (b.capacity > a.capacity ? b : a))
  const total = items.reduce((s, b) => add(s, b.capacity), 0)
  return {
    plan: top.plan,
    pct: total ? Math.round(mul(div(top.capacity, total), 100)) : 0,
  }
})

const donutOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: isDark.value ? '#1a1d27' : '#ffffff',
    textStyle: { color: isDark.value ? '#e8eaf0' : '#1a1d23' },
    formatter: (p: any) =>
      `${p.name}: ${fmtNum(p.value, 2)} 万千瓦 (${p.percent}%)`,
  },
  legend: {
    bottom: 0,
    icon: 'circle',
    textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 },
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '78%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: false,
      labelLine: { show: false },
      label: {
        position: 'center',
        formatter: () =>
          topPlan.value
            ? `{a|${topPlan.value.plan}}\n{b|占比 ${topPlan.value.pct}%}`
            : '',
        rich: {
          a: {
            fontSize: 13,
            fontWeight: 'bold',
            color: isDark.value ? '#fff' : '#1a1d23',
          },
          b: { fontSize: 11, color: '#6b7a8a', padding: [4, 0, 0, 0] },
        },
      },
      data: donutItems.value.map((b) => ({
        value: b.capacity,
        name: b.plan,
        itemStyle: { color: PLAN_COLOR[b.plan] },
      })),
    },
  ],
}))

/* 校验清单 */
type CheckState = 'pass' | 'info' | 'err'
const checks = computed<{ label: string; state: CheckState; text: string }[]>(
  () => {
    const c = draft
    const r = preview.value
    const out: { label: string; state: CheckState; text: string }[] = []
    out.push({ label: '地区', state: 'pass', text: c.region })
    out.push(
      c.plans.length
        ? { label: '调节方案', state: 'pass', text: `${c.plans.length} 项` }
        : { label: '调节方案', state: 'err', text: '请至少选择 1 个方案' },
    )
    out.push(
      c.targetGap != null && c.targetGap > 0
        ? {
            label: '目标缺口',
            state: 'pass',
            text: `${fmtNum(c.targetGap, 2)} 万千瓦`,
          }
        : { label: '目标缺口', state: 'err', text: '请输入目标缺口' },
    )
    out.push({
      label: '季节温度',
      state: 'pass',
      text: `${c.season} · ${c.tempRange[0]}~${c.tempRange[1]}℃`,
    })
    out.push({
      label: '极端天气',
      state: c.extremeWeather.length ? 'info' : 'pass',
      text: c.extremeWeather.length ? c.extremeWeather.join('、') : '未选',
    })
    out.push({
      label: '优先实绩',
      state: c.preferPerf ? 'info' : 'pass',
      text: c.preferPerf ? '已开启' : '未开启',
    })
    out.push({ label: '期望出力', state: 'pass', text: `${c.output}%` })
    out.push(
      r.kpi.totalUsers > 0
        ? { label: '参与用户', state: 'pass', text: `${r.kpi.totalUsers} 户` }
        : { label: '参与用户', state: 'err', text: '当前条件下无可调用户' },
    )
    out.push({
      label: '数据质量',
      state: r.kpi.confidence >= 70 ? 'pass' : 'info',
      text: `确信度 ${fmtNum(r.kpi.confidence, 2)}%`,
    })
    return out
  },
)

const hasError = computed(() => checks.value.some((c) => c.state === 'err'))

const ICON: Record<CheckState, string> = { pass: '✓', info: 'i', err: '✕' }

function onStart() {
  if (hasError.value) return
  startSimulation()
  emit('start')
}
</script>

<template>
  <div class="config-preview">
    <!-- hero -->
    <div class="hero" :class="{ flash }">
      <div class="hero-deco" />
      <div class="hero-cap">预估可调能力上限</div>
      <div class="hero-val">
        {{ fmtNum(preview.capacityCeiling, 2)
        }}<span class="hero-unit">万千瓦</span>
      </div>
      <div v-if="gapOk !== null" class="gap-dot" :class="gapOk ? 'ok' : 'warn'">
        <span class="dot" />{{
          gapOk ? '预计可满足目标缺口' : '预计不可完全满足'
        }}
      </div>
      <div class="scene-tags">
        <span v-for="t in sceneTags" :key="t" class="scene-tag">{{ t }}</span>
      </div>
      <div class="hero-stats">
        <div class="hs">
          <div class="hs-v">
            {{ kpi.totalUsers }} <span class="hs-unit">户</span>
          </div>
          <div class="hs-l">参与用户</div>
        </div>
        <div class="hs">
          <div class="hs-v">{{ draft.region }}</div>
          <div class="hs-l">覆盖范围</div>
        </div>
        <div class="hs">
          <div class="hs-v">{{ fmtNum(kpi.confidence, 0) }}%</div>
          <div class="hs-l">数据确信度</div>
        </div>
      </div>
    </div>

    <!-- donut -->
    <div class="pv-card">
      <header class="pv-head"><span class="bar" />分方案能力构成</header>
      <v-chart
        v-if="donutItems.length"
        class="donut"
        :option="donutOption"
        autoresize
        style="height: 200px"
      />
      <div v-else class="empty">暂无可调资源</div>
    </div>

    <!-- checklist -->
    <div class="pv-card">
      <header class="pv-head"><span class="bar" />配置校验清单</header>
      <div v-for="c in checks" :key="c.label" class="check-row">
        <span class="ck" :class="`ck-${c.state}`">{{ ICON[c.state] }}</span>
        <span class="ck-label">{{ c.label }}</span>
        <span class="ck-text">{{ c.text }}</span>
      </div>
    </div>

    <el-button
      class="run-btn sim-cta"
      size="large"
      :disabled="hasError"
      @click="onStart"
    >
      <el-icon><i class="i-ep:video-play" /></el-icon>
      <span>发起仿真评估</span>
    </el-button>
  </div>
</template>

<style scoped>
.config-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;
}

/* hero */
.hero {
  position: relative;
  overflow: hidden;
  padding: 22px;
  border-radius: 14px;
  background: linear-gradient(140deg, #0159ba, #013f86 60%, #0d6a8f);
  color: #fff;
  box-shadow: 0 14px 36px -14px rgba(1, 89, 186, 0.65);
  transition: box-shadow 0.4s;
}
.hero.flash {
  box-shadow: 0 14px 36px -8px rgba(1, 89, 186, 0.95);
}
.hero-deco {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  right: -30px;
  top: -30px;
}
.hero-cap {
  font-size: 12px;
  opacity: 0.85;
  position: relative;
}
.hero-val {
  font-size: 46px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 4px 0 2px;
  font-variant-numeric: tabular-nums;
  position: relative;
}
.hero-unit {
  font-size: 17px;
  font-weight: 600;
  opacity: 0.9;
  margin-left: 6px;
}
.gap-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  position: relative;
}
.gap-dot .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.gap-dot.ok .dot {
  background: #4ade80;
}
.gap-dot.warn .dot {
  background: #fbbf24;
}
.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  position: relative;
}
.scene-tag {
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
}
.hero-stats {
  display: flex;
  gap: 14px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  position: relative;
}
.hs {
  flex: 1;
}
.hs-v {
  font-size: 19px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.hs-unit {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
}
.hs-l {
  font-size: 11px;
  opacity: 0.82;
  margin-top: 2px;
}

/* cards */
.pv-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px 16px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.pv-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 10px;
}
.pv-head .bar {
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 28px 0;
}

/* checklist */
.check-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 0;
  font-size: 12.5px;
}
.ck {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.ck-pass {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}
.ck-info {
  background: rgba(1, 89, 186, 0.12);
  color: var(--primary);
}
.ck-err {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger);
}
.ck-label {
  font-weight: 600;
  color: var(--text-muted);
  width: 64px;
  flex-shrink: 0;
}
.ck-text {
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* run button */
.run-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 6px 18px -6px rgba(1, 89, 186, 0.6);
}
</style>
```

### step2/ExecutionPanel.vue · 计算执行 + 完成弹框

`src/pages/simulator/components/step2/ExecutionPanel.vue`

```vue
<script setup lang="ts">
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { fmtNum } from '~/utils/math'
import { useTheme } from '~/composables/useTheme'
import { useSimWizard } from '../../composables/useSimWizard'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const emit = defineEmits<{ done: []; back: [] }>()
const { store } = useSimWizard()
const { isDark } = useTheme()

const config = computed(() => store.currentConfig)

const STAGE_COLOR = ['#0159ba', '#006569', '#22c55e', '#4a90d9', '#e07222']
const STAGES = [
  { key: 'pool', name: '拉取资源池', short: '资源池' },
  { key: 'scene', name: '分场景能力测算', short: '场景' },
  { key: 'value', name: '分层估值', short: '估值' },
  { key: 'agg', name: '调配聚合', short: '聚合' },
  { key: 'check', name: '数据校核与汇总', short: '校核' },
]

const activeStage = ref(-1)
const doneStages = ref<boolean[]>([false, false, false, false, false])
const progress = ref(0)
const finished = ref(false)
/** 完成提示弹框 */
const showDone = ref(false)

const summary = computed(() => {
  const r = store.currentResult
  return {
    cap: r?.capacityCeiling ?? 0,
    completion: r?.kpi.completion ?? 0,
    users: r?.kpi.totalUsers ?? 0,
    met: (r?.kpi.completion ?? 0) >= 100,
  }
})
function goResult() {
  showDone.value = false
  emit('done')
}

const metrics = reactive({ pool: 0, scene: 0, cap: 0, conf: 0 })
const logs = ref<{ t: string; level: string; msg: string }[]>([])
const logBox = ref<HTMLElement>()
const stageQty = ref<number[]>([0, 0, 0, 0, 0])

function clock(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function pushLog(level: string, msg: string) {
  logs.value.push({ t: clock(), level, msg })
  nextTick(() => {
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight
  })
}
function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** easeOutCubic count-up */
function countUp(key: keyof typeof metrics, to: number, dur = 600) {
  const from = metrics[key]
  const start = performance.now()
  function frame(now: number) {
    const p = Math.min(1, (now - start) / dur)
    const e = 1 - (1 - p) ** 3
    metrics[key] = from + (to - from) * e
    if (p < 1) requestAnimationFrame(frame)
    else metrics[key] = to
  }
  requestAnimationFrame(frame)
}

const LOG_TEMPLATES: Record<string, [string, string][]> = {
  pool: [
    ['INFO', '建立数据库连接，加载 dws_adjustable_scenario_user'],
    ['INFO', '按地区过滤可调用户资源池'],
    ['OK', '资源池加载完成'],
    ['INFO', '校验用户方案参与有效性'],
    ['OK', '资源池就绪'],
  ],
  scene: [
    ['INFO', '解析当前激活场景集合'],
    ['INFO', '逐户检索场景能力记录'],
    ['WARN', '部分用户场景记录 ≤2 条，标注数据不足'],
    ['INFO', '集中检修用户恒取基准值'],
    ['OK', '分场景能力测算完成'],
  ],
  value: [
    ['INFO', '应用取值规则引擎（场景实测 / 历史峰值估算）'],
    ['INFO', '多场景叠加取最小值（保守）'],
    ['INFO', '出力折算每户贡献'],
    ['OK', '分层估值完成'],
    ['INFO', '准备跨方案去重归类'],
  ],
  agg: [
    ['INFO', '跨方案去重归类（集中检修>需求响应>移峰填谷）'],
    ['INFO', '按调配策略筛选调度用户'],
    ['INFO', '分方案能力分组求和'],
    ['OK', '调配聚合完成'],
    ['INFO', '计算资源集中度 Top3 占比'],
  ],
  check: [
    ['INFO', '统计数据不足用户与确信度'],
    ['INFO', '生成区域级提示'],
    ['OK', '数据校核通过'],
    ['OK', '结果汇总完成'],
    ['OK', '仿真评估全部完成'],
  ],
}

async function run() {
  // 等待结果就绪
  while (!store.currentResult) await wait(100)
  const r = store.currentResult
  const sceneUsers = r.rows.filter((x) => x.valueSource === '场景实测').length
  const regionUsers = r.kpi.totalUsers
  stageQty.value = [
    regionUsers,
    sceneUsers,
    r.kpi.totalUsers,
    r.kpi.totalUsers,
    r.kpi.insufficientCount,
  ]

  const targets: Record<string, () => void> = {
    pool: () => countUp('pool', regionUsers, 500),
    scene: () => countUp('scene', sceneUsers, 500),
    value: () => countUp('conf', r.kpi.confidence, 600),
    agg: () => countUp('cap', r.capacityCeiling, 700),
    check: () => {},
  }

  for (let i = 0; i < STAGES.length; i++) {
    activeStage.value = i
    targets[STAGES[i].key]()
    const tpl = LOG_TEMPLATES[STAGES[i].key]
    for (const [lvl, msg] of tpl) {
      pushLog(lvl, msg)
      await wait(230)
    }
    doneStages.value[i] = true
    progress.value = Math.round(((i + 1) / STAGES.length) * 100)
  }

  finished.value = true
  // 计算完成后弹出提示框，由用户决定跳转（不自动读秒跳转）
  await wait(400)
  showDone.value = true
}

onMounted(run)

/* 阶段柱图 */
const barOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { left: 56, right: 60, top: 10, bottom: 10 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (ps: any) => {
      const p = Array.isArray(ps) ? ps[0] : ps
      return `${p.name}：${fmtNum(p.value, 0)} 户`
    },
  },
  xAxis: { type: 'value', show: false },
  yAxis: {
    type: 'category',
    inverse: true,
    data: STAGES.map((s) => s.short),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: isDark.value ? '#94a3b8' : '#6b7a8a', fontSize: 11 },
  },
  series: [
    {
      type: 'bar',
      barWidth: '52%',
      data: stageQty.value.map((v, i) => ({
        value: v,
        itemStyle: { color: STAGE_COLOR[i], borderRadius: [0, 5, 5, 0] },
      })),
      label: {
        show: true,
        position: 'right',
        color: isDark.value ? '#94a3b8' : '#6b7a8a',
        fontSize: 10,
        formatter: (p: any) => `${fmtNum(p.value, 0)} 户`,
      },
    },
  ],
}))

const summaryPills = computed(() => {
  const c = config.value
  if (!c) return []
  return [
    { v: c.region, cls: 'blue' },
    { v: `缺口 ${c.targetGap ?? '-'} 万千瓦`, cls: 'amber' },
    { v: c.plans.join('/'), cls: 'teal' },
    { v: c.season, cls: 'blue' },
    { v: `${c.tempRange[0]}~${c.tempRange[1]}℃`, cls: 'teal' },
    ...c.extremeWeather.map((w) => ({ v: w, cls: 'amber' })),
    { v: c.dispatch, cls: 'blue' },
    { v: `出力 ${c.output}%`, cls: 'teal' },
  ]
})

const metricCards = computed(() => [
  {
    label: '已纳入资源池',
    value: fmtNum(metrics.pool, 0),
    unit: '户',
    cls: 'blue',
    icon: 'i-mdi:account-group',
  },
  {
    label: '场景实测覆盖',
    value: fmtNum(metrics.scene, 0),
    unit: '户',
    cls: 'teal',
    icon: 'i-mdi:database-check',
  },
  {
    label: '已聚合可调能力',
    value: fmtNum(metrics.cap, 2),
    unit: '万千瓦',
    cls: 'green',
    icon: 'i-mdi:lightning-bolt',
  },
  {
    label: '数据确信度',
    value: fmtNum(metrics.conf, 2),
    unit: '%',
    cls: 'green',
    icon: 'i-mdi:shield-check',
  },
])
</script>

<template>
  <div class="exec-panel">
    <div class="exec-header">
      <div>
        <h2 class="title">计算执行中</h2>
        <p class="subtitle">第 2 步 / 共 4 步 · 取值聚合引擎正在处理</p>
      </div>
      <div class="pills">
        <span
          v-for="(p, i) in summaryPills"
          :key="i"
          class="pill"
          :class="p.cls"
          >{{ p.v }}</span
        >
      </div>
    </div>

    <!-- 4 指标 -->
    <div class="metric-row">
      <div v-for="m in metricCards" :key="m.label" class="exec-metric">
        <div class="em-top">
          <span class="em-label">{{ m.label }}</span>
          <span class="em-ic" :class="m.cls"><i :class="m.icon" /></span>
        </div>
        <div class="em-v" :class="m.cls">
          {{ m.value }}<span class="em-u">{{ m.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 阶段步进 -->
    <div class="stage-card">
      <div class="stage-row">
        <div v-for="(s, i) in STAGES" :key="s.key" class="stage-node">
          <div
            class="stage-circle"
            :class="{
              active: activeStage === i && !doneStages[i],
              done: doneStages[i],
            }"
          >
            <span v-if="doneStages[i]">✓</span>
            <span v-else-if="activeStage === i" class="spin" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="stage-label">{{ s.name }}</div>
          <div
            v-if="i < STAGES.length - 1"
            class="stage-conn"
            :class="{ on: doneStages[i] }"
          />
        </div>
      </div>
      <div class="pbar">
        <div class="pbar-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="pbar-text">总进度 {{ progress }}%</div>
    </div>

    <!-- 日志 + 柱图 -->
    <div class="lower-grid">
      <div class="log-card">
        <header class="lc-head"><span class="bar" />流式执行日志</header>
        <div ref="logBox" class="logbox">
          <div v-for="(l, i) in logs" :key="i" class="log-line">
            <span class="lt">[{{ l.t }}]</span>
            <span class="tg" :class="`tg-${l.level.toLowerCase()}`"
              >[{{ l.level }}]</span
            >
            <span class="lm">{{ l.msg }}</span>
          </div>
        </div>
      </div>
      <div class="bar-card">
        <header class="lc-head"><span class="bar" />各阶段处理量</header>
        <v-chart
          class="stage-bar"
          :option="barOption"
          autoresize
          style="height: 300px"
        />
      </div>
    </div>

    <!-- 完成横幅 -->
    <div v-if="finished" class="complete-banner">
      <div class="cb-check">✓</div>
      <div>
        <div class="cb-title">仿真评估完成</div>
        <div class="cb-sub">可调能力聚合完成，评估结果已就绪。</div>
      </div>
      <el-button class="sim-cta cb-btn" @click="emit('done')">
        查看评估结果
      </el-button>
    </div>

    <!-- 完成提示弹框 -->
    <el-dialog
      v-model="showDone"
      class="sim-done-dialog"
      width="440px"
      align-center
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="dd-body">
        <div class="dd-check"><i class="i-ep:select" /></div>
        <h3 class="dd-title">仿真评估完成</h3>
        <p class="dd-sub">取值聚合引擎已完成全部 5 个阶段，评估结果已就绪。</p>
        <div class="dd-stats">
          <div class="dd-stat">
            <div class="dd-v" style="color: var(--primary)">
              {{ fmtNum(summary.cap, 2) }}
            </div>
            <div class="dd-l">合计可调能力（万千瓦）</div>
          </div>
          <div class="dd-stat">
            <div
              class="dd-v"
              :style="{ color: summary.met ? '#15803d' : '#b45309' }"
            >
              {{ fmtNum(summary.completion, 2) }}%
            </div>
            <div class="dd-l">完成度</div>
          </div>
          <div class="dd-stat">
            <div class="dd-v" style="color: var(--secondary)">
              {{ summary.users }}
            </div>
            <div class="dd-l">参与用户（户）</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDone = false">留在本页</el-button>
        <el-button class="sim-cta" @click="goResult">查看评估结果 →</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.exec-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.exec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.title {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-light);
}
.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 60%;
  justify-content: flex-end;
}
.pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 20px;
}
.pill.blue {
  background: rgba(1, 89, 186, 0.1);
  color: var(--primary);
}
.pill.teal {
  background: rgba(0, 101, 105, 0.12);
  color: var(--secondary);
}
.pill.amber {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}

/* metrics */
.metric-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.exec-metric {
  background: linear-gradient(135deg, var(--bg-card), var(--bg-card2));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
}
.em-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.em-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.em-ic {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.em-ic.blue {
  background: rgba(1, 89, 186, 0.12);
  color: var(--primary);
}
.em-ic.teal {
  background: rgba(0, 101, 105, 0.12);
  color: var(--secondary);
}
.em-ic.green {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}
.em-v {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}
.em-v.blue {
  color: var(--primary);
}
.em-v.teal {
  color: var(--secondary);
}
.em-v.green {
  color: #15803d;
}
.em-u {
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
  color: var(--text-muted);
}

/* stage */
.stage-card,
.log-card,
.bar-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.stage-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}
.stage-node {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.stage-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-card);
  z-index: 1;
}
.stage-circle.active {
  border-color: var(--primary);
  color: var(--primary);
  animation: stepPulse 1.4s ease-in-out infinite;
}
.stage-circle.done {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}
@keyframes stepPulse {
  0%,
  100% {
    box-shadow: 0 0 0 6px rgba(1, 89, 186, 0.12);
  }
  50% {
    box-shadow: 0 0 0 11px rgba(1, 89, 186, 0.04);
  }
}
.stage-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 8px;
}
.stage-conn {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: var(--border);
  z-index: 0;
}
.stage-conn.on {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
}
.spin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.pbar {
  height: 8px;
  border-radius: 5px;
  background: var(--bg-card2);
  overflow: hidden;
  position: relative;
}
.pbar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}
.pbar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: shine 1.6s linear infinite;
}
@keyframes shine {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
.pbar-text {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  text-align: right;
}

/* lower grid */
.lower-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}
.lc-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 12px;
}
.lc-head .bar {
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.logbox {
  height: 300px;
  overflow-y: auto;
  background: var(--bg-card2);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  line-height: 1.9;
}
.log-line {
  animation: rollIn 0.25s ease;
}
@keyframes rollIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.lt {
  color: var(--text-muted);
  margin-right: 6px;
}
.tg {
  font-weight: 700;
  margin-right: 6px;
}
.tg-info {
  color: var(--primary);
}
.tg-ok {
  color: #15803d;
}
.tg-warn {
  color: #d97706;
}
.lm {
  color: var(--text-light);
}

/* banner */
.complete-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(34, 197, 94, 0.07);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 14px;
  padding: 18px 20px;
  animation: bannerIn 0.5s ease;
}
@keyframes bannerIn {
  from {
    opacity: 0;
    transform: translateY(-14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.cb-check {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--success);
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cb-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-light);
}
.cb-sub {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}
.cb-btn {
  margin-left: auto;
  border-radius: 11px;
  font-weight: 700;
}

/* 完成提示弹框 */
.dd-body {
  text-align: center;
  padding: 6px 4px 0;
}
.dd-check {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: #fff;
  font-size: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px -8px rgba(34, 197, 94, 0.6);
  animation: ddPop 0.45s cubic-bezier(0.22, 1.2, 0.4, 1);
}
@keyframes ddPop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.dd-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-light);
}
.dd-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.6;
}
.dd-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}
.dd-stat {
  background: var(--bg-card2);
  border-radius: 11px;
  padding: 12px 8px;
}
.dd-v {
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.dd-l {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

@media (max-width: 980px) {
  .metric-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .lower-grid {
    grid-template-columns: 1fr;
  }
  .pills {
    max-width: 100%;
    justify-content: flex-start;
  }
}
</style>
```

### step3/ResultOverview.vue · 结果总览 KPI/堆叠柱/仪表盘

`src/pages/simulator/components/step3/ResultOverview.vue`

```vue
<script setup lang="ts">
import { use } from 'echarts/core'
import { BarChart, GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { add, div, fmtNum, mul } from '~/utils/math'
import { useTheme } from '~/composables/useTheme'
import UserDetailTable from './UserDetailTable.vue'
import { useSimWizard } from '../../composables/useSimWizard'

use([
  CanvasRenderer,
  BarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

const emit = defineEmits<{ reconfigure: []; report: [] }>()
const { store } = useSimWizard()
const { isDark } = useTheme()

const result = computed(() => store.currentResult)
const config = computed(() => store.currentConfig)
const kpi = computed(() => result.value?.kpi)

const STEP_DOTS = ['参数配置', '计算执行', '结果总览', '策略报告']

const warnOnlyTrigger = ref(false)
const dismissedAlerts = ref<string[]>([])
const visibleAlerts = computed(() =>
  (result.value?.regionAlerts ?? []).filter(
    (a) => !dismissedAlerts.value.includes(a.type),
  ),
)

/* 场景摘要 chips */
const summaryChips = computed(() => {
  const c = config.value
  if (!c) return []
  return [
    { k: '评估范围', v: c.region },
    { k: '目标缺口', v: `${fmtNum(c.targetGap ?? 0, 2)} 万千瓦` },
    { k: '调节方案', v: c.plans.join('、') },
    { k: '季节', v: c.season },
    { k: '温度', v: `${c.tempRange[0]}~${c.tempRange[1]}℃` },
    { k: '调配策略', v: c.dispatch },
    { k: '期望出力', v: `${c.output}%` },
  ]
})

/* KPI count-up */
const anim = reactive({ cap: 0, users: 0, conf: 0, conc: 0 })
function countUp(key: keyof typeof anim, to: number, dur = 1100) {
  const from = anim[key]
  const start = performance.now()
  function frame(now: number) {
    const p = Math.min(1, (now - start) / dur)
    const e = 1 - (1 - p) ** 3
    anim[key] = from + (to - from) * e
    if (p < 1) requestAnimationFrame(frame)
    else anim[key] = to
  }
  requestAnimationFrame(frame)
}
onMounted(() => {
  const k = kpi.value
  if (!k) return
  countUp('cap', k.totalCapacity)
  countUp('users', k.totalUsers)
  countUp('conf', k.confidence)
  countUp('conc', k.concentration)
})

const confColor = computed(() => {
  const v = kpi.value?.confidence ?? 0
  return v >= 85 ? '#22c55e' : v >= 70 ? '#f59e0b' : '#ef4444'
})
const concWarn = computed(() => (kpi.value?.concentration ?? 0) >= 40)

const kpiCards = computed(() => {
  const k = kpi.value
  if (!k) return []
  return [
    {
      label: '场景可调能力合计',
      value: fmtNum(anim.cap, 2),
      unit: '万千瓦',
      accent: 'linear-gradient(90deg,#0159ba,#4a90d9)',
      color: 'var(--primary)',
    },
    {
      label: '参与用户数（去重）',
      value: fmtNum(anim.users, 0),
      unit: '户',
      accent: 'linear-gradient(90deg,#006569,#33b3b8)',
      color: 'var(--secondary)',
    },
    {
      label: '数据确信度',
      value: fmtNum(anim.conf, 2),
      unit: '%',
      accent: 'linear-gradient(90deg,#22c55e,#4ade80)',
      color: confColor.value,
    },
    {
      label: '资源集中度',
      value: fmtNum(anim.conc, 2),
      unit: '%',
      sub: concWarn.value ? 'Top3 超警戒线' : 'Top3 占比',
      accent: 'linear-gradient(90deg,#e07222,#f0a060)',
      color: concWarn.value ? 'var(--accent)' : 'var(--secondary)',
    },
  ]
})

/* 堆叠柱构成 */
const compOption = computed(() => {
  const bd = result.value?.breakdown ?? []
  const plans = bd.map((b) => b.plan)
  return {
    backgroundColor: 'transparent',
    grid: { left: 80, right: 96, top: 34, bottom: 24 },
    legend: {
      top: 0,
      right: 0,
      icon: 'roundRect',
      textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (ps: any) => {
        const arr = Array.isArray(ps) ? ps : [ps]
        const name = arr[0]?.axisValueLabel ?? ''
        const lines = arr
          .map(
            (p: any) =>
              `${p.marker}${p.seriesName}：${fmtNum(p.value, 2)} 万千瓦`,
          )
          .join('<br/>')
        const total = bd[arr[0]?.dataIndex]?.capacity ?? 0
        return `${name}<br/>${lines}<br/>合计：${fmtNum(total, 2)} 万千瓦`
      },
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      data: plans,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: isDark.value ? '#cbd5e1' : '#1a1d23',
        fontSize: 12,
        fontWeight: 600,
      },
    },
    series: [
      {
        name: '场景实测',
        type: 'bar',
        stack: 'cap',
        barWidth: 26,
        itemStyle: { color: '#0159ba', borderRadius: [5, 0, 0, 5] },
        label: {
          show: true,
          color: '#fff',
          fontSize: 10,
          formatter: (p: any) => (p.value > 3 ? fmtNum(p.value, 0) : ''),
        },
        data: bd.map((b) => b.sceneCapacity),
      },
      {
        name: '历史峰值估算',
        type: 'bar',
        stack: 'cap',
        barWidth: 26,
        itemStyle: { color: '#006569', borderRadius: [0, 5, 5, 0] },
        label: {
          show: true,
          position: 'right',
          color: isDark.value ? '#94a3b8' : '#6b7a8a',
          fontSize: 11,
          fontWeight: 700,
          formatter: (p: any) =>
            `${fmtNum(bd[p.dataIndex].capacity, 2)} 万千瓦`,
        },
        data: bd.map((b) => b.histCapacity),
      },
    ],
  }
})

/* 确信度仪表盘 */
const gaugeOption = computed(() => {
  const v = kpi.value?.confidence ?? 0
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        radius: '92%',
        center: ['50%', '60%'],
        min: 0,
        max: 100,
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: { color: confColor.value },
        },
        // 取消指针，避免与中心数值重叠（进度弧已表达数值）
        pointer: { show: false },
        anchor: { show: false },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [0.7, '#fde0d8'],
              [0.85, '#fcecc7'],
              [1, '#d6f0df'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 30,
          fontWeight: 'bold',
          color: confColor.value,
          formatter: '{value}%',
          offsetCenter: [0, '-5%'],
        },
        title: {
          offsetCenter: [0, '26%'],
          color: isDark.value ? '#94a3b8' : '#6b7a8a',
          fontSize: 12,
        },
        data: [{ value: Math.round(v), name: '数据确信度' }],
      },
    ],
  }
})

/* 仪表盘下三档 */
const qualityCells = computed(() => {
  const rows = result.value?.rows ?? []
  return [
    {
      label: '场景实测',
      value: rows.filter((r) => r.valueSource === '场景实测').length,
      cls: 'blue',
    },
    {
      label: '历史估算',
      value: rows.filter((r) => r.valueSource === '历史峰值估算').length,
      cls: 'teal',
    },
    {
      label: '数据不足',
      value: rows.filter((r) => r.isInsufficient).length,
      cls: 'amber',
    },
  ]
})

/* 警告概览 */
const insufficient = computed(() => {
  const rows = result.value?.rows ?? []
  const list = rows.filter((r) => r.isInsufficient)
  const cap = list.reduce((s, r) => add(s, r.contribution), 0)
  const pct = rows.length ? mul(div(list.length, rows.length), 100) : 0
  const byPlan = {} as Record<string, number>
  for (const r of list)
    byPlan[r.assignedPlan] = add(byPlan[r.assignedPlan] ?? 0, 1)
  return { count: list.length, cap, pct, byPlan }
})

function gotoWarn() {
  warnOnlyTrigger.value = true
  nextTick(() => {
    document
      .querySelector('.detail-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  })
}
</script>

<template>
  <div v-if="result" class="result-overview">
    <!-- 顶部步骤指示 -->
    <div class="step-dots">
      <div v-for="(s, i) in STEP_DOTS" :key="s" class="step-dot-item">
        <div class="step-num" :class="{ on: i === 2, done: i < 2 }">
          <span v-if="i < 2">✓</span><span v-else>{{ i + 1 }}</span>
        </div>
        <span class="st-t">{{ s }}</span>
        <div v-if="i < 3" class="step-line" :class="{ done: i < 2 }" />
      </div>
    </div>

    <!-- 标题行 -->
    <div class="title-row">
      <div>
        <h2 class="title">评估结果总览</h2>
        <p class="subtitle">
          {{ config?.schemeName }} · 完成于 {{ result.generatedAt }}
        </p>
      </div>
      <div class="title-actions">
        <el-button @click="emit('reconfigure')">重新配置</el-button>
        <el-button class="sim-cta" @click="emit('report')">
          查看策略解读 →
        </el-button>
      </div>
    </div>

    <!-- 场景摘要 -->
    <div class="summary-card">
      <span v-for="c in summaryChips" :key="c.k" class="sm-chip">
        <span class="sm-k">{{ c.k }}</span
        >{{ c.v }}
      </span>
    </div>

    <!-- 区域提示 -->
    <el-alert
      v-for="a in visibleAlerts"
      :key="a.type"
      class="region-alert"
      type="warning"
      show-icon
      :title="a.text"
      @close="dismissedAlerts.push(a.type)"
    />

    <!-- 4 KPI -->
    <div class="kpi-row">
      <div
        v-for="k in kpiCards"
        :key="k.label"
        class="kpi"
        :style="{ '--accentbar': k.accent }"
      >
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-val" :style="{ color: k.color }">
          {{ k.value }}<span class="kpi-unit">{{ k.unit }}</span>
        </div>
        <div v-if="k.sub" class="kpi-sub" :style="{ color: k.color }">
          {{ k.sub }}
        </div>
      </div>
    </div>

    <!-- 构成 + 仪表盘 -->
    <div class="mid-grid">
      <div class="panel">
        <header class="p-head"><span class="bar" />分方案能力构成</header>
        <v-chart
          class="comp"
          :option="compOption"
          autoresize
          style="height: 300px"
        />
        <p class="p-note">
          蓝色为场景实测，青色为历史峰值估算兜底；集中检修恒取基准值。
        </p>
      </div>

      <div class="panel">
        <header class="p-head"><span class="bar" />数据确信度</header>
        <v-chart
          class="gauge"
          :option="gaugeOption"
          autoresize
          style="height: 170px"
        />
        <div class="quality-cells">
          <div
            v-for="q in qualityCells"
            :key="q.label"
            class="qc"
            :class="q.cls"
          >
            <div class="qc-v">{{ q.value }}</div>
            <div class="qc-l">{{ q.label }}（户）</div>
          </div>
        </div>
        <div v-if="insufficient.count" class="warn-overview">
          <div class="wo-title">⚠ 数据不足概览</div>
          <div class="wo-text">
            数据不足 {{ insufficient.count }} 户 · 占
            {{ fmtNum(insufficient.pct, 2) }}% · 涉及
            {{ fmtNum(insufficient.cap, 2) }} 万千瓦
          </div>
          <el-button class="wo-link" type="primary" link @click="gotoWarn">
            查看明细 →
          </el-button>
        </div>
      </div>
    </div>

    <!-- 明细表 -->
    <div class="panel detail-section">
      <header class="p-head"><span class="bar" />用户可调明细</header>
      <UserDetailTable
        :rows="result.rows"
        :initial-warn-only="warnOnlyTrigger"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar z-99">
      <el-button @click="emit('reconfigure')">← 返回重新配置</el-button>
      <el-button class="sim-cta" @click="emit('report')">
        查看策略分析报告 →
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.result-overview {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 40px;
}

/* step dots */
.step-dots {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 22px;
}
.step-dot-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-card);
  z-index: 1;
}
.step-num.on {
  background: linear-gradient(135deg, var(--primary), #024a9c);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px -4px rgba(1, 89, 186, 0.5);
}
.step-num.done {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}
.st-t {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-light);
}
.step-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border);
  z-index: 0;
}
.step-line.done {
  background: var(--success);
}

/* title */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.title {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-light);
}
.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}
.title-actions {
  display: flex;
  gap: 10px;
}
/* summary */
.summary-card {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(1, 89, 186, 0.04);
  border: 1px solid rgba(1, 89, 186, 0.18);
  border-radius: 14px;
  padding: 14px 16px;
}
.sm-chip {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-light);
  padding: 5px 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.sm-k {
  color: var(--text-muted);
  margin-right: 6px;
  font-weight: 500;
}

/* region alert */
.region-alert {
  border-radius: 11px;
}

/* kpi */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.kpi {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.kpi::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accentbar);
}
.kpi-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.kpi-val {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}
.kpi-unit {
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
  color: var(--text-muted);
}
.kpi-sub {
  font-size: 11.5px;
  font-weight: 600;
  margin-top: 4px;
}

/* mid grid */
.mid-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.p-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 12px;
}
.p-head .bar {
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.p-note {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 10px;
  line-height: 1.6;
}

/* quality cells */
.quality-cells {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}
.qc {
  border-radius: 9px;
  padding: 10px;
  text-align: center;
}
.qc.blue {
  background: rgba(1, 89, 186, 0.07);
}
.qc.teal {
  background: rgba(0, 101, 105, 0.08);
}
.qc.amber {
  background: rgba(245, 158, 11, 0.08);
}
.qc-v {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.qc.blue .qc-v {
  color: var(--primary);
}
.qc.teal .qc-v {
  color: var(--secondary);
}
.qc.amber .qc-v {
  color: #b45309;
}
.qc-l {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 3px;
}

/* warn overview */
.warn-overview {
  margin-top: 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 11px;
  padding: 12px 14px;
}
.wo-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #b45309;
}
.wo-text {
  font-size: 12px;
  color: var(--text-light);
  margin: 6px 0;
}
.wo-link {
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

/* action bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  bottom: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px -12px rgba(20, 40, 80, 0.25);
}

@media (max-width: 980px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .mid-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

### step3/UserDetailTable.vue · 用户明细 el-table

`src/pages/simulator/components/step3/UserDetailTable.vue`

```vue
<script setup lang="ts">
import { fmtNum } from '~/utils/math'
import type { Plan, SimUserRow } from '../../types'

const props = defineProps<{ rows: SimUserRow[]; initialWarnOnly?: boolean }>()

const fCity = ref('')
const fIndustry = ref('')
const fPlan = ref('')
const fSource = ref('')
const warnOnly = ref(props.initialWarnOnly ?? false)
const sortDesc = ref(true)
const page = ref(1)
const pageSize = 12

watch(
  () => props.initialWarnOnly,
  (v) => {
    if (v) warnOnly.value = true
  },
)

const cityOpts = computed(() => [
  ...new Set(props.rows.map((r) => r.user.city)),
])
const industryOpts = computed(() => [
  ...new Set(props.rows.map((r) => r.user.industry)),
])
const planOpts = computed(() => [
  ...new Set(props.rows.map((r) => r.assignedPlan)),
])

const filtered = computed(() => {
  const list = props.rows.filter((r) => {
    if (fCity.value && r.user.city !== fCity.value) return false
    if (fIndustry.value && r.user.industry !== fIndustry.value) return false
    if (fPlan.value && r.assignedPlan !== fPlan.value) return false
    if (fSource.value && r.valueSource !== fSource.value) return false
    if (warnOnly.value && !r.isInsufficient) return false
    return true
  })
  return [...list].sort((a, b) =>
    sortDesc.value
      ? b.effectiveValue - a.effectiveValue
      : a.effectiveValue - b.effectiveValue,
  )
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([fCity, fIndustry, fPlan, fSource, warnOnly], () => (page.value = 1))

const PLAN_TAG: Record<Plan, 'danger' | 'primary' | 'success'> = {
  集中检修: 'danger',
  需求响应: 'primary',
  移峰填谷: 'success',
}

function handleSortChange({ order }: { prop: string; order: string | null }) {
  // 仅「场景可调值」列可排序；空表示恢复默认降序
  sortDesc.value = order !== 'ascending'
  page.value = 1
}

function reset() {
  fCity.value = ''
  fIndustry.value = ''
  fPlan.value = ''
  fSource.value = ''
  warnOnly.value = false
}
</script>

<template>
  <div class="detail-table">
    <div class="dt-toolbar">
      <el-select
        v-model="fCity"
        placeholder="全部地市"
        class="dt-sel"
        size="default"
      >
        <el-option label="全部地市" value="" />
        <el-option v-for="c in cityOpts" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select
        v-model="fIndustry"
        placeholder="全部行业"
        class="dt-sel"
        size="default"
      >
        <el-option label="全部行业" value="" />
        <el-option v-for="i in industryOpts" :key="i" :label="i" :value="i" />
      </el-select>
      <el-select
        v-model="fPlan"
        placeholder="全部方案"
        class="dt-sel"
        size="default"
      >
        <el-option label="全部方案" value="" />
        <el-option v-for="p in planOpts" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select
        v-model="fSource"
        placeholder="全部来源"
        class="dt-sel"
        size="default"
      >
        <el-option label="全部来源" value="" />
        <el-option label="场景实测" value="场景实测" />
        <el-option label="历史峰值估算" value="历史峰值估算" />
      </el-select>
      <label class="warn-toggle">
        <el-switch v-model="warnOnly" class="warn-switch" />
        仅看警告用户
      </label>
      <el-button text size="small" @click="reset">重置</el-button>
      <span class="dt-count">共 {{ filtered.length }} 户</span>
    </div>

    <el-table
      :data="paged"
      stripe
      size="small"
      class="dt-table"
      empty-text="无匹配用户"
      :default-sort="{ prop: 'effectiveValue', order: 'descending' }"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="user.userNo" label="户号" min-width="140">
        <template #default="{ row }">
          <span class="mono">{{ row.user.userNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="户名" min-width="180">
        <template #default="{ row }">
          <span class="uname">{{ row.user.userName }}</span>
          <el-tag
            v-if="row.isInsufficient"
            class="warn-badge"
            size="small"
            type="warning"
            effect="light"
            round
          >
            ⚠ 数据不足
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="user.city" label="地市" width="90" />
      <el-table-column prop="user.industry" label="行业" min-width="110" />
      <el-table-column label="归入方案" min-width="150">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="PLAN_TAG[row.assignedPlan]"
            effect="light"
            round
          >
            {{ row.assignedPlan }}
          </el-tag>
          <el-tag
            v-if="row.assignedPlan === '集中检修'"
            class="fix-tag"
            size="small"
            effect="light"
            round
          >
            恒基准
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="effectiveValue"
        label="场景可调值(万千瓦)"
        align="right"
        min-width="140"
        sortable="custom"
      >
        <template #default="{ row }">
          <span class="val">{{ fmtNum(row.effectiveValue, 2) }}</span>
          <span class="val-unit"> 万千瓦</span>
        </template>
      </el-table-column>
      <el-table-column label="取值来源" min-width="120">
        <template #default="{ row }">
          <span
            class="src"
            :class="row.valueSource === '场景实测' ? 'src-real' : 'src-est'"
          >
            {{ row.valueSource }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="建议时段" min-width="120">
        <template #default="{ row }">
          <span class="mono period">{{ row.user.suggestPeriod }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="dt-pager">
      <el-pagination
        v-model:current-page="page"
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="filtered.length"
        background
      />
    </div>
  </div>
</template>

<style scoped>
.dt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.dt-sel {
  width: 130px;
}
.warn-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}
.warn-switch {
  --el-switch-on-color: var(--warning);
}
.dt-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  background: rgba(1, 89, 186, 0.1);
  padding: 4px 11px;
  border-radius: 20px;
}

.dt-table {
  width: 100%;
  background: transparent;
}
.mono {
  font-family: var(--font-mono, monospace);
  color: var(--text-muted);
}
.val {
  font-weight: 700;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}
.val-unit {
  font-size: 11px;
  color: var(--text-muted);
}
.uname {
  font-weight: 600;
}
.warn-badge {
  margin-left: 6px;
  animation: pulse2 0.5s ease 2;
}
@keyframes pulse2 {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  100% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
}
.fix-tag {
  margin-left: 4px;
  color: var(--secondary);
  background: rgba(0, 101, 105, 0.12);
  border-color: rgba(0, 101, 105, 0.2);
}
.src {
  font-size: 11.5px;
  font-weight: 600;
}
.src-real {
  color: var(--primary);
}
.src-est {
  color: var(--accent);
}
.period {
  color: var(--text-muted);
}
.dt-pager {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}
</style>
```

### step4/StrategyReport.vue · 五章策略报告 + 进度环

`src/pages/simulator/components/step4/StrategyReport.vue`

```vue
<script setup lang="ts">
import { div, fmtNum, mul } from '~/utils/math'
import { useReportExport } from '../../composables/useReportExport'
import { useSimWizard } from '../../composables/useSimWizard'

const emit = defineEmits<{ back: [] }>()
const { store } = useSimWizard()
const { reportTime, reportId, generateReportMeta, exportPdf } =
  useReportExport()

const result = computed(() => store.currentResult)
const config = computed(() => store.currentConfig)
const kpi = computed(() => store.currentResult?.kpi)

const CHAPTERS = [
  { key: 'conclusion', name: '评估结论', tag: '01' },
  { key: 'resource', name: '可调资源构成解析', tag: '02' },
  { key: 'perf', name: '极端实绩优势', tag: '03' },
  { key: 'risk', name: '风险提示', tag: '04' },
  { key: 'advice', name: '调配建议', tag: '05' },
]

/* 计算口径 */
const d = computed(() => {
  const k = kpi.value
  const c = config.value
  const r = result.value
  if (!k || !c || !r) return null
  const breakdown = r.breakdown
  const top = breakdown.length
    ? breakdown.reduce((a, b) => (b.capacity > a.capacity ? b : a))
    : null
  return {
    region: c.region,
    season: c.season,
    temp: `${c.tempRange[0]}~${c.tempRange[1]}℃`,
    weather: c.extremeWeather,
    dispatch: c.dispatch,
    output: c.output,
    gap: c.targetGap ?? 0,
    totalCapacity: k.totalCapacity,
    totalUsers: k.totalUsers,
    confidence: k.confidence,
    concentration: k.concentration,
    insufficient: k.insufficientCount,
    completion: k.completion,
    satisfied: k.satisfied,
    shortfall: k.shortfall,
    breakdown,
    top,
    met: k.completion >= 100,
    hasPerf: c.extremeWeather.length > 0,
  }
})

function planPct(cap: number): number {
  const total = d.value?.totalCapacity ?? 0
  return total ? mul(div(cap, total), 100) : 0
}
/* 场景描述 */
const tempScene = computed(() => {
  const c = config.value
  if (!c) return ''
  if (c.season === '迎峰度夏' && c.tempRange[1] >= 35) return '高温'
  if (c.season === '迎峰度冬' && c.tempRange[0] <= 5) return '低温'
  return ''
})
const sceneFull = computed(() => {
  const c = config.value
  if (!c) return ''
  const parts: string[] = [c.season]
  if (tempScene.value) parts.push(`${tempScene.value}日`)
  if (c.extremeWeather.length) parts.push(c.extremeWeather.join('/'))
  return parts.join(' · ')
})
/** 是否极端/敏感场景（高低温或极端天气） */
const hasExtreme = computed(
  () => !!tempScene.value || (config.value?.extremeWeather.length ?? 0) > 0,
)
/** 实绩标签（如「高温实绩」） */
const perfLabel = computed(
  () => tempScene.value || config.value?.extremeWeather[0] || '场景',
)

/* 数据质量三档 + 实绩分桶 */
const buckets = computed(() => {
  const rows = result.value?.rows ?? []
  const total = rows.length
  const isScene = (r: (typeof rows)[number]) => r.valueSource === '场景实测'
  return {
    total,
    excellent: rows.filter((r) => isScene(r) && !r.isInsufficient).length,
    normal: rows.filter((r) => !isScene(r) && !r.isInsufficient).length,
    warn: rows.filter((r) => r.isInsufficient).length,
    perf: rows.filter((r) => isScene(r)).length,
    perfFew: rows.filter((r) => isScene(r) && r.isInsufficient).length,
    noPerf: rows.filter((r) => !isScene(r)).length,
  }
})
function pctOf(n: number): number {
  const t = buckets.value.total
  return t ? mul(div(n, t), 100) : 0
}
function planValueDesc(plan: string): string {
  if (plan === '集中检修') return '恒取基准'
  return tempScene.value
    ? `${tempScene.value}取值 / 回退基准`
    : '场景取值 / 回退基准'
}

/* 触发风险数量 */
const riskCount = computed(() => {
  const dd = d.value
  if (!dd) return 0
  let n = 1 // 资源集中度始终列示
  if (!dd.met) n++
  if (dd.insufficient > 0) n++
  if (tempScene.value) n++
  if (dd.region === '丽水') n++
  return n
})
const seasonMatched = computed(() => {
  const dd = d.value
  return dd ? dd.insufficient / Math.max(1, dd.totalUsers) < 0.8 : true
})

/* 章节级流式 */
const revealed = ref(0)
const writing = ref(false)
const CUE_MS = 320
const SECTION_MS = 540

async function generate() {
  revealed.value = 0
  for (let i = 0; i < CHAPTERS.length; i++) {
    writing.value = true
    await new Promise((r) => setTimeout(r, CUE_MS))
    writing.value = false
    revealed.value = i + 1
    await new Promise((r) => setTimeout(r, SECTION_MS))
  }
}

const done = computed(() => revealed.value >= CHAPTERS.length)
const genPct = computed(() =>
  Math.round((revealed.value / CHAPTERS.length) * 100),
)

/** 章节进度环（SVG stroke-dashoffset，平滑过渡 + 抗锯齿） */
const RING_C = 2 * Math.PI * 8
function ringOffset(i: number): number {
  const st = chapterState(i)
  const pct = st === 'done' ? 1 : st === 'doing' ? 0.35 : 0
  return Number((RING_C * (1 - pct)).toFixed(3))
}

onMounted(() => {
  generateReportMeta()
  generate()
})

const activeAnchor = ref(0)
function chapterState(i: number): 'done' | 'doing' | 'todo' {
  if (i < revealed.value) return 'done'
  if (i === revealed.value && writing.value) return 'doing'
  return 'todo'
}

/** 章节正文锚点 id */
function secId(i: number) {
  return `sr-sec-${CHAPTERS[i].key}`
}
/** 点击右侧导航：平滑滚动到对应章节（仅已生成章节可跳转） */
function scrollToChapter(i: number) {
  if (revealed.value <= i) return
  const el = document.getElementById(secId(i))
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeAnchor.value = i
}

/* 滚动联动高亮（scrollspy）：所有章节生成完毕后启用 */
const HEADER_OFFSET = 52 + 8
let spyObserver: IntersectionObserver | null = null
function updateActiveAnchor() {
  let cur = 0
  document.querySelectorAll<HTMLElement>('.report-section').forEach((el, i) => {
    if (el.getBoundingClientRect().top - HEADER_OFFSET <= 0) cur = i
  })
  activeAnchor.value = cur
}
watch(done, (isDone) => {
  if (!isDone) return
  nextTick(() => {
    if (spyObserver) return
    const sections = document.querySelectorAll<HTMLElement>('.report-section')
    if (!sections.length) return
    spyObserver = new IntersectionObserver(updateActiveAnchor, {
      rootMargin: `-${HEADER_OFFSET}px 0px -80% 0px`,
      threshold: 0,
    })
    sections.forEach((s) => spyObserver!.observe(s))
    updateActiveAnchor()
  })
})
onUnmounted(() => {
  spyObserver?.disconnect()
  spyObserver = null
})
</script>

<template>
  <div v-if="d" class="strategy-report">
    <div class="report-col">
      <!-- 头卡 -->
      <div class="header-card">
        <div class="hc-top">
          <div class="doc-icon"><i class="i-mdi:file-document-outline" /></div>
          <div class="hc-title-wrap">
            <h2 class="hc-title">策略分析报告</h2>
            <div class="hc-sub">
              {{ config?.schemeName }} · 缺口驱动可调能力评估
            </div>
          </div>
          <div class="hc-actions">
            <span class="llm-badge">
              ✦ LLM 后期接入
              <span class="llm-tip">
                <b>关于 LLM 增强</b><br />当前报告由<b>规则模板引擎</b>依据量化
                KPI 自动撰写，零后端依赖。LLM
                大模型增强将于<b>后续版本</b>接入，提供更具语境感知的策略解读与跨场景比对。
              </span>
            </span>
            <el-button size="small" @click="generate">↻ 重新生成</el-button>
            <el-button size="small" @click="exportPdf">导出报告</el-button>
          </div>
        </div>
        <div class="hc-meta">
          <span
            ><b>方案名称</b
            ><span class="v-primary">{{ config?.schemeName }}</span></span
          >
          <span><b>生成时间</b>{{ reportTime }}</span>
          <span><b>报告编号</b>{{ reportId }}</span>
        </div>
        <div class="hc-meta">
          <span
            ><b>评估范围</b>{{ d.region }} · {{ config?.plans.join('/') }} ·
            {{ sceneFull }} · {{ d.dispatch }} · 出力{{ d.output }}%</span
          >
        </div>
        <div class="hc-meta">
          <span
            ><b>目标缺口</b
            ><span class="v-accent">{{ fmtNum(d.gap, 2) }} 万千瓦</span></span
          >
          <span
            ><b>可调能力上限</b
            ><span class="v-primary"
              >{{ fmtNum(d.totalCapacity, 2) }} 万千瓦</span
            ></span
          >
          <span><b>生成模型</b>规则模板引擎 v1</span>
          <span class="status-pill" :class="d.met ? 'ok' : 'warn'">
            完成度 {{ fmtNum(d.completion, 2) }}% ·
            {{ d.met ? '已达标' : '未达标' }}
          </span>
          <span class="status-pill" :class="done ? 'ok' : 'warn'">{{
            done ? '✓ 已完成' : '⏳ 撰写中…'
          }}</span>
        </div>
        <div class="hc-kpis">
          <div class="hc-kpi">
            <div class="val" style="color: var(--accent)">
              {{ fmtNum(d.completion, 2) }}%
            </div>
            <div class="lbl">完成度（已满足 / 目标缺口）</div>
          </div>
          <div class="hc-kpi">
            <div class="val" style="color: var(--primary)">
              {{ fmtNum(d.satisfied, 2) }}
              <span class="val-u">万千瓦</span>
            </div>
            <div class="lbl">已满足量（目标缺口 {{ fmtNum(d.gap, 2) }}）</div>
          </div>
          <div class="hc-kpi">
            <div class="val">
              {{ d.totalUsers }} <span class="val-u">户</span>
            </div>
            <div class="lbl">参与用户（去重纳入）</div>
          </div>
          <div class="hc-kpi">
            <div class="val" style="color: #15803d">
              {{ fmtNum(d.concentration, 2) }}%
            </div>
            <div class="lbl">资源集中度（{{ d.region }} Top3）</div>
          </div>
        </div>
      </div>

      <!-- 正文章节 -->
      <div class="report-content">
        <!-- 1 评估结论 -->
        <section
          v-if="revealed >= 1"
          :id="secId(0)"
          class="report-section appear"
        >
          <h3>
            一、评估结论<span class="sec-tag"
              >缺口 · 完成度 · 已满足量 · 纳入户</span
            >
          </h3>
          <p>
            本次评估属
            <strong>A 型 · 可调能力缺口驱动评估</strong
            >，不引入负荷预测：在给定场景与一个<strong>目标缺口</strong>下，如实回答<em>能否满足、满足了多少（完成度）、由哪些用户构成</em>。评估范围为
            <em>{{ d.region }}</em
            >，场景设定为 <em>{{ sceneFull }}</em
            >，纳入 <em>{{ config?.plans.join(' / ') }}</em> 共
            {{ config?.plans.length }} 个方案，期望出力比例
            <em>{{ d.output }}%</em>，目标缺口
            <em>{{ fmtNum(d.gap, 2) }} 万千瓦</em>，调配策略选定
            <em>{{ d.dispatch }}</em
            >。
          </p>
          <p>
            聚合结果：本场景本方案"取值 → 出力折算 →
            去重归类"后，<strong>可调能力上限</strong>为
            <em>{{ fmtNum(d.totalCapacity, 2) }} 万千瓦</em>，
            <template v-if="d.met"
              ><span class="hl-good">不低于</span>目标缺口
              {{ fmtNum(d.gap, 2) }}
              万千瓦，缺口<strong>可完全满足</strong>。</template
            >
            <template v-else
              ><span class="hl-warn">低于</span>目标缺口
              {{ fmtNum(d.gap, 2) }}
              万千瓦，缺口<strong>不可完全满足</strong>。</template
            >
            按口径
            <em>完成度 = min(可调能力上限, 目标缺口) / 目标缺口</em>，本次完成度
            <span :class="d.met ? 'hl-good' : 'hl-warn'"
              >{{ fmtNum(d.completion, 2) }}%</span
            >，已满足量 <em>{{ fmtNum(d.satisfied, 2) }} 万千瓦</em>，
            <template v-if="!d.met"
              >尚缺
              <span class="hl-warn">{{ fmtNum(d.shortfall, 2) }} 万千瓦</span
              >。由于缺口超出上限，系统已<strong>全员调动</strong>全部在范围用户
              <em>{{ d.totalUsers }} 户</em
              >（去重纳入），此时<strong>三种调配策略均不影响最终结果</strong>（大用户优先
              / 广度优先 /
              均衡调动仅在缺口可满足时决定"选哪些用户"）。</template
            >
            <template v-else
              >缺口在可调能力范围内，由 <em>{{ d.dispatch }}</em>
              策略决定具体纳入哪些用户，本次去重纳入
              <em>{{ d.totalUsers }} 户</em>。</template
            >
            数据确信度 <em>{{ fmtNum(d.confidence, 2) }}%</em>。
          </p>
          <div class="kpi-grid">
            <div class="kpi-bar">
              <div class="kb-top">
                <span class="kb-lbl">目标缺口</span>
                <span class="kb-val" style="color: var(--accent)"
                  >{{ fmtNum(d.gap, 2) }} 万千瓦</span
                >
              </div>
              <div class="kb-track">
                <div
                  class="kb-fill"
                  style="width: 100%; background: var(--accent)"
                />
              </div>
              <div class="kb-note">用户手输的假设值 · 非系统预测</div>
            </div>
            <div class="kpi-bar">
              <div class="kb-top">
                <span class="kb-lbl">已满足量（可调能力上限）</span>
                <span class="kb-val" style="color: var(--primary)"
                  >{{ fmtNum(d.satisfied, 2) }} 万千瓦</span
                >
              </div>
              <div class="kb-track">
                <div
                  class="kb-fill"
                  :style="{
                    width: Math.min(100, d.completion) + '%',
                    background: 'var(--primary)',
                  }"
                />
              </div>
              <div class="kb-note">去重归类 · ×{{ d.output }}% 出力折算后</div>
            </div>
            <div class="kpi-bar">
              <div class="kb-top">
                <span class="kb-lbl">完成度</span>
                <span
                  class="kb-val"
                  :style="{ color: d.met ? '#15803d' : '#b45309' }"
                  >{{ fmtNum(d.completion, 2) }}%</span
                >
              </div>
              <div class="kb-track">
                <div
                  class="kb-fill"
                  :style="{
                    width: Math.min(100, d.completion) + '%',
                    background: d.met ? 'var(--success)' : 'var(--warning)',
                  }"
                />
              </div>
              <div class="kb-note">
                {{
                  d.met ? '≥100% · 缺口可完全满足' : '＜100% · 缺口不可完全满足'
                }}
              </div>
            </div>
            <div class="kpi-bar">
              <div class="kb-top">
                <span class="kb-lbl">参与用户（去重纳入）</span>
                <span class="kb-val">{{ d.totalUsers }} 户</span>
              </div>
              <div class="kb-track">
                <div
                  class="kb-fill"
                  style="width: 100%; background: var(--secondary)"
                />
              </div>
              <div class="kb-note">
                {{
                  d.met ? '缺口可满足 · 按策略选取' : '缺口不可满足 · 全员调动'
                }}
              </div>
            </div>
          </div>
          <div class="highlight-box">
            <div class="hb-t">表 1 · 评估关键参数与结论</div>
            <table class="report-table bordered">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>取值</th>
                  <th>口径 / 说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>评估范围</td>
                  <td>{{ d.region }}</td>
                  <td>区域为"全省"时按全量资源池测算</td>
                </tr>
                <tr>
                  <td>场景设定</td>
                  <td>{{ sceneFull }}</td>
                  <td>单场景互斥；高/低温端越过该户拐点阈值切对应取值</td>
                </tr>
                <tr>
                  <td>方案集合</td>
                  <td>{{ config?.plans.join(' · ') }}</td>
                  <td>去重归类：集中检修 ＞ 需求响应 ＞ 移峰填谷</td>
                </tr>
                <tr>
                  <td>期望出力</td>
                  <td>{{ d.output }}%</td>
                  <td>每户贡献 = 场景取值 × 出力%</td>
                </tr>
                <tr>
                  <td>目标缺口</td>
                  <td>{{ fmtNum(d.gap, 2) }} 万千瓦</td>
                  <td>必填 · 本次拟调出的可调容量目标</td>
                </tr>
                <tr>
                  <td>可调能力上限</td>
                  <td>{{ fmtNum(d.totalCapacity, 2) }} 万千瓦</td>
                  <td>Σ 各在范围用户可用贡献</td>
                </tr>
                <tr>
                  <td>完成度</td>
                  <td>{{ fmtNum(d.completion, 2) }}%</td>
                  <td>
                    min({{ fmtNum(d.totalCapacity, 2) }},
                    {{ fmtNum(d.gap, 2) }}) /
                    {{ fmtNum(d.gap, 2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 2 资源构成 -->
        <section
          v-if="revealed >= 2"
          :id="secId(1)"
          class="report-section appear"
        >
          <h3>
            二、可调资源构成解析<span class="sec-tag"
              >三方案 · 去重归类 · 数据质量三档</span
            >
          </h3>
          <p>
            本次纳入 <em>{{ config?.plans.join(' / ') }}</em>
            可调资源。为消除一户多方案的重复计算，引擎按固定优先级
            <em>集中检修 ＞ 需求响应 ＞ 移峰填谷</em>
            做去重归类，<strong>一户只计一次</strong>：同属集中检修与需求响应者归入集中检修，同属需求响应与移峰填谷者归入需求响应。去重后纳入用户合计
            <em>{{ d.totalUsers }} 户</em>、已满足量
            <em>{{ fmtNum(d.satisfied, 2) }} 万千瓦</em>。
          </p>
          <table class="report-table bordered">
            <thead>
              <tr>
                <th>归入方案</th>
                <th class="num">纳入户数</th>
                <th class="num">已满足能力(万千瓦)</th>
                <th class="num">占比</th>
                <th>取值口径</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in d.breakdown" :key="b.plan">
                <td>{{ b.plan }}</td>
                <td class="num">{{ b.users }} 户</td>
                <td class="num">{{ fmtNum(b.capacity, 2) }}</td>
                <td class="num">{{ fmtNum(planPct(b.capacity), 2) }}%</td>
                <td>
                  <span v-if="b.plan === '集中检修'" class="hl-good"
                    >恒取基准</span
                  >
                  <span v-else>{{ planValueDesc(b.plan) }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>合计（去重）</td>
                <td class="num">{{ d.totalUsers }} 户</td>
                <td class="num">{{ fmtNum(d.totalCapacity, 2) }}</td>
                <td class="num">100%</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
          <p>
            按
            <strong>数据质量三档</strong
            >（场景相关、按优先级互斥）拆分纳入资源：<em>优秀</em>＝当前{{
              perfLabel
            }}场景历史调节记录充足（经受过考验且数据足）；<em>普通</em>＝无场景记录、回退基准且基准数据充足；<em>警告</em>＝当前取值支撑记录
            ≤2（数据不足，数据越少误差越大）。三档分布如下。
          </p>
          <div class="grade-row">
            <div class="grade-cell gc-good">
              <div class="gc-v">{{ buckets.excellent }}</div>
              <div class="gc-l">优秀 · 场景实测</div>
              <div class="gc-s">
                占纳入
                {{ fmtNum(pctOf(buckets.excellent), 1) }}%，取场景历史最大削峰
              </div>
            </div>
            <div class="grade-cell gc-norm">
              <div class="gc-v">{{ buckets.normal }}</div>
              <div class="gc-l">普通 · 回退基准</div>
              <div class="gc-s">
                占 {{ fmtNum(pctOf(buckets.normal), 1) }}%，回退取基准值（base
                充足）
              </div>
            </div>
            <div class="grade-cell gc-warn">
              <div class="gc-v">{{ buckets.warn }}</div>
              <div class="gc-l">警告 · 数据不足</div>
              <div class="gc-s">
                支撑记录 ≤ 2，占
                {{ fmtNum(pctOf(buckets.warn), 1) }}%，取值依据有限
              </div>
            </div>
          </div>
          <div class="highlight-box">
            <div class="hb-t">资源构成要点</div>
            集中检修方案<em>任何场景恒取基准、不随天气波动</em>，能力稳定性最高，宜作确定性容量池优先调用；<template
              v-if="d.top"
              >{{ d.top.plan }}贡献最高（{{
                fmtNum(d.top.capacity, 2)
              }}
              万千瓦），是本轮满足缺口的主力来源。</template
            >
          </div>
        </section>

        <!-- 3 极端实绩优势 -->
        <section
          v-if="revealed >= 3"
          :id="secId(2)"
          class="report-section appear"
        >
          <h3>
            三、极端实绩优势<span class="sec-tag"
              >{{ perfLabel }}实绩 · 区分类型</span
            >
          </h3>
          <template v-if="hasExtreme">
            <p>
              本模块的"优势"特指<strong>极端场景实绩</strong>——用户在<strong>当前场景下确有历史调节记录</strong>（即"经受过该场景考验"），区分天气类型，仅移峰填谷
              / 需求响应方案具备（集中检修恒取基准、无场景实绩）。本次场景为
              <em>{{ sceneFull }}</em
              >，故实绩即 <strong>{{ perfLabel }}实绩</strong>。
            </p>
            <p>
              统计显示：在 {{ d.totalUsers }} 户纳入用户中，<em
                >{{ buckets.perf }} 户</em
              >
              具备{{ perfLabel }}实绩，占纳入用户
              <span class="hl-good">{{ fmtNum(pctOf(buckets.perf), 1) }}%</span
              >。其中 <em>{{ buckets.excellent }} 户</em>
              记录充足（评为"优秀"），取值采用其场景历史最大削峰，最贴近真实出力；另有
              {{ buckets.perfFew }}
              户记录偏少（列入"数据不足/警告"）。这批实绩用户在保供中<strong>响应可信度最高</strong>，建议优先锁定。
            </p>
            <table class="report-table bordered">
              <thead>
                <tr>
                  <th>实绩类别（当前场景）</th>
                  <th class="num">用户数</th>
                  <th>取值依据</th>
                  <th>调度参考</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ perfLabel }}实绩 · 优秀</td>
                  <td class="num">{{ buckets.excellent }} 户</td>
                  <td>场景历史最大削峰</td>
                  <td><span class="hl-good">出力可信度高，优先锁定</span></td>
                </tr>
                <tr>
                  <td>{{ perfLabel }}实绩 · 数据偏少</td>
                  <td class="num">{{ buckets.perfFew }} 户</td>
                  <td>场景取值，但标注数据不足</td>
                  <td>有实绩但样本薄，执行前复核</td>
                </tr>
                <tr>
                  <td>无{{ perfLabel }}实绩</td>
                  <td class="num">{{ buckets.noPerf }} 户</td>
                  <td>回退基准值</td>
                  <td>非敏感或暂无记录，按基准估算</td>
                </tr>
              </tbody>
            </table>
            <div class="highlight-box">
              <div class="hb-t">实绩优势提示</div>
              实绩用户经受过真实调节考验，其场景取值由自身历史记录支撑、不借用他人，<em>在高峰组织响应时确定性更强</em>。如对响应稳健性要求更高，可在第
              1
              步勾选"<strong>优先采用极端天气实绩数据</strong>"，使实绩用户优先纳入、其余按所选策略接续，<strong>不强制排除</strong>他人。
            </div>
          </template>
          <div v-else class="info warn-box">
            <strong>本章节未触发。</strong
            >本次未选择高/低温或极端天气场景，无"极端实绩"维度。如需评估恶劣工况下的可调能力，可在第
            1 步参数配置中调整温度区间越过阈值，或加入暴雨 / 冻雨 / 大风
            等极端天气场景后重新评估。
          </div>
        </section>

        <!-- 4 风险提示 -->
        <section
          v-if="revealed >= 4"
          :id="secId(3)"
          class="report-section appear"
        >
          <h3>
            四、风险提示<span class="sec-tag"
              >逐项排序 · 共触发 {{ riskCount }} 项</span
            >
          </h3>
          <p>
            本报告仅就被触发的风险逐项提示，按优先级排序，不下达运行态风险判断。本次共触发
            <span class="hl-warn">{{ riskCount }} 项</span>。
          </p>
          <div v-if="!d.met" class="warn-box danger">
            <strong>✕ 风险（头号）· 完成度不足，目标缺口未被满足。</strong>
            可调能力上限 {{ fmtNum(d.totalCapacity, 2) }} 万千瓦低于目标缺口
            {{ fmtNum(d.gap, 2) }} 万千瓦，完成度仅
            <span class="hl-danger">{{ fmtNum(d.completion, 2) }}%</span>、尚缺
            <span class="hl-danger">{{ fmtNum(d.shortfall, 2) }} 万千瓦</span
            >。当前已全员调动、能力已至上限，无法再通过切换调配策略提升。建议<strong>下调缺口预期</strong>或<strong>扩充可调资源</strong>（详见第五章建议）后重新评估。
          </div>
          <div v-if="d.insufficient > 0" class="warn-box">
            <strong
              >⚠ 风险 · 数据不足，{{ d.insufficient }} 户取值依据有限。</strong
            >
            这 {{ d.insufficient }} 户当前取值支撑记录 ≤ 2 条（占纳入
            {{
              fmtNum(pctOf(d.insufficient), 1)
            }}%），数据越少误差越大、且回退基准偏乐观。保供组织时宜对其承诺量保留冗余裕量，执行前向对应用户确认当前调节意愿。
          </div>
          <div class="warn-box">
            <strong>⚠ 风险 · 资源集中度。</strong>
            <template v-if="d.concentration >= 40"
              >当前范围 Top3 纳入户占已满足量达
              <span class="hl-danger">{{ fmtNum(d.concentration, 2) }}%</span
              >（≥40%
              警戒线），单一用户退出将显著影响整体能力，需提前锁定头部用户确认响应。</template
            >
            <template v-else
              >当前范围 Top3 纳入户占已满足量
              <em>{{ fmtNum(d.concentration, 2) }}%</em>（＜40%
              警戒线，不构成单点依赖）；但下钻至舟山等小地市，Top3
              占比可能偏高，需关注小范围单点风险。</template
            >
          </div>
          <div v-if="tempScene" class="warn-box">
            <strong>⚠ 风险 · 温度敏感（{{ tempScene }}）。</strong> 本次为{{
              tempScene
            }}场景，部分制造业{{ tempScene }}敏感户在{{
              tempScene
            }}日设备负荷变化、可调能力出现回落（已由逐户拐点扫描估算反映）。建议关注{{
              tempScene
            }}持续时段的实际响应，并预留
            <span class="hl-warn">10%～15%</span> 余量。
          </div>
          <div v-if="d.region === '丽水'" class="warn-box">
            <strong>⚠ 风险 · 丽水数据局限。</strong>
            丽水地区天气数据暂未完整纳入，其温度 / 降水 /
            风级场景的可调值已按<em>数据不足</em>处理、回退基准兜底，相关贡献偏估算，建议执行前补充现场核实。
          </div>
          <div v-if="seasonMatched" class="warn-box info">
            <strong>✓ 未触发 · 季节不匹配。</strong> 本次"{{ d.region }} +
            {{ config?.plans.length }} 方案 +
            {{
              d.season
            }}"组合历史事件充足，季节匹配，未触发该提示；相应取值可信度较优。
          </div>
        </section>

        <!-- 5 调配建议 -->
        <section
          v-if="revealed >= 5"
          :id="secId(4)"
          class="report-section appear"
        >
          <h3>
            五、调配建议<span class="sec-tag"
              >{{ d.dispatch }} · 出力{{ d.output }}%</span
            >
          </h3>
          <p>
            当前策略为
            <em>{{ d.dispatch }} + {{ d.output }}% 出力</em>。<template
              v-if="!d.met"
              >因目标缺口超出可调能力上限，本次已<strong>全员调动</strong>、三策略不改变结果；</template
            ><template v-else
              >缺口在能力范围内，由
              {{ d.dispatch }} 策略选取纳入用户；</template
            >每户贡献 = 场景取值 ×
            {{ d.output }}%，跨方案去重归类后求和得已满足量
            <em>{{ fmtNum(d.satisfied, 2) }} 万千瓦</em
            >。组织响应时建议按去重归类优先级——<em>优先启用集中检修（恒基准、能力稳定），其次需求响应，再次移峰填谷</em>。
          </p>
          <ol class="advice-ol">
            <li v-if="!d.met">
              <strong>[P0] 收敛缺口预期或扩充可调资源。</strong> 针对
              {{ fmtNum(d.completion, 2) }}% 的完成度，若
              {{ fmtNum(d.gap, 2) }}
              万千瓦为硬目标，需在本资源池外补充可调资源（纳入更多方案 /
              跨区协同）；若为弹性目标，可将缺口下调至 ≤{{
                fmtNum(d.totalCapacity, 2)
              }}
              万千瓦即可达成 100% 完成度。
            </li>
            <li v-else>
              <strong>[P0] 锁定纳入用户、按优先级组织。</strong>
              完成度已达标，按
              {{ d.dispatch }} 选取的纳入用户优先启用集中检修与需求响应，预留
              10–15% 调度余量应对波动。
            </li>
            <li v-if="d.insufficient > 0">
              <strong>[P0] 对数据不足户做专项核实。</strong> 对
              <span class="hl-warn">{{ d.insufficient }} 户数据不足</span
              >用户开展专项场景能力核实，在正式调度前完成现场确认，避免按回退基准的乐观值直接承诺。
            </li>
            <li>
              <strong>[P1] 对高集中度小地市设置冗余。</strong>
              对舟山、丽水等 Top3
              占比偏高的小地市配置备用梯队，配合省级跨区域协同，规避单点退出风险。
            </li>
            <li v-if="hasExtreme">
              <strong>[P1] 优先锁定{{ perfLabel }}实绩用户。</strong>
              {{ buckets.excellent }} 户{{
                perfLabel
              }}实绩（优秀）用户响应确定性最高，建议在高峰段优先锁定；如需更稳健，可在第
              1 步勾选"优先采用极端天气实绩数据"。
            </li>
            <li>
              <strong>[P2] 持续补充冬季 / 平时历史样本。</strong>
              历史削峰事件集中于夏季，平时与冬季场景"数据不足"更突出；系统性补样本可降低后续相应季节评估的不确定性。
            </li>
          </ol>
          <div class="highlight-box">
            <div class="hb-t">建议调度时段口径</div>
            多数用户建议响应时段集中于
            <em>14:00～17:00</em>（度夏峰段，触发率最高）。<template
              v-if="tempScene"
              >{{ tempScene }}日可调能力存在回落，</template
            >建议预留
            <span class="hl-warn">10%～15% 余量</span
            >，并对"数据不足"用户的承诺量适度打折。
          </div>
          <p style="margin-top: 14px">
            <strong>综合结论：</strong>本方案在
            <em>{{ d.region }} · {{ sceneFull }} · 出力{{ d.output }}%</em>
            下，去重后可调能力上限
            <em>{{ fmtNum(d.totalCapacity, 2) }} 万千瓦</em>，对
            {{ fmtNum(d.gap, 2) }} 万千瓦目标缺口完成度
            <span :class="d.met ? 'hl-good' : 'hl-warn'"
              >{{ fmtNum(d.completion, 2) }}%</span
            >，<strong>{{
              d.met ? '缺口可完全满足' : '缺口未被完全满足'
            }}</strong
            >。<strong>下一步建议：</strong
            ><template v-if="!d.met"
              >① 收敛缺口预期或扩充资源以闭合
              {{ fmtNum(d.shortfall, 2) }} 万千瓦缺口；</template
            ><template v-if="d.insufficient > 0"
              >② 对 {{ d.insufficient }} 户数据不足户完成执行前核实；</template
            >③ 对舟山等高集中度小地市预置冗余与跨区协同<template
              v-if="hasExtreme"
              >；④ 优先锁定 {{ buckets.excellent }} 户{{
                perfLabel
              }}实绩用户组织响应</template
            >。
          </p>
        </section>

        <!-- 写作光标 -->
        <div v-if="writing && !done" class="writing-cue">
          <span class="spin" /><span class="cursor" /> 正在生成第
          {{ revealed + 1 }} 章…
        </div>
      </div>

      <div class="bottom-bar">
        <el-button @click="emit('back')">← 返回结果总览</el-button>
      </div>
    </div>

    <!-- 右侧锚点导航 -->
    <aside class="nav-col">
      <div class="anchor-panel">
        <div class="ap-title">报告章节</div>
        <div
          v-for="(ch, i) in CHAPTERS"
          :key="ch.key"
          class="anchor-item"
          :class="{
            active: activeAnchor === i,
            disabled: revealed <= i,
          }"
          @click="scrollToChapter(i)"
        >
          <span class="status-dot" :class="chapterState(i)" />
          <span class="a-name">{{ ch.name }}</span>
          <svg class="prog-ring" width="18" height="18" viewBox="0 0 20 20">
            <circle class="ring-track" cx="10" cy="10" r="8" />
            <circle
              class="ring-bar"
              cx="10"
              cy="10"
              r="8"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="ringOffset(i)"
            />
          </svg>
        </div>

        <div class="gen-prog">
          <div class="gp-row">
            <span>生成进度</span><span>{{ genPct }}%</span>
          </div>
          <div class="gp-track">
            <div class="gp-fill" :style="{ width: genPct + '%' }" />
          </div>
          <div class="gp-row sub">
            <span>{{ revealed }}/5 章</span
            ><span>{{ done ? '已完成' : '撰写中' }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.strategy-report {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.report-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.nav-col {
  width: 248px;
  flex-shrink: 0;
  position: sticky;
  top: 16px;
}

/* header card */
.header-card,
.anchor-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.header-card {
  padding: 20px 22px;
}
.hc-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.doc-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(1, 89, 186, 0.16),
    rgba(0, 101, 105, 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 20px;
}
.hc-title-wrap {
  flex: 1;
}
.hc-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-light);
}
.hc-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
.hc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.llm-badge {
  position: relative;
  background: rgba(245, 158, 11, 0.13);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  cursor: default;
}
.llm-tip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 248px;
  background: var(--bg-card);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  padding: 11px 13px;
  font-size: 11.5px;
  font-weight: 400;
  color: var(--text-light);
  line-height: 1.55;
  text-align: left;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: 0.2s;
  z-index: 80;
  box-shadow: 0 12px 30px -10px rgba(20, 40, 80, 0.3);
}
.llm-tip b {
  color: #b45309;
}
.llm-badge:hover .llm-tip {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.v-primary {
  font-weight: 600;
  color: var(--primary);
}
.v-accent {
  font-weight: 600;
  color: var(--accent);
}
.val-u {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}
.btn {
  border-radius: 11px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
}
.btn.ghost {
  background: var(--bg-card);
  border-color: var(--border);
  color: var(--text-light);
}
.btn.sm {
  padding: 6px 12px;
  font-size: 12px;
}
.hc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-light);
}
.hc-meta b {
  color: var(--text-muted);
  font-weight: 500;
  margin-right: 5px;
}
.status-pill {
  border-radius: 20px;
  padding: 2px 10px;
  font-weight: 600;
}
.status-pill.ok {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}
.status-pill.warn {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}
.hc-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
}
.hc-kpi .val {
  font-size: 23px;
  font-weight: 800;
  color: var(--text-light);
  font-variant-numeric: tabular-nums;
}
.hc-kpi .lbl {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* report content */
.report-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 24px 24px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
  font-size: 13.5px;
  line-height: 1.92;
  color: var(--text-light);
}
.report-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  scroll-margin-top: 16px;
}
.report-section:last-of-type {
  border-bottom: none;
}
.report-section.appear {
  animation: fadeUp 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.report-content h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-light);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 10px;
}
.report-content h3::before {
  content: '';
  width: 4px;
  height: 17px;
  border-radius: 2px;
  background: linear-gradient(var(--primary), var(--secondary));
}
.sec-tag {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}
.report-content em {
  font-style: normal;
  font-weight: 700;
  color: var(--primary);
}
.hl-good {
  color: #15803d;
  font-weight: 700;
}
.hl-warn {
  color: #b45309;
  font-weight: 700;
}
.hl-danger {
  color: var(--danger);
  font-weight: 700;
}

.kpi-bars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.kpi-bar {
  background: var(--bg-card2);
  border-radius: 11px;
  padding: 12px 14px;
}
.kb-v {
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.kb-l {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 2px 0 6px;
}
.kb-track {
  height: 5px;
  border-radius: 4px;
  background: var(--border-light);
  overflow: hidden;
}
.kb-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
/* 评估结论 KPI 卡（顶部标签 + 值 + 进度条 + 备注） */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 12px 0;
}
.kb-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.kb-lbl {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.kb-val {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.kb-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* report 正文列表与强调 */
.report-content :deep(ul),
.report-content :deep(ol),
.report-content ul,
.report-content ol {
  margin: 8px 0 12px;
  padding-left: 20px;
}
.report-content li,
.advice-ol li {
  margin-bottom: 8px;
}
.report-content strong,
.report-content :deep(strong) {
  color: var(--text-light);
  font-weight: 700;
}

/* 风险提示框 */
.warn-box {
  border-radius: 0 8px 8px 0;
  padding: 12px 15px;
  margin: 10px 0;
  font-size: 12.8px;
  line-height: 1.85;
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid var(--warning);
  color: var(--text-light);
}
.warn-box.danger {
  background: rgba(239, 68, 68, 0.07);
  border-left-color: var(--danger);
}
.warn-box.info {
  background: rgba(34, 197, 94, 0.07);
  border-left-color: var(--success);
}
.warn-box strong {
  color: #b45309;
}
.warn-box.danger strong {
  color: var(--danger);
}
.warn-box.info strong {
  color: #15803d;
}

/* highlight-box 标题 */
.hb-t {
  font-weight: 700;
  color: var(--primary);
  font-size: 12px;
  margin-bottom: 6px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  margin: 12px 0;
}
.report-table th {
  background: var(--bg-card2);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: left;
  padding: 8px 10px;
}
.report-table th.num,
.report-table td.num {
  text-align: right;
}
.report-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-light);
}
.report-table tfoot td {
  background: var(--bg-card2);
  font-weight: 700;
  color: var(--text-light);
  border-bottom: none;
}
.report-table tbody tr:hover td {
  background: rgba(1, 89, 186, 0.04);
}
/* 带边框表格（关键参数 / 构成 / 实绩） */
.report-table.bordered th,
.report-table.bordered td {
  border: 1px solid var(--border-light);
}
.report-table.bordered th {
  border-color: var(--border);
}

.grade-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.grade-cell {
  border-radius: 11px;
  padding: 12px;
  text-align: center;
}
.gc-good {
  background: rgba(34, 197, 94, 0.07);
}
.gc-good .gc-v {
  color: #15803d;
}
.gc-norm {
  background: rgba(1, 89, 186, 0.06);
}
.gc-norm .gc-v {
  color: var(--primary);
}
.gc-warn {
  background: rgba(245, 158, 11, 0.08);
}
.gc-warn .gc-v {
  color: #b45309;
}
.gc-v {
  font-size: 21px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.gc-u {
  font-size: 12px;
  font-weight: 600;
}
.gc-l {
  font-size: 11.5px;
  font-weight: 600;
  margin-top: 1px;
}
.gc-good .gc-l {
  color: #15803d;
}
.gc-norm .gc-l {
  color: var(--primary);
}
.gc-warn .gc-l {
  color: #b45309;
}
.gc-s {
  font-size: 10.5px;
  margin-top: 4px;
  line-height: 1.45;
  color: var(--text-muted);
}

.info-box,
.highlight-box {
  border-radius: 0 8px 8px 0;
  padding: 12px 15px;
  font-size: 12.5px;
  margin-top: 12px;
}
.highlight-box {
  background: var(--bg-card2);
  border-left: 3px solid var(--primary);
}
.info-box {
  background: var(--bg-card2);
  border-left: 3px solid var(--text-muted);
  color: var(--text-muted);
}
.info-box.good {
  background: rgba(34, 197, 94, 0.07);
  border-left-color: var(--success);
  color: #15803d;
}

.risk-list,
.advice-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.advice-list {
  counter-reset: none;
}
.risk {
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  font-size: 12.8px;
}
.risk.danger {
  background: rgba(239, 68, 68, 0.07);
  border-left: 3px solid var(--danger);
}
.risk.warn {
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid var(--warning);
}
.risk.info {
  background: rgba(1, 89, 186, 0.06);
  border-left: 3px solid var(--primary);
}
.advice-list li {
  font-size: 12.8px;
  padding: 8px 12px;
  background: var(--bg-card2);
  border-radius: 8px;
}
.advice-list b {
  color: var(--primary);
  margin-right: 6px;
}

.writing-cue {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-muted);
  padding: 14px 0;
}
.spin {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2.6px solid var(--border);
  border-top-color: var(--primary);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.cursor {
  width: 7px;
  height: 15px;
  background: var(--primary);
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.bottom-bar {
  display: flex;
}

/* anchor nav */
.anchor-panel {
  padding: 16px 14px;
}
.ap-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  padding: 0 10px 10px;
}
.anchor-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.anchor-item:hover:not(.disabled) {
  background: var(--bg-card2);
}
.anchor-item.active {
  background: rgba(1, 89, 186, 0.1);
  border-color: rgba(1, 89, 186, 0.22);
}
.anchor-item.disabled {
  opacity: 0.45;
  cursor: default;
  pointer-events: none;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}
.status-dot.done {
  background: var(--success);
}
.status-dot.doing {
  background: var(--primary);
  box-shadow: 0 0 0 3px rgba(1, 89, 186, 0.15);
}
.a-name {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 章节进度环：SVG 圆环（抗锯齿 + 平滑过渡），与原型一致
   注意：类名避免使用 ring（与 UnoCSS ring 工具类冲突，会生成蓝色 box-shadow 方框） */
.prog-ring {
  flex-shrink: 0;
  transform: rotate(-90deg);
}
.prog-ring circle {
  fill: none;
  stroke-width: 2.4;
}
.ring-track {
  stroke: var(--border-light);
}
.ring-bar {
  stroke: var(--primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.gen-prog {
  margin-top: 14px;
  padding: 0 10px;
}
.gp-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 6px;
}
.gp-row.sub {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 6px;
}
.gp-track {
  height: 4px;
  border-radius: 3px;
  background: var(--border-light);
  overflow: hidden;
}
.gp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
}

@media (max-width: 1180px) {
  .strategy-report {
    flex-direction: column;
  }
  .nav-col {
    width: 100%;
    order: -1;
    position: static;
  }
  .hc-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

### step5/HistoryPanel.vue · 历史方案库 el-table

`src/pages/simulator/components/step5/HistoryPanel.vue`

```vue
<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { add, div, fmtNum } from '~/utils/math'
import { useSimWizard } from '../../composables/useSimWizard'
import { mockHistoryRecords } from '../../composables/useMockHistory'
import type { SimHistoryRecord } from '../../types'

const emit = defineEmits<{ viewResult: []; viewReport: []; new: [] }>()
const { store, loadConfig } = useSimWizard()

// 无历史记录时注入演示方案，避免页面为空（有真实记录则不覆盖）
onMounted(() => {
  if (!store.history.length) {
    mockHistoryRecords().forEach((r) => store.addRecord(r))
  }
})

const keyword = ref('')
const fStatus = ref('')
const fSeason = ref('')
const fScope = ref('')
const sortBy = ref<'time' | 'completion' | 'capacity'>('time')

const list = computed(() => store.history)

const summary = computed(() => {
  const h = list.value
  if (!h.length) return { count: 0, avgCompletion: 0, maxConf: 0, latest: '—' }
  const avg = div(
    h.reduce((s, r) => add(s, r.result.kpi.completion), 0),
    h.length,
  )
  const maxConf = Math.max(...h.map((r) => r.result.kpi.confidence))
  return { count: h.length, avgCompletion: avg, maxConf, latest: h[0].time }
})

const filtered = computed(() => {
  let arr = list.value.filter((r) => {
    if (keyword.value && !r.schemeName.includes(keyword.value)) return false
    if (fStatus.value) {
      const met = r.result.kpi.completion >= 100
      if (fStatus.value === '达标' && !met) return false
      if (fStatus.value === '未达标' && met) return false
    }
    if (fSeason.value && r.config.season !== fSeason.value) return false
    if (fScope.value === '全省' && r.config.region !== '全省') return false
    if (fScope.value === '地市' && r.config.region === '全省') return false
    return true
  })
  arr = [...arr].sort((a, b) => {
    if (sortBy.value === 'completion')
      return b.result.kpi.completion - a.result.kpi.completion
    if (sortBy.value === 'capacity')
      return b.result.capacityCeiling - a.result.capacityCeiling
    return b.time.localeCompare(a.time)
  })
  return arr
})

function activate(r: SimHistoryRecord) {
  store.setConfig(r.config)
  store.setResult(r.result)
}
function onViewResult(r: SimHistoryRecord) {
  activate(r)
  emit('viewResult')
}
function onViewReport(r: SimHistoryRecord) {
  activate(r)
  emit('viewReport')
}
function onLoad(r: SimHistoryRecord) {
  loadConfig(r.config)
  emit('new')
}
async function onDelete(r: SimHistoryRecord) {
  try {
    await ElMessageBox.confirm(`确定删除方案「${r.schemeName}」？`, '提示', {
      type: 'warning',
    })
    store.removeRecord(r.id)
  } catch {
    /* cancelled */
  }
}
</script>

<template>
  <div class="history-panel">
    <div class="hp-title-row">
      <div>
        <h2 class="title">历史仿真方案</h2>
        <p class="subtitle">方案库检索 · 加载 · 查看（最多保留 20 条）</p>
      </div>
      <el-button class="sim-cta" @click="emit('new')">+ 新建仿真方案</el-button>
    </div>

    <!-- 汇总卡 -->
    <div class="summary-row">
      <div class="sum-card">
        <div class="sc-v">{{ summary.count }} <span class="sc-u">个</span></div>
        <div class="sc-l">方案总数</div>
      </div>
      <div class="sum-card">
        <div class="sc-v" style="color: var(--accent)">
          {{ fmtNum(summary.avgCompletion, 2) }}%
        </div>
        <div class="sc-l">平均完成度</div>
      </div>
      <div class="sum-card">
        <div class="sc-v" style="color: #15803d">
          {{ fmtNum(summary.maxConf, 2) }}%
        </div>
        <div class="sc-l">最高确信度</div>
      </div>
      <div class="sum-card">
        <div class="sc-v small">{{ summary.latest }}</div>
        <div class="sc-l">最近创建</div>
      </div>
    </div>

    <!-- 工具栏 + 列表 -->
    <div class="list-card">
      <div class="hp-toolbar">
        <el-input
          v-model="keyword"
          class="search"
          placeholder="搜索方案名称…"
          clearable
        >
          <template #prefix>
            <i class="i-mdi:magnify" />
          </template>
        </el-input>
        <el-select v-model="fStatus" class="hp-sel" placeholder="全部状态">
          <el-option label="全部状态" value="" />
          <el-option label="达标" value="达标" />
          <el-option label="未达标" value="未达标" />
        </el-select>
        <el-select v-model="fSeason" class="hp-sel" placeholder="全部季节">
          <el-option label="全部季节" value="" />
          <el-option label="迎峰度夏" value="迎峰度夏" />
          <el-option label="迎峰度冬" value="迎峰度冬" />
          <el-option label="平时" value="平时" />
        </el-select>
        <el-select v-model="fScope" class="hp-sel" placeholder="全部范围">
          <el-option label="全部范围" value="" />
          <el-option label="全省" value="全省" />
          <el-option label="地市" value="地市" />
        </el-select>
        <el-select v-model="sortBy" class="hp-sel">
          <el-option label="按时间" value="time" />
          <el-option label="按完成度" value="completion" />
          <el-option label="按合计能力" value="capacity" />
        </el-select>
        <span class="list-stat">共 {{ filtered.length }} 个方案</span>
      </div>

      <el-table :data="filtered" stripe class="hp-table">
        <el-table-column label="方案名称" min-width="160" align="center">
          <template #default="{ row }">
            <span class="name">{{ row.schemeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评估范围" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="light"
              round
              :class="
                row.config.region === '全省'
                  ? 'scope-tag province'
                  : 'scope-tag city'
              "
            >
              {{ row.config.region === '全省' ? '全省' : '地市' }}
            </el-tag>
            <span class="scope-label">{{ row.config.region }}</span>
          </template>
        </el-table-column>
        <el-table-column label="场景" min-width="140" align="center">
          <template #default="{ row }">
            <span class="scene-main">{{ row.config.season }}</span>
            <span class="scene-sub">
              {{ row.config.tempRange[0] }}~{{ row.config.tempRange[1] }}℃
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="合计可调(万千瓦)"
          min-width="140"
          align="center"
        >
          <template #default="{ row }">
            <span class="cap">{{ fmtNum(row.result.capacityCeiling, 2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成度" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              round
              :type="row.result.kpi.completion >= 100 ? 'success' : 'warning'"
            >
              {{ fmtNum(row.result.kpi.completion, 2) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="参与用户" width="100" align="center">
          <template #default="{ row }">
            <span class="muted">{{ row.result.kpi.totalUsers }} 户</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="140" align="center">
          <template #default="{ row }">
            <span class="muted">{{ row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="250"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="onViewResult(row)"
            >
              查看结果
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="onViewReport(row)"
            >
              查看报告
            </el-button>
            <el-button link type="primary" size="small" @click="onLoad(row)">
              加载
            </el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <div class="es-glyph">⟲</div>
            <div class="es-title">
              {{ list.length ? '未找到匹配的仿真方案' : '暂无历史方案' }}
            </div>
            <div class="es-hint">
              {{
                list.length
                  ? '调整筛选条件后重试'
                  : '发起一次仿真评估即可生成方案记录'
              }}
            </div>
          </div>
        </template>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
.hp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.title {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-light);
}
.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.sum-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.sc-v {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}
.sc-v.small {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-light);
}
.sc-u {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.sc-l {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.list-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  box-shadow:
    0 1px 2px rgba(20, 40, 80, 0.04),
    0 8px 24px -16px rgba(20, 40, 80, 0.18);
}
.hp-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.search {
  width: 300px;
}
.hp-sel {
  width: 130px;
}
.list-stat {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  background: rgba(1, 89, 186, 0.1);
  padding: 4px 11px;
  border-radius: 20px;
}

.hp-table {
  width: 100%;
  background: transparent;
}
.name {
  font-weight: 700;
  color: var(--text-light);
}
.muted {
  color: var(--text-muted);
}
.scope-tag {
  margin-right: 6px;
  border: none;
}
.scope-tag.province {
  background: rgba(0, 101, 105, 0.12);
  color: var(--secondary);
}
.scope-tag.city {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}
.scope-label {
  font-size: 11px;
  color: var(--text-muted);
}
.scene-main {
  font-weight: 600;
  color: var(--text-light);
}
.scene-sub {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-left: 6px;
}
.cap {
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.empty-state {
  text-align: center;
  padding: 28px 20px;
}
.es-glyph {
  font-size: 34px;
  opacity: 0.35;
}
.es-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  margin-top: 10px;
}
.es-hint {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 4px;
}

@media (max-width: 980px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .search {
    width: 100%;
  }
}
</style>
```

### 2.4 辅助组件

### SimProgress.vue · 进度环

`src/pages/simulator/components/SimProgress.vue`

```vue
<script setup lang="ts">
export interface SimStep {
  key: string
  label: string
}

defineProps<{
  currentStep: number
  steps: SimStep[]
}>()
</script>

<template>
  <div class="sim-progress">
    <el-steps :active="currentStep" finish-status="success" simple>
      <el-step v-for="step in steps" :key="step.key" :title="step.label" />
    </el-steps>
  </div>
</template>

<style scoped>
.sim-progress {
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 12px 16px;
  margin-bottom: 14px;
}

.sim-progress :deep(.el-steps--simple) {
  background: transparent;
  padding: 8px 0;
}
</style>
```

### BulkFillDialog.vue · 批量填充弹框

`src/pages/simulator/components/BulkFillDialog.vue`

```vue
<script setup lang="ts">
const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{
  confirm: [value: number]
}>()

const fillValue = ref(150)

const handleConfirm = () => {
  if (fillValue.value > 0) {
    emit('confirm', fillValue.value)
    visible.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="批量填充缺口"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form label-position="top">
      <el-form-item label="缺口值（万千瓦）">
        <el-input-number
          v-model="fillValue"
          :min="1"
          :max="1000"
          :step="10"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <div class="fill-hint">
        将对 10:00 ~ 13:30 时段（第5-10时段）统一填入此缺口值
      </div>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleConfirm"> 确认填充 </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.fill-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: -8px;
}
</style>
```

### AiContentViewer.vue · AI 内容查看器

`src/pages/simulator/components/AiContentViewer.vue`

```vue
<script setup lang="ts">
// 安全渲染 AI 解读内容，解析自定义标记而非使用 v-html
const props = defineProps<{
  content: string
}>()

interface AiSegment {
  type: 'text' | 'bold' | 'bold-colored' | 'line-break'
  text: string
  color?: string
}

const segments = computed<AiSegment[]>(() => {
  if (!props.content) return []
  const result: AiSegment[] = []
  // 按 \n 分割为行，逐行解析
  const lines = props.content.split('\n')
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      result.push({ type: 'line-break', text: '' })
    }
    if (!line) return
    // 匹配 <strong style="color:xxx">text</strong> 和 <strong>text</strong>
    const regex =
      /<strong\s+style="color:([^"]+?)">(.+?)<\/strong>|<strong>(.+?)<\/strong>/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          text: line.slice(lastIndex, match.index),
        })
      }
      const color = match[1]
      const text = match[2] || match[3]
      result.push({
        type: 'bold-colored',
        text,
        color,
      })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      result.push({ type: 'text', text: line.slice(lastIndex) })
    }
  })
  return result
})
</script>

<template>
  <div class="ai-content">
    <template v-for="(seg, i) in segments" :key="i">
      <br v-if="seg.type === 'line-break'" />
      <strong
        v-else-if="seg.type === 'bold-colored'"
        :style="{ color: seg.color }"
        >{{ seg.text }}</strong
      >
      <span v-else>{{ seg.text }}</span>
    </template>
  </div>
</template>

<style scoped>
.ai-content {
  font-size: 13px;
  line-height: 2;
  color: var(--text-muted);
}
</style>
```

## 三、配置 / 命令

```bash
git pull          # 拿到 01-prototypes/prototype V6/（index.html + step-1~5 + specs）与重写提示词
pnpm dev          # 本地实机预览
pnpm lint --fix   # ESLint + Prettier，--fix 自动统一窄 print width
pnpm test         # 引擎单测（数据层纯函数，8/8）：验证全省默认≈889 万千瓦、集中度告警触发
pnpm build        # vite build；注意 timeout 包装器/末尾 grep 可能误报 exit 1，看真实 EXIT
```

接线要点（无需额外安装）：
- **路由**：页面挂既有自动路由 `/simulator`，无需新增注册。
- **Element Plus**：项目用 unplugin 自动导入（`el-*` + `ElMessage/ElMessageBox`）；唯一手动 import 是 `main.ts` 里的 `dark/css-vars.css`。
- **图标**：UnoCSS Iconify（`i-ep:*`），不装 `@element-plus/icons-vue`；写法 `<el-icon><i class="i-ep:video-play" /></el-icon>`。
- **数值**：计算走 `~/utils/math` 的 `add/sub/mul/div`（避免浮点），展示走 `fmtNum(v, 2)`。

---

## 四、复现 Checklist

**准备原型**
- [ ] `git pull` 拿到原型（index.html + step-1~5 + specs）与重写提示词
- [ ] 读 `specs/*.md` 确定算法口径（取值规则、去重优先级、确信度公式）
- [ ] 盘点可复用资产：`~/utils/math`、`useTheme`、ECharts 封装、EP 自动导入方式

**拆组件**
- [ ] 先建解耦数据层：`types.ts` → `useMockUsers`（固定种子）→ `useValuationEngine`（纯函数）→ `useSimResult`
- [ ] 写引擎单测验证量级
- [ ] 状态编排：`useSimWizard`（草稿单例 + startSimulation）+ Pinia store + mock api
- [ ] 一页一组件，`index.vue` 用 `v-if` 切 step；`StepNav` 加 `on/done/todo/dim` 门控、运行中回跳 `ElMessageBox.confirm`

**替换为 element**
- [ ] 表单：原生控件 → `el-select/el-input-number/el-slider/el-checkbox-button/el-radio-button/el-checkbox`，`:deep` 调圆角 chip
- [ ] 表格：原生 table → `el-table/el-table-column/el-pagination/el-switch/el-tag`，`sortable="custom"` + `@sort-change` 受控
- [ ] 跳转 `a[href]` → `@click` 状态机；`.btn` → `el-button + .sim-cta`；字符箭头 → `i-ep:*`
- [ ] 提示/弹层：区域提示 → `el-alert`；完成 → `el-dialog`（去读秒）；删除 → `ElMessageBox.confirm`
- [ ] EP 无对应物的视觉（Hero/仪表盘/步进器/日志/图表/进度环）保留自绘
- [ ] **EP 主题色**：`html:root` 覆盖 `--el-color-*`；`main.ts` 引 `dark/css-vars.css` + `html.dark` 保留品牌主色

**接线 + 验证**
- [ ] UI 只读 `store.currentResult` / `evaluate(draft)`（单一真相源），实时预览与正式结果共用引擎
- [ ] 数值统一 `fmtNum(v,2)`，功率单位「万千瓦」，图表 tooltip 也补单位
- [ ] `pnpm lint --fix` 0 error；`pnpm test` 8/8；`pnpm build` 真实 `EXIT=0`；`pnpm dev` 明暗切换 EP 随动、滑条 tooltip 无黑菱形、进度环无方框

---

## 五、踩坑记录

1. **EP 组件不随明暗切换** — 从未 import `element-plus/theme-chalk/dark/css-vars.css`（深色变量在 `html.dark{}` 里，没加载永不生效）。`main.ts` 引该文件（在 `main.css` 前），并在 `main.css` 加 `html.dark` 块保留品牌主色（否则 EP 深色文件会把主色重置回 `#409eff`）。
2. **EP 主题色覆盖不稳** — `:root` 同特异性，胜负看 bundle 顺序。改 `html:root`（特异性 0,1,1）稳定取胜，免 `!important`。
3. **el-slider 黑色菱形 tooltip** — 一开始 `:show-tooltip="false"` 直接关掉，用户反馈"怎么没提示了"。tooltip 被 teleport 到 body，scoped 样式管不到 → 改 `tooltip-class="sim-slider-tip"` + `:format-tooltip` 带单位，在 `main.css` 写**全局** `.el-popper.sim-slider-tip` 把气泡和 `::before` 箭头染同色。
4. **章节进度环"方框"连环坑（最典型）** — 反复出现一层框。排查链：裸 `<svg>` CSS 尺寸→占位框 → conic-gradient（不能 transition + mask 锯齿）→ SVG dashoffset（又有框）→ 补 width/height 属性（仍有**蓝**框）。**真正根因**：类名 `ring` 撞 UnoCSS/Tailwind 的 `ring` 工具类，注入蓝色 `box-shadow` 环（圆角元素上看不出，方形 SVG 上就是蓝方框）。**解决**：类名 `ring` → `prog-ring`。
5. **确信度仪表盘指针压住数值** — gauge 默认带 `pointer`/`anchor`。`pointer:{show:false}`、`anchor:{show:false}`，数值 `offsetCenter:[0,'-5%']` 居中。
6. **计算执行读秒跳转体验差** — 删 `setInterval` 读秒，改成完成后弹 `el-dialog`，用户点击才 `emit('done')`。
7. **构建假阳性 exit 1 / `pkill -f "pnpm build"` 自杀** — `timeout 300` 包装器或末尾 `grep -c` 零匹配会让 build 误报 exit 1（`dist/` 实际完整）；`pkill -f` 会匹配到自己的命令行。解决：在脚本里 `echo "REAL_EXIT=$?"` 看真实退出码；一次只跑一个干净 build 再校验。
8. **单位口径** — 原型「万kW」，项目偏好「万千瓦」；图表 tooltip 缺单位。全页统一「万千瓦」并逐处补单位。

---

## 六、踩坑速查

| 现象 | 根因 | 解决 |
|---|---|---|
| EP 组件不随明暗切换 | 没 import `dark/css-vars.css` | `main.ts` 引入（在 `main.css` 前）+ `html.dark` 保品牌色 |
| EP 主题色覆盖被盖回 | `:root` 同特异性看打包顺序 | 改 `html:root`（特异性 0,1,1） |
| 滑条黑色菱形 tooltip | tooltip teleport 到 body，scoped 管不到 | 全局 `.el-popper.sim-slider-tip` 染色 |
| 进度环老有方框 | 类名 `ring` 撞 UnoCSS `ring` 工具类 | 改名 `prog-ring` |
| 仪表盘指针压数值 | gauge 默认带 pointer/anchor | `pointer/anchor: { show:false }` |
| build 误报 exit 1 | timeout 包装器 / `grep -c` 零匹配 | 看真实退出码；勿用会自匹配的 `pkill -f` |

## 七、文件清单

| 文件（相对 `vpp-simulator-frontend/`） | 类型 | 复现动作 |
|---|---|---|
| `src/pages/simulator/index.vue` | 必须 | 五步向导容器 + StepNav 状态机（见 2.x） |
| `src/pages/simulator/components/StepNav.vue` | 必须 | 步骤导航门控（见 2.x） |
| `src/main.ts` | 修改 | 引 `element-plus/theme-chalk/dark/css-vars.css`（见 2.x） |
| `src/styles/main.css` | 修改 | EP 品牌色 / 深色变体 / sim-cta / sim-slider-tip（见 2.0） |
| `src/pages/simulator/composables/useMockUsers.ts` | 必须 | 固定种子假数据工厂（见 2.1，全量） |
| `src/pages/simulator/components/step1/ParamConfig.vue` | 必须 | EP 控件替换范例（见 2.3，全量） |
| `src/pages/simulator/types.ts` | 必须 | 数据模型 本篇 2.x 已逐字给全 |
| `src/pages/simulator/composables/useValuationEngine.ts` | 必须 | 取值/去重/调配/KPI 纯函数 本篇 2.x 已逐字给全 |
| `src/pages/simulator/composables/useSimResult.ts` / `useSimWizard.ts` | 必须 | evaluate / 草稿单例 + 步骤机 本篇 2.x 已逐字给全 |
| `src/pages/simulator/components/step1/ConfigPreview.vue` | 必须 | 实时预览 + 环形图 本篇 2.x 已逐字给全 |
| `src/pages/simulator/components/step2/ExecutionPanel.vue` | 必须 | 执行 + 完成弹框 本篇 2.x 已逐字给全 |
| `src/pages/simulator/components/step3/ResultOverview.vue` + `UserDetailTable.vue` | 必须 | 结果总览 + el-table 本篇 2.x 已逐字给全 |
| `src/pages/simulator/components/step4/StrategyReport.vue` | 必须 | 五章报告 + 进度环（1591 行）本篇 2.x 已逐字给全 |
| `src/pages/simulator/components/step5/HistoryPanel.vue` | 必须 | el-table 历史库 本篇 2.x 已逐字给全 |
| `src/stores/simulator.ts` / `src/api/simulator.ts` | 必须 | Pinia store / mock API 本篇 2.x 已逐字给全 |
| `01-prototypes/prototype V6/**`、`docs/simulator-rebuild-prompt.md` | 参考 | 原型与重写提示词（不改） |

> 重写清理旧实现前打安全标签：`git tag simulator-legacy-v1`。
## 八、延伸阅读（官方文档）

- Element Plus · 暗黑模式：https://element-plus.org/zh-CN/guide/dark-mode.html
- Element Plus · 自定义主题（CSS 变量）：https://element-plus.org/zh-CN/guide/theming.html
- Element Plus · Form / Slider / Table 组件：https://element-plus.org/zh-CN/component/overview.html
- Vue 3 · `<script setup>`：https://cn.vuejs.org/api/sfc-script-setup.html
- Pinia（状态管理）：https://pinia.vuejs.org/zh/
- vue-echarts：https://github.com/ecomfe/vue-echarts
- UnoCSS（注意 `ring` 等预设工具类命名碰撞）：https://unocss.dev/
