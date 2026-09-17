---
createTime: 2026-09-17 18:48
笔记ID: 20260917184810
multiFile:
multiMedia:
description: After Effects 逐字符延迟拖尾动画原创脚本 CharDelay Animator v1.0：文本动画器 + 表达式选择器按 textIndex 采样 time−idx·delay 历史变换，实现正序/倒序/随机级联、位置/缩放/旋转拖尾、透明级联，附完整源码与踩坑。
笔记类型: 收集笔记
阐述日期:
tags:
  - AE脚本
  - AfterEffects
  - 表达式
  - 文本动画器
aliases:
  - CharDelay Animator
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/AfterEffects.canvas|AfterEffects]]"
---

## AE 字符延迟拖尾动画脚本

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="0" max="100"></progress>

> **定位**：After Effects 逐字符延迟拖尾动画的原创脚本（文本动画器 + 表达式选择器 + 控件效果），ScriptUI 可停靠面板。**来源**：本机 AI 会话（2026-09-17）——起点为分析商业脚本 Nisai Delay Animator（试用版 jsxbin）的实现思路，因涉及破解商业授权而放弃，改为按 AE 公开机制 clean-room 原创实现同等功能，未引用其任何代码。**用于复现**：任何 AE 工程（CC2019+，表达式引擎 = JavaScript）。**声明**：全文无敏感信息。

## 一、原理

**要解决的问题**：文字逐个字符延迟入场/出场 + 拖尾跟随（位置、缩放、旋转、透明度），全部用表达式驱动、可实时调参，不逐字符拆层、不打关键帧。

**核心机制**：给文字图层挂 4 个「文本动画器」（位置/缩放/旋转/不透明度），每个动画器加一个**表达式选择器**（ADBE Text Expressible Selector）。表达式选择器的 `Amount` 按**每个字符**求值（表达式里可用 `textIndex` / `textTotal`），输出的数值就是该字符的动画偏移量；再配合 `valueAtTime(time - idx * delay)` 采样图层自身「过去的变换」，即得逐字延迟跟随。

```text
图层效果控件（CharDelay Delay / Order / Seed / …）
        │（表达式按名字 effect("CharDelay …") 引用）
        ▼
文本动画器 ×4 ── 表达式选择器 Amount ── 逐字符求值（textIndex）
        idx = f(textIndex, Order, Seed)
        采样 transform.position/scale/rotation.valueAtTime(time − idx·dly)
        ▼
   正序 / 倒序 / 随机级联 · 位置拖尾 · 缩放旋转拖尾 · 透明级联
```

**Amount 的四套约定**（表达式选择器的 Amount 在不同动画器属性下语义不同，这是全文最关键的一张表）：

| 动画器 | Animator 属性初值 | Amount 含义 | 反推公式 |
|--------|------------------|-------------|----------|
| 位置 | `[100, 100]` | 加性偏移，单位像素 | 字符位移 = Amount（字符本地空间） |
| 缩放 | `[0, 0]` | 100 − Amount | 字符缩放 = 100 + (延迟缩放 − 当前缩放) × k |
| 旋转 | `100`（度） | 加性偏移，单位度 | 字符偏转 = (延迟旋转 − 当前旋转) × k |
| 不透明度 | `0` | 100 − Amount | 字符不透明度 = 100 − Amount |

**Order 三模式的 idx 计算**：

- `Normal`：`idx = textIndex - 1`（从第一个字开始动）
- `Reverse`：`idx = textTotal - textIndex`（从最后一个字开始动）
- `Random`：**确定性哈希排名** —— `hh(n) = fract(sin(n*127.1 + seed*311.7) * 43758.5453)`，`idx` = 哈希值比当前字符小的字符个数。表达式里没有缓存可用，这是 O(N²) 循环，但同一帧结果稳定（种子不变则乱序不变，预览/渲染一致）。

**级联显隐**：字符 `i` 在 `inPoint + idx*dly` 出现、在 `outPoint − (N−1−idx)*dly` 消失，配 `linear()` 做 fade 过渡（Fade Frames = 0 时硬切）。

