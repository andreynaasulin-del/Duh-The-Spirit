-- ============================================
-- Leaderboard View (public, read-only)
-- ============================================

CREATE VIEW leaderboard AS
SELECT
  p.username,
  p.telegram_username,
  gs.cash,
  gs.respect,
  gs.fame,
  gs.subscribers,
  gs.day,
  gs.last_saved_at
FROM game_states gs
JOIN profiles p ON gs.user_id = p.id
ORDER BY gs.respect DESC;
