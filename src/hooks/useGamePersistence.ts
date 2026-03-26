'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/game-store';
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
      // Check both keys (new and legacy)
      const raw = localStorage.getItem('duh_user') || localStorage.getItem('pryton_user');
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

  // --- SAVE (via API route with service role) ---
  const saveGame = useCallback(async (force = false): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;
    if (isSavingRef.current && !force) return false;
    if (connectionFailedRef.current) return false;

    const currentHash = getStateHash();
    if (!force && currentHash === lastSaveHashRef.current) return true;

    isSavingRef.current = true;
    setSaving(true);

    try {
      const state = useGameStore.getState().state;

      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, state }),
      });

      if (!res.ok) {
        console.warn('[Save] API error:', res.status);
        return false;
      }

      lastSaveHashRef.current = currentHash;
      markSaved();
      return true;
    } catch {
      if (!connectionFailedRef.current) {
        console.warn('[Save] Network unavailable');
        connectionFailedRef.current = true;
      }
      return false;
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  }, [getUserId, getStateHash, setSaving, markSaved]);

  // --- LOAD (via API route with service role) ---
  const loadGame = useCallback(async (): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) {
      loadState(createInitialState());
      return true;
    }

    try {
      const res = await fetch('/api/game/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        console.warn('[Load] API error:', res.status);
        loadState(createInitialState());
        return false;
      }

      const { state: savedState } = await res.json();

      if (savedState) {
        const saved = savedState as GameState;
        const initial = createInitialState();
        const merged: GameState = { ...initial, ...saved };

        // Ensure nested objects are merged
        merged.stats = { ...initial.stats, ...saved.stats };
        merged.kpis = { ...initial.kpis, ...saved.kpis };
        merged.paths = { ...initial.paths, ...saved.paths };
        merged.spirit = { ...initial.spirit, ...(saved.spirit || {}) };
        merged.neuro = { ...initial.neuro, ...(saved.neuro || {}) };
        merged.farm = { ...initial.farm, ...(saved.farm || {}) };
        merged.prison = { ...initial.prison, ...(saved.prison || {}) };
        merged.casino = { ...initial.casino, ...(saved.casino || {}) };
        merged.doctor = { ...initial.doctor, ...(saved.doctor || {}) };
        merged.syndicate = { ...initial.syndicate, ...(saved.syndicate || {}) };
        merged.home = { ...initial.home, ...(saved.home || {}) };
        merged.quests = { ...initial.quests, ...(saved.quests || {}) };
        merged.music = { ...initial.music, ...(saved.music || {}) };
        merged.world = { ...initial.world, ...(saved.world || {}) };
        merged.daily = { ...initial.daily, ...(saved.daily || {}) };
        merged.version = GAME_VERSION;

        setState(merged);
        lastSaveHashRef.current = `${merged.day}:${merged.time}:${merged.kpis.cash}:${merged.stats.health}:${merged.stats.energy}`;
        return true;
      }

      // No saved state — create initial and save
      const initial = createInitialState();
      loadState(initial);
      await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, state: initial }),
      });
      return true;
    } catch {
      if (!connectionFailedRef.current) {
        console.warn('[Load] Network unavailable');
        connectionFailedRef.current = true;
      }
      loadState(createInitialState());
      return false;
    }
  }, [getUserId, loadState, setState]);

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
