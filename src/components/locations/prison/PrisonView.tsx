'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Dumbbell, BookOpen, Users, Swords, Clock, ShieldAlert,
  ChevronRight, Cigarette, MessageSquare, Eye, Skull, Heart,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason, useStatus } from '@/stores/game-store';
import { NPCEncounter } from '@/components/ui/NPCEncounter';

// ========== PRISON EVENTS (ситуационные выборы) ==========

interface PrisonEvent {
  id: string;
  text: string;
  choices: {
    label: string;
    effects: Record<string, number>;
    result: string;
  }[];
}

const PRISON_EVENTS: PrisonEvent[] = [
  {
    id: 'rat_stash',
    text: 'Сокамерник припрятал передачку под подушкой. Один из зеков решил это скрысить.',
    choices: [
      { label: 'Ударить крысу', effects: { respect: 8, health: -10, mood: 5 }, result: 'Ты врезал ему. Камера запомнила. Респект +8, но синяк обеспечен.' },
      { label: 'Разделить передачку', effects: { mood: 10, respect: -3, stability: 5 }, result: 'Поделили на троих. Тихо, мирно. Но слабость заметили.' },
    ],
  },
  {
    id: 'guard_deal',
    text: 'Вертухай предлагает пронести телефон за 5 пачек сигарет. Рискованно — могут подставить.',
    choices: [
      { label: 'Согласиться', effects: { mood: 20, stability: -10, respect: 3 }, result: 'Телефон в руках. Написал на волю. Но нервы на пределе — если найдут, срок добавят.' },
      { label: 'Отказать', effects: { stability: 10, mood: -5 }, result: 'Правильный выбор. Целее будешь. Но связи с волей нет.' },
    ],
  },
  {
    id: 'night_talk',
    text: 'Ночь. Бонс не спит. Говорит: "Я тут уже третий срок. Хочешь знать как выжить?"',
    choices: [
      { label: 'Слушать', effects: { stability: 15, mood: 10, anxiety: -10 }, result: 'Бонс рассказал про своих детей. Про ошибки. Ты чувствуешь себя спокойнее.' },
      { label: 'Отвернуться к стене', effects: { mood: -10, energy: 15 }, result: 'Не твои проблемы. Уснул быстро, но на душе пусто.' },
    ],
  },
  {
    id: 'yard_challenge',
    text: 'На прогулке тебя толкнули плечом. Намеренно. Вся площадка смотрит.',
    choices: [
      { label: 'Ответить кулаком', effects: { respect: 12, health: -15, mood: 10 }, result: 'Жёсткий обмен. Ты на ногах. Он нет. Двор запомнил.' },
      { label: 'Пройти мимо', effects: { respect: -5, stability: 5, mood: -15 }, result: 'Проглотил. Никто ничего не сказал. Но все всё поняли.' },
      { label: 'Посмотреть в глаза и ждать', effects: { respect: 5, stability: -5, mood: -5 }, result: 'Он отвёл взгляд первый. Психологическая победа. Но напряжение осталось.' },
    ],
  },
  {
    id: 'package_from_outside',
    text: 'Тебе передали посылку. Внутри — таблетки и записка: "Это от Духа. Прими и всё станет яснее."',
    choices: [
      { label: 'Принять таблетки', effects: { mood: 30, stability: -20, trip: 15 }, result: 'Мир поплыл. Дух смеётся где-то внутри. Хорошо, но за это будет цена.' },
      { label: 'Выбросить в унитаз', effects: { stability: 15, mood: -10 }, result: 'Смыл. Дух замолчал. Голова ясная. Правильный выбор.' },
    ],
  },
  {
    id: 'snitch_offer',
    text: 'Оперативник вызвал на разговор. "Расскажи кто тебя крышевал — скинем срок."',
    choices: [
      { label: 'Молчать', effects: { respect: 10, stability: -10, mood: -10 }, result: 'Ни слова. Опер ушёл злой. Но на зоне ты — свой.' },
      { label: 'Сдать информацию', effects: { respect: -20, mood: 5 }, result: 'Рассказал. Срок не скинули. Зато в камере прознали. Теперь ты крыса.' },
    ],
  },
  {
    id: 'cell_search',
    text: 'Шмон! Охрана переворачивает камеру. У соседа под матрасом — заточка.',
    choices: [
      { label: 'Молчать — не твоё дело', effects: { stability: 5, respect: 3 }, result: 'Заточку нашли. Соседа увели. Ты не при делах.' },
      { label: 'Отвлечь охрану', effects: { respect: 8, health: -5, stability: -5 }, result: 'Затеял скандал. Соседа не тронули. Ты получил по рёбрам, но уважение выросло.' },
    ],
  },
  {
    id: 'food_fight',
    text: 'В столовой кто-то плюнул в твою миску. Все смотрят что ты сделаешь.',
    choices: [
      { label: 'Перевернуть миску ему на голову', effects: { respect: 15, health: -10, mood: 15 }, result: 'Каша на голове. Ор. Тебя уважают. Синяк пройдёт.' },
      { label: 'Молча уйти голодным', effects: { respect: -8, mood: -20, stability: 5 }, result: 'Ушёл. Голодный. Тихо. Но все видели.' },
    ],
  },
  {
    id: 'dream_spirit',
    text: 'Ночью снится Дух. Он стоит за решёткой и шепчет: "Ты здесь потому что слушал меня."',
    choices: [
      { label: '"Ты прав. Но я выберусь."', effects: { stability: 10, mood: 10, anxiety: -5 }, result: 'Проснулся с ясной головой. Что-то изменилось внутри.' },
      { label: '"Пошёл нахер."', effects: { mood: 15, stability: -5 }, result: 'Дух рассмеялся и исчез. Злость даёт силы, но не покой.' },
    ],
  },
  {
    id: 'letter',
    text: 'Письмо. Без обратного адреса. "Держись. На воле ждут." Подпись размазана.',
    choices: [
      { label: 'Сохранить письмо', effects: { mood: 20, stability: 10 }, result: 'Перечитываешь каждую ночь. Кто-то помнит о тебе.' },
      { label: 'Порвать — нечего надеяться', effects: { mood: -10, stability: 5, anxiety: -5 }, result: 'Клочки в ведро. Никаких иллюзий. Только ты и стены.' },
    ],
  },
];

