'use client';

import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import type { Ending } from '@/config/endings';

interface EndingScreenProps {
  ending: Ending;
  day: number;
  onRestart: () => void;
}

export function EndingScreen({ ending, day, onRestart }: EndingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
      style={{
        background: `radial-gradient(ellipse at center, ${ending.color}15 0%, #000000 70%)`,
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="text-6xl mb-6"
      >
        {ending.icon}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-black tracking-widest mb-2"
        style={{ color: ending.color }}
      >
        {ending.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-text-muted tracking-wider mb-8"
      >
        {ending.subtitle}
      </motion.p>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="max-w-sm text-center mb-8 p-4 border border-white/10"
        style={{ borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          {ending.description}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-[11px] text-text-muted font-mono mb-8"
      >
        День {day} • {ending.id === 'lost' ? 'GAME OVER' : 'ФИНАЛ'}
      </motion.p>

      {/* Restart button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wider transition-colors"
        style={{
          color: ending.color,
          border: `2px solid ${ending.color}`,
          borderRadius: '12px',
          backgroundColor: `${ending.color}10`,
        }}
      >
        <RotateCcw className="w-4 h-4" />
        НАЧАТЬ ЗАНОВО
      </motion.button>
    </motion.div>
  );
}
