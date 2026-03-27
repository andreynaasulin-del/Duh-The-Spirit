'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/game-store';
import { getCurrentSeason, type SeasonId } from '@/config/seasons';

const SEASON_INTROS: Record<SeasonId, { line1: string; line2: string; line3: string }> = {
  autumn: {
    line1: 'Листья падают.',
    line2: 'Мир теряет краски.',
    line3: 'Добро пожаловать в серую полосу.',
  },
  winter: {
    line1: 'Холод пробирает до костей.',
    line2: 'Тревога нарастает.',
    line3: 'Зима не щадит никого.',
  },
  spring: {
    line1: 'Мозг горит.',
    line2: 'Всё кажется возможным.',
    line3: 'GOD MODE: ON',
  },
  summer: {
    line1: 'Бессонные ночи.',
    line2: 'Студия. Тусовки. Трэп.',
    line3: 'Последний акт.',
  },
};

export function SeasonTransition() {
  const day = useGameStore((s) => s.state.day);
  const [showTransition, setShowTransition] = useState(false);
  const [phase, setPhase] = useState(0);
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
      setPhase(0);

      // Haptic
      try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('heavy'); } catch {}

      // Phase timeline
      const t1 = setTimeout(() => setPhase(1), 400);
      const t2 = setTimeout(() => setPhase(2), 1400);
      const t3 = setTimeout(() => setPhase(3), 3200);
      const t4 = setTimeout(() => setShowTransition(false), 5000);

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [season.id]);

  const intro = SEASON_INTROS[season.id];

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: season.theme.bgGradient }}
        >
          {/* Halftone overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle, ${season.theme.accentColor} 1px, transparent 1px)`,
              backgroundSize: '10px 10px',
            }}
          />

          <div className="relative z-10 text-center px-8 max-w-sm">
            {/* Season label */}
            {phase >= 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.3, y: 0 }}
                className="text-[9px] font-bold tracking-[0.5em] uppercase text-white/30 mb-3"
              >
                Смена сезона
              </motion.p>
            )}

            {/* Season name — BIG */}
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                <h1
                  className="text-5xl font-black tracking-wider"
                  style={{
                    color: season.theme.accentColor,
                    textShadow: `0 0 40px ${season.theme.accentGlow}, 0 0 80px ${season.theme.accentGlow}`,
                  }}
                >
                  {season.name.toUpperCase()}
                </h1>
                <p
                  className="text-lg font-bold tracking-widest mt-1"
                  style={{ color: `${season.theme.accentColor}99` }}
                >
                  {season.subtitle}
                </p>
              </motion.div>
            )}

            {/* Intro lines */}
            {phase >= 2 && (
              <div className="mt-8 space-y-2">
                <motion.p
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 0.6, x: 0 }}
                  transition={{ delay: 0 }}
                  className="text-sm text-white/60 italic"
                >
                  {intro.line1}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 0.6, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-white/60 italic"
                >
                  {intro.line2}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-base font-bold"
                  style={{ color: season.theme.accentColor }}
                >
                  {intro.line3}
                </motion.p>
              </div>
            )}

            {/* Description box */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4"
                style={{
                  border: `1px solid ${season.theme.accentColor}30`,
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.4)',
                }}
              >
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {season.description}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
