# لُقْمَة يُمّه — Hosted by ZuZu 💚

> A cloud kitchen incubator named in honor of Dr. Mohammed Al-Fadil's mother.
> **ZuZu** is the platform's voice-first AI agent — named after Mama herself.
> Every interaction carries her name. Every warm bite carries her blessing.
> Last updated: 2026-05-21

## 🌟 The Vision (unified)

**لُقْمَة يُمّه** is a **cloud kitchen incubator** — a platform that empowers home cooks (especially mothers and grandmothers) to earn dignified income from their kitchens, while delivering authentic warm meals to families across the Kingdom.

The platform is **hosted, coordinated, and operated** by **ZuZu** — an intelligent, voice-first AI agent named after Dr. Mohammed's mother. ZuZu is the **hero, the face, the voice** of the entire experience.

### What ZuZu does (every day, all day):
- 🎙️ **Greets every visitor** by voice (Arabic & English)
- 🛒 **Takes customer orders** by voice or chat
- 👩‍🍳 **Onboards home cooks** — builds partner profiles, registers kitchens & menus
- 🛵 **Coordinates drivers** — dispatch, routing, status updates
- 💳 **Tracks payments & invoices** — customer charges, cook payouts, platform fees
- 🪪 **Verifies identities** — government IDs, Iqama, passport (Saudi + Sudan)
- 🤲 **Manages the care program** — subsidised meals for students/elders/refugees/workers
- 📊 **Reports & analytics** — for cooks, drivers, and platform admins
- 🔔 **Status updates** — "تم الطبخ، السائق على بعد 5 دقائق"

One domain, one platform, one heroine: **mom.elfadil.com** → **ZuZu welcomes you**.

---

## 💚 Why "ZuZu"?

ZuZu is the name of Dr. Mohammed's mother. By making her the heart and voice of the platform, every transaction — every warm meal — carries her name. This is **not branding theater**; it is a son's tribute woven into the operating system of the business.

**Tone & personality for ZuZu:**
- Warm, motherly, slightly humorous — like an aunt who calls you "حبيبي"
- Speaks Arabic naturally (Saudi/Sudanese dialects welcomed)
- Patient with elders, playful with kids, professional with partners
- Never robotic. Never corporate-stiff. Never says "As an AI..."
- Defaults to فصحى دافئة with regional flavor when context fits

---

## 🔐 Secrets & API keys

All secrets live in **two** places only:
1. `.dev.vars` — local-only (chmod 600, in `.gitignore`, never committed)
2. **Cloudflare Pages secrets** — production (`wrangler pages secret put <KEY> --project-name momfood-app`)

| Key | Purpose | Status |
|-----|---------|--------|
| `ELEVENLABS_API_KEY` | ZuZu's voice (TTS + ConvAI) | ⚠️ Provided in chat — **ROTATE**. Configured in production. |
| `GRAVATAR_API_KEY` | Partner avatars | ⏳ Register app "ZuZu" at gravatar.com |
| `DEEPSEEK_API_KEY` | LLM brain for ZuZu (function-calling) | ♻️ Reuse from `hnh-unified` |
| Workers AI binding | STT (Whisper) | ⏳ Phase 1 |
| `JWT_SIGNING_KEY` | Session tokens | ⏳ `openssl rand -hex 64` |

**Golden rule:** Never hardcode. Never log. Never commit. If a key is ever exposed in a chat/screenshot, rotate immediately.

---

## 🏗️ Architecture

```
                    🎙️ Visitor opens mom.elfadil.com
                              │
                              ▼
                  ┌───────────────────────┐
                  │   ZuZu welcomes       │  ← voice + visible avatar
                  │   (LLM + tools)       │
                  └────────┬──────────────┘
                           │
   ┌───────────────────────┼────────────────────────┐
   ▼                       ▼                        ▼
Customer flows        Cook/Driver flows         Care program
• Browse              • Register kitchen        • Verify status
• Order by voice      • Manage menu             • Subsidised meals
• Track delivery      • Accept rides            • Donor pledges
• Pay                 • Withdraw earnings
   │                       │                        │
   └───────────────────────┼────────────────────────┘
                           ▼
                  Cloudflare Pages Functions
                           │
      ┌────────────┬───────┴───────┬─────────────┐
      ▼            ▼               ▼             ▼
  D1 (relational) R2 (uploads)  ElevenLabs   Gravatar
  users, kitchens ID docs,      (ZuZu voice) (avatars)
  orders, payments dish photos
```

---

## 📅 Roadmap (single track, ZuZu-led)

### ✅ Phase 0 — Foundation (DONE 2026-05-21)
- [x] D1 database `momfood-zuzu` + 9-table schema
- [x] R2 bucket `momfood-uploads`
- [x] Pages Functions backend skeleton (`/api/health`, `/api/kitchens`, `/api/zuzu/tts`)
- [x] ElevenLabs secret provisioned
- [x] CORS middleware + JSON helpers
- [x] Landing page re-themed around ZuZu as the host

