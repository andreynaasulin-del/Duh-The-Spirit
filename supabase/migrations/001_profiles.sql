-- ============================================
-- Profiles table (linked to Supabase Auth)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  telegram_first_name TEXT,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id) WHERE telegram_id IS NOT NULL;
CREATE INDEX idx_profiles_username ON profiles(username);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert on signup (via API route)
CREATE POLICY "profiles_insert_service"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Public can read username for leaderboard
CREATE POLICY "profiles_select_public_username"
  ON profiles FOR SELECT
  USING (true);
