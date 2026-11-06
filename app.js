/* app.js — 「我的系统」原型核心逻辑
   说明：本原型为纯前端静态页面，所有"智能"行为均为本地规则模拟，
   不包含真实 AI 对话、照片识别、账号与云同步能力。 */

/* ============ 工具 ============ */
var KEY = "mysystem.v1";
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function uid() { return Math.random().toString(36).slice(2, 9); }
function now() { return Date.now(); }
function fmtTime(t) { var d = new Date(t); return (d.getMonth() + 1) + "/" + d.getDate() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ============ 数据 ============ */
var DEFAULT = {
  onboarded: false,
  ui: { theme: "tech" },
  user: {
    name: "", height: 163, weight: 59, note: "",
    avatar: defaultAvatar()
  },
  sys: { name: "星枢", persona: "calm", adapt: true, form: "core", points: 0, growth: 0 },
  goals: [], tasks: [], records: []
};

function loadState() {
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var d = JSON.parse(raw);
      var base = clone(DEFAULT);
      base.ui = Object.assign({ theme: "tech" }, d.ui || {});
      base.user = d.user || base.user;
      base.sys = d.sys || base.sys;
      base.goals = d.goals || [];
      base.tasks = d.tasks || [];
      base.records = d.records || [];
      base.onboarded = !!d.onboarded;
      if (!base.user.avatar) base.user.avatar = defaultAvatar();
      return base;
    }
  } catch (e) { }
  return clone(DEFAULT);
}
var S = loadState();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function sysLevel() { return 1 + Math.floor(S.sys.growth / 100); }

/* ============ 系统性格 ============ */
var PERSONAS = [
  { id: "gentle", label: "温柔", line: "别急，一步一步来，我在。", greet: "欢迎回来。今天也从最小的一步开始就好。" },
  { id: "humor", label: "幽默", line: "任务已装载完毕，就差一个执行的你。", greet: "哟，宿主上线。今日副本已刷新，奖励已就位。" },
  { id: "calm", label: "冷静理性", line: "进度已同步，按当前计划执行即可。", greet: "数据同步完成，当前无异常。" },
  { id: "fire", label: "热血直接", line: "目标就在前面，现在就出发。", greet: "别墨迹了，开干！" }
];
function personaOf(id) { return PERSONAS.find(function (p) { return p.id === id; }) || PERSONAS[2]; }

/* ============ 愿望方向库（规则演示，非 AI） ============ */
var DIRS = [
  {
    id: "slim", label: "变瘦 / 体态", hint: "体重、体态、运动习惯",
    states: [
      { k: "over", label: "基数较大，很久没运动", tip: "从低强度短时间开始，先建立习惯再谈强度" },
      { k: "soft", label: "微胖，想整体瘦一些", tip: "饮食记录 + 有氧的组合通常见效最快" },
      { k: "shape", label: "体重正常，想塑形紧致", tip: "重点在力量与体态训练，而不是掉秤" },
      { k: "unknown", label: "不清楚，帮我判断", tip: "系统会先安排记录类任务，摸清现状再定计划" }
    ],
    wishes: ["减脂塑形", "养成规律运动习惯", "改善饮食结构", "提升日常活动量"],
    tasks: [
      t("记录今日三餐", "拍了或写下吃了什么都行，不用算热量，先看见现状", 5, 5, "text"),
      t("快走或骑行 20 分钟", "中等强度：能说话但没法唱歌的程度", 10, 20, "timer"),
      t("晚餐吃到七分饱", "放下筷子时还有一点点饿的感觉，就是七分", 8, 0, "check"),
      t("睡前 10 分钟拉伸", "跟任意拉伸视频或自己放松腿部、肩颈", 8, 10, "timer"),
      t("晨起测量并记录体重", "同一时间、同一条件测；1kg 内波动都属正常", 5, 5, "text"),
      t("今日喝水约 1500ml", "大约 7-8 杯，汤和水都算", 5, 0, "check")
    ]
  },
  {
    id: "beauty", label: "变美 / 皮肤", hint: "肤色、肤质、护理习惯",
    states: [
      { k: "dull", label: "肤色暗沉、发黄", tip: "多与作息、防晒和糖分摄入相关" },
      { k: "acne", label: "容易出痘", tip: "先记录诱因（饮食 / 经期 / 熬夜），再针对性调整" },
      { k: "uneven", label: "肤色不均、有痘印", tip: "防晒是几乎所有改善的第一步" },
      { k: "dry", label: "干燥缺水", tip: "规律的基础保湿比猛药护肤品更重要" },
      { k: "unknown", label: "不清楚，帮我判断", tip: "先拍照记录 + 建立基础护理，再观察变化" }
    ],
    wishes: ["提亮肤色", "稳定皮肤状态", "建立基础护肤习惯", "改善肤色不均"],
    note: "关于「变白 / 黄几白」这类说法：它们只是日常交流里的参照词，不是科学分类。系统会用「暗沉 / 均匀 / 提亮」这类更实用的描述帮你表达，不需要你去查资料。",
    tasks: [
      t("拍照记录当前皮肤状态", "同一光线、同一角度拍一张作为起点（当前版本仅记录文件名）", 5, 5, "photo"),
      t("早晚基础护理：清洁 + 保湿", "两步就够，不需要复杂流程", 8, 10, "check"),
      t("白天做好防晒", "通勤、靠窗坐都需要，防晒是改善肤色的地基", 8, 5, "check"),
      t("记录今日甜食和饮水", "糖分是暗沉和出痘的常见诱因", 5, 5, "text"),
      t("23:30 前放下手机", "睡眠质量直接影响皮肤修复", 10, 0, "check")
    ]
  },
  {
    id: "study", label: "学习 / 技能", hint: "语言、考证、专业能力",
    states: [
      { k: "zero", label: "零基础入门", tip: "先建习惯再上强度，每天少量高频效果最好" },
      { k: "mid", label: "有基础想进阶", tip: "需要明确弱点，做针对性练习而不是重复舒适区" },
      { k: "exam", label: "备考冲刺", tip: "倒推法：从考试日期倒推每周需要完成的量" },
      { k: "work", label: "工作需要用", tip: "以场景为单位学习，用得上的记得最牢" },
      { k: "unknown", label: "不清楚，帮我判断", tip: "先记录学习时间一周，看看现状再定" }
    ],
    wishes: ["养成每日学习习惯", "完成一门系统课程", "通过某个考试", "提升具体技能（口语 / 写作等）"],
    tasks: [
      t("背 20 个新词", "任何语言都行，复习昨天的也算", 8, 15, "timer"),
      t("25 分钟专注学习", "一次只做一件事，手机放远处；计时结束即完成", 10, 25, "timer"),
      t("复盘今日所学 3 行", "今天学了什么 / 哪里卡住 / 明天先做什么", 5, 5, "text"),
      t("写一句明日计划", "具体到「明天几点做什么」", 5, 3, "text"),
      t("朗读或跟读 10 分钟", "语言类目标最有效的一环", 8, 10, "timer")
    ]
  },
  {
    id: "life", label: "生活习惯", hint: "作息、饮食、手机使用",
    states: [
      { k: "late", label: "长期熬夜晚睡", tip: "先固定起床时间，睡眠点会自然前移" },
      { k: "meal", label: "三餐不规律", tip: "从固定早餐开始最容易" },
      { k: "phone", label: "睡前刷手机停不下来", tip: "物理隔离比意志力可靠：手机放远处充电" },
      { k: "sit", label: "久坐少动", tip: "每小时起身 2 分钟就是好的开始" },
      { k: "unknown", label: "不清楚，帮我判断", tip: "先记录一周作息，找到最大缺口" }
    ],
    wishes: ["早睡并规律作息", "规律吃三餐", "减少睡前手机时间", "增加日常活动量"],
    tasks: [
      t("23:30 前放下手机", "放在够不着的地方充电，直接解决 80% 的熬夜", 10, 0, "check"),
      t("起床后 10 分钟内离床", "不管睡了几小时，固定起床窗口", 8, 0, "check"),
      t("三餐按时吃", "至少早餐在固定时间", 8, 0, "check"),
      t("每小时起身活动 2 分钟", "接水、拉伸、望远都算", 6, 2, "check"),
      t("记录今日作息时间", "入睡 / 起床各记一笔，一周后看趋势", 5, 3, "text")
    ]
  },
  {
    id: "mind", label: "情绪 / 心态", hint: "内耗、焦虑、情绪化进食",
    states: [
      { k: "internal", label: "容易内耗、想太多", tip: "写下来本身就是一种卸载" },
      { k: "swing", label: "情绪波动大", tip: "先记录，找到波动的触发点" },
      { k: "eat", label: "有情绪性进食", tip: "记录冲动发生时的场景和感受，不责怪自己" },
      { k: "night", label: "睡前思绪停不下来", tip: "睡前写清单可以把挂念从脑子里移到纸上" },
      { k: "unknown", label: "不清楚，帮我判断", tip: "从情绪日记开始，先看见规律" }
    ],
    wishes: ["减少精神内耗", "学会记录和识别情绪", "改善睡前思绪", "建立情绪急救方法"],
    tasks: [
      t("情绪日记 3 行", "发生了什么 / 我感觉如何 / 身体有什么反应", 8, 5, "text"),
      t("4-7-8 呼吸一轮", "吸气 4 秒、屏住 7 秒、呼气 8 秒，做 4 次", 6, 5, "timer"),
      t("睡前写下 3 件今天的小事", "任何小事都可以，包括今天天气不错", 6, 5, "text"),
      t("记录一次冲动及当时感受", "想吃 / 想买 / 想刷手机的瞬间，只记录不评判", 8, 3, "text")
    ]
  },
  {
    id: "custom", label: "其他愿望", hint: "任何想改变的方向",
    states: [
      { k: "any", label: "我来自己描述现状", tip: "下一页用一句话写下你的愿望即可" }
    ],
    wishes: [],
    customOnly: true,
    tasks: [
      t("用一句话写下这个目标", "写清楚「做什么 + 到什么程度」", 5, 5, "text"),
      t("拆出今天能做的最小一步", "小到不可能失败的程度", 8, 10, "text"),
      t("完成这一步并打卡", "今天的任务就到此为止，这已经足够", 10, 10, "check")
    ]
  },
  {
    id: "none", label: "还没有明确目标", hint: "先观察记录，之后再决定",
    states: [
      { k: "explore", label: "先记录一周生活", tip: "系统生成观察类任务，帮你看清现状、找到想改的点" }
    ],
    wishes: ["探索模式：先看见自己的现状"],
    explore: true,
    tasks: [
      t("记录今日作息", "入睡 / 起床时间各一笔", 5, 3, "text"),
      t("记录今日吃了什么", "简单几行即可，不评判", 5, 3, "text"),
      t("给今日心情打分 1-10", "一个数字加一个词", 5, 1, "text"),
      t("估算今日手机使用时长", "看屏幕使用时间设置，或粗略估计", 5, 2, "text"),
      t("写下一件想改变的小事", "只要一件，写完今天就算完成", 8, 3, "text")
    ]
  }
];
function t(title, how, points, minutes, verify) {
  return { title: title, how: how, points: points, minutes: minutes, verify: verify };
}
var VERIFY_LABEL = { check: "自主打卡", timer: "计时完成", text: "文字记录", photo: "照片记录" };
var INVEST_OPTS = [
  { k: "15m", label: "每天 15 分钟", count: 3 },
  { k: "30m", label: "每天 30 分钟", count: 4 },
  { k: "1h", label: "每天 1 小时以上", count: 5 },
  { k: "unsure", label: "不确定，先从最小量开始", count: 3 }
];
var DEADLINE_OPTS = ["1 个月", "3 个月", "半年", "长期陪伴"];

