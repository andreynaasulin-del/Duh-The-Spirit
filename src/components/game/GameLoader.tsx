'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGamePersistence } from '@/hooks/useGamePersistence';
import { useGameStore } from '@/stores/game-store';
import { Skull } from 'lucide-react';
import { checkEnding } from '@/config/endings';
import { EndingScreen } from '@/components/ui/EndingScreen';
import { Tutorial } from '@/components/ui/Tutorial';
import { INITIAL_STATE } from '@/config/initial-state';

interface GameLoaderProps {
  children: React.ReactNode;
}

/**
 * Wraps game content. Shows loading screen while state loads from Supabase.
 * Checks for game over / ending conditions each render.
 */
export function GameLoader({ children }: GameLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [authDone, setAuthDone] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  useGamePersistence();
  const isLoaded = useGameStore((s) => s.isLoaded);
  const day = useGameStore((s) => s.state.day);
  const paths = useGameStore((s) => s.state.paths);
  const kpis = useGameStore((s) => s.state.kpis);
  const stats = useGameStore((s) => s.state.stats);

  useEffect(() => {
    setMounted(true);

    // Show tutorial on first visit
    if (!localStorage.getItem('duh_tutorial_done')) {
      setShowTutorial(true);
    }

    // Auto-register user on game load
    async function autoAuth() {
      // Skip if already registered this session
      if (localStorage.getItem('duh_user')) {
        setAuthDone(true);
        return;
      }

      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData) {
        // Not in Telegram — dev mode, skip auth
        setAuthDone(true);
        return;
      }

      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('duh_user', JSON.stringify(data.user));
          }
        }
      } catch (e) {
        console.error('Auto-auth failed:', e);
      }

      setAuthDone(true);
    }

    autoAuth();
  }, []);

  // Check for ending
  const ending = useMemo(() => {
    if (!isLoaded || day < 2) return null; // Don't check on day 1
    return checkEnding({
      day,
      paths,
      kpis: { cash: kpis.cash, respect: kpis.respect, fame: kpis.fame },
      stats: { stability: stats.stability, health: stats.health, mood: stats.mood, energy: stats.energy },
    });
  }, [isLoaded, day, paths, kpis, stats]);

  const handleRestart = () => {
    useGameStore.setState({ state: { ...INITIAL_STATE }, isLoaded: true });
  };

  // Loading screen
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-bg-primary">
        <div
          className="w-12 h-12 border-2 flex items-center justify-center"
          style={{ borderColor: '#ff2d7b', borderRadius: '10px' }}
        >
          <Skull className="w-6 h-6 animate-pulse" style={{ color: '#ff2d7b' }} />
        </div>
        <p className="text-text-muted text-sm font-mono tracking-wider">ЗАГРУЗКА...</p>
      </div>
    );
  }

  // Tutorial (first visit only)
  if (showTutorial) {
    return (
      <Tutorial onComplete={() => {
        localStorage.setItem('duh_tutorial_done', '1');
        setShowTutorial(false);
      }} />
    );
  }

  // Ending screen
  if (ending) {
    return <EndingScreen ending={ending} day={day} onRestart={handleRestart} />;
  }

  return <>{children}</>;
}
