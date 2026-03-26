'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { useGameStore } from '@/stores/game-store';
import {
  DAILY_REWARDS, getRewardForStreak, getTodayDate, canClaimToday, isStreakAlive,
} from '@/config/daily-rewards';

export function DailyRewardPopup() {
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const daily = useGameStore((s) => s.state.daily);

  useEffect(() => {
    const today = getTodayDate();

    // Check multiple storage methods — TG Mini App can clear localStorage
    const localClaim = localStorage.getItem('duh_last_claim');
    const cookieClaim = document.cookie.split(';').find(c => c.trim().startsWith('duh_claim='))?.split('=')[1];

    if (localClaim === today || cookieClaim === today) return;
    if (daily && !canClaimToday(daily.lastClaimDate)) return;

    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, [daily]);

  if (!daily) return null;

  const streakAlive = isStreakAlive(daily.lastClaimDate);
  const currentStreak = streakAlive ? daily.streak + 1 : 1;
  const reward = getRewardForStreak(currentStreak);

  const claim = () => {
    const store = useGameStore.getState();

    // Apply rewards
    if (reward.rewards.cash) store.updateKPI('cash', reward.rewards.cash);
    if (reward.rewards.respect) store.updateKPI('respect', reward.rewards.respect);
    if (reward.rewards.fame) store.updateKPI('fame', reward.rewards.fame);
    if (reward.rewards.energy) store.updateStat('energy', reward.rewards.energy);
    if (reward.rewards.stability) store.updateStat('stability', reward.rewards.stability);

    // Update daily state
    store.setState({
      ...store.state,
      daily: {
        lastClaimDate: getTodayDate(),
        streak: streakAlive ? daily.streak + 1 : 1,
        totalLogins: (daily.totalLogins || 0) + 1,
      },
    });

    // Persist to localStorage + cookie to survive TG Mini App reloads
    const today = getTodayDate();
    localStorage.setItem('duh_last_claim', today);
    document.cookie = `duh_claim=${today};path=/;max-age=86400;SameSite=Lax`;

    store.addLog(`Ежедневная награда: День ${currentStreak}`, 'good');
    setClaimed(true);
    setTimeout(() => setShow(false), 2000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99998 }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="w-full max-w-sm p-5 space-y-4"
            style={{
              background: '#0d0d0d',
              border: '2px solid rgba(255,215,0,0.4)',
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(255,215,0,0.15)',
            }}
          >
            {/* Close */}
            <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-text-muted">
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center">
              <Gift className="w-8 h-8 mx-auto mb-2" style={{ color: '#ffd700' }} />
              <h2 className="text-lg font-black tracking-wider" style={{ color: '#ffd700' }}>
                ЕЖЕДНЕВНАЯ НАГРАДА
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Серия: {currentStreak} {currentStreak === 1 ? 'день' : currentStreak < 5 ? 'дня' : 'дней'}
              </p>
            </div>

            {/* 7-day calendar */}
            <div className="grid grid-cols-7 gap-1">
              {DAILY_REWARDS.map((r) => {
                const isPast = r.day < currentStreak;
                const isCurrent = r.day === currentStreak;
                const isFuture = r.day > currentStreak;

                return (
                  <div
                    key={r.day}
                    className="flex flex-col items-center py-2 rounded-lg"
                    style={{
                      backgroundColor: isCurrent
                        ? 'rgba(255,215,0,0.15)'
                        : isPast
                        ? 'rgba(0,255,136,0.08)'
                        : 'rgba(255,255,255,0.03)',
                      border: isCurrent ? '1px solid rgba(255,215,0,0.5)' : '1px solid transparent',
                    }}
                  >
                    <span className="text-sm">{r.icon}</span>
                    <span className="text-[8px] text-text-muted mt-0.5">
                      {isPast ? '✓' : r.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current reward */}
            <div
              className="p-3 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}
            >
              <span className="text-2xl">{reward.icon}</span>
              <div className="flex gap-2 justify-center mt-2 flex-wrap">
                {reward.rewards.cash && (
                  <span className="text-xs font-bold text-neon-green">+{reward.rewards.cash}₽</span>
                )}
                {reward.rewards.energy && (
                  <span className="text-xs font-bold text-yellow-400">+{reward.rewards.energy} ⚡</span>
                )}
                {reward.rewards.stability && (
                  <span className="text-xs font-bold text-cyan-400">+{reward.rewards.stability} 🧠</span>
                )}
                {reward.rewards.respect && (
                  <span className="text-xs font-bold text-orange-400">+{reward.rewards.respect} 👊</span>
                )}
                {reward.rewards.fame && (
                  <span className="text-xs font-bold text-purple-400">+{reward.rewards.fame} ⭐</span>
                )}
              </div>
            </div>

            {/* Claim button */}
            {!claimed ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={claim}
                className="w-full py-3 font-bold text-sm tracking-wider text-black rounded-xl"
                style={{ backgroundColor: '#ffd700' }}
              >
                ЗАБРАТЬ
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center py-3"
              >
                <p className="text-sm font-bold" style={{ color: '#00ff88' }}>✅ Получено!</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
