/**
 * ZuZu's tool catalog — function-calling primitives.
 *
 * Each tool:
 *   - has a JSON-schema definition (sent to Llama for function-calling)
 *   - has an `execute(env, args, ctx)` implementation
 *   - logs to `tool_calls` table for observability
 *
 * Phase 2 tools focus on lead capture + read-only menu. Phase 4 will add
 * payment + status transitions.
 */

import type { Env } from '../_middleware'
import { uuid } from './response'

export interface ToolContext {
  sessionId: string
  ip: string
  lang: 'ar' | 'en'
}

export interface ToolResult {
  ok: boolean
  message: string // a short message ZuZu can speak back
  data?: Record<string, unknown>
  error?: string
}

export interface ToolDef {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required?: string[]
  }
  execute: (env: Env, args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>
}

// ─── list_kitchens ─────────────────────────────────────────────────────────
const listKitchens: ToolDef = {
  name: 'list_kitchens',
  description:
    'List active cloud kitchens, optionally filtered by city. Use when the user asks "what kitchens do you have?" or asks for food in a specific city.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'Arabic city name e.g. الرياض، جدة' },
      limit: { type: 'number', description: 'Max kitchens to return (default 5)' },
    },
  },
  async execute(env, args) {
    const city = typeof args.city === 'string' ? args.city.trim() : ''
    const limit = Math.min(Number(args.limit ?? 5), 20)
    const sql = city
      ? 'SELECT id, name_ar, name_en, city, description_ar FROM kitchens WHERE is_active=1 AND city LIKE ? LIMIT ?'
      : 'SELECT id, name_ar, name_en, city, description_ar FROM kitchens WHERE is_active=1 LIMIT ?'
    const stmt = city
      ? env.DB.prepare(sql).bind(`%${city}%`, limit)
      : env.DB.prepare(sql).bind(limit)
    const { results } = await stmt.all<{
      id: string
      name_ar: string
      name_en: string | null
      city: string
      description_ar: string | null
    }>()
    const summary =
      results.length === 0
        ? 'ما عندنا مطابخ مسجلة في هذي المدينة لسه — بس قريباً إن شاء الله!'
        : `عندنا ${results.length} مطبخ: ${results.map((k) => `${k.name_ar} (${k.city})`).join('، ')}`
    return { ok: true, message: summary, data: { kitchens: results } }
  },
}

// ─── list_dishes ───────────────────────────────────────────────────────────
const listDishes: ToolDef = {
  name: 'list_dishes',
  description:
    'List available dishes from active kitchens, optionally filtered by city or dish-name keyword. Use when user asks "what do you have today?" or "is there kabsa?"',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City filter' },
      query: { type: 'string', description: 'Dish name keyword e.g. كبسة، مندي' },
      limit: { type: 'number', description: 'Max items (default 6)' },
    },
  },
  async execute(env, args) {
    const city = typeof args.city === 'string' ? args.city.trim() : ''
    const query = typeof args.query === 'string' ? args.query.trim() : ''
    const limit = Math.min(Number(args.limit ?? 6), 20)

    const where: string[] = ['m.is_available=1', 'k.is_active=1']
    const params: unknown[] = []
    if (city) {
      where.push('k.city LIKE ?')
      params.push(`%${city}%`)
    }
    if (query) {
      where.push('(m.name_ar LIKE ? OR m.name_en LIKE ?)')
      params.push(`%${query}%`, `%${query}%`)
    }
    params.push(limit)

    const sql = `
      SELECT m.id, m.name_ar, m.name_en, m.price_sar, m.category, m.emoji,
             k.id AS kitchen_id, k.name_ar AS kitchen_name, k.city
      FROM menu_items m
      JOIN kitchens k ON k.id = m.kitchen_id
      WHERE ${where.join(' AND ')}
      LIMIT ?
    `
    const { results } = await env.DB.prepare(sql).bind(...params).all<{
      id: string
      name_ar: string
      name_en: string | null
      price_sar: number
      category: string
      emoji: string | null
      kitchen_id: string
      kitchen_name: string
      city: string
    }>()

    if (results.length === 0) {
      return {
        ok: true,
        message: 'ما حصلت أطباق تطابق طلبك حالياً، بس لاحقاً بنزيد القائمة 💚',
        data: { dishes: [] },
      }
    }
    const top = results.slice(0, 3)
    const lines = top
      .map((d) => `${d.emoji ?? '🍽️'} ${d.name_ar} من ${d.kitchen_name} بـ ${d.price_sar} ريال`)
      .join('، ')
    return {
      ok: true,
      message: `أحسن 3 خيارات لك: ${lines}. تبي تجرب منها وحدة؟`,
      data: { dishes: results },
    }
  },
}

