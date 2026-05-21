// POST /api/zuzu/chat — ZuZu's LLM brain.
// Body: { message: string, lang: 'ar'|'en', history?: {role,content}[] }
// Returns: { ok, reply, data: { reply } }
//
// Uses DeepSeek if DEEPSEEK_API_KEY is set; otherwise falls back to
// Cloudflare Workers AI (env.AI binding) with llama-3.1.

import { ok, fail, json } from '../../_lib/response'
import type { Env } from '../../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

interface EnvWithAI extends Env {
  AI?: {
    run: (model: string, input: unknown) => Promise<unknown>
  }
}

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

export const onRequestPost: PagesFunction<EnvWithAI> = async ({ env, request }) => {
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
    { role: 'system' as const, content: system },
    ...(body.history ?? []).slice(-8),
    { role: 'user' as const, content: text },
  ]

  // Path 1 — DeepSeek (preferred for quality + Arabic)
  if (env.DEEPSEEK_API_KEY) {
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 220,
        }),
      })
      if (!resp.ok) throw new Error(`deepseek ${resp.status}`)
      const data = (await resp.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const reply = data.choices?.[0]?.message?.content?.trim() ?? ''
      return json({ ok: true, reply, data: { reply, provider: 'deepseek' } })
    } catch (e) {
      // fall through to Workers AI
      console.error('deepseek failed', e)
    }
  }

  // Path 2 — Workers AI llama fallback
  if (env.AI) {
    try {
      const result = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages,
        max_tokens: 220,
        temperature: 0.7,
      })) as { response?: string }
      const reply =
        result.response?.trim() ??
        (lang === 'ar'
          ? 'أهلين! أنا زوزو. شو أقدر أساعدك فيه اليوم؟'
          : "Hi! I'm ZuZu. How can I help you today?")
      return json({ ok: true, reply, data: { reply, provider: 'workers-ai' } })
    } catch (e) {
      return fail(`llm error: ${(e as Error).message}`, 502, 'LLM_ERROR')
    }
  }

  // Path 3 — graceful canned reply if nothing configured
  const fallback =
    lang === 'ar'
      ? 'أهلين! أنا زوزو. لسه ما ربطت دماغي بالكامل — د. محمد يشتغل على الموضوع الحين. بس أبشري، قريب جداً نكون جاهزين 💚'
      : "Hi! I'm ZuZu. My brain isn't fully wired yet — Dr. Mohammed is working on it. We'll be fully ready very soon 💚"
  return json({ ok: true, reply: fallback, data: { reply: fallback, provider: 'fallback' } })
}
