// POST /api/zuzu/stt — Whisper STT via Cloudflare Workers AI
// multipart/form-data: { audio: Blob, lang: 'ar'|'en', session_id?: string }
// Rate-limited 20/min/IP.

import { ok, fail } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'
import { rateLimit, getClientIp } from '../../_lib/rateLimit'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.AI) {
    return fail('Workers AI binding not configured', 503, 'AI_UNAVAILABLE')
  }

  const ip = getClientIp(request)
  const rl = await rateLimit(env, `${ip}:zuzu_stt`, { max: 20, windowSec: 60 })
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: 'rate_limited', retry_after: rl.retryAfter }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) },
      },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail('expected multipart/form-data', 400, 'BAD_FORM')
  }

  const audio = form.get('audio')
  const lang = (form.get('lang') as string) || 'ar'
  if (!(audio instanceof File || audio instanceof Blob)) {
    return fail('audio file required', 400, 'NO_AUDIO')
  }

  const bytes = new Uint8Array(await (audio as Blob).arrayBuffer())
  if (bytes.byteLength > 8_000_000) {
    return fail('audio too large (max 8MB)', 413, 'TOO_LARGE')
  }
  if (bytes.byteLength < 1000) {
    // <1KB → likely silence / accidental tap
    return ok({ text: '', lang, note: 'audio_too_short' })
  }

  try {
    const result = (await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
      audio: [...bytes],
      task: 'transcribe',
      language: lang === 'ar' ? 'ar' : 'en',
    } as never)) as { text?: string }
    const text = (result.text ?? '').trim()
    return ok({ text, lang })
  } catch (e) {
    return fail(`whisper: ${(e as Error).message}`, 502, 'STT_ERROR')
  }
}
