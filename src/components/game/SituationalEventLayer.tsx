'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/game-store';
import { useSituationalEvents } from '@/hooks/useSituationalEvents';
import { SituationalEventPopup } from '@/components/ui/SituationalEventPopup';

/**
 * Global layer that triggers situational events when game day/time changes.
 * Mounted once in game layout — works across all locations.
 */
export function SituationalEventLayer() {
  const { activeEvent, eventResult, checkForEvent, makeChoice, dismissEvent } = useSituationalEvents();
  const day = useGameStore((s) => s.state.day);
  const time = useGameStore((s) => s.state.time);
  const prevTimeRef = useRef({ day, time });

  // Detect when time advances (= action was performed)
  useEffect(() => {
    const prev = prevTimeRef.current;
    if (day !== prev.day || time !== prev.time) {
      prevTimeRef.current = { day, time };
      // Time changed = action was executed. Check for event.
      checkForEvent();
    }
  }, [day, time, checkForEvent]);

  return (
    <SituationalEventPopup
      event={activeEvent}
      result={eventResult}
      onChoice={makeChoice}
      onDismiss={dismissEvent}
    />
  );
}
