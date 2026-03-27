'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ChevronRight, Droplets, Scissors, AlertTriangle } from 'lucide-react';
import { useGameStore, useSeason } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';
import { getActionsByCategory } from '@/config/actions';

const ICON_MAP: Record<string, React.ElementType> = {
  'leaf': Leaf, 'droplets': Droplets, 'scissors': Scissors,
};

export function FarmView() {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const season = useSeason();
  const { executeAction } = useAction();

  const farmActions = getActionsByCategory('farm');

  const handleAction = (actionId: string) => {
    setBusyAction(actionId);
    executeAction(actionId);
    setTimeout(() => setBusyAction(null), 500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: season.theme.accentColor,
            boxShadow: `0 0 16px ${season.theme.accentGlow}`,
            borderRadius: '10px',
          }}
        >
          <Leaf className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            ЛАБОРАТОРИЯ
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Крипто, эксперименты, рискованный бизнес.
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="manga-panel p-3 flex items-center gap-2" style={{ borderColor: 'var(--color-warning)' }}>
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <p className="text-[10px] text-warning">
          Высокий риск последствий. Влияет на путь «Хаос».
        </p>
      </div>

      {/* Season divider */}
      <div className="chapter-divider"><span>{season.subtitle}</span></div>

      {/* Actions */}
      <div className="space-y-1.5">
        {farmActions.map((action, i) => {
          const Icon = ICON_MAP[action.icon] || Leaf;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.15 }}
              whileTap={{ scale: 0.97, x: 2, y: 2 }}
              onClick={() => handleAction(action.id)}
              disabled={busyAction === action.id}
              className={`card-street p-3 flex items-center gap-3 w-full text-left ${
                busyAction === action.id ? 'opacity-30 pointer-events-none' : ''
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10" style={{ borderRadius: '10px' }}>
                <Icon className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate tracking-tight">{action.title}</p>
                <p className="text-[10px] text-text-muted truncate font-mono">{action.meta}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
