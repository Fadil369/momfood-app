// GET /api/health — liveness + binding probes (D1, R2, AI, secrets)
import { ok } from '../_lib/response'
import type { Env } from '../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const checks: Record<string, unknown> = {
    service: 'momfood-app',
    timestamp: new Date().toISOString(),
    version: '0.2.0-phase1',
  }

  // D1
  try {
    const r = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
    checks.d1 = r?.ok === 1 ? 'connected' : 'unexpected'
  } catch (e) {
    checks.d1 = `error: ${(e as Error).message}`
  }

  // R2
  if (env.UPLOADS) {
    try {
      await env.UPLOADS.head('__healthcheck__')
      checks.r2 = 'connected'
    } catch (e) {
      checks.r2 = `error: ${(e as Error).message}`
    }
  } else {
    checks.r2 = 'unbound'
  }

  // Workers AI
  if (env.AI) {
    checks.ai = 'bound'
  } else {
    checks.ai = 'unbound'
  }

  checks.secrets = {
    elevenlabs: env.ELEVENLABS_API_KEY ? 'configured' : 'missing',
    jwt: env.JWT_SIGNING_KEY ? 'configured' : 'missing',
    gravatar: env.GRAVATAR_API_KEY ? 'configured' : 'missing',
  }

  checks.ai_models = {
    stt: '@cf/openai/whisper-large-v3-turbo',
    llm_primary: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    llm_fallback: '@cf/meta/llama-3.1-8b-instruct',
  }

  return ok(checks)
}