**位置拖尾的本地空间换算**：图层自身带旋转/缩放时，世界系位移差必须换算到字符本地空间才不发散——旋转取反（`cos(-r), sin(-r)` 构成逆旋转矩阵）、再除以 `scale/100`（带 0 保护）。

## 二、代码

`CharDelayAnimator.jsx` 完整源码，逐字保留（与本仓库根目录 `CharDelayAnimator.jsx` 一致）：

```javascript
/* ============================================================
 * CharDelay Animator  v1.0
 * 字符延迟拖尾动画 —— 原创实现（After Effects 脚本）
 *
 * 原理：给文字图层添加一组控件效果 + 4 个文本动画器。
 * 每个字符（textIndex）通过表达式选择器采样
 * time - idx * delay 时刻的图层变换，形成逐字延迟跟随：
 * 正序 / 倒序 / 随机级联、位置拖尾、缩放旋转拖尾、透明级联。
 *
 * 要求：AE CC2019+；表达式引擎 = JavaScript
 * 安装：放入 ScriptUI Panels 目录可停靠，或
 *       File > Scripts > Run Script File... 直接运行
 * ============================================================ */

var SCRIPT_NAME = "CharDelay Animator";
var VERSION = "1.0";

/* ---------- 控件效果命名（表达式按名字引用，改名须同步改表达式） ---------- */
var FX_DELAY = "CharDelay Delay";              // 滑块  延迟帧数
var FX_ORDER = "CharDelay Order";              // 弹出  1 Normal / 2 Reverse / 3 Random
var FX_SEED = "CharDelay Seed";                // 滑块  随机种子
var FX_STAGGER = "CharDelay Opacity Stagger";  // 复选  逐字透明级联
var FX_FADE = "CharDelay Fade Frames";         // 滑块  级联淡入淡出帧数
var FX_PTRAIL = "CharDelay Position Trail";    // 滑块  位置拖尾强度 %
var FX_ATRAIL = "CharDelay Trail Amount";      // 滑块  缩放/旋转拖尾强度 %

var ANIM_POS = "字符延迟 - 位置";
var ANIM_SCL = "字符延迟 - 缩放";
var ANIM_ROT = "字符延迟 - 旋转";
var ANIM_OPA = "字符延迟 - 不透明度";

/* ============================ 表达式 ============================ */

// 各表达式共用的 idx 计算：ord 1=正序 2=倒序 3=随机（确定性哈希排名，无需缓存）
function exprIdx() {
    return [
        "var fd = thisComp.frameDuration;",
        "var dly = fd * effect(\"" + FX_DELAY + "\");",
        "var ord = effect(\"" + FX_ORDER + "\");",
        "var idx;",
        "if (ord == 1) { idx = textIndex - 1; }",
        "else if (ord == 2) { idx = textTotal - textIndex; }",
        "else {",
        "  var sd = effect(\"" + FX_SEED + "\");",
        "  function hh(n) { var x = Math.sin(n * 127.1 + sd * 311.7) * 43758.5453; return x - Math.floor(x); }",
        "  idx = 0;",
        "  for (var i = 1; i <= textTotal; i++) { if (hh(i) < hh(textIndex)) idx++; }",
        "}"
    ].join("\n");
}

/* 位置拖尾：Animator Position = [100,100]，Amount 即字符位移（像素）
   取图层位移在「延迟时刻 vs 当前」的差值，换算到字符本地空间（抵消图层旋转/缩放） */
function exprPosition() {
    return "try {\n" + exprIdx() + "\n" + [
        "var k = effect(\"" + FX_PTRAIL + "\") / 100;",
        "var pNow = transform.position.value;",
        "var pDly = transform.position.valueAtTime(time - idx * dly);",
        "var dx = pDly[0] - pNow[0];",
        "var dy = pDly[1] - pNow[1];",
        "var r = degreesToRadians(transform.rotation);",
        "var cs = Math.cos(-r), sn = Math.sin(-r);",
        "var sx = (Math.abs(transform.scale[0]) < 1) ? 1 : transform.scale[0] / 100;",
        "var sy = (Math.abs(transform.scale[1]) < 1) ? 1 : transform.scale[1] / 100;",
        "[(dx * cs - dy * sn) * k / sx, (dx * sn + dy * cs) * k / sy]"
    ].join("\n") + "\n} catch (err) { [0, 0] }";
}

/* 缩放拖尾：Animator Scale = [0,0] → 字符缩放 = 100 − Amount
   即 字符缩放 = 100 + (延迟缩放 − 当前缩放) × k */
function exprScale() {
    return "try {\n" + exprIdx() + "\n" + [
        "var k = effect(\"" + FX_ATRAIL + "\") / 100;",
        "var sNow = transform.scale.value;",
        "var sDly = transform.scale.valueAtTime(time - idx * dly);",
        "[(sNow[0] - sDly[0]) * k, (sNow[1] - sDly[1]) * k]"
    ].join("\n") + "\n} catch (err) { [0, 0] }";
}

/* 旋转拖尾：Animator Rotation = 100° → 字符偏转 = Amount（度）
   即 字符偏转 = (延迟旋转 − 当前旋转) × k */
function exprRotation() {
    return "try {\n" + exprIdx() + "\n" + [
        "var k = effect(\"" + FX_ATRAIL + "\") / 100;",
        "var rNow = transform.rotation.value;",
        "var rDly = transform.rotation.valueAtTime(time - idx * dly);",
        "(rDly - rNow) * k"
    ].join("\n") + "\n} catch (err) { 0 }";
}

/* 级联不透明度：字符 i 在 inPoint + idx*dly 出现，在 outPoint − (N−1−idx)*dly 消失
   Animator Opacity = 0 → 字符不透明度 = 100 − Amount */
function exprOpacity() {
    return "try {\n" + exprIdx() + "\n" + [
        "if (effect(\"" + FX_STAGGER + "\") != 1) {",
        "  0",
        "} else {",
        "  var fade = Math.max(effect(\"" + FX_FADE + "\"), 0) * fd;",
        "  var tIn = inPoint + idx * dly;",
        "  var tOut = outPoint - (textTotal - 1 - idx) * dly;",
        "  var o;",
        "  if (fade > 0) {",
        "    o = Math.min(linear(time, tIn, tIn + fade, 0, 100),",
        "                 linear(time, tOut - fade, tOut, 100, 0));",
        "  } else {",
        "    o = (time < tIn || time > tOut) ? 0 : 100;",
        "  }",
        "  100 - o",
        "}"
    ].join("\n") + "\n} catch (err) { 0 }";
}

/* ============================ 应用逻辑 ============================ */

function addSlider(eff, name, val) {
    var p = eff.addProperty("ADBE Slider Control");
    p.name = name;
    p.property(1).setValue(val);
    return p;
}

function addCheckbox(eff, name, val) {
    var p = eff.addProperty("ADBE Checkbox Control");
    p.name = name;
    p.property(1).setValue(val);
    return p;
}

function addPopup(eff, name, items, def) {
    var p = eff.addProperty("ADBE Popup Control");
    p.name = name;
    p.property(1).setPropertyParameters(items);
    p.property(1).setValue(def);
    return p;
}

/* 防御：确保默认 Range 选择器覆盖全部字符（各版本默认值不一致） */
function ensureFullRange(animator) {
    var sels = animator.property("ADBE Text Selectors");
    if (sels.numProperties === 0) {
        sels.addProperty("ADBE Text Selector");
    }
    for (var i = 1; i <= sels.numProperties; i++) {
        var s = sels.property(i);
        if (s.matchName === "ADBE Text Selector") {
            try { s.property("ADBE Text Selector Start").setValue(0); } catch (e) {}
            try {
                s.property("ADBE Text Selector End").setValue(100);
            } catch (e1) {
                try { s.property("ADBE Text Selector End").setValue(1); } catch (e2) {}
            }
        }
    }
}

/* 给动画器挂表达式选择器，Amount 表达式逐字符驱动数值 */
function attachExpression(animator, expr) {
    var sels = animator.property("ADBE Text Selectors");
    var sel = sels.addProperty("ADBE Text Expressible Selector");
    sel.property("ADBE Text Selector Amount").expression = expr;
}

function newAnimator(layer, name) {
    var a = layer.property("ADBE Text Animators").addProperty("ADBE Text Animator");
    a.name = name;
    ensureFullRange(a);
    return a;
}

function addControls(layer) {
    var eff = layer.property("ADBE Effect Parade");
    addSlider(eff, FX_DELAY, 2);
    addPopup(eff, FX_ORDER, ["Normal", "Reverse", "Random"], 1);
    addSlider(eff, FX_SEED, 1);
    addCheckbox(eff, FX_STAGGER, true);
    addSlider(eff, FX_FADE, 5);
    addSlider(eff, FX_PTRAIL, 100);
    addSlider(eff, FX_ATRAIL, 100);
}

function addAnimators(layer) {
    var a;

    a = newAnimator(layer, ANIM_POS);
    a.property("ADBE Text Animator Properties").addProperty("ADBE Text Position").setValue([100, 100]);
    attachExpression(a, exprPosition());

    a = newAnimator(layer, ANIM_SCL);
    a.property("ADBE Text Animator Properties").addProperty("ADBE Text Scale").setValue([0, 0]);
    attachExpression(a, exprScale());

    a = newAnimator(layer, ANIM_ROT);
    a.property("ADBE Text Animator Properties").addProperty("ADBE Text Rotation").setValue(100);
    attachExpression(a, exprRotation());

    a = newAnimator(layer, ANIM_OPA);
    a.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity").setValue(0);
    attachExpression(a, exprOpacity());
}

function removeAllFromLayer(layer) {
    var i, n;
    var names = [ANIM_POS, ANIM_SCL, ANIM_ROT, ANIM_OPA];
    var anims = layer.property("ADBE Text Animators");
    for (i = anims.numProperties - 1; i >= 0; i--) {
        var a = anims.property(i + 1);
        for (n = 0; n < names.length; n++) {
            if (a.name === names[n]) { a.remove(); break; }
        }
    }
    var eff = layer.property("ADBE Effect Parade");
    for (i = eff.numProperties - 1; i >= 0; i--) {
        var e = eff.property(i + 1);
        if (e.name.indexOf("CharDelay") === 0) { e.remove(); }
    }
}

function isTextLayer(layer) {
    try {
        if (layer instanceof TextLayer) { return true; }
    } catch (e) {}
    try { return layer.property("ADBE Text Document") !== null; } catch (e) { return false; }
}

function applyToLayer(layer) {
    removeAllFromLayer(layer);   // 幂等：重复点「应用」即重建
    addControls(layer);
    addAnimators(layer);
}

/* ============================ 面板 ============================ */

function checkExpressionEngine() {
    try {
        var ee = String(app.project.expressionEngine);
        if (ee.toLowerCase().indexOf("javascript") === -1) {
            alert("当前工程使用旧版 ExtendScript 表达式引擎，表达式将不生效。\n" +
                  "请切换：File > Project Settings > Expressions > JavaScript",
                  SCRIPT_NAME);
        }
    } catch (e) { /* 老版本无此属性，跳过 */ }
}

function getActiveComp() {
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) { return comp; }
    /* 兜底：焦点不在合成查看器时，取项目面板里选中的合成 */
    try {
        var sel = app.project.selection;
        for (var i = 0; i < sel.length; i++) {
            if (sel[i] instanceof CompItem) { return sel[i]; }
        }
    } catch (e) {}
    return null;
}

function doApply() {
    checkExpressionEngine();
    var comp = getActiveComp();
    if (comp === null) { alert("请先打开一个合成。", SCRIPT_NAME); return; }

    var total = 0, texts = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (L.selected) {
            total++;
            if (isTextLayer(L)) { texts.push(L); }
        }
    }
    if (texts.length === 0) {
        var detail = (total > 0)
            ? ("当前选中了 " + total + " 个图层，但都不是文字图层（形状 / 视频 / 空对象等）。")
            : ("当前没有选中任何图层：请先在时间线里点选文字图层。\n" +
               "脚本作用的合成是「" + comp.name + "」，请确认图层选在这个合成里。");
        alert("合成「" + comp.name + "」无法应用。\n\n" + detail, SCRIPT_NAME);
        return;
    }

    app.beginUndoGroup("CharDelay: 应用");
    for (var t = 0; t < texts.length; t++) { applyToLayer(texts[t]); }
    app.endUndoGroup();
}

function doRemove() {
    var comp = getActiveComp();
    if (comp === null) { alert("请先打开一个合成。", SCRIPT_NAME); return; }
    app.beginUndoGroup("CharDelay: 移除");
    var n = 0;
    for (var i = 1; i <= comp.numLayers; i++) {
        var L = comp.layer(i);
        if (L.selected && isTextLayer(L)) { removeAllFromLayer(L); n++; }
    }
    app.endUndoGroup();
    if (n === 0) { alert("没有选中的文字图层。", SCRIPT_NAME); }
}

function doHelp() {
    alert(
        "给选中文字图层添加逐字符延迟动画。\n\n" +
        "Delay            延迟帧数（越大拖尾越长）\n" +
        "Order            Normal 正序 / Reverse 倒序 / Random 随机\n" +
        "Seed             Random 模式的随机种子\n" +
        "Opacity Stagger  逐字符级联显隐开关\n" +
        "Fade Frames      级联淡入淡出过渡帧数（0 = 硬切）\n" +
        "Position Trail   位置拖尾强度 %（0 = 关闭）\n" +
        "Trail Amount     缩放/旋转拖尾强度 %（0 = 关闭）\n\n" +
        "控件保存在图层效果里，随工程一起保存。\n" +
        "注意：表达式按名字引用控件，请勿重命名 CharDelay* 效果。\n" +
        "建议用于标题类短文本；字符数很大时 Random 模式较慢。",
        SCRIPT_NAME);
}

function buildUI(thisObj) {
    var ui = (thisObj instanceof Panel)
        ? thisObj
        : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });
    ui.orientation = "column";
    ui.alignChildren = ["fill", "top"];
    ui.spacing = 8;
    ui.margins = 12;

    var bApply = ui.add("button", undefined, "应用到选中文字图层");

    var row = ui.add("group");
    row.orientation = "row";
    row.alignChildren = ["fill", "center"];
    var bRemove = row.add("button", undefined, "移除");
    bRemove.alignment = ["fill", "center"];
    var bHelp = row.add("button", undefined, "说明");
    bHelp.alignment = ["fill", "center"];

    var note = ui.add("statictext", undefined, "v" + VERSION + " · 需要 JavaScript 表达式引擎");
    note.alignment = ["fill", "center"];

    bApply.onClick = doApply;
    bRemove.onClick = doRemove;
    bHelp.onClick = doHelp;

    ui.layout.layout(true);
    ui.onResizing = ui.onResize = function () { this.layout.resize(); };
    return ui;
}

var ui = buildUI(this);
if (ui instanceof Window) {
    ui.center();
    ui.show();
}
```

