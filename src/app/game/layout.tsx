'use client';

import { type ReactNode } from 'react';
import { HUD } from '@/components/game/HUD';
import { NavBar } from '@/components/game/NavBar';
import { SeasonThemeProvider } from '@/components/providers/SeasonThemeProvider';
import { GameLoader } from '@/components/game/GameLoader';
import { SeasonParticles } from '@/components/effects/SeasonParticles';

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <GameLoader>
      <SeasonThemeProvider>
        <div className="min-h-dvh flex flex-col bg-bg-primary relative">
          <SeasonParticles />
          <HUD />
          <main className="flex-1 overflow-y-auto pb-20">
            {children}
          </main>
          <NavBar />
        </div>
      </SeasonThemeProvider>
    </GameLoader>
  );
}