function dirOf(id) { return DIRS.find(function (d) { return d.id === id; }); }
function guessDir(text) {
  text = text || "";
  if (/瘦|减|体重|胖|身材|塑形/.test(text)) return "slim";
  if (/美|皮肤|护肤|白|痘|脸/.test(text)) return "beauty";
  if (/学|英语|日语|考|读|书|技能|语言|词/.test(text)) return "study";
  if (/睡|早起|熬夜|作息|习惯|饮食|手机/.test(text)) return "life";
  if (/情绪|心态|内耗|焦虑|压力|暴食|心/.test(text)) return "mind";
  return null;
}

/* ============ Toast ============ */
var toastTimer = null;
function toast(msg) {
  var el = $("toast");
  el.innerHTML = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
}

/* ============ 语音输入（浏览器原生 Web Speech API，非自研 AI） ============ */
var _SR = null;
try { _SR = (typeof window !== "undefined") && (window.SpeechRecognition || window.webkitSpeechRecognition) || null; } catch (e) { _SR = null; }
var VOICE = { rec: null, active: false, finalText: "", cfg: null };

function voiceSupported() { return !!_SR; }

function startVoiceInput(cfg) {
  /* cfg: { btn, onText(fullText), onInterim(fullText) } */
  if (!_SR) return false;
  stopVoiceInput();
  var rec = new _SR();
  rec.lang = "zh-CN";
  rec.continuous = true;
  rec.interimResults = true;
  VOICE = { rec: rec, active: true, finalText: "", cfg: cfg };
  if (cfg.btn) cfg.btn.classList.add("rec");

  rec.onresult = function (e) {
    var interim = "";
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var r = e.results[i];
      if (r.isFinal) VOICE.finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    var full = (VOICE.finalText + interim).trim();
    if (full && cfg.onInterim) cfg.onInterim(full);
    if (VOICE.finalText.trim() && cfg.onText) cfg.onText(VOICE.finalText.trim());
  };
  rec.onerror = function (e) {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      toast("麦克风权限被拒绝，请在浏览器地址栏允许麦克风后重试");
    } else if (e.error === "no-speech") {
      toast("没听清你说的话，再试一次～");
    }
    stopVoiceInput();
  };
  rec.onend = function () {
    /* 浏览器静默超时会自动断流，只要会话仍激活就续上 */
    if (VOICE.active && VOICE.rec === rec) {
      try { rec.start(); } catch (e) { }
    }
  };
  try { rec.start(); } catch (e) { return false; }
  return true;
}

function stopVoiceInput() {
  if (VOICE.rec) {
    VOICE.active = false;
    try { VOICE.rec.onend = null; VOICE.rec.stop(); } catch (e) { }
  }
  if (VOICE.cfg && VOICE.cfg.btn) VOICE.cfg.btn.classList.remove("rec");
  VOICE.rec = null; VOICE.cfg = null;
}

function toggleVoiceInput(cfg) {
  if (VOICE.active && VOICE.cfg === cfg) { stopVoiceInput(); return false; }
  return startVoiceInput(cfg);
}

/* ============ 面板控制 ============ */
function openSheet(id) {
  $("mask").classList.remove("hidden");
  $(id).classList.remove("hidden");
}
function closeSheets() {
  $("mask").classList.add("hidden");
  document.querySelectorAll(".sheet").forEach(function (s) { s.classList.add("hidden"); });
}
document.addEventListener("click", function (e) {
  if (e.target.id === "mask" || e.target.closest("[data-close]")) closeSheets();
});

/* ============ 渲染：系统页 ============ */
function renderSystem() {
  var lv = sysLevel(), p = personaOf(S.sys.persona);
  $("core-stage").innerHTML = systemFormSVG(S.sys.form, 190, lv);
  $("sys-name").textContent = S.sys.name;
  $("sys-level").textContent = "LV." + lv;
  $("sys-line").textContent = "SYSTEM ONLINE · SYNC " + (S.onboarded ? "OK" : "…");
  $("sys-status").textContent = p.greet + (S.sys.adapt ? "" : "");
  $("growth-fill").style.width = (S.sys.growth % 100) + "%";
  $("growth-text").textContent = "成长值 " + (S.sys.growth % 100) + " / 100（累计 " + S.sys.growth + "）";

  var todo = S.tasks.filter(function (x) { return x.status === "todo"; });
  var done = S.tasks.filter(function (x) { return x.status === "done"; });
  $("stat-points").textContent = S.sys.points;
  $("stat-tasks").textContent = todo.length;
  $("stat-done").textContent = done.length;

  var box = $("current-task");
  if (todo.length) {
    var task = todo[0];
    var goal = S.goals.find(function (g) { return g.id === task.goalId; });
    box.innerHTML =
      '<p class="card-title" style="margin-bottom:10px">当前任务</p>' +
      '<div class="ct-title">' + esc(task.title) + '</div>' +
      '<div class="ct-goal">目标 · ' + esc(goal ? goal.title : "独立任务") + '</div>' +
      '<div class="ct-meta"><span>耗时 <b>' + (task.minutes || 0) + ' 分钟</b></span><span>验证 <b>' + VERIFY_LABEL[task.verify] + '</b></span><span class="pt">+' + task.points + ' 积分</span></div>' +
      '<button class="primary-btn ct-btn" data-task="' + task.id + '">去完成</button>';
    box.querySelector("[data-task]").onclick = function () { openTaskSheet(task.id); };
  } else if (S.goals.length) {
    box.innerHTML = '<p class="ct-empty">当前没有进行中的任务<br>去「任务」页添加新目标，或等待系统下一步建议</p>';
  } else {
    box.innerHTML = '<p class="ct-empty">还没有任何任务<br>在上方说出你的愿望，让系统帮你开始</p>';
  }
}

