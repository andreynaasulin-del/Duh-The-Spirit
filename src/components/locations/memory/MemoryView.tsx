'use client';

import { motion } from 'framer-motion';
import { Brain, Calendar, TrendingUp, Music, Skull, Shield, Star, Trophy, Target, CheckCircle, Eye, AlertTriangle } from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';
import { getSuspicionLevel } from '@/config/difficulty';
import { getCurrentSeason } from '@/config/seasons';
import { Leaderboard } from '@/components/ui/Leaderboard';
import { BattlePass } from '@/components/ui/BattlePass';
import { QUESTS } from '@/config/quests';

// Achievements
const ACHIEVEMENTS = [
  { id: 'first_verse', icon: '🎤', title: 'Первый куплет', desc: 'Написать текст', check: (s: any) => s.quests.completed.includes('prologue_awaken') },
  { id: 'street_cred', icon: '🔥', title: 'Уличный кредит', desc: 'Получить 5 респекта', check: (s: any) => s.kpis.respect >= 5 },
  { id: 'first_cash', icon: '💰', title: 'Первые деньги', desc: 'Заработать 10,000₽', check: (s: any) => s.kpis.cash >= 10000 },
  { id: 'survivor_10', icon: '🛡', title: '10 дней', desc: 'Выжить 10 дней', check: (s: any) => s.day >= 10 },
  { id: 'famous', icon: '⭐', title: 'Известность', desc: 'Набрать 50 славы', check: (s: any) => s.kpis.fame >= 50 },
  { id: 'dark_path', icon: '💀', title: 'Тёмная сторона', desc: 'Хаос > 20', check: (s: any) => s.paths.chaos >= 20 },
  { id: 'musician', icon: '🎵', title: 'Музыкант', desc: 'Музыка > 20', check: (s: any) => s.paths.music >= 20 },
  { id: 'winter_surv', icon: '❄️', title: 'Пережить зиму', desc: 'Дойти до 91 дня', check: (s: any) => s.day >= 91 },
  { id: 'spring_mania', icon: '⚡', title: 'God Mode', desc: 'Дойти до весны', check: (s: any) => s.day >= 181 },
  { id: 'year_one', icon: '👑', title: 'Первый год', desc: 'Прожить 360 дней', check: (s: any) => s.day >= 360 },
  { id: 'rich', icon: '🏦', title: 'Богатство', desc: '100,000₽ на счету', check: (s: any) => s.kpis.cash >= 100000 },
  { id: 'quest_master', icon: '🏆', title: 'Квестомастер', desc: 'Выполнить 10 квестов', check: (s: any) => s.quests.completed.length >= 10 },
];

