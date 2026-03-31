'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Share2 } from 'lucide-react';
import type { Ending } from '@/config/endings';

interface EndingScreenProps {
  ending: Ending;
  day: number;
  paths: { music: number; chaos: number; survival: number };
  kpis: { cash: number; respect: number; fame: number };
  onRestart: () => void;
}

const PATH_LABELS: Record<string, { label: string; icon: string }> = {
  music: { label: 'Музыка', icon: '🎵' },
  chaos: { label: 'Хаос', icon: '🔥' },
  survival: { label: 'Выживание', icon: '🛡️' },
};

const KPI_LABELS: Record<string, { label: string; icon: string }> = {
  cash: { label: 'Кэш', icon: '💰' },
  respect: { label: 'Респект', icon: '👊' },
  fame: { label: 'Слава', icon: '⭐' },
};

function handleShare(ending: Ending, day: number) {
  const text = `Я прошёл Duh: The Spirit за ${day} дней и стал — ${ending.title} ${ending.icon}`;
  const botUrl = 'https://t.me/duhthespiritbot';
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;

  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}

export function EndingScreen({ ending, day, paths, kpis, onRestart }: EndingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-y-auto"
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
        className="text-sm text-text-muted tracking-wider mb-6"
      >
        {ending.subtitle}
      </motion.p>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="max-w-sm text-center mb-6 p-4 border border-white/10"
        style={{ borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          {ending.description}
        </p>
      </motion.div>

      {/* Final Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="max-w-sm w-full mb-6 grid grid-cols-3 gap-2"
      >
        {Object.entries(paths).map(([key, value]) => {
          const info = PATH_LABELS[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center p-2 border border-white/5"
              style={{ borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-base">{info.icon}</span>
              <span className="text-[10px] text-text-muted mt-1">{info.label}</span>
              <span className="text-sm font-bold text-text-secondary">{value}</span>
            </div>
          );
        })}
        {Object.entries(kpis).map(([key, value]) => {
          const info = KPI_LABELS[key];
          if (!info) return null;
          return (
            <div
              key={key}
              className="flex flex-col items-center p-2 border border-white/5"
              style={{ borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-base">{info.icon}</span>
              <span className="text-[10px] text-text-muted mt-1">{info.label}</span>
              <span className="text-sm font-bold text-text-secondary">
                {key === 'cash' ? `${(value / 1000).toFixed(0)}K` : value}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Day counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-[11px] text-text-muted font-mono mb-6"
      >
        День {day} • {ending.id === 'lost' ? 'GAME OVER' : 'ФИНАЛ'}
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="flex gap-3"
      >
        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare(ending, day)}
          className="flex items-center gap-2 px-5 py-3 font-bold text-sm tracking-wider"
          style={{
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Share2 className="w-4 h-4" />
          ПОДЕЛИТЬСЯ
        </motion.button>

        {/* Restart */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-3 font-bold text-sm tracking-wider"
          style={{
            color: ending.color,
            border: `2px solid ${ending.color}`,
            borderRadius: '12px',
            backgroundColor: `${ending.color}10`,
          }}
        >
          <RotateCcw className="w-4 h-4" />
          ЗАНОВО
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
