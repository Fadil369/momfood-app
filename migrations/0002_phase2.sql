-- 0002_phase2.sql — Phase 2: leads, rate limiting, tool-call traces
-- Run with: wrangler d1 execute momfood-zuzu --remote --file migrations/0002_phase2.sql

-- ─── Kitchen leads (voice-driven onboarding intake) ────────────────────────
-- Captured by ZuZu when a user expresses intent to register as a cook.
-- Full KYC happens later via /api/cooks/register; this is the doorway.
CREATE TABLE IF NOT EXISTS kitchen_leads (
  id           TEXT PRIMARY KEY,
  session_id   TEXT,
  name         TEXT NOT NULL,
  phone        TEXT,
  city         TEXT,
  specialty    TEXT,                                  -- "كبسة، مندي، حلويات..."
  notes        TEXT,                                  -- free-form from ZuZu
  source       TEXT NOT NULL DEFAULT 'voice' CHECK (source IN ('voice','form','referral')),
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','onboarded','rejected')),
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES zuzu_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_kitchen_leads_phone ON kitchen_leads(phone);
CREATE INDEX IF NOT EXISTS idx_kitchen_leads_status ON kitchen_leads(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_leads_created ON kitchen_leads(created_at);

-- ─── Order intents (pre-payment intent capture) ────────────────────────────
-- ZuZu can capture "I want X for Y people in Z city" before full ordering
-- is wired in Phase 4. This becomes a callable WhatsApp lead.
CREATE TABLE IF NOT EXISTS order_intents (
  id           TEXT PRIMARY KEY,
  session_id   TEXT,
  dish         TEXT NOT NULL,
  servings     INTEGER,
  city         TEXT,
  phone        TEXT,
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','contacted','fulfilled','cancelled')),
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES zuzu_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_order_intents_status ON order_intents(status);
CREATE INDEX IF NOT EXISTS idx_order_intents_phone ON order_intents(phone);

-- ─── Callbacks (ZuZu queue: "have us call you") ────────────────────────────
CREATE TABLE IF NOT EXISTS callbacks (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  name        TEXT,
  phone       TEXT NOT NULL,
  reason      TEXT,
  preferred_window TEXT,                              -- "morning", "after asr", etc.
  status      TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','done','dropped')),
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES zuzu_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_callbacks_status ON callbacks(status);

-- ─── Rate limiting (sliding window counters in D1) ─────────────────────────
-- Keyed by ip+route bucket. Cleaned by occasional sweep.
CREATE TABLE IF NOT EXISTS rate_limits (
  key         TEXT NOT NULL,                          -- "{ip}:{route}"
  window_start INTEGER NOT NULL,                      -- unix epoch seconds (bucket)
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- ─── Tool call traces (observability for ZuZu's function-calling) ──────────
CREATE TABLE IF NOT EXISTS tool_calls (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  message_id  TEXT,
  tool_name   TEXT NOT NULL,
  arguments   TEXT NOT NULL,                          -- JSON
  result      TEXT,                                   -- JSON (or error)
  success     INTEGER NOT NULL DEFAULT 1,
  latency_ms  INTEGER,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES zuzu_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_tool_calls_session ON tool_calls(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_tool ON tool_calls(tool_name);

-- ─── Seed: a couple of demo kitchens so the orb has something to suggest ──
INSERT OR IGNORE INTO users (id, phone, full_name, country, verification_status, preferred_lang)
VALUES
  ('demo-cook-001', '+966501111111', 'أم خالد', 'SA', 'verified', 'ar'),
  ('demo-cook-002', '+966502222222', 'أم محمد', 'SA', 'verified', 'ar'),
  ('demo-cook-003', '+966503333333', 'أم نورة', 'SA', 'verified', 'ar');

INSERT OR IGNORE INTO user_roles (user_id, role) VALUES
  ('demo-cook-001', 'cook'),
  ('demo-cook-002', 'cook'),
  ('demo-cook-003', 'cook');

INSERT OR IGNORE INTO kitchens (id, cook_id, name_ar, name_en, slug, description_ar, city, country, phone, whatsapp, is_active)
VALUES
  ('k-demo-001', 'demo-cook-001', 'مطبخ أم خالد', 'Umm Khaled Kitchen', 'umm-khaled', 'أصالة نجدية من الملقا', 'الرياض', 'SA', '+966501111111', '+966501111111', 1),
  ('k-demo-002', 'demo-cook-002', 'مطبخ أم محمد', 'Umm Mohammed Kitchen', 'umm-mohammed', 'لمسة حجازية أصيلة', 'جدة', 'SA', '+966502222222', '+966502222222', 1),
  ('k-demo-003', 'demo-cook-003', 'مطبخ أم نورة', 'Umm Noura Kitchen', 'umm-noura', 'حلويات بيتية دافية', 'الرياض', 'SA', '+966503333333', '+966503333333', 1);

INSERT OR IGNORE INTO menu_items (id, kitchen_id, name_ar, name_en, description_ar, price_sar, category, emoji, is_available, display_order)
VALUES
  ('m-001', 'k-demo-001', 'كبسة لحم', 'Lamb Kabsa', 'كبسة لحم على الطريقة النجدية، تكفي 4 أشخاص', 95.00, 'mains', '🍛', 1, 1),
  ('m-002', 'k-demo-001', 'مندي دجاج', 'Chicken Mandi', 'مندي دجاج فحم، تكفي 3 أشخاص', 70.00, 'mains', '🍗', 1, 2),
  ('m-003', 'k-demo-002', 'مفطح حجازي', 'Hijazi Mafte7', 'مفطح بالطريقة الحجازية الأصيلة', 180.00, 'mains', '🐑', 1, 1),
  ('m-004', 'k-demo-002', 'سليق', 'Saleeg', 'سليق حجازي بالدجاج', 85.00, 'mains', '🍚', 1, 2),
  ('m-005', 'k-demo-003', 'معصوب', 'Maasoub', 'معصوب موز بالقشطة والعسل', 35.00, 'desserts', '🍯', 1, 1),
  ('m-006', 'k-demo-003', 'كنافة', 'Kunafa', 'كنافة بالجبن مع قطر طازج', 45.00, 'desserts', '🥞', 1, 2);
