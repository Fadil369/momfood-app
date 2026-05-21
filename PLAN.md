# لُقْمَة يُمّه + ZuZu Platform — Master Plan

> Built with love by Dr. Mohammed Al-Fadil (Fadil369). MAC is the executing agent.
> Last updated: 2026-05-21

## 🌳 Two parallel tracks

This repository hosts **two related products** that share infrastructure but serve different audiences:

### Track A — لُقْمَة يُمّه (Mom's Bite) — the gift 💚
- **Domain:** https://mom.elfadil.com
- **Audience:** Dr. Mohammed's mother's customers
- **Status:** ✅ **LIVE** (deployed 2026-05-21)
- **What it is:** A bilingual RTL landing page for a real home-kitchen restaurant. Hero, story, full menu (13 dishes), WhatsApp ordering, gallery, dedication footer.
- **Maintenance posture:** Stable. Updates are content-only (real photos, mom's name if she chooses, real hours/location).

### Track B — ZuZu Platform — the vision 🎙️
- **Domain:** TBD (proposed `zuzu.elfadil.com` or `momfood.app`) — **NOT** mom.elfadil.com
- **Audience:** Multi-tenant cloud kitchen marketplace + social safety-net beneficiaries
- **Status:** 📐 Planning → Phase 0
- **What it is:** Voice-first AI agent (ZuZu) that lets cooks/drivers/customers operate hands-free. Unified verified identity via Gravatar. Government ID verification. Social profiles (students, elders, refugees, etc.). Cloudflare D1 backend.
- **Rationale for separation:** Mom's gift is sacred — it stays personal, lean, and emotional. ZuZu is a product. Each deserves its own URL and lifecycle. Mom can be onboarded as **Cook #1** when ready.

---

## 🔐 Secrets & API keys

All secrets live in **two** places only:
1. `.dev.vars` — local-only (chmod 600, in `.gitignore`, never committed)
2. **Cloudflare Worker secrets** — production (`wrangler secret put <KEY>`)

| Key | Purpose | Status |
|-----|---------|--------|
| `ELEVENLABS_API_KEY` | TTS + ConvAI voice for ZuZu | ⚠️ Provided in chat — **ROTATE** before production. Saved locally. |
| `GRAVATAR_API_KEY` | Avatar lookup/sync | ⏳ TODO: register app "ZuZu" at gravatar.com |
| `OPENAI_API_KEY` or `DEEPSEEK_API_KEY` | LLM for function-calling | ♻️ Can reuse from `hnh-unified` worker |
| `WHISPER_API_KEY` | STT (or use CF Workers AI) | ⏳ TBD |
| `CF_ACCOUNT_ID` | Cloudflare ops | ✅ already in user's env |

**Rule:** Never hardcode. Never log. Never commit. If a key is ever exposed in a chat/screenshot/email, rotate immediately.

---

## 🏗️ Architecture (ZuZu)

```
[User Device — PWA] 
        │
        ├─ MediaRecorder ──► Worker ──► Whisper STT ──┐
        │                                              ▼
        │                                       ┌───────────────┐
        │  ◄────── ElevenLabs TTS audio ◄────── │ ZuZu Agent    │
        │                                       │ (LLM + tools) │
        │                                       └──────┬────────┘
        │                                              │
        ▼                                              ▼
[React UI: chat + voice viz]              [Cloudflare Workers]
                                                  │
                  ┌───────────────────────────────┼──────────────────┐
                  ▼                               ▼                  ▼
            Profile Svc                    Order/Kitchen Svc   Verification Svc
                  │                               │                  │
                  ▼                               ▼                  ▼
            D1 (users,                      D1 (kitchens,         R2 (ID docs,
            social_profiles)                orders, menu)         supporting docs)
                  │
                  ▼
            Gravatar API (avatars)
```

---

## 📅 Roadmap (MAC-pragmatic, not the 19-week PRD version)

### Phase 0 — Foundation (this week)
- [ ] D1 database `momfood-zuzu` + initial schema (users, social_profiles, kitchens, menu_items, orders)
- [ ] Wrangler config for Workers backend (separate from Pages frontend)
- [ ] `.dev.vars` workflow + secret management docs
- [ ] Auth scaffold: JWT for user sessions + API keys for partners
- [ ] Health endpoints `/api/health`, `/api/system-status`

### Phase 1 — ZuZu Voice MVP (week 2-3)
- [ ] ElevenLabs ConvAI widget embed (same pattern as `hnh.brainsait.org`)
- [ ] Server-side voice proxy: Worker forwards to ElevenLabs/Whisper using Worker secret
- [ ] LLM function-calling tools: `list_kitchens`, `place_order`, `track_order`, `get_profile`
- [ ] Multilingual (Arabic Sudan/Saudi + English) prompts
- [ ] Replace `ZuZuAgent.tsx` placeholder with real voice-first UI

### Phase 2 — Identity & Profiles (week 4)
- [ ] Gravatar app registration + sync service
- [ ] Profile CRUD via D1
- [ ] Phone OTP (Twilio or Cloudflare's offering)
- [ ] Role linking (cook/driver/customer multi-role per user)

### Phase 3 — Government ID Verification (week 5-6)
- [ ] R2 bucket for encrypted ID uploads (auto-purge after verify)
- [ ] SHA-256 hash storage only (never raw ID numbers)
- [ ] Admin panel for manual review
- [ ] Country/ID-type routing (SD national card, SA Iqama, passport)

### Phase 4 — Social Safety-Net (week 7)
- [ ] `social_profiles` table + dynamic eligibility forms per category
- [ ] Categories: student, elder, daily_worker, refugee, newly_married, doctor, nurse
- [ ] Subsidised order flow + designated kitchens flag

### Phase 5 — Partner API Platform (week 8)
- [ ] API key issuance + rotation
- [ ] Rate limiting (Worker + KV)
- [ ] Developer portal page + API docs
- [ ] Webhook system for order events

### Phase 6 — Onboard Mom 💚 (anytime)
- [ ] Create Mom's verified profile (cook role)
- [ ] Import "لُقْمَة يُمّه" menu from `src/data/menu.ts` into D1
- [ ] Link `mom.elfadil.com` → ZuZu order pipeline (optional; keep gift page intact)

---

## ⚙️ Tech decisions (settled)

| Question | Choice | Why |
|----------|--------|-----|
| Frontend framework | Vite + React 18 + TS | Already in use, ships fast |
| Styling | Tailwind + shadcn/ui | Already in use |
| Animation | framer-motion | Already in use |
| Backend | Cloudflare Workers | Consistent with HNH ecosystem |
| Database | Cloudflare D1 | Per PRD, serverless, low-latency in ME |
| Object storage | Cloudflare R2 | For ID docs and dish photos |
| TTS | ElevenLabs | High quality Arabic voices |
| STT | Cloudflare Workers AI (Whisper) | Already available, no extra key |
| LLM | Reuse DeepSeek key from `hnh-unified` | Cost-effective, already proven |
| Avatars | Gravatar | Per PRD |
| Auth (users) | JWT in HttpOnly cookies + Phone OTP | Standard secure pattern |
| Auth (partners) | API keys with `zu-` prefix | Per PRD |

## ⚠️ Open decisions (need Dr. Mohammed's call)

1. **Final domain for ZuZu Platform** — `zuzu.elfadil.com` vs new `momfood.app` purchase?
2. **OTP provider** — Twilio (paid, reliable) vs Saudi SMS gateway (Unifonic) vs Cloudflare's offering?
3. **Voice-first default** — Auto-open mic on landing, or behind a clear opt-in button?
4. **Mom's onboarding** — Manual entry by MAC, or wait until full self-service flow ships?
5. **Payment** — Tap, Moyasar, Mada, STC Pay, or cash-only at launch?

---

## 📝 Repo conventions

- Commit prefix `feat(gift):` → Track A (mom.elfadil.com) changes only
- Commit prefix `feat(zuzu):` → Track B (ZuZu Platform) changes
- Commit prefix `chore:`, `fix:`, `docs:` as usual
- Final commit on big features: include 💚 emoji to mark "for Mom"
- Push to `main` → Cloudflare Pages auto-deploys both frontends from the same build

---

## 💚 Dedication

> *"بُني هذا الموقع بحبٍّ من د. محمد إلى أُمّه الغالية — الله يحفظكِ ويُطيل عُمرَكِ يا يُمّه."*

Every line of code carries this intention. When in doubt about a trade-off, choose the option that makes Mom proud.
