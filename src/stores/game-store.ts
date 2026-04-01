import { create } from 'zustand';
import type { GameState, StatKey, KPIKey, PathKey, LogEntry, LogType } from '@/types/game';
import { createInitialState } from '@/config/initial-state';
import { GAME_CONFIG } from '@/config/constants';
import { getCurrentSeason, getInsomniaDrain } from '@/config/seasons';
import { getSuspicionDecay } from '@/config/difficulty';
import type { SeasonConfig } from '@/config/seasons';

interface GameStore {
  // State
  state: GameState;
  isLoaded: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  // Hydration
  loadState: (savedState: GameState) => void;
  resetState: () => void;

  // Stats
  updateStat: (name: StatKey, delta: number) => void;
  updateKPI: (name: KPIKey, delta: number) => void;
  updatePath: (name: PathKey, delta: number) => void;

  // Time
  advanceTime: (minutes: number) => void;
  tick: () => void;

  // Inventory
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;

  // Log
  addLog: (text: string, type: LogType) => void;

  // Spirit
  updateSpirit: (key: 'rage' | 'trust', delta: number) => void;

  // Status
  setStatus: (status: 'FREE' | 'PRISON' | 'HOSPITAL') => void;

  // Save tracking
  setSaving: (saving: boolean) => void;
  markSaved: () => void;

  // Batch effects (from actions/purchases)
  applyEffects: (effects: Record<string, number>) => void;

