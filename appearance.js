/* appearance.js — 「我的系统」形象层：系统形态 SVG 与用户彩绘 SVG（均为本地绘制，无 AI 参与） */

/* ============ 系统形象库（8 种，与用户彩绘完全独立） ============ */
const SYSTEM_FORMS = [
  { id: "core",    name: "核芯", hue: "#5cc8ff", desc: "稳定运转的六面核心" },
  { id: "orbit",   name: "星轨", hue: "#7fb4ff", desc: "多层环绕的轨道体" },
  { id: "crystal", name: "晶簇", hue: "#9ad7ff", desc: "生长中的低温晶体" },
  { id: "flow",    name: "流光", hue: "#8fe0ff", desc: "不定形的能量流" },
  { id: "mech",    name: "机灵", hue: "#6fd0e8", desc: "带表情的终端机体" },
  { id: "nebula",  name: "云核", hue: "#8a9dff", desc: "悬浮的粒子云" },
  { id: "pulse",   name: "脉冲", hue: "#57e0d8", desc: "规律搏动的信号环" },
  { id: "mirror",  name: "镜像", hue: "#9aa7ff", desc: "对称的双生棱面" }
];

/* 依据等级提升辉光强度 */
function _glowOpacity(level) {
  return Math.min(0.32, 0.16 + level * 0.035);
}

