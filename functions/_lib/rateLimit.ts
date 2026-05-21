/**
 * D1-backed sliding-window rate limiter.
 *
 *   await rateLimit(env, key, { max: 30, windowSec: 60 })
 *     → { allowed: true, remaining, retryAfter }
 *
 * Keyed by "{ip}:{route}". Uses unix-floor(now/window) as bucket id.
 * Simple, atomic via UPSERT. Good enough for our scale.
 */

import type { Env } from '../_middleware'

export interface RateLimitOpts {
  max: number
  windowSec: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number // seconds until next window
}

export async function rateLimit(
  env: Env,
  key: string,
  opts: RateLimitOpts,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const bucket = Math.floor(now / opts.windowSec) * opts.windowSec
  const expiresIn = bucket + opts.windowSec - now

  // Atomic upsert; SQLite supports ON CONFLICT DO UPDATE
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1`,
  )
    .bind(key, bucket)
    .run()

  const row = await env.DB.prepare(
    `SELECT count FROM rate_limits WHERE key=? AND window_start=?`,
  )
    .bind(key, bucket)
    .first<{ count: number }>()

  const count = row?.count ?? 1
  const remaining = Math.max(0, opts.max - count)
  return { allowed: count <= opts.max, remaining, retryAfter: expiresIn }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
    'unknown'
  )
}
