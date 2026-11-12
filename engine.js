'use strict';
/* 文字アニメーターの再現エンジン（Canvas 2D）。
   AEの「テキストアニメーター＋範囲セレクター」を、文字ごとの位置・スケール・回転・不透明度・ブラー・字間・3D回転に落として描く。 */
const W = 320, H = 180, CX = W / 2, CY = H / 2, TAU = Math.PI * 2, D2R = Math.PI / 180;
const FG = '#f3efe6';
const cl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a + (b - a) * t;
const fr = x => x - Math.floor(x);
const S = x => Math.sin(TAU * x), Cs = x => Math.cos(TAU * x);
const sst = (a, b, x) => { x = cl((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
/* t について周期1のなめらかな乱れ（-1〜1くらい） */
const nz = (k, t) => (S(t + hash(k)) + 0.6 * S(2 * t + hash(k + 9.1)) + 0.4 * S(3 * t + hash(k + 3.7))) / 2;
/* 左→右へ流れる波。u=文字の位置(0〜1) w=1文字が動く時間の割合 sp=端から端までの遅れ */
const wv = (u, t, w = 0.3, sp = 0.6) => { const x = fr(t - u * sp); return x < w ? Math.sin(Math.PI * x / w) : 0; };
const wq = (u, t, w = 0.3, sp = 0.6) => { const x = fr(t - u * sp); return x < w ? x / w : 1; };
const EZ = {
  lin: x => x,
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  io: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: x => { const c = 2.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  bounce: x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; },
  el: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * TAU / 3) + 1),
  exp: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  step: x => Math.min(1, Math.round(x * 5) / 5),
};
const EZ_JA = { lin: '等速', out: 'イーズアウト（最後にゆっくり）', in: 'イーズイン（だんだん速く）', io: 'イーズイン・アウト', back: 'オーバーシュート（行きすぎて戻る）', bounce: 'バウンド（数回弾む）', el: '弾性（ばねのように震えて止まる）', exp: '急減速（一気に来てぴたっと止まる）', step: '段階的（カクカク）' };

const DEF_EN = [['Text Animation'], ['After Effects', 'Text Animation'], ['After Effects', 'Text Animation', 'Presets']];
const DEF_JA = [['文字 アニメーション'], ['アフター エフェクト', '文字 アニメーション'], ['アフター エフェクト', '文字 アニメーション', 'プリセット 見本帳']];
let LANG = 'ja';
const Lx = (ja, en) => (LANG === 'en' ? en : ja);
const POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?';
const SANS = '"Helvetica Neue", Helvetica, Arial, "Hiragino Sans", "Noto Sans JP", sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const layCache = new Map();
function layout(ctx, lines, fs, mono) {
  const key = (mono ? 'm' : 's') + fs + '|' + lines.join('\n');
  let L = layCache.get(key);
  if (L) return L;
  const fontOf = s => `700 ${s}px ${mono ? MONO : SANS}`;
  ctx.font = fontOf(fs);
  const maxW = Math.max(1, ...lines.map(l => ctx.measureText(l).width));
  if (maxW > W - 30) { fs = fs * (W - 30) / maxW; ctx.font = fontOf(fs); }
  const lh = fs * 1.28, g = [];
  let ci = 0, wi = 0, width = 0;
  lines.forEach((line, li) => {
    const chars = [...line], ws = chars.map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0);
    width = Math.max(width, tot);
    let x = -tot / 2, inW = false;
    const y = (li - (lines.length - 1) / 2) * lh;
    chars.forEach((ch, k) => {
      if (ch === ' ' || ch === '　') { if (inW) { wi++; inW = false; } }
      else { inW = true; g.push({ ch, w: ws[k], gx: x + ws[k] / 2, gy: y, i: ci++, wi, li }); }
      x += ws[k];
    });
    if (inW) wi++;
  });
  g.forEach(q => { q.n = ci; q.nw = Math.max(1, wi); q.nl = lines.length; q.u = ci > 1 ? q.i / (ci - 1) : 0.5; q.r = hash(q.i * 7.3 + 1); q.r2 = hash(q.i * 3.1 + 5); q.r3 = hash(q.i * 11.7 + 2); });
  L = { g, fs, font: fontOf(fs), width, lh, nl: lines.length };
  if (layCache.size > 600) layCache.clear();
  layCache.set(key, L);
  return L;
}

