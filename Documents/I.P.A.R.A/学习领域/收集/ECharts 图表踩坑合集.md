---
createTime: 2026-06-26 13:06
笔记ID: 20260626130621
multiFile:
multiMedia:
description: vpp-simulator-frontend 前端 ECharts 图表常见问题与可复用配置：热力图纵轴缩放/全标签/左侧空白、横向柱状图去掉点击下钻、省地图按指标填色、自绘韦恩图命中检测错位，附完整 option 代码。
笔记类型: 收集笔记
阐述日期:
tags:
  - ECharts
  - 数据可视化
  - Vue3
  - 热力图
  - 前端
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/前端开发.canvas|前端开发]]"
---

## ECharts 图表踩坑合集

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 用于复现到其他 Vue3 + ECharts 项目。素材来自 `vpp-simulator-frontend`（Vue 3 + Vite + `vue-echarts`），整理自 2026-06-22 两个会话。
> 关联：[[2026-06-22]]（当日 AI 笔记）。

---

> [!tip] 一分钟复现
> 热力图 → 复制 `CityErrorCompareCard.vue` 的 `chartOption`（`yAxis.interval:0` + 纵向 `dataZoom` + `grid.left` 按名长调宽）；去柱状图下钻 → 删调用处 `clickable`/`@select`（不是删组件文案）；省地图 → `registerMap` + `type:'map'` + 动态 `visualMap`；自绘 graphic 命中错位 → 渲染原点用显式 `x/y` 对齐画布中心。

## 一、原理

**本项目 ECharts 用法**：`echarts/core` 按需 `use([...])` 注册组件，模板用 `vue-echarts` 的 `<v-chart :option="option" autoresize />`；`option` 写成 `computed`，内部读 `isDark`（来自 `useTheme()`）做明暗双色。下面每个问题都给出**项目实际文件里逐字的 option 片段**，可直接对照搬用。

这批问题的共性：

- **category 轴默认抽稀标签**：地市/区县多了，`yAxis` 标签会被自动省略 → 要 `interval: 0` 强制全展示 + `dataZoom` 纵向滚动。
- **图表交互（点击下钻）不是写死在组件里**：由调用处 `clickable` prop + `@select` 控制，删交互要删调用处。
- **map / 自绘 graphic 的命中检测**有自己的坐标原点，渲染原点和命中原点不一致就会"看得见点不到"。

---

## 二、热力图：纵轴缩放滑条 + 强制全标签 + 收窄左侧空白

- **现象**：地市/区县多时，热力图被纵向压扁、纵轴标签互相挤压被省略；省级各地市图最初没有纵向缩放能力，与区县图交互不一致；左侧留白过大或长名称被截断。
- **原因**：category 型 `yAxis` 默认 `interval:'auto'` 会抽稀标签；没有 y 轴 `dataZoom` 时无法纵向滚动；`grid.left` 与 `axisLabel.width` 给大了→左空白，给小了→长名（如"景宁畲族自治县"7 字）被 `overflow:'truncate'` 截断。
- **解决**：加一组 y 轴 `dataZoom`（`slider` + `inside`）；纵轴标签 `interval:0` 强制每行显示 + `width` + `overflow:'truncate'` + `ellipsis:'...'`；x 轴默认 `start:50` 看后半段时间；纵轴滑条 `start:0 / end:100`（拉满展示全部）；`grid.left` 按名称长短取值（地市短→60、标签 width 52；区县长→90、标签 width 78）。

省级各地市版（`src/pages/forecast/components/CityErrorCompareCard.vue` 的 `chartOption`）：

