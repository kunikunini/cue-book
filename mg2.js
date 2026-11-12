'use strict';
/* モーショングラフィックスの見本・後半（文字／カメラ／エフェクト／図解とUI）と、一覧への登録 */
(() => {
  const K = MG.k;
  /* 奥行きのある簡単な風景。cam=カメラの横位置、par=1で奥ほどゆっくり動く（0なら全部同じ速さ） */
  K.wl = (c, cam, par = 1) => {
    c.fillStyle = '#141a2e'; c.fillRect(-400, -200, 1200, 600);
    c.fillStyle = '#ffd76a'; c.beginPath(); c.arc(236 - cam * (par ? 0.05 : 1), 44, 16, 0, TAU); c.fill();
    [[0.2, '#2a3150', 96, 62], [0.5, '#3f4a78', 124, 40], [1, '#5d6aa6', 150, 26]].forEach(([d, col, y, w], li) => {
      c.fillStyle = col;
      for (let k = -6; k < 22; k++) { const h = 14 + 34 * hash(k * 3.3 + li * 9.1); c.fillRect(k * w * 1.5 + li * 17 - cam * (par ? d : 1), y - h, w, h + 400); }
    });
  };
  const { cA, cY, cB, cG, cP, cD, cM, cK, sg, pg, dC, dO, dE, dR, dL, dT, dW, dB, dG, wd, wl } = K;

  MG.cat('Typography', '文字（タイポグラフィ）の動き', [
  ['Kinetic Typography', 'キネティックタイポグラフィ', '言葉そのものを、大きさ・位置・タイミングを変えて動かし、意味や声の調子を伝える。強調したい言葉ほど大きく、色を変え、拍に合わせて出す。', 'Moving the words themselves, varying size, position and timing to convey meaning and tone. Bigger, coloured and on the beat for emphasis.',
    (c, t) => { [[Lx('言葉が', 'WORDS'), 104, 52, 22, FG], [Lx('リズムで', 'MOVE IN'), 186, 92, 38, cA], [Lx('動く', 'RHYTHM'), 132, 136, 28, cY]].forEach(([w, x, y, z, col], i) => dT(c, w, x, y, z * Math.max(0, EZ.back(sg(t, 0.1 + i * 0.17, 0.3 + i * 0.17))), col)); }],
  ['Line Reveal', '行ごとのマスクリビール', '複数行の文字が、1行ずつ見えない枠の下からせり上がる。行の間は0.1秒ほどずらす。見出しや引用の出し方の定番。', 'Lines of text rise from behind invisible masks one at a time, about 0.1s apart. A staple for headlines and quotes.',
    (c, t) => { [Lx('一行ずつ', 'LINE BY'), Lx('せり上がる', 'LINE')].forEach((w, i) => { const y = 66 + i * 46, p = EZ.out(sg(t, 0.1 + i * 0.12, 0.45 + i * 0.12)); c.save(); c.beginPath(); c.rect(0, y - 21, W, 42); c.clip(); dT(c, w, CX, y + 46 * (1 - p), 34); c.restore(); }); }],
  ['Letter Stagger', '文字ごとの時間差', '1文字ずつ、下から浮き上がりながらフェードインする。1文字あたり0.03〜0.05秒ずらす。文字数が多いときは単語単位にする。', 'Each letter rises and fades in with a 0.03–0.05s offset. Use words instead of letters for long text.',
    (c, t) => dW(c, wd(), CX, CY, 40, i => { const p = EZ.out(sg(t, 0.1 + i * 0.05, 0.36 + i * 0.05)); return { y: 24 * (1 - p), a: p }; })],
  ['Tracking In', 'トラッキングイン', '広く開いた字間が、すっと詰まって通常の間隔になる。フェードと組み合わせる。落ち着いた・上品なタイトルに使う。', 'Wide letter-spacing closes to normal, combined with a fade. For calm, elegant titles.',
    (c, t) => { const p = EZ.out(sg(t, 0.1, 0.62)); c.globalAlpha = p; dW(c, wd(), CX, CY, 34, null, FG, 26 * (1 - p)); }],
  ['Scramble', 'スクランブル（文字化けからの確定）', 'でたらめな文字が高速で入れ替わり、左から順に正しい文字へ確定していく。暗号の解読やデータの読み込みを表す。', 'Random characters flicker rapidly and lock into the right letters from the left. Suggests decoding or loading data.',
    (c, t, s) => { const p = sg(t, 0.1, 0.66), A = 'ABCDEFGHKMNPRSTXYZ0123456789#%&'; dW(c, wd(), CX, CY, 38, (i, n) => (p * n > i ? {} : { ch: A[Math.floor(hash(i * 13.1 + Math.floor(s * 16) * 7.7) * A.length)], col: cG })); }],
  ['Count Up', 'カウントアップ', '数字が0から目標の値まで一気に増えていき、最後はゆっくり止まる。実績や金額など、数の大きさを印象づけたいときに使う。', 'A number runs up from zero to its target and eases to a stop. Makes the size of a figure felt.',
    (c, t) => { dT(c, Math.round(12800 * EZ.out(sg(t, 0.1, 0.7))).toLocaleString('en-US'), CX, CY - 6, 46, cY); dT(c, Lx('ダウンロード数', 'DOWNLOADS'), CX, CY + 34, 13, cM); }],
  ['Wave Text', 'ウェーブテキスト', '文字が1文字ずつ時間差で上下し、波が左から右へ流れ続ける。楽しい・やわらかい印象。振れ幅は文字の高さの2〜3割まで。', 'Letters move up and down with offsets so a wave travels through the word. Playful; keep amplitude to 20–30% of the text height.',
    (c, t) => dW(c, wd(), CX, CY, 40, i => ({ y: 11 * S(t * 2 - i * 0.13) })), { lp: 1 }],
  ['Word Roll', 'ワードロール（言葉の入れ替え）', '文の一部の言葉だけが、スロットのように縦に回って次の言葉に入れ替わる。「〇〇を、もっと△△に」の△△を次々と変える見せ方。', 'One word in a sentence rolls vertically like a slot to the next word, cycling through options while the rest stays.',
    (c, t) => { const L = Lx(['速く', '楽しく', '美しく'], ['FASTER', 'BOLDER', 'SMOOTHER']), n = Math.floor(t * 3) % 3, k = EZ.io(sg(fr(t * 3), 0.62, 1)); dT(c, Lx('動きを', 'MAKE IT'), 150, CY, 26, FG, 1, 'right'); c.beginPath(); c.rect(156, CY - 20, 164, 40); c.clip(); dT(c, L[n], 160, CY - 40 * k, 26, cA, 1, 'left'); dT(c, L[(n + 1) % 3], 160, CY + 40 * (1 - k), 26, cA, 1, 'left'); }, { lp: 1 }],
  ['Highlighter', 'マーカー（蛍光ペン）', '文字の後ろに、蛍光ペンを引くように色の帯が左から伸びる。大事な言葉の強調に使う。帯は文字の下半分にかけると読みやすい。', 'A band of colour is drawn behind the text from the left, like a highlighter. Emphasises key words; covering the lower half keeps it legible.',
    (c, t) => { c.font = `700 36px ${SANS}`; const w = c.measureText(wd()).width + 14; c.fillStyle = cA; c.globalAlpha = 0.85; c.fillRect(CX - w / 2, CY + 1, w * EZ.io(sg(t, 0.2, 0.6)), 20); c.globalAlpha = 1; dT(c, wd(), CX, CY, 36); }],
  ['Underline Draw', '下線アニメーション', '文字の下に、線が左から右へすっと引かれる。リンクや見出しの強調に使う。0.3秒ほどで最後にゆっくり。', 'A line is drawn under the text from left to right in about 0.3s with ease-out. For links and headings.',
    (c, t) => { c.font = `700 36px ${SANS}`; const w = c.measureText(wd()).width, p = EZ.out(sg(t, 0.25, 0.6)); dT(c, wd(), CX, CY - 4, 36); if (p > 0) dL(c, CX - w / 2, CY + 24, CX - w / 2 + w * p, CY + 24, cY, 4); }],
  ['Stroke to Fill', '線から塗りへ', '文字がまず輪郭線だけで現れ、そのあと中身が塗られていく。ロゴやタイトルの登場に使う。線→塗りの順で2段階にする。', 'Text first appears as an outline only, then fills in. A two-stage entrance for logos and titles.',
    (c, t) => { c.font = `700 44px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.globalAlpha = sg(t, 0.4, 0.68); c.fillStyle = cA; c.fillText(wd(), CX, CY); c.globalAlpha = sg(t, 0.08, 0.3); c.strokeStyle = cA; c.lineWidth = 1.6; c.strokeText(wd(), CX, CY); }],
  ['Typewriter', 'タイプライター', '文字が1文字ずつ打たれていき、先頭で縦棒のカーソルが点滅する。会話やコード、手紙の表現に使う。1文字0.05秒前後。', 'Characters are typed one at a time with a blinking bar cursor. For dialogue, code and letters; about 0.05s per character.',
    (c, t, s) => { const str = Lx('文字を打つように', 'Typing it out...'), n = Math.floor([...str].length * sg(t, 0.1, 0.62)); dT(c, [...str].slice(0, n).join('') + (fr(s * 2) < 0.5 || (t > 0.1 && t < 0.62) ? '|' : ''), 44, CY, 26, FG, 1, 'left'); }],
  ['Punch In', 'パンチイン（叩きつけ）', '大きな文字が勢いよく叩きつけられるように縮んで止まり、その衝撃で小さく揺れる。強い一言やタイトルコールに使う。', 'Big text slams down to size and shudders from the impact. For punchy one-liners and title calls.',
    (c, t) => { const p = EZ.in(sg(t, 0.14, 0.3)), k = sg(t, 0.3, 0.7), e = k > 0 ? Math.exp(-k * 7) : 0; if (t < 0.14) return; dT(c, wd(), CX + 7 * e * Math.sin(k * 60), CY + 4 * e * Math.cos(k * 47), 40 * mix(2.6, 1, p), cY, 0.3 + 0.7 * p); }],
  ['Text on a Path', 'パス上のテキスト', '文字が円や曲線に沿って並び、その道すじの上を流れ続ける。バッジ・スタンプ・円形ロゴの飾りに使う。', 'Text sits on a circle or curve and flows along it. For badges, stamps and circular logos.',
    (c, t) => { const ch = [...Lx('まわる文字・まわる文字・', 'TEXT ON A PATH · TEXT ON A PATH · ')]; c.font = `700 15px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = FG; ch.forEach((q, i) => { const a = i / ch.length * TAU + TAU * t; c.save(); c.translate(CX + 56 * Math.cos(a), CY + 56 * Math.sin(a)); c.rotate(a + Math.PI / 2); c.fillText(q, 0, 0); c.restore(); }); dC(c, CX, CY, 14, cA); }, { lp: 1, T: 8 }],
  ['Split Text', 'スプリットテキスト', '文字が上下半分に切れて離れ、そのすき間から別の言葉が現れる。タイトルと副題を一度に見せる演出。', 'Text is cut horizontally and the halves move apart, revealing other words in the gap. Shows title and subtitle together.',
    (c, t) => { const p = EZ.io(sg(t, 0.28, 0.6)); [[0, -1], [CY, 1]].forEach(([y, d]) => { c.save(); c.beginPath(); c.rect(0, y + d * 24 * p, W, CY); c.clip(); dT(c, wd(), CX, CY + d * 24 * p, 44); c.restore(); }); dT(c, Lx('動きの見本帳', 'SAMPLE BOOK'), CX, CY, 13, cA, p); }],
  ['Letter Flip', '文字ごとのフリップ', '1文字ずつ、横軸まわりにパタンと起き上がって現れる。空港の案内板のような動き。時間差は1文字0.05秒ほど。', 'Each letter flips up around its horizontal axis, like a split-flap board, about 0.05s apart.',
    (c, t) => dW(c, wd(), CX, CY, 40, i => { const p = EZ.out(sg(t, 0.1 + i * 0.06, 0.4 + i * 0.06)); return p > 0 ? { sy: Math.sin(p * Math.PI / 2) } : null; })],
  ]);

  MG.cat('Camera & Space', 'カメラと空間', [
  ['Pan', 'パン', 'カメラを横へ振って、景色を横に流す。全体が同じ速さで動く。場所の広がりを見せたり、次の対象へ視線を移したりする。', 'The camera turns sideways so the whole view slides across at one speed. Shows breadth or shifts attention.',
    (c, t) => wl(c, 170 * EZ.io(sg(t, 0.12, 0.8)), 0)],
  ['Zoom In', 'ズームイン', '画面の中心へ向かって拡大していく。見ている場所は変わらず、対象だけが大きくなる。注目させたい所へ寄るときに使う。', 'The view magnifies toward its centre: the viewpoint stays, the subject grows. Draws attention to a detail.',
    (c, t) => { const s = 1 + 0.9 * EZ.io(sg(t, 0.12, 0.8)); c.translate(CX, CY); c.scale(s, s); c.translate(-CX, -CY); wl(c, 40, 0); }],
  ['Parallax', 'パララックス（視差）', '手前のものほど速く、奥のものほどゆっくり動く。平らな絵に奥行きが生まれる。手前1、中間0.5、奥0.2くらいの速さの比にする。', 'Near layers move faster, far layers slower, giving flat art depth. Try speed ratios of about 1, 0.5 and 0.2.',
    (c, t) => wl(c, 150 * pg(t), 1), { lp: 1, T: 5 }],
  ['Camera Shake', 'カメラシェイク', '衝撃の瞬間に画面全体が細かく揺れ、すぐに収まる。揺れ幅は最初が最大で、0.3〜0.5秒で消える。着地・爆発・強調に使う。', 'The whole frame jolts at an impact and settles within 0.3–0.5s, strongest at first. For landings, explosions and emphasis.',
    (c, t) => { const k = sg(t, 0.32, 0.8), e = k > 0 ? Math.exp(-k * 6) : 0; c.translate(9 * e * Math.sin(k * 70), 7 * e * Math.cos(k * 53)); wl(c, 30, 0); dC(c, CX, mix(-30, 132, EZ.in(sg(t, 0.1, 0.32))), 18, cA); }],
  ['Tracking Shot', 'フォロー（追いかけ）', 'カメラが動く対象と一緒に移動するので、対象は画面の同じ位置にとどまり、背景だけが流れる。走る・進むの表現に使う。', 'The camera travels with the subject, so it stays in place on screen while the background streams by. For running and progress.',
    (c, t) => { wl(c, 260 * sg(t, 0.05, 0.95), 1); dC(c, CX, 132 - 9 * Math.abs(S(t * 6)), 13, cA); }],
  ['Orbit', 'オービット（回り込み）', 'カメラが対象のまわりを回り込む。対象は中心に残り、まわりのものが手前と奥を行き来する。立体感を見せたいときに使う。', 'The camera circles the subject, which stays centred while surrounding objects pass in front and behind. Shows volume.',
    (c, t) => { const P = []; for (let k = 0; k < 10; k++) { const a = k * TAU / 10 + TAU * t; P.push([Math.sin(a), Math.cos(a)]); } P.push([0, 0, 1]); P.sort((a, b) => a[1] - b[1]).forEach(([x, z, m]) => (m ? dC(c, CX, CY, 20, cA) : dC(c, CX + 96 * x, CY + 16 * z, 5 + 3.5 * (z + 1), cB, 0.45 + 0.27 * (z + 1)))); }, { lp: 1, T: 5 }],
  ['Rack Focus', 'ラックフォーカス', 'ピントを手前のものから奥のものへ（またはその逆へ）移す。ぼけていた方がはっきりし、はっきりしていた方がぼける。視線を誘導する。', 'Focus shifts from a near object to a far one or back: the blurred one sharpens and the sharp one blurs. Directs the eye.',
    (c, t) => { const k = EZ.io(pg(t)); c.save(); dB(c, 9 * k); dC(c, 110, 104, 46, cA); c.restore(); c.save(); dB(c, 9 * (1 - k)); dC(c, 226, 70, 22, cY); c.restore(); }, { lp: 1, T: 5 }],
  ['Card Flip (3D)', 'カードフリップ', 'カードが縦軸まわりに半回転して、裏面が表に出る。真横を向いた瞬間に絵柄を入れ替える。表裏のある情報の切り替えに使う。', 'A card turns half a rotation around its vertical axis to show its back; the face swaps at the edge-on moment.',
    (c, t) => { const k = Math.cos(Math.PI * EZ.io(sg(t, 0.25, 0.7))); if (Math.abs(k) < 0.01) return; c.translate(CX, CY); c.scale(Math.abs(k), 1); dR(c, 0, 0, 130, 86, 12, k > 0 ? cA : cB); dT(c, k > 0 ? Lx('表', 'FRONT') : Lx('裏', 'BACK'), 0, 2, 28, cK); }],
  ['Cube Rotate', 'キューブ回転', '立方体が軸のまわりを回る。面が手前へ来たり奥へ行ったりする。3Dの基本の見せ方で、商品やロゴの立体表現に使う。', 'A cube rotates on its axis, its faces coming forward and receding. A basic 3D presentation for products and logos.',
    (c, t) => { const a = TAU * t, b = 0.5, V = []; for (let i = 0; i < 8; i++) { const x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1, x1 = x * Math.cos(a) + z * Math.sin(a), z1 = z * Math.cos(a) - x * Math.sin(a), y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = z1 * Math.cos(b) + y * Math.sin(b), f = 3.4 / (3.4 - z2 * 0.5); V.push([CX + x1 * 38 * f, CY + y1 * 38 * f]); } for (let i = 0; i < 8; i++) for (const d of [1, 2, 4]) if (!(i & d)) dL(c, V[i][0], V[i][1], V[i | d][0], V[i | d][1], cY, 2.5); }, { lp: 1, T: 6 }],
  ['Perspective Grid', '遠近グリッド', '地面の格子が、奥の消失点からこちらへ流れてくる。手前ほど線の間隔が広がる。前へ進んでいる感じや、レトロな未来感を出す。', 'A floor grid streams toward the viewer from a vanishing point, its lines spreading apart as they approach. Forward motion, retro-future.',
    (c, t) => { const hz = 66; dC(c, CX, hz - 4, 26, cA); c.fillStyle = '#0a0a0c'; c.fillRect(0, hz, W, H); for (let k = -12; k <= 12; k++) dL(c, CX + k * 8, hz, CX + k * 70, H, cP, 1.2, 0.7); for (let k = 0; k < 8; k++) { const u = (k + fr(t * 3)) / 8; dL(c, 0, hz + 114 * u * u, W, hz + 114 * u * u, cP, 1.2, 0.3 + 0.6 * u); } dL(c, 0, hz, W, hz, cP, 1.5); }, { lp: 1 }],
  ['Isometric Rise', 'アイソメトリックの立ち上がり', '斜め上から見下ろした角度で、ブロックが時間差で地面から立ち上がる。街・データ・構成要素を立体の図として見せるときに使う。', 'Seen from an isometric angle, blocks rise from the ground with staggered timing. For cities, data and system diagrams.',
    (c, t) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const n = i + j * 3, h = (22 + 30 * hash(n + 3)) * Math.max(0, EZ.back(sg(t, 0.1 + (i + j) * 0.07, 0.42 + (i + j) * 0.07))), x = CX + (i - j) * 30, y = 92 + (i + j) * 15, q = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([a, b], k) => (k ? c.lineTo(a, b) : c.moveTo(a, b))); c.fill(); }; q([[x - 28, y], [x, y + 14], [x, y + 14 - h], [x - 28, y - h]], '#c9603a'); q([[x + 28, y], [x, y + 14], [x, y + 14 - h], [x + 28, y - h]], '#8f4429'); q([[x, y - 14 - h], [x + 28, y - h], [x, y + 14 - h], [x - 28, y - h]], cA); } }],
  ['Exploded Layers', 'レイヤーの分解表示', '重なっていた層が、上下に離れて1枚ずつ見えるようになり、また重なる。製品や画面の構造を説明する図に使う。', 'Stacked layers separate vertically so each is visible, then stack again. Explains the structure of a product or interface.',
    (c, t) => { const p = EZ.io(pg(t)); [cB, cG, cY, cA].forEach((col, k) => { c.save(); c.translate(CX, 108 - k * (5 + 23 * p)); c.transform(1, 0.34, -1, 0.34, 0, 0); dR(c, 0, 0, 62, 62, 9, col, 0.95); c.restore(); }); }, { lp: 1, T: 4 }],
  ]);

  MG.cat('Effects & Texture', 'エフェクトと質感', [
  ['Glitch', 'グリッチ', '映像が一瞬だけ横にずれ、色がにじみ、帯状に裂ける。不規則な間隔で短く入れる。デジタルの不具合・緊張感・サイバーな雰囲気を出す。', 'The image briefly shifts sideways, colours separate and bands tear, at irregular short moments. Digital faults, tension, cyber mood.',
    (c, t, s) => { const f = Math.floor(s * 9), g = hash(f) > 0.55 ? 1 : 0, d = 5 * g; c.globalCompositeOperation = 'lighter'; dT(c, wd(), CX - d, CY, 40, '#ff2a55'); dT(c, wd(), CX + d, CY, 40, '#19e0ff'); c.globalCompositeOperation = 'source-over'; dT(c, wd(), CX, CY, 40, FG); if (g) for (let k = 0; k < 3; k++) { const y = 50 + hash(f + k) * 80; c.drawImage(c.canvas, 0, y * MG.sc, W * MG.sc, 9 * MG.sc, (hash(f * 2 + k) - 0.5) * 40, y, W, 9); } }, { lp: 1 }],
  ['RGB Split', 'RGBずれ（色収差）', '赤・緑・青の版を少しずつずらして重ねる。重なった所は白く、ずれた縁に色が出る。レンズのにじみや衝撃、デジタル感の表現に使う。', 'The red, green and blue channels are offset slightly. Overlaps stay white while coloured fringes appear at the edges. Lens fringing, impact.',
    (c, t) => { const d = 7 * pg(t); c.globalCompositeOperation = 'lighter'; dT(c, wd(), CX - d, CY, 42, '#ff0000'); dT(c, wd(), CX, CY, 42, '#00ff00'); dT(c, wd(), CX + d, CY, 42, '#0000ff'); }, { lp: 1 }],
  ['Glow Pulse', 'グローのパルス', '文字や図形のまわりの光が、ゆっくり強くなったり弱くなったりする。ネオン・光る看板・注目してほしいボタンに使う。', 'The glow around text or a shape slowly strengthens and weakens. For neon, signs and buttons that want attention.',
    (c, t) => { dG(c, cA, 6 + 26 * pg(t)); dT(c, wd(), CX, CY, 40, cA); }, { lp: 1 }],
  ['Light Sweep', 'ライトスイープ', '斜めの光の帯が、文字やロゴの上をさっと横切る。金属やガラスのつやを表す。1〜2秒に1回、0.5秒ほどで通す。', 'A diagonal band of light glides across text or a logo, suggesting a metal or glass sheen. About 0.5s per pass.',
    (c, t) => { dT(c, wd(), CX, CY, 42, cA); c.globalCompositeOperation = 'source-atop'; c.translate(mix(-70, 390, EZ.io(sg(t, 0.2, 0.72))), CY); c.transform(1, 0, -0.5, 1, 0, 0); c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(-26, -40, 52, 80); }],
  ['Particles', 'パーティクル', '小さな粒をたくさん出し続け、それぞれが飛んで薄れて消える。噴水・火花・雪・ほこりなど、数で見せる表現の土台。', 'Many small particles are emitted continuously, each flying and fading out. The basis for fountains, sparks, snow and dust.',
    (c, t) => { for (let k = 0; k < 46; k++) { const ph = fr(t + hash(k)), a = (-90 + (hash(k + 50) - 0.5) * 70) * D2R, v = 120 + 90 * hash(k + 9); dC(c, CX + Math.cos(a) * v * ph, 150 + Math.sin(a) * v * ph + 190 * ph * ph, 3.4 * (1 - ph * 0.6), k % 3 ? cA : cY, 1 - ph); } }, { lp: 1 }],
  ['Confetti', '紙吹雪', '色とりどりの紙片が一気に飛び散り、回りながらひらひら落ちる。お祝い・達成・完了の瞬間に使う。', 'Colourful pieces burst out and flutter down while spinning. For celebration, achievement and completion.',
    (c, t) => { const q = sg(t, 0.1, 0.95), e = EZ.out(q); for (let k = 0; k < 40; k++) { const a = hash(k) * TAU, d = 40 + 90 * hash(k + 7); dR(c, CX + Math.cos(a) * d * e, CY - 10 + Math.sin(a) * d * e * 0.8 + 90 * q * q, 9, 5 * Math.abs(Math.cos(q * 14 + k)) + 1, 1, [cA, cY, cB, cG, cP][k % 5], 1 - sg(q, 0.75, 1), 400 * q * (hash(k + 3) - 0.5)); } }],
  ['Speed Lines', 'スピードライン', '横向きの線が、対象の後ろを速く流れ続ける。対象は動かさなくても、猛スピードで進んでいるように見える。漫画の集中線・流線と同じ考え方。', 'Horizontal lines streak past behind the subject, so it reads as moving fast even when it stays put. Same idea as manga speed lines.',
    (c, t) => { for (let k = 0; k < 22; k++) { const x = W + 60 - fr(hash(k) + t * (1 + (k % 3))) * (W + 160), l = 30 + 60 * hash(k + 5); dL(c, x, 10 + k * 7.6, x + l, 10 + k * 7.6, FG, 1.5, 0.15 + 0.4 * hash(k + 8)); } dE(c, CX + 2 * S(t * 12), CY, 30, 15, cA); }, { lp: 1 }],
  ['Echo Trail', 'エコー（残像）', '動いているものの少し前の姿を、何枚か薄く重ねて残す。動きの軌跡が見える。After Effects のエコーに当たる。', 'Faint copies of slightly earlier frames trail behind a moving object, showing its path. Equivalent to Echo in After Effects.',
    (c, t) => { for (let k = 7; k >= 0; k--) dR(c, CX, CY, 124, 16, 8, k ? cB : FG, k ? 0.42 * Math.pow(0.72, k) : 1, 360 * EZ.io(pg(t - k * 0.016))); }, { lp: 1 }],
  ['Film Grain', 'フィルムグレイン（粒状ノイズ）', '細かい粒が毎コマ違う位置に現れて、画面全体がざらつく。フィルムや古い映像の質感を足す。きれいすぎる絵をなじませるのにも使う。', 'Fine specks appear in different places every frame, giving the whole image a grainy texture like film.',
    (c, t, s) => { dT(c, wd(), CX, CY, 40, cY); const f = Math.floor(s * 12); for (let k = 0; k < 260; k++) dC(c, hash(k + f * 7.3) * W, hash(k * 1.7 + f * 3.1) * H, 0.8, FG, 0.12 + 0.3 * hash(k + f)); }, { lp: 1 }],
  ['Flicker', 'フリッカー（ちらつき）', '明るさが不規則にちかちか変わる。切れかけの電球・古い映写機・不安定な電気を表す。ずっと続けず、短い区間だけ入れる。', 'Brightness changes irregularly from moment to moment: a failing bulb, old projector, unstable power. Use in short bursts.',
    (c, t, s) => { const k = hash(Math.floor(s * 14)); dG(c, cY, k > 0.6 ? 16 : 0); dT(c, wd(), CX, CY, 40, cY, 0.3 + 0.7 * k); }, { lp: 1 }],
  ['Scanlines (CRT)', 'スキャンライン（ブラウン管）', '細い横線が全体にかかり、明るい帯が上から下へゆっくり流れる。ブラウン管テレビや監視モニターの質感になる。', 'Thin horizontal lines cover the image while a brighter band rolls slowly from top to bottom. A CRT or monitor look.',
    (c, t) => { dG(c, cG, 10); dT(c, wd(), CX, CY, 40, cG); c.shadowBlur = 0; c.fillStyle = 'rgba(0,0,0,.42)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2); const g = c.createLinearGradient(0, fr(t) * (H + 60) - 60, 0, fr(t) * (H + 60)); g.addColorStop(0, 'rgba(122,215,160,0)'); g.addColorStop(1, 'rgba(122,215,160,.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }, { lp: 1 }],
  ['Animated Gradient', 'グラデーションアニメーション', 'グラデーションの色が、ゆっくり移り変わり続ける。背景やボタンを静かに動かして、画面を止まって見せない。', 'The colours of a gradient shift slowly and continuously. Keeps a background or button gently alive.',
    (c, t) => { const g = c.createLinearGradient(40, 30, 280, 150); g.addColorStop(0, hs(360 * t, 62, 85)); g.addColorStop(0.5, hs(360 * t + 70, 60, 85)); g.addColorStop(1, hs(360 * t + 140, 58, 85)); c.fillStyle = g; c.beginPath(); c.roundRect(40, 34, 240, 112, 22); c.fill(); }, { lp: 1, T: 6 }],
  ['Stop-motion (On Twos)', 'コマ撮り風（コマ落とし）', '1秒あたりのコマ数をわざと減らして、カクカクした動きにする。上はなめらか、下は少ないコマ数。手作り感やアニメらしさが出る。', 'Deliberately lowering the frame rate for a choppy, hand-made feel. Top is smooth; bottom updates only a few times per second.',
    (c, t) => { [[t, 54, FG, Lx('なめらか', 'SMOOTH')], [Math.floor(t * 10) / 10, 126, cA, Lx('コマ落とし', 'CHOPPY')]].forEach(([u, y, col, n]) => { dT(c, n, 16, y, 11, cM, 1, 'left'); dR(c, mix(110, 280, pg(u)), y, 30, 30, 6, col, 1, 360 * u); }); }, { lp: 1 }],
  ['Line Boil', 'ラインボイル（線のゆらぎ）', '止まっている絵の輪郭線を、数コマごとに少しずつ描き直して、線が小さく震え続けるようにする。手描きアニメの「生きている感じ」が出る。', 'A still drawing’s outline is redrawn slightly differently every few frames so the line keeps trembling: the living feel of hand-drawn animation.',
    (c, t, s) => { const f = Math.floor(s * 7); c.strokeStyle = cY; c.lineWidth = 3.5; c.lineJoin = 'round'; c.beginPath(); for (let k = 0; k <= 60; k++) { const a = k * TAU / 60, r = 46 + 3 * Math.sin(a * 5 + hash(f) * TAU) + 2 * Math.sin(a * 9 + hash(f + 5) * TAU); k ? c.lineTo(CX + r * Math.cos(a), CY + r * Math.sin(a)) : c.moveTo(CX + r, CY); } c.closePath(); c.stroke(); }, { lp: 1 }],
  ['Long Shadow', 'ロングシャドウ', '図形から、斜め45度の長い影が伸びる。フラットデザインに奥行きを足す定番。影は地の色を少し暗くした色にする。', 'A long 45-degree shadow extends from a shape. A flat-design staple for depth; the shadow is a slightly darker tint of the background.',
    (c, t) => { dR(c, CX, CY, 250, 130, 20, cA); c.beginPath(); c.roundRect(CX - 125, CY - 65, 250, 130, 20); c.clip(); const n = Math.round(110 * EZ.out(sg(t, 0.15, 0.65))); for (let k = n; k >= 1; k--) dR(c, CX - 40 + k, CY - 10 + k, 56, 56, 10, '#d5673d'); dR(c, CX - 40, CY - 10, 56, 56, 10, FG); }],
  ['Twinkle', 'トゥインクル（きらめき）', '小さな星形が、ばらばらのタイミングで光ってはしぼむ。新しさ・きれいさ・魔法のような雰囲気を足す。', 'Small star shapes flash and shrink at scattered times, adding a sense of newness, polish or magic.',
    (c, t) => { for (let k = 0; k < 16; k++) { const s = Math.pow(Math.max(0, S(t * 2 + hash(k))), 3) * (5 + 9 * hash(k + 4)), x = 24 + hash(k + 11) * 272, y = 20 + hash(k + 23) * 140; if (s < 0.3) continue; c.fillStyle = k % 2 ? cY : FG; c.beginPath(); for (let j = 0; j < 8; j++) { const a = j * TAU / 8, r = j % 2 ? s * 0.22 : s; j ? c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : c.moveTo(x + r, y); } c.fill(); } }, { lp: 1 }],
  ['Shockwave', 'ショックウェーブ（衝撃波）', '衝撃の瞬間に、輪が一気に広がって薄れ、対象は一瞬つぶれて戻る。着地・ヒット・決定の強い強調に使う。', 'At the moment of impact a ring bursts outward and fades while the object briefly squashes. Strong emphasis for hits and landings.',
    (c, t) => { const q = sg(t, 0.3, 0.7), e = EZ.out(q), k = Math.sin(Math.PI * sg(t, 0.3, 0.45)); dL(c, 50, 140, 270, 140, cD, 2); if (q > 0 && q < 1) { c.save(); c.globalAlpha = 1 - q; c.strokeStyle = cY; c.lineWidth = 5 * (1 - q) + 1; c.beginPath(); c.ellipse(CX, 138, 20 + 120 * e, 5 + 26 * e, 0, 0, TAU); c.stroke(); c.restore(); } dE(c, CX, mix(-30, 118, EZ.in(sg(t, 0.1, 0.3))) + 8 * k, 20 * (1 + 0.5 * k), 20 * (1 - 0.4 * k), cA); }],
  ['Spotlight', 'スポットライト', '全体を暗くして、丸い明かりの中だけをはっきり見せる。明かりを動かして、見てほしい場所へ視線を連れていく。', 'Everything is dimmed except inside a circle of light, which moves to lead the eye where you want it.',
    (c, t) => { const x = CX + 96 * S(t); dT(c, wd(), CX, CY, 42, FG, 0.14); c.beginPath(); c.arc(x, CY, 44, 0, TAU); c.clip(); c.fillStyle = 'rgba(255,215,106,.16)'; c.fillRect(0, 0, W, H); dT(c, wd(), CX, CY, 42, cY); }, { lp: 1, T: 5 }],
  ]);

  MG.cat('Infographics & UI', '図解とUIの動き', [
  ['Bar Chart Grow', '棒グラフの伸び', '棒が下から時間差で伸びて、それぞれの値の高さで止まる。最後にゆっくり。値を読ませたい棒だけ色を変えると伝わりやすい。', 'Bars grow from the baseline with a stagger and ease to their values. Colour only the bar you want read.',
    (c, t) => { [46, 78, 60, 108, 88].forEach((v, i) => { const h = v * EZ.out(sg(t, 0.1 + i * 0.07, 0.5 + i * 0.07)); dR(c, 80 + i * 40, 146 - h / 2, 24, h, 4, i === 3 ? cA : cB); }); dL(c, 50, 147, 270, 147, cM, 2); }],
  ['Line Chart Draw', '折れ線グラフの描画', '折れ線が左から右へ描かれていき、描き終わりの点がポンと出る。推移や成長を見せる。描く速さは一定にすると読みやすい。', 'A line graph is drawn left to right and its end point pops. Shows trends and growth; constant drawing speed reads best.',
    (c, t) => { const P = [[50, 128], [94, 110], [138, 118], [182, 80], [226, 88], [270, 44]], p = sg(t, 0.1, 0.66); for (let k = 0; k < 4; k++) dL(c, 50, 44 + k * 28, 270, 44 + k * 28, cD, 1); c.strokeStyle = cG; c.lineWidth = 4; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash([268 * p, 600]); c.beginPath(); P.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.setLineDash([]); dC(c, 270, 44, 7 * Math.max(0, EZ.back(sg(t, 0.66, 0.82))), FG); }],
  ['Donut Chart', 'ドーナツグラフ', '輪が12時の位置から時計回りに伸びて割合の所で止まり、中央の数字も一緒に増える。達成率や構成比を見せる。', 'A ring grows clockwise from 12 o’clock to its share while the number in the centre counts up. For completion and proportions.',
    (c, t) => { const p = EZ.out(sg(t, 0.1, 0.7)); dO(c, CX, CY, 50, cD, 14); c.strokeStyle = cA; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(CX, CY, 50, -Math.PI / 2, -Math.PI / 2 + TAU * 0.72 * p + 0.001); c.stroke(); dT(c, Math.round(72 * p) + '%', CX, CY + 1, 26); }],
  ['Progress Bar', 'プログレスバー', '帯が左から右へ伸びて、進み具合を示す。一定の速さではなく、少し進んでは止まる動きにすると本物らしく見える。', 'A bar fills from left to right to show progress. Advancing in small pushes with pauses looks more real than constant speed.',
    (c, t) => { const p = (EZ.io(sg(t, 0.08, 0.3)) * 0.35 + EZ.io(sg(t, 0.36, 0.55)) * 0.4 + EZ.io(sg(t, 0.62, 0.8)) * 0.25); dR(c, CX, CY + 8, 220, 14, 7, cD); dR(c, 50 + 110 * p, CY + 8, 220 * p, 14, 7, cG); dT(c, Math.round(100 * p) + '%', CX, CY - 22, 24); }],
  ['Callout', 'コールアウト（引き出し線）', '注目点に丸がポンと出て、そこから線が伸び、線の先に説明の文字が現れる。図や写真の一部を説明するときに使う。点→線→文字の順。', 'A dot pops on the point of interest, a line extends from it, and a label appears at its end. Order: dot, line, text.',
    (c, t) => { const a = EZ.out(sg(t, 0.26, 0.46)), b = EZ.out(sg(t, 0.44, 0.62)); dR(c, 96, 112, 90, 70, 12, cD); dC(c, 112, 100, 6 * Math.max(0, EZ.back(sg(t, 0.1, 0.3))), cA); if (a > 0) dL(c, 112, 100, 112 + 46 * a, 100 - 46 * a, cA, 2); if (b > 0) dL(c, 158, 54, 158 + 100 * b, 54, cA, 2); dT(c, Lx('ここがポイント', 'KEY POINT'), 164, 40, 14, FG, sg(t, 0.56, 0.72), 'left'); }],
  ['Lower Third', 'ローワーサード（名前テロップ）', '画面の下3分の1に出る、名前や肩書きの帯。色の棒が先に出て、続けて帯が横に開き、文字が現れる。インタビューや解説動画の定番。', 'The name-and-title strip in the lower third of the frame: an accent bar first, then the plate opens sideways and the text appears.',
    (c, t) => { const a = EZ.out(sg(t, 0.1, 0.3)), b = EZ.out(sg(t, 0.24, 0.52)), o = sg(t, 0.46, 0.62); dR(c, 40, 126, 7, 50 * a, 2, cA); c.fillStyle = '#24242c'; c.fillRect(46, 101, 190 * b, 50); c.beginPath(); c.rect(46, 101, 190 * b, 50); c.clip(); dT(c, Lx('山田 はなこ', 'Hanako Yamada'), 58, 118 + 8 * (1 - o), 18, FG, o, 'left'); dT(c, Lx('モーションデザイナー', 'Motion Designer'), 58, 139, 11, cM, sg(t, 0.52, 0.68), 'left'); }],
  ['Logo Sting', 'ロゴスティング（ロゴの登場）', '輪が描かれ、中の印がポンと出て、名前が横から滑り出る。2〜3秒の短いロゴ登場。動画の最初や最後に置く。', 'A ring draws, the mark pops inside it, and the name slides out beside it. A 2–3s logo reveal for intros and outros.',
    (c, t) => { const p = EZ.out(sg(t, 0.46, 0.72)), x = 160 - 54 * p; c.strokeStyle = cA; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(x, CY, 28, -Math.PI / 2, -Math.PI / 2 + TAU * EZ.io(sg(t, 0.08, 0.4))); c.stroke(); dR(c, x, CY, 24 * Math.max(0, EZ.back(sg(t, 0.3, 0.5))), 24 * Math.max(0, EZ.back(sg(t, 0.3, 0.5))), 5, cY, 1, 45); c.beginPath(); c.rect(x + 34, 0, W, H); c.clip(); dT(c, 'LOGO', x + 44 - 60 * (1 - p), CY + 1, 30, FG, p, 'left'); }],
  ['Pin Drop', 'ピンドロップ', '地図のピンが上から落ちてきて刺さり、小さく弾んで、足元に波紋が広がる。場所を示す定番の動き。', 'A map pin drops in, lands with a small bounce, and a ripple spreads at its base. The standard way to mark a place.',
    (c, t) => { const y = mix(-40, 112, EZ.bounce(sg(t, 0.1, 0.55))), q = sg(t, 0.36, 0.8); if (q > 0 && q < 1) { c.save(); c.globalAlpha = 1 - q; c.strokeStyle = cA; c.lineWidth = 2.5; c.beginPath(); c.ellipse(CX, 134, 46 * EZ.out(q), 12 * EZ.out(q), 0, 0, TAU); c.stroke(); c.restore(); } c.fillStyle = cA; c.beginPath(); c.arc(CX, y - 26, 19, Math.PI * 0.82, Math.PI * 0.18); c.lineTo(CX, y + 22); c.closePath(); c.fill(); dC(c, CX, y - 26, 7, FG); }],
  ['Click Ripple', 'クリックの波紋', 'カーソルがボタンへ動いて押すと、ボタンが少し沈み、押した点から波紋が広がる。操作に反応したことを伝える。', 'The cursor moves to a button and presses it: the button dips slightly and a ripple spreads from the click point. Confirms the action.',
    (c, t) => { const m = EZ.io(sg(t, 0.08, 0.36)), q = sg(t, 0.4, 0.75), k = Math.sin(Math.PI * sg(t, 0.38, 0.5)), x = mix(266, 176, m), y = mix(150, 96, m), s = 1 - 0.05 * k; c.save(); c.translate(CX, CY); c.scale(s, s); dR(c, 0, 0, 150, 52, 26, cA); c.beginPath(); c.roundRect(-75, -26, 150, 52, 26); c.clip(); if (q > 0 && q < 1) dC(c, 16, 6, 110 * EZ.out(q), '#fff', 0.35 * (1 - q)); dT(c, Lx('送信', 'SEND'), 0, 1, 20, cK); c.restore(); c.fillStyle = FG; c.strokeStyle = '#0a0a0c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20); c.lineTo(x + 5.5, y + 15); c.lineTo(x + 13, y + 14); c.closePath(); c.fill(); c.stroke(); }],
  ['Toggle Switch', 'トグルスイッチ', 'つまみが反対側へ滑り、同時に土台の色が変わる。0.2秒ほど。オンとオフが、位置と色の両方で分かるようにする。', 'The knob slides to the other side while the track changes colour, in about 0.2s. State is shown by both position and colour.',
    (c, t) => { const k = EZ.io(sg(t, 0.15, 0.32)) - EZ.io(sg(t, 0.62, 0.79)); dR(c, CX, CY, 104, 54, 27, k > 0.5 ? cG : cD); dC(c, CX - 25 + 50 * k, CY, 21, FG); }, { lp: 1 }],
  ['Toast', 'トースト通知', '小さな知らせの帯が、画面の端から少し弾みながら入ってきて、数秒とどまり、同じ方向へ引っこむ。操作を止めない知らせに使う。', 'A small notice slides in from an edge with a slight bounce, stays a few seconds, and retreats the same way. Non-blocking feedback.',
    (c, t) => { const y = mix(-34, 34, EZ.back(sg(t, 0.1, 0.32)) - EZ.in(sg(t, 0.7, 0.86))); dR(c, CX, y, 210, 42, 12, '#26262e'); dC(c, CX - 84, y, 9, cG); dT(c, Lx('保存しました', 'Saved'), CX - 66, y + 1, 15, FG, 1, 'left'); }],
  ['Loading Dots', 'ローディングドット', '3つの点が、時間差で順番に跳ねる動きをくり返す。「処理中」「入力中」を表す。1周0.8〜1.2秒。', 'Three dots hop one after another in a loop. Means “working” or “typing”. One cycle takes 0.8–1.2s.',
    (c, t) => { for (let i = 0; i < 3; i++) { const k = Math.pow(Math.max(0, S(t * 2 - i * 0.14)), 2); dC(c, CX - 30 + i * 30, CY - 18 * k, 9, cY, 0.5 + 0.5 * k); } }, { lp: 1 }],
  ['Odometer', 'オドメーター（数字の回転）', '数字の桁がそれぞれ縦に回転して、目標の数に止まる。右の桁ほど多く回す。車の走行距離計のような数字の切り替え。', 'Each digit column rolls vertically and stops on the target number, right-hand digits spinning more. Like a car’s mileage counter.',
    (c, t) => { const D = [2, 0, 4, 8]; c.beginPath(); c.rect(0, CY - 26, W, 52); c.clip(); D.forEach((d, i) => { const v = (d + 10 * (i + 1)) * EZ.out(sg(t, 0.1, 0.5 + i * 0.1)), f = fr(v), n = Math.floor(v) % 10, x = CX - 60 + i * 40; dR(c, x, CY, 34, 52, 6, '#22222a'); dT(c, String(n), x, CY + 1 - 52 * f, 36, cY); dT(c, String((n + 1) % 10), x, CY + 53 - 52 * f, 36, cY); }); }],
  ['Menu to Close', 'メニュー⇄閉じる（アイコンの変形）', '三本線のメニューアイコンが、×印に形を変える。上下の線が中央へ寄って斜めに回り、真ん中の線は消える。開閉の状態を1つのアイコンで示す。', 'A three-line menu icon turns into a cross: top and bottom lines meet and rotate while the middle fades. One icon shows open and closed.',
    (c, t) => { const k = EZ.io(pg(t)); [-1, 0, 1].forEach(d => { if (d) dR(c, CX, CY + d * 18 * (1 - k), 64, 8, 4, FG, 1, d * 45 * k); else dR(c, CX, CY, 64 * (1 - k), 8, 4, FG, 1 - k); }); }, { lp: 1 }],
  ['Speech Bubble', '吹き出しのポップ', '吹き出しが、しっぽの付け根を支点にしてポンと膨らんで現れ、中で3つの点が順に明滅する。会話やコメントの登場に使う。', 'A speech bubble pops open from the base of its tail, with three dots pulsing inside. For chat and comments.',
    (c, t) => { const s = Math.max(0, EZ.back(sg(t, 0.1, 0.36))); c.translate(104, 136); c.scale(s, s); c.fillStyle = cB; c.beginPath(); c.roundRect(-10, -100, 150, 76, 20); c.moveTo(0, 0); c.lineTo(8, -30); c.lineTo(36, -26); c.closePath(); c.fill(); for (let i = 0; i < 3; i++) dC(c, 40 + i * 25, -62, 7, '#0d1b33', 0.3 + 0.7 * Math.pow(Math.max(0, S(t * 3 - i * 0.15)), 2)); }],
  ['Step Progress', 'ステップ表示', '手順を表す丸が線でつながり、線が次の丸まで伸びると、その丸に色がついてポンと弾む。申込みや設定の「いま何番目か」を示す。', 'Circles for each step are joined by a line; as the line reaches the next circle it fills and pops. Shows where you are in a flow.',
    (c, t) => { const p = sg(t, 0.1, 0.8) * 3; dL(c, 64, CY, 256, CY, cD, 5); dL(c, 64, CY, 64 + 64 * p, CY, cA, 5); for (let i = 0; i < 4; i++) { const on = p >= i - 0.02, k = on ? 1 + 0.35 * Math.sin(Math.PI * cl((p - i) / 0.35)) : 1; dC(c, 64 + i * 64, CY, 13 * k, on ? cA : cD); dT(c, String(i + 1), 64 + i * 64, CY + 1, 13, on ? cK : cM); } }],
  ]);

  /* ---- 一覧へ登録する（AEの322個の後ろに、2冊目として足す） ---- */
  PRESETS.forEach(p => { p.book = 'ae'; });
  CATS.forEach(c => { c.book = 'ae'; });
  let num = 0;
  MG.cats.forEach(cat => {
    const ci = CATS.length, C0 = { name: cat.name, ja: cat.ja, list: cat.list, book: 'mg', start: num + 1 };
    CATS.push(C0); CAT_EN.push(cat.name);
    cat.list.forEach(([name, nameJa, ja, en, draw, o]) => {
      num++;
      PRESETS.push({ n: PRESETS.length + 1, num, id: 'MG-' + pad(num, 3), name, nameJa, ja, en, cat: cat.name, catJa: cat.ja, catEn: cat.name, ci, book: 'mg', cfg: Object.assign({ m: 'custom', draw, T: 3.2 }, o) });
    });
    C0.end = num;
  });
  MG.count = num;
})();
