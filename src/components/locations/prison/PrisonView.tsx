'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Dumbbell, BookOpen, Users, Swords, Clock, ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason, useStatus } from '@/stores/game-store';

interface PrisonAction {
  id: string;
  icon: React.ElementType;
  title: string;
  meta: string;
  time: number;
  effects: Record<string, number>;
  risk?: boolean;
}

const PRISON_ACTIONS: PrisonAction[] = [
  {
    id: 'workout_yard',
    icon: Dumbbell,
    title: 'Тренировка во дворе',
    meta: '+HP, +настрой (2ч)',
    time: 120,
    effects: { health: 10, mood: 10, energy: -15 },
  },
  {
    id: 'read_books',
    icon: BookOpen,
    title: 'Читать книги',
    meta: '+стабильность, +адекватность (3ч)',
    time: 180,
    effects: { stability: 15, adequacy: 10, mood: 5 },
  },
  {
    id: 'make_connections',
    icon: Users,
    title: 'Заводить связи',
    meta: '+респект, риск конфликта (2ч)',
    time: 120,
    effects: { respect: [3, 8] as any, mood: -5 },
    risk: true,
  },
  {
    id: 'fight_yard',
    icon: Swords,
    title: 'Разборка на прогулке',
    meta: '+респект, риск травмы (1ч)',
    time: 60,
    effects: { respect: [5, 15] as any, health: [-20, -5] as any },
    risk: true,
  },
  {
    id: 'sleep_cell',
    icon: Clock,
    title: 'Отсидеться в камере',
    meta: '+энергия, –настрой (8ч)',
    time: 480,
    effects: { energy: 40, mood: -15, stability: -5 },
  },
];

export function PrisonView() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const status = useStatus();
  const jailTime = useGameStore((s) => s.state.jailTime || 0);
  const applyEffects = useGameStore((s) => s.applyEffects);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const addLog = useGameStore((s) => s.addLog);
  const setStatus = useGameStore((s) => s.setStatus);

  const isFree = status !== 'PRISON';

  const handleAction = useCallback((action: PrisonAction) => {
    if (isFree) return;
    setBusyId(action.id);
    advanceTime(action.time);
    applyEffects(action.effects);
    addLog(`Тюрьма: ${action.title}`, action.risk ? 'danger' : 'info');
    setTimeout(() => setBusyId(null), 500);
  }, [isFree, advanceTime, applyEffects, addLog]);

  // Days remaining
  const daysLeft = Math.ceil(jailTime / 1440);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: '#ff4444',
            boxShadow: '3px 3px 0px rgba(255,68,68,0.3)',
            borderRadius: '2px',
          }}
        >
          <Lock className="w-6 h-6" style={{ color: '#ff4444' }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: '#ff4444' }}>
            ТЮРЬМА
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            {isFree ? 'Ты на свободе. Надеемся, ненадолго не вернёшься.' : 'Выживай. Каждый день — испытание.'}
          </p>
        </div>
      </div>

      {isFree ? (
        /* Free state */
        <div className="manga-panel p-6 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 mx-auto" style={{ color: 'var(--color-neon-green)' }} />
          <h2 className="text-sm font-bold text-text-primary">ТЫ НА СВОБОДЕ</h2>
          <p className="text-[11px] text-text-muted">
            Попадёшь сюда если переборщишь с тёмными делами.
            Уличные разборки, тёмные схемы — всё имеет последствия.
          </p>
        </div>
      ) : (
        <>
          {/* Sentence status */}
          <div className="manga-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="manga-label">СРОК</span>
              <span className="text-[10px] font-bold text-danger">
                {daysLeft} {daysLeft === 1 ? 'ДЕНЬ' : daysLeft < 5 ? 'ДНЯ' : 'ДНЕЙ'} ОСТАЛОСЬ
              </span>
            </div>
            <div className="w-full h-2 bg-white/5" style={{ borderRadius: '1px' }}>
              <motion.div
                className="h-full bg-danger"
                style={{
                  width: `${Math.max(5, 100 - (daysLeft / 30) * 100)}%`,
                  borderRadius: '1px',
                }}
                animate={{ width: `${Math.max(5, 100 - (daysLeft / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* Stats in prison */}
          <div className="grid grid-cols-3 gap-2">
            <div className="manga-panel p-3 text-center crosshatch">
              <p className="manga-label">HP</p>
              <p className="text-xl font-bold font-mono mt-1" style={{
                color: stats.health < 30 ? 'var(--color-danger)' : 'var(--color-neon-green)'
              }}>
                {Math.round(stats.health)}
              </p>
            </div>
            <div className="manga-panel p-3 text-center crosshatch">
              <p className="manga-label">НАСТРОЙ</p>
              <p className="text-xl font-bold font-mono mt-1" style={{
                color: stats.mood < 30 ? 'var(--color-danger)' : 'var(--color-neon-cyan)'
              }}>
                {Math.round(stats.mood)}
              </p>
            </div>
            <div className="manga-panel p-3 text-center crosshatch">
              <p className="manga-label">РЕСПЕКТ</p>
              <p className="text-xl font-bold font-mono mt-1" style={{ color: season.theme.accentColor }}>
                {kpis.respect}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="chapter-divider"><span>ДЕЙСТВИЯ</span></div>

          <div className="space-y-1.5">
            {PRISON_ACTIONS.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(action)}
                disabled={busyId === action.id}
                className={`card-street p-3 flex items-center gap-3 w-full text-left ${busyId === action.id ? 'opacity-30' : ''}`}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10"
                  style={{ borderRadius: '2px' }}
                >
                  <action.icon className="w-4 h-4" style={{ color: action.risk ? 'var(--color-danger)' : '#ff4444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary truncate">{action.title}</p>
                    {action.risk && (
                      <span className="text-[8px] font-bold px-1 py-0.5 text-danger border border-danger" style={{ borderRadius: '1px' }}>
                        РИСК
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted font-mono">{action.meta}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
