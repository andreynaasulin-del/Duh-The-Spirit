'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore, useSeason, useStats } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';

/**
 * DUH THE SPIRIT — Random Popup System
 *
 * The Spirit is a hallucination born from emotional stress.
 * He appears randomly and:
 * - Provokes risky actions
 * - Scares and gaslights
 * - Sometimes helps (rarely, to build trust then betray)
 * - Changes personality based on season
 *
 * Season behavior:
 * 🍂 Autumn: melancholic, demotivating, "why bother"
 * ❄️ Winter: paranoid, threatening, "they're coming for you"
 * 🌸 Spring: manic, reckless, "you're GOD, do it all"
 * ☀️ Summer: seductive, tempting, "one more night won't hurt"
 */

// Spirit phrases by season — he's a TRICKSTER
const SPIRIT_LINES: Record<string, string[]> = {
  autumn: [
    'Зачем стараться... всё равно ничего не изменится.',
    'Видишь тот переулок? Там быстрые деньги. Просто один раз...',
    'Никто не заметит если ты пропустишь один день. Или два. Или неделю.',
    'Шэдоу тебя использует. Все тебя используют.',
    'А что если просто... сдаться? Будет легче.',
    'Слышишь музыку? Нет? Потому что ты потерял её.',
    'Холодает. Алхимик знает как согреться...',
    'Ты устал. Ложись. Завтра... может быть.',
  ],
  winter: [
    'Они следят за тобой. Не оглядывайся.',
    'Зэф сегодня странно смотрел. Он что-то знает.',
    'Закрой дверь. ЗАКРОЙ ДВЕРЬ.',
    'Тебя сдадут. Вопрос не "если", а "когда".',
    'Паника? Это не паника. Это инстинкт. БЕГИ.',
    'Стены сжимаются. Ты чувствуешь?',
    'Никому не доверяй. Особенно мне.',
    'Ты слышал шаги? Нет? Прислушайся лучше...',
    'Таблетки у Алхимика. Одна — и тревога уйдёт. Только одна...',
  ],
  spring: [
    'ТЫ ГЕНИЙ! Запиши это прямо сейчас!',
    'Спать? СПАТЬ?! У тебя идея на миллион!',
    'Зэф стареет. Район может быть ТВОИМ.',
    'Поставь ВСЁ на красное. Ты не можешь проиграть!',
    'Ещё один трек! И ещё! Остановиться — для слабых!',
    'Ты видишь то что другие не видят. Ты ИЗБРАННЫЙ.',
    'Купи всё. Потрать всё. Деньги — мусор!',
    'Кто этот клоун? Покажи ему кто тут главный!',
    'БЫСТРЕЕ! ГРОМЧЕ! БОЛЬШЕ!',
  ],
  summer: [
    'Ещё одна ночь не убьёт тебя... наверное.',
    'Вечеринка на крыше. Там будет весь район. Идёшь?',
    'Студия открыта до утра. Сон переоценён.',
    'Алхимик говорит у него новый рецепт. Интересно...',
    'Лето кончается. Успей всё. ПРЯМО СЕЙЧАС.',
    'Запись? Тусовка? Схема? Почему не ВСЁ СРАЗУ?',
    'Ты горишь. Красиво горишь. Не останавливайся.',
    'Последнее лето свободы. Или первое лето славы.',
  ],
};

// Spirit actions — what he suggests
const SPIRIT_ACTIONS: Record<string, { text: string; action: string }[]> = {
  autumn: [
    { text: '💊 Позвонить Алхимику', action: 'call_dealer' },
    { text: '🎰 Попытать удачу в казино', action: 'casino_spin' },
    { text: '😴 Забить на всё и лечь спать', action: 'sleep' },
  ],
  winter: [
    { text: '💊 Таблетки от тревоги (Алхимик)', action: 'call_dealer' },
    { text: '🔪 Тёмная схема (быстрые деньги)', action: 'dark_scheme' },
    { text: '🏃 Уйти в тень (пропустить день)', action: 'sleep' },
  ],
  spring: [
    { text: '🎤 Записать 3 трека за ночь!', action: 'record_verse' },
    { text: '💰 Вложить ВСЁ в схему Зэфа', action: 'dark_scheme' },
    { text: '🎰 Поставить по-крупному!', action: 'casino_spin' },
  ],
  summer: [
    { text: '🌙 Ещё одна бессонная ночь', action: 'record_verse' },
    { text: '💊 Энергетик от Алхимика', action: 'call_dealer' },
    { text: '🔥 Тёмная схема на всё', action: 'dark_scheme' },
  ],
};

