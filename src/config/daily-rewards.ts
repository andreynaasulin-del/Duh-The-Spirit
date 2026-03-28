/**
 * Daily Rewards — 7-day cycle, then repeats
 * Streak bonuses increase rewards
 */

export interface DailyReward {
  day: number; // 1-7
  icon: string;
  title: string;
  rewards: {
    cash?: number;
    energy?: number;
    stability?: number;
    respect?: number;
    fame?: number;
  };
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, icon: '💰', title: 'День 1', rewards: { cash: 500 } },
  { day: 2, icon: '⚡', title: 'День 2', rewards: { cash: 500, energy: 30 } },
  { day: 3, icon: '🧠', title: 'День 3', rewards: { cash: 800, stability: 15 } },
  { day: 4, icon: '🔥', title: 'День 4', rewards: { cash: 800, respect: 5 } },
  { day: 5, icon: '⭐', title: 'День 5', rewards: { cash: 1200, fame: 5 } },
  { day: 6, icon: '💎', title: 'День 6', rewards: { cash: 1500, energy: 40, stability: 20 } },
  { day: 7, icon: '👑', title: 'День 7', rewards: { cash: 3000, respect: 5, fame: 5, energy: 50 } },
];

export function getRewardForStreak(streak: number): DailyReward {
  const dayIndex = ((streak - 1) % 7);
  return DAILY_REWARDS[dayIndex];
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function canClaimToday(lastClaimDate: string): boolean {
  return lastClaimDate !== getTodayDate();
}

export function isStreakAlive(lastClaimDate: string): boolean {
  if (!lastClaimDate) return false;
  const last = new Date(lastClaimDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < 2; // Must login within 48h to keep streak
}