```ts
const chartOption = computed(() => {
  const [minVal, maxVal] = globalExtent.value

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark.value ? '#1a1d27' : '#ffffff',
      textStyle: {
        color: isDark.value ? '#e8eaf0' : '#1a1d23',
      },
      formatter: (params: any) => {
        const [timeIdx, cityIdx] = params.data
        const cityName = cityNames.value[cityIdx] || ''
        const timeStr = hours.value[timeIdx] || ''
        const value = params.data[2]
        return `<div style="font-weight:600;font-size:12px;">${cityName}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">
            时间：<span style="color:#475569;">${timeStr}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">
            负荷：<span style="color:#0159ba;font-weight:700;">${fmtNum(value, 2)}</span> 万千瓦
          </div>`
      },
    },
    grid: {
      left: 60,
      right: 100,
      top: 20,
      bottom: 80,
    },
    dataZoom: [
      // 横轴缩放条（时间）
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 50,
        end: 100,
        height: 20,
        bottom: 8,
        showDetail: true,
      },
      { type: 'inside', xAxisIndex: 0 },
      // 纵轴缩放条（地市）
      {
        type: 'slider',
        yAxisIndex: 0,
        start: 0,
        end: 100,
        width: 16,
        right: 10,
        top: 20,
        showDetail: false,
      },
      { type: 'inside', yAxisIndex: 0 },
    ],
    xAxis: {
      type: 'category',
      data: hours.value,
      splitArea: { show: false },
      axisLabel: {
        fontSize: 9,
        color: isDark.value ? '#94a3b8' : '#64748b',
        interval: 'auto',
        hideOverlap: true,
        formatter: (value: string) => {
          const parts = value.split(' ')
          return parts.length > 1 ? parts[1].slice(0, 5) : value.slice(0, 5)
        },
      },
      axisLine: {
        lineStyle: { color: isDark.value ? '#2a4466' : '#cbd5e1' },
      },
      axisTick: {
        lineStyle: { color: isDark.value ? '#2a4466' : '#cbd5e1' },
      },
    },
    yAxis: {
      type: 'category',
      data: cityNames.value,
      inverse: true,
      axisLabel: {
        fontSize: 9,
        color: isDark.value ? '#94a3b8' : '#475569',
        interval: 0,
        width: 52,
        overflow: 'truncate',
        ellipsis: '...',
      },
      axisLine: {
        lineStyle: { color: isDark.value ? '#2a4466' : '#cbd5e1' },
      },
      axisTick: {
        lineStyle: { color: isDark.value ? '#2a4466' : '#cbd5e1' },
      },
      splitArea: { show: false },
    },
    visualMap: {
      type: 'continuous',
      min: minVal,
      max: maxVal,
      text: ['高 (万千瓦)', '低 (万千瓦)'],
      textStyle: {
        fontSize: 10,
        color: isDark.value ? '#94a3b8' : '#64748b',
      },
      realtime: false,
      calculable: true,
      right: 30,
      bottom: 12,
      itemWidth: 12,
      itemHeight: 100,
      seriesIndex: 0,
      inRange: {
        color: isDark.value
          ? ['#1c4e80', '#2d7ab8', '#f59e0b', '#f97316', '#ef4444']
          : ['#bfdbfe', '#86efac', '#fde047', '#fca5a5', '#ef4444'],
      },
    },
    series: [
      {
        name: '负荷热力图',
        type: 'heatmap',
        data: heatmapData.value,
        itemStyle: {
          borderColor: isDark.value ? '#1a1d27' : '#e2e8f0',
          borderWidth: 0.5,
          gapWidth: 0.5,
        },
        label: { show: false },
        emphasis: {
          itemStyle: {
            borderColor: '#f59e0b',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})
```

区县版（`src/pages/forecast/city/[name].vue` 的 `districtHeatmapOption`）**与省级版结构完全一致**，仅两处不同：`grid.left: 90`、`yAxis.axisLabel.width: 78`（区县名最长 7 字）。复现时直接复制上面这段，改这两个值即可。

---

## 三、横向柱状图：去掉"点击柱条下钻"交互

- **现象**：地市可调能力排行（横向柱状图）点击柱条会下钻跳转地市级页面，需求是去掉该交互、保留普通展示，并把标题旁"随勾选联动/点击下钻"的文字 tag 换成悬停才出说明的 `[?]` 图标。
- **原因（反复一次的根因）**：下钻**不是组件内部写死的**，而是调用处通过 `clickable` prop 开启 + `@select` 监听 router 跳转。第一轮误以为提示 tag 就是入口，只删了文案，柱子点击仍跳转——`clickable` 控制 `cursor:'pointer'`、`yAxis.triggerEvent` 和 `onChartClick` 是否 `emit('select')`。
- **解决**：调用处删 `clickable` 和 `@select="onCitySelect"`，并删除不再使用的 `onCitySelect`/`router`；组件本身保留 `clickable`（默认 false）能力不动。`[?]` 提示无需改组件——`ChartCard` 已内置 `tooltip → HelpIcon` 机制，传 `tooltip` 即可。

