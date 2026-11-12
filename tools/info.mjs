// お金のかからない問い合わせだけ：使えるモデルと、名前で探した声の確認。
//   node tools/info.mjs [声の名前の一部 ...]
import { api } from './el.mjs';
const models = await (await api('/v1/models')).json();
for (const m of (Array.isArray(models) ? models : [])) if (/v4|v3/.test(m.model_id)) console.log('モデル:', m.model_id, '｜料率', JSON.stringify(m.model_rates || {}), '｜1回の最大文字', m.max_characters_request_subscribed_user);
for (const q of process.argv.slice(2)) {
  const v = await (await api('/v2/voices?page_size=20&search=' + encodeURIComponent(q))).json();
  for (const x of (v.voices || [])) console.log(`[${q}] 自分の声:`, x.name, '|', x.category, '|', x.voice_id);
  const s = await (await api('/v1/shared-voices?page_size=10&search=' + encodeURIComponent(q))).json();
  for (const x of (s.voices || [])) console.log(`[${q}] 共有ライブラリ:`, x.name, '|', x.voice_id, '|', x.language, '|', x.gender);
}
