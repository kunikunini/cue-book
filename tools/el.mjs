// ElevenLabs への問い合わせ用の小さな土台。鍵は画面にもファイルにも書き出さない。
// 鍵の読み方：環境変数 ELEVENLABS_API_KEY、なければこのフォルダの .env（ELEVENLABS_API_KEY=... の1行）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
export function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const f = path.join(here, '.env');
  if (fs.existsSync(f)) { const m = fs.readFileSync(f, 'utf8').match(/^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*["']?([^"'\s#]+)/m); if (m) return m[1]; }
  throw new Error('鍵が見つからない：環境変数 ELEVENLABS_API_KEY か、tools/.env に ELEVENLABS_API_KEY=... を置く');
}
export const api = (p, opt = {}) => fetch('https://api.elevenlabs.io' + p, { ...opt, headers: { 'xi-api-key': key(), ...(opt.headers || {}) } });
