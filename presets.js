'use strict';
/* After Effects 付属のテキストアニメーションプリセット一覧。
   名前と並びは Adobe 公式ヘルプ「Animation preset list ＞ Text」（2026-09-09 更新版）のとおり。
   動きの設定は AE の .ffx を読んだものではなく、ブラウザ用に組んだ再現。 */
const I = (p, o) => Object.assign({ m: 'in', p }, o), O = (p, o) => Object.assign({ m: 'out', p }, o);
const CI = (cf, o) => Object.assign({ m: 'in', cf }, o), CO = (cf, o) => Object.assign({ m: 'out', cf }, o);
const LP = (fn, o) => Object.assign({ m: 'loop', fn }, o);
const PA = (path, pm, o) => Object.assign({ m: 'path', path, pm }, o);
const TX = (txt, o) => Object.assign({ m: 'loop', txt }, o);
const hs = (h, l = 62, s = 90) => `hsl(${h},${s}%,${l}%)`;
/* 文字列の中心まわりに deg 回し、半径を rad 倍した位置へのずれ */
const spn = (g, deg, rad = 1) => { const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R); return { x: (g.gx * c - g.gy * s) * rad - g.gx, y: (g.gx * s + g.gy * c) * rad - g.gy }; };
const rot = (g, deg) => spn(g, deg, 1);
const pad = (n, w = 2) => String(n).padStart(w, '0');

/* ---- パスの形（単位1=80px、xは±2が画面の端） ---- */
const poly = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const T = L[L.length - 1]; return u => { const d = cl(u) * T; let i = 1; while (i < pts.length - 1 && L[i] < d) i++; const k = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [mix(pts[i - 1][0], pts[i][0], k), mix(pts[i - 1][1], pts[i][1], k)]; }; };
const rpoly = (pts, r) => { const o = [pts[0]]; for (let i = 1; i < pts.length - 1; i++) { const a = pts[i - 1], b = pts[i], c = pts[i + 1], d1 = Math.hypot(b[0] - a[0], b[1] - a[1]), d2 = Math.hypot(c[0] - b[0], c[1] - b[1]), p = [b[0] + (a[0] - b[0]) * r / d1, b[1] + (a[1] - b[1]) * r / d1], q = [b[0] + (c[0] - b[0]) * r / d2, b[1] + (c[1] - b[1]) * r / d2]; for (let k = 0; k <= 6; k++) { const s = k / 6; o.push([(1 - s) * (1 - s) * p[0] + 2 * s * (1 - s) * b[0] + s * s * q[0], (1 - s) * (1 - s) * p[1] + 2 * s * (1 - s) * b[1] + s * s * q[1]]); } } o.push(pts[pts.length - 1]); return poly(o); };
const cr = pts => u => { const n = pts.length - 1, x = cl(u) * n, i = Math.min(n - 1, Math.floor(x)), k = x - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; const h = (a, b, c, d) => 0.5 * (2 * b + (c - a) * k + (2 * a - 5 * b + 4 * c - d) * k * k + (3 * b - a - 3 * c + d) * k * k * k); return [h(p0[0], p1[0], p2[0], p3[0]), h(p0[1], p1[1], p2[1], p3[1])]; };
const ln = (x0, y0, x1, y1) => u => [mix(x0, x1, u), mix(y0, y1, u)];
const circ = (r, st = 0.25, cy = 0) => u => [r * Math.cos(TAU * (st + u)), cy + r * Math.sin(TAU * (st + u))];
const spir = (turns, r0, r1) => u => { const r = mix(r0, r1, u), a = TAU * turns * u + Math.PI; return [r * Math.cos(a) * 1.5, r * Math.sin(a)]; };
const loopPath = u => { const k = sst(0.3, 0.7, u), a = TAU * k; return [-2.4 + 4.8 * u + 0.6 * Math.sin(a), 0.6 - 0.6 * (1 - Math.cos(a))]; };
const stadium = (() => { const p = [], w = 1.1, r = 0.5; for (let k = 0; k <= 10; k++) p.push([-w + 2 * w * k / 10, -r]); for (let k = 1; k <= 12; k++) { const a = -Math.PI / 2 + Math.PI * k / 12; p.push([w + r * Math.cos(a), r * Math.sin(a)]); } for (let k = 1; k <= 10; k++) p.push([w - 2 * w * k / 10, r]); for (let k = 1; k <= 12; k++) { const a = Math.PI / 2 + Math.PI * k / 12; p.push([-w + r * Math.cos(a), r * Math.sin(a)]); } return poly(p); })();
const starPath = (() => { const p = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.42 : 1; p.push([r * Math.cos(a) * 1.15, r * Math.sin(a) + 0.08]); } return poly(p); })();
const stairs = (() => { const p = [[-2.4, -0.9]]; for (let k = 0; k < 6; k++) { p.push([-1.6 + k * 0.64, -0.9 + k * 0.3]); p.push([-1.6 + k * 0.64, -0.6 + k * 0.3]); } p.push([2.5, 0.9]); return poly(p); })();

const spiralLine = (q, g) => { const k = 1 - q; return Object.assign(rot(g, 300 * k), { z: -900 * k, ry: 360 * k }); };
const WORDS = ['Text', 'Animation', 'Presets', 'Motion', 'Design', 'After', 'Effects'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const boxBg = (ctx, t, L) => { const w = L.width + 26, h = L.fs * 1.7; ctx.fillStyle = '#e8563a'; ctx.fillRect(CX - w / 2, CY - h / 2, w, h); };
const flake = (ctx, x, y, r, a) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); for (let k = 0; k < 3; k++) { const q = k * Math.PI / 3; ctx.moveTo(-r * Math.cos(q), -r * Math.sin(q)); ctx.lineTo(r * Math.cos(q), r * Math.sin(q)); } ctx.stroke(); ctx.restore(); };

const CATS = [];
const C = (name, ja, list) => CATS.push({ name, ja, list });

C('3D Text', '3Dテキスト', [
['3D Basic Position Z Cascade', '文字が奥（遠く）から手前へ、左から順に少しずつ重なりながら飛んできて並ぶ', I({ z: -1400 }, { soft: 0.7 })],
['3D Basic Position Z Typeon', '文字が奥から手前へ、タイプするように1文字ずつほぼ重ならず順に現れる', I({ z: -900 }, { soft: 0.12 })],
['3D Basic Rotate X Cascade', '各文字が横軸（X軸）まわりに前転しながら、左から順に起き上がって正面を向く', I({ rx: -270 }, { soft: 0.7 })],
['3D Basic Rotate Y Cascade', '各文字が縦軸（Y軸）まわりに回転しながら、左から順に正面を向く', I({ ry: 270 }, { soft: 0.7 })],
['3D Bouncing In Centered', '中央の文字から外側へ順に、手前の上方から落ちてきて弾んで着地する', I({ y: -150, z: 250 }, { ord: 'c', e: 'bounce', of: 1, soft: 0.6 })],
['3D Fall Back Scale & Skew', '文字が斜めに傾き、縦につぶれながら、奥へ倒れ込むように順に遠ざかって消える', O({ z: -1600, sk: 35, sy: -0.5 }, { soft: 0.6 })],
['3D Fall Back Scramble & Blur', '文字がでたらめな文字に化けながらぼけて、奥へ遠ざかって消える', O({ z: -1600, ch: 1, b: 5 }, { soft: 0.6 })],
['3D Flip In Rotate X', '各文字が足元を軸にパタンと起き上がって順に現れる（少し行きすぎて戻る）', I({ rx: 90 }, { soft: 0.4, e: 'back', of: 1, ay: 0.38 })],
['3D Flip Out Rotate X', '各文字が足元を軸に奥へパタンと倒れて、順に消える', O({ rx: -90 }, { soft: 0.4, ay: 0.38 })],
['3D Flip Up Reflection', '文字が下から起き上がって現れ、足元に床の映り込み（反射）がつく', I({ rx: 90, y: 8 }, { soft: 0.5, refl: 1, ay: 0.38 })],
['3D Flutter In From Left', '文字が左の画面外から、ひらひらと裏表に回転しながら飛んできて並ぶ', I({ x: -300, y: -30, ry: 720, rx: 180 }, { soft: 0.9, ord: 'b' })],
['3D Flutter In Random Order', '文字がランダムな順番で、ひらひら回転しながら四方から舞い込んで並ぶ', I({ x: 220, y: 110, ry: 720, rx: 180 }, { soft: 0.9, ord: 'r', rn: 'x y' })],
['3D Flutter Out From Right', '右端の文字から順に、ひらひら回転しながら右へ飛び去る', O({ x: 300, y: -30, ry: 720, rx: 180 }, { soft: 0.9, ord: 'b' })],
['3D Fly Down & Unfold', '文字が上から降りてきて、寝た状態からパタンと開くように起きる', I({ y: -150, rx: -90, z: 150 }, { soft: 0.6 })],
['3D Fly Down Behind Camera', 'カメラの後ろ（手前）から巨大な文字が頭上を越えて降り、奥の定位置へ収まる', I({ y: -28, z: 372 }, { soft: 0.6 })],
['3D Fly Down Random & Rotate Y', 'ランダムな順番で、文字が縦軸まわりに回転しながら上から降ってくる', I({ y: -160, ry: 360 }, { soft: 0.7, ord: 'r' })],
['3D Lines Zoom In', '行ごとに、カメラのすぐ手前から奥へ引いていくようにズームして定位置に収まる', I({ z: 380 }, { u: 'l', L: 3, soft: 0.5 })],
['3D Rain Down Words & Colors', '単語ごとに色を変えながら、上から雨のように降って並ぶ（並んだあとも単語ごとに色が違う）', CI((q, g) => ({ y: -170 * (1 - q), z: 200 * (1 - q), col: hs(g.wi * 75 + 200 * (1 - q)) }), { u: 'w', soft: 0.6 })],
['3D Random Spike Tumble', 'ランダムな文字が、手前へ突き出すように飛び出して回転し、元へ戻るのをくり返す', LP((g, t) => { const k = wv(g.r, t, 0.25, 1); return { z: 300 * k, rx: 360 * k * (g.r2 - 0.5), ry: 300 * k * (g.r3 - 0.5) }; })],
['3D Resolve Position', '3D空間にばらばらに散った文字が、同時にすっと定位置へ集まる', I({ x: 170, y: 90, z: 330 }, { rn: 'x y z', soft: 4, e: 'io' })],
['3D Rotate around Circle', '文字列が円筒状の輪になって、縦軸まわりにぐるぐる回り続ける（奥側は裏返って薄く見える）', LP((g, t) => { const a = (g.u * 0.9 + t) * 360, r = 95; return { x: Math.sin(a * D2R) * r - g.gx, z: Math.cos(a * D2R) * r - 20, ry: a, a: Math.cos(a * D2R) > -0.1 ? 1 : 0.28 }; })],
['3D Rotate in by Character', '1文字ずつ縦軸まわりに90度回って、扉が開くように正面を向く', I({ ry: 90, x: -12 }, { soft: 0.5 })],
['3D Rotate out by Word', '単語ごとに縦軸まわりに回転して横を向き、順に消える', O({ ry: 90 }, { u: 'w', soft: 0.5 })],
['3D Scramble in Position Z', 'でたらめな文字がランダムな順に奥から飛んできて、正しい文字に変わる', I({ z: -900, ch: 1 }, { ord: 'r', soft: 0.7 })],
['3D Spiral Down & Unfold', '文字がらせんを描きながら上から降り、最後にパタンと開いて並ぶ', CI((q) => { const k = 1 - q; return { x: Math.sin(k * TAU * 1.5) * 90 * k, y: -150 * k, z: Math.cos(k * TAU * 1.5) * 150 * k, ry: 540 * k, rx: -90 * k }; }, { soft: 0.8 })],
['3D Spiral Rotate In by Line', '行ごとに、らせん状に回転しながら奥から近づいて現れる', CI(spiralLine, { u: 'l', L: 3, soft: 0.6 })],
['3D Spiral Rotate Out by Line', '行ごとに、らせん状に回転しながら奥へ遠ざかって消える', CO(spiralLine, { u: 'l', L: 3, soft: 0.6 })],
['3D Swing Around on Path', '文字列が弧を描く道すじに沿って、手前と奥を行き来するように左右へ大きく振れ続ける', LP((g, t) => { const a = (g.u - 0.5) * 120 + S(t) * 70, r = 110; return { x: Math.sin(a * D2R) * r - g.gx, z: Math.cos(a * D2R) * r - r, ry: a }; })],
['3D Tumble Words Forward', '単語ごとに、前転しながら奥から手前へ転がり出て並ぶ', I({ rx: -360, z: -700, y: -30 }, { u: 'w', soft: 0.6 })],
['3D Twist & Color Characters', '文字が左から順に横軸まわりにねじれて1回転し、回っている間だけ色が変わる', LP((g, t) => { const k = wv(g.u, t, 0.35, 0.65); return { rx: 360 * wq(g.u, t, 0.35, 0.65), col: k > 0.05 ? hs(200 + 160 * k) : null }; })],
]);

