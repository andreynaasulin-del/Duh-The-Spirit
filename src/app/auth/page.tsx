'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Skull, Zap, Shield } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { webApp, isReady, isTelegram } = useTelegram();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function authenticate() {
      setStatus('authenticating');

      try {
        const initData = isTelegram && webApp
          ? webApp.initData
          : process.env.NODE_ENV === 'development'
            ? 'dev_mock_data'
            : null;

        if (!initData) {
          setStatus('ready');
          return;
        }

        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Auth failed');
        }

        const data = await res.json();
        if (data.success) {
          localStorage.setItem('pryton_user', JSON.stringify(data.user));
          router.replace('/game/home');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    }

    authenticate();
  }, [isReady, isTelegram, webApp, router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg-primary relative overflow-hidden">
      {/* Background grunge effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-5 text-[120px] font-bold text-white/10 -rotate-12 select-none">
          ДУХ
        </div>
        <div className="absolute bottom-20 right-5 text-[80px] font-bold text-white/10 rotate-6 select-none">
          РАЙОНА
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-bg-card border border-white/10 flex items-center justify-center">
            <Skull className="w-10 h-10 text-neon-pink" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            PRYTON HOOD
          </h1>
          <p className="text-text-secondary text-sm text-center">
            Выживай. Зарабатывай. Не теряй рассудок.
          </p>
        </div>

        {/* Status */}
        <div className="w-full card-street p-6 flex flex-col items-center gap-4">
          {(status === 'loading' || status === 'authenticating') && (
            <>
              <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary text-sm">
                {status === 'loading' ? 'Загрузка...' : 'Авторизация через Telegram...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <Shield className="w-8 h-8 text-danger" />
              <p className="text-danger text-sm text-center">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-neon-pink text-white text-sm font-medium rounded-lg hover:brightness-110 transition-all active:scale-95"
              >
                Попробовать снова
              </button>
            </>
          )}

          {status === 'ready' && !isTelegram && (
            <>
              <Zap className="w-8 h-8 text-neon-yellow" />
              <p className="text-text-secondary text-sm text-center">
                Открой игру через Telegram для авторизации
              </p>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    localStorage.setItem('pryton_user', JSON.stringify({
                      id: 'dev-user',
                      username: 'dev_player',
                      telegram_id: '999999999',
                    }));
                    router.replace('/game/home');
                  }}
                  className="px-6 py-2.5 bg-bg-card border border-neon-green/30 text-neon-green text-sm font-medium rounded-lg hover:border-neon-green/60 transition-all active:scale-95"
                >
                  DEV: Войти как гость
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-text-muted text-xs">
          @duhdeveloperhub
        </p>
      </div>
    </div>
  );
}
