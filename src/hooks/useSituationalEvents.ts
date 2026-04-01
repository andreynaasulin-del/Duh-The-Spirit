'use client';

import { useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGameStore, useSeason } from '@/stores/game-store';
import { rollSituationalEvent, type SituationalEvent, type EventChoice } from '@/config/situational-events';

/** Maps route to location id */
function getLocationFromPath(path: string | null): string {
  if (!path) return 'home';
  if (path.includes('/home')) return 'home';
  if (path.includes('/street')) return 'street';
  if (path.includes('/club')) return 'club';
  if (path.includes('/casino')) return 'casino';
  if (path.includes('/doctor')) return 'doctor';
  if (path.includes('/shop')) return 'shop';
  if (path.includes('/farm')) return 'farm';
  if (path.includes('/prison')) return 'prison';
  return 'home';
}

export function useSituationalEvents() {
  const pathname = usePathname();
  const season = useSeason();
  const [activeEvent, setActiveEvent] = useState<SituationalEvent | null>(null);
  const [eventResult, setEventResult] = useState<string | null>(null);
  const [lastChoice, setLastChoice] = useState<EventChoice | null>(null);
  const actionCountRef = useRef(0);
  const applyEffects = useGameStore((s) => s.applyEffects);
  const addLog = useGameStore((s) => s.addLog);

  /** Call after every successful action */
  const checkForEvent = useCallback(() => {
    actionCountRef.current++;

    // Don't interrupt existing event
    if (activeEvent || eventResult) return;

    // Roll every 2-4 actions (variable to feel organic)
    const threshold = 2 + Math.floor(Math.random() * 2); // 2 or 3
    if (actionCountRef.current % threshold !== 0) return;

    const state = useGameStore.getState().state;
    const location = getLocationFromPath(pathname);

    const statsRecord: Record<string, number> = {
      health: state.stats.health,
      energy: state.stats.energy,
      mood: state.stats.mood,
      stability: state.stats.stability,
      anxiety: state.stats.anxiety,
    };

    const event = rollSituationalEvent(
      location,
      state.day,
      season.id,
      statsRecord,
    );

    if (event) {
      setActiveEvent(event);
    }
  }, [pathname, season.id, activeEvent, eventResult]);

  /** Player makes a choice */
  const makeChoice = useCallback((choice: EventChoice) => {
    // Apply stat effects
    applyEffects(choice.effects);

    // Apply path effects
    if (choice.pathEffect) {
      const pathEffects: Record<string, number> = {};
      for (const [key, val] of Object.entries(choice.pathEffect)) {
        pathEffects[key] = val;
      }
      applyEffects(pathEffects);
    }

    // Log
    addLog(choice.result.substring(0, 60) + '...', 'info');

    // Show result with effects, then dismiss
    setLastChoice(choice);
    setEventResult(choice.result);
    setTimeout(() => {
      setActiveEvent(null);
      setEventResult(null);
      setLastChoice(null);
    }, 5000);
  }, [applyEffects, addLog]);

  /** Dismiss event without choosing (timeout) */
  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
    setEventResult(null);
  }, []);

  return {
    activeEvent,
    eventResult,
    lastChoice,
    checkForEvent,
    makeChoice,
    dismissEvent,
  };
}
