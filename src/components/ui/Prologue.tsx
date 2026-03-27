'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PROLOGUE — The Origin of the Spirit
 *
 * Shown once before difficulty select + tutorial.
 * Cinematic text-only sequence. No emojis. Dark. Atmospheric.
 * Tells how the Spirit (hallucination) first appeared.
 */

const SCENES = [
  {
    text: 'Ты не помнишь когда это началось.',
    delay: 0,
    color: '#ffffff',
    size: 'text-lg',
  },
  {
    text: 'Может, после той ночи в притоне.\nМожет, ещё раньше.',
    delay: 0,
    color: '#aaaaaa',
    size: 'text-base',
  },
  {
    text: 'Голос появился тихо.\nСначала — как шёпот в пустой комнате.',
    delay: 0,
    color: '#888888',
    size: 'text-base',
  },
  {
    text: '«Эй. Ты меня слышишь?»',
    delay: 0,
    color: '#e040fb',
    size: 'text-xl',
    italic: true,
  },
  {
    text: 'Ты оглянулся. Никого.\nНо голос не ушёл.',
    delay: 0,
    color: '#aaaaaa',
    size: 'text-base',
  },
  {
    text: 'Он стал частью тебя.\nТвоей тенью. Твоим Духом.',
    delay: 0,
    color: '#ffffff',
    size: 'text-base',
  },
  {
    text: 'Он знает твои страхи.\nОн знает твои слабости.\nИ он будет использовать их.',
    delay: 0,
    color: '#ff3b3b',
    size: 'text-base',
  },
  {
    text: '«Не бойся. Я — это ты.\nТолько честнее.»',
    delay: 0,
    color: '#e040fb',
    size: 'text-xl',
    italic: true,
  },
  {
    text: 'Район не отпускает.\nНо может, музыка — это выход.',
    delay: 0,
    color: '#aaaaaa',
    size: 'text-base',
  },
  {
    text: 'Или может, нет никакого выхода.\nТолько выбор.',
    delay: 0,
    color: '#ffffff',
    size: 'text-lg',
  },
];

interface PrologueProps {
  onComplete: () => void;
}

export function Prologue({ onComplete }: PrologueProps) {
  const [scene, setScene] = useState(0);
  const [visible, setVisible] = useState(true);
  const current = SCENES[scene];
  const isLast = scene === SCENES.length - 1;

  // Auto-advance or tap to advance
  const advance = () => {
    if (isLast) {
      setVisible(false);
      setTimeout(onComplete, 500);
    } else {
      setScene(s => s + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#000' }}
      onClick={advance}
    >
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Scene text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-xs text-center"
        >
          <p
            className={`${current.size} leading-relaxed whitespace-pre-line ${current.italic ? 'italic' : ''}`}
            style={{ color: current.color, fontWeight: current.italic ? 500 : 400 }}
          >
            {current.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-12 flex gap-1.5">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === scene ? '#e040fb' : i < scene ? 'rgba(224,64,251,0.3)' : 'rgba(255,255,255,0.1)',
              transform: i === scene ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Tap hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 text-[10px] text-white/15"
      >
        нажми чтобы продолжить
      </motion.p>

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-6 right-6 text-[10px] text-white/15 z-20"
      >
        пропустить
      </button>
    </motion.div>
  );
}
