'use client';

import { useEffect } from 'react';
import { useSeason } from '@/stores/game-store';

/**
 * Dynamically applies season-based CSS variables to <html>.
 * This changes the entire color scheme per season without page reload.
 */
export function SeasonThemeProvider({ children }: { children: React.ReactNode }) {
  const season = useSeason();

  useEffect(() => {
    const root = document.documentElement;
    const { theme } = season;

    root.style.setProperty('--season-bg', theme.bgGradient);
    root.style.setProperty('--season-accent', theme.accentColor);
    root.style.setProperty('--season-glow', theme.accentGlow);
    root.style.setProperty('--season-hud-tint', theme.hudTint);
    root.style.setProperty('--season-filter', theme.moodFilter);
    root.dataset.season = season.id;
  }, [season]);

  return <>{children}</>;
}
