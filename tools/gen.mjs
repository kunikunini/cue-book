// オーディオタグの見本音声を生成する。お金がかかるのはこのスクリプトだけ。
// 使い方: node gen.mjs --m <男性のvoice_id> --f <女性のvoice_id> [--limit 10000] [--only VT-001,VT-002] [--model eleven_v4]
// すでにある音声は作り直さない。消費文字数が上限に届く前に止まる。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from './el.mjs';
import { loadScript } from './script.mjs';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const VOICE = { m: arg('m'), f: arg('f') }, LIMIT = +arg('limit', 10000), MODEL = arg('model', 'eleven_v4');
const only = arg('only') ? arg('only').split(',') : null;
if (!VOICE.m || !VOICE.f) throw new Error('--m と --f に voice_id を渡す');
const logF = path.join(root, 'audio', 'log.json');
const log = fs.existsSync(logF) ? JSON.parse(fs.readFileSync(logF, 'utf8')) : { spent: 0, items: {} };
const list = loadScript().filter(x => !only || only.includes(x.id));
const jobs = [];
for (const x of list) for (const v of ['m', 'f']) { const out = path.join(root, 'audio', v, x.id + '.mp3'); if (!fs.existsSync(out)) jobs.push({ ...x, v, out }); }
console.log('これから作る本数', jobs.length, '｜見込み文字数', jobs.reduce((a, j) => a + [...j.line].length, 0), '｜これまでの消費', log.spent, '｜上限', LIMIT);
const used = async () => { try { const j = await (await api('/v1/user/subscription')).json(); return typeof j.character_count === 'number' ? j.character_count : null; } catch (e) { return null; } };
const before = await used();
let stop = false, done = 0, fail = 0;
async function one(j) {
  const n = [...j.line].length;
  if (stop || log.spent + n > LIMIT) { stop = true; return; }
  log.spent += n; // 送る前に数える（失敗しても上限を超えない側に倒す）
  const r = await api(`/v1/text-to-speech/${VOICE[j.v]}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: j.line, model_id: MODEL }) });
  if (!r.ok) { fail++; log.spent -= n; const t = (await r.text()).slice(0, 300); console.log('失敗', j.id, j.v, r.status, t); if (r.status === 401 || r.status === 402 || /quota|model/i.test(t)) stop = true; return; }
  fs.mkdirSync(path.dirname(j.out), { recursive: true });
  fs.writeFileSync(j.out, Buffer.from(await r.arrayBuffer()));
  log.items[j.id + ':' + j.v] = { chars: n, cost: r.headers.get('character-cost') || r.headers.get('x-character-count') || null, at: new Date().toISOString() };
  done++;
  fs.writeFileSync(logF, JSON.stringify(log, null, 1));
}
const q = jobs.slice();
await Promise.all([0, 1, 2].map(async () => { while (q.length && !stop) await one(q.shift()); }));
const after = await used();
const real = before != null && after != null ? after - before : null;
if (real != null) log.account = (log.account || 0) + real;
fs.writeFileSync(logF, JSON.stringify(log, null, 1));
// 画面が読む一覧を書き出す。男性の声は配布に入れるので audio/manifest.js、女性の声は手元だけなので audio/f/manifest.js に分ける
const stamp = Date.now(), has = v => { const d = path.join(root, 'audio', v), o = {}; if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith('.mp3')) o[f.replace('.mp3', '')] = 1; return o; };
fs.writeFileSync(path.join(root, 'audio', 'manifest.js'), 'window.VO_AUDIO = ' + JSON.stringify({ m: has('m'), f: {}, meta: { model: MODEL, stamp } }) + ';\n');
if (fs.existsSync(path.join(root, 'audio', 'f'))) fs.writeFileSync(path.join(root, 'audio', 'f', 'manifest.js'), 'window.VO_AUDIO.f = ' + JSON.stringify(has('f')) + ';\n');
console.log('できた', done, '本｜失敗', fail, '｜途中で止めた', stop, '｜台本の文字数での累計', log.spent, '｜アカウントの実消費（今回）', real == null ? '確認できない（この鍵には残り枠を読む権限がない）' : real, '｜応答に書かれた消費の合計', Object.values(log.items).reduce((a, x) => a + (+x.cost || 0), 0));
