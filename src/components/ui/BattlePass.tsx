'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useGameStore, useKPIs } from '@/stores/game-store';

interface BPTier {
  level: number;
  xpRequired: number;
  freeReward: { icon: string; label: string; value: string };
  premiumReward: { icon: string; label: string; value: string };
}

const BATTLE_PASS_TIERS: BPTier[] = [
  { level: 1, xpRequired: 0, freeReward: { icon: '💰', label: 'Кэш', value: '+500₽' }, premiumReward: { icon: '⚡', label: 'Энергетик', value: '+50 энергии' } },
  { level: 2, xpRequired: 100, freeReward: { icon: '🧠', label: 'Стабильность', value: '+10' }, premiumReward: { icon: '🎵', label: 'Эксклюзивный бит', value: '+5 славы' } },
  { level: 3, xpRequired: 250, freeReward: { icon: '💰', label: 'Кэш', value: '+1000₽' }, premiumReward: { icon: '👊', label: 'Респект', value: '+10' } },
  { level: 4, xpRequired: 450, freeReward: { icon: '⚡', label: 'Энергия', value: '+30' }, premiumReward: { icon: '💎', label: 'Полное восстановление', value: 'HP/EN макс' } },
  { level: 5, xpRequired: 700, freeReward: { icon: '💰', label: 'Кэш', value: '+2000₽' }, premiumReward: { icon: '👑', label: 'Скин Духа', value: 'Золотой Дух' } },
  { level: 6, xpRequired: 1000, freeReward: { icon: '🧠', label: 'Стабильность', value: '+20' }, premiumReward: { icon: '🔥', label: 'Бонус XP', value: 'x2 на 24ч' } },
  { level: 7, xpRequired: 1400, freeReward: { icon: '💰', label: 'Кэш', value: '+3000₽' }, premiumReward: { icon: '⭐', label: 'Слава', value: '+20' } },
  { level: 8, xpRequired: 1900, freeReward: { icon: '⚡', label: 'Энергия', value: '+50' }, premiumReward: { icon: '🎤', label: 'Авто-релиз', value: '+1 релиз' } },
  { level: 9, xpRequired: 2500, freeReward: { icon: '💰', label: 'Кэш', value: '+5000₽' }, premiumReward: { icon: '💀', label: 'Скин района', value: 'Неон' } },
  { level: 10, xpRequired: 3200, freeReward: { icon: '👑', label: 'Титул', value: 'Выживший' }, premiumReward: { icon: '🏆', label: 'Титул', value: 'Легенда района' } },
];

export function BattlePass() {
  const [expanded, setExpanded] = useState(false);
  const kpis = useKPIs();
  const day = useGameStore((s) => s.state.day);
  const quests = useGameStore((s) => s.state.quests);

  // XP = actions done (approximated by day + completed quests)
  const xp = (day - 1) * 10 + quests.completed.length * 50;
  const isPremium = false; // Will be purchasable via Stars

  // Find current level
  let currentLevel = 1;
  for (const tier of BATTLE_PASS_TIERS) {
    if (xp >= tier.xpRequired) currentLevel = tier.level;
  }
  const currentTier = BATTLE_PASS_TIERS[currentLevel - 1];
  const nextTier = BATTLE_PASS_TIERS[currentLevel] || null;
  const progressToNext = nextTier
    ? ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100
    : 100;

  return (
    <div className="space-y-3">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full">
        <Zap className="w-3.5 h-3.5" style={{ color: '#ff2d7b' }} />
        <h2 className="manga-label flex-1 text-left">
          BATTLE PASS <span className="text-[9px] text-text-muted">Сезон 1</span>
        </h2>
        <span className="text-[10px] font-mono" style={{ color: '#ff2d7b' }}>LVL {currentLevel}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
      </button>

      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 overflow-hidden">
          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-[9px] text-text-muted mb-1">
              <span>{xp} XP</span>
              <span>{nextTier ? `${nextTier.xpRequired} XP` : 'МАКС'}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressToNext}%`, backgroundColor: '#ff2d7b' }} />
            </div>
          </div>

          {/* Premium upsell */}
          {!isPremium && (
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'rgba(255,45,123,0.08)', border: '1px solid rgba(255,45,123,0.3)' }}>
              <p className="text-xs font-bold" style={{ color: '#ff2d7b' }}>⭐ PREMIUM PASS — 200 Stars</p>
              <p className="text-[10px] text-text-muted mt-1">Разблокируй эксклюзивные награды каждого уровня</p>
            </div>
          )}

          {/* Tiers */}
          <div className="space-y-1">
            {BATTLE_PASS_TIERS.map((tier) => {
              const unlocked = xp >= tier.xpRequired;
              return (
                <div
                  key={tier.level}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: tier.level === currentLevel ? 'rgba(255,45,123,0.08)' : 'transparent',
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  {/* Level */}
                  <span className="text-[10px] font-bold w-5 text-center" style={{ color: unlocked ? '#ff2d7b' : 'var(--color-text-muted)' }}>
                    {tier.level}
                  </span>

                  {/* Free reward */}
                  <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-sm">{tier.freeReward.icon}</span>
                    <span className="text-[9px] text-text-secondary">{tier.freeReward.value}</span>
                    {unlocked && <span className="text-[8px] text-neon-green ml-auto">✓</span>}
                  </div>

                  {/* Premium reward */}
                  <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: isPremium ? 'rgba(255,45,123,0.05)' : 'rgba(255,255,255,0.02)' }}>
                    {isPremium ? (
                      <>
                        <span className="text-sm">{tier.premiumReward.icon}</span>
                        <span className="text-[9px]" style={{ color: '#ff2d7b' }}>{tier.premiumReward.value}</span>
                        {unlocked && <span className="text-[8px] text-neon-green ml-auto">✓</span>}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-text-muted" />
                        <span className="text-[9px] text-text-muted">Premium</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