  // Full state setter
  setState: (state: GameState) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolveEffect(value: number | [number, number]): number {
  if (Array.isArray(value)) {
    const [min, max] = value;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return value;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),
  isLoaded: false,
  isSaving: false,
  lastSavedAt: null,

  loadState: (savedState) => {
    set({ state: savedState, isLoaded: true });
  },

  resetState: () => {
    set({ state: createInitialState(), isLoaded: true });
  },

  updateStat: (name, delta) => {
    set((s) => {
      const newValue = clamp(s.state.stats[name] + delta, 0, 100);
      return {
        state: {
          ...s.state,
          stats: { ...s.state.stats, [name]: newValue },
        },
      };
    });
  },

  updateKPI: (name, delta) => {
    set((s) => {
      let newValue = s.state.kpis[name] + delta;
      // Cash cannot go below 0
      if (name === 'cash') newValue = Math.max(0, newValue);
      return {
        state: {
          ...s.state,
          kpis: { ...s.state.kpis, [name]: newValue },
        },
      };
    });
  },

  updatePath: (name, delta) => {
    set((s) => ({
      state: {
        ...s.state,
        paths: { ...s.state.paths, [name]: Math.max(0, s.state.paths[name] + delta) },
      },
    }));
  },

  advanceTime: (minutes) => {
    set((s) => {
      let newTime = s.state.time + minutes;
      let newDay = s.state.day;
      const newStats = { ...s.state.stats };

      // Day transition
      while (newTime >= 1440) {
        newTime -= 1440;
        newDay += 1;

        const season = getCurrentSeason(newDay);
        const mod = season.modifiers;

        // Season-modified daily stat decay
        newStats.hunger = clamp(newStats.hunger - 15, 0, 100);
        newStats.energy = clamp(newStats.energy - Math.round(5 * mod.energyDecay), 0, 100);
        newStats.mood = clamp(newStats.mood - Math.round(5 * mod.moodDecay), 0, 100);
        newStats.anxiety = clamp(newStats.anxiety + Math.round(3 * mod.anxietyGain), 0, 100);
        newStats.stability = clamp(newStats.stability - Math.round(2 * mod.stabilityDecay), 0, 100);
        newStats.withdrawal = clamp(
          newStats.withdrawal + Math.round(1 * mod.withdrawalRate),
          0, 100
        );

        // Neuro stability daily decay
        const neuroDecay = s.state.neuro.implants.includes('ghost_filter') ? -1 : -2;
        const newNeuroStability = clamp(s.state.neuro.stability + neuroDecay, 0, s.state.neuro.maxStability);

        // Suspicion natural decay (-2/day)
        const suspicionDecay = getSuspicionDecay(newDay);
        const newSuspicion = Math.max(0, (s.state.suspicionLevel ?? 0) - suspicionDecay);

        // Prison sentence: count down days
        let newPrison = s.state.prison;
        let newStatus = s.state.status;
        if (s.state.status === 'PRISON' && newPrison.sentence) {
          const served = (newPrison.sentence.daysServed || 0) + 1;
          const remaining = Math.max(0, newPrison.sentence.totalDays - served);
          newPrison = {
            ...newPrison,
            sentence: { ...newPrison.sentence, daysServed: served, daysRemaining: remaining },
          };
          if (remaining <= 0) {
            newStatus = 'FREE';
          }
        }

        return {
          state: {
            ...s.state,
            day: newDay,
            time: newTime,
            stats: newStats,
            status: newStatus,
            prison: newPrison,
            suspicionLevel: newSuspicion,
            neuro: { ...s.state.neuro, stability: newNeuroStability },
          },
        };
      }

      // Insomnia drain (Summer nights)
      const insomniaDrain = getInsomniaDrain(s.state.day, newTime);
      if (insomniaDrain > 0) {
        newStats.energy = clamp(newStats.energy - insomniaDrain, 0, 100);
      }

      return {
        state: { ...s.state, time: newTime, stats: newStats },
      };
    });
  },

  tick: () => {
    // Called every second — lightweight client-side tick
    // Prison countdown is handled by advanceTime (day-based, not real-time)
    // Hunger/energy drain is handled by advanceTime on action completion
  },

  addItem: (itemId) => {
    set((s) => ({
      state: { ...s.state, inventory: [...s.state.inventory, itemId] },
    }));
  },

  removeItem: (itemId) => {
    set((s) => {
      const idx = s.state.inventory.indexOf(itemId);
      if (idx === -1) return s;
      const newInv = [...s.state.inventory];
      newInv.splice(idx, 1);
      return { state: { ...s.state, inventory: newInv } };
    });
  },

  addLog: (text, type) => {
    set((s) => {
      const entry: LogEntry = {
        text,
        type,
        timestamp: Date.now(),
        day: s.state.day,
      };
      const newLog = [entry, ...s.state.log].slice(0, GAME_CONFIG.MAX_LOG_ENTRIES);
      return { state: { ...s.state, log: newLog } };
    });
  },

  updateSpirit: (key, delta) => {
    set((s) => ({
      state: {
        ...s.state,
        spirit: {
          ...s.state.spirit,
          [key]: clamp(s.state.spirit[key] + delta, 0, 100),
        },
      },
    }));
  },

  setStatus: (status) => {
    set((s) => ({ state: { ...s.state, status } }));
  },

  applyEffects: (effects) => {
    const STAT_KEYS: StatKey[] = ['health', 'energy', 'hunger', 'mood', 'stability', 'anxiety', 'adequacy', 'withdrawal', 'trip', 'synchronization'];
    const KPI_KEYS: KPIKey[] = ['cash', 'respect', 'fame', 'subscribers', 'releases'];
    const PATH_KEYS: PathKey[] = ['music', 'chaos', 'survival'];
    const store = get();

    for (const [key, value] of Object.entries(effects)) {
      const resolved = resolveEffect(value);
      if (STAT_KEYS.includes(key as StatKey)) {
        store.updateStat(key as StatKey, resolved);
      } else if (KPI_KEYS.includes(key as KPIKey)) {
        store.updateKPI(key as KPIKey, resolved);
      } else if (PATH_KEYS.includes(key as PathKey)) {
        store.updatePath(key as PathKey, resolved);
      }
    }
  },

  setSaving: (saving) => set({ isSaving: saving }),
  markSaved: () => set({ lastSavedAt: Date.now() }),

  setState: (state) => set({ state, isLoaded: true }),
}));

// Selector hooks for performance
export const useStats = () => useGameStore((s) => s.state.stats);
export const useKPIs = () => useGameStore((s) => s.state.kpis);
export const usePaths = () => useGameStore((s) => s.state.paths);
export const useSpirit = () => useGameStore((s) => s.state.spirit);
export const useStatus = () => useGameStore((s) => s.state.status);
export const useDay = () => useGameStore((s) => s.state.day);
export const useTime = () => useGameStore((s) => s.state.time);
export const useCasino = () => useGameStore((s) => s.state.casino);
export const useInventory = () => useGameStore((s) => s.state.inventory);
export const useNeuro = () => useGameStore((s) => s.state.neuro);
export const useFarm = () => useGameStore((s) => s.state.farm);
export const useHome = () => useGameStore((s) => s.state.home);
export const useLog = () => useGameStore((s) => s.state.log);
export const useSeason = () => useGameStore((s) => getCurrentSeason(s.state.day));
export { resolveEffect };
