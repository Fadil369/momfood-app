// POST /api/zuzu/tts — server-side proxy to ElevenLabs TTS
// Keeps API key secret. Returns audio/mpeg stream.
//
// Body: { text: string, voice_id?: string, model_id?: string }
// Default voice is Adam (multilingual). Override per request.

import { fail } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

const DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB' // Adam — multilingual
const DEFAULT_MODEL = 'eleven_multilingual_v2'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.ELEVENLABS_API_KEY) {
    return fail('ElevenLabs not configured', 503, 'TTS_UNAVAILABLE')
  }

  let body: { text?: string; voice_id?: string; model_id?: string }
  try {
    body = await request.json()
  } catch {
    return fail('invalid JSON body', 400, 'BAD_JSON')
  }

  const text = (body.text ?? '').trim()
  if (!text) return fail('text required', 400, 'BAD_INPUT')
  if (text.length > 2000) return fail('text too long (max 2000 chars)', 400, 'TOO_LONG')

  const voiceId = body.voice_id ?? DEFAULT_VOICE
  const modelId = body.model_id ?? DEFAULT_MODEL

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    },
  )

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '')
    return fail(`elevenlabs ${upstream.status}: ${errText.slice(0, 200)}`, 502, 'UPSTREAM_ERROR')
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
