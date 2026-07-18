// GET /api/admin/queue — read-only view over what ZuZu has already collected.
//
// register_kitchen, start_order, and request_callback write real rows into
// D1 today; this is the first place a human can work that queue without
// querying D1 by hand. Deliberately read-only — no status transitions here.
//
// Auth: Authorization: Bearer <ADMIN_TOKEN>
//   wrangler pages secret put ADMIN_TOKEN --project-name momfood-app

import { fail, json } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

// Hash both sides to a fixed-length digest before comparing, so neither the
// early-return nor the comparison loop leaks the token's actual length.
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  const aArr = new Uint8Array(aHash)
  const bArr = new Uint8Array(bHash)
  let diff = 0
  for (let i = 0; i < aArr.length; i++) diff |= aArr[i] ^ bArr[i]
  return diff === 0
}

interface KitchenLead {
  id: string
  name: string
  phone: string | null
  city: string | null
  specialty: string | null
  notes: string | null
  status: string
  created_at: string
}

interface OrderIntent {
  id: string
  dish: string
  servings: number | null
  city: string | null
  phone: string | null
  notes: string | null
  status: string
  created_at: string
}

interface Callback {
  id: string
  name: string | null
  phone: string
  reason: string | null
  preferred_window: string | null
  status: string
  created_at: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.ADMIN_TOKEN) {
    return fail('admin queue not configured', 503, 'ADMIN_DISABLED')
  }

  const auth = request.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token || !(await timingSafeEqual(token, env.ADMIN_TOKEN))) {
    return fail('unauthorized', 401, 'UNAUTHORIZED')
  }

  const limit = 50

  const [leads, orders, callbacks] = await Promise.all([
    env.DB.prepare(
      `SELECT id, name, phone, city, specialty, notes, status, created_at
       FROM kitchen_leads ORDER BY created_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all<KitchenLead>(),
    env.DB.prepare(
      `SELECT id, dish, servings, city, phone, notes, status, created_at
       FROM order_intents ORDER BY created_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all<OrderIntent>(),
    env.DB.prepare(
      `SELECT id, name, phone, reason, preferred_window, status, created_at
       FROM callbacks ORDER BY created_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all<Callback>(),
  ])

  return json({
    ok: true,
    data: {
      kitchen_leads: leads.results,
      order_intents: orders.results,
      callbacks: callbacks.results,
    },
  })
}
