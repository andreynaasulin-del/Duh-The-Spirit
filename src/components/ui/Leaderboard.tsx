'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore, useKPIs } from '@/stores/game-store';

type LeaderboardTab = 'respect' | 'fame' | 'cash' | 'streak';

interface LeaderEntry {
  rank: number;
  name: string;
  value: number;
  isPlayer?: boolean;
}

// Mock leaderboard with NPC entries + player
function generateLeaderboard(tab: LeaderboardTab, playerValue: number): LeaderEntry[] {
  const npcNames: Record<string, string[]> = {
    respect: ['Зэф', 'Шило', 'Крест', 'Дэнни', 'Бомба', 'Фокс', 'Рэй', 'Кислый', 'Тень', 'Гроза'],
    fame: ['MC Призрак', 'Lil Район', 'DJ Тьма', 'Бит Мастер', 'Голос Дна', 'Эхо', 'Ноктюрн', 'Флоу Кинг', 'Басс', 'Вирус'],
    cash: ['Алхимик', 'Банкир', 'Скрудж', 'Крипто', 'Золото', 'Сейф', 'Бакс', 'Касса', 'Монета', 'Профит'],
    streak: ['Волк', 'Фанат', 'Шторм', 'Бессонный', 'Грайндер', 'Маньяк', 'Робот', 'Железо', 'Танк', 'Легион'],
  };

  const ranges: Record<string, [number, number]> = {
    respect: [5, 200],
    fame: [3, 150],
    cash: [1000, 50000],
    streak: [1, 30],
  };

  const [min, max] = ranges[tab];
  const names = npcNames[tab];

  // Generate NPC scores
  const entries: LeaderEntry[] = names.map((name, i) => ({
    rank: 0,
    name,
    value: Math.floor(max - (max - min) * (i / names.length) * (0.7 + Math.random() * 0.3)),
  }));

  // Add player
  entries.push({ rank: 0, name: 'ТЫ', value: playerValue, isPlayer: true });

  // Sort and rank
  entries.sort((a, b) => b.value - a.value);
  entries.forEach((e, i) => { e.rank = i + 1; });

  return entries;
}

const TABS: { id: LeaderboardTab; label: string; icon: string }[] = [
  { id: 'respect', label: 'Респект', icon: '👊' },
  { id: 'fame', label: 'Слава', icon: '⭐' },
  { id: 'cash', label: 'Кэш', icon: '💰' },
  { id: 'streak', label: 'Серия', icon: '🔥' },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="text-[10px] font-mono text-text-muted w-4 text-center">{rank}</span>;
}

export function Leaderboard() {
  const [tab, setTab] = useState<LeaderboardTab>('respect');
  const [expanded, setExpanded] = useState(false);
  const kpis = useKPIs();
  const daily = useGameStore((s) => s.state.daily);

  const playerValues: Record<LeaderboardTab, number> = {
    respect: kpis.respect,
    fame: kpis.fame,
    cash: kpis.cash,
    streak: daily?.streak || 0,
  };

  const entries = generateLeaderboard(tab, playerValues[tab]);
  const playerEntry = entries.find(e => e.isPlayer);

  return (
    <div className="space-y-3">
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full">
        <Trophy className="w-3.5 h-3.5" style={{ color: '#ffd700' }} />
        <h2 className="manga-label flex-1 text-left">
          ЛИДЕРБОРД {playerEntry ? `(#${playerEntry.rank})` : ''}
        </h2>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
      </button>

      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-1.5 text-center text-[10px] font-bold tracking-wider rounded-lg transition-colors"
                style={{
                  backgroundColor: tab === t.id ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
                  color: tab === t.id ? '#ffd700' : 'var(--color-text-muted)',
                  border: tab === t.id ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Entries */}
          <div className="space-y-1">
            {entries.slice(0, 10).map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: entry.isPlayer
                    ? 'rgba(255,215,0,0.1)'
                    : entry.rank <= 3
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                  border: entry.isPlayer ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                }}
              >
                <div className="w-5 flex justify-center">{getRankIcon(entry.rank)}</div>
                <p className={`flex-1 text-xs font-bold ${entry.isPlayer ? 'text-yellow-400' : 'text-text-primary'}`}>
                  {entry.name}
                </p>
                <span className="text-xs font-mono text-text-muted">
                  {tab === 'cash' ? `${entry.value.toLocaleString()}₽` : entry.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
