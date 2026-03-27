'use client';

import { useCallback } from 'react';
import { useGameStore, resolveEffect } from '@/stores/game-store';
import { useUIStore } from '@/stores/ui-store';
import { getAction } from '@/config/actions';
import type { StatKey, KPIKey, PathKey } from '@/types/game';
import { useQuests } from './useQuests';
import { rollRandomEvent } from '@/config/random-events';
import { getCurrentSeason } from '@/config/seasons';
import { SUSPICIOUS_ACTIONS, DIFFICULTIES, shouldArrest, getSuspicionLevel } from '@/config/difficulty';

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

    // Advance time + detect season change
    const dayBefore = useGameStore.getState().state.day;
    const seasonBefore = getCurrentSeason(dayBefore);
    advanceTime(action.time);
    const dayAfter = useGameStore.getState().state.day;
    const seasonAfter = getCurrentSeason(dayAfter);

    if (seasonBefore.id !== seasonAfter.id) {
      addToast(`${seasonAfter.name}: ${seasonAfter.subtitle}`, 'info');
      addLog(`Наступила ${seasonAfter.name}. ${seasonAfter.description}`, 'spirit');
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success'); } catch {}
    }

    // Haptic feedback on mobile
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); } catch {}

    // Log
    addLog(`${action.title}: ${action.meta}`, 'neutral');
    addToast(action.title, 'success');

    // Track for quest progress
    trackAction(actionId);

    // Suspicion increase for shady actions
    const suspicionGain = SUSPICIOUS_ACTIONS[actionId];
    if (suspicionGain) {
      const store = useGameStore.getState();
      const currentSuspicion = store.state.suspicionLevel ?? 0;
      const newSuspicion = Math.min(100, currentSuspicion + suspicionGain);
      store.setState({
        ...store.state,
        suspicionLevel: newSuspicion,
      });

      const level = getSuspicionLevel(newSuspicion);
      if (newSuspicion >= 40) {
        addToast(`⚠️ ${level.label}: ${level.description}`, 'warning');
      }

      // Check for arrest
      const difficulty = DIFFICULTIES[store.state.difficulty ?? 'medium'];
      if (shouldArrest(newSuspicion, difficulty)) {
        // Arrested! Redirect to prison
        store.setState({
          ...store.state,
          suspicionLevel: Math.max(0, newSuspicion - 40),
          status: 'ARRESTED',
        });
        addToast('🚔 АРЕСТ! Тебя забрали.', 'error');
        addLog('🚔 Арестован. Район не прощает.', 'danger');
        try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error'); } catch {}
      }
    }

    // Random event roll
    const day = useGameStore.getState().state.day;
    const season = getCurrentSeason(day);
    const event = rollRandomEvent(season.id);
    if (event) {
      // Apply event effects
      for (const [key, val] of Object.entries(event.effect)) {
        if (val === undefined) continue;
        if (STAT_KEYS.includes(key as StatKey)) {
          updateStat(key as StatKey, val);
        } else if (['cash', 'respect', 'fame'].includes(key)) {
          updateKPI(key as KPIKey, val);
        }
      }
      const isPositive = (event.effect.mood ?? 0) > 0 || (event.effect.cash ?? 0) > 0;
      addLog(`${event.emoji} ${event.text}`, isPositive ? 'good' : 'neutral');
      addToast(`${event.emoji} ${event.text}`, 'info');
    }

    return true;
  }, [updateStat, updateKPI, updatePath, advanceTime, addLog, stats, kpis, addToast]);

  return { executeAction };
}
