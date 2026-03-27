'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Eye, Gamepad2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { webApp, isReady, isTelegram } = useTelegram();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const existing = localStorage.getItem('duh_user') || localStorage.getItem('pryton_user');
    if (existing) { router.replace('/game/home'); return; }
    if (isTelegram && webApp?.initData) { authenticateTelegram(webApp.initData); return; }
    setStatus('ready');
  }, [isReady, isTelegram, webApp, router]);

  async function authenticateTelegram(initData: string) {
    setStatus('authenticating');
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('duh_user', JSON.stringify(data.user));
        router.replace('/game/home');
      } else throw new Error(data.error || 'Auth failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
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
      {/* Animated smoke particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 120 + i * 40,
              height: 120 + i * 40,
              background: `radial-gradient(circle, rgba(255,45,123,${0.03 + i * 0.005}) 0%, transparent 70%)`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 10, 0],
              x: [0, 10, -10, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo with float animation */}
        <motion.img
          src="/og-image.jpg"
          alt="Duh The Spirit"
          className="w-32 h-32 rounded-2xl border-2 border-white/10"
          style={{ boxShadow: '0 0 60px rgba(255,45,123,0.25), 0 0 120px rgba(255,45,123,0.1)' }}
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{
            opacity: 1, y: 0, scale: 1,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Graffiti title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1
            className="text-5xl text-white relative"
            style={{
              fontFamily: "var(--font-marker), 'Permanent Marker', cursive",
              letterSpacing: '1px',
              transform: 'rotate(-2deg)',
              textShadow: '4px 4px 0px rgba(255,45,123,0.35), 0 0 40px rgba(255,45,123,0.15)',
            }}
          >
            Duh The Spirit
          </h1>
          <p
            className="text-white/30 text-[10px] mt-3 uppercase tracking-[0.4em] font-medium"
            style={{ transform: 'rotate(-1deg)' }}
          >
            Выживай · Зарабатывай · Не теряй рассудок
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          className="w-full p-6 rounded-2xl border border-white/[0.06] flex flex-col items-center gap-5"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {(status === 'loading' || status === 'authenticating') && (
            <div className="flex flex-col items-center gap-3 py-4">
              <motion.div
                className="w-8 h-8 border-2 border-[#ff2d7b] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-white/40 text-sm">
                {status === 'loading' ? 'Загрузка...' : 'Вход через Telegram...'}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                onClick={() => { setError(null); setStatus('ready'); }}
                className="px-6 py-2.5 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/15 transition-all active:scale-95"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              {/* Telegram button with pulse */}
              <motion.a
                href="https://t.me/duhthespiritbot?start=play"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-[15px] relative overflow-hidden"
                style={{ backgroundColor: '#2AABEE' }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(42,171,238,0.4)' }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="relative z-10">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 8-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/>
                </svg>
                <span className="relative z-10">Войти через Telegram</span>
              </motion.a>

              <p className="text-white/25 text-[11px] text-center">
                Откроется бот → нажми «Играть» → прогресс сохраняется
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[9px] text-white/20 uppercase tracking-wider">или</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Demo button */}
              <motion.button
                onClick={enterDemo}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Демо без регистрации</span>
              </motion.button>

              <p className="text-white/15 text-[10px] text-center leading-relaxed">
                Прогресс не сохраняется · Stars недоступны
              </p>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-white/15 text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          @duhthespiritbot
        </motion.p>
      </div>
    </div>
  );
}
