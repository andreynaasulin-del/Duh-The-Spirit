'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/stores/game-store';
import { getProduct, type StarsProduct } from '@/config/stars-shop';

type PurchaseStatus = 'idle' | 'loading' | 'success' | 'cancelled' | 'error';

export function useStars() {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  const applyEffects = useGameStore((s) => s.applyEffects);
  const advanceDays = useGameStore((s) => s.advanceTime);

  const purchase = useCallback(async (productId: string) => {
    const product = getProduct(productId);
    if (!product) return;

    setActiveProduct(productId);
    setStatus('loading');

    try {
      // Request invoice URL from our API
      const res = await fetch('/api/stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const tg = window.Telegram?.WebApp;

      if (!tg?.openInvoice) {
        // Not inside Telegram — cannot process real payment
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
          setActiveProduct(null);
        }, 2000);
        return;
      }

      // Open Telegram payment dialog
      tg.openInvoice(data.invoiceUrl, (paymentStatus) => {
        if (paymentStatus === 'paid') {
          applyProductEffects(product);
          setStatus('success');
          tg.HapticFeedback.notificationOccurred('success');
        } else if (paymentStatus === 'cancelled') {
          setStatus('cancelled');
        } else {
          setStatus('error');
        }

        setTimeout(() => {
          setStatus('idle');
          setActiveProduct(null);
        }, 2000);
      });
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [applyEffects]);

  const applyProductEffects = useCallback((product: StarsProduct) => {
    const effects: Record<string, number> = {};

    for (const [key, value] of Object.entries(product.effects)) {
      if (key === 'day') {
        // Special: advance time by N days
        const store = useGameStore.getState();
        store.setState({ ...store.state, day: store.state.day + value });
        continue;
      }

      // For stats that should be SET (not added), handle specially
      if (['energy', 'stability', 'health', 'mood'].includes(key) && value >= 80) {
        // Set to value directly by computing delta
        const currentStats = useGameStore.getState().state.stats;
        const current = currentStats[key as keyof typeof currentStats] ?? 0;
        effects[key] = value - current;
      } else {
        effects[key] = value;
      }
    }

    if (Object.keys(effects).length > 0) {
      applyEffects(effects);
    }
  }, [applyEffects]);

  return {
    purchase,
    status,
    activeProduct,
    isLoading: status === 'loading',
  };
}
