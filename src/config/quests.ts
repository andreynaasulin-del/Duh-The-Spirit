import type { QuestDef } from '@/types/quest';

/**
 * SEASON 1: AUTUMN — "Первые шаги"
 * Player just arrived in the hood. Everything is grey and cold.
 * The Spirit (inner voice) guides them through the first days.
 *
 * FLOW:
 * prologue_awaken → prologue_street_cred
 *   ├→ ch1_shadow_intro → ch1_first_demo → ch2_release_track  (MUSIC PATH)
 *   └→ ch1_zef_offer → ch1_dark_delivery → ch2_zef_crew       (CHAOS PATH)
 *
 * Side quests available throughout.
 */

export const QUESTS: Record<string, QuestDef> = {
  // ═══════════════════════════════════════
  //  PROLOGUE — Пробуждение
  // ═══════════════════════════════════════

  prologue_awaken: {
    id: 'prologue_awaken',
    npc: 'spirit',
    title: 'Пробуждение',
    description: 'Открой глаза. Это район — и он ничего тебе не должен. Напиши свой первый текст.',
    type: 'main',
    objectives: [
      { id: 'write', type: 'action_completed', target: 1, actionId: 'write_lyrics', description: 'Написать текст дома' },
    ],
    rewards: { cash: 200, stability: 5, path_music: 1 },
    unlocks: ['prologue_street_cred'],
  },

  prologue_street_cred: {
    id: 'prologue_street_cred',
    npc: 'spirit',
    title: 'Уличный кредит',
    description: 'Стены не сделают тебя известным. Выйди на улицу, покажи на что способен.',
    type: 'main',
    objectives: [
      { id: 'freestyle', type: 'action_completed', target: 1, actionId: 'freestyle_battle', description: 'Зачитать фристайл' },
      { id: 'earn_respect', type: 'kpi_reached', target: 5, kpi: 'respect', description: 'Набрать 5 респекта' },
    ],
    rewards: { cash: 500, respect: 5, path_music: 2 },
    unlocks: ['ch1_shadow_intro', 'ch1_zef_offer'],
  },

  // ═══════════════════════════════════════
  //  CHAPTER 1 — Развилка
  //  Two paths open: music (Shadow) or street (Zef)
  // ═══════════════════════════════════════

  // --- MUSIC PATH ---

  ch1_shadow_intro: {
    id: 'ch1_shadow_intro',
    npc: 'shadow',
    title: 'Голос района',
    description: 'Продюсер по имени Шэдоу слышал твой фристайл. Он хочет поговорить. Загляни в клуб.',
    type: 'main',
    objectives: [
      { id: 'visit_club', type: 'action_completed', target: 1, actionId: 'studio_session', description: 'Зайти в студию' },
    ],
    rewards: { fame: 3, path_music: 3, respect: 2 },
    unlocks: ['ch1_first_demo'],
  },

  ch1_first_demo: {
    id: 'ch1_first_demo',
    npc: 'shadow',
    title: 'Первое демо',
    description: 'Шэдоу дал бит — тёмный, как этот район. Запиши два куплета. Покажи что ты не просто ещё один голос.',
    type: 'main',
    objectives: [
      { id: 'record', type: 'action_completed', target: 2, actionId: 'record_verse', description: 'Записать 2 куплета' },
    ],
    rewards: { cash: 1000, fame: 10, respect: 5, path_music: 5 },
    unlocks: ['ch2_release_track'],
    minRelationship: 10,
  },

  ch2_release_track: {
    id: 'ch2_release_track',
    npc: 'shadow',
    title: 'Первый релиз',
    description: 'Демо звучит. Шэдоу готов выпустить. Но сначала — набери слушателей. Стримы, расклейка, шум.',
    type: 'main',
    objectives: [
      { id: 'release', type: 'action_completed', target: 1, actionId: 'release_track', description: 'Выпустить трек' },
      { id: 'fans', type: 'kpi_reached', target: 30, kpi: 'fame', description: 'Набрать 30 славы' },
    ],
    rewards: { cash: 3000, fame: 20, respect: 15, path_music: 10 },
    unlocks: [],
  },

  // --- CHAOS PATH ---

  ch1_zef_offer: {
    id: 'ch1_zef_offer',
    npc: 'zef',
    title: 'Предложение Зэфа',
    description: 'Зэф — авторитет района. У него есть работа. Быстрые деньги, грязные руки. Встреться с ним ночью на улице.',
    type: 'main',
    objectives: [
      { id: 'hustle', type: 'action_completed', target: 2, actionId: 'street_hustle', description: 'Хастл на улице (2 раза)' },
    ],
    rewards: { cash: 2000, respect: 8, path_chaos: 5 },
    unlocks: ['ch1_dark_delivery'],
  },

  ch1_dark_delivery: {
    id: 'ch1_dark_delivery',
    npc: 'zef',
    title: 'Тёмная доставка',
    description: 'Посылка. Не спрашивай что внутри. Доставь через район и не попадись. Зэф платит 5К.',
    type: 'main',
    objectives: [
      { id: 'delivery', type: 'action_completed', target: 1, actionId: 'dark_scheme', description: 'Выполнить доставку' },
      { id: 'cash_up', type: 'kpi_reached', target: 8000, kpi: 'cash', description: 'Накопить 8,000₽' },
    ],
    rewards: { cash: 5000, respect: 15, path_chaos: 10, stability: -15 },
    unlocks: ['ch2_zef_crew'],
  },

  ch2_zef_crew: {
    id: 'ch2_zef_crew',
    npc: 'zef',
    title: 'Своя команда',
    description: 'Зэф доволен. Теперь ты часть его круга. Но район не прощает слабых — нужен респект.',
    type: 'main',
    objectives: [
      { id: 'respect_up', type: 'kpi_reached', target: 50, kpi: 'respect', description: 'Набрать 50 респекта' },
      { id: 'fight', type: 'action_completed', target: 1, actionId: 'alley_fight', description: 'Победить в разборке' },
    ],
    rewards: { cash: 8000, respect: 30, path_chaos: 15 },
    unlocks: [],
  },

  // ═══════════════════════════════════════
  //  SIDE QUESTS — доступны всегда
  // ═══════════════════════════════════════

  side_gym_grind: {
    id: 'side_gym_grind',
    npc: 'spirit',
    title: 'Сила духа',
    description: 'Тело — инструмент. Держи его в форме.',
    type: 'side',
    objectives: [
      { id: 'workout', type: 'action_completed', target: 3, actionId: 'home_workout', description: 'Тренировка 3 раза' },
    ],
    rewards: { energy: 20, stability: 10, path_survival: 3 },
  },

  side_meditate: {
    id: 'side_meditate',
    npc: 'spirit',
    title: 'Тишина внутри',
    description: 'Среди шума район есть одно тихое место — внутри тебя.',
    type: 'side',
    objectives: [
      { id: 'meditate', type: 'action_completed', target: 3, actionId: 'meditate', description: 'Медитировать 3 раза' },
    ],
    rewards: { stability: 20, path_survival: 5 },
  },

  side_casino_luck: {
    id: 'side_casino_luck',
    npc: 'spirit',
    title: 'Улыбка фортуны',
    description: 'Испытай удачу. Но помни — казино всегда в плюсе.',
    type: 'side',
    objectives: [
      { id: 'spin', type: 'action_completed', target: 5, actionId: 'casino_spin', description: 'Крутить слоты 5 раз' },
    ],
    rewards: { cash: 1000, path_chaos: 2 },
  },

  side_earn_cash: {
    id: 'side_earn_cash',
    npc: 'spirit',
    title: 'Хлеб насущный',
    description: 'Деньги не пахнут. Или пахнут? Заработай 5,000₽.',
    type: 'side',
    objectives: [
      { id: 'cash', type: 'kpi_reached', target: 5000, kpi: 'cash', description: 'Накопить 5,000₽' },
    ],
    rewards: { respect: 5, path_survival: 3 },
  },
};

export function getQuest(id: string): QuestDef | undefined {
  return QUESTS[id];
}

export function getAvailableQuests(completed: string[], active: string[]): QuestDef[] {
  return Object.values(QUESTS).filter(q => {
    if (completed.includes(q.id)) return false;
    if (active.includes(q.id)) return false;

    // Prologue always available
    if (q.id === 'prologue_awaken') return true;

    // Side quests always available
    if (q.type === 'side') return true;

    // Main quests need to be unlocked by completing prerequisite
    return completed.some(cId => {
      const cQuest = QUESTS[cId];
      return cQuest?.unlocks?.includes(q.id);
    });
  });
}
