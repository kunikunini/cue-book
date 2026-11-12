'use strict';
/* AIに渡す仕様文を、設定から自動で組み立てる（日本語・英語） */
const EZ_EN = { lin: 'linear', out: 'ease-out (slows at the end)', in: 'ease-in (accelerates)', io: 'ease-in-out', back: 'overshoot (goes past, then settles back)', bounce: 'bounce (several rebounds)', el: 'elastic (springy wobble, then stops)', exp: 'sharp deceleration (arrives fast, stops dead)', step: 'stepped (jerky increments)' };
const P_JA = { x: '横位置', y: '縦位置', s: 'スケール', sx: '横スケール', sy: '縦スケール', r: '回転', b: 'ブラー', bx: '横方向の流れブラー', tr: '字間', rx: 'X軸回転（3D・前後に倒れる向き）', ry: 'Y軸回転（3D・扉が開く向き）', z: '奥行き', sk: '傾き（スキュー）', c: '中央への寄せ' };
const P_EN = { x: 'Horizontal position', y: 'Vertical position', s: 'Scale', sx: 'Horizontal scale', sy: 'Vertical scale', r: 'Rotation', b: 'Blur', bx: 'Horizontal motion blur', tr: 'Tracking', rx: 'X-axis rotation (3D, tipping forward/back)', ry: 'Y-axis rotation (3D, like a door)', z: 'Depth', sk: 'Skew', c: 'Pull toward centre' };
function pv(k, v) {
  const em = n => (Math.abs(n) / 30).toFixed(1).replace(/\.0$/, ''), pc = n => Math.round(Math.abs(n) / 30 * 100);
  if (k === 'x') return Lx(`${v > 0 ? '右' : '左'}へ文字の高さ${em(v)}個ぶんずれた位置`, `offset ${em(v)}× the text height to the ${v > 0 ? 'right' : 'left'}`);
  if (k === 'y') return Lx(`${v > 0 ? '下' : '上'}へ文字の高さ${em(v)}個ぶんずれた位置`, `offset ${em(v)}× the text height ${v > 0 ? 'down' : 'up'}`);
  if (k === 's' || k === 'sx' || k === 'sy') return `${Math.round((1 + v) * 100)}%`;
  if (k === 'r' || k === 'rx' || k === 'ry' || k === 'sk') return `${v}°`;
  if (k === 'b' || k === 'bx') return Lx(`文字の高さの${pc(v)}%ぶんのぼけ`, `blur of ${pc(v)}% of the text height`);
  if (k === 'tr') return Lx(`1文字あたり文字の高さの${pc(v)}%${v > 0 ? '広い' : '狭い'}`, `${pc(v)}% of the text height ${v > 0 ? 'wider' : 'tighter'} per character`);
  if (k === 'z') return v > 0 ? Lx('カメラ側（手前）に大きく寄った位置', 'pushed far toward the camera') : Lx('奥に遠ざかった位置', 'pushed far into the distance');
  if (k === 'c') return Lx('全文字が中央の一点に集まった状態', 'all characters gathered at one central point');
  return String(v);
}
const restOf = k => ({ s: '100%', sx: '100%', sy: '100%', r: '0°', rx: '0°', ry: '0°', sk: '0°', b: Lx('ぼけなし', 'no blur'), bx: Lx('ぼけなし', 'no blur'), tr: Lx('通常の字間', 'normal tracking') }[k] || Lx('定位置', 'rest position'));
function specLines(P) {
  const c = P.cfg, T = c.T || 4, out = [];
  const M = {
    in: Lx('登場（何もない状態から文字が現れて、定位置で止まる）', 'Entrance (text appears from nothing and stops at its rest position)'),
    out: Lx('退場（定位置に見えている文字が消えていく）', 'Exit (visible text at rest disappears)'),
    io: Lx('登場して少し止まり、退場する', 'Enters, holds briefly, then exits'),
    loop: Lx('くり返し（文字は出たまま動き続ける）', 'Loop (text stays visible and keeps moving)'),
    path: Lx('パス（道すじ）に沿って文字列が進む', 'The text travels along a path'),
    custom: Lx('図形や文字を直接描いて動かす見本', 'A sample drawn directly with shapes and text'),
  };
  out.push(Lx('種類: ', 'Type: ') + M[c.m]);
  const U = { c: Lx('1文字ずつ', 'per character'), w: Lx('単語ごと', 'per word'), l: Lx('行ごと', 'per line'), a: Lx('全体まとめて', 'whole text at once') };
  const OR = { f: Lx('先頭（左・上）から順', 'first to last (left/top first)'), b: Lx('末尾（右・下）から順', 'last to first (right/bottom first)'), r: Lx('ランダムな順', 'random order'), c: Lx('中央から外側へ', 'centre outward'), e: Lx('両端から中央へ', 'both ends toward the centre') };
  if (c.m === 'in' || c.m === 'out' || c.m === 'io') {
    const list = c.an ? [c, ...c.an] : [c];
    list.forEach(A => {
      out.push(Lx(`動かす単位: ${U[A.u || 'c']}／順番: ${OR[A.ord || 'f']}`, `Unit: ${U[A.u || 'c']} / Order: ${OR[A.ord || 'f']}`));
      if (A.p) {
        const arr = [];
        for (const k in A.p) {
          if (k === 'o') continue;
          if (k === 'ch') { if (A.p[k]) arr.push(Lx('文字の中身: でたらめな英数字に高速で入れ替わる ⇄ 正しい文字', 'Glyph: rapidly cycling random letters and digits ⇄ the correct character')); continue; }
          let s = `${Lx(P_JA[k], P_EN[k])}: ${pv(k, A.p[k])} ⇄ ${restOf(k)}`;
          if (A.rn && (' ' + A.rn + ' ').includes(' ' + k + ' ')) s += Lx('（向きと量は単位ごとにランダム）', ' (direction and amount random per unit)');
          if (A.alt && (k === 'x' || k === 'y' || k === 'r')) s += Lx('（1つおきに逆向き）', ' (every other unit reversed)');
          arr.push(s);
        }
        const o = A.p.o != null ? A.p.o : A.o != null ? A.o : -1;
        if (o) arr.push(`${Lx('不透明度', 'Opacity')}: ${Math.round((1 + o) * 100)}% ⇄ 100%`);
        out.push(Lx('変化する項目（左＝変化中の状態、右＝定位置の状態。登場は左→右、退場は右→左）:', 'Animated properties (left = displaced state, right = rest state; entrances go left→right, exits right→left):'));
        arr.forEach(s => out.push('  - ' + s));
      } else out.push(Lx('変化の中身: 上の「動き」の説明どおりの曲線的な動き', 'Change: the curved motion described above (see the reference implementation)'));
      const soft = A.soft == null ? 0.5 : A.soft;
      out.push(Lx('重なり方: ', 'Overlap: ') + (soft <= 0 ? Lx('1つずつ瞬時に切り替わる（重なりなし）', 'each unit switches instantly, no overlap') : soft >= 2 ? Lx('ほぼ全部が同時に動く', 'nearly everything moves together') : Lx(`前の単位が動き終わる前に次が動き出す（1単位の動きは全体の約${Math.round(soft / (1 + soft) * 100)}%の長さ）`, `the next unit starts before the previous one finishes (each unit takes about ${Math.round(soft / (1 + soft) * 100)}% of the total duration)`)));
      const ek = c.m === 'out' ? (A.eo || 'in') : (A.e || 'out');
      out.push(Lx('緩急: ', 'Easing: ') + Lx(EZ_JA[ek], EZ_EN[ek]));
    });
    const d = ((c.m === 'io' ? 0.35 : (c.d || 0.5)) * T).toFixed(1);
    out.push(Lx(`目安の長さ: 変化全体で約${d}秒`, `Approximate duration: about ${d}s for the whole change`));
  } else if (c.m === 'path') {
    const PM = {
      through: Lx('画面外から入り、パスを端から端まで通り抜けて出ていく', 'enters from off-screen, runs the whole path end to end, and exits'),
      on: Lx('パスの始点側から滑り込み、中央で止まる', 'slides in from the start of the path and stops at its middle'),
      off: Lx('中央に止まった状態から、パスの終点側へ滑り出ていく', 'starts at rest in the middle and slides out toward the end of the path'),
      onoff: Lx('パスに沿って入ってきて中央で止まり、また先へ出ていく', 'enters along the path, stops in the middle, then continues out'),
      loop: Lx('閉じたパスの上を回り続ける', 'keeps circling a closed path'),
      pp: Lx('パスの上を行ったり来たりする', 'travels back and forth along the path'),
      still: Lx('文字列はパスの中央に乗ったまま、パスの形のほうが動く', 'the text stays centred on the path while the path itself changes shape'),
    };
    out.push(Lx('進み方: ', 'Travel: ') + PM[c.pm || 'through']);
    out.push(Lx('文字の向き: 各文字はパスの接線に沿って傾く（After Effects の「パスのオプション」でパスにテキストを沿わせた状態）', 'Orientation: each character follows the tangent of the path (text on a path via Path Options in After Effects)'));
    out.push(Lx(`目安の長さ: 1周期 約${T}秒`, `Approximate duration: one cycle of about ${T}s`));
  } else if (c.m === 'custom') out.push(c.lp ? Lx(`目安の長さ: 1周期 約${T}秒で、切れ目なくくり返す`, `Approximate duration: loops seamlessly about every ${T}s`) : Lx(`目安の長さ: 見本は約${T}秒で1回。動きそのものは最初の5〜7割で終わり、残りは止め`, `Approximate duration: one pass of about ${T}s; the motion itself finishes in the first 50–70%, the rest is a hold`));
  else out.push(Lx(`目安の長さ: 1周期 約${T}秒でくり返す`, `Approximate duration: repeats about every ${T}s`));
  return out.concat(refLines(c, T));
}
/* 言葉だけでは伝わりにくい動きのために、見本を動かしている式そのものを添える */
const HELP = [
  [/\bS\(/, 'S(x)=sin(2πx)', 'S(x)=sin(2πx)'], [/\bCs\(/, 'Cs(x)=cos(2πx)', 'Cs(x)=cos(2πx)'], [/\bcl\(/, 'cl(v)=vを0〜1に丸める', 'cl(v)=clamp v to 0..1'], [/\bfr\(/, 'fr(x)=xの小数部分', 'fr(x)=fractional part of x'], [/\bmix\(/, 'mix(a,b,k)=aからbへk(0〜1)で補間', 'mix(a,b,k)=lerp from a to b by k'],
  [/\bsst\(/, 'sst(a,b,x)=xがa→bの間に0→1へなめらかに変わる', 'sst(a,b,x)=smoothstep from 0 to 1 as x goes a→b'], [/\bhash\(/, 'hash(n)=nから決まる0〜1の固定の乱数', 'hash(n)=fixed pseudo-random 0..1 derived from n'], [/\bnz\(/, 'nz(k,x)=なめらかな乱れ(-1〜1)。kは系列の番号、xが1進むと元に戻る', 'nz(k,x)=smooth noise (-1..1); k picks the series, period 1 in x'],
  [/\bwv\(/, 'wv(u,t,w,sp)=左から右へ流れる波。x=fr(t-u*sp)がw未満の間だけsin(πx/w)、それ以外は0', 'wv(u,t,w,sp)=travelling wave: with x=fr(t-u*sp), sin(πx/w) while x<w, otherwise 0'], [/\bwq\(/, 'wq(u,t,w,sp)=同じ波の進み具合。x=fr(t-u*sp)がw未満の間はx/w、それ以外は1', 'wq(u,t,w,sp)=progress of that wave: x/w while x<w, otherwise 1'],
  [/\bEZ\.back/, 'EZ.back=オーバーシュート（1を少し超えてから1に戻る。0〜1の入力に対して最大約1.1）', 'EZ.back=overshoot ease-out (passes 1 slightly, then settles at 1)'], [/\bEZ\.bounce/, 'EZ.bounce=バウンド（床で数回弾んで1に落ち着く）', 'EZ.bounce=bounce ease-out'], [/\bEZ\.exp/, 'EZ.exp=急減速（指数的に1へ近づく）', 'EZ.exp=exponential ease-out'], [/\bEZ\.lin/, 'EZ.lin=等速', 'EZ.lin=linear'],
  [/\bEZ\.io/, 'EZ.io=イーズイン・アウト', 'EZ.io=ease-in-out'], [/\bEZ\.out/, 'EZ.out=イーズアウト', 'EZ.out=ease-out'], [/\bEZ\.in\b/, 'EZ.in=イーズイン', 'EZ.in=ease-in'], [/\bEZ\.el/, 'EZ.el=弾性（震えて止まる）', 'EZ.el=elastic out'],
  [/\bspn\(|\brot\(/, 'rot(g,deg)=文字列の中心を軸にdeg度回したときの、その文字の位置のずれ{x,y}。spn(g,deg,rad)は同じ回転で中心からの距離もrad倍する', 'rot(g,deg)=offset {x,y} of that character when the whole text is rotated deg degrees about its centre; spn(g,deg,rad) also multiplies the distance from the centre by rad'],
  [/\bLx\(/, 'Lx(ja,en)=画面の表示言語に合わせて、日本語なら ja、英語なら en を返す', 'Lx(ja,en)=returns ja or en depending on the display language'],
  [/\bhs\(/, 'hs(h,l,s)=色相h・明るさl%・彩度s%の色', 'hs(h,l,s)=colour with hue h, lightness l%, saturation s%'], [/D2R/, 'D2R=π/180', 'D2R=π/180'], [/TAU/, 'TAU=2π', 'TAU=2π'],
];
function refLines(c, T) {
  if (c.m === 'custom') return mgRef(c, T);
  const out = [], src = [];
  const list = c.an ? [c, ...c.an] : [c];
  if (c.m === 'loop' && c.fn) src.push([Lx('文字1つごとに毎コマ呼ぶ関数 (g, t, 秒)', 'Function called per character every frame (g, t, seconds)'), c.fn]);
  list.forEach(A => { if (A.cf) src.push([Lx('文字1つごとに毎コマ呼ぶ関数 (q, g, v)。q=その文字の到着度（0=動き始め、1=定位置。退場では1→0）、v=1-q の緩急をかける前の値', 'Function called per character every frame (q, g, v). q = arrival progress of that character (0 = start, 1 = at rest; runs 1→0 for exits), v = 1-q before easing'), A.cf]); });
  if (c.txt) src.push([Lx('表示する文字列を返す関数 (t, 秒)', 'Function returning the string to display (t, seconds)'), c.txt]);
  if (src.length) {
    out.push(Lx('参考実装（この見本を動かしている式。数値はこのまま使える）:', 'Reference implementation (the expressions driving this sample; the numbers can be used as they are):'));
    out.push(Lx(`  前提: 画面は横320×縦180、文字の高さは約30（複数行は約24）。t=1周期の中の現在位置(0〜1)、1周期は${T}秒。`, `  Setup: stage is 320×180, text height about 30 (about 24 for multi-line). t = position within one cycle (0..1); one cycle is ${T}s.`));
    out.push(Lx('  g=文字の情報: g.i=何文字目(0始まり) g.n=全文字数 g.u=左端0〜右端1の位置 g.wi=何単語目 g.li=何行目 g.gx,g.gy=定位置の座標(画面中央が0) g.r,g.r2,g.r3=文字ごとに固定の乱数(0〜1)', '  g = character info: g.i=index (from 0) g.n=character count g.u=position 0 (left) to 1 (right) g.wi=word index g.li=line index g.gx,g.gy=rest coordinates (stage centre is 0) g.r,g.r2,g.r3=fixed per-character random numbers (0..1)'));
    out.push(Lx('  返す値は定位置からの差分: x,y=位置のずれ(px、yは下が正) r=回転(度) s=全体スケールの増減(0.5で150%、-1で0%) sx,sy=横・縦スケールの増減 a=不透明度(0〜1) b=ブラー(px) tr=字間の増減(px) rx,ry=3D回転(度) z=奥行き(正が手前、400でカメラ位置) sk=スキュー(度) col=塗り色 st=線の太さ stc=線の色 gl=発光の強さ ay=回転とスケールの支点の上下位置(文字の高さ比、0.38で足元)', '  Returned values are deltas from rest: x,y=offset (px, y down) r=rotation (deg) s=uniform scale delta (0.5 → 150%, -1 → 0%) sx,sy=horizontal/vertical scale delta a=opacity (0..1) b=blur (px) tr=tracking delta (px) rx,ry=3D rotation (deg) z=depth (positive toward camera, camera at 400) sk=skew (deg) col=fill colour st=stroke width stc=stroke colour gl=glow strength ay=vertical pivot for rotation and scale (fraction of text height, 0.38 = baseline)'));
    src.forEach(([label, f]) => { out.push('  ' + label + ':'); out.push('  ' + String(f).replace(/\s+/g, ' ')); });
    const all = src.map(x => String(x[1])).join(' ');
    const hl = HELP.filter(h => h[0].test(all)).map(h => Lx(h[1], h[2]));
    if (hl.length) out.push(Lx('  式の中の補助関数: ', '  Helpers used: ') + hl.join(Lx(' ／ ', ' / ')));
  }
  if (c.m === 'path') {
    const pts = [];
    for (let k = 0; k <= 16; k++) { const q = c.path(k / 16, 0); pts.push(`(${Math.round(q[0] * 80 + 160)},${Math.round(q[1] * 80 + 90)})`); }
    const mv = c.path.length > 1;
    out.push(Lx('パスの形（横320×縦180の画面での通過点を始点から順に17個。画面外の座標は画面の外から入る・出ることを表す' + (mv ? '。この形は時間とともに動くので、周期の開始時点の形' : '') + '）:', 'Path shape (17 points in order on a 320×180 stage; off-stage coordinates mean entering or leaving the frame' + (mv ? '; the shape moves over time, this is its state at the start of the cycle' : '') + '):'));
    out.push('  ' + pts.join(' → '));
  }
  return out;
}

/* 2冊目の見本：描画関数と、その中で使っている補助関数の中身をそのまま添える（貼った先で未定義にならないように） */
function mgRef(c, T) {
  const out = [], one = f => String(f).replace(/\s+/g, ' ');
  let all = one(c.draw);
  const used = [];
  for (let pass = 0; pass < 4; pass++) {
    let added = false;
    for (const k in MG.k) {
      if (used.includes(k) || !new RegExp('\\b' + k + '\\b').test(all)) continue;
      used.push(k); added = true;
      if (typeof MG.k[k] === 'function') all += ' ' + one(MG.k[k]);
    }
    if (!added) break;
  }
  out.push(Lx('参考実装（この見本を描いている Canvas 2D のコード。数値はこのまま使える）:', 'Reference implementation (the Canvas 2D code that draws this sample; the numbers can be used as they are):'));
  out.push(Lx(`  前提: 横320×縦180のキャンバスに、毎コマ draw(c, t, s) を呼ぶ。c=2Dコンテキスト、t=1周期の中の現在位置(0〜1)、s=経過秒。1周期は${T}秒。呼ぶ前に画面を消し、save()/restore() で囲む。`, `  Setup: call draw(c, t, s) every frame on a 320×180 canvas. c = 2D context, t = position within one cycle (0..1), s = elapsed seconds. One cycle is ${T}s. Clear first and wrap the call in save()/restore().`));
  out.push(Lx('  定数: W=320, H=180, CX=160, CY=90, TAU=2π, D2R=π/180, FG="#f3efe6"（文字や図形の基本色）, SANS=太字のゴシック体のフォント名, MG.sc=キャンバスの拡大率（等倍なら1）', '  Constants: W=320, H=180, CX=160, CY=90, TAU=2π, D2R=π/180, FG="#f3efe6" (default ink colour), SANS=a bold sans-serif font family, MG.sc=canvas pixel scale (1 at 1:1)'));
  out.push('  const draw = ' + one(c.draw) + ';');
  used.forEach(k => { const v = MG.k[k]; out.push('  const ' + k + ' = ' + (typeof v === 'function' ? one(v) : JSON.stringify(v)) + ';'); });
  const hl = HELP.filter(h => h[0].test(all)).map(h => Lx(h[1], h[2]));
  if (hl.length) out.push(Lx('  そのほかの補助関数: ', '  Other helpers: ') + hl.join(Lx(' ／ ', ' / ')));
  return out;
}

/* 1つの見本をAIに渡すときの文章（番号・正式名・解説・仕様）。見本帳の「コピー」と、スキルの get が同じものを出す */
function promptOf(p) {
  if (p.book === 'vo') return (LANG === 'ja' ? [
    `${p.id} ${p.name}（${p.nameJa}）`,
    `（音声合成のオーディオタグ ＞ ${p.cat}（${p.catJa}）／出どころ: ${VO.src[p.src][0]}）`,
    `効果: ${p.ja}`,
    `例文: ${p.line}`,
    '・使い方: タグは角かっこで書き、効かせたい言葉の直前に置く。同じ調子は次のタグまで続く。カンマで並べると重ねがけできる（例: [whispering, fearful]）。',
    '・対応: ElevenLabs の Eleven v4 / v4 Turbo / v3。タグは決まった一覧ではなく自由な言葉で書ける。必ず効くとは限らないので、効かなければ近い言葉に替えて生成し直す。',
  ] : [
    `${p.id} ${p.name}`,
    `(Audio tag for speech synthesis > ${p.cat} / source: ${VO.src[p.src][1]})`,
    `Effect: ${p.en}`,
    `Example line: ${p.line}`,
    '- Usage: write the tag in square brackets right before the words it should affect. The delivery carries on until the next tag. Combine qualities with a comma (e.g. [whispering, fearful]).',
    '- Works with ElevenLabs Eleven v4 / v4 Turbo / v3. Tags are free text, not a fixed list. They do not always take effect; if one misses, swap in a neighbouring word and regenerate.',
  ]).join('\n');
  const mg = p.book === 'mg', body = specLines(p);
  return (LANG === 'ja' ? [
    `${p.id}「${p.name}」（日本語での呼び名: ${p.nameJa}）`,
    mg ? `（モーショングラフィックスの動き ＞ ${p.cat}（${p.catJa}））` : `（After Effects 標準テキストアニメーションプリセット ＞ Text ＞ ${p.cat}）`,
    (mg ? '解説: ' : '動き: ') + p.ja,
    ...body.map(s => (s.startsWith('  ') ? s : '・' + s)),
  ] : [
    `${p.id} "${p.name}"`,
    mg ? `(Motion graphics move > ${p.cat})` : `(After Effects built-in text animation preset > Text > ${p.cat})`,
    (mg ? 'What it is: ' : 'Motion: ') + p.en,
    ...body.map(s => (s.startsWith('  ') ? s : '- ' + s)),
  ]).join('\n');
}
