'use strict';
/* 画面の組み立て。中身（322＋137＋130の見本、解説、コピー文）は他のファイルにあり、ここは見せ方と操作だけ。 */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const main = $('#main'), flat = $('#flat');
  const byId = Object.fromEntries(PRESETS.map(p => [p.id, p]));
  const load = k => { try { return JSON.parse(localStorage.getItem(k) || '[]').filter(id => byId[id]); } catch (e) { return []; } };
  const store = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} };
  let clock = 0, last = performance.now(), paused = false, speed = 1, custom = null, query = '', view = 'all', book = 'ae', theme = 'paper';
  let picks = load('ae-picks'), favs = load('ae-favs'), hist = load('ae-history');
  try {
    const l = localStorage.getItem('ae-lang'); if (l === 'en' || l === 'ja') LANG = l;
    const b = localStorage.getItem('ae-book'); if (b === 'mg' || b === 'ae' || b === 'vo') book = b;
    const th = localStorage.getItem('ae-theme'); if (th === 'night' || th === 'paper') theme = th;
  } catch (e) {}
  /* AIエージェントのスキル（pick）から開かれたときは、URLに agent=<ポート>.<合言葉> が付く。そのときだけ「AIに渡す」を出す */
  const QS = new URLSearchParams(location.search);
  const AGENT = (QS.get('agent') || '').match(/^(\d{2,5})\.([a-f0-9]{8,64})$/);
  if (['ae', 'mg', 'vo'].includes(QS.get('book'))) book = QS.get('book');
  if (['ja', 'en'].includes(QS.get('lang'))) LANG = QS.get('lang');
  const BOOKS = ['ae', 'mg', 'vo'], PREFIX = { ae: 'AE', mg: 'MG', vo: 'VT' }, VOLNO = { ae: '01', mg: '02', vo: '03' };
  const inBook = p => p.book === book;
  const bookCats = () => CATS.filter(c => c.book === book);
  const HELP_URL = 'https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/effects-and-animation-presets/effects-animation-presets-overview.html';
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- 画面の文言 ---- */
  const TXT = {
    ja: {
      brand: '見本帳', tag: '番号で伝える、動き',
      st1: '見本', st2: 'カテゴリ', st3: '通し番号', how: '使い方',
      howList: ['動きを見て、カード右上のチェックを入れる（いくつでも）', '下に出るバーで、必要ならメモを書く（例：冒頭のタイトルに）', '「選んだものをコピー」を押して、AIとの会話に貼る', 'よく使うものは「☆」でお気に入りに。一度選んだものは「履歴」に残る'],
      q: '名前・番号・動きの言葉で探す', sample: 'ここに文字を入力', sampleL: '見本の文字を、ここに入力', sampleH: '入れた文字で、下の見本がぜんぶ動きます。Enterで改行（4行まで）。空にすると元の見本に戻ります。',
      speed: '速さ', pause: '一時停止', play: '再生', copyIndex: '番号表をコピー', shown: n => `${n}個を表示`, empty: '当てはまるものがありません',
      emptyFav: 'お気に入りはまだありません。カード右上の「☆」を押すと、ここに入ります。', emptyHist: '履歴はまだありません。チェックを入れたものが、ここに残ります。',
      vAll: 'すべて', vFav: '☆ お気に入り', vHist: '履歴', all: 'すべて',
      favH: 'お気に入り', favSub: '☆を付けたもの', histH: '履歴', histSub: '一度でも選んだことがあるもの（新しい順）', clearHist: '履歴を消す',
      male: '男性', female: '女性', stop: '停止', noAudio: 'この音声は、この版には入っていません', line: '例文', effect: '効果', pick: '選ぶ', picked: '選択中', unpick: '選択を外す', copy: 'コピー', favOn: 'お気に入りから外す', favOff: 'お気に入りに入れる', zoom: id => `${id} を大きく見る`,
      n: n => `${n}個`, clear: 'クリア', copyPicks: '選んだものをコピー', memo: 'メモ（任意）：どこにどう使うか。例）AE-027 を冒頭のタイトルに、MG-011 を一覧の登場に',
      prev: '前へ', next: '次へ', copyOne: 'この1つをコピー', close: '閉じる',
      copied: id => `${id} をコピーしました`, copiedN: n => `${n}個をコピーしました`, copiedIdx: n => `番号表（${n}個）をコピーしました`, copyFail: 'コピーできませんでした',
      books: {
        ae: {
          tab: 'AE テキストプリセット', sub: 'After Effects 付属の、文字の動き', mini: '文字', kicker: 'AFTER EFFECTS ＞ エフェクト＆プリセット ＞ アニメーションプリセット ＞ TEXT',
          h1: '言葉にしにくい文字の動きを、<em>番号</em>で頼む。',
          lead: 'After Effects に最初から入っているテキストアニメーションプリセットを、全部動く見本にして番号を振りました。気に入った動きを選んでコピーすると、番号・正式名・動きの仕様がまとまった文章になるので、そのままAIに貼れます。',
          noteS: '番号だけで頼むとき・この見本帳の注意',
          note: '番号だけで <code>AE-150 の動きで</code> と頼みたいときは、先に「番号表をコピー」でAIに全体の対応表を渡しておくと通じます。<br>英語の名前と並びは Adobe 公式ヘルプの一覧（2026年9月更新）どおり。日本語の名前は意味が分かるように付けた訳で、公式の訳ではありません。動きの見本は AE 本体のプリセットファイルを再生したものではなく、ブラウザ上で再現した近似です。',
          foot: `プリセットの名称とカテゴリは <a href="${HELP_URL}" target="_blank" rel="noopener">Adobe 公式ヘルプ「Animation preset list」</a> の Text の項による。このページは個人の見本帳で、Adobe とは関係ありません。After Effects は Adobe の商標です。`,
        },
        mg: {
          tab: 'モーショングラフィックス', sub: '図形・画面・カメラの動きと解説', mini: '動き', kicker: 'MOTION GRAPHICS ＞ 動きの名前・仕組み・使いどころ',
          h1: '「あの動き」の<em>名前</em>と仕組みを、動く見本で。',
          lead: 'モーショングラフィックスでよく使う動きを、基本原則・登場と退場・図形・切り替え・文字・カメラ・エフェクト・図解とUIに分けて集めました。それぞれに番号と名前、動く見本、仕組みと使いどころの解説が付いています。選んでコピーすると、見本を描いているコードも一緒にAIへ渡せます。',
          noteS: '番号だけで頼むとき・この見本帳の注意',
          note: '番号だけで <code>MG-011 の動きで</code> と頼みたいときは、先に「番号表をコピー」でAIに全体の対応表を渡しておくと通じます。<br>名前は一般に使われている呼び名です。見本と解説はこの見本帳のために書き起こしたもので、秒数や割合は目安です。見本の文字は固定で、文字の入力欄はAEのタブだけにあります。',
          foot: 'このページは個人の見本帳です。見本と解説は、この見本帳のために書き起こしたものです。',
        },
        vo: {
          tab: 'オーディオタグ（声）', sub: '声の演技を指示するタグを、実際の声で', mini: '声', kicker: 'AUDIO TAGS ＞ 声の演技を、角かっこの言葉で指示する',
          h1: '声の演技を、<em>タグ</em>で頼む。実際の声で聴き比べる。',
          lead: '音声合成で使うオーディオタグを集めて、同じタグを男性の声と女性の声で読ませました。タグごとに、そのタグに合うせりふを選んであります。カードの「男性」「女性」を押すと再生します。',
          noteS: 'この見本の作り方と注意',
          note: '音声は ElevenLabs の Eleven v4 で、カードに出ている例文をそのまま生成したものです。タグは必ず効くとは限らず、同じ台本でも生成のたびに演技が変わります（公式も「まだ完璧ではない」としています）。<br>出どころは4種類：Eleven v4 公式、Eleven v3 公式ドキュメント、Suno で使われる歌用タグ、公開されている使用例。Suno のタグは歌を作るためのもので、読み上げでどう効くか（効かないか）を聴いて確かめるために入れています。タグの表記は出どころのまま、例文と解説はこの見本帳のために書いたものです。',
          foot: 'このページは個人の見本帳です。タグの表記は各出どころのもの、例文と解説はこの見本帳のために書いたものです。ElevenLabs・Suno とは関係ありません。',
        },
      },
    },
    en: {
      brand: 'Sample Book', tag: 'Ask for motion by number',
      st1: 'samples', st2: 'categories', st3: 'serial numbers', how: 'How to use',
      howList: ['Watch the motion and tick the box at the top right of a card (as many as you like)', 'Add a note in the bar at the bottom if needed (e.g. “for the opening title”)', 'Press “Copy picks” and paste into your AI chat', 'Press “☆” to keep favourites. Anything you have ever picked stays in “History”'],
      q: 'Search by name, number or motion', sample: 'Type your text here', sampleL: 'Type the sample text here', sampleH: 'Every sample below animates with what you type. Enter for a new line (up to 4). Leave it empty to restore the default.',
      speed: 'Speed', pause: 'Pause', play: 'Play', copyIndex: 'Copy number table', shown: n => `${n} shown`, empty: 'Nothing matches',
      emptyFav: 'No favourites yet. Press “☆” at the top right of a card to add one.', emptyHist: 'No history yet. Anything you tick is kept here.',
      vAll: 'All', vFav: '☆ Favourites', vHist: 'History', all: 'All',
      favH: 'Favourites', favSub: 'Items you starred', histH: 'History', histSub: 'Everything you have ever picked (newest first)', clearHist: 'Clear history',
      male: 'Male', female: 'Female', stop: 'Stop', noAudio: 'This audio is not included in this edition', line: 'Line', effect: 'Effect', pick: 'Pick', picked: 'Picked', unpick: 'Unpick', copy: 'Copy', favOn: 'Remove from favourites', favOff: 'Add to favourites', zoom: id => `View ${id} larger`,
      n: n => `${n} picked`, clear: 'Clear', copyPicks: 'Copy picks', memo: 'Note (optional): where and how to use them, e.g. AE-027 for the opening title, MG-011 for the list entrance',
      prev: 'Prev', next: 'Next', copyOne: 'Copy this one', close: 'Close',
      copied: id => `Copied ${id}`, copiedN: n => `Copied ${n} items`, copiedIdx: n => `Copied the number table (${n})`, copyFail: 'Could not copy',
      books: {
        ae: {
          tab: 'AE Text Presets', sub: 'Text motion built into After Effects', mini: 'Text', kicker: 'AFTER EFFECTS > EFFECTS & PRESETS > ANIMATION PRESETS > TEXT',
          h1: 'Text motion that is hard to describe? Ask for it by <em>number</em>.',
          lead: 'Every text animation preset that ships with After Effects, as a moving sample with a number. Pick the ones you like and copy: you get the number, the official name and a motion spec in one block of text, ready to paste to an AI.',
          noteS: 'Asking by number alone, and caveats',
          note: 'To ask with a bare number like <code>use AE-150</code>, first give the AI the whole table with “Copy number table”.<br>Names and order follow Adobe’s official help list (updated September 2026). The moving samples are not played from After Effects preset files; they are browser approximations.',
          foot: `Preset names and categories are from the Text section of <a href="${HELP_URL}" target="_blank" rel="noopener">Adobe’s official “Animation preset list”</a>. This is a personal sample book and is not affiliated with Adobe. After Effects is a trademark of Adobe.`,
        },
        mg: {
          tab: 'Motion Graphics', sub: 'Shapes, screens and camera moves, explained', mini: 'Motion', kicker: 'MOTION GRAPHICS > NAMES, MECHANICS AND USES',
          h1: 'The <em>name</em> and mechanics of “that move”, as a moving sample.',
          lead: 'Common motion-graphics moves, grouped into principles, ins and outs, shapes, transitions, typography, camera, effects, and infographics & UI. Each has a number and name, a moving sample, and a note on how it works and when to use it. Copying also hands the AI the code that draws the sample.',
          noteS: 'Asking by number alone, and caveats',
          note: 'To ask with a bare number like <code>use MG-011</code>, first give the AI the whole table with “Copy number table”.<br>Names are the commonly used ones. The samples and notes were written for this book; durations and percentages are guidelines. Sample text is fixed here: the text box exists on the AE tab only.',
          foot: 'This is a personal sample book. The samples and notes were written for it.',
        },
        vo: {
          tab: 'Audio Tags (Voice)', sub: 'Tags that direct a voice, in real voices', mini: 'Voice', kicker: 'AUDIO TAGS > DIRECT A VOICE PERFORMANCE WITH BRACKETED WORDS',
          h1: 'Direct a voice with <em>tags</em>, and hear the difference in real voices.',
          lead: 'Audio tags for speech synthesis, each read by a male voice and a female voice, with a line chosen to suit the tag. Press “Male” or “Female” on a card to play.',
          noteS: 'How these samples were made, and caveats',
          note: 'The audio was generated with ElevenLabs Eleven v4 from exactly the line shown on each card. Tags do not always take effect and the performance varies between generations (the vendor itself says they are “not perfect yet”).<br>Four sources: Eleven v4 official, Eleven v3 official docs, singing tags used in Suno, and publicly shared examples. Suno tags are meant for songs; they are included so you can hear how they do (or do not) work in speech. Tag spellings follow their sources; lines and notes were written for this book.',
          foot: 'This is a personal sample book. Tag spellings come from their sources; lines and notes were written for it. Not affiliated with ElevenLabs or Suno.',
        },
      },
    },
  };
  const t = () => TXT[LANG];
  const nameOf = p => (LANG === 'ja' ? p.nameJa : p.name);
  const descOf = p => (LANG === 'ja' ? p.ja : p.en);

  /* 新しい画面で増えた部品の文言 */
  Object.assign(TXT.ja, {
    creditH: '声のクレジット', creditLink: 'ElevenLabs でこの声を開く', creditNote: '音声はすべて ElevenLabs の Eleven v4 で生成した合成音声です。声そのものの利用条件は、ElevenLabs の各ボイスのページに従います。',
    sendAI: 'AIに渡す', sent: 'AIに渡しました。AIとの会話に戻ってください', sentShort: '渡しました', agentNote: 'AIから開かれています。使いたい見本の右上にチェックを入れて、右下の「AIに渡す」を押してください。',
    detail: '説明とボタンを開く／閉じる', detailAll: '説明を表示', detailNone: '説明を隠す',
    toc: '目次', tray: '選んだもの', remove: 'を外す', themeToNight: '夜の色にする', themeToPaper: '紙の色にする', night: '夜', paper: '紙', keys: 'キー操作', favWord: 'お気に入り',
    keyList: [['/', '検索欄へ'], ['1  2  3', '巻（タブ）を切り替える'], ['Space', '見本を一時停止／再生'], ['←  →', '拡大表示で前へ／次へ'], ['P', '拡大表示で「選ぶ」'], ['F', '拡大表示でお気に入り'], ['C', '拡大表示でコピー'], ['Esc', '閉じる']],
  });
  Object.assign(TXT.en, {
    creditH: 'VOICE CREDITS', creditLink: 'Open this voice on ElevenLabs', creditNote: 'All audio is synthetic speech generated with ElevenLabs Eleven v4. Use of the voices themselves is governed by each voice’s page on ElevenLabs.',
    sendAI: 'Send to AI', sent: 'Sent to the AI. Go back to your AI chat', sentShort: 'Sent', agentNote: 'Opened by your AI. Tick the samples you want, then press “Send to AI” at the bottom right.',
    detail: 'Show / hide details and buttons', detailAll: 'Show details', detailNone: 'Hide details',
    toc: 'CONTENTS', tray: 'Picked', remove: ': remove', themeToNight: 'Switch to night colours', themeToPaper: 'Switch to paper colours', night: 'Night', paper: 'Paper', keys: 'Keys', favWord: 'Favourite',
    keyList: [['/', 'Focus search'], ['1  2  3', 'Switch volume (tab)'], ['Space', 'Pause / play samples'], ['←  →', 'Previous / next in the large view'], ['P', 'Pick, in the large view'], ['F', 'Favourite, in the large view'], ['C', 'Copy, in the large view'], ['Esc', 'Close']],
  });

  /* ---- AIに渡す文章 ---- */
  const picksText = () => {
    const memo = $('#memo').value.trim();
    return [
      Lx(`動きの見本帳から、次の${picks.length}個を選びました。番号と正式名で指定します（AE- は After Effects 標準のテキストアニメーションプリセット、MG- はモーショングラフィックスの動き、VT- は音声合成のオーディオタグ）。それぞれの動きを下の仕様どおりに再現してください。`, `I picked these ${picks.length} from a motion sample book. They are identified by number and name (AE- = built-in After Effects text animation presets, MG- = motion-graphics moves, VT- = audio tags for speech synthesis). Reproduce each motion according to the spec below.`),
      '',
      ...picks.map(id => promptOf(byId[id]) + '\n'),
      memo ? Lx('メモ: ', 'Note: ') + memo : '',
    ].join('\n').trim() + '\n';
  };
  const indexText = () => {
    const list = PRESETS.filter(inBook), pre = PREFIX[book];
    const what = book === 'ae' ? Lx('After Effects 標準テキストアニメーションプリセット', 'the built-in After Effects text animation presets') : book === 'vo' ? Lx('音声合成のオーディオタグ', 'audio tags for speech synthesis') : Lx('モーショングラフィックスの動き', 'motion-graphics moves');
    return [
      Lx(`${what}の番号表です。以後、わたしが「${pre}-xxx」と番号で言ったら、この表の動きを指します。`, `This is a number table of ${what}. From now on, when I say “${pre}-xxx”, I mean the motion in this table.`),
      Lx('書式: 番号 | 正式名 | 日本語での呼び名 | カテゴリ | 動き', 'Format: number | name | category | motion'),
      '',
      ...list.map(p => (LANG === 'ja' ? `${p.id} | ${p.name} | ${p.nameJa} | ${p.cat}${p.src ? '／' + VO.src[p.src][0] : ''} | ${p.ja}` : `${p.id} | ${p.name} | ${p.cat}${p.src ? ' / ' + VO.src[p.src][1] : ''} | ${p.en}`)),
    ].join('\n') + '\n';
  };

  /* ---- 線画のアイコン（すべて同じ太さ・同じ24マス） ---- */
  const PATH = {
    star: '<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z"/>', stop: '<rect x="6" y="6" width="12" height="12"/>',
    pause: '<path d="M8.5 5v14M15.5 5v14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>', right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PATH[n]}</svg>`;

  let toastT;
  const toast = (msg, bad) => { const el = $('#toast'); el.innerHTML = (bad ? '' : ic('check')) + `<span></span>`; el.lastChild.textContent = msg; el.classList.toggle('bad', !!bad); el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); };
  const copy = async (text, msg, btn) => {
    let ok = true;
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } ta.remove(); }
    window.__lastCopy = ok ? text : null;
    toast(ok ? msg : t().copyFail, !ok);
    const g = ok && btn && btn.querySelector('.ic');
    if (g) { btn.classList.add('done'); g.outerHTML = ic('check'); setTimeout(() => { const h = btn.querySelector('.ic'); if (h) h.outerHTML = ic('copy'); btn.classList.remove('done'); }, 1300); }
  };

  /* ---- 見本の版（プレート） ----
     cards=章の中にある本体。mirrors=上の「お気に入り」「履歴」の棚に出す写し。画面外のキャンバスは解放する。 */
  const cards = new Map(), active = new Set(), inst = new WeakMap();
  let mirrors = [];
  const io = new IntersectionObserver(es => {
    for (const e of es) {
      const c = inst.get(e.target);
      if (!c) continue;
      if (e.isIntersecting) { if (!c.cv.width) { c.cv.width = W * DPR; c.cv.height = H * DPR; c.ctx = c.cv.getContext('2d'); } active.add(c); draw(c); }
      else { active.delete(c); c.cv.width = c.cv.height = 0; c.ctx = null; }
    }
  }, { rootMargin: '160px' });

  function mkCard(p, primary) {
    const el = document.createElement('article');
    el.className = 'plate'; el.dataset.id = p.id; if (primary) el.id = p.id;
    el.innerHTML = `<div class="cap"><span class="id">${p.id}</span><span class="capr"><button class="cp">${ic('copy')}</button><button class="pick"><i class="box">${ic('check')}</i></button><button class="fav">${ic('star')}</button></span></div><button class="stage"><canvas></canvas></button><div class="nrow"><h3 class="name"></h3><button class="mt" aria-expanded="false"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div>${p.book === 'vo' ? '<div class="voice"><button class="vp" data-v="m"></button><button class="vp" data-v="f"></button></div>' : ''}<div class="more"><div class="sub"></div><p class="desc"></p><div class="acts"><button class="pickb"></button><button class="cpb"></button></div></div>`;
    const c = { p, el, cv: el.querySelector('canvas'), ctx: null };
    c.cv.width = c.cv.height = 0;
    inst.set(el, c);
    io.observe(el);
    return c;
  }
  /* 1枚の版の文字と、選択中・お気に入りの表示を今の状態に合わせる */
  function paint(c) {
    const L = t(), p = c.p, e = c.el, on = picks.includes(p.id), f = favs.includes(p.id), fb = e.querySelector('.fav'), pk = e.querySelector('.pick');
    e.classList.toggle('sel', on);
    pk.title = on ? L.unpick : L.pick; pk.setAttribute('aria-label', `${p.id} ${pk.title}`); pk.setAttribute('aria-pressed', on);
    fb.classList.toggle('on', f); fb.title = f ? L.favOn : L.favOff; fb.setAttribute('aria-label', `${p.id} ${fb.title}`); fb.setAttribute('aria-pressed', f);
    e.querySelector('.name').textContent = nameOf(p);
    e.querySelector('.sub').textContent = LANG === 'ja' ? p.name : '';
    e.querySelector('.desc').textContent = descOf(p) + (p.src ? '（' + Lx(VO.src[p.src][0], VO.src[p.src][1]) + '）' : '');
    const pb = e.querySelector('.pickb'); pb.innerHTML = `<i class="box">${ic('check')}</i><span>${on ? L.picked : L.pick}</span>`; pb.setAttribute('aria-pressed', on);
    e.querySelector('.cpb').innerHTML = ic('copy') + `<span>${L.copy}</span>`;
    const mt = e.querySelector('.mt'); mt.title = L.detail; mt.setAttribute('aria-label', `${p.id} ${L.detail}`);
    const cb = e.querySelector('.cp'); cb.title = L.copy; cb.setAttribute('aria-label', `${p.id} ${L.copy}`);
    e.querySelector('.stage').setAttribute('aria-label', L.zoom(p.id));
    e.querySelectorAll('.vp').forEach(b => paintPlay(b, p));
  }

  /* ---- 声の再生（3巻目）。同時に鳴らすのは1つだけ ---- */
  const au = new Audio();
  const hasAudio = (p, v) => !!(window.VO_AUDIO && VO_AUDIO[v] && VO_AUDIO[v][p.id]);
  function paintPlay(b, p) {
    const L = t(), v = b.dataset.v, on = VO.playing && VO.playing.id === p.id && VO.playing.v === v, ok = hasAudio(p, v);
    b.innerHTML = ic(on ? 'stop' : 'play', 'fill') + `<span>${on ? L.stop : v === 'm' ? L.male : L.female}</span>`;
    b.classList.toggle('playing', !!on);
    b.disabled = !ok; b.title = ok ? '' : L.noAudio;
  }
  const repaintPlay = () => $$('.vp').forEach(b => { const p = b.id ? cur : byId[b.closest('.plate').dataset.id]; if (p) paintPlay(b, p); });
  function stopVoice() { if (VO.playing) { au.pause(); VO.playing = null; repaintPlay(); } }
  function playVoice(p, v) {
    if (VO.playing && VO.playing.id === p.id && VO.playing.v === v) return stopVoice();
    if (!hasAudio(p, v)) return;
    au.src = `audio/${v}/${p.id}.mp3?v=${(VO_AUDIO.meta && VO_AUDIO.meta.stamp) || 0}`;
    VO.playing = { id: p.id, v };
    au.play().catch(() => { VO.playing = null; repaintPlay(); });
    repaintPlay();
  }
  au.addEventListener('ended', () => { VO.playing = null; repaintPlay(); });

  /* 上の棚の写しを作り直す。本体はカテゴリの章から動かさない（押した版が指の下から逃げないように） */
  function rebuildMirrors() {
    mirrors.forEach(c => { io.unobserve(c.el); active.delete(c); c.el.remove(); });
    mirrors = [];
    if (view !== 'all') return;
    const add = (p, grid, top) => { const c = mkCard(p, false); c.top = top; $(grid).appendChild(c.el); mirrors.push(c); };
    PRESETS.filter(inBook).filter(isFav).forEach(p => add(p, '#favGrid', 'fav'));
    histOf().forEach(p => add(p, '#histGrid', 'hist'));
  }

  const noInBook = new Map();
  CATS.forEach((cat, ci) => {
    const no = CATS.slice(0, ci).filter(c => c.book === cat.book).length + 1;
    noInBook.set(cat, no);
    const sec = document.createElement('section');
    sec.className = 'cat'; sec.dataset.ci = ci; sec.id = 'c' + ci;
    sec.innerHTML = `<div class="cat-h"><span class="cat-no">${pad(no)}</span><h2></h2><span class="cat-sub"></span><span class="rng">${PREFIX[cat.book]}-${pad(cat.start, 3)} – ${pad(cat.end, 3)}</span></div><div class="grid"></div>`;
    cat.grid = sec.querySelector('.grid'); cat.sec = sec; cat.subEl = sec.querySelector('.cat-sub'); cat.hEl = sec.querySelector('h2');
    PRESETS.filter(p => p.ci === ci).forEach(p => cards.set(p.id, mkCard(p, true)));
    main.appendChild(sec);
  });

  function draw(c) {
    if (!c.ctx) return;
    c.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { renderPreset(c.ctx, c.p, clock + c.p.n * 0.37, custom, DPR); } catch (e) { if (!c.err) { c.err = 1; console.error(c.p.id, c.p.name, e); } }
  }

  /* ---- 動く見本の帯：その巻の見本を、横に流して見せる ---- */
  const STRIP = {
    ae: ['AE-058', 'AE-031', 'AE-040', 'AE-052', 'AE-076', 'AE-097', 'AE-137', 'AE-150', 'AE-186', 'AE-222', 'AE-233', 'AE-260', 'AE-283', 'AE-300'],
    mg: ['MG-006', 'MG-011', 'MG-023', 'MG-036', 'MG-045', 'MG-052', 'MG-062', 'MG-066', 'MG-076', 'MG-083', 'MG-097', 'MG-102', 'MG-108', 'MG-129'],
    vo: ['VT-001', 'VT-022', 'VT-047', 'VT-059', 'VT-063', 'VT-070', 'VT-082', 'VT-091', 'VT-097', 'VT-104', 'VT-110', 'VT-119', 'VT-124', 'VT-128'],
  };
  const strip = $('#strip');
  let frames = [], stripOn = true, stripHover = false, sOff = 0, stripW = 1200;
  function buildStrip() {
    frames.forEach(f => f.el.remove());
    frames = STRIP[book].map(id => byId[id]).filter(Boolean).map(p => {
      const el = document.createElement('button');
      el.className = 'fr'; el.dataset.id = p.id; el.tabIndex = -1;
      el.innerHTML = `<canvas></canvas><span><b>${p.id}</b></span>`;
      el.querySelector('span').appendChild(document.createTextNode(nameOf(p)));
      const cv = el.querySelector('canvas'); cv.width = Math.round(200 * DPR); cv.height = Math.round(112.5 * DPR);
      strip.appendChild(el);
      return { p, el, ctx: cv.getContext('2d'), drawn: false };
    });
    stripW = strip.clientWidth;
  }
  new IntersectionObserver(es => { stripOn = es[0].isIntersecting; }).observe(strip);
  strip.addEventListener('mouseenter', () => { stripHover = true; });
  strip.addEventListener('mouseleave', () => { stripHover = false; });
  strip.addEventListener('click', e => { const f = e.target.closest('.fr'); if (f) openModal(byId[f.dataset.id], f.querySelector('canvas')); });
  window.addEventListener('resize', () => { stripW = strip.clientWidth; });
  function tickStrip(dt) {
    if (!stripOn || !frames.length) return;
    if (!paused && !stripHover && !calm.matches) sOff += dt * 22;
    const step = 218, total = frames.length * step, s = 200 / W * DPR;
    frames.forEach((f, i) => {
      const x = ((i * step - sOff) % total + total) % total - step + 34;
      f.el.style.transform = `translateX(${x.toFixed(1)}px)`;
      if (x > stripW || (paused && f.drawn)) return;
      f.ctx.setTransform(s, 0, 0, s, 0, 0);
      try { renderPreset(f.ctx, f.p, clock + f.p.n * 0.37, custom, s); f.drawn = true; } catch (e) {}
    });
  }

  /* ---- 拡大表示 ---- */
  const modal = $('#modal'), bigc = $('#bigc'), bctx = bigc.getContext('2d');
  let cur = null, opener = null;
  const BS = 2.4;
  bigc.width = W * BS * DPR; bigc.height = H * BS * DPR;
  function fillModal() {
    if (!cur) return;
    const p = cur, L = t(), on = picks.includes(p.id), f = favs.includes(p.id);
    $('#mId').textContent = p.id; $('#mName').textContent = nameOf(p); $('#mSub').textContent = LANG === 'ja' ? p.name : '';
    $('#mPath').textContent = ({ mg: 'Motion Graphics', vo: 'Audio Tags', ae: 'Text' })[p.book] + ` ＞ ${p.cat}` + (LANG === 'ja' ? `（${p.catJa}）` : '') + (p.src ? ' ／ ' + Lx(VO.src[p.src][0], VO.src[p.src][1]) : '');
    $('#mVoice').hidden = p.book !== 'vo'; if (p.book === 'vo') $('#mVoice').querySelectorAll('.vp').forEach(b => paintPlay(b, p));
    $('#mSpec').textContent = promptOf(p);
    const pk = $('#mPick'); pk.innerHTML = `<i class="box">${ic('check')}</i><span>${on ? L.unpick : L.pick}</span>`; pk.classList.toggle('on', on); pk.setAttribute('aria-pressed', on);
    const fb = $('#mFav'); fb.innerHTML = ic('star') + `<span>${L.favWord}</span>`; fb.classList.toggle('on', f); fb.title = f ? L.favOn : L.favOff; fb.setAttribute('aria-pressed', f);
    $('#mCopy').innerHTML = ic('copy') + `<span>${L.copyOne}</span>`;
    modal.dataset.b = p.book;
  }
  /* 押した見本が、そのまま大きくなって拡大表示になる（View Transitions が使えるブラウザだけ。なければ普通に開く） */
  const canVT = () => !!document.startViewTransition && !calm.matches && document.visibilityState === 'visible';
  /* 切り替えが途中で中止されても、中身の入れ替え（update）は必ず1回だけ行う */
  function vt(update, done) {
    let ran = false; const run = () => { if (!ran) { ran = true; update(); } };
    try { const tr = document.startViewTransition(run); tr.ready.catch(() => {}); tr.updateCallbackDone.catch(() => {}); tr.finished.catch(() => {}).then(() => { run(); if (done) done(); }); }
    catch (e) { run(); if (done) done(); }
  }
  const inViewport = el => { if (!el || !el.isConnected || !el.offsetParent) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  let fromEl = null;
  function openModal(p, from) {
    const show = () => { if (!cur) opener = document.activeElement; cur = p; fillModal(); modal.classList.add('show'); history.replaceState(null, '', '#' + p.id); $('#mClose').focus({ preventScroll: true }); };
    if (!cur && from && canVT() && inViewport(from)) {
      fromEl = from; from.style.viewTransitionName = 'plate'; modal.classList.add('vt');
      vt(() => { from.style.viewTransitionName = ''; $('.big').style.viewTransitionName = 'plate'; show(); }, () => { $('.big').style.viewTransitionName = ''; modal.classList.remove('vt'); });
    } else { fromEl = null; show(); }
  }
  function closeModal() {
    if (!cur) return;
    const hide = () => { stopVoice(); modal.classList.remove('show'); cur = null; history.replaceState(null, '', location.pathname + location.search); if (opener && opener.focus) opener.focus({ preventScroll: true }); opener = null; };
    const c = cards.get(cur.id), back = inViewport(fromEl) && fromEl.closest('[data-id]').dataset.id === cur.id ? fromEl : (c && !c.el.hidden ? c.el.querySelector('.stage') : null);
    if (canVT() && inViewport(back)) {
      $('.big').style.viewTransitionName = 'plate';
      vt(() => { $('.big').style.viewTransitionName = ''; hide(); back.style.viewTransitionName = 'plate'; }, () => { back.style.viewTransitionName = ''; });
    } else hide();
    fromEl = null;
  }
  const step = d => { const l = orderNow().filter(p => !cards.get(p.id).el.hidden), i = l.indexOf(cur); if (l.length) { cur = l[(i + d + l.length) % l.length]; fillModal(); history.replaceState(null, '', '#' + cur.id); } };

  /* ---- 選ぶ・お気に入り・履歴 ---- */
  function toggle(id) {
    const i = picks.indexOf(id);
    if (i >= 0) picks.splice(i, 1);
    else { picks.push(id); hist = [id, ...hist.filter(x => x !== id)]; store('ae-history', hist); }
    store('ae-picks', picks); sync();
  }
  function toggleFav(id) {
    const i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    store('ae-favs', favs); sync();
  }
  function sync() {
    const L = t();
    rebuildMirrors();
    cards.forEach(paint); mirrors.forEach(paint);
    $('#tray').classList.toggle('show', picks.length > 0);
    $('#trayN').textContent = picks.length;
    $('#trayIds').innerHTML = picks.map(id => `<span class="tag" data-b="${byId[id].book}">${id}<button data-rm="${id}" aria-label="${id}${L.remove}">${ic('x')}</button></span>`).join('');
    buildViews(); fillModal(); place(); applyFilter();
  }

  /* ---- 並べ方 ---- */
  const isFav = p => favs.includes(p.id);
  const histOf = () => hist.map(id => byId[id]).filter(inBook);
  const orderNow = () => {
    const all = PRESETS.filter(inBook);
    if (view === 'fav') return all.filter(isFav);
    if (view === 'hist') return histOf();
    return all;
  };
  function place() {
    /* すでに正しい章にある版は動かさない（動かすと画面の位置がずれる） */
    if (view === 'all') bookCats().forEach(cat => { const list = PRESETS.filter(p => p.ci === CATS.indexOf(cat)); if (list.some(p => cards.get(p.id).el.parentElement !== cat.grid)) list.forEach(p => cat.grid.appendChild(cards.get(p.id).el)); });
    else orderNow().forEach(p => flat.appendChild(cards.get(p.id).el));
  }
  const catLabel = c => (LANG === 'ja' && c.book !== 'ae' ? c.ja : c.name);
  function buildBooks() {
    const L = t(), n = b => PRESETS.filter(p => p.book === b).length;
    $('#books').innerHTML = BOOKS.map(b => `<button class="${b === book ? 'on' : ''}" data-b="${b}" aria-pressed="${b === book}"><span class="vn">${VOLNO[b]}</span><span class="vt">${L.books[b].tab}</span><span class="vc">${PREFIX[b]} ${n(b)}</span><span class="vs">${L.books[b].sub}</span></button>`).join('');
    $('#bnav').innerHTML = BOOKS.map(b => `<button class="${b === book ? 'on' : ''}" data-b="${b}" aria-pressed="${b === book}" aria-label="${L.books[b].tab}"><span class="vn">${VOLNO[b]}</span><span class="vt">${L.books[b].mini}</span></button>`).join('');
  }
  function buildViews() {
    const L = t(), all = PRESETS.filter(inBook), mk = (label, n, v) => `<button class="${view === v ? 'on' : ''}" data-v="${v}" role="tab" aria-selected="${view === v}">${label}<i>${n}</i></button>`;
    $('#views').innerHTML = mk(L.vAll, all.length, 'all') + mk(L.favWord, all.filter(isFav).length, 'fav') + mk(L.vHist, histOf().length, 'hist');
  }
  let spy = '';
  function buildToc(rows) {
    const html = rows.map(r => (r.sp ? '<span class="sp"></span>' : `<button data-go="${r.id}" class="${r.dim ? 'dim ' : ''}${spy === r.id ? 'on' : ''}"><span class="tn">${r.no}</span><span class="tt">${r.label}</span><span class="tc">${r.n}</span></button>`)).join('');
    $('#toc').innerHTML = html;
    $('#mtoc').innerHTML = rows.filter(r => !r.sp && !r.dim).map(r => `<button data-go="${r.id}" class="${spy === r.id ? 'on' : ''}">${r.label}</button>`).join('');
    $('#tTocH').hidden = !rows.length; $('#mtoc').hidden = !rows.length;
  }
  function applyFilter() {
    const L = t(), words = query.toLowerCase().split(/\s+/).filter(Boolean), inView = new Set(orderNow().map(p => p.id));
    let shown = 0, favShown = 0, histShown = 0;
    const nCat = CATS.map(() => 0);
    PRESETS.forEach(p => {
      const hay = `${p.id} ${p.name} ${p.nameJa} ${p.ja} ${p.en} ${p.cat} ${p.catJa} ${p.line || ''} ${p.src ? VO.src[p.src].join(' ') : ''}`.toLowerCase();
      const ok = inView.has(p.id) && words.every(w => hay.includes(w));
      cards.get(p.id).el.hidden = !ok;
      if (ok) { shown++; nCat[p.ci]++; }
    });
    mirrors.forEach(c => { const ok = !cards.get(c.p.id).el.hidden; c.el.hidden = !ok; if (ok) { if (c.top === 'fav') favShown++; else histShown++; } });
    CATS.forEach((cat, ci) => { cat.sec.hidden = view !== 'all' || !nCat[ci]; });
    $('#favTop').hidden = view !== 'all' || favShown === 0;
    $('#histTop').hidden = view !== 'all' || histShown === 0;
    $('#histTopH').textContent = L.histH; $('#histTopSub').textContent = L.histSub; $('#clearHist2').textContent = L.clearHist;
    $('#favTopH').textContent = L.favH; $('#favTopSub').textContent = L.favSub;
    $('#flatSec').hidden = view === 'all' || shown === 0;
    $('#flatH').textContent = view === 'fav' ? L.favH : L.histH;
    $('#flatSub').textContent = view === 'fav' ? L.favSub : L.histSub;
    $('#clearHist').hidden = view !== 'hist'; $('#clearHist').textContent = L.clearHist;
    $('#count').textContent = L.shown(shown);
    $('#empty').hidden = shown > 0;
    $('#empty').textContent = view === 'fav' && !inView.size ? L.emptyFav : view === 'hist' && !inView.size ? L.emptyHist : L.empty;
    const rows = [];
    if (view === 'all') {
      if (favShown) rows.push({ id: 'favTop', no: '—', label: L.favH, n: favShown });
      if (histShown) rows.push({ id: 'histTop', no: '—', label: L.histH, n: histShown });
      if (rows.length) rows.push({ sp: 1 });
      bookCats().forEach(cat => { const ci = CATS.indexOf(cat); rows.push({ id: 'c' + ci, no: pad(noInBook.get(cat)), label: catLabel(cat), n: nCat[ci], dim: !nCat[ci] }); });
    }
    buildToc(rows);
  }
  /* いま読んでいる章を、目次で示す */
  const seen = new Set();
  const spyIo = new IntersectionObserver(es => {
    es.forEach(e => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
    const first = $$('section.cat').find(s => seen.has(s.id) && !s.hidden);
    const id = first ? first.id : '';
    if (id !== spy) { spy = id; $$('[data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === spy)); const m = $('#mtoc .on'); if (m && m.scrollIntoView && $('#mtoc').offsetParent) $('#mtoc').scrollLeft = m.offsetLeft - 20; }
  }, { rootMargin: '-90px 0px -55% 0px' });
  $$('section.cat').forEach(s => spyIo.observe(s));

  /* ---- 言語・巻・色の切り替え ---- */
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const L = t(), b = $('#theme'), toNight = theme === 'paper';
    b.innerHTML = ic(toNight ? 'moon' : 'sun') + `<span>${toNight ? L.night : L.paper}</span>`;
    b.title = toNight ? L.themeToNight : L.themeToPaper; b.setAttribute('aria-label', b.title);
  }
  function applyLang() {
    const L = t(), B = L.books[book], all = PRESETS.filter(inBook);
    document.documentElement.lang = LANG; document.documentElement.dataset.book = book;
    document.title = LANG === 'ja' ? '動きの見本帳' : 'Motion Specimen Book';
    $('#tTag').textContent = L.tag; $('#tKicker').textContent = B.kicker; $('#tH1').innerHTML = B.h1; $('#tLead').textContent = B.lead; $('#volNo').textContent = VOLNO[book];
    roll($('#stN'), all.length); roll($('#stC'), bookCats().length); $('#stId').textContent = `${PREFIX[book]}-001–${pad(all.length, 3)}`;
    $('#tSt1').textContent = L.st1; $('#tSt2').textContent = L.st2; $('#tSt3').textContent = L.st3; $('#tHow').textContent = L.how.toUpperCase();
    $('#tHowList').innerHTML = L.howList.map(s => `<li>${s}</li>`).join(''); $('#tNote').innerHTML = B.note; $('#tNoteS').textContent = B.noteS; $('#tFoot').innerHTML = B.foot;
    $('#q').placeholder = L.q; $('#q').setAttribute('aria-label', L.q); $('#memo').placeholder = L.memo; $('#memo').setAttribute('aria-label', L.memo);
    $('#tSpeed').textContent = L.speed; $('#speed').setAttribute('aria-label', L.speed); $('#sample').placeholder = L.sample; $('#tSampleL').textContent = L.sampleL; $('#tSampleH').textContent = L.sampleH;
    $('.samplebox').hidden = book !== 'ae';
    /* 声のクレジット：ElevenLabs 上の名前と Voice ID、声のページへのリンク */
    const VV = (window.VO_AUDIO && VO_AUDIO.meta && VO_AUDIO.meta.voices) || null, vc = $('#voCredit');
    vc.hidden = book !== 'vo' || !VV;
    if (VV) vc.innerHTML = `<h2>${L.creditH}</h2><dl>` + ['m', 'f'].filter(v => VV[v] && Object.keys(VO_AUDIO[v] || {}).length).map(v => `<dt>${v === 'm' ? L.male : L.female}</dt><dd><b>${VV[v].name}</b><span>ElevenLabs</span><span>Voice ID <code>${VV[v].id}</code></span><a href="https://elevenlabs.io/app/voice-library?voiceId=${VV[v].id}" target="_blank" rel="noopener">${L.creditLink}</a></dd>`).join('') + `</dl><p>${L.creditNote}</p>`;
    paintDetail(); paintPause(); $('#copyIndex').innerHTML = ic('copy') + `<span>${L.copyIndex}</span>`; $('#clear').textContent = L.clear; $('#copyPicks').innerHTML = ic('copy') + `<span>${L.copyPicks}</span>`; $('#copyPicks').classList.toggle('pri', !AGENT);
    $('#sendAI').hidden = !AGENT; if (!$('#sendAI').disabled) $('#sendAI').innerHTML = ic('right') + `<span>${L.sendAI}</span>`; $('#agentNote').hidden = !AGENT; $('#agentNote').textContent = L.agentNote;
    $('#mPrev').innerHTML = ic('left'); $('#mPrev').setAttribute('aria-label', L.prev); $('#mPrev').title = L.prev;
    $('#mNext').innerHTML = ic('right'); $('#mNext').setAttribute('aria-label', L.next); $('#mNext').title = L.next;
    $('#mClose').innerHTML = ic('x'); $('#mClose').setAttribute('aria-label', L.close); $('#mClose').title = L.close;
    $('#colo').innerHTML = `<span>${LANG === 'ja' ? '動きの見本帳' : 'MOTION SPECIMEN BOOK'}</span>` + BOOKS.map(b => `<span data-b="${b}"><i></i>${VOLNO[b]} ${L.books[b].tab} — ${PRESETS.filter(p => p.book === b).length}</span>`).join('') + `<span>${Lx('全', 'Total ')}${PRESETS.length}${Lx('見本', ' samples')}</span>`;
    $('#tTocH').textContent = L.toc; $('#tTray').textContent = L.tray; $('#tKeys').textContent = L.keys;
    $('#keys').innerHTML = `<h4>${L.keys}</h4><dl>${L.keyList.map(([k, d]) => `<dt>${k.split(/\s+/).map(x => `<kbd>${x}</kbd>`).join(' ')}</dt><dd>${d}</dd>`).join('')}</dl>`;
    $('#lang').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === LANG));
    CATS.forEach((c, ci) => { c.hEl.textContent = catLabel(c); c.subEl.textContent = c.book !== 'ae' ? (LANG === 'ja' ? c.name : '') : (LANG === 'ja' ? c.ja : CAT_EN[ci]); });
    applyTheme(); buildBooks(); buildStrip(); sync();
    if (paused) active.forEach(draw);
  }
  /* 数字を0から回して見せる（巻を替えたとき） */
  function roll(el, n) {
    if (calm.matches || el.dataset.n === String(n)) { el.textContent = n; el.dataset.n = n; return; }
    el.dataset.n = n; const t0 = performance.now(), from = +el.textContent || 0;
    const tick = now => { const k = Math.min(1, (now - t0) / 620), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (n - from) * e); if (k < 1 && el.dataset.n === String(n)) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  /* 説明とボタンは、ふだんは隠す。帯のボタンで全カードまとめて開閉、カードの矢印で1枚ずつ開閉 */
  let detail = false; try { detail = localStorage.getItem('ae-detail') === '1'; } catch (e) {}
  function paintDetail() { const L = t(); document.documentElement.dataset.detail = detail ? '1' : '0'; $('#detail').textContent = detail ? L.detailNone : L.detailAll; $('#detail').setAttribute('aria-pressed', detail); }
  function paintPause() { const L = t(); $('#pause').innerHTML = ic(paused ? 'play' : 'pause', paused ? 'fill' : '') + `<span>${paused ? L.play : L.pause}</span>`; $('#pause').setAttribute('aria-pressed', paused); }
  function togglePause() { paused = !paused; paintPause(); }
  let wiping = 0;
  function setBook(b) {
    if (!BOOKS.includes(b) || b === book) return;
    const go = () => { stopVoice(); book = b; view = 'all'; store('ae-book', b); applyLang(); const top = $('.open').offsetTop + $('.open').offsetHeight; if (window.scrollY > top) window.scrollTo(0, top); };
    if (calm.matches || document.hidden) return go();
    /* 刷り色が画面を横切る間に、中身を入れ替える */
    const w = $('#wipe'); clearTimeout(wiping);
    w.dataset.b = b; w.textContent = VOLNO[b]; w.classList.remove('run'); void w.offsetWidth; w.classList.add('run');
    wiping = setTimeout(go, 250);
    setTimeout(() => { if (w.dataset.b === b) w.classList.remove('run'); }, 900); /* 画面が裏に回って動きが止まっても、色の幕が残らないように */
  }
  $('#wipe').addEventListener('animationend', e => e.target.classList.remove('run'));
  const toggleKeys = on => { const k = $('#keys'); k.hidden = on == null ? !k.hidden : !on; $('#keysBtn').setAttribute('aria-expanded', !k.hidden); };

  /* ---- 操作 ---- */
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { const s = document.getElementById(go.dataset.go); if (s) s.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' }); return; }
    const bk = e.target.closest('#books [data-b], #bnav [data-b]');
    if (bk) return setBook(bk.dataset.b);
    const card = e.target.closest('.plate'); if (!card) return;
    const p = byId[card.dataset.id];
    if (e.target.closest('.vp')) playVoice(p, e.target.closest('.vp').dataset.v);
    else if (e.target.closest('.fav')) toggleFav(p.id);
    else if (e.target.closest('.mt')) { const o = card.classList.toggle('open'); e.target.closest('.mt').setAttribute('aria-expanded', o); }
    else if (e.target.closest('.pick, .pickb')) toggle(p.id);
    else if (e.target.closest('.cpb')) copy(promptOf(p) + '\n', t().copied(p.id), e.target.closest('.cpb'));
    else if (e.target.closest('.cp')) copy(promptOf(p) + '\n', t().copied(p.id), e.target.closest('.cp'));
    else if (e.target.closest('.stage')) openModal(p, e.target.closest('.stage'));
  });
  $('#views').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.v; sync(); });
  $('#lang').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; LANG = b.dataset.l; store('ae-lang', LANG); applyLang(); });
  $('#theme').addEventListener('click', () => { theme = theme === 'paper' ? 'night' : 'paper'; store('ae-theme', theme); applyTheme(); });
  $('#keysBtn').addEventListener('click', () => toggleKeys());
  $('#mast').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: calm.matches ? 'auto' : 'smooth' }); });
  $('#q').addEventListener('input', e => { query = e.target.value; applyFilter(); });
  $('#sample').addEventListener('input', e => { const el = e.target, v = el.value.trim(); el.style.height = 'auto'; el.style.height = (el.scrollHeight + el.offsetHeight - el.clientHeight + 2) + 'px'; custom = v ? v.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 4) : null; if (custom && !custom.length) custom = null; frames.forEach(f => { f.drawn = false; }); if (paused) active.forEach(draw); });
  $('#speed').addEventListener('input', e => { speed = +e.target.value; $('#speedV').textContent = speed + 'x'; });
  $('#pause').addEventListener('click', togglePause);
  $('#detail').addEventListener('click', () => { detail = !detail; store('ae-detail', detail ? '1' : '0'); $$('.plate.open').forEach(c => c.classList.remove('open')); paintDetail(); });
  $('#copyIndex').addEventListener('click', e => copy(indexText(), t().copiedIdx(PRESETS.filter(inBook).length), e.currentTarget));
  $('#copyPicks').addEventListener('click', e => copy(picksText(), t().copiedN(picks.length), e.currentTarget));
  async function sendAI() {
    if (!AGENT || !picks.length) return;
    const b = $('#sendAI'), url = `http://127.0.0.1:${AGENT[1]}/__picked?token=${AGENT[2]}&lang=${LANG}&ids=${picks.join(',')}&memo=${encodeURIComponent($('#memo').value.trim())}`;
    b.disabled = true;
    /* 同じパソコンの中で待っているスキルへ渡す。直接送れないブラウザでは、ページを移動して渡す */
    try { const r = await fetch(url); if (r.ok) { toast(t().sent); b.innerHTML = ic('check') + `<span>${t().sentShort}</span>`; return; } } catch (e) {}
    location.href = url + '&nav=1';
  }
  $('#sendAI').addEventListener('click', sendAI);
  $('#clear').addEventListener('click', () => { picks = []; store('ae-picks', picks); sync(); });
  $('#trayIds').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) toggle(b.dataset.rm); });
  $('#trayToggle').addEventListener('click', () => { const m = $('#tray').classList.toggle('min'); $('#trayToggle').setAttribute('aria-expanded', !m); });
  const clearHist = () => { hist = hist.filter(id => byId[id].book !== book); store('ae-history', hist); sync(); };
  $('#clearHist').addEventListener('click', clearHist);
  $('#clearHist2').addEventListener('click', clearHist);
  $('#mVoice').addEventListener('click', e => { const b = e.target.closest('.vp'); if (b && cur) playVoice(cur, b.dataset.v); });
  $('#mClose').addEventListener('click', closeModal);
  $('#mPrev').addEventListener('click', () => step(-1));
  $('#mNext').addEventListener('click', () => step(1));
  $('#mPick').addEventListener('click', () => cur && toggle(cur.id));
  $('#mFav').addEventListener('click', () => cur && toggleFav(cur.id));
  const copyCur = () => cur && copy(promptOf(cur) + '\n', t().copied(cur.id), $('#mCopy'));
  $('#mCopy').addEventListener('click', copyCur);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    const a = document.activeElement, typing = a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== 'range';
    if (e.key === 'Escape') { if (cur) closeModal(); else if (!$('#keys').hidden) toggleKeys(false); else if (typing) a.blur(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (cur) {
      if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
      else if (!typing && /^[pP]$/.test(e.key)) toggle(cur.id); else if (!typing && /^[fF]$/.test(e.key)) toggleFav(cur.id); else if (!typing && /^[cC]$/.test(e.key)) copyCur();
      return;
    }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
    else if (e.key === '1' || e.key === '2' || e.key === '3') setBook(BOOKS[+e.key - 1]);
    else if (e.key === ' ' && a.tagName !== 'BUTTON' && book !== 'vo') { e.preventDefault(); togglePause(); }
    else if (e.key === '?') toggleKeys();
  });

  let progQ = false;
  const setProg = () => { progQ = false; const max = document.documentElement.scrollHeight - innerHeight; $('#bar').style.setProperty('--prog', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0); };
  window.addEventListener('scroll', () => { if (!progQ) { progQ = true; requestAnimationFrame(setProg); } }, { passive: true });

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!paused) { clock += dt * speed; active.forEach(draw); }
    tickStrip(dt);
    if (cur) { bctx.setTransform(BS * DPR, 0, 0, BS * DPR, 0, 0); try { renderPreset(bctx, cur, clock + cur.n * 0.37, custom, BS * DPR); } catch (e) {} }
    requestAnimationFrame(frame);
  }

  /* 以前から選択中だったものは履歴にも入れておく */
  picks.forEach(id => { if (!hist.includes(id)) hist.push(id); });
  /* #MG-012 のような番号つきのリンクで開いたら、その見本の巻に切り替えて拡大表示する */
  const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)).toUpperCase(), p = byId[h]; if (!p || p === cur) return; if (p.book !== book) { book = p.book; store('ae-book', book); applyLang(); } openModal(p); cards.get(h).el.scrollIntoView({ block: 'center' }); };
  applyLang();
  fromHash();
  window.addEventListener('hashchange', fromHash);
  requestAnimationFrame(frame);
  window.__ae = { PRESETS, cards, active, renderPreset, promptOf, picksText, indexText, setBook, state: () => ({ picks, favs, hist, view, lang: LANG, book, theme, mirrors: mirrors.length }) };
})();