C('Animate In', 'アニメートイン（登場）', [
['Center Spiral', '文字が中央の一点から、回転しながらうず巻き状に広がって定位置へ並ぶ', CI((q, g) => { const k = 1 - q; return Object.assign(spn(g, -300 * k, q), { r: -300 * k, s: -k * 0.6 }); }, { soft: 0.8 })],
['Characters Shuffle In', '文字が右の画面外からランダムな順に滑り込み、入れ替わるように並ぶ', I({ x: 300 }, { ord: 'r', soft: 0.7, o: 0 })],
['Decoder Fade In', 'でたらめな文字がランダムな順に浮かび、暗号が解けるように正しい文字へ変わる', I({ ch: 1 }, { ord: 'r', soft: 0.6 })],
['Drop In By Character', '1文字ずつ上から落ちてきて、左から順に並ぶ', I({ y: -150 }, { soft: 0.5 })],
['Espresso Eye Chart', '大きくぼけた文字が1文字ずつ縮んでピントが合い、視力検査表のように並ぶ', I({ s: 4, b: 8 }, { soft: 0.5 })],
['Fade Up And Flip', '1文字ずつフェードインしながら、上下に裏返った状態からくるっと表に返る', I({ rx: 180 }, { soft: 0.5 })],
['Fade Up Characters', '左から1文字ずつ、ふわっとフェードインする', I({}, { soft: 0.25 })],
['Fade Up Lines', '1行ずつ、上の行から順にフェードインする', I({}, { u: 'l', L: 3, soft: 0.25 })],
['Fade Up Words', '1単語ずつ、左から順にフェードインする', I({}, { u: 'w', soft: 0.25 })],
['Fly In From Bottom', '文字が下の画面外から飛び上がり、左から順に定位置で止まる', I({ y: 160 }, { soft: 0.6, o: 0 })],
['Fly In With A Twist', '文字が大きく回転しながら右上から飛び込み、ねじれがほどけて並ぶ', I({ x: 230, y: -90, r: 200, s: 1.2 }, { soft: 0.7 })],
['Pop Buzz Words', '単語がひとつずつ、点から弾けるようにポンと現れる（少し大きくなりすぎて戻る）', I({ s: -1 }, { u: 'w', soft: 0.15, e: 'back', of: 1 })],
['Raining Characters In', 'でたらめな文字が雨のように上から降り、着地しながら正しい文字に変わる', I({ y: -160, ch: 1 }, { ord: 'r', soft: 0.9 })],
['Random Fade Up', '文字がランダムな順番でフェードインする', I({}, { ord: 'r', soft: 0.25 })],
['Random Shuffle In', '文字が左右の画面外から、ランダムな順・ランダムな距離で滑り込んで並ぶ', I({ x: 300 }, { ord: 'r', rn: 'x', soft: 0.7, o: 0 })],
['Random Word Shuffle In', '単語が左右の画面外から、ランダムな順に滑り込んで並ぶ', I({ x: 330 }, { u: 'w', ord: 'r', rn: 'x', soft: 0.7, o: 0 })],
['Slow Fade On', '全体がゆっくり、左からじわっと滲むようにフェードインする', I({}, { soft: 2.5, d: 0.7, e: 'lin' })],
['Smooth Move In', '文字が右から短い距離をなめらかに滑りながら、フェードインして止まる', I({ x: 120 }, { soft: 1.2, d: 0.6 })],
['Spin In By Character', '1文字ずつ、点のような小ささから回転しながら拡大して現れる', I({ r: -360, s: -1 }, { soft: 0.5 })],
['Spin In By Word', '単語ごとに、点のような小ささから回転しながら拡大して現れる', I({ r: -360, s: -1 }, { u: 'w', soft: 0.5 })],
['Straight In By Character', '1文字ずつ、右の画面外からまっすぐ滑り込んで並ぶ', I({ x: 300 }, { soft: 0.4, o: 0 })],
['Straight In By Word', '単語ごとに、右の画面外からまっすぐ滑り込んで並ぶ', I({ x: 330 }, { u: 'w', soft: 0.4, o: 0 })],
['Straight In Multi-Line', '複数行が1行ずつ、左右交互の画面外からまっすぐ滑り込む', I({ x: 330 }, { u: 'l', L: 3, alt: 1, soft: 0.5, o: 0 })],
['Stretch In Each Line', '行ごとに、横へ大きく引き伸ばされた状態から縮んで正しい幅になる', I({ sx: 4, tr: 50 }, { u: 'l', L: 3, soft: 0.4 })],
['Stretch In Each Word', '単語ごとに、横へ大きく引き伸ばされた状態から縮んで正しい幅になる', I({ sx: 4, tr: 50 }, { u: 'w', soft: 0.4 })],
['Twirl On Each Line', '行ごとに、文字が縦軸まわりにくるくる回りながら現れる', I({ ry: 450 }, { u: 'l', L: 3, soft: 0.5 })],
['Twirl On Each Word', '単語ごとに、文字が縦軸まわりにくるくる回りながら現れる', I({ ry: 450 }, { u: 'w', soft: 0.5 })],
['Typewriter', 'タイプライターのように、左から1文字ずつ瞬時に現れる（フェードなし）', I({}, { soft: 0, e: 'lin', d: 0.6 })],
['Wipe In To Center', '両端の文字から中央へ向かって、順にフェードインする', I({}, { ord: 'e', soft: 0.3 })],
]);

C('Animate Out', 'アニメートアウト（退場）', [
['Encoder Fade Out', '文字がランダムな順にでたらめな文字へ化けながら、暗号化されるように消える', O({ ch: 1 }, { ord: 'r', soft: 0.6 })],
['Fade Out By Character', '左から1文字ずつ、順にフェードアウトする', O({}, { soft: 0.25, eo: 'lin' })],
['Fade Out Slow', '全体がゆっくり、じわっとフェードアウトする', O({}, { soft: 2.5, d: 0.6, eo: 'lin' })],
['Raining Characters Out', '文字がでたらめな文字に化けながら、ランダムな順に雨のように下へ落ちて消える', O({ y: 160, ch: 1 }, { ord: 'r', soft: 0.9 })],
['Random Fly Off', '文字がランダムな順に、回転しながらばらばらの方向へ飛び去る', O({ x: 280, y: 160, r: 220 }, { ord: 'r', rn: 'x y r', soft: 0.7 })],
['Random Word Fly Off', '単語がランダムな順に、回転しながらばらばらの方向へ飛び去る', O({ x: 300, y: 170, r: 120 }, { u: 'w', ord: 'r', rn: 'x y r', soft: 0.7 })],
['Slide Off Right By Character', '右端の文字から1文字ずつ、右の画面外へまっすぐ滑り出ていく', O({ x: 300 }, { ord: 'b', soft: 0.4, o: 0 })],
['Slide Off Right By Word', '右の単語から順に、右の画面外へまっすぐ滑り出ていく', O({ x: 330 }, { u: 'w', ord: 'b', soft: 0.4, o: 0 })],
['Stretch Out Each Line', '行ごとに、横へ大きく引き伸ばされながら消える', O({ sx: 4, tr: 50 }, { u: 'l', L: 3, soft: 0.4 })],
['Stretch Out Each Word', '単語ごとに、横へ大きく引き伸ばされながら消える', O({ sx: 4, tr: 50 }, { u: 'w', soft: 0.4 })],
['Twirl Off Each Line', '行ごとに、文字が縦軸まわりにくるくる回りながら消える', O({ ry: 450 }, { u: 'l', L: 3, soft: 0.5 })],
['Twirl Off Each Word', '単語ごとに、文字が縦軸まわりにくるくる回りながら消える', O({ ry: 450 }, { u: 'w', soft: 0.5 })],
]);

C('Curves and Spins', 'カーブとスピン', [
['Bloom Flower', '中央に花のつぼみのように束ねられた文字が、放射状に傾いた状態から花が開くように広がって並ぶ', CI((q, g) => { const k = 1 - q; return { c: k, r: (g.u - 0.5) * 300 * k, s: -0.5 * k }; }, { soft: 2, e: 'io' })],
['Clockwise Entry', '文字が時計回りの大きな弧を描いて、上から回り込むように1文字ずつ入ってくる', CI((q) => { const k = 1 - q, a = (-90 - 200 * k) * D2R; return { x: 120 * k * Math.cos(a), y: 120 * k * Math.sin(a) + 0, r: 200 * k }; }, { soft: 0.7 })],
['Counter Rotate', '隣り合う文字どうしが互いに逆向きに、その場でくるっと1回転するのをくり返す', LP((g, t) => ({ r: 360 * EZ.io(cl(t / 0.7)) * (g.i % 2 ? 1 : -1) }))],
['Dust Devil', '文字がつむじ風のように、左右へ大きく振れる渦を描いて下から巻き上がり、渦が細くなって定位置に収まる', CI((q, g) => { const k = 1 - q; return { x: Math.sin(k * 14 + g.i) * 90 * k, y: 130 * k, r: 500 * k, s: -0.4 * k }; }, { soft: 0.9 })],
['Lasso Tumble', '文字列が投げ縄の輪（円）に沿ってぐるりと回り込み、各文字が転がるように回転しながら輪の上で止まる', PA(circ(0.72), 'on', { fs: 16, pf: (g, t) => ({ r: -720 * (1 - EZ.out(cl(t / 0.6))) }) })],
['Lasso', '文字列が投げ縄の輪（円）に沿ってぐるりと回り込み、輪の上で止まる', PA(circ(0.72), 'on', { fs: 16 })],
['Musical Chairs', '文字列全体が椅子取りゲームのように中心のまわりを1周回って、元の席に戻る', CI((q, g) => rot(g, 360 * (1 - q)), { u: 'a', soft: 1, e: 'io', o: 0, d: 0.6 })],
['Newton', 'ニュートンのゆりかごのように、左端の文字が外へ振れて戻ると、反対の右端の文字が振れる、を交互にくり返す', LP((g, t) => { const L = g.i === 0, R = g.i === g.n - 1; if (!L && !R) return {}; const k = L ? Math.max(0, S(t)) : Math.max(0, -S(t)); return { r: (L ? 1 : -1) * 38 * k, ay: -2.2 }; })],
['Pinwheel', '文字列が風車のように中心を軸に回り、各文字も自転しながら定位置で止まる', CI((q, g) => { const k = 1 - q; return Object.assign(rot(g, -540 * k), { r: -900 * k }); }, { u: 'a', soft: 1, e: 'out', d: 0.6 })],
['Radial Flare', '中央の一点に集まった大きな文字が、放射状にぱっと広がりながら縮んで定位置へ並ぶ', I({ c: 1, s: 1.5 }, { ord: 'c', soft: 1.2, e: 'exp' })],
['Retrograde', '文字が反時計回りの楕円軌道を逆行するように回り込み、1文字ずつ定位置に入る', CI((q) => { const k = 1 - q, a = (90 + 250 * k) * D2R; return { x: 150 * k * Math.cos(a), y: 70 * k * Math.sin(a), r: -250 * k }; }, { soft: 0.8, ord: 'b' })],
['Rotate', '1文字ずつ、その場でくるっと1回転しながらフェードインする', I({ r: 360 }, { soft: 0.5 })],
['Somersault', '文字が1文字ずつ、山なりに跳ねて宙返りしながら左から飛び込む', CI((q) => { const k = 1 - q; return { x: -70 * k, y: -55 * Math.sin(Math.PI * q) - 20 * k, r: -360 * k }; }, { soft: 0.6, e: 'io' })],
['Spin Fast', '各文字がその場で高速で何回転もして、急ブレーキをかけるようにぴたっと止まる', I({ r: 1440 }, { soft: 1.5, e: 'exp', o: 0, d: 0.6 })],
['Spiral Exit', '文字が中心へ向かってうず巻き状に回り込み、小さくなって吸い込まれるように消える', CO((q, g) => { const k = 1 - q; return Object.assign(spn(g, 400 * k, q), { r: 400 * k, s: -k }); }, { soft: 0.8 })],
['Spiral In', '文字が外側からうず巻き状に回り込みながら、大きくなって定位置へ入ってくる', CI((q, g) => { const k = 1 - q; return Object.assign(spn(g, -400 * k, 1 + 1.6 * k), { r: -400 * k, s: -0.6 * k }); }, { soft: 0.8 })],
['Spirograph', '文字がスピログラフ定規で描く花模様のような細かい輪の軌道をたどって、定位置に落ち着く', CI((q, g) => { const k = 1 - q, a = k * TAU * 2 + g.i * 0.5; return { x: (Math.cos(a) + Math.cos(a * 3.5) * 0.6) * 70 * k, y: (Math.sin(a) - Math.sin(a * 3.5) * 0.6) * 45 * k }; }, { soft: 1.5, e: 'io', d: 0.65 })],
['Swoopy Entry', '文字が左上から、ぐっと下へ沈み込んでからすくい上げるような大きな弧で滑り込む', CI((q) => { const k = 1 - q; return { x: -230 * k, y: -120 * k * k + 60 * Math.sin(Math.PI * k), r: -40 * Math.sin(Math.PI * k) }; }, { soft: 0.7 })],
['Tea Leaves', '文字がカップの中の茶葉のように、ゆっくり渦を巻いて漂いながら沈んで定位置に落ち着く', CI((q, g) => { const k = 1 - q, a = TAU * (g.r + 1.2 * k); return { x: Math.cos(a) * 80 * k * (0.5 + g.r2), y: Math.sin(a) * 45 * k * (0.5 + g.r2), r: (g.r - 0.5) * 500 * k }; }, { soft: 3, e: 'io', d: 0.7 })],
['Tire Rim', '文字列がタイヤのホイールのように円周に並び、車輪として回り続ける', PA(circ(0.78), 'loop', { fs: 16 })],
['Whirl In', '文字列全体が渦を巻いて回転しながら、点から拡大して現れる', CI((q, g) => { const k = 1 - q; return Object.assign(spn(g, -540 * k, q), { r: -540 * k, s: -k }); }, { u: 'a', soft: 1, d: 0.55 })],
]);

