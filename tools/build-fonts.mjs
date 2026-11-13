// フォントの巻のデータ fonts.js を作る。Google Fonts と Fontshare の公開一覧を読み、人気順に並べて番号を振る。
// 番号は「すでにある fonts.js の並び」を保ち、新しく増えたフォントは末尾に足す（番号が変わらないように）。
//   node tools/build-fonts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'fonts.js');

const g = await (await fetch('https://fonts.google.com/metadata/fonts')).text();
const G = JSON.parse(g.replace(/^\)\]\}'\n?/, '')).familyMetadataList;
let F = [];
try { F = (await (await fetch('https://api.fontshare.com/v2/fonts?limit=500')).json()).fonts || []; } catch (e) { console.log('Fontshare は取得できなかった:', e.message); }

const CATS = ['Sans Serif', 'Serif', 'Display', 'Handwriting', 'Monospace'];
const rows = [];
for (const f of G) {
  const ws = [...new Set(Object.keys(f.fonts || {}).map(k => parseInt(k, 10)).filter(Boolean))].sort((a, b) => a - b);
  const wax = (f.axes || []).find(a => a.tag === 'wght');
  const ja = (f.subsets || []).includes('japanese');
  const cat = CATS.find(c => c.toLowerCase() === String(f.category || '').toLowerCase()) || 'Display';
  rows.push({ n: f.family, s: 'g', c: ja ? 'Japanese' : cat, k: cat, w: wax ? [wax.min, wax.max] : ws, v: wax ? 1 : 0, i: Object.keys(f.fonts || {}).some(k => /i$/.test(k)) ? 1 : 0, p: f.popularity || 9999, j: ja ? 1 : 0, o: Object.keys(f.fonts || {}).length && Object.keys(f.fonts).every(k => /i$/.test(k)) ? 1 : 0 });
}
for (const f of F) {
  const st = f.styles || [], ws = [...new Set(st.map(x => x.weight && x.weight.number).filter(Boolean))].sort((a, b) => a - b);
  rows.push({ n: f.name, s: 'f', slug: f.slug, c: 'Fontshare', k: (f.category || '').replace(/^\w/, m => m.toUpperCase()) || 'Sans', w: ws, v: st.some(x => x.is_variable) ? 1 : 0, i: st.some(x => x.is_italic) ? 1 : 0, p: 5000 + rows.length, j: 0 });
}
const ORDER = ['Japanese', 'Sans Serif', 'Serif', 'Display', 'Handwriting', 'Monospace', 'Fontshare'];
/* すでに番号を振ったものは、その順番のまま */
let prev = [];
if (fs.existsSync(out)) { const m = fs.readFileSync(out, 'utf8').match(/const FONT_ROWS = (\[[\s\S]*?\]);\n/); if (m) prev = JSON.parse(m[1]); }
const key = r => r.s + ':' + r.n, have = new Map(rows.map(r => [key(r), r]));
const kept = prev.filter(r => have.has(key(r))).map(r => Object.assign({}, have.get(key(r)), { c: r.c }));
const keptKeys = new Set(kept.map(key));
const fresh = rows.filter(r => !keptKeys.has(key(r))).sort((a, b) => ORDER.indexOf(a.c) - ORDER.indexOf(b.c) || a.p - b.p);
const all = prev.length ? kept.concat(fresh) : fresh;
const slim = all.map(r => { const o = { n: r.n, s: r.s, c: r.c, k: r.k, w: r.w, v: r.v, i: r.i, j: r.j }; if (r.slug) o.slug = r.slug; if (r.o) o.o = 1; return o; });
fs.writeFileSync(out, `'use strict';\n/* フォントの巻のデータ。tools/build-fonts.mjs が Google Fonts と Fontshare の公開一覧から作る（${new Date().toISOString().slice(0, 10)} 取得）。\n   n=名前 s=提供元(g:Google Fonts, f:Fontshare) c=この見本帳での章 k=分類 w=太さ(可変なら[最小,最大]) v=可変フォント i=イタリックあり j=日本語対応 o=イタリックのみ */\nconst FONT_ROWS = ${JSON.stringify(slim)};\n`);
const by = {}; slim.forEach(r => { by[r.c] = (by[r.c] || 0) + 1; });
console.log('書き出した: fonts.js ｜', slim.length, '書体 ｜', JSON.stringify(by), '｜ 新規', prev.length ? fresh.length : slim.length, '｜', (fs.statSync(out).size / 1e3).toFixed(0), 'KB');
