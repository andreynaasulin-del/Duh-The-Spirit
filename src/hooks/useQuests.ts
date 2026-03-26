'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/stores/game-store';
import { QUESTS, getAvailableQuests, getQuest } from '@/config/quests';
import type { QuestDef, QuestRewards } from '@/types/quest';

/** Progress key format: "questId:objectiveId" */
function progressKey(questId: string, objId: string): string {
  return `${questId}:${objId}`;
}

export function useQuests() {
  const quests = useGameStore((s) => s.state.quests);

  const activeQuests = quests.active
    .map(id => getQuest(id))
    .filter(Boolean) as QuestDef[];

  const available = getAvailableQuests(quests.completed, quests.active);

  // Accept a quest
  const acceptQuest = useCallback((questId: string) => {
    const quest = getQuest(questId);
    if (!quest) return;

    const store = useGameStore.getState();
    const current = store.state.quests;

    if (current.active.includes(questId) || current.completed.includes(questId)) return;

    // Initialize progress counters for action_completed objectives
    const newProgress = { ...current.progress };
    for (const obj of quest.objectives) {
      if (obj.type === 'action_completed') {
        newProgress[progressKey(questId, obj.id)] = 0;
      }
    }

    store.setState({
      ...store.state,
      quests: {
        ...current,
        active: [...current.active, questId],
        available: current.available.filter(id => id !== questId),
        progress: newProgress,
      },
    });

    store.addLog(`Новый квест: ${quest.title}`, 'info');
  }, []);

  // Track an action — call this after EVERY action execution
  const trackAction = useCallback((actionId: string) => {
    const store = useGameStore.getState();
    const current = store.state.quests;
    const newProgress = { ...current.progress };
    let progressChanged = false;

    // Increment counters for matching objectives
    for (const questId of current.active) {
      const quest = getQuest(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'action_completed' && obj.actionId === actionId) {
          const key = progressKey(questId, obj.id);
          newProgress[key] = (newProgress[key] || 0) + 1;
          progressChanged = true;
        }
      }
    }

    // Update progress in state
    if (progressChanged) {
      store.setState({
        ...store.state,
        quests: { ...store.state.quests, progress: newProgress },
      });
    }

    // Check if any quest is now complete
    checkCompletions(newProgress);
  }, []);

  // Check all active quests for completion
  const checkCompletions = useCallback((progress: Record<string, number>) => {
    const store = useGameStore.getState();
    const current = store.state.quests;
    const completedNow: string[] = [];

    for (const questId of current.active) {
      const quest = getQuest(questId);
      if (!quest) continue;

      const allDone = quest.objectives.every(obj => {
        switch (obj.type) {
          case 'action_completed': {
            const key = progressKey(questId, obj.id);
            return (progress[key] || 0) >= obj.target;
          }
          case 'kpi_reached': {
            const val = (store.state.kpis as unknown as Record<string, number>)[obj.kpi || ''] ?? 0;
            return val >= obj.target;
          }
          case 'stat_reached': {
            const val = (store.state.stats as unknown as Record<string, number>)[obj.stat || ''] ?? 0;
            return val >= obj.target;
          }
          default:
            return false;
        }
      });

      if (allDone) completedNow.push(questId);
    }

    if (completedNow.length > 0) {
      for (const questId of completedNow) {
        const quest = getQuest(questId);
        if (!quest) continue;
        applyRewards(store, quest.rewards);
        store.addLog(`✅ Квест выполнен: ${quest.title}`, 'good');
      }

      store.setState({
        ...store.state,
        quests: {
          ...store.state.quests,
          active: current.active.filter(id => !completedNow.includes(id)),
          completed: [...current.completed, ...completedNow],
        },
      });
    }
  }, []);

  // Get progress for a specific objective
  const getObjectiveProgress = useCallback((questId: string, objId: string): number => {
    return quests.progress[progressKey(questId, objId)] || 0;
  }, [quests.progress]);

  return {
    activeQuests,
    available,
    completedCount: quests.completed.length,
    totalCount: Object.keys(QUESTS).length,
    acceptQuest,
    trackAction,
    getObjectiveProgress,
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
