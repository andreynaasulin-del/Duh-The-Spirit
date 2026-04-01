'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Skull, X } from 'lucide-react';
import type { SituationalEvent, EventChoice } from '@/config/situational-events';

interface Props {
  event: SituationalEvent | null;
  result: string | null;
  onChoice: (choice: EventChoice) => void;
  onDismiss: () => void;
}

export function SituationalEventPopup({ event, result, onChoice, onDismiss }: Props) {
  if (!event && !result) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={result ? onDismiss : undefined}
      >
        {/* Event card */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md mx-4 mb-20 p-5 space-y-4"
          style={{
            backgroundColor: '#0a0a0a',
            border: '2px solid rgba(224,64,251,0.3)',
            borderRadius: '16px',
            boxShadow: '0 -10px 40px rgba(224,64,251,0.1), 0 0 60px rgba(0,0,0,0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result view */}
          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-sm text-text-secondary leading-relaxed">{result}</p>
              <p className="text-[10px] text-text-muted text-center">нажми чтобы продолжить</p>
            </motion.div>
          ) : event ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4" style={{ color: '#e040fb' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#e040fb' }}>
                    {event.location === 'any' || event.id.startsWith('spirit') ? 'Дух вмешивается' : 'Ситуация'}
                  </span>
                </div>
                <button onClick={onDismiss} className="p-1 text-text-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event text */}
              <p className="text-sm text-white leading-relaxed">
                {event.text}
              </p>

              {/* Choices */}
              <div className="space-y-2">
                {event.choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onChoice(choice)}
                    className="w-full p-3.5 text-left text-sm font-bold transition-colors"
                    style={{
                      border: i === 0 ? '2px solid rgba(224,64,251,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backgroundColor: i === 0 ? 'rgba(224,64,251,0.08)' : 'rgba(255,255,255,0.03)',
                      color: i === 0 ? '#e040fb' : '#fff',
                    }}
                  >
                    {choice.label}
                  </motion.button>
                ))}
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
