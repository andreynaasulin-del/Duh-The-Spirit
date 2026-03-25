'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Brain, Pill, ShieldCheck, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';

interface Treatment {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  cost: number;
  time: number;
  effects: Record<string, number>;
  risk?: 'low' | 'medium';
}

const TREATMENTS: Treatment[] = [
  {
    id: 'basic_heal',
    icon: HeartPulse,
    title: 'Базовое лечение',
    description: 'Восстановить HP до 80%',
    cost: 300,
    time: 60,
    effects: { health: 80 },
  },
  {
    id: 'therapy_session',
    icon: Brain,
    title: 'Сеанс терапии',
    description: '+стабильность, –тревожность',
    cost: 500,
    time: 120,
    effects: { stability: 30, anxiety: -25, mood: 10 },
  },
  {
    id: 'full_checkup',
    icon: ShieldCheck,
    title: 'Полное обследование',
    description: 'HP и стабильность на максимум',
    cost: 1500,
    time: 240,
    effects: { health: 100, stability: 100, anxiety: -40 },
  },
  {
    id: 'experimental',
    icon: Pill,
    title: 'Экспериментальная терапия',
    description: 'Рискованно, но эффективно',
    cost: 800,
    time: 180,
    effects: { stability: 50, mood: 30, adequacy: 20, health: -10 },
    risk: 'medium',
  },
];

export function DoctorView() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const updateStat = useGameStore((s) => s.updateStat);
  const updateKPI = useGameStore((s) => s.updateKPI);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const addLog = useGameStore((s) => s.addLog);

  const treat = useCallback((t: Treatment) => {
    if (kpis.cash < t.cost) {
      setLastResult('Недостаточно средств');
      setTimeout(() => setLastResult(null), 2000);
      return;
    }

    setBusyId(t.id);
    updateKPI('cash', -t.cost);
    advanceTime(t.time);

    for (const [key, value] of Object.entries(t.effects)) {
      const statKeys = ['health', 'energy', 'hunger', 'mood', 'stability', 'anxiety', 'adequacy', 'withdrawal'];
      if (statKeys.includes(key)) {
        if (value >= 80 && ['health', 'stability'].includes(key)) {
          // Set to value
          const current = stats[key as keyof typeof stats] ?? 0;
          updateStat(key as any, value - current);
        } else {
          updateStat(key as any, value);
        }
      }
    }

    addLog(`Доктор: ${t.title} (–₽${t.cost})`, 'info');
    setLastResult(`${t.title} — выполнено`);
    setTimeout(() => {
      setBusyId(null);
      setLastResult(null);
    }, 1500);
  }, [kpis.cash, stats, updateStat, updateKPI, advanceTime, addLog]);

  // Health status
  const healthStatus = stats.health > 70 ? 'Стабильное' : stats.health > 40 ? 'Ослабленное' : 'Критическое';
  const healthColor = stats.health > 70 ? 'var(--color-neon-green)' : stats.health > 40 ? 'var(--color-warning)' : 'var(--color-danger)';

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
            borderColor: '#00ff88',
            boxShadow: '0 0 16px rgba(0,255,136,0.3)',
            borderRadius: '10px',
          }}
        >
          <HeartPulse className="w-6 h-6" style={{ color: '#00ff88' }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: '#00ff88' }}>
            ДОКТОР
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Лечение, терапия, восстановление.
          </p>
        </div>
      </div>

      {/* Patient status */}
      <div className="manga-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="manga-label">СОСТОЯНИЕ ПАЦИЕНТА</span>
          <span className="text-[10px] font-bold" style={{ color: healthColor }}>
            {healthStatus.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="manga-label">HP</p>
            <p className="text-lg font-bold font-mono" style={{ color: healthColor }}>
              {Math.round(stats.health)}
            </p>
          </div>
          <div>
            <p className="manga-label">СТАБИЛЬН.</p>
            <p className="text-lg font-bold font-mono" style={{ color: stats.stability > 50 ? 'var(--color-neon-cyan)' : 'var(--color-warning)' }}>
              {Math.round(stats.stability)}
            </p>
          </div>
          <div>
            <p className="manga-label">ТРЕВОГА</p>
            <p className="text-lg font-bold font-mono" style={{ color: stats.anxiety > 50 ? 'var(--color-danger)' : 'var(--color-neon-green)' }}>
              {Math.round(stats.anxiety)}
            </p>
          </div>
        </div>
      </div>

      {/* Result feedback */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="manga-panel p-3 text-center"
          style={{ borderColor: lastResult.includes('Недостаточно') ? 'var(--color-danger)' : 'var(--color-neon-green)' }}
        >
          <p className="text-xs font-bold" style={{
            color: lastResult.includes('Недостаточно') ? 'var(--color-danger)' : 'var(--color-neon-green)'
          }}>
            {lastResult}
          </p>
        </motion.div>
      )}

      {/* Treatments */}
      <div className="chapter-divider"><span>УСЛУГИ</span></div>

      <div className="space-y-1.5">
        {TREATMENTS.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => treat(t)}
            disabled={busyId === t.id}
            className={`card-street p-3 flex items-center gap-3 w-full text-left ${busyId === t.id ? 'opacity-30' : ''}`}
          >
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10"
              style={{ borderRadius: '10px' }}
            >
              <t.icon className="w-4 h-4" style={{ color: '#00ff88' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary truncate">{t.title}</p>
                {t.risk && (
                  <span className="text-[8px] font-bold px-1 py-0.5 text-warning border border-warning" style={{ borderRadius: '8px' }}>
                    РИСК
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted font-mono">{t.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold font-mono" style={{ color: kpis.cash >= t.cost ? '#00ff88' : 'var(--color-danger)' }}>
                ₽{t.cost}
              </p>
              <p className="text-[9px] text-text-muted">{t.time / 60}ч</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Balance */}
      <div className="manga-panel p-3 text-center">
        <p className="manga-label">БАЛАНС</p>
        <p className="text-xl font-bold font-mono mt-1" style={{ color: kpis.cash < 500 ? 'var(--color-danger)' : 'var(--color-neon-green)' }}>
          ₽{kpis.cash.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
