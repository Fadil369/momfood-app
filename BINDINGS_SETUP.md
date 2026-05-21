# Cloudflare Pages — Bindings Setup for momfood-app

> **One-time manual step.** Pages projects deployed from Git don't read
> bindings from `wrangler.toml`. You must add them via Dashboard.

## Where

Dashboard → **Workers & Pages** → **momfood-app** → **Settings** → **Functions**

Then scroll to each section below and click **Add binding**.
**Important:** for each binding, set it under **BOTH** Production AND Preview
(or at least Production). Save → trigger a redeploy (push a no-op commit or
hit "Retry deployment").

---

## 1. Workers AI binding ⭐ (most important for ZuZu)

Section: **Workers AI bindings**

| Field | Value |
|---|---|
| Variable name | `AI` |

Save.

This unlocks:
- `/api/zuzu/stt`  — Whisper STT
- `/api/zuzu/chat` — Llama LLM brain

---

## 2. D1 database binding

Section: **D1 database bindings**

| Field | Value |
|---|---|
| Variable name | `DB` |
| D1 database | `momfood-zuzu` |

---

## 3. R2 bucket binding

Section: **R2 bucket bindings**

| Field | Value |
|---|---|
| Variable name | `UPLOADS` |
| R2 bucket | `momfood-uploads` |

---

## 4. Verify

After bindings are saved AND a redeploy completes (~60s), hit:

```
curl https://mom.elfadil.com/api/health | jq
```

Expected:

```json
{
  "ok": true,
  "data": {
    "d1": "connected",
    "r2": "connected",
    "ai": "bound",
    "secrets": { "elevenlabs": "configured", ... },
    "ai_models": {
      "stt": "@cf/openai/whisper-large-v3-turbo",
      "llm_primary": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "llm_fallback": "@cf/meta/llama-3.1-8b-instruct"
    }
  }
}
```

If any binding shows `unbound` or `error: ...` — recheck dashboard.

---

## 5. Test ZuZu's full voice loop

1. Open `https://mom.elfadil.com`
2. Tap mute button → unmute → ZuZu greets
3. Tap orb → speak in Arabic → orb listens (blue + bars)
4. Tap orb again → orb spins gold (thinking)
5. ZuZu replies in your language → orb pulses rose

---

## Why not automated?

- The Cloudflare Pages REST API doesn't expose a stable
  "add binding" endpoint (it's part of the project config blob
  that's wrangler-internal).
- `wrangler pages project edit` does not exist.
- `wrangler pages deploy` would let us push bindings BUT only if we
  abandon Git-connected auto-deploy.
- So: one-time dashboard click is the cleanest path.