调用处（`src/pages/capacity/index.vue`，已去掉 `clickable`/`@select`，只传 `tooltip`）：

```vue
      <RegionRankChart
        title="地市可调能力排行"
        tooltip="各地市可调能力按勾选方案组合（去重口径）统计，降序排列，随上方方案勾选联动。"
        :items="rankItems"
        zoomable
        :loading="rankLoadingFirst"
      />
```

组件（`src/components/charts/RegionRankChart.vue`，`clickable` 由 props 控制，调用处不传即 false → 不下钻）：

```vue
<script setup lang="ts">
// V2 下级区域可调能力排行：横向柱状图（降序 + inverse），可选点击钻取
import { use } from 'echarts/core'
import { BarChart as BarChartSeries } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  GraphicComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { RankItem } from '../composables/useCapacityV2'
import { fmtNum } from '~/utils/math'

use([
  BarChartSeries,
  DataZoomComponent,
  GridComponent,
  GraphicComponent,
  TooltipComponent,
  CanvasRenderer,
])

const props = withDefaults(
  defineProps<{
    title: string
    /** 已按 value 降序排列 */
    items: RankItem[]
    tooltip?: string
    tag?: string
    /** 可点击钻取时传 true */
    clickable?: boolean
    /** 左侧纵向缩放条（条目较多时启用） */
    zoomable?: boolean
    /** 首屏接口加载中（尚无数据）时显示骨架屏 */
    loading?: boolean
  }>(),
  { tooltip: '', tag: '', clickable: false, zoomable: false, loading: false },
)

const emit = defineEmits<{
  select: [name: string]
}>()

const { isDark } = useTheme()

// 蓝色渐变：排名越高颜色越深
function barColor(index: number, total: number) {
  const t = total <= 1 ? 1 : 1 - index / (total - 1)
  const from = [188, 214, 240] // #bcd6f0
  const to = [1, 89, 186] // #0159ba
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

const option = computed(() => ({
  backgroundColor: 'transparent',
  // 占满卡片宽度：左右留白用固定像素，数值标签与缩放条共用右侧边距
  // bottom 预留一条带显示单位标签
  grid: {
    left: 8,
    right: props.zoomable ? 78 : 64,
    top: '3%',
    bottom: 22,
    containLabel: true,
  },
  // 单位标签：右下角常显，避免与柱标/右侧缩放条重叠
  graphic: [
    {
      type: 'text',
      right: props.zoomable ? 22 : 8,
      bottom: 2,
      style: {
        text: '单位：万千瓦',
        fontSize: 11,
        fill: isDark.value ? '#94a3b8' : '#64748b',
        textAlign: 'right',
      },
    },
  ],
  // 右侧纵向缩放条（仿负荷预测页实时负荷排行）
  dataZoom: props.zoomable
    ? [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: 60,
          width: 16,
          right: 2,
        },
        { type: 'inside', yAxisIndex: 0 },
      ]
    : [],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: isDark.value ? '#1a1d27' : '#ffffff',
    textStyle: { color: isDark.value ? '#e8eaf0' : '#1a1d23' },
    formatter: (params: any) => {
      const p = Array.isArray(params) ? params[0] : params
      return `<b>${p.name}</b><br/>可调能力: ${fmtNum(p.value, 2)} 万千瓦`
    },
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      color: isDark.value ? '#94a3b8' : '#64748b',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: { color: isDark.value ? '#2a4466' : '#e8ecf2' },
    },
  },
  yAxis: {
    type: 'category',
    data: props.items.map((d) => d.name),
    inverse: true,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: isDark.value ? '#94a3b8' : '#64748b',
      fontSize: 12,
    },
    triggerEvent: props.clickable,
  },
  series: [
    {
      type: 'bar',
      data: props.items.map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: d.color ?? barColor(i, props.items.length),
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barMaxWidth: 18,
      cursor: props.clickable ? 'pointer' : 'default',
      label: {
        show: true,
        position: 'right',
        formatter: (p: any) => fmtNum(p.value, 2),
        color: isDark.value ? '#94a3b8' : '#64748b',
        fontSize: 11,
        fontWeight: 500,
      },
    },
  ],
}))

function onChartClick(params: any) {
  if (!props.clickable) return
  const name = params.componentType === 'yAxis' ? params.value : params.name
  if (name) emit('select', String(name))
}
</script>

<template>
  <ChartCard :title="title" :tooltip="tooltip" :tag="tag" :loading="loading">
    <!-- 画布绝对定位：容器高度由布局决定，避免 autoresize 反馈循环导致高度爬升 -->
    <div class="chart-wrap min-h-[200px] flex-1">
      <v-chart
        class="chart-canvas"
        :option="option"
        autoresize
        @click="onChartClick"
      />
    </div>
  </ChartCard>
</template>
```

