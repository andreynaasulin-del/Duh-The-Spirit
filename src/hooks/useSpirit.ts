'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';
import { rollSpiritSabotage, type SpiritSabotage } from '@/config/spirit-prompts';
import { getCurrentSeason } from '@/config/seasons';

export function useSpirit() {
  const [whisper, setWhisper] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sabotage, setSabotage] = useState<SpiritSabotage | null>(null);

  const day = useGameStore((s) => s.state.day);
  const stats = useStats();
  const kpis = useKPIs();
  const paths = useGameStore((s) => s.state.paths);
  const season = useSeason();

  const dominantPath = paths.music >= paths.chaos
    ? (paths.music >= paths.survival ? 'Музыкант' : 'Выживание')
    : (paths.chaos >= paths.survival ? 'Хаос' : 'Выживание');

  // Fetch AI whisper
  const fetchWhisper = useCallback(async (lastAction?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/spirit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: season.id,
          day,
          stats: {
            health: stats.health,
            energy: stats.energy,
            mood: stats.mood,
            stability: stats.stability,
            anxiety: stats.anxiety,
          },
          kpis: {
            cash: kpis.cash,
            respect: kpis.respect,
            fame: kpis.fame,
          },
          paths,
          lastAction,
          dominantPath,
        }),
      });
      const data = await res.json();
      if (data.whisper) {
        setWhisper(data.whisper);
      }
    } catch {
      // Silent fail — Spirit stays quiet
    } finally {
      setIsLoading(false);
    }
  }, [season.id, day, stats, kpis, paths, dominantPath]);

  // Check for sabotage after action
  const checkSabotage = useCallback((): SpiritSabotage | null => {
    const sab = rollSpiritSabotage(season.id, stats.stability);
    if (sab) {
      setSabotage(sab);
      // Apply sabotage effects
      const store = useGameStore.getState();
      for (const [key, value] of Object.entries(sab.effects)) {
        const statKeys = ['mood', 'energy', 'health', 'stability', 'anxiety'];
        if (statKeys.includes(key)) {
          store.updateStat(key as any, value);
        }
        if (key === 'cash') {
          store.updateKPI('cash', value);
        }
      }
      store.addLog(`👁️ ${sab.description}`, 'warning');
      // Clear sabotage after 4 seconds
      setTimeout(() => setSabotage(null), 4000);
      return sab;
    }
    return null;
  }, [season.id, stats.stability]);

  // Fetch initial whisper on mount and when season/day changes
  useEffect(() => {
    fetchWhisper();
  }, [season.id, day]);

  return {
    whisper,
    isLoading,
    sabotage,
    fetchWhisper,
    checkSabotage,
  };
}
