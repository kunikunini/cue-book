#!/usr/bin/env node
// 動きの見本帳（Motion Specimen Book）を、AIエージェントから引くための道具。
// 追加のインストールは不要（Node.js 18 以上だけ）。データは同じスキルの data/catalog.json に入っている。
//
//   node specimen.mjs list   [--book ae|mg|vo|ft]            分類と件数。--book を付けると、その巻の全項目を1行ずつ
//   node specimen.mjs search <言葉...> [--book] [--limit] 言葉で探す（日本語・英語どちらでも）
//   node specimen.mjs get <番号...>                       番号の仕様を出す（一度に12個まで）
//   node specimen.mjs table  --book ae|mg|vo|ft              その巻の番号表（番号｜名前｜分類｜動き）
//   node specimen.mjs pick   [--book] [--timeout 秒]      見本帳をブラウザで開き、利用者が選んで「AIに渡す」を押すまで待つ
//   node specimen.mjs info                                データの版・件数・見本帳の場所
// 共通: --lang ja|en（既定は ja）
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CAT = JSON.parse(fs.readFileSync(path.join(here, '../data/catalog.json'), 'utf8'));
const argv = process.argv.slice(2), cmd = argv[0];
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const VALUE_FLAGS = ['book', 'lang', 'limit', 'timeout', 'site', 'url'];
const words = argv.slice(1).filter((a, i, arr) => !a.startsWith('--') && !(arr[i - 1] && arr[i - 1].startsWith('--') && VALUE_FLAGS.includes(arr[i - 1].slice(2))));
const lang = opt('lang', 'ja') === 'en' ? 'en' : 'ja';
const J = (ja, en) => (lang === 'en' ? en : ja);
const book = (() => { const b = String(opt('book', '')).toLowerCase(); return b === 'vt' ? 'vo' : ['ae', 'mg', 'vo', 'ft'].includes(b) ? b : null; })();
const items = CAT.items.filter(x => !book || x.book === book);
const byId = Object.fromEntries(CAT.items.map(x => [x.id, x]));
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };

/* 「ae58」「#AE-058」「…/index.html#MG-011」のような書き方を、正しい番号にそろえる */
function normId(s) {
  const m = String(s).toUpperCase().match(/(AE|MG|VT|FT)[\s\-_#]*0*(\d{1,4})(?!\d)/);
  return m ? `${m[1]}-${m[2].padStart(m[1] === 'FT' ? 4 : 3, '0')}` : null;
}
const line = x => (lang === 'en'
  ? `${x.id} | ${x.name} | ${x.cat}${x.src ? ' / ' + x.src[1] : ''} | ${x.en}`
  : `${x.id} | ${x.name} | ${x.nameJa} | ${x.cat}${x.src ? '／' + x.src[0] : ''} | ${x.ja}`);

function cmdList() {
  if (book) return console.log(items.map(line).join('\n'));
  for (const [b, B] of Object.entries(CAT.books)) {
    console.log(`\n${B.prefix}-  ${J(B.ja, B.en)}  (${B.n})   --book ${b}`);
    const seen = new Map();
    CAT.items.filter(x => x.book === b).forEach(x => { if (!seen.has(x.cat)) seen.set(x.cat, { ja: x.catJa, first: x.id, n: 0 }); seen.get(x.cat).n++; });
    for (const [c, v] of seen) console.log(`  ${v.first}〜  ${c}${lang === 'ja' && v.ja !== c ? '（' + v.ja + '）' : ''}  ${v.n}`);
  }
}

function cmdSearch() {
  if (!words.length) die(J('探す言葉を付けてください。例: search 文字 弾む', 'Add words to search for, e.g. search bounce text'));
  const ws = words.map(w => w.toLowerCase());
  const score = x => {
    let total = 0, all = true;
    for (const w of ws) {
      let s = 0;
      if (x.id.toLowerCase() === w || x.id.toLowerCase().replace('-', '') === w) s += 10;
      if (x.name.toLowerCase().includes(w)) s += 6;
      if ((x.nameJa || '').toLowerCase().includes(w)) s += 6;
      if (`${x.cat} ${x.catJa}`.toLowerCase().includes(w)) s += 3;
      if (`${x.ja} ${x.en}`.toLowerCase().includes(w)) s += 2;
      if ((x.line || '').toLowerCase().includes(w)) s += 1;
      if (!s) all = false;
      total += s;
    }
    return { total, all };
  };
  const scored = items.map(x => ({ x, ...score(x) })).filter(r => r.total > 0);
  const strict = scored.filter(r => r.all);
  const res = (strict.length ? strict : scored).sort((a, b) => b.total - a.total).slice(0, +opt('limit', 12) || 12);
  if (!res.length) die(J('見つかりませんでした。別の言葉で試すか、list で分類を見てください。', 'No match. Try other words, or run list to see the categories.'), 1);
  if (!strict.length) console.log(J('（すべての言葉に当てはまるものは無かったので、どれかに当てはまるものを出しています）', '(Nothing matched every word; showing partial matches.)'));
  console.log(res.map(r => line(r.x)).join('\n'));
}

function cmdGet() {
  const ids = words.map(normId);
  if (!ids.length) die(J('番号を付けてください。例: get AE-058 MG-011', 'Add numbers, e.g. get AE-058 MG-011'));
  if (ids.length > 12) die(J('一度に出せるのは12個までです。分けて実行してください。', 'At most 12 per call. Split the request.'));
  const bad = words.filter((w, i) => !ids[i] || !byId[ids[i]]);
  if (bad.length) die(J(`この番号は見本帳にありません: ${bad.join(', ')}（AE-001〜${CAT.books.ae.n}、MG-001〜${CAT.books.mg.n}、VT-001〜${CAT.books.vo.n}、FT-0001〜${CAT.books.ft.n}）。番号を作らず、利用者に確かめてください。`, `Not in the book: ${bad.join(', ')} (AE-001–${CAT.books.ae.n}, MG-001–${CAT.books.mg.n}, VT-001–${CAT.books.vo.n}, FT-0001–${CAT.books.ft.n}). Do not invent a number; ask the user.`), 1);
  console.log(ids.map(id => byId[id].prompt[lang]).join('\n\n'));
}

function cmdTable() {
  if (!book) die(J('--book ae|mg|vo|ft を付けてください。', 'Add --book ae|mg|vo|ft.'));
  const B = CAT.books[book];
  console.log(J(`${B.ja}の番号表です。「${B.prefix}-xxx」と番号で言ったら、この表の動きを指します。\n書式: 番号 | 正式名 | 日本語での呼び名 | カテゴリ | 動き\n`, `Number table of ${B.en}. “${B.prefix}-xxx” refers to the motion in this table.\nFormat: number | name | category | motion\n`));
  console.log(items.map(line).join('\n'));
}

function cmdInfo() {
  const site = findSite();
  console.log([
    `Motion Specimen Book / 動きの見本帳  catalog v${CAT.version}  (${CAT.built})`,
    ...Object.values(CAT.books).map(B => `  ${B.prefix}-${'1'.padStart(B.digits || 3, '0')}〜${String(B.n).padStart(B.digits || 3, '0')}  ${J(B.ja, B.en)}`),
    J('見本帳の場所: ', 'Gallery: ') + (site ? site + J('（手元のファイル）', ' (local files)') : CAT.gallery || J('未設定（pick には --site か --url が必要）', 'not set (pick needs --site or --url)')),
  ].join('\n'));
}

/* ---- pick：見本帳を開いて、利用者が選ぶのを待つ ---- */
function findSite() {
  const cand = [opt('site', null), path.resolve(here, '../../..')].filter(s => typeof s === 'string');
  return cand.find(d => fs.existsSync(path.join(d, 'index.html')) && fs.existsSync(path.join(d, 'presets.js'))) || null;
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function cmdPick() {
  const site = findSite(), remote = typeof opt('url', null) === 'string' ? opt('url') : (!site ? CAT.gallery : null);
  if (!site && !remote) die(J('見本帳の場所が分かりません。--site <見本帳のフォルダ> か --url <見本帳のURL> を付けてください。', 'Gallery location unknown. Pass --site <folder> or --url <gallery URL>.'), 3);
  const token = crypto.randomBytes(12).toString('hex'), timeout = (+opt('timeout', 900) || 900) * 1000;
  let done = false;
  const finish = (ids, memo) => {
    if (done) return; done = true;
    const good = ids.map(normId).filter(id => id && byId[id]);
    console.log(J(`見本帳で、利用者が次の${good.length}個を選びました（選んだ順）。この番号だけを使ってください。足したり入れ替えたりしないこと。\n`, `The user picked these ${good.length} in the gallery (in this order). Use exactly these; do not add or swap.\n`));
    console.log(good.map(id => byId[id].prompt[lang]).join('\n\n'));
    if (memo) console.log(J('\n利用者のメモ: ', '\nUser note: ') + memo);
    setTimeout(() => process.exit(0), 150);
  };
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname === '/__picked') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (u.searchParams.get('token') !== token) { res.writeHead(403); return res.end('bad token'); }
      const ids = (u.searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 60), memo = (u.searchParams.get('memo') || '').slice(0, 2000);
      if (u.searchParams.get('nav')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(`<!doctype html><meta charset="utf-8"><title>OK</title><body style="font:16px/1.8 sans-serif;padding:48px;background:#f4f1ea;color:#161513"><h1 style="font-size:22px">${J('AIに渡しました', 'Sent to the AI')}</h1><p>${J('このタブは閉じて、AIとの会話に戻ってください。', 'You can close this tab and return to your AI chat.')}</p>`); }
      else { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":true}'); }
      return finish(ids, memo);
    }
    if (!site || req.method !== 'GET') { res.writeHead(404); return res.end(); }
    /* 手元の見本帳を配る。フォルダの外・隠しファイル・道具のフォルダは出さない */
    let rel = decodeURIComponent(u.pathname); if (rel.endsWith('/')) rel += 'index.html';
    const file = path.normalize(path.join(site, rel));
    if (!file.startsWith(path.resolve(site) + path.sep) || rel.split('/').some(s => s.startsWith('.')) || /^\/(tools|skills)\//.test(rel) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  srv.listen(0, '127.0.0.1', () => {
    const port = srv.address().port, q = new URLSearchParams({ agent: `${port}.${token}` });
    if (book) q.set('book', book);
    q.set('lang', lang);
    const base = site ? `http://127.0.0.1:${port}/index.html` : remote;
    const url = base + (base.includes('?') ? '&' : '?') + q;
    console.log(J('見本帳を開きます。利用者に「見本を選んで、右下の『AIに渡す』を押してください」と伝えてください。\n', 'Opening the gallery. Tell the user: pick samples, then press “Send to AI” at the bottom right.\n') + url + '\n');
    if (!opt('no-open', false)) {
      const [bin, args] = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
      try { spawn(bin, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch (e) {}
    }
  });
  setTimeout(() => { if (!done) { console.error(J('時間切れ：何も選ばれませんでした。まだ選びたいか、利用者に聞いてください（代わりに選ばないこと）。', 'Timed out: nothing was picked. Ask the user whether they still want to choose; do not choose for them.')); process.exit(4); } }, timeout);
}

const CMDS = { list: cmdList, search: cmdSearch, get: cmdGet, table: cmdTable, pick: cmdPick, info: cmdInfo };
if (!CMDS[cmd]) die('usage: specimen.mjs list|search|get|table|pick|info  [--book ae|mg|vo|ft] [--lang ja|en]\n' + J('まず info か list を実行してください。', 'Start with info or list.'), cmd ? 1 : 0);
CMDS[cmd]();