// ─── start_order ───────────────────────────────────────────────────────────
const startOrder: ToolDef = {
  name: 'start_order',
  description:
    'Capture a customer order intent (pre-payment). Use when the customer says "I want X for Y people in Z city". Saves an order_intent row that admin will follow up via WhatsApp.',
  parameters: {
    type: 'object',
    properties: {
      dish: { type: 'string', description: 'Dish name e.g. كبسة لحم' },
      servings: { type: 'number', description: 'Number of people' },
      city: { type: 'string', description: 'City' },
      phone: { type: 'string', description: 'Saudi mobile e.g. 05XXXXXXXX' },
      notes: { type: 'string', description: 'Optional notes (address, dietary, etc.)' },
    },
    required: ['dish'],
  },
  async execute(env, args, ctx) {
    const id = uuid()
    const dish = String(args.dish ?? '').trim()
    if (!dish) return { ok: false, message: 'لازم تخبريني وش تبين تطلبين أول', error: 'no_dish' }
    const servings = Number(args.servings ?? 0) || null
    const city = (args.city as string) || null
    const phone = (args.phone as string) || null
    const notes = (args.notes as string) || null
    await env.DB.prepare(
      `INSERT INTO order_intents (id, session_id, dish, servings, city, phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, ctx.sessionId, dish, servings, city, phone, notes)
      .run()

    const partsMsg = [
      `سجلت طلبك: ${dish}`,
      servings ? `لـ ${servings} أشخاص` : '',
      city ? `في ${city}` : '',
    ]
      .filter(Boolean)
      .join('، ')
    return {
      ok: true,
      message: `تمام! ${partsMsg}. د. محمد بيراسلك قريب على الواتساب يأكد التفاصيل ويرتب التوصيل 💚`,
      data: { intent_id: id },
    }
  },
}

// ─── register_kitchen ──────────────────────────────────────────────────────
const registerKitchen: ToolDef = {
  name: 'register_kitchen',
  description:
    'Capture a cook signup lead. Use when a user expresses interest in joining as a home cook / chef. Collects name and at least one of: phone, city, or specialty.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: "Cook's name (e.g. أم عبدالله)" },
      phone: { type: 'string', description: 'Saudi mobile e.g. 05XXXXXXXX' },
      city: { type: 'string', description: 'City' },
      specialty: { type: 'string', description: 'Specialty e.g. كبسة، حلويات، أكل سوداني' },
      notes: { type: 'string', description: 'Optional notes' },
    },
    required: ['name'],
  },
  async execute(env, args, ctx) {
    const id = uuid()
    const name = String(args.name ?? '').trim()
    if (!name) return { ok: false, message: 'أبشر، عطيني اسمك أولاً', error: 'no_name' }
    const phone = (args.phone as string) || null
    const city = (args.city as string) || null
    const specialty = (args.specialty as string) || null
    const notes = (args.notes as string) || null
    await env.DB.prepare(
      `INSERT INTO kitchen_leads (id, session_id, name, phone, city, specialty, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, ctx.sessionId, name, phone, city, specialty, notes)
      .run()
    return {
      ok: true,
      message: `أهلين يا ${name}! سجلتك في الحاضنة. د. محمد بيتواصل معك خلال يوم أو يومين لإكمال التسجيل وفتح مطبخك 💚`,
      data: { lead_id: id },
    }
  },
}

// ─── request_callback ──────────────────────────────────────────────────────
const requestCallback: ToolDef = {
  name: 'request_callback',
  description:
    'Queue a callback request from Dr. Mohammed when the user wants to talk to a human or has a request ZuZu can\'t fulfill yet.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Caller name (optional)' },
      phone: { type: 'string', description: 'Required: Saudi mobile' },
      reason: { type: 'string', description: 'Why they want a call' },
      preferred_window: { type: 'string', description: 'e.g. الصباح، بعد العصر' },
    },
    required: ['phone'],
  },
  async execute(env, args, ctx) {
    const id = uuid()
    const phone = String(args.phone ?? '').trim()
    if (!phone) return { ok: false, message: 'محتاجة رقم جوالك لأرتب لك الاتصال', error: 'no_phone' }
    await env.DB.prepare(
      `INSERT INTO callbacks (id, session_id, name, phone, reason, preferred_window)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        ctx.sessionId,
        (args.name as string) || null,
        phone,
        (args.reason as string) || null,
        (args.preferred_window as string) || null,
      )
      .run()
    return {
      ok: true,
      message: 'تمام، سجلت طلب اتصال. د. محمد بيتصل بك في أقرب فرصة إن شاء الله 💚',
      data: { callback_id: id },
    }
  },
}

// ─── check_status ──────────────────────────────────────────────────────────
const checkStatus: ToolDef = {
  name: 'check_status',
  description:
    'Look up an existing order intent or kitchen lead by reference id or phone. Use when user asks "where is my order?" or "did you get my registration?"',
  parameters: {
    type: 'object',
    properties: {
      reference: { type: 'string', description: 'Order/lead id or phone number' },
    },
    required: ['reference'],
  },
  async execute(env, args) {
    const ref = String(args.reference ?? '').trim()
    if (!ref) return { ok: false, message: 'أعطيني رقم الطلب أو جوالك علشان أبحث', error: 'no_ref' }
    const order = await env.DB.prepare(
      `SELECT id, dish, servings, city, status, created_at FROM order_intents
       WHERE id=? OR phone=? ORDER BY created_at DESC LIMIT 1`,
    )
      .bind(ref, ref)
      .first<{ id: string; dish: string; status: string; created_at: string }>()
    if (order) {
      return {
        ok: true,
        message: `طلبك ${order.dish} حالته: ${order.status}. ${order.status === 'open' ? 'لسه ما تواصلنا معك — قريب جداً!' : ''}`,
        data: { order },
      }
    }
    const lead = await env.DB.prepare(
      `SELECT id, name, city, specialty, status, created_at FROM kitchen_leads
       WHERE id=? OR phone=? ORDER BY created_at DESC LIMIT 1`,
    )
      .bind(ref, ref)
      .first<{ id: string; name: string; status: string }>()
    if (lead) {
      return {
        ok: true,
        message: `تسجيلك يا ${lead.name} حالته: ${lead.status}.`,
        data: { lead },
      }
    }
    return { ok: true, message: 'ما حصلت سجل بهذا الرقم — تأكدي من الرقم وحاولي مرة ثانية' }
  },
}

export const TOOLS: ToolDef[] = [
  listKitchens,
  listDishes,
  startOrder,
  registerKitchen,
  requestCallback,
  checkStatus,
]

export const TOOLS_BY_NAME: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.name, t]),
)

/** OpenAI-style function definitions for Llama function-calling. */
export function toolDefinitions() {
  return TOOLS.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))
}

/** Log a tool call (best-effort, never throws). */
export async function logToolCall(
  env: Env,
  sessionId: string,
  toolName: string,
  args: unknown,
  result: ToolResult,
  latencyMs: number,
) {
  try {
    await env.DB.prepare(
      `INSERT INTO tool_calls (id, session_id, tool_name, arguments, result, success, latency_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        uuid(),
        sessionId,
        toolName,
        JSON.stringify(args),
        JSON.stringify(result),
        result.ok ? 1 : 0,
        latencyMs,
      )
      .run()
  } catch (e) {
    console.error('tool_calls log failed:', (e as Error).message)
  }
}