function systemFormSVG(id, size, level) {
  level = level || 1;
  var f = SYSTEM_FORMS.find(function (x) { return x.id === id; }) || SYSTEM_FORMS[0];
  var h = f.hue, g = _glowOpacity(level);
  var open = '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">';
  var glow = '<circle cx="60" cy="60" r="36" fill="' + h + '" opacity="' + g + '" class="sf-breath"/>';

  switch (id) {
    case "core":
      return open + glow +
        '<g class="sf-spin"><circle cx="60" cy="60" r="46" fill="none" stroke="' + h + '" stroke-width="1" stroke-dasharray="3 7" opacity=".65"/></g>' +
        '<polygon points="89.4,77 60,94 30.6,77 30.6,43 60,26 89.4,43" fill="' + h + '" fill-opacity=".1" stroke="' + h + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<polygon points="81.1,72.5 60,84 38.9,72.5 38.9,47.5 60,36 81.1,47.5" fill="none" stroke="' + h + '" stroke-width="1" opacity=".55"/>' +
        '<circle cx="60" cy="60" r="9" fill="' + h + '" class="sf-core"/>' +
        '<circle cx="57" cy="57" r="2.4" fill="#fff" opacity=".85"/></svg>';

    case "orbit":
      return open + glow +
        '<g class="sf-spin">' +
        '<ellipse cx="60" cy="60" rx="50" ry="17" fill="none" stroke="' + h + '" stroke-width="1.1" opacity=".75"/>' +
        '<ellipse cx="60" cy="60" rx="50" ry="17" fill="none" stroke="' + h + '" stroke-width="1.1" opacity=".75" transform="rotate(60 60 60)"/>' +
        '<ellipse cx="60" cy="60" rx="50" ry="17" fill="none" stroke="' + h + '" stroke-width="1.1" opacity=".75" transform="rotate(120 60 60)"/>' +
        '<circle cx="110" cy="60" r="3" fill="' + h + '"/>' +
        '<circle cx="110" cy="60" r="3" fill="' + h + '" transform="rotate(120 60 60)"/>' +
        '<circle cx="110" cy="60" r="3" fill="' + h + '" transform="rotate(240 60 60)"/></g>' +
        '<circle cx="60" cy="60" r="12" fill="' + h + '" fill-opacity=".2" stroke="' + h + '" stroke-width="1.4" class="sf-breath"/>' +
        '<circle cx="60" cy="60" r="6" fill="' + h + '" class="sf-core"/></svg>';

    case "crystal":
      return open + glow +
        '<g class="sf-spin-rev"><polygon points="60,12 64,30 56,38" fill="none" stroke="' + h + '" stroke-width="1" opacity=".6"/></g>' +
        '<g class="sf-float"><polygon points="60,20 71,58 60,82 49,56" fill="' + h + '" fill-opacity=".18" stroke="' + h + '" stroke-width="1.5" stroke-linejoin="round"/></g>' +
        '<g class="sf-float d2"><polygon points="62,76 78,72 88,98 64,103" fill="' + h + '" fill-opacity=".1" stroke="' + h + '" stroke-width="1.1" stroke-linejoin="round"/></g>' +
        '<g class="sf-float d3"><polygon points="58,78 44,70 32,96 56,101" fill="' + h + '" fill-opacity=".1" stroke="' + h + '" stroke-width="1.1" stroke-linejoin="round"/></g>' +
        '<line x1="60" y1="20" x2="60" y2="82" stroke="' + h + '" stroke-width="1" opacity=".5"/>' +
        '<circle cx="60" cy="50" r="4.5" fill="' + h + '" class="sf-core"/></svg>';

    case "flow":
      return open +
        '<g class="sf-blob b1"><circle cx="46" cy="50" r="22" fill="' + h + '" opacity=".5"/></g>' +
        '<g class="sf-blob b2"><circle cx="74" cy="66" r="20" fill="#6f8fe0" opacity=".45"/></g>' +
        '<g class="sf-blob b3"><circle cx="60" cy="42" r="14" fill="#d4f0ff" opacity=".35"/></g>' +
        glow +
        '<circle cx="60" cy="58" r="7" fill="#fff" opacity=".9" class="sf-core"/>' +
        '<g class="sf-spin"><circle cx="60" cy="60" r="44" fill="none" stroke="' + h + '" stroke-width="1" stroke-dasharray="1 9" opacity=".7" stroke-linecap="round"/></g></svg>';

    case "mech":
      return open + glow +
        '<line x1="60" y1="40" x2="60" y2="26" stroke="' + h + '" stroke-width="2"/>' +
        '<circle cx="60" cy="23" r="3.5" fill="' + h + '" class="sf-core"/>' +
        '<rect x="34" y="40" width="52" height="46" rx="13" fill="' + h + '" fill-opacity=".1" stroke="' + h + '" stroke-width="1.8"/>' +
        '<rect x="40" y="47" width="40" height="26" rx="8" fill="#06121f" stroke="' + h + '" stroke-width="1"/>' +
        '<g class="sf-eye"><ellipse cx="52" cy="60" rx="5" ry="7" fill="' + h + '"/><ellipse cx="68" cy="60" rx="5" ry="7" fill="' + h + '"/></g>' +
        '<circle cx="53.5" cy="57.5" r="1.4" fill="#fff"/><circle cx="69.5" cy="57.5" r="1.4" fill="#fff"/>' +
        '<path d="M53 86 L67 86" stroke="' + h + '" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="44" cy="88" r="2" fill="' + h + '" opacity=".7"/><circle cx="76" cy="88" r="2" fill="' + h + '" opacity=".7"/>' +
        '<g class="sf-spin"><rect x="60" y="88" width="1.5" height="0" fill="none"/></g></svg>';

    case "nebula": {
      var dots = "";
      for (var i = 0; i < 26; i++) {
        var a = i * 2.39996, r = 22 + (i % 5) * 5.5;
        var x = 60 + r * Math.cos(a), y = 60 + r * Math.sin(a);
        var rr = 1.2 + (i % 3) * 0.6;
        dots += '<circle class="sf-twinkle" style="animation-delay:' + (-i * 0.37) + 's" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rr + '" fill="' + h + '"/>';
      }
      return open + glow + dots +
        '<circle cx="60" cy="60" r="10" fill="' + h + '" fill-opacity=".85" class="sf-core"/>' +
        '<circle cx="60" cy="60" r="16" fill="none" stroke="' + h + '" stroke-width="1" opacity=".5" class="sf-breath"/></svg>';
    }

    case "pulse":
      return open + glow +
        '<circle class="sf-ring" cx="60" cy="60" r="22" fill="none" stroke="' + h + '" stroke-width="1.6"/>' +
        '<circle class="sf-ring d2" cx="60" cy="60" r="22" fill="none" stroke="' + h + '" stroke-width="1.6"/>' +
        '<circle class="sf-ring d3" cx="60" cy="60" r="22" fill="none" stroke="' + h + '" stroke-width="1.6"/>' +
        '<polyline points="30,96 46,96 52,78 60,110 68,78 74,96 90,96" fill="none" stroke="' + h + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="sf-heart"/>' +
        '<circle cx="60" cy="60" r="6" fill="' + h + '" class="sf-core"/></svg>';

    case "mirror":
      return open + glow +
        '<g class="sf-spin-rev"><polygon points="60,10 103,85 17,85" fill="none" stroke="' + h + '" stroke-width="1" stroke-dasharray="4 6" opacity=".55" stroke-linejoin="round"/></g>' +
        '<polygon points="60,24 91,78 29,78" fill="' + h + '" fill-opacity=".14" stroke="' + h + '" stroke-width="1.5" stroke-linejoin="round" class="sf-float"/>' +
        '<polygon points="60,96 84,54 36,54" fill="' + h + '" fill-opacity=".08" stroke="' + h + '" stroke-width="1.2" stroke-linejoin="round" class="sf-float d2"/>' +
        '<polygon points="60,52 70,60 60,68 50,60" fill="' + h + '" class="sf-core"/>' +
        '<line x1="60" y1="24" x2="60" y2="10" stroke="' + h + '" stroke-width="1.2" opacity=".6"/></svg>';

    default:
      return open + glow + '<circle cx="60" cy="60" r="10" fill="' + h + '"/></svg>';
  }
}

