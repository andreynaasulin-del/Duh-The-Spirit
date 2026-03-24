'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/game-store';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { createInitialState } from '@/config/initial-state';
import { GAME_CONFIG, GAME_VERSION } from '@/config/constants';
import type { GameState } from '@/types/game';

/**
 * Handles loading and saving game state to Supabase.
 *
 * Flow:
 * 1. On mount: get userId from localStorage → load from game_states
 * 2. Every 30s: auto-save if state changed since last save
 * 3. On visibilitychange (tab hide / Telegram minimize): immediate save
 * 4. On Telegram close confirmation: save before close
 *
 * Uses Supabase client directly — RLS ensures users can only access own data.
 */
export function useGamePersistence() {
  const supabase = useSupabase();
  const loadState = useGameStore((s) => s.loadState);
  const setState = useGameStore((s) => s.setState);
  const setSaving = useGameStore((s) => s.setSaving);
  const markSaved = useGameStore((s) => s.markSaved);
  const isLoaded = useGameStore((s) => s.isLoaded);

  const userIdRef = useRef<string | null>(null);
  const lastSaveHashRef = useRef<string>('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const connectionFailedRef = useRef(false); // suppress repeated errors

  // Get user ID from localStorage (set during auth)
  const getUserId = useCallback((): string | null => {
    if (userIdRef.current) return userIdRef.current;
    try {
      const raw = localStorage.getItem('pryton_user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      userIdRef.current = user.id || null;
      return userIdRef.current;
    } catch {
      return null;
    }
  }, []);

  // Simple hash for change detection (avoid unnecessary saves)
  const getStateHash = useCallback((): string => {
    const state = useGameStore.getState().state;
    return `${state.day}:${state.time}:${state.kpis.cash}:${state.stats.health}:${state.stats.energy}`;
  }, []);

  // --- SAVE ---
  const saveGame = useCallback(async (force = false): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;
    if (isSavingRef.current && !force) return false;
    if (connectionFailedRef.current) return false; // don't retry after network failure

    // Check if state actually changed
    const currentHash = getStateHash();
    if (!force && currentHash === lastSaveHashRef.current) return true;

    isSavingRef.current = true;
    setSaving(true);

    try {
      const state = useGameStore.getState().state;

      const { error } = await supabase
        .from('game_states')
        .upsert(
          {
            user_id: userId,
            state: state as unknown as Record<string, unknown>,
            version: GAME_VERSION,
            last_saved_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.warn('[Save] Supabase error:', error.message);
        return false;
      }

      lastSaveHashRef.current = currentHash;
      markSaved();
      return true;
    } catch {
      // Network failure — stop retrying until page reload
      if (!connectionFailedRef.current) {
        console.warn('[Save] Network unavailable — saves paused until reconnect');
        connectionFailedRef.current = true;
      }
      return false;
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  }, [supabase, getUserId, getStateHash, setSaving, markSaved]);

  // --- LOAD ---
  const loadGame = useCallback(async (): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) {
      // No user — start fresh
      loadState(createInitialState());
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('game_states')
        .select('state, version')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No saved state — create initial and save
          const initial = createInitialState();
          loadState(initial);
          // Save initial state to DB
          await supabase.from('game_states').insert({
            user_id: userId,
            state: initial as unknown as Record<string, unknown>,
            version: GAME_VERSION,
          });
          return true;
        }
        console.warn('[Load] Supabase error:', error.message);
        loadState(createInitialState());
        return false;
      }

      if (data?.state) {
        // Merge saved state with initial to fill any new fields (version upgrades)
        const saved = data.state as unknown as GameState;
        const initial = createInitialState();
        const merged: GameState = { ...initial, ...saved };

        // Ensure nested objects are merged too
        merged.stats = { ...initial.stats, ...saved.stats };
        merged.kpis = { ...initial.kpis, ...saved.kpis };
        merged.paths = { ...initial.paths, ...saved.paths };
        merged.spirit = { ...initial.spirit, ...saved.spirit };
        merged.neuro = { ...initial.neuro, ...saved.neuro };
        merged.farm = { ...initial.farm, ...saved.farm };
        merged.prison = { ...initial.prison, ...saved.prison };
        merged.casino = { ...initial.casino, ...saved.casino };
        merged.doctor = { ...initial.doctor, ...saved.doctor };
        merged.syndicate = { ...initial.syndicate, ...saved.syndicate };
        merged.home = { ...initial.home, ...saved.home };
        merged.quests = { ...initial.quests, ...saved.quests };
        merged.music = { ...initial.music, ...saved.music };
        merged.world = { ...initial.world, ...saved.world };
        merged.version = GAME_VERSION;

        setState(merged);
        lastSaveHashRef.current = `${merged.day}:${merged.time}:${merged.kpis.cash}:${merged.stats.health}:${merged.stats.energy}`;
        return true;
      }

      loadState(createInitialState());
      return true;
    } catch {
      if (!connectionFailedRef.current) {
        console.warn('[Load] Network unavailable — using local state');
        connectionFailedRef.current = true;
      }
      loadState(createInitialState());
      return false;
    }
  }, [supabase, getUserId, loadState, setState]);

  // --- AUTO-SAVE INTERVAL ---
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      saveGame();
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [isLoaded, saveGame]);

  // --- SAVE ON VISIBILITY CHANGE (tab hide, Telegram minimize) ---
  useEffect(() => {
    if (!isLoaded) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        saveGame(true);
      }
    };

    // Also handle Telegram-specific events
    const handleBeforeUnload = () => {
      saveGame(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoaded, saveGame]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  return { saveGame, loadGame, isLoaded };
}
