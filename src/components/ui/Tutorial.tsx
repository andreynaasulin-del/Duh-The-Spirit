'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STEPS = [
  {
    icon: '👁️',
    title: 'ДУХ',
    text: 'Это Дух — твоя галлюцинация. Он будет шептать, провоцировать и пугать. Не доверяй ему. Но и не игнорируй.',
    color: '#e040fb',
  },
  {
    icon: '🎤',
    title: '4 СЕЗОНА',
    text: 'Осень — депрессия. Зима — тревога. Весна — мания. Лето — бессонница. Каждый сезон меняет правила игры.',
    color: '#c47a3a',
  },
  {
    icon: '⚖️',
    title: '3 ПУТИ',
    text: '🎵 Музыка — стань рэпером\n💀 Хаос — стань авторитетом\n🛡 Выживание — просто выживи\n\nТвои действия определяют путь.',
    color: '#00e5ff',
  },
  {
    icon: '❤️',
    title: 'СТАТЫ',
    text: 'Следи за здоровьем, энергией, настроением и стабильностью. Если стабильность упадёт до нуля — Game Over.',
    color: '#ff3b3b',
  },
  {
    icon: '💰',
    title: 'ВЫЖИВАНИЕ',
    text: 'Зарабатывай хастлом, музыкой или тёмными делами. Покупай еду, одежду, лечись. Деньги — это свобода.',
    color: '#39ff14',
  },
  {
    icon: '⚠️',
    title: 'ПОДОЗРЕНИЕ',
    text: 'Тёмные дела повышают подозрение. Слишком много — и тебя арестуют. Тюрьма — это не конец, но ты потеряешь многое.',
    color: '#ff9800',
  },
  {
    icon: '🎮',
    title: 'НАЧНИ',
    text: 'Прими первый квест на Базе. Делай выборы. Каждый клик — последствия. Удачи, и... не слушай Духа.',
    color: '#e040fb',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: '#000' }}
    >
      {/* Spirit image on first slide */}
      {step === 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-32 h-32 rounded-full overflow-hidden border-2 border-purple-400/60 mb-4"
        >
          <Image
            src="/spirit.png"
            alt="Дух"
            width={128}
            height={128}
            className="object-cover"
            style={{ mixBlendMode: 'lighten' }}
          />
        </motion.div>
      )}

      {/* Step icon */}
      {step > 0 && (
        <motion.span
          key={step}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-5xl mb-4"
        >
          {current.icon}
        </motion.span>
      )}

      {/* Title */}
      <motion.h1
        key={`title-${step}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black tracking-wider mb-3"
        style={{ color: current.color }}
      >
        {current.title}
      </motion.h1>

      {/* Text */}
      <motion.p
        key={`text-${step}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-white/90 text-center leading-relaxed max-w-xs whitespace-pre-line"
      >
        {current.text}
      </motion.p>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: i === step ? current.color : 'rgba(255,255,255,0.15)',
              transform: i === step ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8 w-full max-w-xs">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 text-sm font-bold text-white/40"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
            }}
          >
            Назад
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setStep(step + 1)}
          className="flex-1 py-3 text-sm font-bold text-black"
          style={{
            backgroundColor: current.color,
            borderRadius: '10px',
          }}
        >
          {isLast ? 'Начать игру' : 'Далее'}
        </button>
      </div>

      {/* Skip */}
      {!isLast && (
        <button
          onClick={onComplete}
          className="mt-4 text-[11px] text-white/20"
        >
          Пропустить
        </button>
      )}
    </motion.div>
  );
}
