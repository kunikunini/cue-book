// 見本帳のデータ（presets.js など）から、スキルが読む一覧 skills/motion-specimen/data/catalog.json を作る。
// 見本帳の「コピー」と同じ文章（promptOf）をそのまま書き出すので、見本帳を直したらこれを実行し直す。
//   node tools/build-skill.mjs [--gallery https://<user>.github.io/<repo>/]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'skills/motion-specimen/data/catalog.json');
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
const ctx = { console };
vm.createContext(ctx);
for (const f of ['engine.js', 'presets.js', 'i18n.js', 'mg1.js', 'mg2.js', 'vo.js', 'fonts.js', 'ft.js', 'spec.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const items = vm.runInContext(`(() => {
  const both = p => { const o = {}; for (const l of ['ja', 'en']) { LANG = l; o[l] = promptOf(p); } LANG = 'ja'; return o; };
  return PRESETS.map(p => ({ id: p.id, book: p.book, cat: p.cat, catJa: p.catJa, name: p.name, nameJa: p.nameJa, ja: p.ja, en: p.en, src: p.src ? VO.src[p.src] : null, line: p.line || null, prompt: both(p) }));
})()`, ctx);
const count = b => items.filter(x => x.book === b).length;
const cat = {
  version: 1,
  built: new Date().toISOString().slice(0, 10),
  gallery: arg('gallery') || (prev && prev.gallery) || null,
  books: {
    ae: { prefix: 'AE', ja: 'After Effects 標準テキストアニメーションプリセット', en: 'Built-in After Effects text animation presets', n: count('ae') },
    mg: { prefix: 'MG', ja: 'モーショングラフィックスの動き', en: 'Motion-graphics moves', n: count('mg') },
    vo: { prefix: 'VT', ja: '音声合成のオーディオタグ', en: 'Audio tags for speech synthesis', n: count('vo') },
    ft: { prefix: 'FT', ja: '無料フォント（Google Fonts・Fontshare）', en: 'Free fonts (Google Fonts, Fontshare)', n: count('ft'), digits: 4 },
  },
  items,
};
fs.writeFileSync(out, JSON.stringify(cat));
console.log('書き出した:', path.relative(root, out), '｜', items.length, '個（AE', count('ae'), '／MG', count('mg'), '／VT', count('vo'), '／FT', count('ft') + '）｜', (fs.statSync(out).size / 1e6).toFixed(2), 'MB｜見本帳のURL:', cat.gallery || '未設定');
