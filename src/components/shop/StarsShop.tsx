'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Zap, Shield, Banknote, Heart, Music, FastForward, Loader2, Check, X,
} from 'lucide-react';
import { STARS_PRODUCTS, type StarsProduct } from '@/config/stars-shop';
import { useStars } from '@/hooks/useStars';
import { useSeason } from '@/stores/game-store';

const ICON_MAP: Record<string, React.ElementType> = {
  'zap': Zap, 'shield': Shield, 'banknote': Banknote,
  'heart': Heart, 'music': Music, 'fast-forward': FastForward,
};

const CATEGORY_LABELS: Record<string, string> = {
  boost: 'БУСТЫ',
  unlock: 'РАЗБЛОКИРОВКИ',
  cosmetic: 'КОСМЕТИКА',
};

interface ProductCardProps {
  product: StarsProduct;
  onBuy: () => void;
  isBuying: boolean;
  status: string;
  index: number;
}

function ProductCard({ product, onBuy, isBuying, status, index }: ProductCardProps) {
  const Icon = ICON_MAP[product.icon] || Star;
  const season = useSeason();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="manga-panel p-3"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 border"
          style={{
            borderColor: season.theme.accentColor,
            borderRadius: '2px',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary tracking-tight">{product.title}</p>
          <p className="text-[10px] text-text-muted mt-0.5">{product.description}</p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onBuy}
        disabled={isBuying}
        className="mt-3 w-full py-2 flex items-center justify-center gap-2 font-bold text-xs tracking-wider"
        style={{
          background: isBuying
            ? 'rgba(255,255,255,0.05)'
            : `linear-gradient(135deg, ${season.theme.accentColor}22, ${season.theme.accentGlow}22)`,
          border: `1px solid ${season.theme.accentColor}44`,
          color: season.theme.accentColor,
          borderRadius: '2px',
          opacity: isBuying ? 0.5 : 1,
        }}
      >
        {isBuying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : status === 'success' ? (
          <>
            <Check className="w-3.5 h-3.5" />
            ПОЛУЧЕНО
          </>
        ) : (
          <>
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            {product.stars} STARS
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

export function StarsShop() {
  const { purchase, status, activeProduct, isLoading } = useStars();
  const season = useSeason();

  const categories = [...new Set(STARS_PRODUCTS.map(p => p.category))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: '#FFD700',
            boxShadow: '3px 3px 0px rgba(255,215,0,0.3)',
            borderRadius: '2px',
          }}
        >
          <Star className="w-6 h-6" style={{ color: '#FFD700' }} fill="#FFD700" />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: '#FFD700' }}>
            STARS SHOP
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Telegram Stars — буст для твоего пути
          </p>
        </div>
      </div>

      {/* Status feedback */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="manga-panel p-3 text-center"
            style={{ borderColor: 'var(--color-neon-green)' }}
          >
            <p className="text-xs font-bold" style={{ color: 'var(--color-neon-green)' }}>
              ПОКУПКА УСПЕШНА
            </p>
          </motion.div>
        )}
        {status === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="manga-panel p-3 text-center"
            style={{ borderColor: 'var(--color-warning)' }}
          >
            <p className="text-xs font-bold" style={{ color: 'var(--color-warning)' }}>
              ОТМЕНЕНО
            </p>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="manga-panel p-3 text-center"
            style={{ borderColor: 'var(--color-danger)' }}
          >
            <p className="text-xs font-bold" style={{ color: 'var(--color-danger)' }}>
              ОШИБКА ОПЛАТЫ
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products */}
      <div className="space-y-2">
        {STARS_PRODUCTS.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            onBuy={() => purchase(product.id)}
            isBuying={isLoading && activeProduct === product.id}
            status={activeProduct === product.id ? status : 'idle'}
            index={i}
          />
        ))}
      </div>

      {/* Info */}
      <div className="manga-panel p-3">
        <p className="text-[10px] text-text-muted text-center leading-relaxed">
          Оплата через Telegram Stars. Все покупки применяются мгновенно.
          Возврат — через поддержку Telegram.
        </p>
      </div>
    </motion.div>
  );
}
