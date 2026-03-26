'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ChevronRight, Apple, Shirt, Smartphone, Pill,
  Package, Headphones, Coins,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';
import { getActionsByCategory } from '@/config/actions';
import { StarsShop } from '@/components/shop/StarsShop';

const ICON_MAP: Record<string, React.ElementType> = {
  'apple': Apple, 'shirt': Shirt, 'smartphone': Smartphone, 'pill': Pill,
  'package': Package, 'headphones': Headphones,
};

export function ShopView() {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const { executeAction } = useAction();

  const shopActions = getActionsByCategory('shop');

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
          <ShoppingCart className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            МАРКЕТ
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Купить, продать, экипировка.
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="manga-panel p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" style={{ color: 'var(--color-neon-green)' }} />
          <span className="manga-label">БАЛАНС</span>
        </div>
        <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-neon-green)' }}>
          {kpis.cash.toLocaleString()}₽
        </span>
      </div>

      {/* Season divider */}
      <div className="chapter-divider"><span>{season.subtitle}</span></div>

      {/* Actions */}
      <div className="space-y-1.5">
        {shopActions.map((action, i) => {
          const Icon = ICON_MAP[action.icon] || ShoppingCart;
          const isBuy = action.id.startsWith('buy_');
          const cost = isBuy ? Math.abs(typeof action.effects.cash === 'number' ? action.effects.cash : 0) : 0;
          const cantAfford = isBuy && cost > 0 && kpis.cash < cost;

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.15 }}
              whileTap={{ scale: 0.97, x: 2, y: 2 }}
              onClick={() => handleAction(action.id)}
              disabled={busyAction === action.id || cantAfford}
              className={`card-street p-3 flex items-center gap-3 w-full text-left ${
                (busyAction === action.id || cantAfford) ? 'opacity-30 pointer-events-none' : ''
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10" style={{ borderRadius: '10px' }}>
                <Icon className="w-4 h-4" style={{ color: isBuy ? 'var(--color-warning)' : 'var(--color-neon-green)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate tracking-tight">{action.title}</p>
                <p className="text-[10px] text-text-muted truncate font-mono">{action.meta}</p>
              </div>
              {cantAfford && (
                <span className="text-[8px] font-bold text-danger shrink-0">МАЛО ₽</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* === TELEGRAM STARS SHOP === */}
      <div className="chapter-divider"><span>⭐ Премиум</span></div>
      <StarsShop />
    </motion.div>
  );
}