export function MemoryView() {
  const season = useSeason();
  const stats = useStats();
  const kpis = useKPIs();
  const day = useGameStore((s) => s.state.day);
  const paths = useGameStore((s) => s.state.paths);
  const seasonCount = Math.floor(day / 90) + 1; // ~90 days per season

  const dominantPath = paths.music >= paths.chaos
    ? (paths.music >= paths.survival ? 'music' : 'survival')
    : (paths.chaos >= paths.survival ? 'chaos' : 'survival');

  const pathInfo = {
    music: { label: 'Музыкант', icon: Music, color: 'var(--color-neon-cyan)' },
    chaos: { label: 'Хаос', icon: Skull, color: 'var(--color-danger)' },
    survival: { label: 'Выживание', icon: Shield, color: 'var(--color-neon-green)' },
  };

  const current = pathInfo[dominantPath];

  const allStats = [
    { label: 'HP', value: Math.round(stats.health), max: 100, color: 'var(--color-neon-green)' },
    { label: 'Настрой', value: Math.round(stats.mood), max: 100, color: 'var(--color-neon-cyan)' },
    { label: 'Энергия', value: Math.round(stats.energy), max: 100, color: 'var(--color-warning)' },
    { label: 'Стабильность', value: Math.round(stats.stability), max: 100, color: stats.stability < 30 ? 'var(--color-danger)' : 'var(--color-neon-cyan)' },
    { label: 'Адекватность', value: Math.round(stats.adequacy), max: 100, color: 'var(--color-neon-green)' },
    { label: 'Тревога', value: Math.round(stats.anxiety), max: 100, color: 'var(--color-danger)' },
    { label: 'Ломка', value: Math.round(stats.withdrawal), max: 100, color: 'var(--color-danger)' },
    { label: 'Голод', value: Math.round(stats.hunger), max: 100, color: 'var(--color-warning)' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: season.theme.accentColor,
            boxShadow: `0 0 16px ${season.theme.accentGlow}`,
            borderRadius: '10px',
          }}
        >
          <Brain className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            ПАМЯТЬ
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Твоя история, достижения, статистика.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="manga-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3.5 h-3.5" style={{ color: season.theme.accentColor }} />
          <span className="manga-label">ХРОНОЛОГИЯ</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold font-mono" style={{ color: season.theme.accentColor }}>{day}</p>
            <p className="manga-label">ДЕНЬ</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-neon-cyan)' }}>{seasonCount}</p>
            <p className="manga-label">СЕЗОНОВ</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-neon-green)' }}>
              {kpis.cash.toLocaleString()}₽
            </p>
            <p className="manga-label">КЭШ</p>
          </div>
        </div>
      </div>

      {/* Dominant path */}
      <div className="manga-panel p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <current.icon className="w-4 h-4" style={{ color: current.color }} />
          <span className="text-sm font-bold" style={{ color: current.color }}>{current.label}</span>
        </div>
        <div className="flex gap-3 text-[10px] font-mono text-text-muted">
          <span>🎵 {paths.music}</span>
          <span>💀 {paths.chaos}</span>
          <span>🛡 {paths.survival}</span>
        </div>
      </div>

      {/* Ending Progress */}
      <div className="manga-panel p-3 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-3.5 h-3.5" style={{ color: '#ffd700' }} />
          <span className="manga-label">ПРОГРЕСС К КОНЦОВКАМ</span>
        </div>
        {[
          { label: 'РЭПЕР', icon: '🎤', color: '#00e5ff', bars: [
            { name: 'Музыка', current: paths.music, target: 40 },
            { name: 'Слава', current: kpis.fame, target: 50 },
          ]},
          { label: 'АВТОРИТЕТ', icon: '💀', color: '#ff2d55', bars: [
            { name: 'Хаос', current: paths.chaos, target: 40 },
            { name: 'Респект', current: kpis.respect, target: 50 },
          ]},
          { label: 'РАБОТЯГА', icon: '🔧', color: '#888', bars: [
            { name: 'Выживание', current: paths.survival, target: 30 },
            { name: 'Стабильность', current: Math.round(stats.stability), target: 50 },
          ]},
          { label: '???', icon: '👑', color: '#ffd700', bars: [
            { name: '???', current: Math.min(paths.music, 50) + Math.min(paths.chaos, 30), target: 80 },
          ]},
        ].map(ending => {
          const avgProgress = ending.bars.reduce((sum, b) => sum + Math.min(100, (b.current / b.target) * 100), 0) / ending.bars.length;
          return (
            <div key={ending.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{ending.icon}</span>
                  <span className="text-[10px] font-bold" style={{ color: ending.color }}>{ending.label}</span>
                </div>
                <span className="text-[9px] font-mono" style={{ color: ending.color }}>{Math.round(avgProgress)}%</span>
              </div>
              {ending.bars.map(bar => (
                <div key={bar.name} className="flex items-center gap-2">
                  <span className="text-[8px] text-text-muted w-16 text-right">{bar.name}</span>
                  <div className="flex-1 h-1 bg-white/5" style={{ borderRadius: '4px' }}>
                    <div className="h-full transition-all duration-300" style={{
                      width: `${Math.min(100, (bar.current / bar.target) * 100)}%`,
                      backgroundColor: ending.color,
                      borderRadius: '4px',
                    }} />
                  </div>
                  <span className="text-[8px] font-mono text-text-muted w-10">{bar.current}/{bar.target}</span>
                </div>
              ))}
            </div>
          );
        })}
        <p className="text-[9px] text-text-muted text-center">Концовка определяется на 360 день</p>
      </div>

      {/* Criminal Status */}
      {(() => {
        const suspicion = useGameStore.getState().state.suspicionLevel ?? 0;
        const level = getSuspicionLevel(suspicion);
        const completedEndings = useGameStore.getState().state.completedEndings || [];
        return (
          <div className="manga-panel p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5" style={{ color: level.color }} />
              <span className="manga-label">КРИМИНАЛЬНЫЙ СТАТУС</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: level.color }}>{level.label}</span>
              <span className="text-[10px] font-mono text-text-muted">{suspicion}/100</span>
            </div>
            <div className="w-full h-2 bg-white/5" style={{ borderRadius: '8px' }}>
              <div className="h-full transition-all duration-300" style={{
                width: `${suspicion}%`,
                backgroundColor: level.color,
                borderRadius: '8px',
              }} />
            </div>
            {/* Season effects */}
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-text-muted" />
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Сезонные эффекты</span>
              </div>
              {(() => {
                const s = getCurrentSeason(day);
                return (
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-text-muted">
                    <span>Настрой: x{s.modifiers.moodDecay}</span>
                    <span>Энергия: x{s.modifiers.energyDecay}</span>
                    <span>Тревога: x{s.modifiers.anxietyGain}</span>
                    <span>Стабильность: x{s.modifiers.stabilityDecay}</span>
                    {s.modifiers.panicAttackChance > 0 && <span className="text-danger col-span-2">Панические атаки: {(s.modifiers.panicAttackChance * 100)}%</span>}
                    {s.modifiers.godModeBoost > 0 && <span className="text-neon-green col-span-2">God Mode: x{s.modifiers.godModeBoost}</span>}
                  </div>
                );
              })()}
            </div>
            {/* Completed endings */}
            {completedEndings.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Собранные концовки</span>
                <div className="flex gap-2 mt-1">
                  {completedEndings.map((e: string) => (
                    <span key={e} className="text-[10px] px-2 py-0.5 border border-white/10 text-text-secondary" style={{ borderRadius: '6px' }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">РЕЛИЗЫ</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--color-neon-cyan)' }}>{kpis.releases}</p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">ФАНАТЫ</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--color-neon-green)' }}>
            {kpis.subscribers >= 1000 ? `${(kpis.subscribers / 1000).toFixed(1)}K` : kpis.subscribers}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">РЕСПЕКТ</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: season.theme.accentColor }}>{kpis.respect}</p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">ХАОС</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--color-danger)' }}>{paths.chaos}</p>
        </div>
      </div>

      {/* Quest progress */}
      <div className="manga-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5" style={{ color: season.theme.accentColor }} />
          <span className="manga-label">ПРОГРЕСС КВЕСТОВ</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-neon-green)' }}>
              {useGameStore.getState().state.quests.completed.length}
            </p>
            <p className="manga-label">ВЫПОЛНЕНО</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
              {useGameStore.getState().state.quests.active.length}
            </p>
            <p className="manga-label">АКТИВНО</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-text-muted">
              {Object.keys(QUESTS).length}
            </p>
            <p className="manga-label">ВСЕГО</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full h-2 bg-white/5" style={{ borderRadius: '8px' }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(useGameStore.getState().state.quests.completed.length / Object.keys(QUESTS).length) * 100}%`,
              backgroundColor: 'var(--color-neon-green)',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="chapter-divider"><span>ДОСТИЖЕНИЯ</span></div>
      <div className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map(ach => {
          const unlocked = ach.check(useGameStore.getState().state);
          return (
            <div
              key={ach.id}
              className="flex flex-col items-center gap-1 p-2"
              style={{
                opacity: unlocked ? 1 : 0.3,
                filter: unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              <span className="text-2xl">{ach.icon}</span>
              <p className="text-[8px] font-bold text-text-muted text-center leading-tight">{ach.title}</p>
              {unlocked && <CheckCircle className="w-3 h-3" style={{ color: 'var(--color-neon-green)' }} />}
            </div>
          );
        })}
      </div>

      {/* Battle Pass */}
      <BattlePass />

      {/* Leaderboard */}
      <Leaderboard />

      {/* All stats */}
      <div className="chapter-divider"><span>ПОКАЗАТЕЛИ</span></div>
      <div className="space-y-2">
        {allStats.map(stat => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-text-muted tracking-wider">{stat.label}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: stat.color }}>
                {stat.value}/{stat.max}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5" style={{ borderRadius: '8px' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stat.value / stat.max) * 100)}%`,
                  backgroundColor: stat.color,
                  borderRadius: '8px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