// ========== PRISON ACTIONS ==========

interface PrisonAction {
  id: string;
  icon: React.ElementType;
  title: string;
  meta: string;
  time: number;
  effects: Record<string, number>;
  risk?: boolean;
}

const PRISON_ACTIONS: PrisonAction[] = [
  { id: 'workout_yard', icon: Dumbbell, title: 'Тренировка во дворе', meta: '+HP, +настрой (2ч)', time: 120, effects: { health: 10, mood: 10, energy: -15 } },
  { id: 'read_books', icon: BookOpen, title: 'Читать книги', meta: '+стабильность (3ч)', time: 180, effects: { stability: 15, adequacy: 10, mood: 5 } },
  { id: 'make_connections', icon: Users, title: 'Заводить связи', meta: '+респект, риск (2ч)', time: 120, effects: { respect: 5, mood: -5 }, risk: true },
  { id: 'fight_yard', icon: Swords, title: 'Разборка на прогулке', meta: '+респект, травмы (1ч)', time: 60, effects: { respect: 10, health: -15 }, risk: true },
  { id: 'sleep_cell', icon: Clock, title: 'Отсидеться в камере', meta: '+энергия (8ч)', time: 480, effects: { energy: 40, mood: -15, stability: -5 } },
  { id: 'write_cell', icon: MessageSquare, title: 'Писать тексты', meta: '+музыка, +настрой (2ч)', time: 120, effects: { mood: 15, stability: 10 } },
  { id: 'observe', icon: Eye, title: 'Наблюдать за зоной', meta: '+адекватность (1ч)', time: 60, effects: { adequacy: 10, stability: 5, mood: -5 } },
  { id: 'pray', icon: Heart, title: 'Молиться / медитация', meta: '+стабильность, –тревога (1ч)', time: 60, effects: { stability: 15, anxiety: -10, mood: 5 } },
  { id: 'trade_zone', icon: Cigarette, title: 'Торговля на зоне', meta: '+кэш, –настрой (2ч)', time: 120, effects: { cash: 200, mood: -10 }, risk: true },
  { id: 'letter_out', icon: MessageSquare, title: 'Письмо на волю', meta: '+стабильность, +настрой (3ч)', time: 180, effects: { stability: 15, mood: 20, energy: -10 } },
  { id: 'scout', icon: Eye, title: 'Разведка обстановки', meta: '+адекватность, информация (1ч)', time: 60, effects: { adequacy: 10, respect: 2, mood: -5 } },
  { id: 'share_food', icon: Heart, title: 'Поделиться едой', meta: '+респект, –HP (1ч)', time: 60, effects: { respect: 5, health: -5, mood: 10 } },
  { id: 'bribe_guard', icon: Cigarette, title: 'Подкуп вертухая', meta: '–кэш, может ускорить срок (2ч)', time: 120, effects: { cash: -500, mood: 5, stability: -10 }, risk: true },
];

