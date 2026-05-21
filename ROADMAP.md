# 🚀 لُقْمَة يُمّه — Production Readiness Roadmap

Last updated: 2026-05-21
Latest commit: `2b2ad19`
Phase 1 ✅ (voice orb + ZuZu brain on Workers AI)

---

## ✅ Phase 1 — Done

- [x] D1 (`momfood-zuzu`) provisioned + migrations applied
- [x] R2 (`momfood-uploads`) provisioned
- [x] Pages Functions skeleton (`_middleware`, `_lib`, health)
- [x] Premium voice-orb UI (`ZuzuOrb`, `ZuzuVoiceHero`)
- [x] Voice capture + chat hooks (mic FFT, STT→LLM→TTS pipeline)
- [x] ElevenLabs TTS proxy w/ Jessica voice
- [x] Workers AI integration (Whisper + Llama 3.3-70b primary)
- [x] AI binding wired via API (`PATCH /pages/projects/momfood-app`)
- [x] All bindings verified via `/api/health`
- [x] ZuZu replies live in AR + EN ✅

---

## 🔴 Phase 2 — Voice Loop Hardening (NEXT)

**Goal:** make the conversation feel real — no dead air, no awkward delays.

- [ ] **Real-time STT streaming** — Whisper batch is slow (3-6s); explore
      Workers AI streaming or VAD-based chunking