## 三、配置 / 命令

**表达式引擎（必须）**：`File > Project Settings > Expressions > JavaScript-1.0`。旧版 ExtendScript 引擎下表达式不生效（脚本启动时会检测并弹窗提醒）。

**安装（二选一）**：

```text
方式 A（可停靠面板）：把 CharDelayAnimator.jsx 放入 ScriptUI Panels 目录，重启 AE，
                    Window 顶部菜单出现「CharDelay Animator」。
  Windows: C:\Program Files\Adobe\Adobe After Effects <版本>\Support Files\Scripts\ScriptUI Panels\
  macOS:   /Applications/Adobe After Effects <版本>/Scripts/ScriptUI Panels/

方式 B（单次运行）：AE 菜单 File > Scripts > Run Script File... 选择 CharDelayAnimator.jsx，
                  以浮动窗口方式弹出。
```

**使用流程**：时间线选中文字图层 → 点「应用到选中文字图层」→ 效果控制台出现 7 个 `CharDelay*` 控件，实时调参预览：

| 控件 | 作用 |
|------|------|
| CharDelay Delay | 延迟帧数（拖尾长度） |
| CharDelay Order | Normal 正序 / Reverse 倒序 / Random 随机 |
| CharDelay Seed | Random 模式种子 |
| CharDelay Opacity Stagger | 逐字符级联显隐开关 |
| CharDelay Fade Frames | 级联淡入淡出帧数（0 = 硬切） |
| CharDelay Position Trail | 位置拖尾强度 %（0 = 关闭） |
| CharDelay Trail Amount | 缩放/旋转拖尾强度 %（0 = 关闭） |

