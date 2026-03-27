'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Gamepad2, Eye } from 'lucide-react';

const BOT_USERNAME = 'duhthespiritbot';

export default function AuthPage() {
  const router = useRouter();
  const { webApp, isReady, isTelegram } = useTelegram();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-auth inside Telegram Mini App
  useEffect(() => {
    if (!isReady) return;

    // Already logged in?
    const existing = localStorage.getItem('duh_user') || localStorage.getItem('pryton_user');
    if (existing) {
      router.replace('/game/home');
      return;
    }

    // Inside Telegram — auto-authenticate
    if (isTelegram && webApp?.initData) {
      authenticateTelegram(webApp.initData);
      return;
    }

    // Browser — show login options
    setStatus('ready');
  }, [isReady, isTelegram, webApp, router]);

  // Load Telegram Login Widget for browser
  useEffect(() => {
    // Show widget if not inside real TG Mini App (check for actual initData, not just script presence)
    const hasRealTgSession = isTelegram && webApp?.initData && webApp.initData.length > 20;
    if (status !== 'ready' || hasRealTgSession || !widgetRef.current) return;

    // Clear previous widget
    widgetRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    widgetRef.current.appendChild(script);

    // Global callback for widget
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (user: TelegramWidgetUser) => {
      setStatus('authenticating');
      try {
        const res = await fetch('/api/auth/telegram-widget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('duh_user', JSON.stringify(data.user));
          router.replace('/game/home');
        } else {
          throw new Error(data.error || 'Auth failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка авторизации');
        setStatus('error');
      }
    };

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, [status, isTelegram, router]);

  async function authenticateTelegram(initData: string) {
    setStatus('authenticating');
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('duh_user', JSON.stringify(data.user));
        router.replace('/game/home');
      } else {
        throw new Error(data.error || 'Auth failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
      setStatus('error');
    }
  }

  function enterDemo() {
    localStorage.setItem('duh_demo', 'true');
    localStorage.removeItem('duh_user');
    localStorage.removeItem('pryton_user');
    router.replace('/game/home');
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Ghost background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <span className="text-[200px] select-none">👻</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Logo */}
        <img
          src="/og-image.jpg"
          alt="Duh The Spirit"
          className="w-28 h-28 rounded-2xl border-2 border-white/10"
          style={{ boxShadow: '0 0 40px rgba(255,45,123,0.2)' }}
        />

        <div className="text-center">
          <h1
            className="text-4xl text-white relative"
            style={{
              fontFamily: "var(--font-marker), 'Permanent Marker', 'Marker Felt', cursive",
              letterSpacing: '2px',
              transform: 'rotate(-2deg)',
              textShadow: '3px 3px 0px rgba(255,45,123,0.4), -1px -1px 0px rgba(0,0,0,0.8)',
              WebkitTextStroke: '0.5px rgba(255,255,255,0.3)',
              paintOrder: 'stroke fill',
            }}
          >
            Duh The Spirit
          </h1>
          <p
            className="text-text-muted text-xs mt-2 uppercase tracking-[0.3em]"
            style={{ transform: 'rotate(-1deg)' }}
          >
            Выживай. Зарабатывай. Не теряй рассудок.
          </p>
        </div>

        {/* Auth card */}
        <div className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center gap-5">
          {(status === 'loading' || status === 'authenticating') && (
            <>
              <div className="w-8 h-8 border-2 border-[#ff2d7b] border-t-transparent rounded-full animate-spin" />
              <p className="text-text-muted text-sm">
                {status === 'loading' ? 'Загрузка...' : 'Вход через Telegram...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                onClick={() => { setError(null); setStatus('ready'); }}
                className="px-6 py-2.5 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/15 transition-all active:scale-95"
              >
                Попробовать снова
              </button>
            </>
          )}

          {status === 'ready' && (
            <>
              {/* Main CTA — open bot in Telegram */}
              <a
                href="https://t.me/duhthespiritbot?start=play"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.97]"
                style={{ backgroundColor: '#2AABEE' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 8-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/>
                </svg>
                Войти через Telegram
              </a>

              <p className="text-text-muted text-[11px] text-center">
                Откроется бот → нажми «Играть» → прогресс сохраняется
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-text-muted uppercase tracking-wider">или</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Demo button */}
              <button
                onClick={enterDemo}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-text-secondary hover:text-white transition-all active:scale-[0.98]"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Демо без регистрации</span>
              </button>

              <p className="text-[10px] text-text-muted text-center leading-relaxed">
                В демо прогресс не сохраняется.<br />
                Stars и достижения недоступны.
              </p>
            </>
          )}
        </div>

        {/* Open in Telegram link (browser only) */}
        {status === 'ready' && !isTelegram && (
          <a
            href="https://t.me/duhthespiritbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#ff2d7b] hover:underline"
          >
            <Gamepad2 className="w-4 h-4" />
            Открыть в Telegram
          </a>
        )}

        <p className="text-text-muted text-[10px]">
          v1.0 • @duhthespiritbot
        </p>
      </div>
    </div>
  );
}

interface TelegramWidgetUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
