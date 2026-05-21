-- لُقمة يُمّه + ZuZu Platform — D1 schema (Phase 0)
-- Apply with: wrangler d1 migrations apply momfood-zuzu
--
-- Conventions:
--   * All IDs are TEXT UUIDs (generated app-side or via lower(hex(randomblob(16))))
--   * Timestamps are TEXT ISO-8601 (CURRENT_TIMESTAMP gives 'YYYY-MM-DD HH:MM:SS')
--   * Soft-delete via deleted_at where applicable
--   * Government IDs are NEVER stored raw — only sha256(id_number || id_type) in id_hash

-- ─── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  phone               TEXT NOT NULL UNIQUE,         -- E.164 (+966xxxxxxxxx or +249xxxxxxxxx)
  email               TEXT UNIQUE,                  -- optional, used as Gravatar key
  full_name           TEXT NOT NULL,
  country             TEXT NOT NULL CHECK (country IN ('SA', 'SD')),
  id_type             TEXT CHECK (id_type IN ('sudan_national_card', 'passport', 'saudi_iqama', 'saudi_national')),
  id_hash             TEXT,                         -- sha256(id_number || id_type), nullable until verified
  verification_status TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  gravatar_url        TEXT,                         -- cached avatar URL
  preferred_lang      TEXT NOT NULL DEFAULT 'ar' CHECK (preferred_lang IN ('ar', 'en')),
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at          TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_status);

-- ─── ROLES (many-to-many: a user can be cook + driver + customer) ──────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('customer', 'cook', 'driver', 'admin')),
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SOCIAL SAFETY-NET PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_profiles (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  category          TEXT NOT NULL CHECK (category IN
                       ('student', 'elder', 'daily_worker', 'refugee',
                        'newly_married', 'doctor', 'nurse')),
  eligibility_json  TEXT NOT NULL DEFAULT '{}',     -- form answers as JSON
  supporting_docs   TEXT NOT NULL DEFAULT '[]',     -- JSON array of R2 keys
  verified          INTEGER NOT NULL DEFAULT 0,     -- 0/1
  verified_by       TEXT,                            -- admin user_id
  verified_at       TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_social_user ON social_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_category ON social_profiles(category);

-- ─── KITCHENS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kitchens (
  id              TEXT PRIMARY KEY,
  cook_id         TEXT NOT NULL,
  name_ar         TEXT NOT NULL,
  name_en         TEXT,
  slug            TEXT NOT NULL UNIQUE,
  description_ar  TEXT,
  description_en  TEXT,
  city            TEXT NOT NULL,
  country         TEXT NOT NULL CHECK (country IN ('SA', 'SD')),
  lat             REAL,
  lng             REAL,
  phone           TEXT,
  whatsapp        TEXT,
  hours_json      TEXT NOT NULL DEFAULT '{}',
  is_active       INTEGER NOT NULL DEFAULT 1,
  is_subsidised   INTEGER NOT NULL DEFAULT 0,       -- accepts social safety-net orders
  cover_image     TEXT,                              -- R2 key
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cook_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_kitchens_cook ON kitchens(cook_id);
CREATE INDEX IF NOT EXISTS idx_kitchens_city ON kitchens(city);

-- ─── MENU ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            TEXT PRIMARY KEY,
  kitchen_id    TEXT NOT NULL,
  name_ar       TEXT NOT NULL,
  name_en       TEXT,
  description_ar TEXT,
  description_en TEXT,
  price_sar     REAL NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('mains', 'salads', 'extras', 'desserts', 'drinks')),
  emoji         TEXT,
  image         TEXT,                                -- R2 key
  is_available  INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitchen_id) REFERENCES kitchens(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_menu_kitchen ON menu_items(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);

-- ─── ORDERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,
  kitchen_id      TEXT NOT NULL,
  driver_id       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','preparing','ready',
                                      'out_for_delivery','delivered','cancelled')),
  subtotal_sar    REAL NOT NULL DEFAULT 0,
  discount_sar    REAL NOT NULL DEFAULT 0,
  delivery_sar    REAL NOT NULL DEFAULT 0,
  total_sar       REAL NOT NULL DEFAULT 0,
  is_subsidised   INTEGER NOT NULL DEFAULT 0,
  social_profile_id TEXT,                            -- if subsidised
  delivery_address TEXT,
  delivery_lat    REAL,
  delivery_lng    REAL,
  notes           TEXT,
  placed_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at    TEXT,
  FOREIGN KEY (customer_id)       REFERENCES users(id),
  FOREIGN KEY (kitchen_id)        REFERENCES kitchens(id),
  FOREIGN KEY (driver_id)         REFERENCES users(id),
  FOREIGN KEY (social_profile_id) REFERENCES social_profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_kitchen ON orders(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,
  qty          INTEGER NOT NULL DEFAULT 1,
  unit_price   REAL NOT NULL,
  notes        TEXT,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── VERIFICATION RECORDS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('government_id', 'social_category', 'phone_otp')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  evidence_r2  TEXT,                                 -- JSON array of R2 keys (purged after decision)
  reviewer_id  TEXT,
  reviewer_note TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at   TEXT,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);

-- ─── PARTNER API KEYS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL,                       -- user_id of partner
  name         TEXT NOT NULL,                       -- friendly label, e.g., "Hospital A Integration"
  key_prefix   TEXT NOT NULL,                       -- visible prefix, e.g., "zu_live_abc"
  key_hash     TEXT NOT NULL UNIQUE,                -- sha256 of full key
  scopes       TEXT NOT NULL DEFAULT '[]',          -- JSON array
  rate_limit_per_min INTEGER NOT NULL DEFAULT 60,
  is_active    INTEGER NOT NULL DEFAULT 1,
  last_used_at TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at   TEXT,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- ─── ZUZU CONVERSATIONS (voice/chat history) ────────────────────────────────
CREATE TABLE IF NOT EXISTS zuzu_sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,                                  -- nullable: anonymous sessions allowed pre-OTP
  language    TEXT NOT NULL DEFAULT 'ar',
  channel     TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web','pwa','telegram','whatsapp')),
  started_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS zuzu_messages (
  id         TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant','tool','system')),
  content    TEXT NOT NULL,                          -- text or JSON for tool calls
  audio_r2   TEXT,                                   -- R2 key if voice
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES zuzu_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_zuzu_messages_session ON zuzu_messages(session_id);