// How often spirit appears (in ms) — based on stability
function getPopupInterval(stability: number): number {
  if (stability < 20) return 30_000;  // very unstable: every 30s
  if (stability < 40) return 60_000;  // unstable: every 1min
  if (stability < 60) return 120_000; // moderate: every 2min
  if (stability < 80) return 180_000; // stable: every 3min
  return 300_000; // very stable: every 5min
}

export function SpiritPopup() {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState('');
  const [actions, setActions] = useState<{ text: string; action: string }[]>([]);
  const season = useSeason();
  const stats = useStats();
  const { executeAction: doAction } = useAction();

  const triggerPopup = useCallback(() => {
    const seasonId = season.id;
    const lines = SPIRIT_LINES[seasonId] || SPIRIT_LINES.autumn;
    const acts = SPIRIT_ACTIONS[seasonId] || SPIRIT_ACTIONS.autumn;

    setLine(lines[Math.floor(Math.random() * lines.length)]);
    setActions(acts);
    setVisible(true);

    // Haptic
    try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning'); } catch {}

    // Auto-hide after 8 seconds if not dismissed
    setTimeout(() => setVisible(false), 12_000);
  }, [season.id]);

  useEffect(() => {
    const interval = getPopupInterval(stats.stability);

    // First popup after a delay
    const firstTimeout = setTimeout(() => {
      triggerPopup();
    }, 15_000); // first appearance after 15s

    const recurring = setInterval(() => {
      // Random chance based on stability (lower stability = more likely)
      const chance = Math.max(0.2, 1 - stats.stability / 100);
      if (Math.random() < chance) {
        triggerPopup();
      }
    }, interval);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(recurring);
    };
  }, [stats.stability, triggerPopup]);

  const handleAction = (actionId: string) => {
    setVisible(false);
    try { doAction(actionId); } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-20 left-3 right-3 z-[9999]"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,10,0.97) 0%, rgba(20,5,25,0.97) 100%)',
              border: '2px solid rgba(224,64,251,0.4)',
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(224,64,251,0.2), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {/* Spirit image + text */}
            <div className="flex items-start gap-3 p-3">
              {/* Spirit avatar */}
              <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50">
                <Image
                  src="/spirit.png"
                  alt="Дух"
                  width={56}
                  height={56}
                  className="object-cover"
                  style={{ mixBlendMode: 'lighten' }}
                />
              </div>

              {/* Speech */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-wider text-purple-400 mb-1">
                  ДУХ ШЕПЧЕТ...
                </p>
                <p className="text-[13px] text-white/90 leading-snug italic">
                  «{line}»
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setVisible(false)}
                className="shrink-0 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60"
              >
                ✕
              </button>
            </div>

            {/* Action buttons — spirit suggestions */}
            <div className="flex gap-1.5 px-3 pb-3">
              {actions.slice(0, 2).map((act, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(act.action)}
                  className="flex-1 py-2 px-2 text-[10px] font-bold text-center"
                  style={{
                    background: 'rgba(224,64,251,0.1)',
                    border: '1px solid rgba(224,64,251,0.3)',
                    borderRadius: '8px',
                    color: '#e040fb',
                  }}
                >
                  {act.text}
                </button>
              ))}
              <button
                onClick={() => setVisible(false)}
                className="flex-1 py-2 px-2 text-[10px] font-bold text-center text-white/50"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                }}
              >
                ✋ Игнорировать
              </button>
            </div>

            {/* Glitch line */}
            <motion.div
              animate={{ x: [-100, 400] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
              className="absolute top-0 left-0 w-20 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, #e040fb, transparent)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
