// vo.js から「番号・タグ・台本」の一覧を取り出す（生成スクリプトと文字数の見積もりで使う）
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export function loadScript() {
  const ctx = { CATS: [], CAT_EN: [], PRESETS: [], pad: (n, w = 2) => String(n).padStart(w, '0'), MONO: '', SANS: '', CX: 160 };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(dir, 'vo.js'), 'utf8') + '\nthis.OUT = PRESETS.map(p => ({ id: p.id, tag: p.name, line: p.line, src: p.src, cat: p.cat }));', ctx);
  return ctx.OUT;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const L = loadScript(), n = L.reduce((a, x) => a + [...x.line].length, 0);
  const by = {}; L.forEach(x => { by[x.src] = (by[x.src] || 0) + 1; });
  console.log('タグ数', L.length, '出どころ別', JSON.stringify(by));
  console.log('1声ぶんの文字数', n, '／2声で', n * 2, '／平均', (n / L.length).toFixed(1));
  console.log('長い順:', L.slice().sort((a, b) => b.line.length - a.line.length).slice(0, 5).map(x => x.id + ':' + [...x.line].length).join(' '));
  console.log('例:', L[0].line, '|', L.find(x => x.tag === '[pause]').line);
}