const permCache = new Map();
function perm(N, seed) {
  const key = N + ':' + seed;
  let p = permCache.get(key);
  if (!p) { p = [...Array(N).keys()]; for (let i = N - 1; i > 0; i--) { const j = Math.floor(hash(i * 13.7 + seed * 91.3) * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } permCache.set(key, p); }
  return p;
}
let lastK = 0;
/* 範囲セレクター。返り値 1=まだ変化したまま（離れている） 0=定位置 */
function amt(A, g, p) {
  const u = A.u || 'c';
  let k, N;
  if (u === 'c') { k = g.i; N = g.n; } else if (u === 'w') { k = g.wi; N = g.nw; } else if (u === 'l') { k = g.li; N = g.nl; } else { k = 0; N = 1; }
  lastK = k;
  const ord = A.ord || 'f';
  if (ord === 'b') k = N - 1 - k;
  else if (ord === 'r') k = perm(N, A.seed || 1)[k];
  else if (ord === 'c' || ord === 'e') { const m = (N - 1) / 2 || 1, d = Math.abs(k - (N - 1) / 2) / m; k = (ord === 'c' ? d : 1 - d) * (N - 1); }
  const soft = A.soft == null ? 0.5 : A.soft;
  if (soft <= 0) return p * N > k ? 0 : 1;
  const uu = N > 1 ? k / (N - 1) : 0;
  return cl(1 - (p * (1 + soft) - uu) / soft);
}
const rsign = (k, key) => (hash(k * 17.3 + key.charCodeAt(0) * 3.1 + key.length) < 0.5 ? -1 : 1) * (0.45 + 0.55 * hash(k * 5.7 + key.charCodeAt(0)));
const ADD = { x: 1, y: 1, r: 1, s: 1, sx: 1, sy: 1, b: 1, bx: 1, tr: 1, rx: 1, ry: 1, z: 1, sk: 1, c: 1, st: 1, gl: 1 };
function merge(o, r) {
  if (!r) return;
  for (const k in r) { const v = r[k]; if (v == null) continue; if (k === 'a') o.a *= v; else if (ADD[k]) o[k] += v; else o[k] = v; }
}
function calc(c, g, t, sec, pin, pout) {
  const o = { x: 0, y: 0, r: 0, s: 0, sx: 0, sy: 0, a: 1, b: 0, bx: 0, tr: 0, rx: 0, ry: 0, z: 0, sk: 0, c: 0, st: 0, gl: 0, ay: c.ay || 0 };
  if (c.m === 'loop') { if (c.fn) merge(o, c.fn(g, t, sec)); return o; }
  const outPhase = c.m === 'out' || (c.m === 'io' && t >= 0.5);
  const list = c.an ? [c, ...c.an] : [c];
  for (let A of list) {
    if (outPhase && A.out) A = Object.assign({}, A, A.out);
    const v = outPhase ? 1 - amt(A, g, pout) : amt(A, g, pin), k = lastK;
    const e = outPhase ? EZ[A.eo || 'in'](v) : 1 - EZ[A.e || 'out'](1 - v);
    const fade = A.of ? cl((v - 0.6) / 0.4) : v;
    if (A.cf) {
      const r = A.cf(1 - e, g, v);
      merge(o, r);
      if (r.a == null && A.o !== 0) o.a *= 1 - fade;
    } else {
      const P = A.p || {}, flip = A.alt && k % 2;
      for (const key in P) {
        if (key === 'o' || key === 'ch') continue;
        let val = P[key] * e;
        if (A.rn && (' ' + A.rn + ' ').includes(' ' + key + ' ')) val *= rsign(k, key);
        if (flip && (key === 'x' || key === 'y' || key === 'r')) val = -val;
        o[key] += val;
      }
      o.a *= cl(1 + (P.o != null ? P.o : A.o != null ? A.o : -1) * fade);
      if (P.ch && v > 0.03) o.ch = 1;
    }
  }
  return o;
}

const HAS_FILTER = (() => { try { return 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; } })();
function drawGlyph(ctx, g, p, fs, sec, dpr, mir) {
  let a = cl(p.a);
  if (mir) a *= 0.2;
  if (a <= 0.004) return;
  let x = (g.gx + (p.tx || 0)) * (1 - p.c) + p.x, y = g.gy * (1 - p.c) + p.y;
  const sc = 1 + p.s;
  let sx = sc * (1 + p.sx), sy = sc * (1 + p.sy);
  if (p.z) { const d = 400 - p.z; if (d <= 8) return; const f = 400 / d; x *= f; y *= f; sx *= f; sy *= f; }
  if (p.ry) sx *= Math.cos(p.ry * D2R);
  if (p.rx) sy *= Math.cos(p.rx * D2R);
  if (Math.abs(sx) < 0.002 || Math.abs(sy) < 0.002) return;
  if (mir) { y = 2 * (g.gy + fs * 0.4) - y; sy = -sy; }
  if (Math.abs(x) > 2000 || Math.abs(y) > 2000) return;
  ctx.save();
  ctx.translate(CX + x, CY + y);
  const ay = p.ay * fs * (mir ? -1 : 1);
  if (ay) ctx.translate(0, ay);
  if (p.r) ctx.rotate(p.r * D2R * (mir ? -1 : 1));
  if (p.sk) ctx.transform(1, 0, Math.tan(cl(p.sk, -75, 75) * D2R), 1, 0, 0);
  ctx.scale(sx, sy);
  if (ay) ctx.translate(0, -p.ay * fs);
  ctx.globalAlpha = a;
  const bg = p.bg;
  if (bg && !mir) {
    ctx.save();
    ctx.globalAlpha = a * (bg.a == null ? 1 : cl(bg.a));
    ctx.fillStyle = bg.col || '#fff';
    const bs = bg.s == null ? 1 : bg.s;
    if (bs > 0.01) {
      if (bg.k === 'c') { ctx.beginPath(); ctx.arc(0, 0, fs * 0.58 * bs, 0, TAU); ctx.fill(); }
      else { const bw = (g.w + 2) * (bg.w || 1) * bs, bh = fs * 1.16 * (bg.h || 1) * bs; ctx.fillRect(-bw / 2, -bh / 2 + (bg.dy || 0) * fs, bw, bh); }
    }
    ctx.restore();
  }
  const ch = p.ch ? (typeof p.ch === 'string' ? p.ch : POOL[Math.floor(hash(g.i * 13.1 + Math.floor(sec * 16) * 7.7) * POOL.length)]) : g.ch;
  const col = p.col || FG;
  ctx.fillStyle = col;
  if (p.sh) { ctx.shadowColor = p.sh.c || 'rgba(0,0,0,.8)'; ctx.shadowBlur = (p.sh.b || 0) * dpr; ctx.shadowOffsetX = (p.sh.x || 0) * dpr; ctx.shadowOffsetY = (p.sh.y || 0) * dpr; }
  else if (p.gl > 0.2) { ctx.shadowColor = p.glc || col; ctx.shadowBlur = p.gl * dpr; }
  let soft = 0;
  if (p.b > 0.25) { if (HAS_FILTER) ctx.filter = `blur(${(p.b * dpr).toFixed(2)}px)`; else soft = p.b; }
  const put = (dx, dy) => { if (!p.nf) ctx.fillText(ch, dx, dy); if (p.st > 0.05) { ctx.lineWidth = p.st / Math.max(0.2, Math.abs(sc)); ctx.strokeStyle = p.stc || FG; ctx.lineJoin = 'round'; ctx.strokeText(ch, dx, dy); } };
  if (p.bx > 0.5) { const n = 7; ctx.globalAlpha = a * 0.3; for (let k = 0; k < n; k++) put(((k / (n - 1)) - 0.2) * p.bx / Math.abs(sx || 1), 0); }
  else if (soft) { ctx.globalAlpha = a * 0.16; for (let k = 0; k < 8; k++) put(Math.cos(k * TAU / 8) * soft * 0.6 / Math.abs(sx), Math.sin(k * TAU / 8) * soft * 0.6 / Math.abs(sy)); }
  else put(0, 0);
  ctx.restore();
}

function linesFor(P, custom) {
  const c = P.cfg;
  if (c.text) return c.text;
  if (custom) return custom;
  const D = LANG === 'ja' ? DEF_JA : DEF_EN;
  if (c.L === 3 || (c.u === 'l' && !c.L)) return D[2];
  if (c.u === 'w' || c.L === 2) return D[1];
  return D[0];
}

function renderPath(ctx, c, L, t, sec, dpr) {
  const NS = 180, U = 80, px = [], py = [], cum = [0];
  for (let k = 0; k <= NS; k++) { const q = c.path(k / NS, t); px.push(q[0] * U); py.push(q[1] * U); if (k) cum.push(cum[k - 1] + Math.hypot(px[k] - px[k - 1], py[k] - py[k - 1])); }
  const len = cum[NS], tw = L.width, mid = (len - tw) / 2, pm = c.pm || 'through';
  let m = 0, ga = 1;
  if (pm === 'through') m = mix(-tw - 6, len + 6, t);
  else if (pm === 'on') { m = mix(-tw - 6, mid, EZ.out(cl(t / 0.6))); ga = 1 - sst(0.9, 0.98, t); }
  else if (pm === 'off') { m = mix(mid, len + 6, EZ.in(cl((t - 0.3) / 0.55))); ga = sst(0, 0.06, t); }
  else if (pm === 'onoff') m = t < 0.5 ? mix(-tw - 6, mid, EZ.out(cl(t / 0.38))) : mix(mid, len + 6, EZ.in(cl((t - 0.6) / 0.38)));
  else if (pm === 'loop') m = t * len * (c.rev ? -1 : 1);
  else if (pm === 'pp') m = mix(0, len - tw, (1 - Cs(t)) / 2);
  else m = mid;
  if (c.af) ga *= c.af(t);
  ctx.save(); ctx.globalAlpha = 0.13; ctx.strokeStyle = FG; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath();
  for (let k = 0; k <= NS; k++) k ? ctx.lineTo(CX + px[k], CY + py[k]) : ctx.moveTo(CX + px[k], CY + py[k]);
  ctx.stroke(); ctx.restore();
  for (const g of L.g) {
    let d = m + g.gx + tw / 2;
    if (pm === 'loop') d = ((d % len) + len) % len; else if (d < 0 || d > len) continue;
    let lo = 0, hi = NS;
    while (hi - lo > 1) { const md = (lo + hi) >> 1; if (cum[md] <= d) lo = md; else hi = md; }
    const k = (d - cum[lo]) / ((cum[hi] - cum[lo]) || 1), x = mix(px[lo], px[hi], k), y = mix(py[lo], py[hi], k), ang = Math.atan2(py[hi] - py[lo], px[hi] - px[lo]);
    const e = c.pf ? c.pf(g, t) : null;
    ctx.save();
    ctx.globalAlpha = ga * (e && e.a != null ? e.a : 1);
    ctx.translate(CX + x, CY + y); ctx.rotate(ang); ctx.translate(0, -L.fs * 0.5 + (e && e.y || 0));
    if (e && e.r) ctx.rotate(e.r * D2R);
    if (e && e.s) ctx.scale(1 + e.s, 1 + e.s);
    ctx.fillStyle = FG; ctx.fillText(g.ch, 0, 0);
    ctx.restore();
  }
}

/* 1コマ描く。ctx は 320x180 の座標系に合わせてある前提 */
function renderPreset(ctx, P, sec, custom, dpr) {
  const c = P.cfg, T = c.T || 4, t = (sec % T) / T;
  ctx.clearRect(0, 0, W, H);
  if (c.m === 'custom') {
    /* 2冊目（モーショングラフィックス）：見本ごとの描画関数をそのまま呼ぶ。ループしないものは終わりを暗転でつなぐ */
    MG.sc = dpr || 1;
    ctx.save();
    try { c.draw(ctx, t, sec); } finally { ctx.restore(); }
    const a = c.lp ? 0 : sst(0.9, 0.99, t);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#0a0a0c'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    return;
  }
  let lines = c.txt ? [].concat(c.txt(t, sec)) : linesFor(P, custom);
  if (c.m === 'path') lines = [lines.join(' ')];
  const fs0 = c.fs || (c.m === 'path' ? 17 : lines.length >= 3 ? 24 : lines.length === 2 ? 27 : 30);
  const L = layout(ctx, lines, fs0, c.mono);
  ctx.font = L.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (c.bgf) { ctx.save(); c.bgf(ctx, t, L, sec); ctx.restore(); ctx.font = L.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
  if (c.m === 'path') { renderPath(ctx, c, L, t, sec, dpr); return; }
  let pin = 1, pout = 0, ga = 1;
  if (c.m === 'in') { pin = cl((t - 0.04) / (c.d || 0.5)); ga = 1 - sst(0.9, 0.98, t); }
  else if (c.m === 'out') { ga = sst(0, 0.06, t); pout = cl((t - 0.3) / (c.d || 0.5)); }
  else if (c.m === 'io') { pin = cl((t - 0.03) / 0.35); pout = cl((t - 0.6) / 0.35); }
  if (c.af) ga *= c.af(t);
  const G = L.g, PR = G.map(g => calc(c, g, t, sec, pin, pout));
  let any3d = false;
  for (let li = 0; li < L.nl; li++) {
    let tot = 0; const idx = [];
    G.forEach((g, i) => { if (g.li === li) { idx.push(i); tot += PR[i].tr; } });
    if (tot || idx.some(i => PR[i].tr)) { let acc = 0; for (const i of idx) { PR[i].tx = acc + PR[i].tr / 2 - tot / 2; acc += PR[i].tr; } }
  }
  const order = G.map((_, i) => i);
  for (const p of PR) { p.a *= ga; if (p.z) any3d = true; }
  if (any3d) order.sort((a, b) => PR[a].z - PR[b].z);
  if (c.refl) for (const i of order) drawGlyph(ctx, G[i], PR[i], L.fs, sec, dpr, true);
  for (const i of order) drawGlyph(ctx, G[i], PR[i], L.fs, sec, dpr, false);
  if (c.cur && G.length) {
    const N = G.length, shown = Math.min(N, Math.ceil(pin * N - 1e-6)), done = pin >= 1;
    const ref = shown < N ? G[shown] : G[N - 1], cx = shown < N ? ref.gx - ref.w / 2 : ref.gx + ref.w / 2;
    if (!done || fr(sec * 2) < 0.5) { ctx.save(); ctx.globalAlpha = ga; ctx.fillStyle = FG; ctx.textAlign = 'left'; ctx.fillText(c.cur, CX + cx + 1, CY + ref.gy); ctx.restore(); }
  }
  if (c.fgf) { ctx.save(); c.fgf(ctx, t, L, sec); ctx.restore(); }
}

