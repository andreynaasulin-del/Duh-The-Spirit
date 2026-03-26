'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const AGE_GATE_KEY = 'pryton_age_confirmed';

interface AgeGateProps {
  children: React.ReactNode;
}

/**
 * Age Gate + Content Disclaimer.
 * Must be shown before any game content.
 * Stores confirmation in localStorage.
 *
 * This is CRITICAL for Telegram compliance:
 * - Prevents minors from accessing mature content
 * - Shows clear disclaimers about fictional nature
 * - Provides mental health resource links
 */
export function AgeGate({ children }: AgeGateProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'age' | 'disclaimer'>('age');

  // Check localStorage only after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(AGE_GATE_KEY) === 'true') {
      setConfirmed(true);
    }
  }, []);

  const handleAgeConfirm = useCallback(() => {
    setStep('disclaimer');
  }, []);

  const handleDisclaimerAccept = useCallback(() => {
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setConfirmed(true);
  }, []);

  // SSR + first render: show nothing to prevent hydration mismatch
  if (!mounted) return null;
  if (confirmed) return <>{children}</>;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg-primary">
      <div className="max-w-sm w-full flex flex-col items-center gap-6">
        {step === 'age' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-danger" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold mb-2">Возрастное ограничение</h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Данное приложение содержит темы, предназначенные для
                лиц старше <span className="text-danger font-bold">18 лет</span>:
                упоминание психических расстройств, криминальной среды и
                зависимостей в художественном контексте.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleAgeConfirm}
                className="w-full py-3 bg-white/10 border border-white/20 text-text-primary text-sm font-medium rounded-lg hover:bg-white/15 transition-all active:scale-[0.98]"
              >
                Мне исполнилось 18 лет
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                    window.Telegram.WebApp.close();
                  }
                }}
                className="w-full py-3 text-text-muted text-sm rounded-lg hover:text-text-secondary transition-colors"
              >
                Мне нет 18 лет — выйти
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold mb-2">Важная информация</h1>
            </div>

            <div className="w-full card-street p-4 space-y-3">
              <p className="text-text-secondary text-xs leading-relaxed">
                <span className="text-text-primary font-semibold">Это художественное произведение.</span>{' '}
                Все персонажи, события и места вымышлены. Любые совпадения
                с реальными лицами или событиями случайны.
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                <span className="text-text-primary font-semibold">Игра не пропагандирует</span>{' '}
                употребление запрещённых веществ, криминальный образ жизни или
                причинение вреда себе и окружающим. Негативные сценарии показаны
                с целью демонстрации их разрушительных последствий.
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                <span className="text-text-primary font-semibold">Ментальное здоровье важно.</span>{' '}
                Если вы или кто-то из ваших близких переживает трудности —
                обратитесь за профессиональной помощью. Телефон доверия:
                <span className="text-info font-mono"> 8-800-2000-122</span> (бесплатно).
              </p>
            </div>

            <button
              onClick={handleDisclaimerAccept}
              className="w-full py-3 bg-white/10 border border-white/20 text-text-primary text-sm font-medium rounded-lg hover:bg-white/15 transition-all active:scale-[0.98]"
            >
              Я понимаю и принимаю
            </button>
          </>
        )}

        <p className="text-text-muted text-[10px] text-center mt-2">
          Duh The Spirit — интерактивная новелла
        </p>
      </div>
    </div>
  );
}
