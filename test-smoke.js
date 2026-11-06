/* 冒烟测试：桩掉 DOM/localStorage，跑通 app.js 主要流程 */
function makeEl() {
  return {
    innerHTML: "", textContent: "", value: "", style: {}, files: [],
    classList: { add: function () { }, remove: function () { }, toggle: function () { } },
    onclick: null, oninput: null, onchange: null,
    addEventListener: function () { },
    querySelector: function () { return makeEl(); },
    querySelectorAll: function () { return []; },
    getAttribute: function () { return ""; },
    setAttribute: function () { }
  };
}
var elCache = {};
global.document = {
  getElementById: function (id) { if (!elCache[id]) elCache[id] = makeEl(); return elCache[id]; },
  querySelectorAll: function () { return []; },
  addEventListener: function () { },
  createElement: function () { var e = makeEl(); e.click = function () { }; e.remove = function () { }; e.href = ""; e.download = ""; return e; },
  body: { appendChild: function () { } }
};
global.window = { scrollTo: function () { } };
global.localStorage = { _s: {}, getItem: function (k) { return this._s[k] || null; }, setItem: function (k, v) { this._s[k] = v; }, removeItem: function (k) { delete this._s[k]; } };
global.confirm = function () { return true; };
global.alert = function () { };
global.Blob = function () { };
global.URL = { createObjectURL: function () { return "blob:x"; }, revokeObjectURL: function () { } };
global.setTimeout = function (fn) { return 0; };
global.clearTimeout = function () { };

var fs = require("fs");
var path = require("path");
var base = __dirname;
var src = fs.readFileSync(path.join(base, "appearance.js"), "utf8") + "\n" + fs.readFileSync(path.join(base, "app.js"), "utf8");
src = src.replace(/^const /gm, "var ");
eval(src);

/* 纯函数断言 */
var svg1 = systemFormSVG("core", 120, 3);
assertOk(svg1.indexOf("<svg") === 0, "systemFormSVG core");
SYSTEM_FORMS.forEach(function (f) {
  var s = systemFormSVG(f.id, 60, 1);
  assertOk(s.indexOf("<svg") === 0 && s.length > 200, "form svg " + f.id);
});
HAIR_STYLES.forEach(function (h) {
  var a = Object.assign(defaultAvatar(), { hair: h.id, height: 175, weight: 70 });
  var s = userAvatarSVG(a, 150);
  assertOk(s.indexOf("<svg") === 0 && s.length > 500, "avatar " + h.id);
});
var m = matchAvatarFromText("长发，白皙，戴眼镜，圆脸，163/59，爱穿蓝色");
assertOk(m.hair === "long" && m.skin === "#f6e3d4" && m.glasses === true && m.height === 163 && m.weight === 59, "matchAvatarFromText");

/* 新捏脸参数 */
var m2 = matchAvatarFromText("双马尾 中分 蓝眼 连衣裙 腮红 挑眉 165/48");
assertOk(m2.hair === "twin" && m2.bangs === "none" && m2.eyeColor === "#4a6fb0" && m2.outfit === "dress" && m2.browW === 0.85, "matchAvatar new params");
var m3 = matchAvatarFromText("丸子头 运动服 笑起来");
assertOk(m3.hair === "bun" && m3.outfit === "sport" && m3.mouthW === 0.85, "matchAvatar bun/sport");
HAIR_STYLES.forEach(function (h) {
  var a = Object.assign(defaultAvatar(), { hair: h.id, bangs: "side", outfit: "dress", eyeColor: "#4e8a5a", browW: 0.8, mouthW: 0.9, blush: 0.8 });
  var s = userAvatarSVG(a, 150);
  assertOk(s.indexOf("<svg") === 0 && s.length > 500, "avatar " + h.id);
});

/* 主题与语音辅助 */
assertOk(UI_THEMES.length === 12, "12 themes, got " + UI_THEMES.length);
UI_THEMES.forEach(function (th) { assertOk(applyTheme(th.id) === th.id, "applyTheme " + th.id); });
var mv = matchAvatarFromText("呃 我是短发 戴眼镜 体重五十公斤身高一百六十三");
assertOk(mv.hair === "short" && mv.glasses === true, "voice-like text match, got hair=" + mv.hair);
assertOk(voiceSupported() === false, "voice unsupported in node stub");

/* 愿望拆分与批量建目标 */
var sw = splitWishes("我想变瘦，还想学好英语，另外想早点睡");
assertOk(sw.length === 3, "splitWishes 3 items, got " + sw.length);
assertOk(sw[0].dir === "slim" && sw[1].dir === "study" && sw[2].dir === "life", "splitWishes dirs");
var single = splitWishes("我想变瘦");
assertOk(single.length === 1, "splitWishes single");
S.onboarded = true;
var created = createGoalsBatch(sw);
assertOk(created === 3, "createGoalsBatch created, got " + created);
assertOk(S.goals.length >= 3 && S.tasks.length >= 6, "batch goals/tasks");

/* 向导多选愿望 */
startWizard("我想变瘦", "slim");
WZ.wishes = ["减脂塑形", "养成规律运动习惯"]; WZ.wish = WZ.wishes[0];
WZ.state = "soft"; WZ.invest = "30m"; WZ.deadline = "3 个月"; WZ.step = 5; renderWizard();
assertOk(WZ.tasks.length === 4, "wizard tasks count, got " + WZ.tasks.length);
assertOk(WZ.goalTitle.indexOf("变瘦") === 0, "goal title");
assertOk(buildPlan(WZ).tasks.length >= 3, "buildPlan");

/* 任务打卡 */
var task = S.tasks[0] || (S.tasks.push({ id: "t1", goalId: "g1", title: "测试任务", how: "x", points: 8, minutes: 5, verify: "check", status: "todo", doneAt: null }), S.tasks[0]);
S.goals.push({ id: "g1", title: "测试目标", desc: "d", createdAt: Date.now(), deadline: "", invest: "", photoName: "" });
task.status = "done"; task.doneAt = Date.now(); S.sys.points += task.points;
S.records.push({ time: Date.now(), taskId: task.id, taskTitle: task.title, note: "n", photoName: "", points: task.points });

/* 兑换与等级 */
S.sys.points = 45; S.sys.growth = 95;
S.sys.points -= 20; S.sys.growth += 20;
assertOk(sysLevel() === 2, "level up, got " + sysLevel());

/* 渲染冒烟 */
renderAll(); renderTasks(); renderMine(); renderSystem(); renderSettings(); renderOb(); openAvatarEditor(); openProfile(); openRecords(); openTaskSheet(task.id);
assertOk(true, "render all sheets");

console.log("SMOKE_OK: all assertions passed");
function assertOk(cond, msg) { if (!cond) { console.error("FAIL: " + msg); process.exit(1); } }
