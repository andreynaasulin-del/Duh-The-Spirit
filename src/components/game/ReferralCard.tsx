'use client';

import { motion } from 'framer-motion';
import { useSeason } from '@/stores/game-store';

interface ReferralCardProps {
  telegramId: string | number;
  referralCount?: number;
}

export function ReferralCard({ telegramId }: ReferralCardProps) {
  const season = useSeason();

  const openCreatorDM = () => {
    try {
      window.Telegram?.WebApp?.openTelegramLink?.('https://t.me/duhdeveloper');
    } catch {
      window.open('https://t.me/duhdeveloper', '_blank');
    }
  };

  return (
    <motion.button
      onClick={openCreatorDM}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(42,171,238,0.05)',
        border: '1px solid rgba(42,171,238,0.15)',
      }}
    >
      <motion.span
        className="text-lg"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
      >
        👻
      </motion.span>
      <div className="flex-1 text-left">
        <p className="text-[11px] font-bold text-white/70">@duhdeveloper</p>
        <p className="text-[9px] text-text-muted">создатель игры</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#2AABEE" className="shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 8-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/></svg>
    </motion.button>
  );
}
