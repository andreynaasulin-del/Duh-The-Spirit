'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Share2, Check } from 'lucide-react';
import { generateReferralLink, getShareText } from '@/lib/referral';
import { useSeason } from '@/stores/game-store';

interface ReferralCardProps {
  telegramId: string | number;
  referralCount?: number;
}

export function ReferralCard({ telegramId, referralCount = 0 }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const season = useSeason();
  const link = generateReferralLink(telegramId);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [link]);

  const handleShare = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    // Use Telegram's native share if available
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(getShareText())}`;
    window.open(shareUrl, '_blank');
  }, [link]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="manga-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" style={{ color: season.theme.accentColor }} />
        <span className="manga-label">ПРИГЛАСИ ДРУГА</span>
        {referralCount > 0 && (
          <span
            className="text-[10px] font-mono font-bold ml-auto px-1.5 py-0.5"
            style={{
              color: season.theme.accentColor,
              border: `1px solid ${season.theme.accentColor}44`,
              borderRadius: '1px',
            }}
          >
            {referralCount} чел.
          </span>
        )}
      </div>

      <p className="text-[11px] text-text-muted">
        +500₽ тебе и +300₽ другу за каждого приглашённого
      </p>

      {/* Link display */}
      <div
        className="flex items-center gap-2 p-2 text-[10px] font-mono text-text-muted truncate"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '2px',
        }}
      >
        <span className="truncate flex-1">{link}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCopy}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
          style={{
            background: copied ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? 'var(--color-neon-green)' : 'rgba(255,255,255,0.1)'}`,
            color: copied ? 'var(--color-neon-green)' : 'var(--color-text-secondary)',
            borderRadius: '2px',
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
          style={{
            background: `${season.theme.accentColor}15`,
            border: `1px solid ${season.theme.accentColor}44`,
            color: season.theme.accentColor,
            borderRadius: '2px',
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          ПОДЕЛИТЬСЯ
        </motion.button>
      </div>
    </motion.div>
  );
}
