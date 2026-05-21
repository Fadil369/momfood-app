// Cloudflare Pages middleware — adds CORS, request-id, and JSON helpers.
// Runs for every request before route handlers.

import type { PagesFunction } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database
  UPLOADS: R2Bucket
  AI?: Ai
  ELEVENLABS_API_KEY?: string
  JWT_SIGNING_KEY?: string
  GRAVATAR_API_KEY?: string
}

const ALLOWED_ORIGINS = new Set([
  'https://mom.elfadil.com',
  'https://zuzu.elfadil.com',
  'http://localhost:5173',
  'http://localhost:8788',
])

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request } = ctx
  const origin = request.headers.get('Origin') ?? ''
  const isAllowed = ALLOWED_ORIGINS.has(origin)

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin, isAllowed),
    })
  }

  const response = await ctx.next()
  const headers = new Headers(response.headers)
  for (const [k, v] of Object.entries(corsHeaders(origin, isAllowed))) {
    headers.set(k, v)
  }
  headers.set('X-Request-Id', crypto.randomUUID())
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function corsHeaders(origin: string, allowed: boolean): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://mom.elfadil.com',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}
