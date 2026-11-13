'use strict';
/* 4冊目：フォント。Google Fonts と Fontshare の無料フォントを、実際の書体で見本表示する。
   書体のファイルは、カードが画面に入ったときにだけ、それぞれの配布元から読み込む。 */
const FT = {
  sample: null, loaded: {}, asked: {}, queue: [], busy: 0,
  catJa: { Japanese: '日本語', 'Sans Serif': 'サンセリフ（ゴシック系）', Serif: 'セリフ（明朝系）', Display: 'ディスプレイ（見出し向け）', Handwriting: '手書き', Monospace: '等幅', Fontshare: 'Fontshare' },
  kJa: { 'Sans Serif': 'サンセリフ', Serif: 'セリフ', Display: 'ディスプレイ', Handwriting: '手書き', Monospace: '等幅', Sans: 'サンセリフ', Slab: 'スラブセリフ', Script: 'スクリプト', Handwritten: '手書き', Blackletter: 'ブラックレター' },
  kj: r => r.k.split(', ').map(x => FT.kJa[x] || x).join('・'),
  generic: r => (/Mono/.test(r.k) ? 'monospace' : /^(Serif|Slab)/.test(r.k) ? 'serif' : /Handwrit|Script/.test(r.k) ? 'cursive' : 'sans-serif'),
  /* 見本に使う太さ：400にいちばん近いもの */
  weight(r) { if (r.v && r.w.length === 2) return Math.max(r.w[0], Math.min(r.w[1], 400)); return (r.w.length ? r.w : [400]).reduce((a, b) => (Math.abs(b - 400) < Math.abs(a - 400) ? b : a)); },
  key: r => r.s + ':' + r.n,
  gname: r => encodeURIComponent(r.n).replace(/%20/g, '+'),
  cssUrl(r, all) {
    if (r.s === 'f') return `https://api.fontshare.com/v2/css?f[]=${r.slug}@${r.w.length ? (all ? r.w.join(',') : FT.weight(r)) : (r.v ? 1 : 400)}&display=swap`;
    const w = all ? (r.v && r.w.length === 2 ? `${r.w[0]}..${r.w[1]}` : (r.w.length ? r.w.join(';') : '400')) : FT.weight(r);
    return `https://fonts.googleapis.com/css2?family=${FT.gname(r)}:${r.o ? 'ital,wght@' + String(w).split(';').map(x => '1,' + x).join(';') : 'wght@' + w}&display=swap`;
  },
  page: r => (r.s === 'f' ? `https://www.fontshare.com/fonts/${r.slug}` : `https://fonts.google.com/specimen/${FT.gname(r)}`),
  text(r) { if (FT.sample && FT.sample.length) return FT.sample.slice(0, 2); return [r.j ? '文字の見本 あア永 Aa' : 'Hamburgefonstiv 123']; },
  /* 書体を配布元から読み込む（同時に6つまで） */
  need(r) {
    if (FT.asked[FT.key(r)]) return; FT.asked[FT.key(r)] = 1; FT.queue.push(r); FT.pump();
  },
  pump() {
    while (FT.busy < 6 && FT.queue.length) {
      const r = FT.queue.shift(); FT.busy++;
      const done = ok => { FT.busy--; FT.loaded[FT.key(r)] = ok ? 1 : -1; FT.pump(); };
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FT.cssUrl(r, false);
      l.onload = () => document.fonts.load(`${r.o ? 'italic ' : ''}${FT.weight(r)} 32px "${r.n}"`, FT.text(r).join('')).then(() => done(true), () => done(false));
      l.onerror = () => done(false);
      document.head.appendChild(l);
    }
  },
};
(() => {
  const ORDER = ['Japanese', 'Sans Serif', 'Serif', 'Display', 'Handwriting', 'Monospace', 'Fontshare'];
  const wText = (r, ja) => (r.v && r.w.length === 2 ? `${r.w[0]}〜${r.w[1]}`.replace('〜', ja ? '〜' : '–') + (ja ? '（可変）' : ' (variable)') : (r.w.length ? r.w.join(', ') : '400'));
  const src = r => (r.s === 'f' ? 'Fontshare' : 'Google Fonts');
  const drawOf = r => (c, t, s) => {
    const lines = FT.text(r), st = FT.loaded[FT.key(r)];
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (st !== 1) {
      if (!st) FT.need(r);
      c.fillStyle = '#7f7b73'; c.font = `500 13px ${SANS}`;
      c.fillText(st === -1 ? Lx('読み込めませんでした', 'Could not load') : r.n, CX, CY - 8);
      if (st !== -1) for (let k = 0; k < 3; k++) { c.globalAlpha = 0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(TAU * (s * 1.2 - k * 0.16))), 2); c.fillRect(CX - 14 + k * 12, CY + 12, 5, 5); }
      return;
    }
    const w = FT.weight(r), key = lines.join('\n');
    if (r._t !== key) { r._t = key; document.fonts.load(`${r.o ? 'italic ' : ''}${w} 32px "${r.n}"`, key).catch(() => {}); }
    let size = lines.length > 1 ? 34 : 44;
    c.font = `${r.o ? 'italic ' : ''}${w} ${size}px "${r.n}", ${SANS}`;
    const mw = Math.max(1, ...lines.map(l => c.measureText(l).width));
    if (mw > 292) { size = size * 292 / mw; c.font = `${r.o ? 'italic ' : ''}${w} ${size}px "${r.n}", ${SANS}`; }
    c.fillStyle = FG;
    lines.forEach((l, i) => c.fillText(l, CX, CY + (i - (lines.length - 1) / 2) * size * 1.25));
  };
  let num = 0;
  ORDER.forEach(cn => {
    const list = FONT_ROWS.filter(r => r.c === cn);
    if (!list.length) return;
    const ci = CATS.length, C0 = { name: cn, ja: FT.catJa[cn] || cn, list, book: 'ft', start: num + 1 };
    CATS.push(C0); CAT_EN.push(cn);
    list.forEach(r => {
      num++;
      if (r.s === 'f') r.w = r.w.filter(x => x > 1); /* Fontshare の「1」は可変版の印で、太さではない */
      r.k = r.k.split(',').map(x => x.trim()).filter(Boolean).join(', ');
      const kj = FT.kj(r);
      const p = { n: PRESETS.length + 1, num, id: 'FT-' + pad(num, 4), name: r.n, nameJa: r.n, cat: cn, catJa: C0.ja, catEn: cn, ci, book: 'ft', font: r,
        ja: `${kj}。太さ ${wText(r, true)}${r.i ? '。イタリックあり' : ''}${r.j ? '。日本語対応' : ''}。提供：${src(r)}`,
        en: `${r.k}. Weights ${wText(r, false)}${r.i ? '. Italics' : ''}${r.j ? '. Japanese' : ''}. From ${src(r)}` };
      p.cfg = { m: 'custom', lp: 1, T: 4, draw: drawOf(r) };
      PRESETS.push(p);
    });
    C0.end = num;
  });
  FT.count = num;
  /* AIに渡す文章：名前・分類・太さ・読み込み方・配布ページ */
  FT.prompt = p => {
    const r = p.font, g = r.s === 'g';
    return (LANG === 'ja' ? [
      `${p.id}「${r.n}」`,
      `（フォント ＞ ${p.cat}（${p.catJa}）／提供: ${src(r)}）`,
      `分類: ${FT.kj(r)}（${r.k}）／太さ: ${wText(r, true)}／イタリック: ${r.i ? 'あり' : 'なし'}／日本語: ${r.j ? '対応' : '非対応'}`,
      `・読み込み（HTML）: <link href="${FT.cssUrl(r, true)}" rel="stylesheet">`,
      `・指定（CSS）: font-family: "${r.n}", ${FT.generic(r)};`,
      `・配布ページ: ${FT.page(r)}`,
      `・ライセンス: ${g ? 'Google Fonts で配布されている無料フォント（商用利用可のオープンライセンス。多くは SIL Open Font License）' : 'Fontshare で配布されている無料フォント（個人・商用とも無料）'}。正確な条件は配布ページで確認してください。`,
    ] : [
      `${p.id} "${r.n}"`,
      `(Font > ${p.cat} / from ${src(r)})`,
      `Category: ${r.k} / Weights: ${wText(r, false)} / Italics: ${r.i ? 'yes' : 'no'} / Japanese: ${r.j ? 'yes' : 'no'}`,
      `- Load (HTML): <link href="${FT.cssUrl(r, true)}" rel="stylesheet">`,
      `- Use (CSS): font-family: "${r.n}", ${FT.generic(r)};`,
      `- Font page: ${FT.page(r)}`,
      `- Licence: ${g ? 'a free font distributed by Google Fonts (open licence allowing commercial use; mostly SIL Open Font License)' : 'a free font distributed by Fontshare (free for personal and commercial use)'}. Check the font page for the exact terms.`,
    ]).join('\n');
  };
})();