`ChartCard` 的 `tooltip → [?]` 机制（`src/components/common/ChartCard.vue`，`tag` 文字徽标与 `[?]` 帮助图标并存）：

```vue
        <div class="flex items-center gap-2">
          <h3 class="chart-title font-black">
            {{ title }}
            <span v-if="tag" class="chart-tag">{{ tag }}</span>
          </h3>
          <el-tooltip
            v-if="tooltip"
            placement="top"
            effect="light"
            :offset="12"
          >
            <template #content>
              <div class="text-[10px] font-bold leading-relaxed">
                {{ tooltip }}
              </div>
            </template>
            <HelpIcon size="md" />
          </el-tooltip>
        </div>
```

---

## 四、省地图按指标填色（`type: 'map'` + 动态 visualMap）

- **现象**：左侧导航地图模式要对接接口、按地市可调能力填色，下方卡片展示选中地市/全省概览。
- **原因**：原 `cityData` 是按时间步生成的 mock；色阶用跨时间步全局 min/max。对接后要优先用接口数据（按 `shortName` 匹配地市）、按当前快照动态算 min/max，失败回落 mock。
- **解决**：`cityData` computed 优先读单例数据，`hasApiData` 时 visualMap 用动态 `Math.floor(min)/Math.ceil(max)`，否则沿用全局色阶。

`src/components/charts/CapacityHeatmap.vue` 的 option（动态色阶 + 地图 series）：

