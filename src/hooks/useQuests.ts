'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/stores/game-store';
import { QUESTS, getAvailableQuests, getQuest } from '@/config/quests';
import type { ActiveQuest, QuestDef, QuestRewards } from '@/types/quest';

export function useQuests() {
  const quests = useGameStore((s) => s.state.quests);
  const state = useGameStore((s) => s.state);

  // Get active quest objects with full data
  const activeQuests = quests.active
    .map(id => getQuest(id))
    .filter(Boolean) as QuestDef[];

  // Get available (can be accepted) quests
  const available = getAvailableQuests(quests.completed, quests.active);

  // Accept a quest
  const acceptQuest = useCallback((questId: string) => {
    const quest = getQuest(questId);
    if (!quest) return;

    const store = useGameStore.getState();
    const current = store.state.quests;

    if (current.active.includes(questId) || current.completed.includes(questId)) return;

    store.setState({
      ...store.state,
      quests: {
        ...current,
        active: [...current.active, questId],
        available: current.available.filter(id => id !== questId),
      },
    });

    store.addLog(`Новый квест: ${quest.title}`, 'info');
  }, []);

  // Track progress on an action (called after executing any action)
  const trackAction = useCallback((actionId: string) => {
    const store = useGameStore.getState();
    const current = store.state.quests;
    let changed = false;
    const completedNow: string[] = [];

    // Check each active quest's objectives
    const updatedActive = [...current.active];

    for (const questId of current.active) {
      const quest = getQuest(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'action_completed' && obj.actionId === actionId) {
          // Increment action counter in quest progress
          // We track progress in a simple way using the store
          changed = true;
        }
      }
    }

    // For now, we use a simple approach: check if quest can be completed
    // based on current game state after the action
    for (const questId of current.active) {
      const quest = getQuest(questId);
      if (!quest) continue;

      const allComplete = quest.objectives.every(obj => {
        switch (obj.type) {
          case 'kpi_reached': {
            const kpiVal = (store.state.kpis as Record<string, number>)[obj.kpi || ''] ?? 0;
            return kpiVal >= obj.target;
          }
          case 'stat_reached': {
            const statVal = (store.state.stats as Record<string, number>)[obj.stat || ''] ?? 0;
            return statVal >= obj.target;
          }
          case 'action_completed': {
            // Track via action count in state — simplified: count actions from log
            const actionCount = store.state.log.filter(
              l => l.text.toLowerCase().includes(actionId.toLowerCase())
            ).length;
            // Simplified: if the user did the action, consider it progress
            return actionCount >= obj.target || actionId === obj.actionId;
          }
          default:
            return false;
        }
      });

      if (allComplete) {
        completedNow.push(questId);
      }
    }

    if (completedNow.length > 0) {
      const newCompleted = [...current.completed, ...completedNow];
      const newActive = current.active.filter(id => !completedNow.includes(id));

      // Apply rewards
      for (const questId of completedNow) {
        const quest = getQuest(questId);
        if (!quest) continue;
        applyRewards(store, quest.rewards);
        store.addLog(`Квест выполнен: ${quest.title}`, 'success');
      }

      store.setState({
        ...store.state,
        quests: {
          ...store.state.quests,
          active: newActive,
          completed: newCompleted,
        },
      });
    }
  }, []);

  return {
    activeQuests,
    available,
    completedCount: quests.completed.length,
    totalCount: Object.keys(QUESTS).length,
    acceptQuest,
    trackAction,
  };
}

function applyRewards(store: ReturnType<typeof useGameStore.getState>, rewards: QuestRewards) {
  if (rewards.cash) store.updateKPI('cash', rewards.cash);
  if (rewards.respect) store.updateKPI('respect', rewards.respect);
  if (rewards.fame) store.updateKPI('fame', rewards.fame);
  if (rewards.energy) store.updateStat('energy', rewards.energy);
  if (rewards.stability) store.updateStat('stability', rewards.stability);
  if (rewards.path_music) store.updatePath('music', rewards.path_music);
  if (rewards.path_chaos) store.updatePath('chaos', rewards.path_chaos);
  if (rewards.path_survival) store.updatePath('survival', rewards.path_survival);
}
