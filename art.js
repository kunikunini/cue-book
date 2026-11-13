'use strict';
/* 巻ごとのヘッダー図版。画像ファイルではなく SVG をその場で組む（紙／夜の表示と、巻の色にそのまま合う）。
   色は index.html の .art の CSS（i=墨 s=特色 r=罫 fi/fs/fp=塗り）で決まる。 */
(() => {
  const W = 1200, H = 280, f = n => Math.round(n * 10) / 10;
  const L = (x1, y1, x2, y2, c = 'r', a = '') => `<line class="${c}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${a}/>`;
  const T = (x, y, t, c = 'lab', a = '') => `<text class="${c}" x="${f(x)}" y="${f(y)}" ${a}>${t}</text>`;
  const svg = (b, body) => `<svg data-b="${b}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const pad2 = n => String(n).padStart(2, '0');

  /* 01 文字：1文字ずつ遅れて定位置に入る。右は緩急の曲線 */
  function ae() {
    let o = '';
    const base = 206, fs = 150, cap = base - fs * 0.73, xh = base - fs * 0.47;
    [[cap, 'CAP HEIGHT'], [xh, 'X-HEIGHT'], [base, 'BASELINE']].forEach(([y, t]) => { o += L(0, y, 925, y) + T(6, y - 6, t); });
    const word = 'ANIMATE'.split(''), x0 = 150, step = 112;
    word.forEach((ch, i) => {
      const k = Math.max(0, (i - 2) / 4), e = Math.pow(k, 1.5), dy = e * 64, rot = -e * 13, x = x0 + i * step;
      o += `<rect class="r" x="${x - 50}" y="${f(cap)}" width="100" height="${f(base - cap)}"/>`;
      o += L(x - 50, cap - 7, x - 50, cap + 7, 'i') + L(x - 57, cap, x - 43, cap, 'i');
      for (let g = 3; g >= 1; g--) if (dy > 6) o += T(x, base + dy + g * 13, ch, 'big fi', `opacity="${f(0.05 * (4 - g))}" transform="rotate(${f(rot - g * 3)} ${x} ${base})"`);
      o += T(x, base + dy, ch, i === word.length - 1 ? 'big s' : 'big fi', `opacity="${f(i === word.length - 1 ? 1 : 1 - e * 0.55)}" transform="rotate(${f(rot)} ${x} ${base})"`);
      o += T(x, 246, pad2(i + 1), 'lab mid');
    });
    /* 範囲セレクター：ここまでが定位置 */
    const sx = x0 + 2.4 * step;
    o += L(sx, 34, sx, 262, 's', 'stroke-width="1.6"') + `<path class="fs" d="M${sx - 8} 28h16l-8 12z"/>` + T(sx + 12, 40, 'RANGE SELECTOR', 'lab sp');
    /* 緩急のグラフ */
    const gx = 962, gy = 40, gs = 200;
    for (let i = 0; i <= 4; i++) o += L(gx + i * gs / 4, gy, gx + i * gs / 4, gy + gs) + L(gx, gy + i * gs / 4, gx + gs, gy + i * gs / 4);
    o += `<path class="s" stroke-width="2.6" d="M${gx} ${gy + gs}C${gx + 84} ${gy + gs} ${gx + 96} ${gy} ${gx + gs} ${gy}"/>`;
    o += L(gx, gy + gs, gx + 84, gy + gs, 'i') + L(gx + gs, gy, gx + 96, gy, 'i') + `<circle class="fp i" cx="${gx + 84}" cy="${gy + gs}" r="5"/><circle class="fp i" cx="${gx + 96}" cy="${gy}" r="5"/>`;
    o += `<circle class="fs" cx="${gx}" cy="${gy + gs}" r="5"/><circle class="fs" cx="${gx + gs}" cy="${gy}" r="5"/>` + T(gx, gy + gs + 22, 'EASE', 'lab') + T(gx + gs, gy + gs + 22, 'TIME', 'lab end');
    return svg('ae', o);
  }

  /* 02 動き：軌跡と残像、四角から円へ、トリムされた弧 */
  function mg() {
    let o = '';
    for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) o += `<circle class="fr" cx="${x}" cy="${y}" r="1.1"/>`;
    const P = [[50, 224], [210, 224], [250, 62], [450, 62]];
    const bz = t => { const u = 1 - t; return [0, 1].map(j => u * u * u * P[0][j] + 3 * u * u * t * P[1][j] + 3 * u * t * t * P[2][j] + t * t * t * P[3][j]); };
    o += `<path class="i" stroke-dasharray="3 5" d="M${P[0]}C${P[1]} ${P[2]} ${P[3]}"/>`;
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n, e = t * t * (3 - 2 * t), [x, y] = bz(e);
      o += i === n ? `<circle class="fs" cx="${f(x)}" cy="${f(y)}" r="24"/>` : `<circle class="i" cx="${f(x)}" cy="${f(y)}" r="24" opacity="${f(0.12 + 0.6 * t)}"/>`;
      o += L(50 + t * 400, 256, 50 + t * 400, 264, 'i') + L(50 + e * 400, 244, 50 + e * 400, 252, 's', 'stroke-width="1.6"');
    }
    o += T(50, 276, 'TIME', 'lab') + T(450, 276, 'EASE IN-OUT', 'lab end');
    /* 四角が回りながら円になる */
    const m = 6;
    for (let i = 0; i < m; i++) {
      const t = i / (m - 1), s = 46 + t * 14, x = 545 + i * 66, y = 112;
      o += `<rect class="${i === m - 1 ? 'fi' : 'i'}" x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(t * s / 2)}" transform="rotate(${f(t * 90)} ${x} ${y})" stroke-width="1.4"/>`;
    }
    o += L(520, 168, 900, 168, 'i');
    for (let i = 0; i < 39; i++) { const t = i / 38, h = 6 + 62 * Math.exp(-Math.pow((t - 0.5) / 0.2, 2)); o += `<rect class="${Math.abs(t - 0.5) < 0.04 ? 'fs' : 'fi'}" x="${f(522 + i * 9.8)}" y="176" width="4" height="${f(h)}"/>`; }
    o += T(900, 160, 'SPEED', 'lab end');
    /* トリムパス */
    const cx = 1058, cy = 140;
    const arc = (r, a0, a1, c, w) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(f); return `<path class="${c}" stroke-width="${w}" stroke-linecap="round" d="M${p(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}"/>`; };
    [[30, -1.2, 3.4], [48, 0.3, 4.9], [66, -2.6, 1.1], [84, 1.0, 5.3], [102, -0.4, 2.2]].forEach(([r, a, b], i) => { o += `<circle class="r" cx="${cx}" cy="${cy}" r="${r}"/>` + arc(r, a, b, i === 2 ? 's' : 'i', i === 2 ? 5 : 2.2); });
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; o += L(cx + 114 * Math.cos(a), cy + 114 * Math.sin(a), cx + (i % 2 ? 122 : 130) * Math.cos(a), cy + (i % 2 ? 122 : 130) * Math.sin(a), 'i'); }
    o += `<circle class="fs" cx="${cx}" cy="${cy}" r="7"/>`;
    return svg('mg', o);
  }

  /* 03 声：波形の一部を角かっこのタグで囲む */
  function vo() {
    let o = '';
    const n = 150, mid = 138, x = i => 18 + i * 7.8;
    const env = t => [[0.16, 0.07, 0.75], [0.5, 0.09, 1], [0.82, 0.06, 0.62]].reduce((a, [c, w, h]) => a + h * Math.exp(-Math.pow((t - c) / w, 2)), 0);
    o += L(0, mid, W, mid);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), wob = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.61 + 1)), h = Math.max(2, (0.05 + 0.95 * env(t)) * wob * 84), sp = i >= 60 && i <= 89;
      o += `<rect class="${sp ? 'fs' : 'fi'}" x="${f(x(i))}" y="${f(mid - h)}" width="3.6" height="${f(h * 2)}" rx="1.8"/>`;
    }
    const bl = x(60) - 12, br = x(89) + 16;
    o += `<path class="s" stroke-width="3.4" d="M${bl + 16} 34H${bl}V242h16M${br - 16} 34H${br}V242h-16"/>`;
    o += T((bl + br) / 2, 26, '[whispers]', 'tag fs mid');
    [[0.16, '[laughs]'], [0.82, '[excited]']].forEach(([t, s]) => { const xx = 18 + t * (n - 1) * 7.8; o += L(xx, 40, xx, 60, 'i') + T(xx, 32, s, 'tag fi2 mid'); });
    for (let i = 0; i <= 60; i++) { const xx = 18 + i * 19.4; o += L(xx, 262, xx, i % 5 ? 268 : 274, 'i'); if (i % 10 === 0) o += T(xx + 5, 276, `0:${pad2(i / 10 * 2)}`, 'lab'); }
    return svg('vo', o);
  }

  /* 04 フォント：書体の骨格の線、太さの段階、書体ちがいの見本 */
  function ft() {
    let o = '';
    const base = 206, fs = 200;
    [[base - fs * 0.74, 'ASCENDER'], [base - fs * 0.67, 'CAP HEIGHT'], [base - fs * 0.45, 'X-HEIGHT'], [base, 'BASELINE'], [base + fs * 0.22, 'DESCENDER']].forEach(([y, t], i) => { o += L(0, y, 800, y, i === 3 ? 'i' : 'r') + T(6, y - 5, t); });
    o += T(120, base, 'R', 'huge i', 'stroke-width="1.5"') + T(250, base, 'a', 'huge fs') + T(356, base, 'g', 'huge i', 'stroke-width="1.5"');
    [120, 250, 356, 462].forEach(xx => { o += L(xx, 40, xx, 262, 'r', 'stroke-dasharray="2 4"'); });
    /* 太さ 100〜900 */
    let xx = 500; const top = base - fs * 0.67;
    [2, 5, 8, 12, 16, 21, 26, 31, 37].forEach((w, i) => { o += `<rect class="${i === 3 ? 'fs' : 'fi'}" x="${xx}" y="${f(top)}" width="${w}" height="${f(base - top)}"/>` + (i === 0 || i === 3 || i === 8 ? T(xx + w / 2, base + 18, (i + 1) * 100, 'lab mid') : ''); xx += w + 15; });
    /* 書体ちがい */
    const fam = ['var(--serif)', 'var(--sans)', 'var(--mono)', 'cursive', 'Georgia,serif', 'Impact,var(--sans)', 'var(--num)', '"Courier New",monospace'];
    fam.forEach((ff, i) => {
      const c = i % 4, r = (i / 4) | 0, x = 838 + c * 88, y = 54 + r * 88, on = i === 5;
      o += `<rect class="${on ? 'fs' : 'i'}" x="${x}" y="${y}" width="80" height="80"/>` + T(x + 40, y + 52, 'Aa', on ? 'aa fp' : 'aa fi', `style="font-family:${ff}${i === 4 ? ';font-style:italic' : ''}"`) + T(x + 5, y + 12, pad2(i + 1), on ? 'lab fp' : 'lab');
    });
    return svg('ft', o);
  }

  const el = document.getElementById('art');
  if (el) el.innerHTML = ae() + mg() + vo() + ft();
})();
