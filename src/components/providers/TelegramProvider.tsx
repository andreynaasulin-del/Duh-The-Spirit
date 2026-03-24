'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TelegramWebApp } from '@/lib/telegram/types';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  isReady: boolean;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  isReady: false,
  isTelegram: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if already loaded (e.g. inside Telegram where SDK is injected)
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#0a0a0a');
      tg.setBackgroundColor('#0a0a0a');
      setWebApp(tg);
    }
    // Always mark ready — don't load SDK externally to avoid hydration mismatch.
    // In production Telegram, the SDK is injected by the Telegram client before page load.
    setIsReady(true);
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, isReady, isTelegram: !!webApp }}>
      {children}
    </TelegramContext.Provider>
  );
}
