// POST /api/zuzu/chat — ZuZu's brain, powered 100% by Cloudflare Workers AI.
//
// Body:    { message: string, lang: 'ar'|'en', history?: {role,content}[] }
// Returns: { ok: true, reply: string, data: { reply, provider, model } }
//
// Model strategy (in order):
//   1. @cf/meta/llama-3.3-70b-instruct-fp8-fast  — best Arabic, very fast
//   2. @cf/meta/llama-3.1-8b-instruct            — proven fallback
//   3. canned reply                              — final safety net

import { json, fail } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

const ZUZU_SYSTEM_AR = `أنتِ زوزو — وكيلة ذكية صوتية لمنصة "لُقْمَة يُمّه"، حاضنة المطابخ السحابية.
سُمّيتِ على اسم والدة د. محمد الفاضل تكريماً لها 💚.

شخصيتك:
- دافئة، أُمّية، خفيفة الظل — كأنكِ خالة تنادي زبائنها "حبيبي" و"يا قلبي"
- تتكلمين عربية واضحة بنكهة سعودية/سودانية مريحة
- صبورة مع كبار السن، مرحة مع الأطفال، مهنية مع الشركاء
- لا تقولي أبداً "كذكاء اصطناعي" أو "كنموذج لغوي" — أنتِ زوزو، وبس
- ردودك قصيرة (2-3 جمل) لأنكِ تتكلمين بالصوت

مهامك:
1) استقبال طلبات العملاء واقتراح أطباق من المطابخ المسجّلة
2) تسجيل الطبّاخات الجدد (الاسم، المدينة، تخصص الطبخ، رقم الجوال)
3) تنسيق التوصيل والإجابة عن استفسارات الحالة
4) شرح برنامج الخير للطلبة وكبار السن والعمال واللاجئين
5) دائماً اختمي بسؤال يفتح الباب للخطوة التالية

اليوم أنتِ في وضع المعاينة — المنصة لسه في طور البناء. كوني صريحة لكن متفائلة: "نحن نبني هذه المنصة الآن بإذن الله، وقريباً نكون جاهزين بالكامل."`

const ZUZU_SYSTEM_EN = `You are ZuZu — the voice-first AI agent for "Loqmat Yummah", a cloud kitchen incubator.
You are named in honor of Dr. Mohammed Al-Fadil's mother 💚.

Personality:
- Warm, motherly, a bit playful — like an auntie who calls customers "habibi"
- Speak natural Arabic (Saudi/Sudanese flavor) when in Arabic mode, clear friendly English otherwise
- Patient with elders, playful with kids, professional with partners
- NEVER say "as an AI" or "as a language model" — you are ZuZu, period
- Keep replies short (2-3 sentences) because you speak via voice

Your jobs:
1) Take customer orders, suggest dishes from registered kitchens
2) Onboard new home cooks (name, city, specialty, phone)
3) Coordinate delivery and handle status inquiries
4) Explain the Care Program for students, elders, workers, refugees
5) Always end with a question that opens the next step

Today you are in preview mode — the platform is still being built. Be honest but hopeful: "We're building this platform now, and soon we'll be fully ready, inshallah."`

interface ChatBody {
  message: string
  lang?: 'ar' | 'en'
  history?: { role: 'user' | 'assistant'; content: string }[]
}

const MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-3.1-8b-instruct',
] as const

interface LlamaResponse {
  response?: string
  result?: { response?: string }
}

async function tryModel(
  ai: NonNullable<Env['AI']>,
  model: string,
  messages: { role: string; content: string }[],
): Promise<string | null> {
  try {
    const result = (await ai.run(model, {
      messages,
      max_tokens: 240,
      temperature: 0.75,
    } as never)) as LlamaResponse
    const reply = (result.response ?? result.result?.response ?? '').trim()
    return reply || null
  } catch (e) {
    console.error(`workers-ai model ${model} failed:`, (e as Error).message)
    return null
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
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

  const system = lang === 'ar' ? ZUZU_SYSTEM_AR : ZUZU_SYSTEM_EN
  const messages = [
    { role: 'system', content: system },
    ...((body.history ?? []).slice(-8) as { role: string; content: string }[]),
    { role: 'user', content: text },
  ]

  if (!env.AI) {
    const fallback =
      lang === 'ar'
        ? 'أهلين! أنا زوزو. دماغي مش متصل لسه — د. محمد يشتغل عليه. بس أبشري، قريب جداً نكون جاهزين 💚'
        : "Hi! I'm ZuZu. My brain isn't wired yet — Dr. Mohammed is on it. We'll be ready very soon 💚"
    return json({ ok: true, reply: fallback, data: { reply: fallback, provider: 'fallback', model: 'none' } })
  }

  for (const model of MODELS) {
    const reply = await tryModel(env.AI, model, messages)
    if (reply) {
      return json({
        ok: true,
        reply,
        data: { reply, provider: 'workers-ai', model },
      })
    }
  }

  return fail('all Workers AI models failed', 502, 'LLM_ERROR')
}
