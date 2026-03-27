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
      {/* Creator card */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: `linear-gradient(135deg, ${season.theme.accentColor}30, ${season.theme.accentColor}10)`,
            border: `2px solid ${season.theme.accentColor}60`,
          }}
        >
          👻
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-white tracking-wide">СОЗДАТЕЛЬ ИГРЫ</p>
          <p className="text-[10px] text-text-muted">@duhdeveloper</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-2">
        <motion.a
          href="https://t.me/duhdeveloper"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.96 }}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
          style={{
            background: 'rgba(42,171,238,0.1)',
            border: '1px solid rgba(42,171,238,0.3)',
            color: '#2AABEE',
            borderRadius: '10px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 8-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/></svg>
          НАПИСАТЬ
        </motion.a>

        <motion.a
          href="https://t.me/duhdeveloperhub"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.96 }}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
          style={{
            background: `${season.theme.accentColor}15`,
            border: `1px solid ${season.theme.accentColor}44`,
            color: season.theme.accentColor,
            borderRadius: '10px',
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          КАНАЛ
        </motion.a>
      </div>
    </motion.div>
  );
}
