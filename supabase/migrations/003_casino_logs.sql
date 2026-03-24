-- ============================================
-- Casino Logs (provably fair audit trail)
-- ============================================

CREATE TABLE casino_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('slots', 'dice', 'blackjack', 'crash', 'roulette', 'thimbles')),
  bet INTEGER NOT NULL CHECK (bet > 0),
  result JSONB NOT NULL,
  payout INTEGER NOT NULL DEFAULT 0 CHECK (payout >= 0),
  server_seed TEXT NOT NULL,
  client_seed TEXT,
  nonce INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_casino_logs_user ON casino_logs(user_id, created_at DESC);
CREATE INDEX idx_casino_logs_game_type ON casino_logs(game_type);

-- RLS
ALTER TABLE casino_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own casino logs (verify fairness)
CREATE POLICY "casino_logs_select_own"
  ON casino_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (API routes)
CREATE POLICY "casino_logs_insert_service"
  ON casino_logs FOR INSERT
  WITH CHECK (true);
