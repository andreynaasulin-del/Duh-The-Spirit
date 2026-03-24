-- ============================================
-- Game States table (JSONB + generated columns)
-- ============================================

CREATE TABLE game_states (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '5.0',

  -- Generated columns for leaderboard queries (no need to parse JSONB)
  cash INTEGER GENERATED ALWAYS AS (COALESCE((state->'kpis'->>'cash')::int, 0)) STORED,
  respect INTEGER GENERATED ALWAYS AS (COALESCE((state->'kpis'->>'respect')::int, 0)) STORED,
  fame INTEGER GENERATED ALWAYS AS (COALESCE((state->'kpis'->>'fame')::int, 0)) STORED,
  day INTEGER GENERATED ALWAYS AS (COALESCE((state->>'day')::int, 1)) STORED,
  subscribers INTEGER GENERATED ALWAYS AS (COALESCE((state->'kpis'->>'subscribers')::int, 0)) STORED,

  last_saved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for leaderboard
CREATE INDEX idx_game_states_respect ON game_states(respect DESC);
CREATE INDEX idx_game_states_fame ON game_states(fame DESC);
CREATE INDEX idx_game_states_cash ON game_states(cash DESC);

-- RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Users can read their own full game state
CREATE POLICY "game_states_select_own"
  ON game_states FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own game state
CREATE POLICY "game_states_insert_own"
  ON game_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own game state
CREATE POLICY "game_states_update_own"
  ON game_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;
