// GET /api/health — quick liveness + D1 connectivity probe
import { ok, fail } from '../_lib/response'
import type { Env } from '../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const checks: Record<string, unknown> = {
    service: 'momfood-app',
    timestamp: new Date().toISOString(),
    version: '0.1.0-phase0',
  }

  try {
    const r = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
    checks.d1 = r?.ok === 1 ? 'connected' : 'unexpected'
  } catch (e) {
    checks.d1 = `error: ${(e as Error).message}`
  }

  checks.secrets = {
    elevenlabs: env.ELEVENLABS_API_KEY ? 'configured' : 'missing',
    deepseek: env.DEEPSEEK_API_KEY ? 'configured' : 'missing',
    jwt: env.JWT_SIGNING_KEY ? 'configured' : 'missing',
    gravatar: env.GRAVATAR_API_KEY ? 'configured' : 'missing',
  }

  return ok(checks)
}