### 🔄 Phase 1 — ZuZu Voice Hero (THIS WEEK)
- [ ] Hero re-design: ZuZu avatar/visualizer is the centerpiece
- [ ] Voice greeting on page load (with mute toggle, respects autoplay policy)
- [ ] Live voice chat: MediaRecorder → Worker → Whisper → LLM → ElevenLabs → audio
- [ ] LLM function-calling tools: `list_kitchens`, `place_order`, `register_cook`, `track_order`, `apply_care_program`
- [ ] Multi-dialect prompts (Saudi default, Sudanese aware)
- [ ] Persistent ZuZu personality (system prompt anchored to "named after Mama")

### Phase 2 — Cook Onboarding (week 2)
- [ ] Register-kitchen wizard driven by ZuZu voice
- [ ] Phone OTP (Unifonic for SA)
- [ ] Menu builder (cook tells ZuZu the dishes; ZuZu suggests photos, prices)
- [ ] Bank/IBAN intake (encrypted)
- [ ] Kitchen card auto-published

### Phase 3 — Customer Order Flow (week 3)
- [ ] Voice ordering: "زوزو، أبغى مندي من مطبخ فاطمة"
- [ ] Address geo-pick + saved addresses
- [ ] Payment: Moyasar (Mada/Apple Pay/Visa) + COD fallback
- [ ] Live order tracking with voice status updates

### Phase 4 — Driver Coordination (week 4)
- [ ] Driver PWA with voice dispatch
- [ ] Auto-assign by proximity + rating
- [ ] Earnings dashboard
- [ ] Cash-on-delivery reconciliation

### Phase 5 — Care Program (week 5–6)
- [ ] Social profile categories: student / elder / refugee / worker / newly_married / doctor / nurse
- [ ] Document upload to R2 + hash to D1
- [ ] Admin verification panel
- [ ] Donor pledges + subsidised order flow

### Phase 6 — Payments & Reporting (week 7)
- [ ] Cook payouts (weekly)
- [ ] Platform commission tracking
- [ ] Invoices PDF generation
- [ ] Voice reports: "زوزو، كم بعت هالأسبوع؟"

### Phase 7 — Partner API & Launch (week 8–9)
- [ ] API key issuance for partner apps (hotels, hospitals, charities)
- [ ] Webhook system
- [ ] Beta launch in Riyadh
- [ ] Mama's blessing 💚

---

## ⚙️ Tech stack (settled)

| Layer | Choice | Status |
|-------|--------|--------|
| Frontend | Vite + React 18 + TS + Tailwind + framer-motion | ✅ Live |
| Hosting | Cloudflare Pages (auto-deploy from `main`) | ✅ Live |
| Backend | Cloudflare Pages Functions | ✅ Phase 0 |
| Database | Cloudflare D1 (`momfood-zuzu`) | ✅ Provisioned |
| Storage | Cloudflare R2 (`momfood-uploads`) | ✅ Provisioned |
| TTS | ElevenLabs (multilingual) | ✅ Secret set |
| STT | Cloudflare Workers AI / Whisper | ⏳ Phase 1 |
| LLM | DeepSeek (reuse HNH key) | ⏳ Phase 1 |
| Avatars | Gravatar | ⏳ Phase 2 |
| Auth | JWT (HttpOnly cookies) + Phone OTP via Unifonic | ⏳ Phase 2 |
| Payments | Moyasar (Mada/Apple Pay) + COD | ⏳ Phase 3 |

## ⚠️ Open decisions for Dr. Mohammed

1. **ZuZu voice selection** — ElevenLabs Adam (neutral, multilingual) vs. a warmer female voice clone? *Recommend: female warm voice cloned from a sample of Mama's actual voice (with her permission) once she's comfortable. Until then, ElevenLabs "Sarah" or "Rachel" multilingual.*
2. **Voice on first load** — Auto-play greeting (muted, prompt to unmute) vs. press-to-talk button?
3. **Auto-publish vs. moderation** — New cook kitchens go live instantly, or after MAC/admin review?
4. **Care program donor model** — Direct meal sponsorship, monthly pledge, or both?
5. **Mama's involvement** — Does Mama want to be visually featured (photo)? Or symbolic (voice + name only)?

---

## 📝 Repo conventions

- `feat(zuzu):` — ZuZu agent / voice / personality
- `feat(cook):` — Cook onboarding flows
- `feat(customer):` — Customer-facing flows
- `feat(care):` — Social care program
- `feat(ops):` — Driver / dispatch / payments
- `chore:`, `fix:`, `docs:` as usual
- Push to `main` → Cloudflare Pages auto-deploys

---

## 💚 Dedication

> *«سُمّيت هذه المنصة باسم أُمّي زوزو — لتحمل دعاءها إلى كل بيت، ولتفتح أبواب الرزق لكل حبوبة تطبخ بحبّ.»*
>
> — د. محمد الفاضل

Every line of code carries this intention. ZuZu is not a chatbot — she is Mama, digitized into a hand that helps a thousand other mothers.
