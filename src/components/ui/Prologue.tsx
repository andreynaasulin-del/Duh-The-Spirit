'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PROLOGUE — The Origin of the Spirit
 *
 * Shown once before difficulty select + tutorial.
 * Cinematic text-only sequence. Dark. Atmospheric.
 * Establishes the Spirit as a hallucination only the protagonist can see.
 */

const SCENES = [
  {
    text: 'Ты не помнишь когда это началось.',
    color: '#888888',
    size: 'text-lg',
  },
  {
    text: 'Сначала — шёпот.\nПотом — тени.',
    color: '#ffffff',
    size: 'text-xl',
  },
  {
    text: 'Три дня без сна.\nИ он пришёл.',
    color: '#e040fb',
    size: 'text-lg',
  },
  {
    text: 'Из темноты проступили\nкрасные глаза.',
    color: '#ff3b3b',
    size: 'text-xl',
  },
  {
    text: 'Обычные люди\nне видят его.',
    color: '#888888',
    size: 'text-lg',
  },
  {
    text: 'Но ты — не обычный.',
    color: '#e040fb',
    size: 'text-xl',
    italic: true,
  },
  {
    text: '«Я был здесь всегда.\nТы просто не замечал.»',
    color: '#ff3b3b',
    size: 'text-lg',
    italic: true,
  },
  {
    text: 'Он шепчет.\nПровоцирует.\nВрёт.',
    color: '#ffffff',
    size: 'text-base',
  },
  {
    text: 'Не верь ему.',
    color: '#ff3b3b',
    size: 'text-2xl',
  },
  {
    text: 'Но без него\nты не выберешься.',
    color: '#888888',
    size: 'text-lg',
  },
  {
    text: 'Duh The Spirit',
    color: '#e040fb',
    size: 'text-4xl',
    italic: true,
  },
  {
    text: 'Выживи.\nИли увязни навсегда.',
    color: '#ffffff',
    size: 'text-xl',
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
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Red eyes glow — on the "красные глаза" scene */}
      {scene === 3 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(255,59,59,0.08) 0%, transparent 60%)',
          }}
        />
      )}

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
            style={{
              color: current.color,
              fontWeight: current.italic ? 500 : 400,
              textShadow: current.color === '#ff3b3b'
                ? '0 0 20px rgba(255,59,59,0.3)'
                : current.color === '#e040fb'
                  ? '0 0 20px rgba(224,64,251,0.2)'
                  : 'none',
            }}
          >
            {current.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-12 flex gap-1">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === scene ? '#e040fb' : i < scene ? 'rgba(224,64,251,0.3)' : 'rgba(255,255,255,0.08)',
              transform: i === scene ? 'scale(1.8)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Tap hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-6 text-[10px] text-white/10"
      >
        нажми чтобы продолжить
      </motion.p>

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-6 right-6 text-[10px] text-white/15 z-20 px-2 py-1"
      >
        пропустить
      </button>
    </motion.div>
  );
}
