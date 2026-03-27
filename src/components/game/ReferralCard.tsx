'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Share2, Check } from 'lucide-react';
import { useSeason } from '@/stores/game-store';

interface ReferralCardProps {
  telegramId: string | number;
  referralCount?: number;
}

export function ReferralCard({ telegramId, referralCount = 0 }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const season = useSeason();
  const link = `https://t.me/duhthespiritbot?start=ref_${telegramId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success'); } catch {}
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const handleShare = useCallback(() => {
    const text = 'Залетай в Duh The Spirit. Выживай. Зарабатывай. Не теряй рассудок.';
    try {
      window.Telegram?.WebApp?.openTelegramLink?.(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
      );
    } catch {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  }, [link]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl space-y-2.5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5" style={{ color: season.theme.accentColor }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Пригласи друга</span>
        {referralCount > 0 && (
          <span className="text-[9px] font-mono ml-auto" style={{ color: season.theme.accentColor }}>
            +{referralCount}
          </span>
        )}
      </div>

      <p className="text-[10px] text-text-muted">
        +5,000₽ тебе и +3,000₽ другу
      </p>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCopy}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold"
          style={{
            background: copied ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? 'var(--color-neon-green)' : 'rgba(255,255,255,0.08)'}`,
            color: copied ? 'var(--color-neon-green)' : 'var(--color-text-muted)',
            borderRadius: '8px',
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold"
          style={{
            background: `${season.theme.accentColor}10`,
            border: `1px solid ${season.theme.accentColor}30`,
            color: season.theme.accentColor,
            borderRadius: '8px',
          }}
        >
          <Share2 className="w-3 h-3" />
          ПОДЕЛИТЬСЯ
        </motion.button>
      </div>
    </motion.div>
  );
}
