# Cue Book — 制作用の見本帳

言葉にしにくい「動き・声・書体」を、番号で受け渡すための見本帳です（旧名：動きの見本帳 / Motion Specimen Book）。動く見本を目で見て選び、番号でAIに頼めます。

| 巻 | 番号 | 中身 |
|---|---|---|
| 01 | `AE-001`〜`AE-322` | After Effects に最初から入っているテキストアニメーションプリセット。Adobe 公式ヘルプの一覧と同じ名前・同じ並び |
| 02 | `MG-001`〜`MG-137` | モーショングラフィックスでよく使う動き（原則、登場と退場、図形、トランジション、文字、カメラ、エフェクト、図解とUI）。動く見本と解説つき |
| 03 | `VT-001`〜`VT-130` | 音声合成で使うオーディオタグ（Eleven v4／v3 の公式タグ、Suno の歌用タグ、公開されている使用例）。タグごとの例文つき |
| 04 | `FT-0001`〜`FT-2061` | 無料で使えるフォント（Google Fonts と Fontshare）。入力した文字を、それぞれの書体で見比べられる。コピーすると、名前・太さ・読み込み用のタグ・配布ページがまとまる |

## 見本帳を開く

公開ページ：<https://kunikunini.github.io/cue-book/>

手元で開く場合は、このリポジトリを取得して、フォルダの中で次を実行します。

```bash
python3 -m http.server 4370
```

ブラウザで `http://localhost:4370/` を開きます。

- 見本の右上のチェックを入れると、右下の「選んだもの」にたまります。「選んだものをコピー」で、番号・正式名・仕様がまとまった文章になるので、そのままAIに貼れます。
- 「番号表をコピー」で、その巻の全番号の対応表をAIに渡せます。以後は「AE-150 の動きで」だけで通じます。
- 星でお気に入り、一度選んだものは履歴に残ります（そのブラウザの中に保存）。
- キー操作：`/` 検索、`1` `2` `3` `4` 巻の切り替え、Space 一時停止、拡大表示中は `←` `→` `P` `F` `C`。

## AIエージェントのスキルとして使う

このリポジトリの `skills/cue-book/` が、Claude Code などのエージェント用のスキルです。エージェントが、番号から仕様を自分で取り出せるようになります。

入れ方（どちらか）：

```bash
npx skills add kunikunini/cue-book
```

または `skills/cue-book` フォルダを、エージェントのスキル置き場（Claude Code なら `~/.claude/skills/`）へそのままコピーします。必要なのは Node.js 18 以上だけです。

頼み方の例：

- 「タイトルを AE-058 の動きで出して」
- 「一覧の登場に MG-011、場面の切り替えに MG-062 を使って」
- 「このナレーションを VT-047 みたいに読ませたい。タグを入れて」
- 「見本帳を出して。見て選びたい」（ブラウザで見本帳が開き、選んで「AIに渡す」を押すとエージェントに届きます）

スクリプトを直接使うこともできます。

```bash
node skills/cue-book/scripts/specimen.mjs search 文字 弾む
```

```bash
node skills/cue-book/scripts/specimen.mjs get AE-058 MG-011
```

コマンドの一覧は [skills/cue-book/SKILL.md](skills/cue-book/SKILL.md) にあります。

## 知っておいてほしいこと

- **AE の巻の動きは近似です。** 名前とカテゴリは Adobe 公式ヘルプの一覧（2026年9月更新）どおりですが、動きの見本と仕様は After Effects 本体のプリセットファイルから取り出したものではなく、ブラウザ上で再現したものです。After Effects で使うときは、同じ名前のプリセットをそのまま当てるのがいちばん正確です。日本語の呼び名は意味が分かるように付けた訳で、公式の訳ではありません。
- **MG の巻の見本と解説は、この見本帳のために書き起こしたものです。** 秒数や割合は目安です。
- **VT の巻のタグは、必ず効くとは限りません。** タグの表記は各出どころのもの、例文と解説はこの見本帳のために書いたものです。Suno のタグは歌を作るためのもので、読み上げで効くとは限りません。
- **FT の巻の書体は、このリポジトリに入っていません。** 一覧は Google Fonts と Fontshare の公開データから作り（`node tools/build-fonts.mjs`）、書体のファイルはカードが画面に入ったときに各配布元から読み込みます。ライセンスの正確な条件は、各書体の配布ページで確認してください。個人のサイトなどで個別に配布されているフリーフォントは、再配布や直接読み込みの条件が書体ごとに違うため入れていません。
- **声の見本は合成音声です。** 下の「声のクレジット」の2つの声を使い、ElevenLabs の Eleven v4 で生成しました。
- このリポジトリは個人の見本帳で、Adobe・ElevenLabs・Suno・Google・Fontshare とは関係ありません。After Effects は Adobe の商標です。

## 声のクレジット

オーディオタグの巻の音声（`audio/`）は、次の ElevenLabs のボイスで生成した合成音声です。

| | ElevenLabs での名前 | Voice ID | リンク |
|---|---|---|---|
| 男性の声 | Kuni - Calm Clear Japanese Explainer | `woV9Cn1YbfxXHTELnOat` | [ElevenLabs で開く](https://elevenlabs.io/app/voice-library?voiceId=woV9Cn1YbfxXHTELnOat) |
| 女性の声 | Romaco - Cheerful, Clear and Full | `KgETZ36CCLD1Cob4xpkv` | [ElevenLabs で開く](https://elevenlabs.io/app/voice-library?voiceId=KgETZ36CCLD1Cob4xpkv) |

リンクを開くには ElevenLabs へのログインが必要です。音声ファイルは見本として聴くためのもので、声そのものの利用条件は ElevenLabs の各ボイスのページに従います。

## 中身を直したとき

見本帳のデータ（`presets.js`、`mg1.js`、`mg2.js`、`vo.js` など）を直したら、スキル用の一覧を作り直します。

```bash
node tools/build-skill.mjs
```

声の見本を作り直す場合は `tools/gen.mjs` を使います（ElevenLabs のAPIキーが必要で、料金がかかります。鍵は `tools/.env` に置き、リポジトリには入れません）。

## English

Cue Book is a specimen book for content production, where everything can be referred to by number: 322 built-in After Effects text animation presets (`AE-`), 137 motion-graphics moves with live samples and notes (`MG-`), 130 audio tags for speech synthesis (`VT-`), and 2,061 free fonts from Google Fonts and Fontshare (`FT-`, loaded from their distributors, not bundled). Open the gallery, pick what you want, and copy a block of text (number, name, spec) to paste to an AI. The `skills/cue-book` folder is an agent skill: `get`, `search`, `list`, `table` and `pick` let an AI agent pull the specs by number. The AE volume reproduces the presets approximately in the browser; it is not extracted from After Effects. Not affiliated with Adobe, ElevenLabs, Suno, Google or Fontshare.

## ライセンス

[MIT](LICENSE)。著作権表示を残せば、商用も含めて自由に使えます。対象はプログラム・見本・解説文です。`audio/` の音声ファイルは対象外で、上の「声のクレジット」のとおりです。
