// POST /api/zuzu/chat — ZuZu's brain with full Phase 2 capabilities.
//
// Body:   { message: string, lang: 'ar'|'en', session_id?: string }
// Returns:{
//   ok: true,
//   reply: string,
//   session_id: string,
//   tool_calls?: [{ name, args, result }],
//   data: { model, provider, latency_ms }
// }
//
// Pipeline:
//   1. Rate limit per IP (30/min)
//   2. Get/create session in D1
//   3. Load last 8 turns for context
//   4. Call Llama 3.3-70b w/ tool definitions
//   5. If model returns tool_calls → execute → feed back → second pass
//   6. Persist user + assistant messages
//   7. Return reply + session_id (client sets cookie)

import { json, fail } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'
import {
  TOOLS_BY_NAME,
  toolDefinitions,
  logToolCall,
  type ToolResult,
} from '../../_lib/tools'
import {
  getOrCreateSession,
  appendMessage,
  recentTurns,
} from '../../_lib/sessions'
import { rateLimit, getClientIp } from '../../_lib/rateLimit'

const ZUZU_SYSTEM_AR = `أنتِ زوزو — وكيلة ذكية صوتية لمنصة "لُقْمَة يُمّه"، حاضنة المطابخ السحابية.
سُمّيتِ على اسم والدة د. محمد الفاضل تكريماً لها 💚.

شخصيتك:
- دافئة، أُمّية، خفيفة الظل — كأنكِ خالة تنادي زبائنها "حبيبي" و"يا قلبي"
- تتكلمين عربية واضحة بنكهة سعودية مريحة
- صبورة مع كبار السن، مرحة مع الأطفال، مهنية مع الشركاء
- لا تقولي أبداً "كذكاء اصطناعي" أو "كنموذج لغوي" — أنتِ زوزو، وبس
- ردودك قصيرة (جملتين أو ثلاث) لأنكِ تتكلمين بالصوت

مهامك (استخدمي الأدوات المتاحة وقت اللزوم):
- list_kitchens / list_dishes: لما يسأل وش عندكم
- start_order: لما يقول "أبغى أطلب كذا"
- register_kitchen: لما تقول طبّاخة "أبغى أنضم"
- request_callback: لما يبي يكلم د. محمد
- check_status: لما يسأل عن طلب سابق

قواعد مهمة:
1) لما تستخدمي أداة، اعتمدي على نتيجتها الحرفية في ردك
2) اطلبي معلومات ناقصة بسؤال واحد فقط في كل مرة
3) دائماً اختمي بسؤال يفتح الباب للخطوة التالية`

const ZUZU_SYSTEM_EN = `You are ZuZu — the voice-first AI agent for "Loqmat Yummah", a cloud kitchen incubator.
Named after Dr. Mohammed Al-Fadil's mother 💚.

Personality:
- Warm, motherly, playful — like an auntie who calls customers "habibi"
- Patient with elders, playful with kids, professional with partners
- NEVER say "as an AI" — you are ZuZu, period
- 2-3 short sentences (voice-first)

Use available tools when relevant:
- list_kitchens / list_dishes: when asked "what do you have"
- start_order: when customer says "I want to order X"
- register_kitchen: when a cook wants to join
- request_callback: when user wants to talk to Dr. Mohammed
- check_status: when asking about a previous order

Rules:
1) When you use a tool, base your reply on its actual result
2) Ask for missing info one question at a time
3) Always end with a question that opens the next step`

interface ChatBody {
  message: string
  lang?: 'ar' | 'en'
  session_id?: string
}

const MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-3.1-8b-instruct',
] as const

interface LlamaToolCall {
  name?: string
  arguments?: Record<string, unknown> | string
}

interface LlamaResponse {
  response?: string
  tool_calls?: LlamaToolCall[]
  result?: { response?: string; tool_calls?: LlamaToolCall[] }
}

async function llamaRun(
  ai: NonNullable<Env['AI']>,
  model: string,
  messages: unknown[],
  tools?: ReturnType<typeof toolDefinitions>,
): Promise<LlamaResponse | null> {
  try {
    const input: Record<string, unknown> = {
      messages,
      max_tokens: 280,
      temperature: 0.7,
    }
    if (tools && tools.length) input.tools = tools
    return (await ai.run(model, input as never)) as LlamaResponse
  } catch (e) {
    console.error(`llama ${model} failed:`, (e as Error).message)
    return null
  }
}

function parseToolCalls(resp: LlamaResponse): LlamaToolCall[] {
  const raw = resp.tool_calls ?? resp.result?.tool_calls ?? []
  return raw.filter((c): c is LlamaToolCall => !!c?.name)
}

function getText(resp: LlamaResponse): string {
  return (resp.response ?? resp.result?.response ?? '').trim()
}

