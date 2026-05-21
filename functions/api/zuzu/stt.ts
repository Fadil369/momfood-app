// POST /api/zuzu/stt — Whisper STT via Cloudflare Workers AI
// Accepts multipart/form-data: { audio: Blob, lang: 'ar' | 'en' }
//
// Note: Requires the AI binding (Workers AI) to be added in the Pages dashboard:
//   Settings → Functions → Workers AI binding → variable name "AI"
// Until that's wired, this endpoint will return 503 gracefully.

import { ok, fail } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

interface EnvWithAI extends Env {
  AI?: {
    run: (model: string, input: unknown) => Promise<{ text?: string } & Record<string, unknown>>
  }
}

export const onRequestPost: PagesFunction<EnvWithAI> = async ({ env, request }) => {
  if (!env.AI) {
    return fail('Workers AI binding not configured (add "AI" in Pages settings)', 503, 'AI_UNAVAILABLE')
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

  try {
    // Workers AI Whisper expects an array of bytes
    const result = await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
      audio: [...bytes],
      task: 'transcribe',
      language: lang === 'ar' ? 'ar' : 'en',
    } as unknown)
    const text = (result as { text?: string }).text ?? ''
    return ok({ text, lang })
  } catch (e) {
    return fail(`whisper error: ${(e as Error).message}`, 502, 'STT_ERROR')
  }
}
