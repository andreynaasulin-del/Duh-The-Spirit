'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGamePersistence } from '@/hooks/useGamePersistence';
import { useGameStore } from '@/stores/game-store';
import { Skull } from 'lucide-react';
import { checkEnding, checkGameOver } from '@/config/endings';
import { EndingScreen } from '@/components/ui/EndingScreen';
import { Tutorial } from '@/components/ui/Tutorial';
import { DifficultySelect } from '@/components/ui/DifficultySelect';
import { Prologue } from '@/components/ui/Prologue';
import { INITIAL_STATE, createInitialState } from '@/config/initial-state';

interface GameLoaderProps {
  children: React.ReactNode;
}

/**
 * Wraps game content. Shows loading screen while state loads from Supabase.
 * Checks for game over / ending conditions each render.
 */
export function GameLoader({ children }: GameLoaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPrologue, setShowPrologue] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [authDone, setAuthDone] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  useGamePersistence();
  const isLoaded = useGameStore((s) => s.isLoaded);
  const day = useGameStore((s) => s.state.day);
  const paths = useGameStore((s) => s.state.paths);
  const kpis = useGameStore((s) => s.state.kpis);
  const stats = useGameStore((s) => s.state.stats);
  const freeMode = useGameStore((s) => s.state.freeMode);

  useEffect(() => {
    setMounted(true);

    // Force reset for v2 launch (remove after first wave)
    if (!localStorage.getItem('duh_v3_reset')) {
      localStorage.removeItem('duh_prologue_done');
      localStorage.removeItem('duh_difficulty_chosen');
      localStorage.removeItem('duh_tutorial_done');
      localStorage.removeItem('duh_user');
      localStorage.removeItem('pryton_user');
      localStorage.removeItem('duh_demo');
      localStorage.setItem('duh_v3_reset', '1');
    }

    // Flow: prologue → difficulty → tutorial (first visit only)
    if (!localStorage.getItem('duh_prologue_done')) {
      setShowPrologue(true);
    } else if (!localStorage.getItem('duh_difficulty_chosen')) {
      setShowDifficulty(true);
    } else if (!localStorage.getItem('duh_tutorial_done')) {
      setShowTutorial(true);
    }

    // Auto-register user on game load
    async function autoAuth() {
      // Check demo mode
      if (localStorage.getItem('duh_demo')) {
        setIsDemo(true);
        setAuthDone(true);
        return;
      }

      // Skip if already registered
      if (localStorage.getItem('duh_user')) {
        setAuthDone(true);
        return;
      }

      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData) {
        // Not in Telegram and not demo — redirect to auth
        router.replace('/auth');
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

  // Check for ending (skip in free mode — only check game over)
  const ending = useMemo(() => {
    if (!isLoaded || day < 2) return null;
    if (freeMode) {
      // In free mode, only check game over (death), not day 360 endings
      return checkGameOver({
        day, paths,
        kpis: { cash: kpis.cash, respect: kpis.respect, fame: kpis.fame },
        stats: { stability: stats.stability, health: stats.health, mood: stats.mood, energy: stats.energy },
      });
    }
    return checkEnding({
      day, paths,
      kpis: { cash: kpis.cash, respect: kpis.respect, fame: kpis.fame },
      stats: { stability: stats.stability, health: stats.health, mood: stats.mood, energy: stats.energy },
    });
  }, [isLoaded, day, paths, kpis, stats, freeMode]);

  // Restart from scratch
  const handleRestart = () => {
    const prev = useGameStore.getState().state;
    const fresh = createInitialState();
    // Preserve completed endings across restarts
    fresh.completedEndings = prev.completedEndings || [];
    useGameStore.setState({ state: fresh, isLoaded: true });
  };

  // Continue in free mode (post-ending sandbox)
  const handleContinue = () => {
    const store = useGameStore.getState();
    const endingId = ending?.id;
    const completed = [...(store.state.completedEndings || [])];
    if (endingId && !completed.includes(endingId)) completed.push(endingId);
    store.setState({
      ...store.state,
      freeMode: true,
      completedEndings: completed,
    });
  };

  // New Game+ — restart with bonuses from ending
  const handleNewGamePlus = () => {
    const prev = useGameStore.getState().state;
    const endingId = ending?.id;
    const completed = [...(prev.completedEndings || [])];
    if (endingId && !completed.includes(endingId)) completed.push(endingId);

    const fresh = createInitialState();
    fresh.completedEndings = completed;

    // Bonuses based on achieved ending
    const bonuses: Record<string, { fame?: number; respect?: number; cash?: number }> = {
      rapper:   { fame: 20, cash: 5000 },
      boss:     { respect: 20, cash: 5000 },
      npc:      { cash: 10000 },
      legend:   { fame: 30, respect: 30, cash: 8000 },
      survivor: { cash: 3000 },
      lost:     {},
    };

    const bonus = bonuses[endingId || ''] || {};
    fresh.kpis.fame += bonus.fame || 0;
    fresh.kpis.respect += bonus.respect || 0;
    fresh.kpis.cash += bonus.cash || 0;
    fresh.ngPlusBonus = {
      startingFame: bonus.fame || 0,
      startingRespect: bonus.respect || 0,
      startingCash: bonus.cash || 0,
    };

    useGameStore.setState({ state: fresh, isLoaded: true });
    // Skip prologue/tutorial on NG+
    localStorage.setItem('duh_prologue_done', '1');
    localStorage.setItem('duh_difficulty_chosen', '1');
    localStorage.setItem('duh_tutorial_done', '1');
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

  // Prologue (first visit, before everything)
  if (showPrologue) {
    return (
      <Prologue onComplete={() => {
        localStorage.setItem('duh_prologue_done', '1');
        setShowPrologue(false);
        setShowDifficulty(true);
      }} />
    );
  }

  // Difficulty select (first visit, before tutorial)
  if (showDifficulty) {
    return (
      <DifficultySelect onSelect={(mode) => {
        localStorage.setItem('duh_difficulty_chosen', '1');
        const store = useGameStore.getState();
        store.setState({ ...store.state, difficulty: mode });
        setShowDifficulty(false);
        if (!localStorage.getItem('duh_tutorial_done')) {
          setShowTutorial(true);
        }
      }} />
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
    return (
      <EndingScreen
        ending={ending}
        day={day}
        paths={paths}
        kpis={{ cash: kpis.cash, respect: kpis.respect, fame: kpis.fame }}
        onRestart={handleRestart}
        onContinue={ending.id !== 'lost' ? handleContinue : undefined}
        onNewGamePlus={handleNewGamePlus}
      />
    );
  }

  return <>{children}</>;
}