// ========== COMPONENT ==========

export function PrisonView() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<PrisonEvent | null>(null);
  const [eventResult, setEventResult] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const status = useStatus();
  const prison = useGameStore((s) => s.state.prison);
  const applyEffects = useGameStore((s) => s.applyEffects);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const addLog = useGameStore((s) => s.addLog);

  const isFree = status !== 'PRISON';
  const daysLeft = prison?.sentence?.daysRemaining ?? 0;
  const daysServed = prison?.sentence?.daysServed ?? 0;
  const totalDays = prison?.sentence?.totalDays ?? 10;

  // Trigger random event every 2 actions
  useEffect(() => {
    if (actionCount > 0 && actionCount % 2 === 0 && !activeEvent && !isFree) {
      const event = PRISON_EVENTS[Math.floor(Math.random() * PRISON_EVENTS.length)];
      setActiveEvent(event);
    }
  }, [actionCount]);

  const handleAction = useCallback((action: PrisonAction) => {
    if (isFree || busyId) return;
    setBusyId(action.id);
    advanceTime(action.time);
    applyEffects(action.effects);
    addLog(`Тюрьма: ${action.title}`, action.risk ? 'danger' : 'info');
    setActionCount(c => c + 1);
    setTimeout(() => setBusyId(null), 400);
  }, [isFree, busyId, advanceTime, applyEffects, addLog]);

  const handleEventChoice = useCallback((choice: PrisonEvent['choices'][0]) => {
    applyEffects(choice.effects);
    addLog(`Тюрьма: ${choice.result.substring(0, 50)}...`, 'danger');
    setEventResult(choice.result);
    setTimeout(() => {
      setActiveEvent(null);
      setEventResult(null);
    }, 4000);
  }, [applyEffects, addLog]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{ borderColor: '#ff4444', boxShadow: '0 0 16px rgba(255,68,68,0.3)', borderRadius: '10px' }}>
          <Lock className="w-6 h-6" style={{ color: '#ff4444' }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: '#ff4444' }}>ТЮРЬМА</h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            {isFree ? 'Ты на свободе.' : 'Выживай. Каждый день — испытание.'}
          </p>
        </div>
      </div>

      {isFree ? (
        <div className="manga-panel p-6 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 mx-auto" style={{ color: 'var(--color-neon-green)' }} />
          <h2 className="text-sm font-bold text-text-primary">ТЫ НА СВОБОДЕ</h2>
          <p className="text-[11px] text-text-muted">
            Попадёшь сюда если переборщишь с тёмными делами.
          </p>
        </div>
      ) : (
        <>
          {/* Sentence */}
          <div className="manga-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="manga-label">СРОК</span>
              <span className="text-[10px] font-bold text-danger">
                {daysLeft} {daysLeft === 1 ? 'ДЕНЬ' : daysLeft < 5 ? 'ДНЯ' : 'ДНЕЙ'} ОСТАЛОСЬ
              </span>
            </div>
            <div className="w-full h-2 bg-white/5" style={{ borderRadius: '8px' }}>
              <motion.div
                className="h-full"
                style={{
                  width: `${Math.max(3, (daysServed / totalDays) * 100)}%`,
                  backgroundColor: '#ff4444',
                  borderRadius: '8px',
                }}
              />
            </div>
            <p className="text-[9px] text-text-muted mt-1 text-center">
              Отсижено {daysServed} из {totalDays} дней
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'HP', value: Math.round(stats.health), color: stats.health < 30 ? 'var(--color-danger)' : 'var(--color-neon-green)' },
              { label: 'НАСТРОЙ', value: Math.round(stats.mood), color: stats.mood < 30 ? 'var(--color-danger)' : 'var(--color-neon-cyan)' },
              { label: 'РЕСПЕКТ', value: kpis.respect, color: season.theme.accentColor },
            ].map(s => (
              <div key={s.label} className="manga-panel p-3 text-center crosshatch">
                <p className="manga-label">{s.label}</p>
                <p className="text-xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Prison Rank & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="manga-panel p-2 text-center">
              <p className="text-[8px] text-text-muted uppercase tracking-wider">Ранг</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: '#ff4444' }}>
                {prison?.rank === 'avtoritet' ? 'Авторитет' :
                 prison?.rank === 'blatnoy' ? 'Блатной' :
                 prison?.rank === 'muzhik' ? 'Мужик' : 'Чёрт'}
              </p>
            </div>
            <div className="manga-panel p-2 text-center">
              <p className="text-[8px] text-text-muted uppercase tracking-wider">Сигареты</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-warning)' }}>
                🚬 {prison?.currency?.cigarettes ?? 0}
              </p>
            </div>
            <div className="manga-panel p-2 text-center">
              <p className="text-[8px] text-text-muted uppercase tracking-wider">Чай</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-neon-green)' }}>
                🍵 {prison?.currency?.tea ?? 0}
              </p>
            </div>
          </div>

          {/* === СИТУАЦИОННОЕ СОБЫТИЕ === */}
          <AnimatePresence>
            {activeEvent && !eventResult && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-3 border-2"
                style={{
                  borderColor: '#ff4444',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,68,68,0.06)',
                  boxShadow: '0 0 20px rgba(255,68,68,0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-danger shrink-0" />
                  <span className="text-[9px] font-bold text-danger uppercase tracking-wider">Ситуация</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {activeEvent.text}
                </p>
                <div className="space-y-2">
                  {activeEvent.choices.map((choice, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleEventChoice(choice)}
                      className="w-full p-3 text-left text-sm font-bold border transition-colors"
                      style={{
                        borderColor: 'rgba(255,68,68,0.3)',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255,68,68,0.04)',
                        color: '#fff',
                      }}
                    >
                      {choice.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {eventResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 text-sm text-text-secondary leading-relaxed border"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                {eventResult}
              </motion.div>
            )}
          </AnimatePresence>

          {/* NPC */}
          <NPCEncounter location="prison" />

          {/* Actions */}
          <div className="chapter-divider"><span>ДЕЙСТВИЯ</span></div>

          <div className="space-y-1.5">
            {PRISON_ACTIONS.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(action)}
                disabled={busyId === action.id}
                className={`card-street p-3 flex items-center gap-3 w-full text-left ${busyId === action.id ? 'opacity-30' : ''}`}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10" style={{ borderRadius: '10px' }}>
                  <action.icon className="w-4 h-4" style={{ color: action.risk ? 'var(--color-danger)' : '#ff4444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary truncate">{action.title}</p>
                    {action.risk && (
                      <span className="text-[8px] font-bold px-1 py-0.5 text-danger border border-danger" style={{ borderRadius: '8px' }}>РИСК</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted font-mono">{action.meta}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
