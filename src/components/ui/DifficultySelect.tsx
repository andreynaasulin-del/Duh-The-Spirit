'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTIES, type DifficultyMode } from '@/config/difficulty';

interface DifficultySelectProps {
  onSelect: (mode: DifficultyMode) => void;
}

const MODES: DifficultyMode[] = ['light', 'medium', 'from_street'];

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  const [selected, setSelected] = useState<DifficultyMode>('medium');
  const current = DIFFICULTIES[selected];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: '#000' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white tracking-wider mb-2"
      >
        ВЫБЕРИ РЕЖИМ
      </motion.h1>
      <p className="text-[11px] text-white/30 mb-8">Влияет на сложность и механики смерти</p>

      {/* Cards */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {MODES.map((mode, i) => {
          const d = DIFFICULTIES[mode];
          const isSelected = selected === mode;

          return (
            <motion.button
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              onClick={() => setSelected(mode)}
              className="w-full text-left p-4 rounded-xl border transition-all"
              style={{
                borderColor: isSelected ? (mode === 'from_street' ? '#ff3b3b' : mode === 'medium' ? '#ff9800' : '#39ff14') : 'rgba(255,255,255,0.06)',
                backgroundColor: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                boxShadow: isSelected ? `0 0 20px ${mode === 'from_street' ? 'rgba(255,59,59,0.15)' : mode === 'medium' ? 'rgba(255,152,0,0.15)' : 'rgba(57,255,20,0.15)'}` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{d.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-black text-white tracking-wider">{d.name}</p>
                  <p className="text-[10px] text-white/40">{d.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: mode === 'from_street' ? '#ff3b3b' : mode === 'medium' ? '#ff9800' : '#39ff14' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: mode === 'from_street' ? '#ff3b3b' : mode === 'medium' ? '#ff9800' : '#39ff14' }}
                    />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Description */}
      <motion.p
        key={selected}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[12px] text-white/50 text-center mt-6 max-w-xs leading-relaxed"
      >
        {current.description}
      </motion.p>

      {/* Confirm */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(selected)}
        className="mt-8 w-full max-w-xs py-3.5 rounded-xl text-sm font-bold text-black"
        style={{
          backgroundColor: selected === 'from_street' ? '#ff3b3b' : selected === 'medium' ? '#ff9800' : '#39ff14',
        }}
      >
        Начать — {current.name}
      </motion.button>
    </motion.div>
  );
}