C('Graphical', 'グラフィカル（図形つき）', [
['Bars Blinky', '各文字の後ろに色つきの縦長の帯が敷かれ、帯がばらばらのタイミングで点滅する', LP((g, t) => { const on = hash(g.i * 3.3 + Math.floor(t * 12)) > 0.45; return { bg: { k: 'r', col: hs(g.i * 47 % 360, 55), a: on ? 0.95 : 0.15, h: 1.25 }, col: on ? '#111' : null }; })],
['Bars Lime', '各文字の後ろにライムグリーンの縦帯が、左から順に下から伸びて立ち上がる', CI((q) => ({ bg: { k: 'r', col: '#b6e03a', h: 1.25 * q, dy: 0.72 * (1 - q), s: 1 }, col: '#16210a', a: 1 }), { soft: 0.6, e: 'out' })],
['Blue Note', '各文字の後ろに青い丸が置かれ、音符が弾むように順番にふくらんでは戻る', LP((g, t) => { const k = wv(g.u, t, 0.25, 0.75); return { bg: { k: 'c', col: hs(215, 45 + 15 * k), s: 0.95 + 0.45 * k }, y: -6 * k }; })],
['Cut Shapes', '白い四角形の中に文字が切り抜かれたように黒く見え、四角形が1文字ずつ傾きながら現れる', CI((q, g) => ({ bg: { k: 'r', col: '#f3efe6', s: q, w: 1.05 }, col: '#141414', r: (g.i % 2 ? 1 : -1) * (8 + 60 * (1 - q)), a: 1 }), { soft: 0.6, e: 'back' })],
['Exchange', '文字と背景の四角の色が1文字おきに白黒で入れ替わり、波のように反転が流れていく', LP((g, t) => { const inv = fr(t * 2 - g.u * 1) < 0.5; return { bg: { k: 'r', col: inv ? '#f3efe6' : '#2a2a2a', w: 1.05 }, col: inv ? '#141414' : '#f3efe6' }; })],
['Green Dots', '各文字の後ろに緑の丸が、左から順に点から広がって現れる', CI((q) => ({ bg: { k: 'c', col: '#3fbf6a', s: q }, col: '#06210f', a: 1 }), { soft: 0.6, e: 'back' })],
['Hazard', '黄色と黒の斜めしま模様（危険表示テープ）の帯が流れ、その上に黒い文字が乗る', LP(() => ({ col: '#111', st: 3, stc: '#f5c518' }), { bgf: (ctx, t) => { const h = 46; ctx.beginPath(); ctx.rect(0, CY - h / 2, W, h); ctx.clip(); ctx.fillStyle = '#f5c518'; ctx.fillRect(0, CY - h / 2, W, h); ctx.fillStyle = '#111'; for (let x = -80 + (t * 80) % 40; x < W + 40; x += 40) { ctx.beginPath(); ctx.moveTo(x, CY + h / 2); ctx.lineTo(x + 20, CY + h / 2); ctx.lineTo(x + 20 + h, CY - h / 2); ctx.lineTo(x + h, CY - h / 2); ctx.fill(); } } })],
['Red Circles', '各文字の後ろに赤い丸が、左から順にポンと弾けるように現れる', CI((q) => ({ bg: { k: 'c', col: '#e0453a', s: q * 1.05 }, a: 1 }), { soft: 0.3, e: 'back' })],
['Scratchy Film', '古いフィルムのように、文字が小刻みにがたつき明るさがちらつき、縦の傷の線が走る', LP((g, t, s) => ({ x: 1.5 * nz(1, t * 9), y: 1.2 * nz(2, t * 11), a: 0.7 + 0.3 * hash(Math.floor(s * 14)) }), { bgf: (ctx, t, L, s) => { ctx.strokeStyle = 'rgba(243,239,230,.35)'; ctx.lineWidth = 0.6; for (let k = 0; k < 3; k++) { const f = Math.floor(s * 10) + k * 31; if (hash(f) > 0.45) { const x = hash(f + 0.5) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 2 * (hash(f + 1) - 0.5), H); ctx.stroke(); } } } })],
['Snowflakes', '雪の結晶がひらひら舞い落ちる中、文字が雪のように上からふわりと降りて積もる', CI((q, g) => { const k = 1 - q; return { y: -130 * k, x: 14 * Math.sin(k * 8 + g.i), r: 40 * k * (g.r - 0.5) }; }, { ord: 'r', soft: 1.2, e: 'io', d: 0.65, bgf: (ctx, t) => { ctx.strokeStyle = 'rgba(243,239,230,.5)'; ctx.lineWidth = 1; for (let k = 0; k < 16; k++) { const y = fr(hash(k) + t * (1 + (k % 2))) * (H + 20) - 10, x = hash(k + 7) * W + 10 * S(t + hash(k)); flake(ctx, x, y, 3 + 3 * hash(k + 3), t * TAU + k); } } })],
['White Trim', '文字が最初は白い輪郭線だけで現れ、左から順に中身が塗りつぶされていく', CI((q, g, v) => ({ nf: v > 0.5, st: 1.4 * (1 - q) + 0.01, a: 1 }), { soft: 0.3, d: 0.6 })],
['Yellow Boxes', '各文字の後ろに黄色い四角が、左から順にぱっと現れて文字が黒く抜ける', CI((q, g, v) => ({ bg: { k: 'r', col: '#f2c230', s: v < 0.5 ? 1 : 0, w: 1.02 }, col: v < 0.5 ? '#1c1500' : null, a: 1 }), { soft: 0, e: 'lin', d: 0.6 })],
]);

C('Expressions', 'エクスプレッション', [
['Buzz Words', '同じ場所で、単語が一定のテンポで次々と別の単語に切り替わっていく', TX((t, s) => WORDS[Math.floor(s * 2.5) % WORDS.length])],
['Current Time Format', '現在の再生時間が、タイムコード（時:分:秒:コマ）の形でリアルタイムに表示され進んでいく', TX((t, s) => `0:00:${pad(Math.floor(s) % 60)}:${pad(Math.floor(s * 30) % 30)}`, { mono: 1, fs: 30 })],
['Dictionary', '辞書をめくるように、単語が非常に速くぱらぱらと切り替わり続ける', TX((t, s) => WORDS[Math.floor(hash(Math.floor(s * 9)) * WORDS.length)])],
['Display Comp Time', '再生開始からの経過時間が、秒数（小数つき）で表示され増えていく', TX((t, s) => (s % 60).toFixed(2) + ' s', { mono: 1, fs: 32 })],
['Frame Number', '現在のフレーム番号（コマ数）が表示され、1コマごとに数字が増えていく', TX((t, s) => 'Frame ' + pad(Math.floor(s * 30) % 1000, 3), { mono: 1, fs: 28 })],
['Inch Worm', '文字列が尺取り虫のように、字間を縮めてから前へ伸びる動きをくり返して少しずつ進む', LP((g, t) => { const ph = fr(t * 3), k = (1 - Cs(ph)) / 2; return { tr: -7 * k, x: -30 + 60 * ((Math.floor(t * 3) + EZ.io(ph)) / 3), a: 1 - sst(0.9, 1, t) }; }, { fs: 24 })],
['Text Bounce', '文字が1文字ずつ上から落ちてきて、だんだん小さくなる弾みで数回バウンドして止まる', I({ y: -150 }, { e: 'bounce', soft: 0.4, of: 1 })],
['2D Text Box (Mask & Effects)', '文字の後ろに色つきの四角い箱（座布団）が敷かれ、文字数が変わると箱の幅も自動で追従して伸び縮みする', TX((t) => (t < 0.33 ? 'Text' : t < 0.66 ? 'Text Box' : 'Auto Text Box'), { bgf: boxBg, fs: 26 })],
]);

C('Fill and Stroke', '塗りと線', [
['Chasing Strokes', '文字が輪郭線だけになり、線の色が追いかけっこのように左から右へ流れ続ける', LP((g, t) => ({ nf: 1, st: 1.6, stc: hs(fr(t * 2 - g.u) * 360) }))],
['Fill Color Wipe', '文字の塗り色が、左から順に別の色へワイプするように塗り替わっていく', LP((g, t) => { const k = sst(0, 0.12, t * 1.3 - g.u * 0.75) * (1 - sst(0.9, 0.98, t)); return { col: `hsl(18,${Math.round(90 * k)}%,${Math.round(92 - 32 * k)}%)` }; })],
['Flicker Color - scale', 'ランダムな文字が一瞬ずつ色を変えてちらつき、同時にその文字だけ大きくなる', LP((g, t, s) => { const on = hash(g.i * 5.1 + Math.floor(s * 9) * 3.7) > 0.78; return on ? { col: hs(hash(g.i + Math.floor(s * 9)) * 360), s: 0.4 } : {}; })],
['Flicker Color', 'ランダムな文字が一瞬ずつ、さまざまな色にちらつく', LP((g, t, s) => (hash(g.i * 5.1 + Math.floor(s * 10) * 3.7) > 0.72 ? { col: hs(hash(g.i + Math.floor(s * 10)) * 360) } : {}))],
['Flicker Green', 'ランダムな文字が一瞬ずつ、緑色にちらつく', LP((g, t, s) => (hash(g.i * 5.1 + Math.floor(s * 10) * 3.7) > 0.7 ? { col: '#4ade80' } : {}))],
['Inflammation', '文字が左から順に赤く腫れ上がるように色づき、輪郭線が太くなって膨らむ', LP((g, t) => { const k = sst(0, 0.25, t * 1.4 - g.u * 0.7) * (1 - sst(0.88, 0.98, t)); return { col: `hsl(${Math.round(40 - 34 * k)},${Math.round(95 * k)}%,${Math.round(92 - 37 * k)}%)`, st: 3 * k, stc: '#ff5a3c', s: 0.08 * k }; })],
['Pulse Blue', '文字全体の塗り色が、脈を打つように白と青の間を行き来する', LP((g, t) => { const k = (1 - Cs(t * 2)) / 2; return { col: `hsl(215,${Math.round(95 * k)}%,${Math.round(92 - 32 * k)}%)` }; })],
['Pulse Orange', '文字全体の塗り色が、脈を打つように白とオレンジの間を行き来する', LP((g, t) => { const k = (1 - Cs(t * 2)) / 2; return { col: `hsl(28,${Math.round(98 * k)}%,${Math.round(92 - 34 * k)}%)` }; })],
['Pulsing Strokes', '文字の輪郭線が、脈を打つように太くなったり細くなったりをくり返す', LP((g, t) => ({ st: 0.4 + 2.6 * (1 - Cs(t * 2)) / 2, stc: '#ff8a5c', col: '#1a1a1a' }))],
['Rotate Hue', '文字の色相が虹のように一周し続ける（左右の文字で少しずつ色がずれる）', LP((g, t) => ({ col: hs(fr(t + g.u * 0.4) * 360) }))],
['Sliding Color Flicker', 'ちらつく色の帯が左から右へ滑っていき、帯が通過している文字だけ色がちかちか変わる', LP((g, t, s) => { const k = wv(g.u, t, 0.3, 0.7); return k > 0.15 ? { col: hs(hash(g.i + Math.floor(s * 14)) * 360) } : {}; })],
['Stroke Ease Down', '極太の輪郭線がついた文字から、線がなめらかに細くなって消え、普通の文字になる', LP((g, t) => ({ st: 7 * (1 - EZ.out(cl(t / 0.6))) * (1 - sst(0.9, 1, t)) + 7 * sst(0.94, 1, t), stc: '#ff8a5c' }))],
['Wiggly Stroke Width By Line', '行ごとに、輪郭線の太さが不規則にゆらゆら変わり続ける', LP((g, t) => ({ st: 1.6 + 1.5 * nz(g.li * 7, t * 2), stc: '#ff8a5c', col: '#1a1a1a' }), { L: 3 })],
['Wiggly Stroke Width', '1文字ごとに、輪郭線の太さがばらばらに不規則にゆらゆら変わり続ける', LP((g, t) => ({ st: 1.6 + 1.5 * nz(g.i, t * 3), stc: '#ff8a5c', col: '#1a1a1a' }))],
]);

