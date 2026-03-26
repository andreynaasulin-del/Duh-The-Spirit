'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/game-store';
import { getCurrentSeason } from '@/config/seasons';

export function SeasonTransition() {
  const day = useGameStore((s) => s.state.day);
  const [showTransition, setShowTransition] = useState(false);
  const prevSeasonRef = useRef<string | null>(null);

  const season = getCurrentSeason(day);

  useEffect(() => {
    if (prevSeasonRef.current === null) {
      prevSeasonRef.current = season.id;
      return;
    }

    if (prevSeasonRef.current !== season.id) {
      prevSeasonRef.current = season.id;
      setShowTransition(true);
      const timer = setTimeout(() => setShowTransition(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [season.id]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${season.theme.accentColor}20 0%, transparent 60%)`,
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-mono tracking-[0.3em] text-text-muted mb-3"
          >
            СМЕНА СЕЗОНА
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
            className="text-4xl font-black tracking-widest mb-2"
            style={{ color: season.theme.accentColor }}
          >
            {season.name.toUpperCase()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm tracking-wider"
            style={{ color: `${season.theme.accentColor}aa` }}
          >
            {season.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.9 }}
            className="text-[11px] text-text-muted mt-4 max-w-xs text-center"
          >
            {season.description}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