```vue
// ─── ECharts option ───
const option = computed(() => {
  const data = cityData.value
  // 接口数据用当前快照动态色阶；回落 mock 时沿用跨时间步全局色阶
  let minVal: number
  let maxVal: number
  if (hasApiData.value && data.length) {
    const vals = data.map((c) => c.value)
    minVal = Math.floor(Math.min(...vals))
    maxVal = Math.ceil(Math.max(...vals))
  } else {
    ;[minVal, maxVal] = globalMinMax
  }

  return {
    backgroundColor: 'transparent',

    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const cityName = params.name
        const short = cityName.replace('市', '')
        const city = data.find((c: any) => c.name === cityName)
        const value = fmtNum(params.data?.value ?? 0, 2) ?? '—'
        const row = (label: string, val: string, color: string) =>
          `<div style="display:flex;justify-content:space-between;gap:16px;line-height:1.8">` +
          `<span style="color:${isDark.value ? '#94a3b8' : '#64748b'}">${label}</span>` +
          `<span style="font-weight:700;color:${color}">${val}</span></div>`
        return (
          `<div style="font-weight:800;font-size:13px;margin-bottom:4px">${short}市</div>` +
          row('可调能力', `${value} 万千瓦`, '#22c55e') +
          (city
            ? row(
                '监测用户',
                `${city.users.toLocaleString('zh-CN')} 户`,
                isDark.value ? '#e8eaf0' : '#1a1d23',
              )
            : '')
        )
      },
      backgroundColor: isDark.value
        ? 'rgba(21,34,53,0.95)'
        : 'rgba(255,255,255,0.96)',
      borderColor: isDark.value ? '#2a4466' : '#dde3ec',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: {
        color: isDark.value ? '#e8eaf0' : '#1a1d23',
        fontSize: 12,
      },
      extraCssText:
        'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:180px',
    },

    visualMap: {
      type: 'continuous',
      min: minVal,
      max: maxVal,
      text: ['高', '低'],
      textStyle: {
        fontSize: 9,
        color: isDark.value ? '#94a3b8' : '#64748b',
      },
      realtime: false,
      calculable: false,
      left: 8,
      bottom: 8,
      itemWidth: 10,
      itemHeight: 80,
      inRange: {
        // 可调能力从低到高：项目主题蓝 → 浅蓝 → 浅绿 → 绿
        color: isDark.value
          ? ['#0159ba', '#2d7ab8', '#4a90d9', '#84cc16', '#22c55e']
          : ['#bfdbfe', '#93c5fd', '#86efac', '#4ade80', '#22c55e'],
      },
      seriesIndex: [0],
    },

    series: [
      {
        name: '浙江省地图',
        type: 'map',
        map: 'zhejiang',
        showLegendSymbol: false,
        selectedMode: 'single',

        label: {
          show: true,
          color: isDark.value ? '#b0c4de' : '#1e293b',
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: any) => params.name.replace('市', ''),
        },

        itemStyle: {
          areaColor: isDark.value
            ? {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#1e3a5f' },
                  { offset: 1, color: '#162d4a' },
                ],
              }
            : '#e0f2fe',
          borderColor: isDark.value ? '#3b6ea5' : 'rgba(147, 235, 248, 1)',
          borderWidth: isDark.value ? 1.5 : 1,
          shadowColor: isDark.value
            ? 'rgba(65,145,220,0.2)'
            : 'rgba(128, 217, 248, 1)',
          shadowOffsetX: -1,
          shadowOffsetY: 1,
          shadowBlur: 6,
        },

        emphasis: {
          itemStyle: {
            areaColor: isDark.value ? 'rgba(65,145,220,0.35)' : '#fef08a',
            borderColor: isDark.value ? '#5ba0e0' : '#f59e0b',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: isDark.value ? '#7ec8f0' : '#92400e',
            fontSize: 11,
            fontWeight: 'bold',
          },
        },

        select: {
          itemStyle: {
            areaColor: isDark.value ? 'rgba(1,89,186,0.45)' : '#fef08a',
            borderColor: isDark.value ? '#5ba0e0' : '#f59e0b',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: isDark.value ? '#7ec8f0' : '#92400e',
            fontSize: 11,
            fontWeight: 'bold',
          },
        },

        layoutCenter: ['50%', '50%'],
        layoutSize: '92%',
        data: data.map((c) => ({
          name: c.name,
          value: c.value,
          selected: c.name === props.selectedCity,
        })),
      },
    ],
  }
})
```

> 注：`map: 'zhejiang'` 需事先 `echarts.registerMap('zhejiang', geoJson)` 注册地图数据，本项目已在别处注册。

---

## 五、自绘韦恩图：悬停命中检测错位（最隐蔽）

- **现象**：鼠标移到韦恩图三个圆/重叠区上，浮动说明框时有时无（尤其纵向偏移区域）。
- **原因**：ECharts `graphic` 组用 `left:'center'/top:'middle'` 按"组的包围盒"居中，但外侧三个场景文字标签不对称，使包围盒中心相对组本地原点 `(0,0)` 偏移；而命中检测 `getRegion` 以"画布中心 `chart.getWidth()/2`"为原点判断。两原点不一致 → 不可见命中圆相对可见圆纵向错位 → 鼠标在可见圆上却落在命中圆外。
- **解决**：把 graphic 组改用**显式 `x/y` 定位**到画布正中心，让渲染原点与命中检测原点严格一致。

`src/pages/capacity/components/OverlapPieChart.vue`：

```vue
  // 用显式 x/y 把组定位到画布中心，使「渲染原点」与 getRegion 命中检测原点
  // （chart.getWidth()/2, getHeight()/2）严格一致。
  // 不能用 left:'center'/top:'middle'：那是按组的包围盒居中，而外侧场景标签
  // （如顶部"需求响应"）令包围盒相对本地原点 (0,0) 偏移，导致命中圆与可见圆错位、
  // 鼠标移到图上却不弹框。
  const cx = (wrapW.value || 360) / 2
  const cy = (wrapH.value || 280) / 2

  return {
    backgroundColor: 'transparent',
    graphic: {
      elements: [
        {
          type: 'group',
          x: cx,
          y: cy,
          children,
        },
      ],
    },
  }
```