C('Mechanical', 'メカニカル（機械的）', [
['Algorithm Loop', '文字が計算で並べ替えられるように、マス目単位でカクカクと上下左右にずれては戻るのをくり返す', LP((g, t) => { const f = Math.floor(t * 8), on = f < 6; return { x: on ? Math.round((hash(g.i * 3 + f) - 0.5) * 3) * 12 : 0, y: on ? Math.round((hash(g.i * 7 + f) - 0.5) * 3) * 12 : 0 }; })],
['Algorithm', 'マス目単位でばらばらにずれた文字が、カクカクと段階的に移動して正しい位置に揃う', CI((q, g) => { const k = Math.round((1 - q) * 4) / 4; return { x: Math.round((g.r - 0.5) * 6) * 14 * k, y: Math.round((g.r2 - 0.5) * 5) * 14 * k }; }, { soft: 3, e: 'lin', o: 0, d: 0.55 })],
['Automation', '組立ラインのロボットのように、文字が1文字ずつ上からカクッ、カクッと段階的に降ろされて置かれる', I({ y: -90 }, { soft: 0.25, e: 'step', of: 1 })],
['Bad Reception', '電波の悪いテレビのように、文字が横にずれてぶれ、ちらつきながら不安定に表示される', LP((g, t, s) => { const band = hash(Math.floor(s * 12) + g.li) > 0.6 ? 1 : 0; return { x: band * 14 * (hash(Math.floor(s * 12) * 1.7) - 0.5) + 1.5 * nz(g.i, t * 10), sk: band * 20 * (hash(Math.floor(s * 12)) - 0.5), a: 0.6 + 0.4 * hash(Math.floor(s * 20) + 3) }; })],
['Doppler', '文字が右から猛スピードで、大きく横に流れた状態で通過するように迫り、縮みながら減速して止まる', I({ x: 300, s: 1.6, bx: 50 }, { soft: 0.8, e: 'exp', of: 1 })],
['Electro Magnet', 'ばらばらに散った文字が、電磁石に吸い寄せられるように加速して一気に定位置へくっつき、小さく震える', CI((q, g) => { const k = 1 - q; return { x: (g.r - 0.5) * 300 * k + 2 * S(q * 6) * (q > 0.9 ? 1 : 0), y: (g.r2 - 0.5) * 180 * k }; }, { soft: 1, e: 'in', o: 0, ord: 'r' })],
['Helicopter', '各文字がヘリコプターのローターのように縦軸まわりに高速回転しながら、ふわっと浮き上がって降りる', LP((g, t) => ({ ry: 360 * 6 * t, y: -22 * Math.sin(Math.PI * t) + 3 * S(t * 3 + g.u) }))],
['Insert Text', '字間がぐっと開いたところへ、文字が1文字ずつ上から差し込まれ、すき間が閉じて詰まる', I({ y: -34, tr: 16 }, { soft: 0.3, e: 'out', of: 1 })],
['Kinematic', '文字が関節でつながった鎖のように、先頭の動きに後ろの文字が遅れてついていき、波打って揺れる', LP((g, t) => ({ y: 14 * S(t * 2 - g.u * 0.9), r: 24 * Cs(t * 2 - g.u * 0.9) }))],
['Mechanical', '各文字が歯車のように、90度ずつカチッ、カチッと段階的に回転して正しい向きになる', I({ r: -360 }, { soft: 0.5, e: 'step', o: 0 })],
['Pistons', '文字が1文字おきに、エンジンのピストンのように交互に上下運動をくり返す', LP((g, t) => ({ y: 13 * S(t * 3 + (g.i % 2) * 0.5) }))],
['Rack & Pinion', '文字が歯車（ピニオン）のように転がり回転しながら、左から横へまっすぐ送られてきて並ぶ', I({ x: -200, r: -720 }, { soft: 0.6, e: 'lin', of: 1 })],
['Roadtrip', '文字が右から走ってきて、でこぼこ道を走る車のように上下に小さく弾みながら定位置で止まる', CI((q, g) => { const k = 1 - q; return { x: 300 * k, y: -8 * Math.abs(Math.sin(k * 26 + g.i)) * (k > 0.02 ? 1 : 0), r: 4 * Math.sin(k * 26) }; }, { soft: 0.7, e: 'out', o: 0 })],
['Scale Bounce', '文字が1文字ずつ、点から拡大してボールのように数回弾んで正しい大きさで止まる', I({ s: -1 }, { soft: 0.4, e: 'bounce', of: 1 })],
['Screen Roll', '古いテレビの垂直同期ずれのように、文字列が縦に流れて上へ消え、下からまた巻き上がってくる', LP((g, t) => { const k = EZ.in(cl(t / 0.45)) * 3, y = fr(k + 0.5) - 0.5; return { y: -y * 180 * (t < 0.45 ? 1 : 0) }; })],
['Stairstep', '文字が階段状に1段ずつずれて並んだ状態から、カクカクと段を降りて一直線に揃う', CI((q, g) => ({ y: Math.round((g.u - 0.5) * 8 * (1 - q)) * 13 }), { soft: 3, e: 'lin', o: 0, d: 0.55 })],
['Submarine', '文字列が潜水艦のように、水面下へゆっくり沈んで見えなくなり、また浮上して波に揺れる', LP((g, t) => { const d = (1 - Cs(t)) / 2; return { y: 70 * d * d + 4 * S(t * 3 + g.u * 0.6), a: 1 - 0.9 * sst(0.4, 0.9, d) }; }, { T: 6 })],
['Underscore', '点滅する下線カーソル「_」が先頭を進み、その後ろに1文字ずつ打ち込まれていく', I({}, { soft: 0, e: 'lin', d: 0.6, cur: '_' })],
['Warp 9.8', 'ワープ航法のように、文字が横に極端に引き伸ばされた光の筋となって遠くから飛び込み、急停止して文字に戻る', I({ x: 330, sx: 9, bx: 40 }, { soft: 0.5, e: 'exp', of: 1 })],
]);

