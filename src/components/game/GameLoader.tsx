'use client';

import { useState, useEffect } from 'react';
import { useGamePersistence } from '@/hooks/useGamePersistence';
import { useGameStore } from '@/stores/game-store';
import { Skull } from 'lucide-react';

interface GameLoaderProps {
  children: React.ReactNode;
}

/**
 * Wraps game content. Shows loading screen while state loads from Supabase.
 * Uses mounted state to prevent hydration mismatch.
 */
export function GameLoader({ children }: GameLoaderProps) {
  const [mounted, setMounted] = useState(false);
  useGamePersistence();
  const isLoaded = useGameStore((s) => s.isLoaded);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and first client render, show nothing to avoid hydration mismatch
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-bg-primary">
        <div
          className="w-12 h-12 border-2 flex items-center justify-center"
          style={{ borderColor: '#ff2d7b', borderRadius: '2px' }}
        >
          <Skull className="w-6 h-6 animate-pulse" style={{ color: '#ff2d7b' }} />
        </div>
        <p className="text-text-muted text-sm font-mono tracking-wider">ЗАГРУЗКА...</p>
      </div>
    );
  }

  return <>{children}</>;
}
