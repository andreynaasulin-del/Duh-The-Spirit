-- ============================================
-- Action Logs (anti-cheat + analytics)
-- ============================================

CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_id TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_action_logs_user ON action_logs(user_id, created_at DESC);
CREATE INDEX idx_action_logs_type ON action_logs(action_type);

-- RLS
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own action logs
CREATE POLICY "action_logs_select_own"
  ON action_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert
CREATE POLICY "action_logs_insert_service"
  ON action_logs FOR INSERT
  WITH CHECK (true);