C('Lights and Optical', 'ライトと光学', [
['Blue Flash', '文字が1文字ずつ、青白い閃光を放ちながら現れて、光が収まり普通の白に落ち着く', CI((q) => { const k = 1 - q; return { gl: 22 * k, glc: '#6fb1ff', col: k > 0.05 ? hs(212, 100 - 35 * q, 100) : null, s: 0.25 * k }; }, { soft: 0.4, of: 1 })],
['Broadway', '劇場の看板の電球のように、文字が1文字おきに交互に明るく点灯・消灯をくり返す', LP((g, t) => { const on = (Math.floor(t * 8) + g.i) % 2 === 0; return { col: on ? '#ffd76a' : '#5b4a22', gl: on ? 10 : 0, glc: '#ffb300' }; })],
['Bubble Pulse', '文字が泡のように、左から順にぷくっとふくらんで光り、しぼむ波が流れる', LP((g, t) => { const k = wv(g.u, t, 0.3, 0.7); return { s: 0.4 * k, gl: 12 * k, glc: '#9fe8ff' }; })],
['Emerge', '暗闇の奥から、ぼんやりぼけた文字がゆっくり浮かび上がってきてはっきりする', I({ b: 9, s: -0.15 }, { soft: 1.5, d: 0.7, e: 'io' })],
['Exposure', '露出オーバーで真っ白に飛んだ強い光の状態から、光が引いて文字の形が見えてくる', CI((q) => { const k = 1 - q; return { gl: 40 * k, glc: '#fff', b: 4 * k, a: 1 }; }, { u: 'a', soft: 1, d: 0.6 })],
['Flash', '文字全体が一瞬、カメラのフラッシュのように強く光ってぱっと現れる', CI((q) => { const k = 1 - q; return { gl: 30 * k, glc: '#fff', s: 0.06 * k }; }, { u: 'a', soft: 1, e: 'exp', of: 1, d: 0.3 })],
['Flicker Exposure', '文字全体の明るさが、不規則にちかちかと明滅する', LP((g, t, s) => { const k = hash(Math.floor(s * 12)); return { a: 0.35 + 0.65 * k, gl: 14 * (k > 0.7 ? 1 : 0), glc: '#fff' }; })],
['Fluctuate', '文字の明るさが波のように、左から右へなめらかに強くなったり弱くなったりする', LP((g, t) => { const k = (1 + S(t * 2 - g.u)) / 2; return { a: 0.3 + 0.7 * k, gl: 8 * k, glc: '#fff' }; })],
['Fluorescent Light', '蛍光灯をつけたときのように、数回ちらちらっと点滅してから安定して点灯する', LP((g, t) => { const on = t > 0.4 || (t > 0.05 && fr(t * 17) < 0.35) || (t > 0.3 && fr(t * 40) < 0.6); return { a: on ? 1 : 0.06, gl: on ? 6 : 0, glc: '#dff6ff' }; })],
['Office Light', '薄暗い文字の上を、明るい照明の帯が左から右へゆっくり通り過ぎ、通過中の文字だけ明るく照らされる', LP((g, t) => { const k = wv(g.u, t, 0.45, 0.6); return { a: 0.3 + 0.7 * k, gl: 6 * k, glc: '#fff7d6' }; })],
['Overlay', '文字の上に色つきの光の重なりが左から右へ滑っていき、重なった部分だけ色が変わる', LP((g, t) => { const k = wv(g.u, t, 0.4, 0.6); return { col: k > 0.02 ? `hsl(190,${Math.round(90 * k)}%,${Math.round(92 - 30 * k)}%)` : null }; })],
['Pulse Exposure', '文字全体の輝きが、一定のリズムで脈を打つように強まっては弱まる', LP((g, t) => { const k = Math.pow((1 - Cs(t * 3)) / 2, 2); return { gl: 26 * k, glc: '#fff', a: 0.75 + 0.25 * k }; })],
['Shadows', '光源が文字のまわりを回るように、文字の落とす影が円を描いて向きを変え続ける', LP((g, t) => ({ sh: { x: 9 * Cs(t), y: 6 * S(t) + 3, b: 3, c: 'rgba(0,0,0,.9)' } }), { bgf: (ctx) => { ctx.fillStyle = '#5a554c'; ctx.fillRect(0, 0, W, H); } })],
['Silhouettes', '明るい光の帯を背にして、文字が黒い影絵（シルエット）として浮かび、背後の光がゆっくり明滅する', LP(() => ({ col: '#0b0b0b' }), { bgf: (ctx, t) => { const g = ctx.createLinearGradient(0, CY - 50, 0, CY + 50); const a = 0.7 + 0.3 * Cs(t); g.addColorStop(0, 'rgba(255,214,150,0)'); g.addColorStop(0.5, `rgba(255,214,150,${a})`); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, CY - 50, W, 100); } })],
['Sonar Ping', '中央からソナーの輪が広がり、輪が通過した瞬間の文字だけがぴかっと光って、また暗く戻る', LP((g, t) => { const d = Math.abs(g.gx) / 150, k = Math.exp(-Math.pow((d - fr(t * 2) * 1.3) / 0.14, 2)); return { a: 0.3 + 0.7 * k, gl: 12 * k, glc: '#7dffb0', col: k > 0.3 ? '#c9ffe0' : null }; }, { bgf: (ctx, t) => { const p = fr(t * 2); ctx.strokeStyle = `rgba(125,255,176,${0.5 * (1 - p)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, CY, p * 195, 0, TAU); ctx.stroke(); } })],
['Spin Flash', '各文字が縦軸まわりに回転し、真横を向く瞬間にきらっと光を放つ', LP((g, t) => { const a = 360 * EZ.io(wq(g.u, t, 0.4, 0.6)), k = Math.pow(Math.abs(Math.sin(a * D2R)), 6); return { ry: a, gl: 24 * k, glc: '#fff' }; })],
['Word Flash', '単語がひとつずつ、ぱっと光りながら順番に現れる', CI((q) => { const k = 1 - q; return { gl: 26 * k, glc: '#fff', s: 0.12 * k }; }, { u: 'w', soft: 0.2, e: 'exp', of: 1 })],
]);

C('Multi-Line', '複数行', [
['Alphabet Soup', '複数行の文字が、スープの中のアルファベットのようにばらばらに漂って回り、ゆっくり集まって文章になる', I({ x: 150, y: 80, r: 300 }, { L: 3, rn: 'x y r', soft: 3, e: 'io', d: 0.65, ch: 0 })],
['Contract - Expand', '各行の字間がぎゅっと縮んでは広がる動きを、行ごとに少しずれたタイミングでくり返す', LP((g, t) => ({ tr: 5 * S(t - g.li * 0.15) - 1 }), { L: 3 })],
['Currents', '行ごとに左右逆向きの水流に流されるように、1行おきに反対方向へゆらゆら横に揺れる', LP((g, t) => ({ x: 26 * S(t + g.li * 0.5), y: 3 * S(t * 2 + g.u) }), { L: 3 })],
['Data Packet', '文字が数文字ずつのかたまり（パケット）単位で、でたらめな文字から一気に確定して届く', CI((q, g, v) => ({ ch: v > 0.5 ? 1 : 0, a: v > 0.98 ? 0 : 1, col: v > 0.5 ? '#7ad7ff' : null }), { L: 3, soft: 0.25, e: 'lin', an: [] , seed: 2, ord: 'f', u: 'w' })],
['Data Stream', '各行が右から流れ込みながら、文字が高速で入れ替わるデータの流れとして現れ、止まると正しい文字になる', I({ x: 260, ch: 1 }, { L: 3, soft: 0.9, e: 'out' })],
['Dealer', 'ディーラーがカードを配るように、行が1行ずつ右下から回転しながら滑ってきて置かれる', I({ x: 240, y: 110, r: 50 }, { u: 'l', L: 3, soft: 0.4, of: 1 })],
['Encryption', '表示された文章が1行ずつ暗号のようなでたらめな文字に変わり、また1行ずつ解読されて元に戻る', LP((g, t) => { const a = sst(0, 0.1, t * 1.6 - g.li * 0.12), b = sst(0, 0.1, (t - 0.5) * 1.6 - g.li * 0.12); return a > 0.5 && b < 0.5 ? { ch: 1, col: '#8dffb1' } : {}; }, { L: 3 })],
['Fly In By Characters', '複数行の文字が1文字ずつ、ばらばらの方向・奥行きから飛んできて並ぶ', I({ x: 240, y: 130, z: 300 }, { L: 3, rn: 'x y z', soft: 0.8 })],
['Fly In By Words', '複数行の単語がひとつずつ、ばらばらの方向・奥行きから飛んできて並ぶ', I({ x: 260, y: 130, z: 300 }, { u: 'w', L: 3, rn: 'x y z', soft: 0.7 })],
['Front - Back', '行が1行おきに、手前（大きい状態）からと奥（小さい状態）から交互に近づいて揃う', CI((q, g) => ({ z: (g.li % 2 ? -1200 : 330) * (1 - q) }), { u: 'l', L: 3, soft: 0.6 })],
['Frontside - Backside', '各行が横軸まわりに回転して、裏返った鏡文字（裏面）から表面へくるっとひっくり返る', I({ rx: 180 }, { u: 'l', L: 3, soft: 0.5, o: 0, e: 'io' })],
['Ideas', '単語がひらめきのように、ランダムな順にぱっと光って大きく弾けながら現れる', CI((q) => { const k = 1 - q; return { s: -k, gl: 20 * Math.sin(Math.PI * cl(q)), glc: '#ffe27a' }; }, { u: 'w', L: 3, ord: 'r', soft: 0.3, e: 'back', of: 1 })],
['Incoming', '行が1行ずつ、はるか奥からこちらへ向かって迫ってきて定位置に収まる', I({ z: -2400 }, { u: 'l', L: 3, soft: 0.5, e: 'exp' })],
['Jetstream 2', '各行が1行おきに左右逆方向から、横に流れた残像を引く高速で吹き込んできて止まる', I({ x: 340, bx: 70 }, { u: 'l', L: 3, alt: 1, soft: 0.5, e: 'exp', of: 1 })],
['Jetstream', '各行が右から、ジェット気流のように横に流れた残像を引く高速で吹き込んできて止まる', I({ x: 340, bx: 70 }, { u: 'l', L: 3, soft: 0.5, e: 'exp', of: 1 })],
['Multi-Line Flip', '行が1行ずつ、横軸まわりにパタンと回転してめくれるように現れる', I({ rx: 90 }, { u: 'l', L: 3, soft: 0.4, e: 'back', of: 1 })],
['Outgoing - Incoming', '表示されていた行が左へ出ていき、入れ替わるように右から同じ行が入ってくる', LP((g, t) => { const d = t - g.li * 0.06, o = EZ.in(cl((d - 0.1) / 0.3)), i = EZ.out(cl((d - 0.5) / 0.3)); return d < 0.45 ? { x: -340 * o } : { x: 340 * (1 - i) }; }, { L: 3 })],
['Pneumatic', '行が1行ずつ、空気圧シリンダーで押し出されるように横からシュッと突き出て、勢いで少し行きすぎて戻る', I({ x: -200, sx: -0.6 }, { u: 'l', L: 3, alt: 1, soft: 0.4, e: 'back', of: 1 })],
['Production', '映画の制作クレジットのように、行が下から順に上へ流れて上がってきて定位置で止まる', I({ y: 130 }, { u: 'l', L: 3, soft: 0.8, e: 'out', o: 0, d: 0.6 })],
['Stack Right Left', '行が1行ずつ、右からと左から交互に滑り込んで積み重なる', I({ x: 340 }, { u: 'l', L: 3, alt: 1, soft: 0.3, e: 'out', o: 0 })],
['Weekdays', '曜日の名前が、月曜から日曜まで順番に同じ場所で切り替わって表示される', TX((t) => DAYS[Math.floor(t * 7) % 7], { T: 5.6 })],
['Word Processor', 'ワープロで文章を打つように、複数行の文字が1文字ずつ打ち込まれ、縦棒カーソルが先頭で点滅する', I({}, { L: 3, soft: 0, e: 'lin', d: 0.7, cur: '|' })],
['Zippy', '行が1行ずつ左右交互から、ジッパーを閉じるように素早く飛び込んできて、弾性で震えて止まる', I({ x: 340 }, { u: 'l', L: 3, alt: 1, soft: 0.3, e: 'el', o: 0 })],
]);

C('Paths', 'パス（道すじ）', [
['360 Loop', '文字列が左から進み、途中でジェットコースターのように縦に1回転の宙返りループを通って右へ抜ける', PA(loopPath, 'through')],
['Antelope', '文字列が、カモシカが跳ねるような大きな山なりの連続ジャンプの軌道をたどって左から右へ進む', PA(u => [-2.4 + 4.8 * u, 0.6 - 1.1 * Math.abs(Math.sin(u * Math.PI * 3))], 'through')],
['Ants', '小さな文字の列が、アリの行列のようにゆるく蛇行する道を一列で歩いていく', PA(u => [-2.4 + 4.8 * u, 0.15 * Math.sin(u * TAU * 5) + 0.3 * Math.sin(u * TAU * 1.2)], 'through', { fs: 13, T: 6 })],
['Back Stage', '文字列が舞台袖（左上の奥）から下りの曲線で回り込んで登場し、舞台中央で止まる', PA(cr([[-2.7, -0.9], [-1.7, -0.6], [-0.9, 0.15], [0, 0.22], [0.9, 0.15], [1.7, -0.6], [2.7, -0.9]]), 'on')],
['Balance', '文字列がシーソーの板に乗ったように、中央を支点に左右へゆっくり傾き続ける', PA((u, t) => { const a = 0.32 * S(t); return [(u - 0.5) * 3.2 * Math.cos(a), (u - 0.5) * 3.2 * Math.sin(a) + 0.1]; }, 'still', { fs: 22 })],
['Balloon Man', '文字列が風船売りの風船のひものように、左右にゆらゆら蛇行しながら下から上へ昇っていく', PA(u => [0.5 * Math.sin(u * TAU * 1.5), 1.5 - 3 * u], 'through')],
['Balloon', '文字列が丸い風船のふちに沿って並び、風船ごとふわふわ上下しながら円周を回り続ける', PA((u, t) => circ(0.72, 0.25, -0.05 + 0.1 * S(t * 2))(u), 'loop', { fs: 15, T: 6 })],
['Bouncing', '文字列が、弾むボールのようにだんだん低くなるバウンドの軌道をたどって左から右へ進む', PA(u => [-2.4 + 4.8 * u, 0.75 - 1.5 * Math.abs(Math.sin(u * Math.PI * 4)) * (1 - u * 0.8)], 'through')],
['Bubble Pop', '文字列が泡のふちに沿って回り、泡がふくらみ続けて最後にぱちんと弾けて消える', PA((u, t) => circ(0.25 + 0.65 * EZ.out(cl(t / 0.85)))(u), 'loop', { fs: 14, af: t => 1 - sst(0.84, 0.88, t) })],
['Bump And Slide On', '文字列が左から滑ってきて、途中のこぶ（出っ張り）を乗り越え、そのまま滑って中央で止まる', PA(u => [-2.6 + 5.2 * u, 0.3 - 0.7 * Math.exp(-Math.pow((u - 0.22) * 11, 2))], 'on')],
['Centipede', '小さな文字の列が、ムカデのように体を細かく波打たせながら左から右へ這っていく', PA((u, t) => [-2.4 + 4.8 * u, 0.13 * Math.sin(TAU * (u * 9 - t * 3)) + 0.1], 'through', { fs: 14, T: 5 })],
['Circuit Board', '文字列が電子基板の配線のように、直角に折れ曲がる道すじをたどって進む', PA(poly([[-2.5, 0.6], [-1.2, 0.6], [-1.2, -0.5], [0, -0.5], [0, 0.3], [1.1, 0.3], [1.1, -0.6], [2.5, -0.6]]), 'through', { fs: 15 })],
['Conveyor Belt', '文字列がベルトコンベアに乗って、長円形（陸上トラック型）の輪を回り続ける（下側では逆さになる）', PA(stadium, 'loop', { fs: 15 })],
['Double Spiral', '文字列が渦の外側から中心へ巻き込まれ、そのまま反対向きの渦をほどくように外へ出ていくS字の二重らせんをたどる', PA(u => { const r = (2 * u - 1) * 0.98, a = TAU * 2.2 * Math.abs(2 * u - 1); return [1.5 * r * Math.cos(a), r * Math.sin(a)]; }, 'through', { fs: 13, T: 6 })],
['Down And Out', '文字列が左上から下へカーブして降りてきて、底で向きを変えて右へまっすぐ出ていく', PA(cr([[-2.7, -0.95], [-1.3, -0.75], [-0.6, 0.15], [0.1, 0.6], [1.3, 0.55], [2.7, 0.55]]), 'through')],
['Downhill Slide Off', '中央に止まっていた文字列が、右下がりの坂をだんだん加速しながら滑り落ちて出ていく', PA(ln(-2.7, -0.75, 2.7, 0.75), 'off', { fs: 20 })],
['Downhill Slide On', '文字列が左上から右下がりの坂を滑り降りてきて、中央で止まる', PA(ln(-2.7, -0.75, 2.7, 0.75), 'on', { fs: 20 })],
['Frenzy', '文字列が、興奮して走り回るようなめちゃくちゃに曲がりくねった軌道を猛スピードで駆け抜ける', PA(u => [-2.4 + 4.8 * u + 0.25 * Math.sin(u * TAU * 7), 0.65 * Math.sin(u * TAU * 4.5) * Math.cos(u * TAU * 1.5)], 'through', { T: 2.6, fs: 15 })],
['Hurdles', '文字列が平らな道を進みながら、等間隔に並んだハードルを1つずつぴょんと跳び越えていく', PA(u => [-2.4 + 4.8 * u, 0.45 - 0.6 * Math.pow(Math.max(0, Math.sin(u * TAU * 4)), 3)], 'through')],
['Karate Chop', 'まっすぐ並んだ文字列の真ん中が、空手チョップを受けたように急にがくんとV字に折れ、震えてから戻る', PA((u, t) => { const k = EZ.el(cl((t - 0.3) / 0.35)) * (1 - sst(0.82, 0.95, t)); return [(u - 0.5) * 3.4, -0.15 + k * 0.75 * (1 - Math.abs(u - 0.5) * 2)]; }, 'still', { fs: 22 })],
['Loop On And Off', '文字列が宙返りループのある道を通って入ってきて、いったん止まり、また先へ出ていく', PA(loopPath, 'onoff', { T: 5 })],
['Lyrical', '文字列が歌の旋律のように、ゆったりした大きな波の曲線をたどってなめらかに流れていく', PA(u => [-2.4 + 4.8 * u, 0.5 * Math.sin(u * TAU * 1.25)], 'through', { T: 6 })],
['Organism', '文字列がアメーバのような閉じた輪に沿って回り、輪そのものが生き物のようにぐにゃぐにゃ形を変え続ける', PA((u, t) => { const a = TAU * u - Math.PI / 2, r = 0.66 + 0.12 * Math.sin(3 * a + TAU * t) + 0.07 * Math.sin(5 * a - TAU * 2 * t); return [1.35 * r * Math.cos(a), r * Math.sin(a)]; }, 'loop', { fs: 14, T: 6 })],
['Paper Clip', '文字列が、ゼムクリップの針金のように内側へ内側へと折り返す長円のうず巻きをたどって進む', PA(cr([[-2.6, 0.85], [-0.6, 0.85], [0.9, 0.85], [1.55, 0.15], [0.9, -0.65], [-0.9, -0.65], [-1.45, -0.1], [-0.9, 0.45], [0.5, 0.45], [0.95, 0.08], [0.5, -0.28], [-0.6, -0.28]]), 'through', { fs: 13, T: 6 })],
['Pipes', '文字列が配管の中を流れるように、角が丸い直角カーブをいくつも曲がりながら進む', PA(rpoly([[-2.6, -0.6], [-1.3, -0.6], [-1.3, 0.55], [0.1, 0.55], [0.1, -0.35], [1.3, -0.35], [1.3, 0.65], [2.6, 0.65]], 0.3), 'through', { fs: 15 })],
['Raquetball', '文字列が、壁に当たって跳ね返るラケットボールのように、上下の壁の間を鋭く折れ返しながら進む', PA(poly([[-2.5, 0.2], [-1.5, -0.85], [-0.6, 0.85], [0.3, -0.85], [1.2, 0.85], [2.5, -0.35]]), 'through', { fs: 15 })],
['Rat Nest', '文字列が、ネズミの巣のように何重にも絡まり交差する輪の上をぐるぐる回り続ける', PA(u => [1.55 * Math.sin(TAU * 2 * u + 0.5), 0.82 * Math.sin(TAU * 3 * u)], 'loop', { fs: 13, T: 8 })],
['Reel To Reel', '文字列がオープンリールのテープのように、2つの輪を8の字に行き来して回り続ける', PA(u => [1.35 * Math.sin(TAU * u), 0.72 * Math.sin(TAU * 2 * u)], 'loop', { fs: 14, T: 6 })],
['Rope Bridge', '文字列が、たるんだ吊り橋の上を渡るように下へたわんだ道を進み、橋そのものも上下に揺れる', PA((u, t) => [-2.4 + 4.8 * u, -0.45 + (0.9 + 0.14 * S(t * 3)) * 4 * u * (1 - u)], 'through', { T: 5 })],
['Serpent', '文字列がヘビのように、体をS字にうねらせる波を後ろへ送りながら前へ進んでいく', PA((u, t) => [-2.4 + 4.8 * u, 0.4 * Math.sin(TAU * (u * 2.5 - t * 2))], 'through', { T: 5 })],
['Slippery Slope', '中央に止まっていた文字列が、S字に曲がった滑りやすい坂をずるずると加速しながら滑り落ちていく', PA(cr([[-2.7, -0.9], [-1.2, -0.75], [-0.3, -0.25], [0.3, 0.3], [1.2, 0.75], [2.7, 0.9]]), 'off', { fs: 18 })],
['Spiral Long', '文字列が、何周も巻いた長い渦巻きを外側から中心へ向かってぐるぐる巻き込まれていく', PA(spir(4, 1.05, 0.08), 'through', { fs: 13, T: 8 })],
['Spiral', '文字列が渦巻きを外側から中心へ向かって、2周ほど回りながら巻き込まれていく', PA(spir(2, 1, 0.12), 'through', { fs: 15, T: 5 })],
['Springy', '文字列が、引き伸ばしたばね（コイル）の形のくるくるした輪を連続で回りながら右へ進む', PA(u => [-2.6 + 5.2 * u + 0.32 * Math.sin(TAU * 6 * u), 0.15 - 0.42 * Math.cos(TAU * 6 * u)], 'through', { fs: 13, T: 7 })],
['Squirmy', '文字列がその場で、ミミズのように体全体をくねくねと不規則にうねらせ続ける', PA((u, t) => [(u - 0.5) * 3.4, 0.3 * nz(1, t + u * 0.8) + 0.15 * S(u * 2 - t * 2)], 'still', { fs: 22 })],
['Stairwell', '文字列が階段を1段ずつ、カクカクと折れ曲がりながら左上から右下へ降りていく', PA(stairs, 'through', { fs: 14, T: 5 })],
['Symmetry', '文字列が左右対称のアーチ（虹の形）の上を、左端から右端へ、右端から左端へと行ったり来たりする', PA(u => [(u - 0.5) * 3.7, 0.6 - 1.2 * Math.sin(Math.PI * u)], 'pp', { fs: 16, T: 5 })],
['Tchotchke', '文字列が、三つ葉の飾り模様のような小さな輪の上を回り続ける', PA(u => { const a = TAU * u, r = 0.55 + 0.3 * Math.cos(3 * a); return [1.25 * r * Math.cos(a), r * Math.sin(a)]; }, 'loop', { fs: 13, T: 6 })],
['Walk Of Stars', '文字列が星形（五芒星）の輪郭に沿って、角を曲がりながら回り続ける', PA(starPath, 'loop', { fs: 13, T: 7 })],
['Zig-Zag', '文字列がジグザグの折れ線に沿って、上下に鋭く折れ返しながら左から右へ進む', PA(poly([[-2.5, 0.55], [-1.65, -0.55], [-0.8, 0.55], [0, -0.55], [0.8, 0.55], [1.65, -0.55], [2.5, 0.55]]), 'through', { fs: 15 })],
]);

C('Organic', 'オーガニック（生き物・自然）', [
['Autumn', '文字がランダムな順に、落ち葉のように左右へ揺れて回転しながら下へ舞い落ちて消える', CO((q, g) => { const k = 1 - q; return { y: 170 * k, x: Math.sin(k * 9 + g.r * 6) * 28 * k, r: (g.r - 0.5) * 400 * k }; }, { ord: 'r', soft: 0.9, d: 0.6 })],
['Boiling', '文字が沸騰する泡のように、ばらばらのタイミングで細かく跳ね上がり、ふくらんでは戻る', LP((g, t) => ({ y: -7 * Math.abs(nz(g.i, t * 3)), s: 0.18 * nz(g.i + 40, t * 4), r: 5 * nz(g.i + 80, t * 3) }))],
['Boomerang', '文字が左から順に、ブーメランのように右へ弧を描いて飛び出し、回転しながら元の位置へ戻ってくる', LP((g, t) => { const q = EZ.io(wq(g.u, t, 0.45, 0.5)), a = q * TAU; return { x: 55 * (1 - Math.cos(a)), y: -40 * Math.sin(a), r: 360 * q }; })],
['Bounce Diagonal', '文字が左上から斜めに飛び込み、弾みながら順に定位置へ着地する', I({ x: -120, y: -130 }, { e: 'bounce', soft: 0.6, of: 1 })],
['Chewing Gum', '文字列全体がガムのように横へびよーんと伸びて縦につぶれ、また元に戻る動きをくり返す', LP((g, t) => { const k = Math.pow((1 - Cs(t)) / 2, 2); return { tr: 9 * k, sx: 0.5 * k, sy: -0.35 * k }; })],
['Climber', '文字が下から1文字ずつ、左右に小さく揺れながら段々とよじ登るように上がってくる', CI((q) => { const k = 1 - q; return { y: Math.round(k * 5) / 5 * 150, x: 6 * Math.sin(k * 30) }; }, { soft: 0.6, e: 'lin', of: 1 })],
['Dip-Bounce', '文字が左から順に、いったん下へ沈み込み、その反動で上へ大きく跳ねてから戻る波が流れる', LP((g, t) => { const q = wq(g.u, t, 0.4, 0.6); return { y: 16 * Math.sin(q * TAU) * (q < 0.5 ? 1 : 1.7) }; })],
['Double-Helix', '奇数番目と偶数番目の文字が逆のタイミングで上下し、DNAの二重らせんのように交差しながら奥行きで大きさも変わる', LP((g, t) => { const a = t + g.u * 1.2 + (g.i % 2) * 0.5; return { y: 16 * S(a), s: 0.22 * Cs(a), a: 0.7 + 0.3 * Cs(a) }; })],
['Drop Bounce', '文字が上から1文字ずつ落ちてきて、床で数回弾んで止まる', I({ y: -160 }, { e: 'bounce', soft: 0.5, o: 0 })],
['Fish Bait', '文字が釣り糸の先のエサのように、上を支点にぶらぶら揺れながら小さく上下する', LP((g, t) => ({ r: 14 * S(t * 2 + g.u * 0.8), y: 5 * S(t * 3 + g.r), ay: -0.45 }))],
['Flutter', '文字が蝶の羽ばたきのように、縦軸まわりに細かくはためきながら小さく浮き沈みする波が流れる', LP((g, t) => ({ ry: 70 * S(t * 4 - g.u * 1.5), y: -6 * Math.abs(S(t * 2 - g.u * 0.75)) }))],
['Flying Formation', '文字が渡り鳥の編隊のように、中央が先頭・両端が後ろに下がった山形の隊列で左から飛んできて、最後に横一列へ整列する', CI((q, g) => { const k = 1 - q, d = Math.abs(g.u - 0.5); return { x: -(250 + d * 200) * k, y: -d * 120 * k + 4 * Math.sin(k * 20 + g.i) }; }, { soft: 3, e: 'io', o: 0, d: 0.6 })],
['Horsefly', 'ランダムな文字が1つずつ、アブが飛び回るように素早く不規則に動き回っては元へ戻る', LP((g, t) => { const k = wv(g.r, t, 0.22, 1); return { x: 26 * k * nz(g.i, t * 6), y: 22 * k * nz(g.i + 9, t * 7), r: 25 * k * nz(g.i + 5, t * 5) }; })],
['Hummingbird', '文字がハチドリのように、細かく高速で震えながら浮かび、ときどき横へすっと動いて戻る', LP((g, t) => ({ y: 2.2 * S(t * 24 + g.r) + 4 * S(t + g.u * 0.3), x: 10 * wv(g.r2, t, 0.15, 1) * (g.r > 0.5 ? 1 : -1) }))],
['Insect Wipe', '文字が左から順に、虫が逃げ出すように小刻みに震えながらばらばらの方向へ走り去る', CO((q, g) => { const k = 1 - q, a = g.r * TAU; return { x: Math.cos(a) * 200 * k + 6 * S(k * 9 + g.r), y: Math.sin(a) * 130 * k + 6 * S(k * 11), r: (g.r2 - 0.5) * 200 * k }; }, { soft: 0.6 })],
['Insects', '文字が虫のように、それぞれ勝手な方向へちょこちょこ這い回っては向きを変え続ける', LP((g, t) => ({ x: 9 * nz(g.i, t * 2), y: 7 * nz(g.i + 20, t * 2), r: 28 * nz(g.i + 40, t * 3) }))],
['Labrador', '文字が犬のしっぽのように左右へ素早く振れ、うれしそうに小さくぴょんぴょん跳ねる', LP((g, t) => ({ r: 16 * S(t * 6 + g.u * 0.6), y: -8 * Math.abs(S(t * 3 + g.u * 0.3)), ay: 0.38 }))],
['Leapfrog', '文字が左から順に、馬跳びのように大きな山なりでぴょんと跳ねる波が流れる', LP((g, t) => { const k = wv(g.u, t, 0.3, 0.65); return { y: -34 * k, sy: 0.15 * k, r: -12 * k * Math.cos(wq(g.u, t, 0.3, 0.65) * Math.PI) }; })],
['Loose Line', '文字列がゆるんだロープのようにたわみ、そのたるみが横へゆっくり流れていく', LP((g, t) => { const a = g.u * 1.1 - t; return { y: 13 * S(a) + 6 * S(a * 2 + 0.2), r: 22 * Cs(a) }; })],
['Ocean Tide', '文字が潮の満ち引きのように、ゆっくり大きな波で上下しながら、左右に寄せては返す', LP((g, t) => ({ y: 12 * S(t - g.u * 0.7), x: 10 * S(t + 0.25), a: 0.75 + 0.25 * Cs(t - g.u * 0.7) }), { T: 6 })],
['Quiver', '文字全体が細かく素早く、小刻みにぶるぶる震え続ける', LP((g, t) => ({ x: 1.8 * nz(g.i, t * 12), y: 1.8 * nz(g.i + 7, t * 13), r: 3 * nz(g.i + 3, t * 11) }))],
['Ripple', '水面の波紋のように、大きくなって戻る波が左から右へ文字を伝わっていく', LP((g, t) => { const k = wv(g.u, t, 0.3, 0.7); return { s: 0.45 * k, y: -5 * k }; }, { T: 3 })],
['Rubber Floor', '文字が左から順に跳ね上がっては落ち、ゴムの床に着地した瞬間だけ縦につぶれて横に広がる', LP((g, t) => { const q = wq(g.u, t, 0.5, 0.5); if (q >= 1) return { ay: 0.38 }; const y = -50 * Math.abs(Math.sin(q * TAU)) * (1 - q * 0.6), sq = Math.max(0, 1 - Math.abs(y) / 12); return { y, sy: -0.4 * sq, sx: 0.3 * sq, ay: 0.38 }; })],
['Rubber', '文字列がゴムのように横へ引き伸ばされ、ぱちんと離されて弾性で震えながら元の幅に戻る', LP((g, t) => { const k = t < 0.35 ? EZ.in(t / 0.35) : 1 - EZ.el(cl((t - 0.35) / 0.5)); return { tr: 10 * k, sx: 0.6 * k }; })],
['Sea-Sick', '文字列全体が船酔いしそうなほど、ゆっくり左右に傾きながら大きく上下に揺れ続ける', LP((g, t) => { const a = 10 * S(t), p = rot(g, a); return { x: p.x, y: p.y + 10 * S(t * 2 + 0.1), r: a }; }, { T: 5 })],
['Shuffle', 'ばらばらの位置に散らばった文字が、互いに行き交いながら正しい順番の位置へ落ち着く', I({ x: 150, y: 14 }, { rn: 'x y', soft: 4, e: 'io', o: 0, d: 0.55 })],
['Simmer', '文字がとろ火で煮えるように、ゆっくり小さく不規則に浮き沈みし、わずかにふくらむ', LP((g, t) => ({ y: -3.5 * Math.abs(nz(g.i, t * 2)), s: 0.07 * nz(g.i + 40, t * 2) }))],
['Slice And Dice', '文字が1文字おきに上下へ切り離されてずれ、斜めに傾いてから、元どおりに噛み合う', LP((g, t) => { const k = sst(0.1, 0.3, t) * (1 - sst(0.6, 0.85, t)), d = g.i % 2 ? 1 : -1; return { y: 16 * k * d, x: 8 * k * d, sk: 18 * k * d }; })],
['Sprouts', '文字が芽を出すように、足元から上へにょきっと伸びて順に生える（少し伸びすぎて戻る）', I({ sy: -1 }, { soft: 0.5, e: 'back', of: 1, ay: 0.38 })],
['Tag Team', '奇数番目の文字は上から、偶数番目の文字は下から、交互にタッチ交代するように入ってくる', I({ y: -140 }, { alt: 1, soft: 0.5, e: 'back', o: 0 })],
['Wheatfield', '文字が麦畑の穂のように、足元を支点にして風の波で順に傾いて揺れる', LP((g, t) => ({ sk: -16 * S(t - g.u * 0.8) - 6, ay: 0.38 }))],
['Wind Current', '風が左から右へ通り抜け、文字が順に吹き上げられて傾き、ふわりと元へ戻る', LP((g, t) => { const k = wv(g.u, t, 0.4, 0.6); return { x: 22 * k, y: -16 * k, r: 28 * k, sk: -12 * k }; })],
['Wobble', '文字がそれぞれ、起き上がりこぼしのように足元を支点に左右へぐらぐら揺れ続ける', LP((g, t) => ({ r: 13 * S(t * 2 + g.u * 0.9), ay: 0.38 }))],
]);

C('Scale', 'スケール（拡大縮小）', [
['Large Scale', '画面からはみ出すほど巨大な文字が、1文字ずつ縮みながら定位置に収まる', I({ s: 7 }, { soft: 0.6 })],
["Let's Dance", '文字がリズムに合わせて、1文字おきに交互に大きくなったり小さくなったりしながら弾んで踊る', LP((g, t) => ({ s: 0.32 * S(t * 4) * (g.i % 2 ? 1 : -1), y: -4 * Math.abs(S(t * 4)) }))],
['Scale Down Word', '単語ごとに、大きな状態から縮んで定位置の大きさになる', I({ s: 2.5 }, { u: 'w', soft: 0.4 })],
['Scale Down', '1文字ずつ、大きな状態から縮んで定位置の大きさになる', I({ s: 2.5 }, { soft: 0.5 })],
['Scale Up Word', '単語ごとに、点のような小ささから拡大して現れる', I({ s: -1 }, { u: 'w', soft: 0.4, o: 0 })],
['Scale Up', '1文字ずつ、点のような小ささから拡大して現れる', I({ s: -1 }, { soft: 0.5, o: 0 })],
['Wiggly Scale Wipe', '左から右へ波が通過するのに合わせて、通過中の文字の大きさだけが不規則に揺れ、過ぎると落ち着く', LP((g, t) => { const k = wv(g.u, t, 0.35, 0.6); return { s: 0.7 * k * nz(g.i, t * 5) }; })],
['Zoom Away', '文字が1文字ずつ、遠くへ吸い込まれるように小さくなって消える', O({ s: -1 }, { soft: 0.5 })],
['Zoom Forward', '文字が1文字ずつ、こちらへ迫るように巨大化しながら消える', O({ s: 8 }, { soft: 0.5 })],
]);

C('Rotation', '回転', [
['Drip Down', '文字が1文字ずつ、しずくのようにぐらっと横倒しに傾いて下へ垂れ落ちる', O({ r: 90, y: 160 }, { soft: 0.5 })],
['Flip Up', '文字が足元を軸に、寝た状態から上へパタンと起き上がって順に現れる', I({ rx: -90 }, { soft: 0.5, ay: 0.38, of: 1 })],
['Full Rotation', '文字が左から順に、その場でくるっと1回転する波が流れる', LP((g, t) => ({ r: 360 * EZ.io(wq(g.u, t, 0.35, 0.65)) }))],
['Loopy Loop', '文字が左から順に、小さな輪を描いて宙返りしながら1回転して戻る', LP((g, t) => { const q = EZ.io(wq(g.u, t, 0.4, 0.6)), a = q * TAU; return { x: 18 * Math.sin(a), y: -18 * (1 - Math.cos(a)), r: 360 * q }; })],
['Random Rotation', '文字がそれぞれランダムな角度に傾いた状態から、同時に回って正しい向きに揃う', I({ r: 200 }, { rn: 'r', soft: 3, e: 'io', o: 0, d: 0.55 })],
['Rotate Chars', '1文字ずつ、半回転（180度）しながらフェードインして正しい向きになる', I({ r: -180 }, { soft: 0.5 })],
['Rotate Per Word', '単語ごとに、半回転しながらフェードインして正しい向きになる', I({ r: -180 }, { u: 'w', soft: 0.5 })],
['Spin In', '文字列全体が中心を軸に1回転しながら、点から拡大して現れる', CI((q, g) => { const k = 1 - q; return Object.assign(spn(g, -360 * k, q), { r: -360 * k, s: -k }); }, { u: 'a', soft: 1, d: 0.55 })],
['Swirly Rotation', '文字が中心のまわりを渦のように巻きながら、外側の文字ほど遅れて回り込んで定位置へ入る', CI((q, g) => { const k = 1 - q; return Object.assign(rot(g, -200 * k), { r: -200 * k }); }, { ord: 'c', soft: 1.2 })],
['Whirlwind', '文字が旋風に巻き上げられ、高速回転しながら左右に渦を描いて上へ飛び去る', CO((q, g) => { const k = 1 - q; return { x: Math.sin(k * TAU * 2 + g.u * 4) * 70 * k, y: -170 * k * k, r: 900 * k, s: -0.5 * k }; }, { soft: 0.8 })],
]);

C('Tracking', 'トラッキング（字間）', [
['Contract', '大きく広がっていた字間が、すっと縮まって通常の間隔になりながら現れる', I({ tr: 11, o: -0.7 }, { u: 'a', soft: 1 })],
['Decrease Tracking', '字間がゆっくり詰まっていき、文字どうしが重なるほど近づく', LP((g, t) => ({ tr: -9 * EZ.io(cl(t / 0.8)) * (1 - sst(0.92, 1, t)) }))],
['Extend', '字間がだんだん広がり、文字が左右へ離れながら薄れて消える', O({ tr: 14 }, { u: 'a', soft: 1, eo: 'io' })],
['Increase Tracking', '字間がゆっくり一定の速さで広がっていく', LP((g, t) => ({ tr: 9 * cl(t / 0.85) * (1 - sst(0.92, 1, t)) }))],
['Magnify', '虫めがねが左から右へ通過するように、通った場所の文字だけ拡大され、そのぶん字間も押し広げられる', LP((g, t) => { const d = (g.u - (t * 1.6 - 0.3)) / 0.16, k = Math.exp(-d * d); return { s: 0.9 * k, tr: 14 * k }; })],
['Spasm', '字間がけいれんするように、不規則なタイミングで急にぱっと開いたり詰まったりする', LP((g, t, s) => ({ tr: 9 * (hash(Math.floor(s * 7)) - 0.4) * (hash(Math.floor(s * 7) + 9) > 0.45 ? 1 : 0) }))],
['Stretchy', '字間がゴムのようにぐーっと広がっては、弾みをつけて震えながら元に戻る動きをくり返す', LP((g, t) => { const k = t < 0.4 ? EZ.io(t / 0.4) : 1 - EZ.el(cl((t - 0.4) / 0.5)); return { tr: 13 * k }; })],
]);

C('Blurs', 'ブラー（ぼかし）', [
['Blur By Word', '単語ごとに、強くぼけた状態からピントが合って現れる', I({ b: 12 }, { u: 'w', soft: 0.4 })],
['Bullet Train', '文字が右から新幹線のような高速で、横に流れる残像を引いて滑り込み、ぴたっと止まる', I({ x: 320, bx: 60, sx: 0.6 }, { soft: 0.5, e: 'exp', of: 1 })],
['Evaporate', '文字がランダムな順に、ぼけて膨らみながら上へ蒸発するように消える', O({ y: -45, b: 10, s: 0.5 }, { ord: 'r', soft: 0.8 })],
['Foggy', '霧が流れるように、文字がぼけて薄れたり、はっきりしたりしながら、ゆっくり見え隠れする', LP((g, t) => { const k = (1 + S(t - g.u * 0.6)) / 2; return { b: 7 * k, a: 1 - 0.55 * k }; }, { T: 5 })],
['Jiggy', '文字がぶれながら細かく跳ね、ぼけ具合と大きさが小刻みに揺れ続ける', LP((g, t) => ({ b: 2.5 * Math.abs(nz(g.i, t * 6)), y: 4 * nz(g.i + 5, t * 8), s: 0.12 * nz(g.i + 9, t * 6) }))],
['Transporter', 'SFの転送装置のように、縦に伸びた水色の光の筋がちらつきながらランダムな順に実体化して文字になる', CI((q, g, v) => { const k = 1 - q; return { sy: 5 * k, b: 5 * k, col: k > 0.05 ? hs(190, 60 + 30 * q) : null, a: (1 - v * 0.7) * (k > 0.05 ? 0.6 + 0.4 * S(k * 14 + g.r) : 1) }; }, { ord: 'r', soft: 0.8 })],
]);

C('Miscellaneous', 'その他', [
['Angle Fly-In', '文字が右上から斜めの角度で、傾いたまま飛び込んできて、向きを直しながら並ぶ', I({ x: 200, y: -140, r: 45 }, { soft: 0.6 })],
['Back Flip', '文字が左から順に、その場で小さく跳び上がって後方宙返り（バク転）をして着地する', LP((g, t) => { const q = wq(g.u, t, 0.35, 0.65); return { rx: 360 * EZ.io(q), y: -22 * Math.sin(Math.PI * q) }; })],
['Blow Away', '文字がランダムな順に、強い風に吹き飛ばされるように回転しながら右上へ飛んでいって消える', CO((q, g) => { const k = 1 - q; return { x: 300 * k * (0.6 + g.r), y: -130 * k * k * (0.3 + g.r2), r: 400 * k * (g.r3 + 0.2) }; }, { ord: 'r', soft: 0.7 })],
['Bounce In', '文字が右から、ぽんぽんと弾むボールのような山なりの軌道で跳ねながら入ってきて止まる', CI((q, g) => { const k = 1 - q; return { x: 220 * k, y: -60 * Math.abs(Math.sin(k * Math.PI * 3)) * k }; }, { soft: 0.6, e: 'lin', of: 1 })],
['Bungee', '文字が上から勢いよく落ちてきて、バンジージャンプのゴムのように定位置を行きすぎては引き戻され、震えて止まる', I({ y: -170 }, { soft: 0.5, e: 'el', of: 1, d: 0.6 })],
['Chaotic', '位置・回転・大きさがめちゃくちゃに暴れている文字が、だんだん静まって正しい位置に落ち着く', CI((q, g) => { const k = 1 - q; return { x: 90 * k * nz(g.i, k * 3), y: 60 * k * nz(g.i + 9, k * 3), r: 260 * k * nz(g.i + 5, k * 2), s: 0.8 * k * nz(g.i + 3, k * 3) }; }, { soft: 4, e: 'lin', d: 0.7, o: 0 })],
['Clay Pigeons', '文字が1文字ずつ、クレー射撃の的のように斜め上へ打ち上げられ、空中でぱっと砕けるように弾けて消える', CO((q) => { const k = 1 - q; return { x: 150 * k, y: -260 * k + 180 * k * k, r: 300 * k, s: k > 0.8 ? (k - 0.8) * 8 : 0 }; }, { soft: 0.5, eo: 'lin' })],
['Dot.Com', '文字が1文字ずつ、小さな点からポンと弾けて現れる（少し大きくなりすぎて戻る）', I({ s: -0.92 }, { soft: 0.25, e: 'back', o: 0 })],
['Elbow Room', '文字が左から順に大きくなって、ひじで隣を押しのけるように周りの字間を押し広げ、また元に戻る', LP((g, t) => { const k = wv(g.u, t, 0.25, 0.75); return { s: 0.55 * k, tr: 13 * k }; })],
['Explosion', '文字が中央から爆発したように、回転しながら四方八方へ吹き飛んで消える', CO((q, g) => { const k = 1 - q, a = Math.atan2(g.gy + (g.r - 0.5) * 60, g.gx + (g.r2 - 0.5) * 40); return { x: Math.cos(a) * 260 * k, y: Math.sin(a) * 200 * k - 30 * k, r: (g.r3 - 0.5) * 900 * k, s: 0.6 * k }; }, { soft: 4, eo: 'out', d: 0.35 })],
['Hop, Skip, And A Jump', '文字が左から、小さい・中くらい・大きい、の三段跳びのように3回跳ねながら入ってきて着地する', CI((q) => { const k = 1 - q, ph = q * 3, n = Math.min(2, Math.floor(ph)); return { x: -150 * k, y: -[14, 30, 55][n] * Math.sin(Math.PI * cl(ph - n)) }; }, { soft: 0.5, e: 'lin', of: 1 })],
['Pendulum', '文字列全体が上の支点から吊られた振り子のように大きく左右に揺れ、だんだん揺れが小さくなって止まる', LP((g, t) => { const a = 28 * Math.exp(-t * 4) * Cs(t * 4), p = spn({ gx: g.gx, gy: g.gy + 110 }, a, 1); return { x: p.x, y: p.y, r: a }; }, { af: t => sst(0, 0.04, t) * (1 - sst(0.94, 1, t)) })],
['Punching Bag', '文字が左から順に、パンチを受けたサンドバッグのように上を支点にがくんと振れて、揺れながら戻る', LP((g, t) => { const x = fr(t - g.u * 0.5), k = x < 0.6 ? Math.exp(-x * 7) * Math.sin(x * TAU * 4) : 0; return { r: 40 * k, ay: -0.5 }; })],
['Question', '文字が左から順に、いったん「?」マークに変わってから、正しい文字に戻る', LP((g, t) => (wv(g.u, t, 0.3, 0.6) > 0 ? { ch: '?', col: '#ffd76a' } : {}))],
['Rattle', '文字が左から順に、がたがたと左右に小刻みに激しく揺れてから静まる', LP((g, t) => { const k = wv(g.u, t, 0.3, 0.65); return { r: 14 * k * S(t * 30 + g.i), x: 1.5 * k * S(t * 34) }; })],
['Roll Bounce', '文字が左から、ごろごろ転がりながら小さく弾んで入ってきて止まる', CI((q) => { const k = 1 - q; return { x: -200 * k, r: -540 * k, y: -22 * Math.abs(Math.sin(k * Math.PI * 4)) * k }; }, { soft: 0.6, e: 'out', of: 1 })],
['Sequential Jump', '文字が左から1文字ずつ順番に、その場でぴょんと真上に跳ねる', LP((g, t) => ({ y: -24 * wv(g.u, t, 0.2, 0.75) }), { T: 3 })],
['Six-Shooter', '文字が6連発の拳銃のように、数文字ずつバン、バンと連射のテンポで、反動で一瞬大きくなりながら撃ち出されて現れる', CI((q, g, v) => ({ s: 0.7 * (1 - q), a: v > 0.97 ? 0 : 1 }), { soft: 0.1, e: 'exp', u: 'w', L: 2, an: [] })],
['Slide Bounce', '文字が右から滑り込んできて、定位置で左右に弾むように震えて止まる', I({ x: 260 }, { soft: 0.5, e: 'el', of: 1, d: 0.6 })],
['Slip In Out', '文字が左から斜めに傾いて滑り込み、少し止まってから、そのまま右へ滑り出ていく', Object.assign(I({ x: -300, sk: 30 }, { soft: 0.4, o: 0 }), { m: 'io', out: { p: { x: 300, sk: 30 }, eo: 'in' } })],
['Smokey', '文字が煙のように、ぼけて膨らみながら左右にゆらゆら揺れて上へ立ちのぼり、消えていく', CO((q, g) => { const k = 1 - q; return { y: -90 * k, x: 16 * Math.sin(k * 7 + g.i) * k, b: 11 * k, s: 0.9 * k }; }, { soft: 1.2, d: 0.6, eo: 'out' })],
['Squeeze', '文字列が左右からぎゅっと押しつぶされて細く詰まり、ぱっと放されて元の幅に戻る動きをくり返す', LP((g, t) => { const k = t < 0.45 ? EZ.io(t / 0.45) : 1 - EZ.el(cl((t - 0.45) / 0.4)); return { tr: -9 * k, sx: -0.45 * k, sy: 0.2 * k }; })],
['Superhero', '文字がカメラの手前から巨大な状態で1文字ずつ叩きつけられるように飛び込み、着地の衝撃で画面が揺れる', CI((q, g, v) => ({ s: 6 * (1 - q), y: v > 0 && v < 0.12 ? 3 * S(v * 40) : 0 }), { soft: 0.3, e: 'in', of: 1 })],
['Swing Up', '文字が1文字ずつ、左下を支点に下から振り上げられるように回って起き上がる（少し行きすぎて戻る）', I({ r: 90, y: 30 }, { soft: 0.5, e: 'back', of: 1, ay: 0.38 })],
['Twisty Ribbons', '文字がねじれたリボンのように、縦軸まわりの回転と上下の波を左から右へ送り続ける', LP((g, t) => ({ ry: 180 * S(t - g.u * 0.8), y: 10 * S(t * 2 - g.u * 1.6) }))],
['Vanishing Point', '文字が画面中央の消失点へ向かって、小さくなりながら吸い込まれるように集まって消える', O({ c: 1, s: -1 }, { soft: 0.8, eo: 'in' })],
['Wiggly Lines', '複数の行が、行ごとにばらばらのタイミングで左右にゆらゆら不規則に揺れ続ける', LP((g, t) => ({ x: 22 * nz(g.li * 13, t * 2), r: 0 }), { L: 3 })],
['Yo-Yo', '文字が左から順に、ヨーヨーのように回転しながら下へ降りて、また巻き上がって戻る', LP((g, t) => { const k = wv(g.u, t, 0.4, 0.6); return { y: 38 * k, r: 360 * EZ.io(wq(g.u, t, 0.4, 0.6)) }; })],
]);

C('Number Counters', '数字カウンター', [
['Counter Countdown Monospaced', '等幅の数字が、10から0へ1ずつカウントダウンしていく', TX((t) => String(Math.max(0, 10 - Math.floor(t * 11.5))), { mono: 1, fs: 52, T: 5.5 })],
['Currency Counter Monospaced', '等幅の数字で、通貨記号と桁区切りつきの金額が0から目標額まで一気にカウントアップする', TX((t) => '$' + (12500 * EZ.out(cl(t / 0.8))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), { mono: 1, fs: 34 })],
['Percentage Counter Monospaced', '等幅の数字で、パーセント表示が0%から100%までカウントアップする', TX((t) => Math.round(100 * EZ.io(cl(t / 0.8))) + '%', { mono: 1, fs: 48 })],
['Timer Countdown Monospaced', '等幅の数字で、分:秒:コマのタイマーが残り時間ゼロへ向かってカウントダウンする', TX((t) => { const f = Math.max(0, Math.round(300 * (1 - cl(t / 0.92)))); return `${pad(Math.floor(f / 1800))}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`; }, { mono: 1, fs: 40, T: 10 })],
]);

/* 公式ページの数と突き合わせ（ずれたらコンソールに出す） */
const OFFICIAL_COUNTS = [30, 29, 12, 21, 12, 8, 14, 19, 17, 23, 40, 33, 9, 10, 7, 6, 28, 4];
const PRESETS = [];
CATS.forEach((cat, ci) => {
  cat.start = PRESETS.length + 1;
  cat.list.forEach(([name, ja, cfg]) => PRESETS.push({ n: PRESETS.length + 1, id: 'AE-' + pad(PRESETS.length + 1, 3), name, ja, cat: cat.name, catJa: cat.ja, ci, cfg }));
  cat.end = PRESETS.length;
  if (cat.list.length !== OFFICIAL_COUNTS[ci]) console.error('数が合わない:', cat.name, cat.list.length, '公式', OFFICIAL_COUNTS[ci]);
});
