'use client';

import { useCallback } from 'react';
import { useGameStore, resolveEffect } from '@/stores/game-store';
import { useUIStore } from '@/stores/ui-store';
import { getAction } from '@/config/actions';
import type { StatKey, KPIKey, PathKey } from '@/types/game';
import { useQuests } from './useQuests';

const STAT_KEYS: StatKey[] = ['health', 'energy', 'hunger', 'mood', 'withdrawal', 'stability', 'adequacy', 'anxiety', 'trip', 'synchronization'];
const KPI_KEYS: KPIKey[] = ['cash', 'respect', 'fame', 'releases', 'subscribers'];

export function useAction() {
  const updateStat = useGameStore((s) => s.updateStat);
  const updateKPI = useGameStore((s) => s.updateKPI);
  const updatePath = useGameStore((s) => s.updatePath);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const addLog = useGameStore((s) => s.addLog);
  const stats = useGameStore((s) => s.state.stats);
  const kpis = useGameStore((s) => s.state.kpis);
  const addToast = useUIStore((s) => s.addToast);
  const { trackAction } = useQuests();

  const executeAction = useCallback((actionId: string): boolean => {
    const action = getAction(actionId);
    if (!action) {
      addToast('Действие не найдено', 'error');
      return false;
    }

    // Check energy requirement
    const energyCost = action.effects.energy;
    if (typeof energyCost === 'number' && energyCost < 0 && stats.energy < Math.abs(energyCost)) {
      addToast('Недостаточно энергии', 'warning');
      return false;
    }

    // Check cash requirement
    const cashCost = action.effects.cash;
    if (typeof cashCost === 'number' && cashCost < 0 && kpis.cash < Math.abs(cashCost)) {
      addToast('Недостаточно денег', 'warning');
      return false;
    }

    // Apply effects
    for (const [key, value] of Object.entries(action.effects)) {
      if (value === undefined) continue;
      const resolved = resolveEffect(value);

      if (STAT_KEYS.includes(key as StatKey)) {
        updateStat(key as StatKey, resolved);
      } else if (KPI_KEYS.includes(key as KPIKey)) {
        updateKPI(key as KPIKey, resolved);
      }
    }

    // Apply path progression
    if (action.paths) {
      for (const [path, value] of Object.entries(action.paths)) {
        if (typeof value === 'number') {
          updatePath(path as PathKey, value);
        }
      }
    }

    // Advance time
    advanceTime(action.time);

    // Haptic feedback on mobile
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); } catch {}

    // Log
    addLog(`${action.title}: ${action.meta}`, 'neutral');
    addToast(action.title, 'success');

    // Track for quest progress
    trackAction(actionId);

    return true;
  }, [updateStat, updateKPI, updatePath, advanceTime, addLog, stats, kpis, addToast]);

  return { executeAction };
}