/* ============ 用户彩绘（参数化 SVG，非 AI 生成） ============ */
const HAIR_STYLES = [
  { id: "long",  label: "长直发" },
  { id: "bob",   label: "齐肩发" },
  { id: "short", label: "短发" },
  { id: "curly", label: "卷发" },
  { id: "pony",  label: "马尾" },
  { id: "twin",  label: "双马尾" },
  { id: "bun",   label: "丸子头" }
];
const HAIR_COLORS = [
  { c: "#2e2a33", label: "黑茶" }, { c: "#463227", label: "深棕" }, { c: "#7a543a", label: "暖棕" },
  { c: "#9c5a45", label: "栗红" }, { c: "#b9a06a", label: "亚麻金" }, { c: "#3f6fae", label: "冷蓝挑染" },
  { c: "#6a4a8a", label: "雾紫" }, { c: "#8a3a3a", label: "酒红" }
];
const SKIN_TONES = [
  { c: "#f6e3d4", label: "白皙" }, { c: "#f0d4bd", label: "自然" },
  { c: "#e0b89a", label: "小麦" }, { c: "#c58e6d", label: "深肤" }
];
const CLOTH_COLORS = [
  "#58a6e8", "#e8eef5", "#39404e", "#9a8ad0", "#8f9aa8", "#e8a8b8",
  "#57e0a6", "#e8b86a", "#d05a6a", "#3aa89a"
];
const EYE_COLORS = [
  { c: "#2b3038", label: "黑瞳" }, { c: "#5a4632", label: "棕瞳" }, { c: "#4a6fb0", label: "蓝瞳" },
  { c: "#4e8a5a", label: "绿瞳" }, { c: "#8a5aa0", label: "紫瞳" }, { c: "#b0604a", label: "琥珀" }
];
const BANGS = [
  { id: "full",  label: "全刘海" },
  { id: "side",  label: "斜刘海" },
  { id: "none",  label: "中分" }
];
const OUTFITS = [
  { id: "casual", label: "休闲套装" },
  { id: "dress",  label: "连衣裙" },
  { id: "sport",  label: "运动装" }
];