## 四、复现 Checklist

**环境**：

- [ ] AE CC2019+，工程表达式引擎已切 JavaScript（Project Settings > Expressions）
- [ ] `CharDelayAnimator.jsx` 已放入 ScriptUI Panels 目录（或用 Run Script File 运行）

**应用**：

- [ ] 打开目标合成，在**时间线**中选中文字图层（焦点不必在合成查看器上，脚本会兜底取项目面板选中的合成）
- [ ] 点「应用到选中文字图层」，无报错弹窗
- [ ] 图层效果栏出现 7 个 `CharDelay*` 控件，文本分组出现 4 个「字符延迟 - *」动画器

**验证**：

- [ ] 调 Delay 帧数，预览可见逐字级联入场；Order 切 Reverse/Random，顺序随之变化
- [ ] 给图层位置打关键帧并移动，拖尾跟随方向正确；给图层加旋转/缩放后拖尾不发散（本地空间换算生效）
- [ ] 重复点「应用」幂等（先清后建）；点「移除」可一次清干净所有 CharDelay 动画器与控件

## 五、踩坑记录

**① 报「没有选中的文字图层」，但明明选了**

- 现象：点「应用」弹 `CharDelay Animator 没有选中的文字图层`。
- 原因（两层）：`app.project.activeItem` 在焦点不在合成查看器时为 `null`，早期版本直接报「未选中」；文字图层判定用 matchName 字符串探测在部分版本不可靠。
- 解决：`getActiveComp()` 兜底遍历 `app.project.selection` 取合成；`isTextLayer()` 优先 `instanceof TextLayer`、失败再探测 `ADBE Text Document`；`doApply()` 增加诊断弹窗（合成名 / 选中图层数 / 是否文字图层），一眼看出是「没选图层」还是「选错合成」。