/* ============ 渲染：任务页 ============ */
var taskFilter = "all";
function renderTasks() {
  var wrap = $("task-list");
  var goals = S.goals.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  if (!goals.length) {
    wrap.innerHTML = '<div class="task-empty">暂无目标<br><br><button class="primary-btn small" id="empty-new">＋ 建立第一个目标</button></div>';
    $("empty-new").onclick = startWizard;
    return;
  }
  var html = "";
  goals.forEach(function (g) {
    var ts = S.tasks.filter(function (x) { return x.goalId === g.id; });
    var shown = ts.filter(function (x) { return taskFilter === "all" || x.status === taskFilter; });
    var doneN = ts.filter(function (x) { return x.status === "done"; }).length;
    html += '<div class="goal-block">';
    html += '<div class="goal-head"><div style="flex:1;min-width:0">' +
      '<div class="goal-title">' + esc(g.title) + '</div>' +
      '<div class="goal-sub">' + esc(g.desc) + '<br>进度 ' + doneN + ' / ' + ts.length + (g.deadline ? ' · 期限 ' + esc(g.deadline) : '') + '</div></div>' +
      '<button class="goal-del" data-del-goal="' + g.id + '">删除</button></div>';
    if (!shown.length) {
      html += '<div class="task-empty" style="padding:14px 0">该筛选下没有任务</div>';
    } else {
      shown.forEach(function (x) {
        html += taskItemHTML(x);
      });
    }
    html += '</div>';
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll("[data-task]").forEach(function (el) {
    el.onclick = function () { openTaskSheet(el.getAttribute("data-task")); };
  });
  wrap.querySelectorAll("[data-del-goal]").forEach(function (el) {
    el.onclick = function (e) {
      e.stopPropagation();
      if (confirm("删除该目标及其全部任务？（已获得的积分不受影响）")) {
        var gid = el.getAttribute("data-del-goal");
        S.goals = S.goals.filter(function (g) { return g.id !== gid; });
        S.tasks = S.tasks.filter(function (x) { return x.goalId !== gid; });
        save(); renderAll();
      }
    };
  });
}
function taskItemHTML(x) {
  return '<div class="task-item' + (x.status === "done" ? " done" : "") + '" data-task="' + x.id + '">' +
    '<div class="tk-check">' + (x.status === "done" ? '<svg viewBox="0 0 20 20" width="13" height="13"><path d="M4 10.5l4 4 8-9" fill="none" stroke="#57e0a6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "") + '</div>' +
    '<div class="tk-main"><div class="tk-title">' + esc(x.title) + '</div>' +
    '<div class="tk-meta"><span>' + VERIFY_LABEL[x.verify] + '</span>' + (x.minutes ? '<span>' + x.minutes + ' 分钟</span>' : "") + '<span class="pt">+' + x.points + ' 积分</span></div></div></div>';
}

/* ============ 任务详情与打卡 ============ */
var sheetPhotoName = "";
function openTaskSheet(id) {
  var x = S.tasks.find(function (v) { return v.id === id; });
  if (!x) return;
  var goal = S.goals.find(function (g) { return g.id === x.goalId; });
  var body = $("task-body");
  var html = '<div class="dt-block"><h3>' + esc(goal ? goal.title : "独立任务") + '</h3><p style="font-size:16px;font-weight:700;color:var(--txt)">' + esc(x.title) + '</p></div>';
  html += '<div class="dt-block"><h3>要做什么</h3><p>' + esc(x.how || "按任务标题执行即可") + '</p></div>';
  html += '<div class="dt-block"><h3>怎么算完成</h3><p>' + verifyDoneText(x.verify) + '</p></div>';
  html += '<div class="dt-block"><h3>记录方式</h3><p><b>' + VERIFY_LABEL[x.verify] + '</b> · 奖励 <span class="dt-points">+' + x.points + '</span> 积分（一次性）</p></div>';

  if (x.status === "todo") {
    html += '<div class="field"><label>执行记录（可选）</label><textarea id="dt-note" placeholder="写下执行情况、感受或数据，例如：走了 22 分钟，微微出汗"></textarea></div>';
    html += '<div class="field"><label>佐证照片（可选 · 演示）</label>' +
      '<label class="photo-pick" id="photo-pick"><input type="file" id="dt-photo" accept="image/*"><span id="photo-name">＋ 选择照片（当前版本仅记录文件名，不会上传）</span></label></div>';
    html += '<button class="primary-btn" style="width:100%" id="dt-submit">提交完成验证</button>';
    html += '<p class="field-tip" style="text-align:center;margin-top:10px">演示规则：提交即视为验证通过并发放积分<br>真实照片审核能力尚未实现</p>';
  } else {
    var rec = S.records.filter(function (r) { return r.taskId === x.id; }).pop();
    html += '<div class="dt-done-info"><b style="color:var(--ok)">已完成</b> · ' + fmtTime(x.doneAt) + ' · 奖励 +' + x.points + ' 积分' +
      (rec ? (rec.note ? '<br>记录：' + esc(rec.note) : "") + (rec.photoName ? '<br><span class="rec-photo">附件：' + esc(rec.photoName) + '</span>' : "") : "") + '</div>';
    html += '<p class="field-tip" style="margin-top:12px">积分为一次性奖励，重复打开不会重复发放</p>';
  }
  body.innerHTML = html;

  if (x.status === "todo") {
    sheetPhotoName = "";
    $("dt-photo").onchange = function () {
      sheetPhotoName = this.files[0] ? this.files[0].name : "";
      var pn = $("photo-name");
      pn.textContent = sheetPhotoName ? ("已选择：" + sheetPhotoName) : "＋ 选择照片（当前版本仅记录文件名，不会上传）";
      $("photo-pick").classList.toggle("on", !!sheetPhotoName);
    };
    $("dt-submit").onclick = function () {
      var note = $("dt-note").value.trim();
      x.status = "done";
      x.doneAt = now();
      S.sys.points += x.points;
      S.records.push({ time: now(), taskId: x.id, taskTitle: x.title, note: note, photoName: sheetPhotoName, points: x.points });
      save(); renderAll(); closeSheets();
      toast("验证通过 · +" + x.points + " 积分<br><span style='font-size:11px;color:var(--txt3)'>（演示规则：点击即通过）</span>");
    };
  }
  openSheet("sheet-task");
}
function verifyDoneText(v) {
  return { check: "完成后打卡即算完成", timer: "计时结束即算完成", text: "提交文字记录即算完成", photo: "提交照片即算完成（演示）" }[v] || "完成后提交即算完成";
}

/* ============ 愿望澄清向导 ============ */
var WZ = null;
function startWizard(rawText, dirId) {
  WZ = { step: 0, raw: rawText || "", dir: dirId || (rawText ? guessDir(rawText) : null), state: null, wish: "", custom: "", invest: null, deadline: null, photoName: "", goalTitle: "", tasks: [] };
  renderWizard();
  openSheet("sheet-wizard");
}
function wzStepCount() { return 6; }
function renderWizard() {
  var body = $("wizard-body"), w = WZ;
  var dots = "";
  for (var i = 0; i < wzStepCount(); i++) dots += '<i class="' + (i <= w.step ? "on" : "") + '"></i>';
  var head = '<div class="wz-progress">' + dots + '</div>';
  if (w.raw) head += '<div class="wz-raw">你的愿望：' + esc(w.raw) + '</div>';
  var html = head, foot = "";

  if (w.step === 0) {
    $("wizard-title").textContent = "愿望澄清 · 方向";
    html += '<div class="field"><label>想往哪个方向改变？</label><div class="dir-grid">';
    DIRS.forEach(function (d) {
      html += '<button class="dir-cell' + (w.dir === d.id ? " on" : "") + '" data-dir="' + d.id + '"><b>' + d.label + '</b><i>' + d.hint + '</i></button>';
    });
    html += '</div></div>';
    html += '<div class="wz-note">不知道选哪个也没关系——选「还没有明确目标」，系统会先安排观察记录类任务，帮你看清现状。</div>';
    foot = '<div class="wz-actions"><button class="primary-btn" id="wz-next"' + (w.dir ? "" : " disabled") + '>下一步</button></div>';
  }

  if (w.step === 1) {
    var d = dirOf(w.dir);
    $("wizard-title").textContent = "愿望澄清 · 现状";
    html += '<div class="field"><label>「' + d.label + '」——你目前的状态更接近哪种？</label><div class="opt-list">';
    d.states.forEach(function (st) {
      html += '<button class="opt' + (w.state === st.k ? " on" : "") + '" data-state="' + st.k + '"><b>' + st.label + '</b><i>' + st.tip + '</i></button>';
    });
    html += '</div></div>';
    if (d.note) html += '<div class="wz-note">' + d.note + '</div>';
    if (d.customOnly) {
      html += '<div class="field"><label>用一句话描述你的愿望</label><input type="text" id="wz-custom" placeholder="例如：我想把房间整理成能专注学习的样子" maxlength="40" value="' + esc(w.custom) + '"></div>';
    }
    foot = '<div class="wz-actions"><button class="ghost-btn wz-back">上一步</button><button class="primary-btn" id="wz-next"' + (w.state ? "" : " disabled") + '>下一步</button></div>';
  }

  if (w.step === 2) {
    var d2 = dirOf(w.dir);
    $("wizard-title").textContent = "愿望澄清 · 目标";
    html += '<div class="field"><label>你希望达到的状态是？</label><div class="seg-row">';
    d2.wishes.forEach(function (wv) {
      html += '<button class="seg' + (w.wish === wv ? " on" : "") + '" data-wish="' + esc(wv) + '">' + esc(wv) + '</button>';
    });
    html += '</div></div>';
    html += '<div class="field"><label>或者自己写（选了上面可不填）</label><input type="text" id="wz-wish-custom" placeholder="一句话描述你想达到的状态" maxlength="30" value="' + esc(w.wish && d2.wishes.indexOf(w.wish) < 0 ? w.wish : "") + '"></div>';
    html += '<div class="wz-note">不用写得完美——之后任务做起来，系统会根据执行情况再调整（调整机制当前为演示）。</div>';
    foot = '<div class="wz-actions"><button class="ghost-btn wz-back">上一步</button><button class="primary-btn" id="wz-next"' + (w.wish ? "" : " disabled") + '>下一步</button></div>';
  }

  if (w.step === 3) {
    $("wizard-title").textContent = "愿望澄清 · 投入";
    html += '<div class="field"><label>每天大概能投入多少？</label><div class="opt-list">';
    INVEST_OPTS.forEach(function (iv) {
      html += '<button class="opt' + (w.invest === iv.k ? " on" : "") + '" data-invest="' + iv.k + '"><b>' + iv.label + '</b></button>';
    });
    html += '</div></div><div class="wz-note">选小一点也不丢人——能长期坚持的量，就是最好的量。</div>';
    foot = '<div class="wz-actions"><button class="ghost-btn wz-back">上一步</button><button class="primary-btn" id="wz-next"' + (w.invest ? "" : " disabled") + '>下一步</button></div>';
  }

  if (w.step === 4) {
    $("wizard-title").textContent = "愿望澄清 · 期限与现状照片";
    html += '<div class="field"><label>希望多久看到变化？</label><div class="seg-row">';
    DEADLINE_OPTS.forEach(function (dv) {
      html += '<button class="seg' + (w.deadline === dv ? " on" : "") + '" data-deadline="' + dv + '">' + dv + '</button>';
    });
    html += '</div></div>';
    html += '<div class="field"><label>现状照片（可选 · 尚未实现识别）</label>' +
      '<label class="photo-pick' + (w.photoName ? " on" : "") + '"><input type="file" id="wz-photo" accept="image/*"><span id="wz-photo-name">' + (w.photoName ? "已选择：" + esc(w.photoName) : "＋ 上传一张现状照片，帮助系统了解起点") + '</span></label>' +
      '<p class="field-tip">未来版本将结合照片辅助识别现状（受光线角度影响，仅作参考，不会包装成精确测量）。当前版本仅记录文件名，不上传、不存储图片。</p></div>';
    foot = '<div class="wz-actions"><button class="ghost-btn wz-back">上一步</button><button class="primary-btn" id="wz-next"' + (w.deadline ? "" : " disabled") + '>生成计划</button></div>';
  }

  if (w.step === 5) {
    $("wizard-title").textContent = "计划预览";
    var plan = buildPlan(w);
    if (w.taskCount == null) w.taskCount = plan.tasks.length;
    w.goalTitle = plan.title;
    w.tasks = plan.tasks.slice(0, Math.max(1, w.taskCount));
    html += '<div class="wz-summary">' + plan.summary + '</div>';
    html += '<div class="field"><label>起步任务（' + w.tasks.length + ' 个 · 规则生成演示）</label><div class="wz-tasks">';
    w.tasks.forEach(function (x) { html += taskItemHTML(x); });
    html += '</div></div>';
    html += '<div class="wz-note">这些任务由本地规则模板生成，属于演示能力。真实版本将结合你的执行反馈动态调整节奏与难度（待实现）。</div>';
    html += '<div class="field" style="margin-top:16px"><label>想微调任务数量？</label><div class="seg-row">' +
      '<button class="seg" data-count="2">精简（2 个）</button><button class="seg' + (w.tasks.length > 2 ? " on" : "") + '" data-count="' + Math.max(3, plan.tasks.length) + '">标准（' + plan.tasks.length + ' 个）</button></div></div>';
    foot = '<div class="wz-actions"><button class="ghost-btn wz-back">上一步</button><button class="primary-btn" id="wz-create">创建目标</button></div>';
  }

  body.innerHTML = html + foot;

  /* 事件绑定 */
  body.querySelectorAll("[data-dir]").forEach(function (el) {
    el.onclick = function () { WZ.dir = el.getAttribute("data-dir"); WZ.state = null; WZ.wish = ""; renderWizard(); };
  });
  body.querySelectorAll("[data-state]").forEach(function (el) {
    el.onclick = function () { WZ.state = el.getAttribute("data-state"); renderWizard(); };
  });
  body.querySelectorAll("[data-wish]").forEach(function (el) {
    el.onclick = function () { WZ.wish = el.getAttribute("data-wish"); renderWizard(); };
  });
  body.querySelectorAll("[data-invest]").forEach(function (el) {
    el.onclick = function () { WZ.invest = el.getAttribute("data-invest"); renderWizard(); };
  });
  body.querySelectorAll("[data-deadline]").forEach(function (el) {
    el.onclick = function () { WZ.deadline = el.getAttribute("data-deadline"); renderWizard(); };
  });
  body.querySelectorAll("[data-count]").forEach(function (el) {
    el.onclick = function () {
      WZ.taskCount = parseInt(el.getAttribute("data-count"), 10);
      renderWizard();
    };
  });
  var customInput = body.querySelector("#wz-custom");
  if (customInput) {
    customInput.oninput = function () { WZ.custom = customInput.value; };
  }
  var wishCustom = body.querySelector("#wz-wish-custom");
  if (wishCustom) {
    wishCustom.oninput = function () { WZ.wish = wishCustom.value.trim(); };
  }
  var photoInput = body.querySelector("#wz-photo");
  if (photoInput) {
    photoInput.onchange = function () {
      WZ.photoName = this.files[0] ? this.files[0].name : "";
      $("wz-photo-name").textContent = WZ.photoName ? "已选择：" + WZ.photoName : "＋ 上传一张现状照片，帮助系统了解起点";
      renderWizard();
    };
  }
  body.querySelectorAll(".wz-back").forEach(function (el) {
    el.onclick = function () { WZ.step--; renderWizard(); };
  });
  var next = body.querySelector("#wz-next");
  if (next) {
    next.onclick = function () {
      if (WZ.step === 1 && dirOf(WZ.dir).customOnly && !WZ.custom.trim() && !WZ.wish) { WZ.wish = ""; }
      if (WZ.step === 1 && dirOf(WZ.dir).customOnly) {
        if (WZ.custom.trim()) WZ.wish = WZ.custom.trim();
      }
      WZ.step++;
      renderWizard();
    };
  }
  var create = body.querySelector("#wz-create");
  if (create) {
    create.onclick = function () {
      var gid = uid();
      S.goals.push({
        id: gid, title: WZ.goalTitle, desc: WZ.desc || "",
        createdAt: now(), deadline: WZ.deadline, invest: WZ.invest, photoName: WZ.photoName
      });
      WZ.tasks.forEach(function (tt) {
        S.tasks.push({
          id: uid(), goalId: gid, title: tt.title, how: tt.how,
          points: tt.points, minutes: tt.minutes, verify: tt.verify,
          status: "todo", doneAt: null
        });
      });
      save(); closeSheets(); renderAll();
      switchPage("task");
      toast("目标已创建 · 起步任务 " + WZ.tasks.length + " 个");
    };
  }
}

function buildPlan(w) {
  var d = dirOf(w.dir);
  var invest = INVEST_OPTS.find(function (i) { return i.k === w.invest; }) || INVEST_OPTS[3];
  var count = invest.count;
  var tasks = d.tasks.slice(0, count).map(function (tt) {
    return { id: "", goalId: "", title: tt.title, how: tt.how, points: tt.points, minutes: tt.minutes, verify: tt.verify, status: "todo", doneAt: null };
  });
  var st = d.states.find(function (x) { return x.k === w.state; });
  var stateLabel = st ? st.label : "";
  var wish = w.wish || "探索自己的现状";
  var title, desc;
  if (d.explore) {
    title = "探索模式 · 先看见现状";
    desc = "通过一周左右的观察记录，找到最想改变的那个点";
  } else if (d.customOnly) {
    title = wish;
    desc = "自定义目标 · 期限 " + (w.deadline || "未定") + " · " + invest.label;
  } else {
    title = d.label.split(" ")[0] + " · " + wish;
    desc = "起点：" + stateLabel + " → 目标：" + wish + " · " + invest.label + " · 期限 " + (w.deadline || "未定");
  }
  var summary = "<b>" + esc(title) + "</b><br>" + esc(desc) +
    "<br><br>完成后每个任务都会发放积分（一次性），积分可在「我的 · 系统设置」中兑换为系统成长值。";
  return { title: title, desc: desc, tasks: tasks, summary: summary };
}

/* ============ 渲染：我的页 ============ */
function renderMine() {
  var u = S.user;
  $("mine-avatar").innerHTML = userAvatarSVG(Object.assign({}, u.avatar, { height: u.height, weight: u.weight }), 118);
  $("mine-name").textContent = u.name || "未命名";
  $("mine-brief").textContent = (u.height || "?") + "cm · " + (u.weight || "?") + "kg" + (u.note ? " · " + u.note : "");
  $("mine-check").textContent = "累计打卡 " + S.records.length + " 次 · 完成 " + S.tasks.filter(function (x) { return x.status === "done"; }).length + " 个任务";
}

/* ============ 捏脸编辑 ============ */
var AV = null;
function openAvatarEditor() {
  AV = Object.assign({}, S.user.avatar, { height: S.user.height, weight: S.user.weight });
  renderAvatarEditor();
  openSheet("sheet-avatar");
}
function renderAvatarEditor() {
  var body = $("avatar-body");
  var a = AV;
  var html = '<div class="avatar-preview" id="av-preview">' + userAvatarSVG(a, 168) + '</div>';

  html += '<div class="field"><label>一句话描述自己（支持语音，可再手动微调）</label>' +
    '<textarea id="av-desc" class="avatar-desc-input" placeholder="例如：长发，自然肤色，戴眼镜，微胖，爱穿蓝色，163/59">' + esc(AV._desc || "") + '</textarea>' +
    '<div class="voice-row">' +
    (voiceSupported()
      ? '<button class="mic-btn" id="av-mic" title="语音输入"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button>' +
        '<button class="ghost-btn" id="av-match">按描述生成初稿</button>'
      : '<button class="ghost-btn" id="av-match" style="flex:1">按描述生成初稿</button>') +
    '</div>' +
    '<p class="voice-tip">' + (voiceSupported()
      ? "点麦克风开始说话，再说一次停止；识别由浏览器原生完成，识别结果仍按关键词规则匹配（非 AI 理解）"
      : "当前浏览器不支持语音识别，建议用 Edge / Chrome / 安卓版浏览器打开") + '</p></div>';

  html += '<div class="field"><label>发型</label><div class="seg-row">' +
    HAIR_STYLES.map(function (h) { return '<button class="seg' + (a.hair === h.id ? " on" : "") + '" data-av-hair="' + h.id + '">' + h.label + '</button>'; }).join("") + '</div></div>';

  html += '<div class="field"><label>发色</label><div class="swatch-row">' +
    HAIR_COLORS.map(function (c) { return '<button class="swatch' + (a.hairColor === c.c ? " on" : "") + '" style="background:' + c.c + '" data-av-hc="' + c.c + '" title="' + c.label + '"></button>'; }).join("") + '</div></div>';

  html += '<div class="field"><label>肤色</label><div class="swatch-row">' +
    SKIN_TONES.map(function (c) { return '<button class="swatch' + (a.skin === c.c ? " on" : "") + '" style="background:' + c.c + '" data-av-skin="' + c.c + '" title="' + c.label + '"></button>'; }).join("") + '</div></div>';

  html += '<div class="field"><label>服装颜色</label><div class="swatch-row">' +
    CLOTH_COLORS.map(function (c) { return '<button class="swatch' + (a.cloth === c ? " on" : "") + '" style="background:' + c + '" data-av-cloth="' + c + '"></button>'; }).join("") + '</div></div>';

  html += '<div class="field"><label>眼镜</label><div class="toggle-row"><div><div class="t-label">' + (a.glasses ? "佩戴眼镜" : "不佩戴") + '</div></div><button class="switch' + (a.glasses ? " on" : "") + '" id="av-glasses"></button></div></div>';

  html += '<div class="field"><label>脸型 · 宽窄</label><div class="slider-row"><label>窄</label><input type="range" id="av-face" min="0" max="100" value="' + Math.round(a.faceW * 100) + '"><output>宽</output></div></div>';
  html += '<div class="field"><label>眼睛 · 大小</label><div class="slider-row"><label>小</label><input type="range" id="av-eye" min="0" max="100" value="' + Math.round(a.eyeW * 100) + '"><output>大</output></div></div>';
  html += '<div class="field"><label>身高（cm）</label><div class="slider-row"><label>140</label><input type="range" id="av-height" min="140" max="190" value="' + a.height + '"><output id="av-height-o">' + a.height + '</output></div></div>';
  html += '<div class="field"><label>体重（kg）· 影响体型</label><div class="slider-row"><label>35</label><input type="range" id="av-weight" min="35" max="100" value="' + a.weight + '"><output id="av-weight-o">' + a.weight + '</output></div></div>';

  html += '<div class="wz-actions" style="margin-top:22px">' +
    '<button class="ghost-btn" id="av-reset">恢复默认</button>' +
    '<button class="ghost-btn" id="av-cancel">取消</button>' +
    '<button class="primary-btn" id="av-save">保存形象</button></div>';

  body.innerHTML = html;

  body.querySelectorAll("[data-av-hair]").forEach(function (el) { el.onclick = function () { AV.hair = el.getAttribute("data-av-hair"); renderAvatarEditor(); }; });
  body.querySelectorAll("[data-av-hc]").forEach(function (el) { el.onclick = function () { AV.hairColor = el.getAttribute("data-av-hc"); renderAvatarEditor(); }; });
  body.querySelectorAll("[data-av-skin]").forEach(function (el) { el.onclick = function () { AV.skin = el.getAttribute("data-av-skin"); renderAvatarEditor(); }; });
  body.querySelectorAll("[data-av-cloth]").forEach(function (el) { el.onclick = function () { AV.cloth = el.getAttribute("data-av-cloth"); renderAvatarEditor(); }; });
  $("av-glasses").onclick = function () { AV.glasses = !AV.glasses; renderAvatarEditor(); };
  $("av-face").oninput = function () { AV.faceW = this.value / 100; $("av-preview").innerHTML = userAvatarSVG(AV, 168); };
  $("av-eye").oninput = function () { AV.eyeW = this.value / 100; $("av-preview").innerHTML = userAvatarSVG(AV, 168); };
  $("av-height").oninput = function () { AV.height = +this.value; $("av-height-o").textContent = this.value; $("av-preview").innerHTML = userAvatarSVG(AV, 168); };
  $("av-weight").oninput = function () { AV.weight = +this.value; $("av-weight-o").textContent = this.value; $("av-preview").innerHTML = userAvatarSVG(AV, 168); };
  $("av-match").onclick = function () {
    var txt = $("av-desc").value.trim();
    if (!txt) { toast("先在文本框里说或写一句描述～"); return; }
    AV = matchAvatarFromText(txt);
    renderAvatarEditor();
    toast("已按描述生成初稿，可继续手动微调");
  };
  var avMic = body.querySelector("#av-mic");
  if (avMic) {
    avMic.onclick = function () {
      var cfg = { btn: avMic, stopKey: "av" };
      cfg.onInterim = function (full) {
        var ta = $("av-desc");
        if (ta) { ta.value = full; AV._desc = full; }
      };
      cfg.onText = function (full) {
        AV._desc = full;
        var m = matchAvatarFromText(full);
        var desc = AV._desc;
        AV = m; AV._desc = desc;
        renderAvatarEditor();
        /* 重渲染后恢复麦克风录音态 */
        var nb = $("av-mic");
        if (nb && VOICE.active) { nb.classList.add("rec"); VOICE.cfg.btn = nb; }
        toast("语音识别完成，已按描述生成初稿");
      };
      toggleVoiceInput(cfg);
    };
  }
  $("av-reset").onclick = function () { AV = defaultAvatar(); renderAvatarEditor(); };
  $("av-cancel").onclick = closeSheets;
  $("av-save").onclick = function () {
    var desc = AV._desc; delete AV._desc;
    var { height, weight, ...look } = AV;
    S.user.avatar = look;
    S.user.height = height; S.user.weight = weight;
    AV._desc = desc;
    save(); renderMine(); closeSheets();
    toast("形象已保存");
  };
}

/* ============ 系统设置 ============ */
function openSettings() {
  renderSettings();
  openSheet("sheet-settings");
}
function renderSettings() {
  var body = $("settings-body");
  var lv = sysLevel();
  var html = '<div class="field"><label>系统称呼</label><input type="text" id="st-name" maxlength="12" value="' + esc(S.sys.name) + '"></div>';

  html += '<div class="field"><label>系统性格</label><div class="seg-row">';
  PERSONAS.forEach(function (p) {
    html += '<button class="seg' + (S.sys.persona === p.id ? " on" : "") + '" data-persona="' + p.id + '">' + p.label + '</button>';
  });
  html += '</div><p class="field-tip">当前语气预览：「' + esc(personaOf(S.sys.persona).line) + '」</p></div>';

  html += '<div class="field"><label>色彩风格（' + UI_THEMES.length + ' 套 · 点按即换，立即生效）</label><div class="theme-grid">';
  UI_THEMES.forEach(function (th) {
    var dots = '<div class="tdots">' + th.dots.map(function (c) { return '<i class="tdot" style="background:' + c + '"></i>'; }).join("") + '</div>';
    html += '<button class="theme-cell' + (S.ui.theme === th.id ? " on" : "") + '" data-ui-theme="' + th.id + '">' + dots + '<span>' + th.name + '</span><em>' + th.tag + '</em></button>';
  });
  html += '</div><p class="field-tip">深色 / 浅色都会自动适配；主题偏好保存在本机，未来账号同步时会一并跟随。</p></div>';

  html += '<div class="field"><label>适应偏好</label><div class="toggle-row"><div><div class="t-label">允许系统根据交流调整语气</div><div class="t-sub">开启后，系统会在对话中慢慢适配你的节奏（演示开关，真实适应待实现）</div></div><button class="switch' + (S.sys.adapt ? " on" : "") + '" id="st-adapt"></button></div></div>';

  html += '<div class="field"><label>系统形象（当前 ' + SYSTEM_FORMS.length + ' 种 · 未来将支持更多形态）</label><div class="form-grid">';
  SYSTEM_FORMS.forEach(function (f) {
    html += '<button class="form-cell' + (S.sys.form === f.id ? " on" : "") + '" data-form="' + f.id + '" title="' + esc(f.desc) + '">' + systemFormSVG(f.id, 44, 1) + '<span>' + f.name + '</span></button>';
  });
  html += '</div></div>';

  html += '<div class="exchange-box"><div class="card-title" style="margin-bottom:10px">成长与升级</div>' +
    '<div class="ex-row"><span>当前积分</span><b>' + S.sys.points + '</b></div>' +
    '<div class="ex-row"><span>成长值（累计）</span><b>' + S.sys.growth + '</b></div>' +
    '<div class="ex-row"><span>当前等级</span><b>LV.' + lv + '</b></div>' +
    '<div class="ex-row"><span>距下一级</span><b>' + (100 - S.sys.growth % 100) + ' 成长值</b></div>' +
    '<button class="primary-btn" style="width:100%;margin-top:12px" id="st-exchange"' + (S.sys.points >= 20 ? "" : " disabled") + '>兑换：20 积分 → 20 成长值</button>' +
    '<p class="field-tip">兑换比例与升级数值均为演示参数，尚未最终确定。成长值累计将提升系统等级（辉光强度随等级增强）。</p></div>';

  html += '<button class="primary-btn" style="width:100%" id="st-save">保存设置</button>';

  body.innerHTML = html;

  body.querySelectorAll("[data-persona]").forEach(function (el) {
    el.onclick = function () { S.sys.persona = el.getAttribute("data-persona"); save(); renderSettings(); renderSystem(); };
  });
  body.querySelectorAll("[data-ui-theme]").forEach(function (el) {
    el.onclick = function () {
      S.ui.theme = el.getAttribute("data-ui-theme");
      applyTheme(S.ui.theme);
      save(); renderSettings();
    };
  });
  $("st-adapt").onclick = function () { S.sys.adapt = !S.sys.adapt; save(); renderSettings(); };
  body.querySelectorAll("[data-form]").forEach(function (el) {
    el.onclick = function () { S.sys.form = el.getAttribute("data-form"); save(); renderSettings(); renderSystem(); };
  });
  $("st-exchange").onclick = function () {
    if (S.sys.points < 20) return;
    var before = sysLevel();
    S.sys.points -= 20; S.sys.growth += 20;
    save(); renderSettings(); renderAll();
    if (sysLevel() > before) toast("兑换成功 · +20 成长值<br>系统升级 → LV." + sysLevel());
    else toast("兑换成功 · +20 成长值");
  };
  $("st-save").onclick = function () {
    S.sys.name = ($("st-name").value.trim() || "星枢");
    save(); renderAll(); closeSheets();
    toast("设置已保存");
  };
}

/* ============ 个人资料 ============ */
function openProfile() {
  var body = $("profile-body");
  body.innerHTML =
    '<div class="field"><label>称呼 / 昵称</label><input type="text" id="pf-name" maxlength="12" value="' + esc(S.user.name) + '"></div>' +
    '<div class="field"><label>身高（cm）</label><div class="slider-row"><label>140</label><input type="range" id="pf-height" min="140" max="190" value="' + S.user.height + '"><output id="pf-h-o">' + S.user.height + '</output></div></div>' +
    '<div class="field"><label>体重（kg）</label><div class="slider-row"><label>35</label><input type="range" id="pf-weight" min="35" max="100" value="' + S.user.weight + '"><output id="pf-w-o">' + S.user.weight + '</output></div></div>' +
    '<div class="field"><label>一句话简介</label><input type="text" id="pf-note" maxlength="24" placeholder="例如：正在成为更好的自己" value="' + esc(S.user.note) + '"></div>' +
    '<button class="primary-btn" style="width:100%" id="pf-save">保存资料</button>' +
    '<p class="field-tip">身高体重会同步影响「我的」页彩绘形象与捏脸参数。</p>';
  $("pf-height").oninput = function () { $("pf-h-o").textContent = this.value; };
  $("pf-weight").oninput = function () { $("pf-w-o").textContent = this.value; };
  $("pf-save").onclick = function () {
    S.user.name = $("pf-name").value.trim();
    S.user.height = +$("pf-height").value;
    S.user.weight = +$("pf-weight").value;
    S.user.note = $("pf-note").value.trim();
    save(); renderMine(); closeSheets();
    toast("资料已保存");
  };
  openSheet("sheet-profile");
}

/* ============ 执行记录 ============ */
function openRecords() {
  var body = $("records-body");
  if (!S.records.length) {
    body.innerHTML = '<div class="task-empty">还没有执行记录<br>完成第一个任务后就会出现在这里</div>';
  } else {
    var html = S.records.slice().reverse().map(function (r) {
      return '<div class="rec-item"><div class="rec-head"><span class="rec-title">' + esc(r.taskTitle) + '</span><span class="rec-pt">+' + r.points + '</span></div>' +
        '<div class="rec-time">' + fmtTime(r.time) + '</div>' +
        (r.note ? '<div class="rec-note">' + esc(r.note) + '</div>' : "") +
        (r.photoName ? '<div class="rec-photo">附件：' + esc(r.photoName) + '</div>' : "") + '</div>';
    }).join("");
    body.innerHTML = html;
  }
  openSheet("sheet-records");
}

/* ============ 能力说明 ============ */
var NOTES_HTML =
  '<div class="note-sec"><h3 class="tag-ok">已实现（本原型 · 本地运行）</h3><ul>' +
  "<li>系统 / 任务 / 我的 三主页面，手机优先 UI</li>" +
  "<li>6 套配色主题一键切换：冰蓝科技 / 极光紫 / 奶桃可爱 / 古风黛青 / 撞色霓虹 / 黑金时尚（设置内保存偏好）</li>" +
  "<li>语音输入（浏览器原生识别）：说出愿望、语音描述形象，自动转文字；需 Edge / Chrome 等支持的浏览器</li>" +
  "<li>选项式愿望澄清向导（现状 / 目标 / 投入 / 期限）</li>" +
  "<li>目标创建、任务筛选、任务详情、自主打卡</li>" +
  "<li>积分发放（一次性）、积分兑换成长值、等级显示</li>" +
  "<li>8 种系统形态选择与切换（核芯 / 星轨 / 晶簇 / 流光 / 机灵 / 云核 / 脉冲 / 镜像）</li>" +
  "<li>用户彩绘捏脸：发型 / 发色 / 肤色 / 服装 / 眼镜 / 脸宽 / 眼型 / 身高体重，实时预览</li>" +
  "<li>一句话描述（打字或语音）匹配形象初稿（关键词规则）</li>" +
  "<li>localStorage 本机保存、JSON 数据导出、首次初始化引导</li></ul></div>" +
  '<div class="note-sec"><h3 class="tag-demo">演示（规则模拟，不是真实 AI）</h3><ul>' +
  "<li>目标拆解与任务生成：关键词 + 模板规则，非个性化计划</li>" +
  "<li>语音→形象提取：识别文字后按关键词规则匹配，不是 AI 理解你的话</li>" +
  "<li>任务验证：点击提交即通过并发放积分，无真实审核</li>" +
  "<li>照片：仅记录文件名，不上传、不存储、不识别</li>" +
  "<li>性格适应：仅为开关与文案占位，不会真正学习你的偏好</li>" +
  "<li>积分 20 → 成长值 20、每 100 成长值升 1 级：演示参数，非最终规则</li></ul></div>" +
  '<div class="note-sec"><h3 class="tag-todo">未实现（需要后端或 AI 服务）</h3><ul>' +
  "<li>真正的对话理解与模糊愿望智能澄清</li>" +
  "<li>结合执行反馈的动态计划调整与复盘</li>" +
  "<li>照片识别现状、任务照片审核</li>" +
  "<li>账号登录、云端数据库、多设备同步</li>" +
  "<li>可安装应用（原生 / PWA 选型待定）</li>" +
  "<li>AI 自由生成用户肖像与精细捏脸、明星形象授权等</li></ul></div>" +
  '<div class="wz-note">当前所有数据仅存于本浏览器 localStorage：换设备 / 换浏览器 / 清理存储都会丢失记录。请用「导出数据」做备份。</div>';

/* ============ 数据导出 / 重置 ============ */
function exportData() {
  var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "我的系统-备份-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  toast("已导出 JSON 备份（下载目录）");
}

/* ============ 初始化引导 ============ */
var OB = { step: 0, data: { avatar: defaultAvatar() } };
function renderOb() {
  var inner = $("ob-inner");
  var d = OB.data;
  var dots = "";
  for (var i = 0; i < 7; i++) dots += '<i class="' + (i <= OB.step ? "on" : "") + '"></i>';
  var dotsHtml = '<div class="ob-dots">' + dots + '</div>';
  var html = "";

  if (OB.step === 0) {
    $("ob").classList.remove("hidden");
    html = '<div class="ob-logo">' + systemFormSVG("core", 110, 1) + '</div>' +
      '<div class="ob-title">我的系统</div>' +
      '<div class="ob-sub">像系统文主角一样，把愿望拆成任务、<br>一步步执行，成为<b>更好的自己</b>。<br><span style="font-size:11px;color:var(--txt3)">本地原型 · 无需注册 · 数据保存在本机</span></div>' +
      '<button class="primary-btn ob-btn" style="width:100%;text-align:center" id="ob-start">开始初始化</button>' +
      '<button class="ob-skip" id="ob-skip0">跳过（以后再设置）</button>' + dotsHtml;
  }
  if (OB.step === 1) {
    html = '<div class="ob-head">第一步 · 你的称呼</div><div class="ob-tip">系统会用它称呼你。之后随时可以改。</div>' +
      '<div class="ob-field field"><input type="text" id="ob-name" placeholder="例如：小星 / 阿柚 / 你的昵称" maxlength="12" value="' + esc(d.name || "") + '"></div>' +
      '<div class="ob-actions"><button class="primary-btn" id="ob-next">下一步</button></div>' + dotsHtml;
  }
  if (OB.step === 2) {
    html = '<div class="ob-head">第二步 · 给系统起个名字</div><div class="ob-tip">产品叫「我的系统」，系统本身的名字由你来定。</div>' +
      '<div class="ob-field field"><input type="text" id="ob-sysname" placeholder="默认：星枢" maxlength="12" value="' + esc(d.sysName || "") + '"></div>' +
      '<div class="ob-actions"><button class="ghost-btn ob-back">上一步</button><button class="primary-btn" id="ob-next">下一步</button></div>' + dotsHtml;
  }
  if (OB.step === 3) {
    html = '<div class="ob-head">第三步 · 系统的性格</div><div class="ob-tip">先由你选择；之后可开启「适应」，让系统慢慢贴合你的节奏。</div>' +
      '<div class="opt-list">' + PERSONAS.map(function (p) {
        return '<button class="opt' + (d.persona === p.id ? " on" : "") + '" data-ob-persona="' + p.id + '"><b>' + p.label + '</b><i>' + esc(p.line) + '</i></button>';
      }).join("") + '</div>' +
      '<div class="ob-actions" style="margin-top:20px"><button class="ghost-btn ob-back">上一步</button><button class="primary-btn" id="ob-next"' + (d.persona ? "" : " disabled") + '>下一步</button></div>' + dotsHtml;
  }
  if (OB.step === 4) {
    html = '<div class="ob-head">第四步 · 系统的形态</div><div class="ob-tip">选一个喜欢的初始形态，之后可用积分解锁更多变化（解锁机制待实现）。</div>' +
      '<div class="form-grid">' + SYSTEM_FORMS.map(function (f) {
        return '<button class="form-cell' + (d.form === f.id ? " on" : "") + '" data-ob-form="' + f.id + '" title="' + esc(f.desc) + '">' + systemFormSVG(f.id, 44, 1) + '<span>' + f.name + '</span></button>';
      }).join("") + '</div>' +
      '<div class="ob-actions" style="margin-top:20px"><button class="ghost-btn ob-back">上一步</button><button class="primary-btn" id="ob-next"' + (d.form ? "" : " disabled") + '>下一步</button></div>' + dotsHtml;
  }
  if (OB.step === 5) {
    html = '<div class="ob-head">第五步 · 你的形象</div><div class="ob-tip">粗选即可，进入产品后可用「捏脸」精细调整。</div>' +
      '<div class="avatar-preview" style="margin-bottom:14px">' + userAvatarSVG(Object.assign({}, d.avatar, { height: d.height || 163, weight: d.weight || 59 }), 140) + '</div>' +
      '<div class="field"><label>发型</label><div class="seg-row">' + HAIR_STYLES.map(function (hh) {
        return '<button class="seg' + (d.avatar.hair === hh.id ? " on" : "") + '" data-ob-hair="' + hh.id + '">' + hh.label + '</button>';
      }).join("") + '</div></div>' +
      '<div class="field"><label>发色</label><div class="swatch-row">' + HAIR_COLORS.map(function (c) {
        return '<button class="swatch' + (d.avatar.hairColor === c.c ? " on" : "") + '" style="background:' + c.c + '" data-ob-hc="' + c.c + '"></button>';
      }).join("") + '</div></div>' +
      '<div class="field"><label>肤色</label><div class="swatch-row">' + SKIN_TONES.map(function (c) {
        return '<button class="swatch' + (d.avatar.skin === c.c ? " on" : "") + '" style="background:' + c.c + '" data-ob-skin="' + c.c + '"></button>';
      }).join("") + '</div></div>' +
      '<div class="ob-actions"><button class="ghost-btn ob-back">上一步</button><button class="primary-btn" id="ob-next">下一步</button></div>' + dotsHtml;
  }
  if (OB.step === 6) {
    html = '<div class="ob-head">最后 · 你现在有想改变的事吗？</div><div class="ob-tip">没有也没关系，系统会先带你记录生活、看清现状。</div>' +
      '<div class="dir-grid">' + DIRS.map(function (dd) {
        return '<button class="dir-cell' + (d.dir === dd.id ? " on" : "") + '" data-ob-dir="' + dd.id + '"><b>' + dd.label + '</b><i>' + dd.hint + '</i></button>';
      }).join("") + '</div>' +
      '<div class="ob-actions" style="margin-top:20px"><button class="ghost-btn ob-back">上一步</button><button class="primary-btn" id="ob-finish">进入我的系统</button></div>' + dotsHtml;
  }

  inner.innerHTML = html;

  var startBtn = inner.querySelector("#ob-start");
  if (startBtn) startBtn.onclick = function () { OB.step = 1; renderOb(); };
  var skip0 = inner.querySelector("#ob-skip0");
  if (skip0) skip0.onclick = function () { finishOb(true); };
  inner.querySelectorAll(".ob-back").forEach(function (el) { el.onclick = function () { OB.step--; renderOb(); }; });
  var nextBtn = inner.querySelector("#ob-next");
  if (nextBtn) nextBtn.onclick = function () {
    if (OB.step === 1) d.name = ($("ob-name").value || "").trim();
    if (OB.step === 2) d.sysName = ($("ob-sysname").value || "").trim();
    OB.step++; renderOb();
  };
  inner.querySelectorAll("[data-ob-persona]").forEach(function (el) { el.onclick = function () { d.persona = el.getAttribute("data-ob-persona"); renderOb(); }; });
  inner.querySelectorAll("[data-ob-form]").forEach(function (el) { el.onclick = function () { d.form = el.getAttribute("data-ob-form"); renderOb(); }; });
  inner.querySelectorAll("[data-ob-hair]").forEach(function (el) { el.onclick = function () { d.avatar.hair = el.getAttribute("data-ob-hair"); renderOb(); }; });
  inner.querySelectorAll("[data-ob-hc]").forEach(function (el) { el.onclick = function () { d.avatar.hairColor = el.getAttribute("data-ob-hc"); renderOb(); }; });
  inner.querySelectorAll("[data-ob-skin]").forEach(function (el) { el.onclick = function () { d.avatar.skin = el.getAttribute("data-ob-skin"); renderOb(); }; });
  inner.querySelectorAll("[data-ob-dir]").forEach(function (el) { el.onclick = function () { d.dir = el.getAttribute("data-ob-dir"); renderOb(); }; });
  var finish = inner.querySelector("#ob-finish");
  if (finish) finish.onclick = function () { finishOb(false); };
}
function finishOb(skipped) {
  var d = OB.data;
  S.user.name = d.name || "";
  S.user.avatar = d.avatar;
  if (d.sysName) S.sys.name = d.sysName;
  if (d.persona) S.sys.persona = d.persona;
  if (d.form) S.sys.form = d.form;
  S.onboarded = true;
  save();
  $("ob").classList.add("hidden");
  $("app").classList.remove("hidden");
  renderAll();
  toast("初始化完成 · 欢迎使用「我的系统」");
  if (!skipped && d.dir) {
    setTimeout(function () { startWizard("", d.dir); }, 400);
  }
}

/* ============ 页面切换 ============ */
function switchPage(name) {
  document.querySelectorAll(".tab").forEach(function (b) {
    b.classList.toggle("on", b.getAttribute("data-page") === name);
  });
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.toggle("active", p.id === "page-" + name);
  });
  window.scrollTo(0, 0);
}

/* ============ 总渲染 ============ */
function renderAll() {
  renderSystem();
  renderTasks();
  renderMine();
}

/* ============ 启动 ============ */
(function init() {
  /* PWA：注册离线缓存（本地 file:// 打开时自动跳过） */
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    navigator.serviceWorker.register("sw.js").catch(function () { });
  }
  /* 应用已保存的色彩主题 */
  applyTheme(S.ui && S.ui.theme);
  /* 导航 */
  document.querySelectorAll(".tab").forEach(function (b) {
    b.onclick = function () { switchPage(b.getAttribute("data-page")); };
  });
  /* 筛选 */
  $("filter-row").querySelectorAll(".chip").forEach(function (c) {
    c.onclick = function () {
      taskFilter = c.getAttribute("data-f");
      $("filter-row").querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      renderTasks();
    };
  });
  /* 入口按钮 */
  $("btn-wish").onclick = function () {
    var v = $("wish-input").value.trim();
    startWizard(v);
  };
  /* 语音输入愿望：浏览器原生识别（不支持的浏览器自动隐藏按钮） */
  if (voiceSupported() && $("mic-wish")) {
    $("mic-wish").classList.remove("hidden");
    $("mic-wish").onclick = function () {
      var btn = $("mic-wish");
      var cfg = { btn: btn };
      cfg.onInterim = function (full) { $("wish-input").value = full.slice(0, 40); };
      cfg.onText = function (full) { $("wish-input").value = full.slice(0, 40); };
      if (!toggleVoiceInput(cfg)) toast("已停止录音，点「生成计划」继续");
    };
  }
  $("wish-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") startWizard(this.value.trim());
  });
  $("btn-explore").onclick = function () { startWizard("", "none"); };
  $("btn-new-goal").onclick = function () { startWizard(""); };
  $("btn-sys-settings").onclick = openSettings;
  $("btn-sys-settings2").onclick = openSettings;
  $("btn-edit-avatar").onclick = openAvatarEditor;
  $("btn-profile").onclick = openProfile;
  $("btn-records").onclick = openRecords;
  $("btn-notes").onclick = function () {
    $("notes-body").innerHTML = NOTES_HTML;
    openSheet("sheet-notes");
  };
  $("btn-export").onclick = exportData;
  $("btn-reset").onclick = function () {
    if (confirm("确认清空本浏览器中的全部数据？此操作不可恢复。建议先导出备份。")) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  };

  $("notes-body").innerHTML = NOTES_HTML;

  if (S.onboarded) {
    $("app").classList.remove("hidden");
    renderAll();
  } else {
    $("app").classList.add("hidden");
    renderOb();
  }
})();