function _shade(hex, k) {
  var n = parseInt(hex.slice(1), 16);
  var r = Math.min(255, Math.max(0, (n >> 16) + k)) | 0;
  var g = Math.min(255, Math.max(0, ((n >> 8) & 255) + k)) | 0;
  var b = Math.min(255, Math.max(0, (n & 255) + k)) | 0;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* a: {hair,hairColor,skin,cloth,glasses,faceW,eyeW,height,weight,bangs,eyeColor,browW,mouthW,blush,outfit} */
function userAvatarSVG(a, w) {
  a = a || {};
  var hair = a.hair || "long", hc = a.hairColor || "#2e2a33";
  var skin = a.skin || "#f0d4bd", cloth = a.cloth || "#58a6e8";
  var glasses = !!a.glasses;
  var faceW = (typeof a.faceW === "number") ? a.faceW : 0.5;
  var eyeW = (typeof a.eyeW === "number") ? a.eyeW : 0.5;
  var bangs = a.bangs || "full";
  var eyeColor = a.eyeColor || "#2b3038";
  var browW = (typeof a.browW === "number") ? a.browW : 0.5;
  var mouthW = (typeof a.mouthW === "number") ? a.mouthW : 0.5;
  var blush = (typeof a.blush === "number") ? a.blush : 0.3;
  var outfit = a.outfit || "casual";
  var h = a.height || 163, wt = a.weight || 59;

  var cx = 100;
  var headRx = 30 + faceW * 12, headRy = headRx * 1.16, cy = 78;
  var eyeR = 4.2 + eyeW * 4.6;
  var legLen = 48 + (h - 140) / 50 * 26;
  var wid = 0.85 + (wt - 35) / 65 * 0.35;
  var shift = 292 - (196 + legLen + 8);
  var dark = _shade(cloth, -28), light = _shade(cloth, 22);
  var hairD = _shade(hc, -14);

  var s = '<svg viewBox="0 0 200 300" width="' + (w || 150) + '" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,' + shift.toFixed(1) + ')">';

  /* --- 背景发 --- */
  var backLen = 0;
  if (hair === "long") backLen = 150; else if (hair === "bob") backLen = 70; else if (hair === "curly") backLen = 62; else backLen = 46;
  s += '<path class="av-hair-back" d="M ' + (cx - 42) + ' 82 C ' + (cx - 44) + ' 30 ' + (cx + 44) + ' 30 ' + (cx + 42) + ' 82 L ' + (cx + 38) + ' ' + (82 + backLen) + ' Q ' + cx + ' ' + (96 + backLen) + ' ' + (cx - 38) + ' ' + (82 + backLen) + ' Z" fill="' + hairD + '"/>';
  if (hair === "curly") {
    var bumps = "";
    [-30, -15, 0, 15, 30].forEach(function (dx) {
      bumps += '<circle cx="' + (cx + dx) + '" cy="' + (82 + backLen - 4) + '" r="10" fill="' + hairD + '"/>';
    });
    s += bumps;
  }
  if (hair === "pony") {
    s += '<path d="M ' + (cx + 36) + ' 68 C ' + (cx + 62) + ' 80 ' + (cx + 58) + ' 130 ' + (cx + 40) + ' 168" fill="none" stroke="' + hairD + '" stroke-width="17" stroke-linecap="round"/>';
  }
  if (hair === "twin") {
    s += '<path d="M ' + (cx - 38) + ' 62 C ' + (cx - 64) + ' 74 ' + (cx - 62) + ' 126 ' + (cx - 44) + ' 160" fill="none" stroke="' + hairD + '" stroke-width="14" stroke-linecap="round"/>';
    s += '<path d="M ' + (cx + 38) + ' 62 C ' + (cx + 64) + ' 74 ' + (cx + 62) + ' 126 ' + (cx + 44) + ' 160" fill="none" stroke="' + hairD + '" stroke-width="14" stroke-linecap="round"/>';
    s += '<circle cx="' + (cx - 40) + '" cy="62" r="5" fill="' + light + '"/>';
    s += '<circle cx="' + (cx + 40) + '" cy="62" r="5" fill="' + light + '"/>';
  }
  if (hair === "bun") {
    s += '<circle cx="' + cx + '" cy="' + (cy - headRy - 10) + '" r="14" fill="' + hairD + '"/>';
    s += '<circle cx="' + (cx - 4) + '" cy="' + (cy - headRy - 14) + '" r="5" fill="' + _shade(hc, 14) + '" opacity=".7"/>';
  }

  /* --- 腿 --- */
  var legY2 = 196 + legLen;
  s += '<line x1="' + (cx - 10 * wid) + '" y1="192" x2="' + (cx - 11 * wid) + '" y2="' + legY2 + '" stroke="' + skin + '" stroke-width="9" stroke-linecap="round"/>';
  s += '<line x1="' + (cx + 10 * wid) + '" y1="192" x2="' + (cx + 11 * wid) + '" y2="' + legY2 + '" stroke="' + skin + '" stroke-width="9" stroke-linecap="round"/>';
  s += '<ellipse cx="' + (cx - 12 * wid) + '" cy="' + (legY2 + 3) + '" rx="8" ry="4.5" fill="#3a4152"/>';
  s += '<ellipse cx="' + (cx + 12 * wid) + '" cy="' + (legY2 + 3) + '" rx="8" ry="4.5" fill="#3a4152"/>';

  /* --- 上身 --- */
  if (outfit === "dress") {
    /* 连衣裙：上身 + A 字裙摆 */
    s += '<path d="M ' + (cx - 26 * wid) + ' 128 C ' + (cx - 29 * wid) + ' 116 ' + (cx + 29 * wid) + ' 116 ' + (cx + 26 * wid) + ' 128 L ' + (cx + 22 * wid) + ' 168 L ' + (cx - 22 * wid) + ' 168 Z" fill="' + cloth + '"/>';
    s += '<path d="M ' + (cx - 22 * wid) + ' 166 Q ' + cx + ' 178 ' + (cx + 22 * wid) + ' 166 L ' + (cx + 34 * wid) + ' 226 Q ' + cx + ' 240 ' + (cx - 34 * wid) + ' 226 Z" fill="' + cloth + '"/>';
    s += '<path d="M ' + (cx - 34 * wid) + ' 224 Q ' + cx + ' 238 ' + (cx + 34 * wid) + ' 224 L ' + (cx + 35 * wid) + ' 230 Q ' + cx + ' 246 ' + (cx - 35 * wid) + ' 230 Z" fill="' + dark + '"/>';
    s += '<path d="M ' + (cx - 26 * wid) + ' 129 C ' + (cx - 27 * wid) + ' 120 ' + (cx - 12 * wid) + ' 116 ' + (cx - 10 * wid) + ' 126 L ' + (cx - 14 * wid) + ' 164 L ' + (cx - 22 * wid) + ' 164 Z" fill="' + light + '" opacity=".7"/>';
    s += '<line x1="' + (cx - 20 * wid) + '" y1="170" x2="' + (cx + 20 * wid) + '" y2="170" stroke="' + dark + '" stroke-width="2" opacity=".6"/>';
  } else {
    s += '<path d="M ' + (cx - 27 * wid) + ' 128 C ' + (cx - 30 * wid) + ' 116 ' + (cx + 30 * wid) + ' 116 ' + (cx + 27 * wid) + ' 128 L ' + (cx + 21 * wid) + ' 172 C ' + cx + ' 184 ' + cx + ' 184 ' + (cx - 21 * wid) + ' 172 Z" fill="' + cloth + '"/>';
    s += '<path d="M ' + (cx - 27 * wid) + ' 129 C ' + (cx - 28 * wid) + ' 120 ' + (cx - 12 * wid) + ' 116 ' + (cx - 10 * wid) + ' 126 L ' + (cx - 16 * wid) + ' 168 C ' + (cx - 22 * wid) + ' 172 ' + (cx - 26 * wid) + ' 164 ' + (cx - 27 * wid) + ' 129 Z" fill="' + light + '" opacity=".7"/>';
    s += '<path d="M ' + (cx - 21 * wid) + ' 170 Q ' + cx + ' 188 ' + (cx + 21 * wid) + ' 170 L ' + (cx + 27 * wid) + ' 198 Q ' + cx + ' 212 ' + (cx - 27 * wid) + ' 198 Z" fill="' + dark + '"/>';
    if (outfit === "sport") {
      s += '<line x1="' + (cx - 14 * wid) + '" y1="118" x2="' + (cx - 8 * wid) + '" y2="182" stroke="#ffffff" stroke-width="3" opacity=".55" stroke-linecap="round"/>';
      s += '<line x1="' + (cx + 14 * wid) + '" y1="118" x2="' + (cx + 8 * wid) + '" y2="182" stroke="#ffffff" stroke-width="3" opacity=".55" stroke-linecap="round"/>';
    }
  }

  /* --- 手臂 --- */
  s += '<line x1="' + (cx - 24 * wid) + '" y1="128" x2="' + (cx - 30 * wid) + '" y2="160" stroke="' + cloth + '" stroke-width="10" stroke-linecap="round"/>';
  s += '<line x1="' + (cx + 24 * wid) + '" y1="128" x2="' + (cx + 30 * wid) + '" y2="160" stroke="' + cloth + '" stroke-width="10" stroke-linecap="round"/>';
  s += '<line x1="' + (cx - 30 * wid) + '" y1="160" x2="' + (cx - 26 * wid) + '" y2="190" stroke="' + skin + '" stroke-width="7.5" stroke-linecap="round"/>';
  s += '<line x1="' + (cx + 30 * wid) + '" y1="160" x2="' + (cx + 26 * wid) + '" y2="190" stroke="' + skin + '" stroke-width="7.5" stroke-linecap="round"/>';

  /* --- 颈 --- */
  s += '<rect x="' + (cx - 6) + '" y="104" width="12" height="16" rx="4" fill="' + _shade(skin, -14) + '"/>';

  /* --- 头部：发罩 + 面窗 --- */
  s += '<ellipse cx="' + cx + '" cy="' + (cy - 3) + '" rx="' + (headRx + 6) + '" ry="' + (headRy + 6) + '" fill="' + hc + '"/>';
  s += '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="' + headRx + '" ry="' + headRy + '" fill="' + skin + '"/>';
  s += '<ellipse cx="' + (cx - headRx - 1) + '" cy="' + (cy + 8) + '" rx="5" ry="7" fill="' + skin + '"/>';
  s += '<ellipse cx="' + (cx + headRx + 1) + '" cy="' + (cy + 8) + '" rx="5" ry="7" fill="' + skin + '"/>';

  /* --- 刘海（三种样式） --- */
  if (bangs === "full") {
    s += '<path d="M ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.22) + ' C ' + (cx - headRx - 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 3) + ' ' + (cy - headRy * 0.22) + ' C ' + (cx + headRx * 0.5) + ' ' + (cy - headRy * 0.42) + ' ' + (cx - headRx * 0.5) + ' ' + (cy - headRy * 0.42) + ' ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.22) + ' Z" fill="' + hc + '"/>';
    s += '<circle cx="' + (cx - 16) + '" cy="' + (cy - headRy * 0.28) + '" r="7" fill="' + hc + '"/>';
    s += '<circle cx="' + (cx + 2) + '" cy="' + (cy - headRy * 0.32) + '" r="6" fill="' + hc + '"/>';
    s += '<circle cx="' + (cx + 18) + '" cy="' + (cy - headRy * 0.28) + '" r="5.5" fill="' + hc + '"/>';
  } else if (bangs === "side") {
    s += '<path d="M ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.2) + ' C ' + (cx - headRx - 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 3) + ' ' + (cy - headRy * 0.2) + ' C ' + (cx + headRx * 0.6) + ' ' + (cy - headRy * 0.5) + ' ' + (cx - headRx * 0.2) + ' ' + (cy - headRy * 0.3) + ' ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.2) + ' Z" fill="' + hc + '"/>';
    s += '<path d="M ' + (cx + headRx - 6) + ' ' + (cy - headRy * 0.5) + ' C ' + (cx + 4) + ' ' + (cy - headRy * 0.55) + ' ' + (cx - 6) + ' ' + (cy - headRy * 0.2) + ' ' + (cx - 14) + ' ' + (cy + 4) + '" fill="none" stroke="' + hc + '" stroke-width="9" stroke-linecap="round"/>';
  } else {
    /* 中分 */
    s += '<path d="M ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.18) + ' C ' + (cx - headRx - 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 4) + ' ' + (cy - headRy * 1.15) + ' ' + (cx + headRx + 3) + ' ' + (cy - headRy * 0.18) + ' C ' + (cx + headRx * 0.4) + ' ' + (cy - headRy * 0.52) + ' ' + (cx - headRx * 0.4) + ' ' + (cy - headRy * 0.52) + ' ' + (cx - headRx - 3) + ' ' + (cy - headRy * 0.18) + ' Z" fill="' + hc + '"/>';
    s += '<path d="M ' + cx + ' ' + (cy - headRy * 1.0) + ' C ' + (cx - 6) + ' ' + (cy - headRy * 0.6) + ' ' + (cx - headRx * 0.55) + ' ' + (cy - headRy * 0.34) + ' ' + (cx - headRx * 0.7) + ' ' + (cy - headRy * 0.1) + '" fill="none" stroke="' + hc + '" stroke-width="6" stroke-linecap="round"/>';
    s += '<path d="M ' + cx + ' ' + (cy - headRy * 1.0) + ' C ' + (cx + 6) + ' ' + (cy - headRy * 0.6) + ' ' + (cx + headRx * 0.55) + ' ' + (cy - headRy * 0.34) + ' ' + (cx + headRx * 0.7) + ' ' + (cy - headRy * 0.1) + '" fill="none" stroke="' + hc + '" stroke-width="6" stroke-linecap="round"/>';
  }

  /* --- 侧发 --- */
  var strandLen = (hair === "long") ? 128 : (hair === "bob") ? 58 : (hair === "curly") ? 34 : 30;
  var strandW = (hair === "short") ? 10 : 13;
  s += '<path d="M ' + (cx - headRx - 2) + ' ' + (cy + 6) + ' C ' + (cx - headRx - 8) + ' ' + (cy + 60) + ' ' + (cx - headRx - 5) + ' ' + (cy + 60) + ' ' + (cx - headRx - 2) + ' ' + (cy + 6 + strandLen) + '" fill="none" stroke="' + hc + '" stroke-width="' + strandW + '" stroke-linecap="round"/>';
  s += '<path d="M ' + (cx + headRx + 2) + ' ' + (cy + 6) + ' C ' + (cx + headRx + 8) + ' ' + (cy + 60) + ' ' + (cx + headRx + 5) + ' ' + (cy + 60) + ' ' + (cx + headRx + 2) + ' ' + (cy + 6 + strandLen) + '" fill="none" stroke="' + hc + '" stroke-width="' + strandW + '" stroke-linecap="round"/>';
  if (hair === "curly") {
    s += '<circle cx="' + (cx - headRx - 2) + '" cy="' + (cy + 10 + strandLen) + '" r="9" fill="' + hc + '"/>';
    s += '<circle cx="' + (cx + headRx + 2) + '" cy="' + (cy + 10 + strandLen) + '" r="9" fill="' + hc + '"/>';
  }

  /* --- 五官 --- */
  var ex = headRx * 0.44, ey = cy + 8;
  var browLift = -3 - browW * 7;   /* 眉形：平直 ↔ 弯挑 */
  s += '<path d="M ' + (cx - ex - 6) + ' ' + (ey - 13) + ' Q ' + (cx - ex) + ' ' + (ey - 13 + browLift) + ' ' + (cx - ex + 6) + ' ' + (ey - 13 + (browW > 0.6 ? browLift * 0.4 : 0)) + '" fill="none" stroke="' + _shade(hc, -20) + '" stroke-width="2" stroke-linecap="round"/>';
  s += '<path d="M ' + (cx + ex + 6) + ' ' + (ey - 13) + ' Q ' + (cx + ex) + ' ' + (ey - 13 + browLift) + ' ' + (cx + ex - 6) + ' ' + (ey - 13 + (browW > 0.6 ? browLift * 0.4 : 0)) + '" fill="none" stroke="' + _shade(hc, -20) + '" stroke-width="2" stroke-linecap="round"/>';
  s += '<ellipse cx="' + (cx - ex) + '" cy="' + ey + '" rx="' + eyeR + '" ry="' + (eyeR * 1.25) + '" fill="' + eyeColor + '"/>';
  s += '<ellipse cx="' + (cx + ex) + '" cy="' + ey + '" rx="' + eyeR + '" ry="' + (eyeR * 1.25) + '" fill="' + eyeColor + '"/>';
  s += '<circle cx="' + (cx - ex - eyeR * 0.3) + '" cy="' + (ey - eyeR * 0.35) + '" r="' + Math.max(1.3, eyeR * 0.28) + '" fill="#fff"/>';
  s += '<circle cx="' + (cx + ex - eyeR * 0.3) + '" cy="' + (ey - eyeR * 0.35) + '" r="' + Math.max(1.3, eyeR * 0.28) + '" fill="#fff"/>';
  /* 嘴型：抿嘴 ↔ 开心笑 */
  var mouthY = cy + headRy * 0.55, mouthDepth = 2 + mouthW * 7;
  if (mouthW > 0.72) {
    s += '<path d="M ' + (cx - 6) + ' ' + mouthY + ' Q ' + cx + ' ' + (mouthY + mouthDepth) + ' ' + (cx + 6) + ' ' + mouthY + ' Z" fill="#c96a6a"/>';
  } else {
    s += '<path d="M ' + (cx - 5) + ' ' + mouthY + ' Q ' + cx + ' ' + (mouthY + mouthDepth) + ' ' + (cx + 5) + ' ' + mouthY + '" fill="none" stroke="#c96a6a" stroke-width="2.2" stroke-linecap="round"/>';
  }
  /* 腮红 */
  var blushOp = (0.1 + blush * 0.5).toFixed(2);
  s += '<ellipse cx="' + (cx - headRx * 0.62) + '" cy="' + (cy + 16) + '" rx="6.5" ry="3.5" fill="#ff9b9b" opacity="' + blushOp + '"/>';
  s += '<ellipse cx="' + (cx + headRx * 0.62) + '" cy="' + (cy + 16) + '" rx="6.5" ry="3.5" fill="#ff9b9b" opacity="' + blushOp + '"/>';

  if (glasses) {
    s += '<circle cx="' + (cx - ex) + '" cy="' + ey + '" r="' + (eyeR + 4.5) + '" fill="rgba(180,220,255,.08)" stroke="#dfe9f5" stroke-width="2"/>';
    s += '<circle cx="' + (cx + ex) + '" cy="' + ey + '" r="' + (eyeR + 4.5) + '" fill="rgba(180,220,255,.08)" stroke="#dfe9f5" stroke-width="2"/>';
    s += '<line x1="' + (cx - ex + eyeR + 4.5) + '" y1="' + ey + '" x2="' + (cx + ex - eyeR - 4.5) + '" y2="' + ey + '" stroke="#dfe9f5" stroke-width="2"/>';
    s += '<line x1="' + (cx - ex - eyeR - 4.5) + '" y1="' + ey + '" x2="' + (cx - headRx - 4) + '" y2="' + ey + '" stroke="#dfe9f5" stroke-width="1.6"/>';
    s += '<line x1="' + (cx + ex + eyeR + 4.5) + '" y1="' + ey + '" x2="' + (cx + headRx + 4) + '" y2="' + ey + '" stroke="#dfe9f5" stroke-width="1.6"/>';
  }

  s += '</g></svg>';
  return s;
}