**② 表达式全部不生效**

- 现象：应用成功但动画器无数值变化。
- 原因：工程还是旧版 ExtendScript 表达式引擎，不支持脚本生成的 JavaScript 语法表达式。
- 解决：启动时读 `app.project.expressionEngine` 检测并提示切换（老版本无此属性则跳过）。

**③ Range 选择器 End 值各版本不一致**

- 现象：只有部分字符被动画器影响。
- 原因：新建文本动画器自带的 Range 选择器，有的版本 `End` 量纲是 100（百分比）有的是 1。
- 解决：`ensureFullRange()` 先 `setValue(100)`，抛异常再 `setValue(1)`，双重兜底。

**④ 位置拖尾在图层有旋转/缩放时发散**

- 原因：世界系的位移差直接加到字符上，被图层自身旋转/缩放二次放大。
- 解决：差值向量乘逆旋转矩阵（`cos(-r)` / `sin(-r)`），再除以 `scale/100`（绝对值 <1 时按 1 保护），换算到字符本地空间。

**⑤ 表达式选择器 Amount 有数值上限**

- 现象：拖尾调到很大后字符位移不再增加。
- 原因：`ADBE Text Selector Amount` 数值范围约 ±1000，超出被截断。
- 解决：控件全部用百分比，表达式内 `k = Trail / 100` 缩放，正常用量（几十~几百像素）不会触顶。

**⑥ Random 模式字符多时卡**

- 原因：表达式无缓存，哈希排名是 O(N²) 逐帧重算。
- 解决：标题类短文本（≤50 字符）使用；长文本用 Normal/Reverse。

## 六、文件清单

| 文件 | 作用 | 复现动作 |
|------|------|----------|
| `CharDelayAnimator.jsx` | 脚本本体（本笔记「二、代码」逐字一致） | **必须**：copy 到 ScriptUI Panels 或 Run Script File 运行 |
| 目标 AEP 工程 | 承载动画器与表达式 | **必须**：表达式引擎切 JavaScript |
| AE 版本 | CC2019+（`instanceof TextLayer`、`expressionEngine` 属性可用） | 视情况：低版本需自行替换判定逻辑 |
