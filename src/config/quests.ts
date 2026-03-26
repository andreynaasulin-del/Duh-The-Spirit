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
    unlocks: ['w_creative_block'],
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
    unlocks: ['w_panic_wave', 'w_cold_blood'],
  },

  // ═══════════════════════════════════════
  //  SEASON 2: WINTER — "Тревога"
  //  Anxiety rises. Panic attacks. Trust no one.
  //  Music path: fighting creative block
  //  Chaos path: deeper into crime, prison risk
  // ═══════════════════════════════════════

  // --- MUSIC PATH (Winter) ---

  w_creative_block: {
    id: 'w_creative_block',
    npc: 'shadow',
    title: 'Творческий тупик',
    description: 'Зима сожрала вдохновение. Шэдоу ждёт новый материал, а в голове — пустота. Нужно найти источник.',
    type: 'main',
    objectives: [
      { id: 'write_3', type: 'action_completed', target: 3, actionId: 'write_lyrics', description: 'Написать 3 текста (через силу)' },
      { id: 'mood_up', type: 'stat_reached', target: 40, stat: 'mood', description: 'Поднять настроение выше 40' },
    ],
    rewards: { fame: 5, stability: 10, path_music: 5 },
    unlocks: ['w_collab'],
  },

  w_collab: {
    id: 'w_collab',
    npc: 'shadow',
    title: 'Коллаборация',
    description: 'Шэдоу знает одного МС из соседнего района. Фит может вытянуть тебя из ямы. Но нужно доказать что ты стоишь его времени.',
    type: 'main',
    objectives: [
      { id: 'record_feat', type: 'action_completed', target: 2, actionId: 'record_verse', description: 'Записать 2 куплета для фита' },
      { id: 'fame_req', type: 'kpi_reached', target: 40, kpi: 'fame', description: 'Набрать 40 славы' },
    ],
    rewards: { cash: 2000, fame: 25, respect: 10, path_music: 8 },
    unlocks: ['sp_god_mode'],
  },

  // --- CHAOS PATH (Winter) ---

  w_panic_wave: {
    id: 'w_panic_wave',
    npc: 'spirit',
    title: 'Волна паники',
    description: 'Тревога накрывает волнами. Район сжимается. Каждый шаг — как по минному полю. Найди способ выстоять.',
    type: 'main',
    objectives: [
      { id: 'survive_panic', type: 'action_completed', target: 2, actionId: 'meditate', description: 'Медитировать 2 раза' },
      { id: 'stability_keep', type: 'stat_reached', target: 35, stat: 'stability', description: 'Удержать стабильность выше 35' },
    ],
    rewards: { stability: 20, path_survival: 5 },
    unlocks: ['w_alchemist_trap'],
  },

  w_cold_blood: {
    id: 'w_cold_blood',
    npc: 'zef',
    title: 'Хладнокровие',
    description: 'Зэф проверяет тебя на прочность. Район замёрз — но дела не ждут. Одна ночная операция. Без права на ошибку.',
    type: 'main',
    objectives: [
      { id: 'night_op', type: 'action_completed', target: 2, actionId: 'dark_scheme', description: 'Две тёмные схемы подряд' },
      { id: 'cash_up', type: 'kpi_reached', target: 15000, kpi: 'cash', description: 'Накопить 15,000₽' },
    ],
    rewards: { cash: 10000, respect: 20, path_chaos: 12, stability: -20 },
    unlocks: ['sp_empire'],
  },

  w_alchemist_trap: {
    id: 'w_alchemist_trap',
    npc: 'alchemist',
    title: 'Ловушка Алхимика',
    description: 'Алхимик предлагает «лекарство от тревоги». Бесплатно. Первый раз. Ты знаешь чем это кончается.',
    type: 'main',
    objectives: [
      { id: 'choice', type: 'action_completed', target: 1, actionId: 'doctor_visit', description: 'Пойти к доктору ВМЕСТО алхимика' },
    ],
    rewards: { stability: 25, path_survival: 8, respect: 5 },
    unlocks: ['sp_clean_path'],
  },

  // ═══════════════════════════════════════
  //  SEASON 3: SPRING — "Мания"
  //  God mode. Everything is possible. But stability crumbles.
  //  Music path: album recording, fame explosion
  //  Chaos path: building empire, but losing grip
  // ═══════════════════════════════════════

  // --- MUSIC PATH (Spring) ---

  sp_god_mode: {
    id: 'sp_god_mode',
    npc: 'shadow',
    title: 'God Mode',
    description: 'Мозг горит. Идеи фонтаном. За ночь — три трека. Шэдоу не успевает сводить. Это мания — и она прекрасна.',
    type: 'main',
    objectives: [
      { id: 'record_5', type: 'action_completed', target: 5, actionId: 'record_verse', description: 'Записать 5 куплетов' },
      { id: 'fame_exp', type: 'kpi_reached', target: 80, kpi: 'fame', description: 'Набрать 80 славы' },
    ],
    rewards: { cash: 5000, fame: 40, path_music: 15, stability: -10 },
    unlocks: ['sp_album'],
  },

  sp_album: {
    id: 'sp_album',
    npc: 'shadow',
    title: 'Альбом',
    description: 'Материала хватит на альбом. Шэдоу говорит — сейчас или никогда. Весна не будет длиться вечно.',
    type: 'main',
    objectives: [
      { id: 'mix', type: 'action_completed', target: 3, actionId: 'mix_master', description: 'Свести 3 трека' },
      { id: 'release_album', type: 'action_completed', target: 1, actionId: 'release_track', description: 'Выпустить альбом' },
    ],
    rewards: { cash: 10000, fame: 50, respect: 25, path_music: 20 },
    unlocks: ['su_tour'],
  },

  // --- CHAOS PATH (Spring) ---

  sp_empire: {
    id: 'sp_empire',
    npc: 'zef',
    title: 'Империя',
    description: 'Мания шепчет: ты можешь контролировать весь район. Зэф стареет. Пора занять его место.',
    type: 'main',
    objectives: [
      { id: 'respect_dom', type: 'kpi_reached', target: 80, kpi: 'respect', description: 'Набрать 80 респекта' },
      { id: 'schemes', type: 'action_completed', target: 3, actionId: 'dark_scheme', description: '3 крупных операции' },
    ],
    rewards: { cash: 15000, respect: 40, path_chaos: 20, stability: -25 },
    unlocks: ['su_throne'],
  },

  // --- SURVIVAL PATH (Spring) ---

  sp_clean_path: {
    id: 'sp_clean_path',
    npc: 'bones',
    title: 'Чистый путь',
    description: 'Бонс говорит: «Мания — это не сила. Это иллюзия силы.» Удержись на ногах пока весна не кончилась.',
    type: 'main',
    objectives: [
      { id: 'therapy', type: 'action_completed', target: 3, actionId: 'doctor_visit', description: 'Визит к специалисту 3 раза' },
      { id: 'stable', type: 'stat_reached', target: 60, stat: 'stability', description: 'Стабильность выше 60' },
    ],
    rewards: { stability: 30, path_survival: 15, respect: 10 },
    unlocks: ['su_normal_life'],
  },

  // ═══════════════════════════════════════
  //  SEASON 4: SUMMER — "Трэп"
  //  Sleepless nights. Studio. Parties.
  //  This is the finale — path determines ending.
  // ═══════════════════════════════════════

  // --- MUSIC PATH (Summer) ---

  su_tour: {
    id: 'su_tour',
    npc: 'shadow',
    title: 'Гастроли',
    description: 'Альбом взорвал. Звонят организаторы. Первый концерт — в соседнем городе. Если соберёшь зал — ты сделал это.',
    type: 'main',
    objectives: [
      { id: 'fame_100', type: 'kpi_reached', target: 120, kpi: 'fame', description: 'Набрать 120 славы' },
      { id: 'energy_keep', type: 'stat_reached', target: 30, stat: 'energy', description: 'Не сгореть (энергия > 30)' },
    ],
    rewards: { cash: 20000, fame: 50, respect: 30, path_music: 25 },
    unlocks: [],
  },

  // --- CHAOS PATH (Summer) ---

  su_throne: {
    id: 'su_throne',
    npc: 'zef',
    title: 'Трон',
    description: 'Зэф уходит. Район — твой. Но корона тяжела. Последнее испытание — удержать всё не развалив себя.',
    type: 'main',
    objectives: [
      { id: 'respect_100', type: 'kpi_reached', target: 100, kpi: 'respect', description: '100 респекта' },
      { id: 'cash_reign', type: 'kpi_reached', target: 30000, kpi: 'cash', description: 'Накопить 30,000₽' },
    ],
    rewards: { cash: 25000, respect: 50, path_chaos: 25, stability: -20 },
    unlocks: [],
  },

  // --- SURVIVAL PATH (Summer) ---

  su_normal_life: {
    id: 'su_normal_life',
    npc: 'spirit',
    title: 'Обычная жизнь',
    description: 'Дух шепчет: «Не каждый герой носит корону. Иногда — просто выжить это и есть победа.» Устройся на работу. Стабилизируйся.',
    type: 'main',
    objectives: [
      { id: 'courier_grind', type: 'action_completed', target: 5, actionId: 'courier', description: 'Работать курьером 5 раз' },
      { id: 'stable_70', type: 'stat_reached', target: 70, stat: 'stability', description: 'Стабильность выше 70' },
    ],
    rewards: { cash: 5000, stability: 30, path_survival: 25 },
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
