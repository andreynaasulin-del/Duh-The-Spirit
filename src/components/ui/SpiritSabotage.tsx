'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SpiritSabotage as SabotageType } from '@/config/spirit-prompts';

interface SpiritSabotageProps {
  sabotage: SabotageType | null;
}

export function SpiritSabotagePopup({ sabotage }: SpiritSabotageProps) {
  return (
    <AnimatePresence>
      {sabotage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-4 right-4 z-[9998] pointer-events-none"
        >
          <div
            className="max-w-sm mx-auto px-4 py-3 flex items-center gap-3"
            style={{
              background: 'rgba(224, 64, 251, 0.12)',
              border: '1px solid rgba(224, 64, 251, 0.4)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 20px rgba(224, 64, 251, 0.2)',
            }}
          >
            <span className="text-xl shrink-0">👁️</span>
            <div>
              <p className="text-[10px] font-bold text-purple-400 tracking-wider mb-0.5">
                ДУХ ВМЕШИВАЕТСЯ
              </p>
              <p className="text-xs text-white/80 leading-relaxed">
                {sabotage.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