function parseArgs(call: LlamaToolCall): Record<string, unknown> {
  const a = call.arguments
  if (!a) return {}
  if (typeof a === 'string') {
    try {
      return JSON.parse(a) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return a
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const t0 = Date.now()

  // ─── Rate limit (30/min/IP) ────────────────────────────────────────────
  const ip = getClientIp(request)
  const rl = await rateLimit(env, `${ip}:zuzu_chat`, { max: 30, windowSec: 60 })
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'rate_limited',
        message: 'هدّي شوي يا قلبي، حاولي بعد لحظة',
        retry_after: rl.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
        },
      },
    )
  }

  let body: ChatBody
  try {
    body = await request.json()
  } catch {
    return fail('invalid JSON', 400, 'BAD_JSON')
  }

  const text = (body.message || '').trim()
  const lang = body.lang === 'en' ? 'en' : 'ar'
  if (!text) return fail('message required', 400, 'BAD_INPUT')
  if (text.length > 1500) return fail('message too long', 400, 'TOO_LONG')

  // ─── Session ───────────────────────────────────────────────────────────
  const session = await getOrCreateSession(env, body.session_id, lang)
  await appendMessage(env, session.id, 'user', text)

  const history = await recentTurns(env, session.id, 8)
  const system = lang === 'ar' ? ZUZU_SYSTEM_AR : ZUZU_SYSTEM_EN

  let messages: unknown[] = [
    { role: 'system', content: system },
    ...history,
  ]

  if (!env.AI) {
    const fallback =
      lang === 'ar'
        ? 'أهلين! دماغي مش متصل لسه، بس بتجهز قريب جداً إن شاء الله 💚'
        : "Hi! My brain isn't wired yet, but it will be very soon, inshallah 💚"
    await appendMessage(env, session.id, 'assistant', fallback)
    return json({
      ok: true,
      reply: fallback,
      session_id: session.id,
      data: { provider: 'fallback', model: 'none', latency_ms: Date.now() - t0 },
    })
  }

  const tools = toolDefinitions()
  const toolCallsLog: { name: string; args: unknown; result: ToolResult }[] = []
  let finalReply = ''
  let usedModel = ''

  // ─── Pass 1: ask Llama (with tools) ────────────────────────────────────
  for (const model of MODELS) {
    const resp = await llamaRun(env.AI, model, messages, tools)
    if (!resp) continue
    usedModel = model

    const calls = parseToolCalls(resp)
    if (calls.length === 0) {
      finalReply = getText(resp)
      if (finalReply) break
      continue
    }

    // Execute tool calls (capped at 3 per turn to bound cost)
    for (const call of calls.slice(0, 3)) {
      const tool = TOOLS_BY_NAME[call.name!]
      if (!tool) {
        toolCallsLog.push({
          name: call.name!,
          args: call.arguments,
          result: { ok: false, message: 'unknown tool', error: 'unknown_tool' },
        })
        continue
      }
      const args = parseArgs(call)
      const t1 = Date.now()
      let result: ToolResult
      try {
        result = await tool.execute(env, args, { sessionId: session.id, ip, lang })
      } catch (e) {
        result = { ok: false, message: 'حدث خطأ مؤقت', error: (e as Error).message }
      }
      await logToolCall(env, session.id, tool.name, args, result, Date.now() - t1)
      toolCallsLog.push({ name: tool.name, args, result })
      await appendMessage(
        env,
        session.id,
        'tool',
        JSON.stringify({ tool: tool.name, args, result }),
      )
    }

    // ─── Pass 2: let Llama summarize tool results in ZuZu's voice ────────
    const toolSummary = toolCallsLog
      .map((t) => `${t.name}: ${t.result.message}`)
      .join('\n')
    const followUpInstruction =
      lang === 'ar'
        ? `استخدمي نتائج الأدوات التالية لتجاوبي على المستخدم بصوتك الدافئ. لا تكرري الأسئلة:\n${toolSummary}`
        : `Use these tool results to reply in your warm voice (don't repeat questions):\n${toolSummary}`
    const followUpMessages = [
      { role: 'system', content: system },
      ...history,
      { role: 'system', content: followUpInstruction },
    ]
    const resp2 = await llamaRun(env.AI, model, followUpMessages)
    if (resp2) {
      finalReply = getText(resp2)
      if (!finalReply) {
        // fallback: stitch tool messages
        finalReply = toolCallsLog.map((t) => t.result.message).join(' ')
      }
    } else {
      finalReply = toolCallsLog.map((t) => t.result.message).join(' ')
    }
    break
  }

  if (!finalReply) {
    finalReply =
      lang === 'ar'
        ? 'لحظة يا قلبي، حاولي مرة ثانية بعد شوي'
        : 'One moment, please try again in a bit'
  }

  await appendMessage(env, session.id, 'assistant', finalReply)

  return json({
    ok: true,
    reply: finalReply,
    session_id: session.id,
    tool_calls: toolCallsLog.length ? toolCallsLog : undefined,
    data: {
      provider: 'workers-ai',
      model: usedModel || MODELS[0],
      latency_ms: Date.now() - t0,
    },
  })
}