/* 默认用户形象参数 */
function defaultAvatar() {
  return { hair: "long", hairColor: "#2e2a33", skin: "#f0d4bd", cloth: "#58a6e8", glasses: false, faceW: 0.5, eyeW: 0.5, height: 163, weight: 59, bangs: "full", eyeColor: "#2b3038", browW: 0.5, mouthW: 0.5, blush: 0.3, outfit: "casual" };
}

/* 一句话描述 → 形象初稿（关键词匹配，非 AI） */
function matchAvatarFromText(text) {
  var a = defaultAvatar();
  text = text || "";
  if (/长发|长头发/.test(text)) a.hair = "long";
  else if (/齐肩|中发/.test(text)) a.hair = "bob";
  else if (/短发|短头发/.test(text)) a.hair = "short";
  else if (/卷发|卷|烫/.test(text)) a.hair = "curly";
  else if (/双马尾|两个马尾/.test(text)) a.hair = "twin";
  else if (/丸子|团子|包子头/.test(text)) a.hair = "bun";
  else if (/马尾|扎头发/.test(text)) a.hair = "pony";
  if (/中分|无刘海/.test(text)) a.bangs = "none";
  else if (/斜刘海/.test(text)) a.bangs = "side";
  else if (/刘海/.test(text)) a.bangs = "full";
  if (/黑发|黑头发|黑长直/.test(text)) a.hairColor = "#2e2a33";
  else if (/棕|咖啡色/.test(text)) a.hairColor = "#463227";
  else if (/金|亚麻/.test(text)) a.hairColor = "#b9a06a";
  else if (/红发|栗红|酒红/.test(text)) a.hairColor = "#9c5a45";
  else if (/紫发|雾紫/.test(text)) a.hairColor = "#6a4a8a";
  else if (/蓝发|蓝头发|挑染/.test(text)) a.hairColor = "#3f6fae";
  if (/很白|白皙|冷白/.test(text)) a.skin = "#f6e3d4";
  else if (/小麦|健康肤色|偏黑/.test(text)) a.skin = "#e0b89a";
  else if (/黑皮|深肤/.test(text)) a.skin = "#c58e6d";
  if (/蓝眼|蓝瞳/.test(text)) a.eyeColor = "#4a6fb0";
  else if (/绿眼|绿瞳/.test(text)) a.eyeColor = "#4e8a5a";
  else if (/紫眼|紫瞳/.test(text)) a.eyeColor = "#8a5aa0";
  else if (/棕眼|棕瞳/.test(text)) a.eyeColor = "#5a4632";
  else if (/琥珀/.test(text)) a.eyeColor = "#b0604a";
  if (/眼镜|戴镜|四眼/.test(text)) a.glasses = true;
  if (/圆脸|宽脸/.test(text)) a.faceW = 0.85;
  if (/瘦脸|窄脸|小脸/.test(text)) a.faceW = 0.15;
  if (/大眼/.test(text)) a.eyeW = 0.9;
  if (/小眼|细眼/.test(text)) a.eyeW = 0.1;
  if (/眉毛淡|平眉/.test(text)) a.browW = 0.1;
  if (/挑眉|弯眉/.test(text)) a.browW = 0.85;
  if (/笑起来|爱笑|笑眼/.test(text)) { a.mouthW = 0.85; a.blush = 0.6; }
  if (/腮红|脸红/.test(text)) a.blush = 0.8;
  if (/连衣裙|裙子|裙装/.test(text)) a.outfit = "dress";
  else if (/运动服|运动装/.test(text)) a.outfit = "sport";
  var m = text.match(/(\d{2,3})\s*(?:cm|厘米)?\s*[\/·]?\s*(\d{2,3})\s*(?:kg|公斤|斤)?/);
  if (m) {
    var hv = parseInt(m[1], 10), wv = parseInt(m[2], 10);
    if (hv >= 130 && hv <= 210) a.height = hv;
    if (wv >= 30 && wv <= 160) a.weight = wv > 90 ? 90 : wv;
  }
  if (/蓝衣|穿蓝|蓝色/.test(text)) a.cloth = "#58a6e8";
  else if (/白衣|白裙|白色/.test(text)) a.cloth = "#e8eef5";
  else if (/黑衣|黑色/.test(text)) a.cloth = "#39404e";
  else if (/紫/.test(text)) a.cloth = "#9a8ad0";
  else if (/粉/.test(text)) a.cloth = "#e8a8b8";
  else if (/绿衣|绿色/.test(text)) a.cloth = "#57e0a6";
  else if (/黄衣|黄色/.test(text)) a.cloth = "#e8b86a";
  return a;
}

