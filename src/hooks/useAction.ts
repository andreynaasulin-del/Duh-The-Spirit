'use client';

import { useCallback } from 'react';
import { useGameStore, resolveEffect } from '@/stores/game-store';
import { useUIStore } from '@/stores/ui-store';
import { getAction } from '@/config/actions';
import type { StatKey, KPIKey, PathKey } from '@/types/game';
import { useQuests } from './useQuests';
import { rollRandomEvent } from '@/config/random-events';
import { getCurrentSeason } from '@/config/seasons';
import { SUSPICIOUS_ACTIONS, DIFFICULTIES, shouldArrest, getSuspicionLevel, getSuspicionDecay } from '@/config/difficulty';
import { rollPanicAttack } from '@/config/seasons';

const STAT_KEYS: StatKey[] = ['health', 'energy', 'hunger', 'mood', 'withdrawal', 'stability', 'adequacy', 'anxiety', 'trip', 'synchronization'];
const KPI_KEYS: KPIKey[] = ['cash', 'respect', 'fame', 'releases', 'subscribers'];

// Panic attack cooldown — max 1 per 3 actions
let panicCooldown = 0;

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

    // Prison: block all non-prison actions
    const currentStatus = useGameStore.getState().state.status;
    if (currentStatus === 'PRISON' && action.category !== 'prison') {
      addToast('Ты в тюрьме. Действие недоступно.', 'error');
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

    // Panic attack check (Winter: 15% chance, cooldown 3 actions)
    const currentDay = useGameStore.getState().state.day;
    if (panicCooldown > 0) {
      panicCooldown--;
    } else if (rollPanicAttack(currentDay)) {
      panicCooldown = 3;
      updateStat('anxiety', 20);
      updateStat('energy', -15);
      addToast('😰 Паническая атака!', 'error');
      addLog('😰 Паника. Руки трясутся, воздуха не хватает.', 'danger');
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error'); } catch {}
      return false; // Action fails due to panic
    }

    // God mode boost (Spring: 1.5x positive effects)
    const season = getCurrentSeason(currentDay);
    const godBoost = season.modifiers.godModeBoost;

    // Apply effects
    for (const [key, value] of Object.entries(action.effects)) {
      if (value === undefined) continue;
      let resolved = resolveEffect(value);

      // Spring god mode: boost positive stat/kpi effects
      if (godBoost > 0 && resolved > 0) {
        resolved = Math.round(resolved * godBoost);
      }

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
        // Arrested! Set status to PRISON and calculate sentence
        const baseSentence = 30; // days
        const sentence = Math.ceil(baseSentence * difficulty.sentenceMultiplier);
        const jailTimeMinutes = sentence * 1440; // convert to game minutes
        store.setState({
          ...store.state,
          suspicionLevel: Math.max(0, newSuspicion - 40),
          status: 'PRISON',
          prison: {
            ...store.state.prison,
            sentence: {
              totalDays: sentence,
              daysServed: 0,
              daysRemaining: sentence,
            },
          },
          jailTime: jailTimeMinutes,
        });
        addToast('🚔 АРЕСТ! Тебя забрали.', 'error');
        addLog(`🚔 Арестован. Срок: ${sentence} дней.`, 'danger');
        try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error'); } catch {}
      }
    }

    // Random event roll
    const currentDayNow = useGameStore.getState().state.day;
    const currentSeason = getCurrentSeason(currentDayNow);
    const event = rollRandomEvent(currentSeason.id);
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