- [ ] **VAD (Voice Activity Detection)** — auto-stop recording on silence
      (don't make user tap twice)
- [ ] **Barge-in** — user can interrupt ZuZu mid-sentence (stop TTS playback)
- [ ] **TTS streaming** — start playback as bytes arrive (not after full mp3)
- [ ] **Conversation memory in D1** — `zuzu_sessions` + `zuzu_messages`
      tables (already in schema!), wire chat endpoint to persist
- [ ] **Session ID cookie** — anonymous session tracking for unauth users
- [ ] **Tool-calling / function-calling** — Llama 3.3 supports it; let ZuZu
      actually `book_order`, `register_kitchen`, `check_status` via tools
- [ ] **Latency budget**: target <2s from speech-end to first audio byte

---

## 🟠 Phase 3 — Cook Onboarding (Cloud Kitchen Incubator)

- [ ] `/api/cooks/register` — voice-guided wizard (name, city, specialty, phone)
- [ ] Document upload to R2 (`UPLOADS/verifications/{cookId}/...`)
- [ ] D1 `kitchens` + `verifications` row creation
- [ ] OTP via WhatsApp Business (need WhatsApp Cloud API access)
- [ ] Admin review UI at `/admin/queue` (gated by JWT_SIGNING_KEY)
- [ ] Welcome email when approved (Cloudflare Email Routing or Resend)
- [ ] Cook profile page `/cook/:slug` (public)

---

## 🟠 Phase 4 — Menu + Ordering

- [ ] `/api/menu` — list dishes by city, kitchen, dietary tag
- [ ] `/api/orders` POST — create order, calculate fee, return WhatsApp link
- [ ] Order state machine: `created → confirmed → cooking → driver → delivered`
- [ ] Customer order tracking page (no auth, magic-link via SMS)
- [ ] ZuZu can **place orders by voice** (function-calling)
- [ ] Vectorize index for semantic menu search (`@cf/baai/bge-m3` embeddings)

---

## 🟠 Phase 5 — Payments & Wallets

- [ ] Tap / Moyasar / HyperPay integration (Saudi-native gateways)
- [ ] STC Pay / Apple Pay buttons
- [ ] Cook wallet ledger in D1 (`balances`, `payouts` tables)
- [ ] Weekly settlement cron (Cloudflare Cron Triggers)
- [ ] ZAKAT 2.5% optional checkbox at checkout → donations table

---

## 🟠 Phase 6 — Drivers + Logistics

- [ ] `/api/drivers/register` (similar to cooks but lighter KYC)
- [ ] Driver mobile-first dispatch view at `/driver`
- [ ] Pickup/dropoff GPS via browser geolocation API
- [ ] Live order map (Cloudflare Workers + Durable Objects for room state)
- [ ] Distance-based fee calculation

---

## 🟠 Phase 7 — Care Program (برنامج الخير)

- [ ] Sponsored meals catalog (subsidized for students, elders, workers, refugees)
- [ ] Donor flow: choose recipient profile or "pool" → pay → meal vouchers issued
- [ ] Recipient redemption: WhatsApp/SMS code → ZuZu validates → free meal
- [ ] Transparency dashboard: meals delivered, sponsors, recipients (anonymized)

---

## 🔵 Cross-cutting / Tech Debt

### Security
- [ ] Rate limiting on `/api/zuzu/*` (Cloudflare WAF rules or sliding window in D1)
- [ ] Input sanitization (especially file uploads)
- [ ] CSP headers + Subresource Integrity
- [ ] Rotate ElevenLabs key (was exposed in chat earlier)
- [ ] `JWT_SIGNING_KEY` secret (`openssl rand -hex 64`)
- [ ] Bot protection (Turnstile) on registration forms
- [ ] Address 2 moderate dependabot vulnerabilities

### Observability
- [ ] Cloudflare Analytics Engine: log every ZuZu turn (model used, latency, success)
- [ ] Error budget alerts via webhook → Telegram
- [ ] Sentry-like client-side error tracking (or Cloudflare Workers errors)
- [ ] `/api/admin/metrics` dashboard

### Performance
- [ ] Code-split LandingPage sections (Story/Menu lazy-load)
- [ ] Optimize 314KB JS bundle (audit with `vite-bundle-visualizer`)
- [ ] Preload Jessica TTS warm-up on first interaction
- [ ] Image optimization (Cloudflare Images for cook photos)

### i18n / a11y
- [ ] Full RTL polish on every section
- [ ] Captions toggle for hearing-impaired
- [ ] Keyboard navigation for orb (Space = tap-to-talk)
- [ ] `prefers-reduced-motion` honored everywhere
- [ ] Screen-reader labels on all interactive elements

### Legal / Compliance
- [ ] Terms of Service + Privacy Policy (Arabic + English)
- [ ] Cookie consent banner
- [ ] Saudi PDPL compliance review (data residency, consent)
- [ ] Voice-recording disclosure on first orb tap
- [ ] Commercial Registration (سجل تجاري) for the platform entity

### DevOps
- [ ] Preview deployments per PR
- [ ] D1 backup automation (weekly export to R2)
- [ ] Migration tooling: `npm run db:migrate` for ordered application
- [ ] Staging environment at `staging.mom.elfadil.com`
- [ ] CI: typecheck + lint + test on every push (GitHub Actions)

### Documentation
- [ ] `ARCHITECTURE.md` — system overview, data flow
- [ ] `API.md` — endpoint contracts
- [ ] `CONTRIBUTING.md` — local dev setup
- [ ] Move ZuZu personality prompts to versioned files

---

## 📊 Priority Matrix (next 7 days)

| Priority | Task |
|---|---|
| P0 | VAD + barge-in (Phase 2) — current loop is too clunky |
| P0 | Conversation memory persistence to D1 |
| P0 | Tool-calling so ZuZu does real work (not just chat) |
| P1 | Cook onboarding voice flow (Phase 3 start) |
| P1 | Rotate ElevenLabs key + set JWT secret |
| P1 | Rate limiting on `/api/zuzu/*` |
| P2 | Vectorize menu search |
| P2 | Bundle size optimization |

---

## 🎯 Definition of "Production Ready"

ZuZu can do this end-to-end **without human intervention**:

1. Customer opens site → ZuZu greets in their language
2. Customer says "I want kabsa for tonight, 4 people, Riyadh"
3. ZuZu finds 3 nearby kitchens with kabsa → reads top 3 → asks to confirm
4. Customer picks one → ZuZu collects address (or uses geolocation) → reads back total
5. Customer confirms → ZuZu charges (Tap/Moyasar) → SMS receipt
6. Cook gets WhatsApp order → confirms ETA → ZuZu notifies customer
7. Driver gets dispatch → picks up → delivers
8. Customer rates → ZuZu thanks them by name

Phase 1 gave us step 1. Steps 2-8 = the remaining roadmap.
