'use client';

import { type ReactNode } from 'react';
import { HUD } from '@/components/game/HUD';
import { NavBar } from '@/components/game/NavBar';
import { SeasonThemeProvider } from '@/components/providers/SeasonThemeProvider';
import { GameLoader } from '@/components/game/GameLoader';
import { SeasonParticles } from '@/components/effects/SeasonParticles';
import { SeasonTransition } from '@/components/ui/SeasonTransition';
import { DailyRewardPopup } from '@/components/ui/DailyRewardPopup';
import { SpiritPopup } from '@/components/game/SpiritPopup';
import { MissionHint } from '@/components/ui/MissionHint';
import { SituationalEventLayer } from '@/components/game/SituationalEventLayer';

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <GameLoader>
      <SeasonThemeProvider>
        <div className="min-h-dvh flex flex-col bg-bg-primary relative">
          <SeasonParticles />
          <SeasonTransition />
          <DailyRewardPopup />
          <HUD />
          <MissionHint />
          <main className="flex-1 overflow-y-auto pb-16">
            {children}
          </main>
          <SpiritPopup />
          <SituationalEventLayer />
          <NavBar />
        </div>
      </SeasonThemeProvider>
    </GameLoader>
  );
}
