'use strict';
/* 3冊目：声の演技を指示するオーディオタグ。
   各行 [タグ, 日本語の呼び名, 効果（日本語）, 効果（英語）, 例文（このまま音声にした台本）, 出どころ]
   出どころ: v4=Eleven v4 の公式ブログ・ドキュメント / v3=Eleven v3 の公式ドキュメント / suno=Suno で使われている歌用のタグ / pub=公開されている使用例
   タグの名前は出どころの表記のまま。例文と解説はこの見本帳のために書いた。 */
const VO = { playing: null, src: {
  v4: ['Eleven v4 公式', 'Eleven v4 official'],
  v3: ['Eleven v3 公式ドキュメント', 'Eleven v3 official docs'],
  suno: ['Suno で使われる歌用タグ', 'Suno singing tag'],
  pub: ['公開されている使用例', 'Publicly shared example'],
} };
(() => {
  const L = [];
  const C = (name, ja, list) => L.push({ name, ja, list });

  C('Emotions', '感情', [
  ['[excited]', '興奮・わくわく', '声が弾んで高くなり、勢いよく前のめりに話す。', 'Bright, lifted pitch and forward energy.', 'やった！ついに完成したよ！', 'v4'],
  ['[playful]', 'いたずらっぽく', '楽しんでいるような、軽くからかう調子になる。', 'Light, teasing and amused.', 'ねえねえ、当ててみて。どっちの手でしょう？', 'v4'],
  ['[amazed]', '驚嘆', '息をのむような、感心しきった言い方になる。', 'Breathless wonder.', 'うそ…こんな景色、初めて見た。', 'v4'],
  ['[powerful]', '力強く', '腹から出した、揺るがない宣言の声になる。', 'Grounded, commanding conviction.', '私たちは、必ずやり遂げる。', 'v4'],
  ['[proud]', '誇らしげ', '胸を張った、うれしさのにじむ言い方になる。', 'Chest-out pride.', '見てよ、これ全部ひとりで作ったんだ。', 'v4'],
  ['[optimistic]', '前向き', '明るく、相手を安心させる調子になる。', 'Bright and reassuring.', '大丈夫、きっとうまくいくよ。', 'v4'],
  ['[startled]', 'びっくり', '不意を突かれて、声が跳ね上がる。', 'A sudden jump in the voice.', 'わっ！びっくりした、いつからそこに？', 'v4'],
  ['[mad]', '怒り', '強く、とがった怒りの声になる。', 'Sharp, raised anger.', '何回言ったらわかるの！', 'v4'],
  ['[aggressive]', '攻撃的', '低く押しつけるような、けんか腰の声になる。', 'Low, confrontational pressure.', 'どいて。今すぐそこをどいて。', 'v4'],
  ['[bitter]', '恨みがましく', '苦々しく、吐き捨てるような言い方になる。', 'Sour and resentful.', 'どうせ最初から、期待なんてしてなかったよ。', 'v4'],
  ['[critical]', '批判的', '冷静に、厳しく評価する言い方になる。', 'Cool, judging disapproval.', '悪いけど、この出来では通せないね。', 'v4'],
  ['[repelled]', '嫌悪・拒否', '思わず身を引くような、いやそうな声になる。', 'Recoiling in disgust.', 'うわ…なにこの匂い、無理。', 'v4'],
  ['[anxious]', '不安', '落ち着かず、少し早口で上ずる。', 'Uneasy, slightly rushed and high.', 'どうしよう、間に合わないかもしれない。', 'v4'],
  ['[stressed]', '追い詰められて', '余裕がなく、張り詰めた声になる。', 'Tight and overloaded.', 'やることが多すぎて、もう頭が回らない。', 'v4'],
  ['[scared]', 'おびえ', '小さく震える、こわがっている声になる。', 'Small, trembling fear.', 'ねえ…今、誰かいなかった？', 'v4'],
  ['[threatened]', '身の危険', '相手を警戒して、こわばった声になる。', 'Defensive and on guard.', '来ないで。それ以上近づかないで。', 'v4'],
  ['[vulnerable]', '弱さを見せる', '守りを解いた、か細く正直な言い方になる。', 'Exposed, fragile honesty.', '本当は、ずっと怖かったんだ。', 'v4'],
  ['[confused]', '戸惑い', '理解が追いつかず、語尾が上がる。', 'Lost, with rising question tones.', 'え、待って。どういうこと？', 'v4'],
  ['[busy]', '忙しそうに', '他のことをしながら話す、せわしない調子になる。', 'Distracted and hurried.', 'ごめん今ちょっと手が離せない、あとで！', 'v4'],
  ['[tired]', '疲れ', '力が抜けて、ゆっくり重い声になる。', 'Heavy, slow and drained.', 'はあ…今日はもう、何もしたくない。', 'v4'],
  ['[bored]', '退屈', '抑揚がなく、興味のなさそうな声になる。', 'Flat and uninterested.', 'ふーん。で、それがどうしたの。', 'v4'],
  ['[distant]', 'うわの空', '心ここにあらずの、遠い言い方になる。', 'Detached, mind elsewhere.', 'ああ…うん。聞いてるよ。', 'v4'],
  ['[despair]', '絶望', '力なく沈んだ、打ちのめされた声になる。', 'Hollow, crushed hopelessness.', 'もう終わりだ。全部、なくなった。', 'v4'],
  ['[let down]', 'がっかり', '期待が外れた、しょんぼりした言い方になる。', 'Quiet disappointment.', 'そっか…来てくれると思ってたのに。', 'v4'],
  ['[peaceful]', '穏やか', 'ゆったり静かで、落ち着いた声になる。', 'Slow, calm and settled.', '静かだね。波の音しか聞こえない。', 'v4'],
  ['[content]', '満ち足りて', '静かに満足している、やわらかい声になる。', 'Soft, quiet satisfaction.', 'うん、これでいい。十分しあわせだよ。', 'v4'],
  ['[curious]', '興味しんしん', '知りたくてたまらない、少し身を乗り出した調子になる。', 'Leaning in, eager to know.', 'ねえ、この箱の中、何が入ってるの？', 'v4'],
  ['[thoughtful]', '考えながら', '言葉を選びながら、ゆっくり話す。', 'Measured, choosing words.', 'そうだな…もう少し考えさせて。', 'v4'],
  ['[trusting]', '信頼', '相手にゆだねる、あたたかく静かな言い方になる。', 'Warm, open reliance.', 'あなたに任せる。信じてるから。', 'v4'],
  ]);

  C('Acting Direction', '演技の方向づけ', [
  ['[sarcastic]', '皮肉', 'ほめ言葉を、わざとらしく冷めた調子で言う。', 'Praise delivered with a dry, mocking edge.', 'へえ、それはすごいね。さすがだ。', 'v3'],
  ['[mischievously]', 'たくらみ顔で', '何かをたくらんでいる、にやりとした声になる。', 'Scheming, with a grin in the voice.', 'いいこと思いついちゃった。', 'v3'],
  ['[annoyed]', 'いら立ち', 'うんざりして、少しとげのある言い方になる。', 'Irritated and short.', 'だから、さっきも言ったよね。', 'v3'],
  ['[impressed]', '感心', '見直した、という調子になる。', 'Pleasantly surprised approval.', 'へえ、やるじゃない。', 'v3'],
  ['[dramatically]', '芝居がかって', '大げさに、舞台のせりふのように言う。', 'Theatrical, larger than life.', 'ついに、運命の時が来た。', 'v3'],
  ['[warmly]', 'あたたかく', '包みこむような、やさしい声になる。', 'Gentle, embracing warmth.', 'おかえり。寒かったでしょう。', 'v3'],
  ['[delighted]', '大喜び', 'ぱっと明るく、うれしさがあふれる。', 'Bursting with happy surprise.', 'まあ、来てくれたの！うれしい！', 'v3'],
  ['[appalled]', 'あきれ果てて', '信じられない、という強い非難の調子になる。', 'Shocked disapproval.', '信じられない。そんなことをしたの？', 'v3'],
  ['[casual]', '気軽に', '力の抜けた、ふだんの話し言葉になる。', 'Relaxed, everyday delivery.', '仕事探してるの？ちょうどいいのがあるよ。', 'v4'],
  ['[nervous]', '緊張', '言葉につまりながら、おずおず話す。', 'Hesitant and unsure.', 'あの、えっと、初めてなんですけど。', 'v4'],
  ['[smug]', '得意げ', '勝ち誇った、少し鼻につく言い方になる。', 'Self-satisfied and superior.', '簡単だよ。誰でも知ってる。', 'v4'],
  ['[triumphant]', '勝利の叫び', '勝った瞬間の、突き抜けた喜びの声になる。', 'Victorious, punching the air.', 'やった！勝ったぞ！', 'v4'],
  ['[hopeful]', '期待をこめて', '祈るような、明るい願いの調子になる。', 'Wishing, with a lift.', '今度こそ、受かってるといいな。', 'v4'],
  ['[disgusted]', 'うんざり・不快', '顔をしかめたような、いやそうな声になる。', 'Grimacing distaste.', 'うえ、それ食べるの？', 'v4'],
  ['[puzzled]', '首をかしげて', '腑に落ちない、不思議そうな言い方になる。', 'Trying to work it out.', 'あれ、なんで首を振ってるの？', 'v4'],
  ['[intrigued]', '興味をそそられて', 'おもしろいものを見つけた、低めの関心の声になる。', 'Low, drawn-in interest.', 'ほう…それは面白い。', 'v4'],
  ['[frazzled]', 'てんてこまい', '慌てふためいて、余裕のない早口になる。', 'Frantic and scattered.', 'あと十秒しかない、早く決めて！', 'v4'],
  ]);

  C('Volume & Delivery', '声量と話し方', [
  ['[whispers]', 'ささやく', '声をひそめた、息まじりのささやきになる。', 'A breathy whisper.', '動かないで。すぐ後ろにいる。', 'v4'],
  ['[shouts]', '叫ぶ', '遠くまで届かせる大声になる。', 'A loud, projected shout.', 'みんな逃げて、今すぐ！', 'v4'],
  ['[softly]', 'やさしく小さく', '小さめの、やわらかい声になる。', 'Low volume, gentle tone.', 'よく頑張ったね。もう大丈夫。', 'v4'],
  ['[quietly]', '静かに', '周りに聞かれないよう、音量を落として話す。', 'Volume down, careful.', 'たぶん、もう行ったと思う。', 'v4'],
  ['[low, threatening]', '低く、おどすように', '低く抑えた、すごみのある声になる。', 'Low and menacing.', 'ここへ来るべきじゃなかったね。', 'v4'],
  ['[hushed]', '息をひそめて', '場の静けさを壊さない、抑えた実況の声になる。', 'Held-back, respectful quiet.', '最後の一打。会場が静まり返っています。', 'v4'],
  ['[barely audible]', '聞こえるか聞こえないか', 'ほとんど息だけの、かすかな声になる。', 'Almost only breath.', 'いま…構えました。', 'v4'],
  ['[booming]', '轟くように', '会場に響きわたる、張り上げた声になる。', 'A big, resonant roar.', '入ったー！優勝です！', 'v4'],
  ['[disbelief]', '信じられない', '目の前のことが信じられない、という呆然とした調子になる。', 'Stunned, can’t-believe-it tone.', '二十年見てきて、こんなのは初めてだ。', 'v4'],
  ['[muttering]', 'ぶつぶつ', '口の中でつぶやく、聞かせる気のない声になる。', 'Under-the-breath grumbling.', 'なんで私がこんなことを…', 'v3'],
  ]);

  C('Pacing & Pauses', '速さと間', [
  ['[slowly]', 'ゆっくり', '一語ずつ間をとって、もったいぶって話す。', 'Stretched out, word by word.', 'そして、優勝は…', 'v4'],
  ['[rushed]', '急いで', '息せき切った早口になる。', 'Fast and breathless.', 'ごめん遅れた、電車が止まって走ってきた！', 'v4'],
  ['[pause]', '間', 'タグの位置で、ひと呼吸の間が入る。', 'A beat of silence at the tag.', 'そのとき、[pause] 電話が鳴った。', 'v4'],
  ['[long pause]', '長い間', 'タグの位置で、じらすような長い間が入る。', 'A long, suspenseful silence.', '結果は…[long pause] 合格です。', 'v4'],
  ['[short pause]', '短い間', 'タグの位置で、ごく短く区切る。', 'A brief break.', 'まず一つ目。[short pause] 次に二つ目。', 'v3'],
  ['[drawn out]', '引きのばして', '母音を長く伸ばして言う。', 'Vowels stretched long.', 'えええ、うそでしょー。', 'v4'],
  ['[snappy]', 'てきぱき', '短く切って、きびきび言う。', 'Clipped and brisk.', 'それ、早くどかして。', 'v4'],
  ['[speedy]', '高速で', '勢いよく、たたみかける速さになる。', 'Rapid-fire delivery.', '三、二、一、発射！', 'v4'],
  ]);

  C('Human Reactions', '人間らしい反応（声の音）', [
  ['[laughs]', '笑う', 'せりふの前に、短い笑い声が入る。', 'A short laugh before the line.', '本当にそれ信じたの？', 'v4'],
  ['[laughs harder]', 'もっと笑う', 'こらえきれない大笑いになる。', 'Uncontrollable, bigger laughter.', 'だめ、もう無理、おなか痛い！', 'v3'],
  ['[starts laughing]', '笑い出す', '話しながら、こらえきれず笑い始める。', 'Breaking into laughter mid-line.', 'ちょっと待って、今のなに？', 'v3'],
  ['[chuckles]', 'くすっと笑う', '小さく、のどの奥で笑う。', 'A small, low chuckle.', 'まあ、君らしいね。', 'v3'],
  ['[giggling]', 'くすくす笑う', '高く細かい笑いがまじる。', 'High, bubbly giggles.', 'ねえ見て、あの犬、変な顔してる。', 'v3'],
  ['[wheezing]', '笑いすぎて息切れ', '笑いすぎて息が続かない、ぜいぜいした声になる。', 'Out of breath from laughing.', 'はあ、はあ、笑いすぎて息ができない。', 'v3'],
  ['[snorts]', '鼻で笑う', 'ふん、と鼻を鳴らす音が入る。', 'A snort through the nose.', 'ふん、そんなの簡単だよ。', 'v3'],
  ['[sighs]', 'ため息', 'せりふの前に、ため息が入る。', 'A sigh before the line.', 'わかったよ。皿洗いは私がやる。', 'v4'],
  ['[frustrated sigh]', 'いら立ちのため息', 'うんざりした、強めのため息が入る。', 'A heavy, fed-up sigh.', 'もう、何回やり直せばいいの。', 'v3'],
  ['[exhales]', '息を吐く', 'ふう、と息を吐いてから話す。', 'A release of breath.', 'ふう。やっと終わった。', 'v3'],
  ['[inhales deeply]', '深く息を吸う', '覚悟を決めるように、大きく息を吸う。', 'A deep steadying breath in.', 'よし…行こう。', 'v3'],
  ['[gasps]', '息をのむ', 'はっと息を吸いこむ音が入る。', 'A sharp intake of breath.', 'それ、本物のダイヤ？', 'v4'],
  ['[happy gasp]', 'うれしい驚き', 'うれしくて、はっと息をのむ。', 'A delighted gasp.', 'わあ、これ欲しかったやつ！', 'v3'],
  ['[gulp]', 'ごくり', '緊張して、つばを飲みこむ音が入る。', 'A nervous swallow.', 'あれは…フクロウ、だよね？', 'v4'],
  ['[clears throat]', 'せきばらい', '話し始める前に、えへんとせきばらいをする。', 'A throat-clear before speaking.', 'えー、皆さん、少しよろしいですか。', 'v4'],
  ['[crying]', '泣きながら', '涙声で、声が震えて詰まる。', 'Tearful, shaking voice.', 'もう、戻ってこないと思ってた。', 'v4'],
  ['[starts crying]', '泣き出す', '話している途中で、こらえきれず泣き始める。', 'Breaking into tears mid-line.', 'こんなに幸せそうな顔、初めて見た。', 'v4'],
  ]);

  C('Accents & Characters', 'なまりとキャラクター', [
  ['[British accent]', 'イギリスなまり', '英語をイギリス風の発音で話す（英語のせりふ向け）。', 'English spoken with a British accent.', 'Fancy a cup of tea?', 'v4'],
  ['[French accent]', 'フランスなまり', '英語をフランス語なまりで話す。', 'English with a French accent.', 'Welcome to my little café.', 'v4'],
  ['[Australian accent]', 'オーストラリアなまり', '英語をオーストラリア風の発音で話す。', 'English with an Australian accent.', "No worries, mate, we'll sort it out.", 'v4'],
  ['[Irish accent]', 'アイルランドなまり', '英語をアイルランド風の発音で話す。', 'English with an Irish accent.', "Grand day for it, isn't it?", 'v4'],
  ['[pirate voice]', '海賊の声', 'しゃがれた、海賊らしい芝居の声になる。', 'A gravelly, theatrical pirate.', 'Hoist the sails and pass the rum.', 'v4'],
  ['[Kansai dialect]', '関西弁', '日本語を関西のイントネーションで話させる試み。', 'An attempt at Kansai-dialect Japanese intonation.', 'ほんまに？それ、めっちゃええやん。', 'pub'],
  ]);

  C('Sound Effects', '効果音', [
  ['[thunder rumbling]', '雷のごろごろ', 'せりふの前に、遠い雷の音が入る。', 'Distant thunder before the line.', '[nervous] 近づいてきてる…。', 'v4'],
  ['[footsteps]', '足音', '近づいてくる足音が入る。', 'Approaching footsteps.', '[whispers] 誰かが、階段を上がってくる…。', 'v4'],
  ['[door creaking]', 'ドアのきしみ', 'ドアがぎいっと開く音が入る。', 'A door creaking open.', '[nervous] あのー…？誰か、いますか？', 'v4'],
  ['[clapping]', '拍手', '拍手の音が入る。', 'Clapping hands.', '[delighted] ありがとう、ありがとうございます！', 'v4'],
  ['[owl hooting]', 'フクロウの鳴き声', 'フクロウがほうほうと鳴く音が入る。', 'An owl hooting.', '[whispers] 今の、聞こえた？', 'v4'],
  ['[dog barking]', '犬の鳴き声', '犬がほえる音が入る。', 'A dog barking.', '[startled] わっ！…なんだ、ビスケットか。脅かさないでよ。', 'v4'],
  ['[gunshot]', '銃声', '乾いた銃声が入る。', 'A gunshot.', '[panicked] [shouts] 伏せて！', 'v3'],
  ['[explosion]', '爆発', '爆発音が入る。', 'An explosion.', '[panicked] 何、今の音は！', 'v3'],
  ]);

  C('Natural-language Tags', '文章で書くタグ', [
  ['[whispering, fearful]', 'ささやき＋おびえ', '2つの指示をカンマで並べて重ねる。こわがりながらのささやきになる。', 'Two qualities stacked with a comma: a frightened whisper.', 'しっ…声を出さないで。', 'v4'],
  ['[like a sports commentator, speeding up]', '実況のように、だんだん速く', '話し方を文章で説明する。実況の調子で加速していく。', 'Describing the manner: commentary that accelerates.', '行った行った、抜けた、ゴール！', 'v4'],
  ['[out of breath after running up the stairs]', '階段を駆け上がって息切れ', '状況を説明する。息を切らしながらのせりふになる。', 'Describing the situation: panting after a run.', 'はあ、はあ、間に合った？', 'v4'],
  ['[a tired detective who has heard it all before]', '聞き飽きた、くたびれた刑事', '人物像を説明する。うんざりした刑事の言い方になる。', 'Describing the character: a weary detective.', 'はいはい。それで、アリバイは？', 'v4'],
  ['[starting calm, then losing patience]', '最初は冷静、だんだん我慢できなくなる', '途中の変化を説明する。せりふの中で感情が移り変わる。', 'Describing the shift within one line.', '落ち着いて話そう。…だから違うって言ってるでしょ！', 'v4'],
  ['[nervous, trying to sound confident]', '緊張しているのに、自信があるふり', '1語で足りない細かい演技を、言葉を足して指定する。', 'Adding what a single word misses.', 'ま、任せてください。完璧です。', 'v4'],
  ]);

  C('Singing & Suno Tags', '歌と、Sunoの歌用タグ', [
  ['[sings]', '歌う', 'せりふを節をつけて歌おうとする。', 'Attempts to sing the line.', 'ハッピーバースデー、トゥーユー。', 'v3'],
  ['[woo]', 'ウー！（歓声）', '歓声の「ウー！」が入る。', 'A cheering “woo”.', 'やったあ、最高！', 'v3'],
  ['[humming]', '鼻歌', '鼻歌をはさむ。', 'A hummed phrase.', 'んーんーんー、いい曲だね。', 'pub'],
  ['[Whisper]', 'ウィスパー（Suno）', 'Sunoでは、ささやくような歌い方の指定。', 'In Suno: a whispered vocal.', '秘密だよ、誰にも言わないで。', 'suno'],
  ['[Spoken Word]', '語り（Suno）', 'Sunoでは、歌わずに語る部分の指定。', 'In Suno: spoken rather than sung.', 'これは、歌ではなく、語りです。', 'suno'],
  ['[Falsetto]', '裏声（Suno）', 'Sunoでは、裏声で高く歌う指定。', 'In Suno: high head voice.', '高く、高く、空まで届け。', 'suno'],
  ['[Raspy]', 'しゃがれ声（Suno）', 'Sunoでは、ざらついた声質の指定。', 'In Suno: a rough, gritty tone.', '一晩中、歌い続けたんだ。', 'suno'],
  ['[Breathy]', '息まじり（Suno）', 'Sunoでは、息を多くまぜた歌い方の指定。', 'In Suno: airy vocal.', 'そばに、いてほしい。', 'suno'],
  ['[Belted]', '張り上げる（Suno）', 'Sunoでは、力いっぱい張り上げる歌い方の指定。', 'In Suno: full-power belting.', '負けない、絶対に！', 'suno'],
  ['[Growled]', 'うなり声（Suno）', 'Sunoでは、うなるような低い発声の指定。', 'In Suno: a low growl.', 'これ以上、怒らせるな。', 'suno'],
  ['[Shouted]', 'シャウト（Suno）', 'Sunoでは、叫ぶように歌う指定。', 'In Suno: shouted vocal.', '立ち上がれ、今すぐ！', 'suno'],
  ['[Rap]', 'ラップ（Suno）', 'Sunoでは、リズムに乗せて語るラップの指定。', 'In Suno: rhythmic rap delivery.', '朝から晩まで走り続ける、止まらない。', 'suno'],
  ['[Operatic]', 'オペラ風（Suno）', 'Sunoでは、声楽のように朗々と歌う指定。', 'In Suno: classical, operatic voice.', 'ああ、わが愛しき人よ。', 'suno'],
  ['[Vibrato]', 'ビブラート（Suno）', 'Sunoでは、声を細かく揺らす指定。', 'In Suno: wavering sustained notes.', '永遠に、あなたを思う。', 'suno'],
  ['[Ad-libs]', 'アドリブ（Suno）', 'Sunoでは、合いの手や掛け声の指定。', 'In Suno: improvised interjections.', 'イェー、オーイェー、カモン！', 'suno'],
  ['[Harmonies]', 'ハーモニー（Suno）', 'Sunoでは、声を重ねるハモりの指定。', 'In Suno: layered harmony vocals.', 'ともに歌おう、この歌を。', 'suno'],
  ['[Announcer]', 'アナウンサー（Suno）', 'Sunoでは、司会や実況のような語りの指定。', 'In Suno: an announcer-style voice.', 'さあ、いよいよ決勝戦の始まりです！', 'suno'],
  ]);

  C('Widely Shared Tags', '世間でよく使われているタグ', [
  ['[yawns]', 'あくび', 'あくびの音が入る。', 'A yawn.', 'ふああ、もう寝る時間だ。', 'pub'],
  ['[coughs]', 'せき', 'せきこむ音が入る。', 'A cough.', 'ごほっ、失礼しました。', 'pub'],
  ['[sniffs]', '鼻をすする', 'くんくん、すんすんと鼻を鳴らす音が入る。', 'A sniff.', '何か、焦げてない？', 'pub'],
  ['[groans]', 'うめく', '苦しそうなうめき声が入る。', 'A pained groan.', 'うう、頭が痛い。', 'pub'],
  ['[screams]', '悲鳴', '悲鳴をあげる。', 'A scream.', 'きゃあ！出たー！', 'pub'],
  ['[stammers]', 'どもる', '言葉がつかえて、音をくり返す。', 'Stuttered, tripping speech.', 'あ、あの、その、わ、私は。', 'pub'],
  ['[sobbing]', 'すすり泣き', 'しゃくり上げながら話す。', 'Speaking through sobs.', 'ごめん、ごめんなさい。', 'pub'],
  ['[evil laugh]', '悪役の高笑い', '悪役らしい高笑いが入る。', 'A villainous laugh.', 'ふはははは、計画どおりだ。', 'pub'],
  ['[robotic voice]', 'ロボットの声', '抑揚のない、機械的な話し方になる。', 'Flat, mechanical delivery.', '命令を、確認しました。', 'pub'],
  ['[newscaster]', 'ニュースキャスター', 'ニュースを読むような、整った話し方になる。', 'A polished news-reading tone.', '次のニュースです。', 'pub'],
  ['[narrator]', 'ナレーター', '物語を語り聞かせる、落ち着いた語りになる。', 'A calm storytelling voice.', 'むかしむかし、あるところに。', 'pub'],
  ['[ASMR]', 'ASMR', '耳元でささやくような、ごく近い声になる。', 'Very close, soft ear-to-mic delivery.', 'ゆっくり、力を抜いて。', 'pub'],
  ]);

  /* ---- 見本の絵：タグと例文を見せ、再生中は波形の棒を動かす ---- */
  const wrap = (c, str, maxW) => { const out = []; let cur = ''; for (const ch of [...str]) { if (c.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; };
  const drawOf = p => (c, t, s) => {
    const on = VO.playing && VO.playing.id === p.id;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    let fs = 24; c.font = `700 ${fs}px ${MONO}`;
    const tw = c.measureText(p.name).width; if (tw > 290) { fs = fs * 290 / tw; c.font = `700 ${fs}px ${MONO}`; }
    c.fillStyle = '#ffd76a'; c.fillText(p.name, CX, 44);
    c.font = `500 12.5px ${SANS}`; c.fillStyle = '#cfcbc0';
    wrap(c, p.line.replace(/^\[[^\]]+\]\s*/, ''), 280).slice(0, 2).forEach((l, i) => c.fillText(l, CX, 80 + i * 18));
    for (let k = 0; k < 28; k++) { const h = on ? 5 + 26 * Math.abs(Math.sin(s * 7 + k * 0.9) * Math.sin(s * 3.1 + k * 0.37)) : 3 + 3 * Math.abs(Math.sin(k * 0.8)); c.fillStyle = on ? (VO.playing.v === 'm' ? '#6fb1ff' : '#ff8a5c') : '#34343e'; c.fillRect(CX - 28 * 4.5 + k * 9, 146 - h / 2, 5, h); }
  };

  let num = 0;
  L.forEach(cat => {
    const ci = CATS.length, C0 = { name: cat.name, ja: cat.ja, list: cat.list, book: 'vo', start: num + 1 };
    CATS.push(C0); CAT_EN.push(cat.name);
    cat.list.forEach(([tag, nameJa, ja, en, line, src]) => {
      num++;
      const full = /\[[^\]]+\]/.test(line) && line.includes(tag) ? line : tag + ' ' + line;
      const p = { n: PRESETS.length + 1, num, id: 'VT-' + pad(num, 3), name: tag, nameJa, ja, en, cat: cat.name, catJa: cat.ja, catEn: cat.name, ci, book: 'vo', src, line: full };
      p.cfg = { m: 'custom', lp: 1, T: 4, draw: drawOf(p) };
      PRESETS.push(p);
    });
    C0.end = num;
  });
  VO.count = num;
})();