```vue
function getRegion(mx: number, my: number): string {
  const chart = chartRef.value?.chart
  if (!chart) return ''

  const gcx = chart.getWidth() / 2
  const gcy = chart.getHeight() / 2
  const g = vennGeom.value

  const inYf =
    (mx - (gcx + g.centers.yf.x)) ** 2 + (my - (gcy + g.centers.yf.y)) ** 2 <=
    g.r.yf * g.r.yf
  const inDr =
    (mx - (gcx + g.centers.dr.x)) ** 2 + (my - (gcy + g.centers.dr.y)) ** 2 <=
    g.r.dr * g.r.dr
  const inMr =
    (mx - (gcx + g.centers.mr.x)) ** 2 + (my - (gcy + g.centers.mr.y)) ** 2 <=
    g.r.mr * g.r.mr

  if (inYf && inDr && inMr) return 'allThree'
  if (inYf && inDr) return 'yfDr'
  if (inYf && inMr) return 'yfMr'
  if (inDr && inMr) return 'drMr'
  if (inYf) return 'onlyYf'
  if (inDr) return 'onlyDr'
  if (inMr) return 'onlyMr'
  return ''
}
```

---

## 六、复现 Checklist

- [ ] **热力图**：category `yAxis` 加 `interval:0` + `dataZoom`（slider+inside），`axisLabel.width`/`overflow:'truncate'`，`grid.left` 按名称长短取值
- [ ] **横向柱状图**：交互开关由调用处 `clickable`/`@select` 控制；去交互要删调用处，不是删组件文案
- [ ] **`[?]` 提示**：复用 `ChartCard` 的 `tooltip → el-tooltip + HelpIcon`，调用处传 `tooltip` 不传 `tag`
- [ ] **省地图**：`registerMap` 后用 `type:'map'`，`visualMap` 动态算 min/max，`tooltip.formatter` 自定义
- [ ] **自绘 graphic**：渲染原点用显式 `x/y`，与命中检测的画布中心原点对齐，否则"看得见点不到"
- [ ] **明暗双色**：option 内统一读 `isDark`，色值成对给

## 七、踩坑速查

| 现象 | 根因 | 解决 |
|---|---|---|
| 纵轴地市/区县被省略 | category 轴默认抽稀 | `interval:0` + 纵向 `dataZoom` |
| 长名被截成"…" | `axisLabel.width` 太小 | width 按最长名调（区县 78） |
| 删了提示柱子还能点跳转 | 下钻在调用处 `clickable`/`@select` | 删调用处 prop/监听，不是删组件 |
| 韦恩图悬停时灵时不灵 | 渲染原点 ≠ 命中检测原点 | graphic 用显式 `x/y` 对齐画布中心 |
| `autoresize` 高度无限爬升 | 容器高度依赖画布、画布又 resize 容器 | 画布 `min-h` + 容器定高，断开反馈环 |

## 八、文件清单

| 文件 | 说明 |
|---|---|
| `src/pages/forecast/components/CityErrorCompareCard.vue` | 省级各地市负荷热力图 option |
| `src/pages/forecast/city/[name].vue` | 区县热力图（仅 grid.left/标签 width 不同） |
| `src/components/charts/RegionRankChart.vue` | 横向柱状图（clickable 由 props 控制） |
| `src/components/common/ChartCard.vue` | 图表容器：`tag` 徽标 + `tooltip → [?]` 帮助图标 |
| `src/components/charts/CapacityHeatmap.vue` | 省地图 `type:'map'` + 动态 visualMap |
| `src/pages/capacity/components/OverlapPieChart.vue` | 自绘韦恩图 + graphic 命中检测 |

## 九、延伸阅读（官方文档）

- ECharts 配置项手册：https://echarts.apache.org/zh/option.html
- dataZoom（区域缩放）：https://echarts.apache.org/zh/option.html#dataZoom
- visualMap（视觉映射）：https://echarts.apache.org/zh/option.html#visualMap
- heatmap 系列：https://echarts.apache.org/zh/option.html#series-heatmap
- map 系列 + registerMap：https://echarts.apache.org/zh/option.html#series-map
- graphic（原生图形元素，含自绘命中检测）：https://echarts.apache.org/zh/option.html#graphic
- vue-echarts：https://github.com/ecomfe/vue-echarts
