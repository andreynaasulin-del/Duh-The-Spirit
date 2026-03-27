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

  // ═══════════════════════════════════════
  //  DAILY / REPEATABLE QUESTS
  // ═══════════════════════════════════════

  side_courier_grind: {
    id: 'side_courier_grind', npc: 'spirit', title: 'Курьерский марафон',
    description: 'Ноги кормят. 5 доставок и ты заслужил отдых.', type: 'side',
    objectives: [{ id: 'deliver', type: 'action_completed', target: 5, actionId: 'courier', description: 'Доставки: 5 раз' }],
    rewards: { cash: 2500, energy: 10, path_survival: 3 },
  },
  side_write_grind: {
    id: 'side_write_grind', npc: 'shadow', title: 'Графоман',
    description: 'Количество переходит в качество. 5 текстов.', type: 'side',
    objectives: [{ id: 'write5', type: 'action_completed', target: 5, actionId: 'write_lyrics', description: 'Написать 5 текстов' }],
    rewards: { fame: 5, path_music: 5, stability: 5 },
  },
  side_hustler: {
    id: 'side_hustler', npc: 'zef', title: 'Мелкий хастл',
    description: 'На районе всегда есть работа. 5 раз выйти на улицу.', type: 'side',
    objectives: [{ id: 'hustle5', type: 'action_completed', target: 5, actionId: 'street_hustle', description: 'Хастл 5 раз' }],
    rewards: { cash: 3000, respect: 8, path_chaos: 3 },
  },
  side_streamer: {
    id: 'side_streamer', npc: 'spirit', title: 'Стример',
    description: 'Камера, микрофон, район за окном. 3 стрима.', type: 'side',
    objectives: [{ id: 'stream3', type: 'action_completed', target: 3, actionId: 'stream', description: 'Стримы: 3 раза' }],
    rewards: { cash: 1500, fame: 10, path_music: 2 },
  },
  side_fighter: {
    id: 'side_fighter', npc: 'zef', title: 'Бойцовский клуб',
    description: 'Кулаки решают. 3 разборки.', type: 'side',
    objectives: [{ id: 'fight3', type: 'action_completed', target: 3, actionId: 'alley_fight', description: 'Разборки: 3 раза' }],
    rewards: { respect: 15, path_chaos: 5, stability: -10 },
  },
  side_doctor_regular: {
    id: 'side_doctor_regular', npc: 'bones', title: 'Регулярная терапия',
    description: 'Здоровье не купишь. Или купишь? 3 визита к доку.', type: 'side',
    objectives: [{ id: 'doc3', type: 'action_completed', target: 3, actionId: 'doctor_visit', description: 'Визит к доку: 3 раза' }],
    rewards: { health: 30, stability: 15, path_survival: 5 },
  },
  side_social_media: {
    id: 'side_social_media', npc: 'spirit', title: 'Инфлюенсер',
    description: 'Лайки, репосты, хейтеры. 3 скролла соцсетей.', type: 'side',
    objectives: [{ id: 'scroll3', type: 'action_completed', target: 3, actionId: 'social_media_scroll', description: 'Скролл соцсетей: 3 раза' }],
    rewards: { fame: 3, mood: -5 },
  },
  side_studio_rat: {
    id: 'side_studio_rat', npc: 'shadow', title: 'Студийная крыса',
    description: 'Жить в студии. Записать 5 куплетов.', type: 'side',
    objectives: [{ id: 'rec5', type: 'action_completed', target: 5, actionId: 'record_verse', description: 'Запись: 5 куплетов' }],
    rewards: { fame: 15, cash: 2000, path_music: 8 },
  },
  side_dark_grind: {
    id: 'side_dark_grind', npc: 'zef', title: 'Теневой бизнес',
    description: 'Три операции подряд. Зэф будет доволен.', type: 'side',
    objectives: [{ id: 'dark3', type: 'action_completed', target: 3, actionId: 'dark_scheme', description: 'Темные схемы: 3 раза' }],
    rewards: { cash: 8000, respect: 12, path_chaos: 8, stability: -15 },
  },

  // ═══════════════════════════════════════
  //  MILESTONE QUESTS (triggered by KPIs)
  // ═══════════════════════════════════════

  mile_respect_25: {
    id: 'mile_respect_25', npc: 'zef', title: 'Район знает имя',
    description: 'Респект 25. Тебя начинают узнавать.', type: 'side',
    objectives: [{ id: 'resp25', type: 'kpi_reached', target: 25, kpi: 'respect', description: 'Респект: 25' }],
    rewards: { cash: 1000, path_chaos: 3 },
  },
  mile_respect_50: {
    id: 'mile_respect_50', npc: 'zef', title: 'Авторитет',
    description: 'Респект 50. Тебя боятся и уважают.', type: 'side',
    objectives: [{ id: 'resp50', type: 'kpi_reached', target: 50, kpi: 'respect', description: 'Респект: 50' }],
    rewards: { cash: 3000, respect: 10, path_chaos: 5 },
  },
  mile_fame_25: {
    id: 'mile_fame_25', npc: 'shadow', title: 'Первые фанаты',
    description: 'Слава 25. Люди слушают твою музыку.', type: 'side',
    objectives: [{ id: 'fame25', type: 'kpi_reached', target: 25, kpi: 'fame', description: 'Слава: 25' }],
    rewards: { cash: 1500, path_music: 3 },
  },
  mile_fame_50: {
    id: 'mile_fame_50', npc: 'shadow', title: 'Локальная звезда',
    description: 'Слава 50. Тебя зовут на вечеринки.', type: 'side',
    objectives: [{ id: 'fame50', type: 'kpi_reached', target: 50, kpi: 'fame', description: 'Слава: 50' }],
    rewards: { cash: 5000, fame: 10, path_music: 5 },
  },
  mile_fame_100: {
    id: 'mile_fame_100', npc: 'shadow', title: 'Звезда района',
    description: 'Слава 100. О тебе пишут блоги.', type: 'side',
    objectives: [{ id: 'fame100', type: 'kpi_reached', target: 100, kpi: 'fame', description: 'Слава: 100' }],
    rewards: { cash: 10000, fame: 20, respect: 15, path_music: 10 },
  },
  mile_cash_10k: {
    id: 'mile_cash_10k', npc: 'spirit', title: 'Первые 10К',
    description: 'Десятка на счету. Не трать на глупости.', type: 'side',
    objectives: [{ id: 'cash10', type: 'kpi_reached', target: 10000, kpi: 'cash', description: 'Кэш: 10,000₽' }],
    rewards: { respect: 5, stability: 5 },
  },
  mile_cash_50k: {
    id: 'mile_cash_50k', npc: 'spirit', title: 'Полтинник',
    description: '50К. Можно съехать с района. Или вложить.', type: 'side',
    objectives: [{ id: 'cash50', type: 'kpi_reached', target: 50000, kpi: 'cash', description: 'Кэш: 50,000₽' }],
    rewards: { respect: 10, fame: 5, stability: 10 },
  },
  mile_cash_100k: {
    id: 'mile_cash_100k', npc: 'spirit', title: 'Сотка',
    description: '100К. Район уже не клетка. Или все еще?', type: 'side',
    objectives: [{ id: 'cash100', type: 'kpi_reached', target: 100000, kpi: 'cash', description: 'Кэш: 100,000₽' }],
    rewards: { respect: 15, fame: 10, path_survival: 10 },
  },
  mile_day_30: {
    id: 'mile_day_30', npc: 'spirit', title: 'Месяц на районе',
    description: 'Ты прожил 30 дней. Не все могут сказать то же.', type: 'side',
    objectives: [{ id: 'day30', type: 'stat_reached', target: 30, stat: 'stability', description: 'Дожить до дня 30 со стабильностью > 30' }],
    rewards: { stability: 10, path_survival: 5 },
  },
  mile_day_90: {
    id: 'mile_day_90', npc: 'spirit', title: 'Первый сезон',
    description: 'Осень позади. Зима впереди. Ты готов?', type: 'side',
    objectives: [{ id: 'day90', type: 'stat_reached', target: 40, stat: 'stability', description: 'Пережить осень (стабильность > 40)' }],
    rewards: { stability: 20, cash: 2000 },
  },

  // ═══════════════════════════════════════
  //  NPC RELATIONSHIP QUESTS
  // ═══════════════════════════════════════

  npc_shadow_trust: {
    id: 'npc_shadow_trust', npc: 'shadow', title: 'Доверие Шэдоу',
    description: 'Шэдоу начинает доверять. Запиши 3 куплета и подними славу.', type: 'side',
    objectives: [
      { id: 'rec3', type: 'action_completed', target: 3, actionId: 'record_verse', description: 'Записать 3 куплета' },
      { id: 'fame15', type: 'kpi_reached', target: 15, kpi: 'fame', description: 'Слава > 15' },
    ],
    rewards: { fame: 10, path_music: 5, respect: 5 },
    minRelationship: 10,
  },
  npc_zef_loyalty: {
    id: 'npc_zef_loyalty', npc: 'zef', title: 'Верность Зэфу',
    description: 'Зэф проверяет. 3 хастла и 2 темные схемы.', type: 'side',
    objectives: [
      { id: 'hustle3', type: 'action_completed', target: 3, actionId: 'street_hustle', description: 'Хастл: 3 раза' },
      { id: 'dark2', type: 'action_completed', target: 2, actionId: 'dark_scheme', description: 'Темные схемы: 2 раза' },
    ],
    rewards: { cash: 5000, respect: 15, path_chaos: 8 },
    minRelationship: 15,
  },
  npc_alchemist_deal: {
    id: 'npc_alchemist_deal', npc: 'alchemist', title: 'Сделка с Алхимиком',
    description: 'Алхимик предлагает работу. Доставь 3 заказа.', type: 'side',
    objectives: [
      { id: 'hustle3a', type: 'action_completed', target: 3, actionId: 'street_hustle', description: 'Доставки: 3 раза' },
    ],
    rewards: { cash: 4000, path_chaos: 5, stability: -10 },
  },
  npc_bones_wisdom: {
    id: 'npc_bones_wisdom', npc: 'bones', title: 'Уроки Бонса',
    description: 'Бонс учит выживать. Тренировки + медитация.', type: 'side',
    objectives: [
      { id: 'train2', type: 'action_completed', target: 2, actionId: 'home_workout', description: 'Тренировки: 2 раза' },
      { id: 'med2', type: 'action_completed', target: 2, actionId: 'meditate', description: 'Медитация: 2 раза' },
    ],
    rewards: { stability: 20, energy: 15, path_survival: 8 },
  },

  // ═══════════════════════════════════════
  //  CHALLENGE QUESTS (hard, rewarding)
  // ═══════════════════════════════════════

  challenge_no_sleep: {
    id: 'challenge_no_sleep', npc: 'spirit', title: 'Бессонная ночь',
    description: 'Не спи целый игровой день. Запиши 3 трека за ночь.', type: 'side',
    objectives: [
      { id: 'rec3night', type: 'action_completed', target: 3, actionId: 'record_verse', description: 'Записать 3 куплета за день' },
    ],
    rewards: { fame: 15, path_music: 5, energy: -30 },
  },
  challenge_clean_week: {
    id: 'challenge_clean_week', npc: 'spirit', title: 'Чистая неделя',
    description: 'Не трогай алхимика 7 дней. Держи стабильность выше 50.', type: 'side',
    objectives: [
      { id: 'stable50', type: 'stat_reached', target: 50, stat: 'stability', description: 'Стабильность > 50' },
    ],
    rewards: { stability: 25, path_survival: 10, respect: 5 },
  },
  challenge_rich: {
    id: 'challenge_rich', npc: 'spirit', title: 'Миллионер',
    description: 'Накопи 500,000₽. Любым способом.', type: 'side',
    objectives: [{ id: 'cash500', type: 'kpi_reached', target: 500000, kpi: 'cash', description: 'Кэш: 500,000₽' }],
    rewards: { respect: 30, fame: 20, path_survival: 15 },
  },
  challenge_all_paths: {
    id: 'challenge_all_paths', npc: 'spirit', title: 'Универсал',
    description: 'Прокачай все три пути выше 15.', type: 'side',
    objectives: [
      { id: 'music15', type: 'stat_reached', target: 15, stat: 'stability', description: 'Все пути > 15 (проверь в Памяти)' },
    ],
    rewards: { respect: 20, fame: 20, cash: 5000 },
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