/* ============ 界面色彩主题（12 套 · 纯 CSS 变量切换，无 AI 参与） ============ */
const UI_THEMES = [
  { id: "tech",   name: "冰蓝科技", tag: "默认 · 冷色未来", dots: ["#5cc8ff", "#070b13", "#57e0a6"], meta: "#070b13" },
  { id: "aurora", name: "极光紫",   tag: "星域 · 幻彩深邃", dots: ["#b89aff", "#0a0914", "#6fe3b8"], meta: "#0a0914" },
  { id: "cute",   name: "奶桃可爱", tag: "浅色 · 软糖甜心", dots: ["#ff9db8", "#fdf2f4", "#4ecf9a"], meta: "#fdf2f4" },
  { id: "ink",    name: "古风黛青", tag: "浅色 · 宣纸雅致", dots: ["#3d7a78", "#f3f0e6", "#c08a3e"], meta: "#f3f0e6" },
  { id: "clash",  name: "撞色霓虹", tag: "高饱 · 玫红对撞", dots: ["#ff3d9a", "#101014", "#b6f04a"], meta: "#101014" },
  { id: "vogue",  name: "黑金时尚", tag: "轻奢 · 香槟金调", dots: ["#d4af6e", "#0c0c0e", "#b5c98e"], meta: "#0c0c0e" },
  { id: "cyber",  name: "赛博朋克", tag: "暗夜 · 霓虹机能", dots: ["#ff3fb4", "#0a0714", "#00e5d0"], meta: "#0a0714" },
  { id: "sunset", name: "日落余温", tag: "暖色 · 橘粉暮色", dots: ["#ff9a5c", "#140b06", "#ffd36b"], meta: "#140b06" },
  { id: "forest", name: "森系苔原", tag: "自然 · 深绿静谧", dots: ["#7ac48f", "#0a120c", "#c8e06b"], meta: "#0a120c" },
  { id: "mint",   name: "薄荷清风", tag: "浅色 · 清新透气", dots: ["#3ecfa0", "#eef7f2", "#5ab6e8"], meta: "#eef7f2" },
  { id: "sakura", name: "樱花初雪", tag: "浅色 · 粉紫梦境", dots: ["#e88ab8", "#f7f3fa", "#9a8ad0"], meta: "#f7f3fa" },
  { id: "snow",   name: "极简雪境", tag: "浅色 · 素净留白", dots: ["#5a7aa8", "#f5f6f8", "#8a9ab0"], meta: "#f5f6f8" }
];

function applyTheme(id) {
  var th = UI_THEMES.find(function (t) { return t.id === id; }) || UI_THEMES[0];
  try {
    if (document.body && document.body.setAttribute) document.body.setAttribute("data-theme", th.id);
    if (document.querySelector) {
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", th.meta);
    }
  } catch (e) { }
  return th.id;
}
