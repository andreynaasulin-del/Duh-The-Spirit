import type { NPCDef } from '@/types/npc';

export const NPCS: NPCDef[] = [
  // === SHADOW — продюсер, путь музыки ===
  {
    id: 'shadow',
    name: 'Шэдоу',
    role: 'Продюсер',
    path: 'music',
    icon: '🎧',
    color: '#00e5ff',
    description: 'Независимый продюсер. Слышит талант за километр.',
    location: 'club',
    activeHours: { start: 720, end: 1380 }, // 12:00–23:00
    initialRelationship: 10,
    dialogues: {
      start: {
        text: 'Эй, я слышал твой фристайл на районе. Неплохо. Есть минутка?',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Да, слушаю.', next: 'pitch' },
          { text: 'Кто ты вообще?', next: 'intro', effect: { relationship: -5 } },
          { text: 'Не до разговоров.', effect: { relationship: -10 } },
        ],
      },
      intro: {
        text: 'Шэдоу. Делаю биты. Ищу голос. Может, это ты.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Ладно, давай попробуем.', next: 'pitch', effect: { relationship: 5 } },
          { text: 'Не верю в случайности.', effect: { relationship: -5 } },
        ],
      },
      pitch: {
        text: 'У меня есть бит. Тёмный, как этот район. Запишем демо — бесплатно. Если зайдёт — будем работать.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Идёт. Когда начинаем?', effect: { relationship: 15, path_music: 3, mood: 10 } },
          { text: 'Мне надо подумать.', effect: { relationship: 0 } },
          { text: 'Я сам пишу биты.', effect: { relationship: -10, path_music: 1 } },
        ],
      },
      studio_talk: {
        text: 'Слушай, твой последний трек набирает обороты. Думаю, пора снять клип.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Давай, я готов.', effect: { relationship: 10, path_music: 2, cash: -3000 } },
          { text: 'Нет денег на клип.', next: 'no_money' },
        ],
      },
      no_money: {
        text: 'Я знаю парня с камерой. Сделаем партизанский клип — на районе, ночью. Дёшево и злобно.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Звучит дерзко. Поехали.', effect: { relationship: 15, path_music: 3, mood: 15 } },
          { text: 'Не, хочу по-нормальному.', effect: { relationship: -5 } },
        ],
      },
      // --- WINTER dialogs ---
      winter_block: {
        text: 'Ты пропал на две недели. Я думал всё, сдулся. Что случилось?',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Тревога. Не мог встать с кровати.', next: 'winter_honest', effect: { relationship: 5 } },
          { text: 'Был занят. Работаю.', effect: { relationship: -5 } },
          { text: 'Не твоё дело.', effect: { relationship: -15 } },
        ],
      },
      winter_honest: {
        text: 'Знаю это чувство. Зимой всё тяжелее. Но музыка — это и есть терапия. Давай запишем что-нибудь про это.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Про тревогу? Это... честно.', effect: { relationship: 15, path_music: 5, mood: 20, stability: 10 } },
          { text: 'Не хочу выворачивать душу.', effect: { relationship: 0, path_music: 1 } },
        ],
      },
      // --- SPRING dialogs ---
      spring_fire: {
        text: 'Брат, ты за ночь написал больше чем за весь прошлый месяц. Это гениально. Но... ты спишь вообще?',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Сон для слабых. Давай ещё трек!', effect: { relationship: 5, path_music: 3, energy: -15, stability: -10 } },
          { text: 'Ты прав, надо притормозить.', next: 'spring_slow', effect: { relationship: 10 } },
        ],
      },
      spring_slow: {
        text: 'Я видел как люди сгорают. Не хочу чтобы ты стал одним из них. Давай запишем альбом — но по-умному.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Ладно. Качество важнее скорости.', effect: { relationship: 15, path_music: 5, stability: 15 } },
          { text: 'Нет. Пока горит — нужно записывать.', effect: { relationship: -5, path_music: 3, stability: -15 } },
        ],
      },
      // --- SUMMER dialogs ---
      summer_album: {
        text: 'Альбом готов. 12 треков. Я слушал его три раза подряд. Это... это что-то новое.',
        speaker: 'Шэдоу',
        responses: [
          { text: 'Мы сделали это.', effect: { relationship: 20, mood: 30, path_music: 5 } },
          { text: 'Это только начало.', effect: { relationship: 10, path_music: 3, fame: 5 } },
        ],
      },
    },
  },

  // === ZEF — район, хаос ===
  {
    id: 'zef',
    name: 'Зэф',
    role: 'Авторитет района',
    path: 'chaos',
    icon: '💀',
    color: '#ff2d55',
    description: 'Контролирует район. Уважает силу.',
    location: 'street',
    activeHours: { start: 1200, end: 180 }, // 20:00–03:00
    initialRelationship: 0,
    dialogues: {
      start: {
        text: 'Ты тот новый, что читает на углу? У меня есть работа. Хорошо платит.',
        speaker: 'Зэф',
        responses: [
          { text: 'Какая работа?', next: 'job_offer' },
          { text: 'Я не связываюсь с таким.', effect: { relationship: -15, path_survival: 2 } },
          { text: 'Смотря сколько.', next: 'job_offer', effect: { relationship: 5 } },
        ],
      },
      job_offer: {
        text: 'Нужно перевезти посылку. Не спрашивай что внутри. 5К за ночь.',
        speaker: 'Зэф',
        responses: [
          { text: 'Я в деле.', effect: { relationship: 20, path_chaos: 5, cash: 5000, stability: -15 } },
          { text: 'Слишком рискованно.', effect: { relationship: -10, path_survival: 2 } },
          { text: 'Не за 5К. Давай 10.', next: 'negotiate', condition: { minRelationship: 20 } },
        ],
      },
      negotiate: {
        text: '...У тебя стальные. Ладно, 8К. Но если облажаешься — пеняй на себя.',
        speaker: 'Зэф',
        responses: [
          { text: 'Договорились.', effect: { relationship: 10, path_chaos: 5, cash: 8000, stability: -20 } },
          { text: 'Передумал.', effect: { relationship: -20 } },
        ],
      },
      respect: {
        text: 'Ты доказал, что не крыса. Район тебя уважает теперь. Нужна крыша — обращайся.',
        speaker: 'Зэф',
        responses: [
          { text: 'Ценю. Буду иметь в виду.', effect: { relationship: 15, respect: 10 } },
          { text: 'Я сам себе крыша.', effect: { relationship: -5, respect: 5, path_survival: 2 } },
        ],
      },
      // --- WINTER dialogs ---
      winter_test: {
        text: 'Зима — время крыс. Половина людей сливается. Ты ещё здесь. Это уже говорит о чём-то.',
        speaker: 'Зэф',
        responses: [
          { text: 'Я не бегу.', effect: { relationship: 10, respect: 5, path_chaos: 2 } },
          { text: 'Может, стоило бы.', effect: { relationship: -5, path_survival: 3 } },
        ],
      },
      winter_paranoia: {
        text: 'Кто-то стучит. Я чувствую. Если узнаю кто — ему конец. Ты что-нибудь слышал?',
        speaker: 'Зэф',
        responses: [
          { text: 'Ничего не знаю.', effect: { relationship: 0 } },
          { text: 'Проверь парня с третьего этажа.', effect: { relationship: 15, respect: 5, path_chaos: 5, stability: -10 } },
          { text: 'Может, паранойя? Зима давит на всех.', effect: { relationship: -10, stability: 5 } },
        ],
      },
      // --- SPRING dialogs ---
      spring_power: {
        text: 'Весна. Все просыпаются. И все хотят кусок. Пора показать кто тут главный.',
        speaker: 'Зэф',
        responses: [
          { text: 'Я с тобой. Что нужно?', effect: { relationship: 15, path_chaos: 5, respect: 5 } },
          { text: 'Я думаю, пора мне отойти от дел.', next: 'spring_leave', effect: { relationship: -20 } },
        ],
      },
      spring_leave: {
        text: '...Отойти? Из этого не уходят. Ты или в деле — или ты проблема. Подумай хорошо.',
        speaker: 'Зэф',
        responses: [
          { text: 'Ладно, я остаюсь.', effect: { relationship: 5, path_chaos: 3, stability: -15 } },
          { text: 'Мне нужен перерыв. Не угрожай мне.', effect: { relationship: -25, respect: 10, path_survival: 5 } },
        ],
      },
      // --- SUMMER dialogs ---
      summer_throne: {
        text: 'Я устал. Район высосал всё. Может, пора кому-то молодому... Тебе.',
        speaker: 'Зэф',
        responses: [
          { text: 'Я готов.', effect: { relationship: 20, respect: 20, path_chaos: 10, stability: -15 } },
          { text: 'Не хочу твою корону. Она проклята.', effect: { relationship: -10, path_survival: 10, stability: 10 } },
        ],
      },
    },
  },

  // === АЛХИМИК — тёмная сторона ===
  {
    id: 'alchemist',
    name: 'Алхимик',
    role: 'Химик',
    path: 'chaos',
    icon: '⚗️',
    color: '#9c27b0',
    description: 'Знает формулы настроения. Опасен.',
    location: 'street',
    activeHours: { start: 1320, end: 300 }, // 22:00–05:00
    initialRelationship: -5,
    dialogues: {
      start: {
        text: 'Выглядишь паршиво. Есть кое-что от хандры. Первый раз — бесплатно.',
        speaker: 'Алхимик',
        responses: [
          { text: 'Что это?', next: 'explain' },
          { text: 'Не, я чист.', effect: { relationship: -5, path_survival: 3, stability: 5 } },
        ],
      },
      explain: {
        text: 'Назови это... витамины настроения. Через час будешь летать. Никакой зависимости.',
        speaker: 'Алхимик',
        responses: [
          { text: 'Давай попробую.', effect: { relationship: 10, mood: 40, stability: -20, health: -10, path_chaos: 3 } },
          { text: 'Враньё. Я пас.', effect: { relationship: -10, path_survival: 3, stability: 10 } },
        ],
      },
      returning: {
        text: 'Вернулся? Знал, что вернёшься. На этот раз — 500₽.',
        speaker: 'Алхимик',
        responses: [
          { text: 'Вот деньги.', effect: { cash: -500, mood: 35, stability: -15, health: -15, path_chaos: 2 } },
          { text: 'Я завязал.', effect: { relationship: -15, stability: 15, path_survival: 5 } },
        ],
      },
    },
  },

  // === BONES — тюрьма/выживание ===
  {
    id: 'bones',
    name: 'Бонс',
    role: 'Сокамерник',
    path: 'survival',
    icon: '🦴',
    color: '#ff9800',
    description: 'Старожил. Знает как выжить за решёткой.',
    location: 'prison',
    initialRelationship: 5,
    dialogues: {
      start: {
        text: 'Первый раз? Вижу по глазам. Слушай сюда — тут свои правила.',
        speaker: 'Бонс',
        responses: [
          { text: 'Научи.', next: 'lesson', effect: { relationship: 10 } },
          { text: 'Я и сам разберусь.', effect: { relationship: -10, health: -5 } },
        ],
      },
      lesson: {
        text: 'Правило первое: не смотри в глаза без причины. Второе: качайся каждый день. Третье: пиши. Тексты — это свобода.',
        speaker: 'Бонс',
        responses: [
          { text: 'Спасибо, Бонс.', effect: { relationship: 15, stability: 10, path_survival: 3 } },
          { text: 'А если кто-то полезет?', next: 'fight_advice' },
        ],
      },
      fight_advice: {
        text: 'Бей первым. Один раз. Сильно. Потом — спокойно уходи. Уважение дороже зубов.',
        speaker: 'Бонс',
        responses: [
          { text: 'Понял.', effect: { relationship: 10, respect: 5, path_chaos: 1, path_survival: 2 } },
        ],
      },
    },
  },

  // === SPIRIT — мистический персонаж, внутренний голос ===
  {
    id: 'spirit',
    name: 'Дух',
    role: 'Внутренний голос',
    path: 'all',
    icon: '👁️',
    color: '#e040fb',
    description: 'Твой внутренний голос. Появляется в моменты кризиса.',
    location: null, // appears anywhere
    triggerCondition: { stat: 'stability', operator: '<', value: 25 },
    initialRelationship: 50,
    dialogues: {
      crisis: {
        text: 'Эй. Ты ещё здесь? Я чувствую, как земля уходит из-под ног. Слушай меня.',
        speaker: 'Дух',
        responses: [
          { text: 'Кто ты?', next: 'who' },
          { text: 'Помоги мне.', next: 'help' },
          { text: 'Оставь меня.', effect: { stability: -10, mood: -10 } },
        ],
      },
      who: {
        text: 'Я — это ты. Тот, кого ты забыл. Тот, кто помнит, зачем ты начал.',
        speaker: 'Дух',
        responses: [
          { text: 'Зачем я начал?', next: 'purpose' },
          { text: 'Мне страшно.', next: 'help' },
        ],
      },
      purpose: {
        text: 'Музыка. Свобода. Выбраться отсюда. Это не район держит тебя — это ты сам.',
        speaker: 'Дух',
        responses: [
          { text: 'Ты прав. Я справлюсь.', effect: { stability: 20, mood: 15, path_music: 2, path_survival: 2 } },
          { text: 'Легко говорить...', effect: { stability: 5, mood: 5 } },
        ],
      },
      help: {
        text: 'Дыши. Одна секунда за другой. Ты переживал и хуже. Вспомни, что ты умеешь.',
        speaker: 'Дух',
        responses: [
          { text: 'Я умею читать. Это моё.', effect: { stability: 15, mood: 20, path_music: 3 } },
          { text: 'Я умею выживать.', effect: { stability: 15, mood: 10, path_survival: 3 } },
          { text: 'Я ничего не умею.', effect: { stability: -5, mood: -15 } },
        ],
      },
      // --- WINTER dialogs ---
      winter_dark: {
        text: 'Тьма внутри гуще, чем снаружи. Зима проверяет на прочность. Не каждый проходит.',
        speaker: 'Дух',
        responses: [
          { text: 'Я пройду.', effect: { stability: 10, mood: 10 } },
          { text: 'Я уже не уверен.', next: 'winter_doubt' },
        ],
      },
      winter_doubt: {
        text: 'Сомнение — это нормально. Это значит, ты ещё чувствуешь. Мёртвые не сомневаются.',
        speaker: 'Дух',
        responses: [
          { text: 'Странное утешение. Но спасибо.', effect: { stability: 15, mood: 5 } },
          { text: 'Иногда хочется ничего не чувствовать.', effect: { stability: -10, mood: -10 } },
        ],
      },
      // --- SPRING dialogs ---
      spring_warning: {
        text: 'Ты сейчас летишь. Всё кажется возможным. Я тоже чувствую этот огонь. Но огонь сжигает.',
        speaker: 'Дух',
        responses: [
          { text: 'Я контролирую это.', effect: { stability: -5, mood: 10, path_music: 2 } },
          { text: 'Что мне делать?', next: 'spring_advice' },
          { text: 'Не мешай. Мне хорошо.', effect: { stability: -15, mood: 20 } },
        ],
      },
      spring_advice: {
        text: 'Записывай всё. Каждую идею. Но спи. Ешь. Не забывай что ты — человек, не машина.',
        speaker: 'Дух',
        responses: [
          { text: 'Ты прав. Баланс.', effect: { stability: 15, mood: 5, path_survival: 3, path_music: 2 } },
          { text: 'Баланс — для скучных людей.', effect: { stability: -10, path_chaos: 2 } },
        ],
      },
      // --- SUMMER dialogs ---
      summer_reflect: {
        text: 'Год прошёл. Посмотри на себя. Ты всё ещё тот парень из первого дня? Или кто-то другой?',
        speaker: 'Дух',
        responses: [
          { text: 'Я стал сильнее.', effect: { stability: 10, mood: 15, respect: 3 } },
          { text: 'Я потерял себя.', next: 'summer_lost' },
          { text: 'Я просто выжил. Пока что.', effect: { stability: 5, path_survival: 3 } },
        ],
      },
      summer_lost: {
        text: 'Потерять себя — это первый шаг к тому чтобы найти. Настоящего. Того, кем хотел стать.',
        speaker: 'Дух',
        responses: [
          { text: 'Может, ещё не поздно.', effect: { stability: 20, mood: 20, path_music: 3, path_survival: 3 } },
          { text: 'Уже поздно.', effect: { stability: -15, mood: -20 } },
        ],
      },
      summer_final: {
        text: 'Это был наш год. Какой бы он ни был — ты прожил его. Не каждый может это сказать.',
        speaker: 'Дух',
        responses: [
          { text: 'Спасибо, Дух.', effect: { stability: 10, mood: 10 } },
        ],
      },
    },
  },
];

export function getNPC(id: string): NPCDef | undefined {
  return NPCS.find(n => n.id === id);
}

export function getNPCsByLocation(location: string): NPCDef[] {
  return NPCS.filter(n => n.location === location || n.location === null);
}
