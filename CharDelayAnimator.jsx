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
