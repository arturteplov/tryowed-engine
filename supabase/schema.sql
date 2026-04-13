-- =====================================================================
-- OWED APP — FULL DATABASE SCHEMA v2
-- Paste into Supabase SQL Editor to create all tables.
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- =====================================================================

-- ─── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   TEXT UNIQUE NOT NULL,
  first_name              TEXT,
  last_name               TEXT,
  date_of_birth           DATE,
  state                   TEXT,
  income_range            TEXT,
  filing_status           TEXT,
  has_children            BOOLEAN DEFAULT false,
  num_children            INTEGER DEFAULT 0,
  children_ages           TEXT[],
  living_situation        TEXT,
  has_disability          BOOLEAN DEFAULT false,
  is_caregiver            BOOLEAN DEFAULT false,
  employment_type         TEXT,
  has_post_secondary      BOOLEAN DEFAULT false,
  worked_from_home        BOOLEAN DEFAULT false,
  filed_taxes_all_years   BOOLEAN,
  missed_tax_years        TEXT[],
  life_events             TEXT[],
  -- Added in v2:
  ssn_encrypted           TEXT,
  current_address         JSONB,
  previous_addresses      JSONB[],
  stripe_customer_id      TEXT,
  stripe_payment_method_id TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ─── benefits (core IP) ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS benefits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE,
  category            TEXT NOT NULL,
  jurisdiction        TEXT NOT NULL,
  description         TEXT,
  short_description   TEXT,
  avg_claim_amount    DECIMAL,
  min_claim_amount    DECIMAL,
  max_claim_amount    DECIMAL,
  eligibility_rules   JSONB NOT NULL DEFAULT '{}',
  filing_method       TEXT,
  filing_url          TEXT,
  required_documents  TEXT[],
  processing_time     TEXT,
  source_url          TEXT,
  is_active           BOOLEAN DEFAULT true,
  last_verified       DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── matches ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS matches (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id              UUID REFERENCES profiles(id) ON DELETE CASCADE,
  benefit_id              UUID REFERENCES benefits(id),
  estimated_amount        DECIMAL,
  confidence              TEXT,
  status                  TEXT DEFAULT 'identified',
  actual_amount           DECIMAL,
  filed_at                TIMESTAMPTZ,
  approved_at             TIMESTAMPTZ,
  paid_at                 TIMESTAMPTZ,
  notes                   TEXT,
  -- Added in v2:
  user_confirmed_receipt  BOOLEAN DEFAULT false,
  user_confirmed_at       TIMESTAMPTZ,
  fee_charged             BOOLEAN DEFAULT false,
  fee_charge_id           TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, benefit_id)
);

-- ─── payments ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id            UUID REFERENCES matches(id),
  amount_recovered    DECIMAL,
  fee_percentage      DECIMAL DEFAULT 0.20,
  fee_amount          DECIMAL,
  stripe_payment_id   TEXT,
  status              TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── priority_filings ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS priority_filings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id   TEXT,
  amount              DECIMAL DEFAULT 29.00,
  status              TEXT DEFAULT 'paid',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── documents ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type   TEXT,    -- 'photo_id' | 'tax_return' | 'w2' | 'other'
  file_path       TEXT,    -- Supabase Storage path
  file_name       TEXT,
  uploaded_at     TIMESTAMPTZ DEFAULT now()
);

-- ─── cpa_referrals ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cpa_referrals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cpa_partner_name    TEXT,
  cpa_partner_email   TEXT,
  unfiled_years       TEXT[],
  status              TEXT DEFAULT 'referred',
  -- status values: referred | contacted | filed | fee_received
  referral_fee        DECIMAL,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── audit_reports ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id   TEXT,
  amount              DECIMAL DEFAULT 24.00,
  report_url          TEXT,    -- path to generated PDF in Supabase Storage
  generated_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── subscriptions (ClaimWatch) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id              UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type                    TEXT DEFAULT 'claimwatch',
  stripe_subscription_id  TEXT,
  stripe_customer_id      TEXT,
  status                  TEXT DEFAULT 'active',
  -- status values: active | cancelled | past_due
  price_monthly           DECIMAL DEFAULT 7.99,
  started_at              TIMESTAMPTZ DEFAULT now(),
  cancelled_at            TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ
);

-- ─── settlements (class action database) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  defendant       TEXT,
  description     TEXT,
  min_payout      DECIMAL,
  max_payout      DECIMAL,
  deadline        DATE,
  filing_url      TEXT,
  proof_required  TEXT,
  categories      TEXT[],
  status          TEXT DEFAULT 'open',
  source_url      TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── property_searches ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_searches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  state           TEXT,
  source          TEXT,
  results_found   INTEGER DEFAULT 0,
  results_json    JSONB,
  searched_at     TIMESTAMPTZ DEFAULT now()
);

-- ─── waitlist ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email           TEXT UNIQUE,
  full_name       TEXT,
  total_estimated DECIMAL,
  num_matches     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_filings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpa_referrals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist          ENABLE ROW LEVEL SECURITY;

-- ─── Indexes for performance ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_matches_profile_id    ON matches(profile_id);
CREATE INDEX IF NOT EXISTS idx_matches_status        ON matches(status);
CREATE INDEX IF NOT EXISTS idx_payments_profile_id   ON payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_cpa_referrals_status  ON cpa_referrals(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_documents_profile_id  ON documents(profile_id);

-- ─── contact_messages ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  email       TEXT,
  subject     TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'new',  -- new | read | replied
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_cpa_referrals_updated_at
  BEFORE UPDATE ON cpa_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
