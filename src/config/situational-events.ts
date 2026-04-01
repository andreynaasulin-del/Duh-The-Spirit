/**
 * SITUATIONAL EVENTS — интерактивные события с выбором игрока.
 *
 * Срабатывают после каждого 2-4 действия на локации.
 * Зависят от: локации, сезона, статов, пути.
 * Каждый выбор влияет на статы/KPI/пути.
 */

export interface EventChoice {
  label: string;
  effects: Record<string, number>;
  result: string;
  pathEffect?: Record<string, number>; // music/chaos/survival
}

export interface SituationalEvent {
  id: string;
  location: string;        // 'home' | 'street' | 'club' | 'casino' | 'doctor' | 'shop' | 'spirit' | 'any'
  season?: string;         // autumn | winter | spring | summer | undefined = any
  text: string;
  choices: EventChoice[];
  minDay?: number;         // minimum day to trigger
  condition?: {            // stat conditions
    stat?: string;
    op?: 'lt' | 'gt';
    value?: number;
  };
}

export const SITUATIONAL_EVENTS: SituationalEvent[] = [

  // ═══════════════════════════════════════
  //  ДОМ (home) — 10 событий
  // ═══════════════════════════════════════

  {
    id: 'home_noise',
    location: 'home',
    text: 'Соседи сверху опять орут. Бас из колонки бьёт по потолку. Ты не можешь сосредоточиться.',
    choices: [
      { label: 'Подняться и разобраться', effects: { mood: 10, energy: -10, respect: 3 }, result: 'Постучал. Открыл здоровый мужик. Посмотрел на тебя и выключил. Респект.' },
      { label: 'Надеть наушники и терпеть', effects: { stability: 5, mood: -10 }, result: 'Терпение — тоже навык. Но настроение ни к чёрту.' },
    ],
  },
  {
    id: 'home_roach',
    location: 'home',
    text: 'Таракан размером с палец ползёт по стене. Прямо над твоей кроватью.',
    choices: [
      { label: 'Убить тапком', effects: { mood: 5, stability: 5 }, result: 'Хруст. Мерзко, но проблема решена.' },
      { label: 'Это знак — пора убираться', effects: { stability: 10, mood: 10, energy: -15 }, result: 'Три часа уборки. Хата блестит. В голове тоже чище.' },
    ],
  },
  {
    id: 'home_spirit_mirror',
    location: 'home',
    season: 'autumn',
    text: 'Встал ночью попить воды. В зеркале на секунду увидел чужое лицо. Красные глаза.',
    choices: [
      { label: 'Это просто усталость', effects: { stability: 5, mood: -5 }, result: 'Выпил воды. Лёг обратно. Но заснуть сложнее.' },
      { label: '"Я знаю что это ты, Дух"', effects: { stability: -10, mood: -10, anxiety: 10 }, result: 'Из зеркала раздался смех. Или тебе показалось?' },
    ],
  },
  {
    id: 'home_leak',
    location: 'home',
    text: 'С потолка капает. Вода растекается по полу к розетке.',
    choices: [
      { label: 'Подставить тазик', effects: { stability: -5, mood: -10 }, result: 'Временное решение. Жизнь в этой дыре.' },
      { label: 'Вырубить электричество и вытереть', effects: { energy: -10, stability: 10 }, result: 'Темнота. Но хотя бы не замкнёт. Контроль.' },
    ],
  },
  {
    id: 'home_old_photo',
    location: 'home',
    text: 'Под кроватью нашёл старую фотку. На ней ты маленький. С матерью. Она улыбается.',
    choices: [
      { label: 'Поставить на полку', effects: { mood: 15, stability: 10 }, result: 'Давно забытое тепло. Может, ещё не всё потеряно.' },
      { label: 'Убрать обратно', effects: { mood: -10, stability: 5 }, result: 'Незачем ворошить прошлое. Сейчас другая жизнь.' },
    ],
  },
  {
    id: 'home_power_out',
    location: 'home',
    text: 'Свет вырубился. Весь подъезд в темноте. Телефон на 3%.',
    choices: [
      { label: 'Лечь спать — утро вечера мудренее', effects: { energy: 30, mood: -5 }, result: 'Проснулся — свет дали. Неплохо отдохнул.' },
      { label: 'Выйти на улицу', effects: { energy: -10, mood: 10 }, result: 'Район ночью — другой мир. Тихо. Красиво по-своему.' },
    ],
  },
  {
    id: 'home_spirit_whisper_night',
    location: 'home',
    season: 'winter',
    text: 'Три часа ночи. Дух шепчет из-за стены: "Проверь дверь. Она не заперта."',
    choices: [
      { label: 'Проверить дверь', effects: { anxiety: 15, stability: -10, mood: -10 }, result: 'Заперта. Конечно заперта. Он играет с тобой.' },
      { label: 'Игнорировать', effects: { stability: 10, anxiety: -5 }, result: 'Не поведёшься. Дух затих. Маленькая победа.' },
    ],
  },
  {
    id: 'home_delivery',
    location: 'home',
    text: 'Стук в дверь. Курьер. "Заказ на ваше имя." Ты ничего не заказывал.',
    choices: [
      { label: 'Открыть', effects: { cash: 500, mood: 15 }, result: 'Коробка с едой. Записка: "От друга." Кто-то помнит о тебе.' },
      { label: 'Не открывать', effects: { stability: 5, anxiety: -5 }, result: 'Паранойя? Может быть. Но целее будешь.' },
    ],
  },
  {
    id: 'home_spirit_mania',
    location: 'home',
    season: 'spring',
    text: 'Дух орёт в голове: "ВСТАВАЙ! ПИШИ! ЭТО ЛУЧШИЙ ТЕКСТ В ТВОЕЙ ЖИЗНИ! ПРЯМО СЕЙЧАС!"',
    choices: [
      { label: 'Подчиниться — писать!', effects: { mood: 25, energy: -20, stability: -15 }, result: 'Два часа не останавливался. Текст... гениальный? Или бред? Утром разберёшься.', pathEffect: { music: 3 } },
      { label: 'Нет. Сначала поспать.', effects: { stability: 10, mood: -10 }, result: 'Правильный выбор. Мания — не вдохновение. Но обидно.' },
    ],
  },
  {
    id: 'home_cat',
    location: 'home',
    text: 'Кот залез через окно. Сидит на подоконнике и смотрит на тебя.',
    choices: [
      { label: 'Покормить', effects: { mood: 20, stability: 10 }, result: 'Мурчит. Тёплый. Живой. Тебе тоже стало теплее.' },
      { label: 'Выгнать', effects: { mood: -5 }, result: 'Спрыгнул и ушёл. Один как всегда.' },
    ],
  },

  // ═══════════════════════════════════════
  //  УЛИЦА (street) — 12 событий
  // ═══════════════════════════════════════

  {
    id: 'street_homeless',
    location: 'street',
    text: 'Бездомный у подъезда просит закурить. Выглядит плохо. Трясётся.',
    choices: [
      { label: 'Дать сигарету и поговорить', effects: { mood: 10, stability: 10, respect: 2 }, result: 'Оказывается, он когда-то был музыкантом. "Не повторяй моих ошибок, пацан."' },
      { label: 'Пройти мимо', effects: { mood: -5 }, result: 'Не твои проблемы. Но в голове засело.' },
    ],
  },
  {
    id: 'street_cops',
    location: 'street',
    text: 'Патруль. Два мента идут прямо на тебя. Один показывает пальцем.',
    choices: [
      { label: 'Спокойно подойти', effects: { stability: 5, anxiety: -5 }, result: 'Проверили документы. Отпустили. Паранойя на ровном месте.' },
      { label: 'Свернуть в переулок', effects: { anxiety: 10, stability: -5, respect: 2 }, result: 'Ускорил шаг. Они не пошли за тобой. Или пошли? Нервы.' },
    ],
  },
  {
    id: 'street_kid_rap',
    location: 'street',
    text: 'Малой лет 14 читает рэп у подъезда. Заметил тебя: "Слышь, оцени!"',
    choices: [
      { label: 'Послушать и дать совет', effects: { mood: 15, respect: 3 }, result: 'Сырой, но огонь есть. Ты сказал что думаешь. Его глаза загорелись.', pathEffect: { music: 1 } },
      { label: 'Зачитать ответку', effects: { respect: 8, energy: -10, mood: 20 }, result: 'Баттл во дворе! Район собрался. Ты разнёс. Малой в восторге.', pathEffect: { music: 2 } },
    ],
  },
  {
    id: 'street_stray_dog',
    location: 'street',
    text: 'Бродячая собака рычит, загораживая проход. Большая. Злая.',
    choices: [
      { label: 'Медленно обойти', effects: { stability: 5 }, result: 'Осторожно. Шаг за шагом. Пронесло.' },
      { label: 'Крикнуть и топнуть', effects: { respect: 2, mood: 5, health: -5 }, result: 'Убежала. Но успела цапнуть за ногу. Царапина.' },
    ],
  },
  {
    id: 'street_dealer',
    location: 'street',
    text: '"Эй, братан. Есть тема. Быстрые деньги, без вопросов." Незнакомый парень в капюшоне.',
    choices: [
      { label: 'Слушаю', effects: { cash: 1000, respect: 5, stability: -15 }, result: 'Перенёс пакет из точки А в точку Б. Быстро. Грязно. Но деньги реальные.', pathEffect: { chaos: 3 } },
      { label: 'Не моя тема', effects: { stability: 5, mood: -5 }, result: 'Ушёл. Правильный выбор. Наверное.' },
    ],
  },
  {
    id: 'street_fight_witness',
    location: 'street',
    text: 'Двое бьют одного у мусорки. Тот кричит. Прохожие ускоряют шаг.',
    choices: [
      { label: 'Вмешаться', effects: { health: -15, respect: 10, mood: 10 }, result: 'Получил по лицу, но того парня отпустили. Он запомнил.' },
      { label: 'Пройти мимо', effects: { mood: -15, stability: -5 }, result: 'Крики за спиной. Мерзко на душе.' },
      { label: 'Снять на телефон', effects: { respect: -5, mood: -5, subscribers: 10 }, result: 'Видео набрало просмотры. Но ты знаешь что сделал.', pathEffect: { music: 1 } },
    ],
  },
  {
    id: 'street_graffiti_wall',
    location: 'street',
    text: 'Чистая стена. Идеальный холст. У тебя есть баллончик.',
    choices: [
      { label: 'Нарисовать тег', effects: { respect: 5, mood: 15, energy: -10 }, result: 'Красиво вышло. Район будет знать твоё имя.', pathEffect: { chaos: 2 } },
      { label: 'Написать строчку из текста', effects: { mood: 10, fame: 2 }, result: 'Кто-то сфоткает. Кто-то загуглит. Маркетинг бесплатный.', pathEffect: { music: 2 } },
    ],
  },
  {
    id: 'street_spirit_shadow',
    location: 'street',
    season: 'winter',
    text: 'Тень на стене движется сама по себе. Дух идёт рядом. "Оглянись. За тобой следят."',
    choices: [
      { label: 'Оглянуться', effects: { anxiety: 20, stability: -10 }, result: 'Никого. Пустая улица. Но сердце колотится как бешеное.' },
      { label: '"Ты врёшь, Дух."', effects: { stability: 10, anxiety: -5 }, result: 'Тень исчезла. Ты учишься не верить ему. Прогресс.' },
    ],
  },
  {
    id: 'street_money_found',
    location: 'street',
    text: 'На асфальте — купюра. 500₽. Рядом — старушка ковыляет. Может её.',
    choices: [
      { label: 'Вернуть бабушке', effects: { mood: 20, stability: 15, respect: 3 }, result: '"Спасибо, сынок." В глазах слёзы. Ты чувствуешь себя человеком.' },
      { label: 'Забрать себе', effects: { cash: 500, mood: -10, stability: -5 }, result: 'Деньги в кармане. Совесть грызёт. Но жрать-то надо.' },
    ],
  },
  {
    id: 'street_spirit_spring_run',
    location: 'street',
    season: 'spring',
    text: 'Дух кричит внутри: "БЕГИ! БЕГИ ПРОСТО ТАК! ТЫ МОЖЕШЬ ВСЁ!" Адреналин зашкаливает.',
    choices: [
      { label: 'Бежать по району как псих', effects: { energy: -20, mood: 30, stability: -10 }, result: 'Ветер в лицо. Свобода. Люди смотрят. Плевать. ЖИВОЙ!' },
      { label: 'Глубоко вдохнуть и идти спокойно', effects: { stability: 10, mood: -5 }, result: 'Контроль. Это не свобода — это мания. Ты знаешь разницу.' },
    ],
  },
  {
    id: 'street_phone_call',
    location: 'street',
    text: 'Звонок с неизвестного номера. Тишина в трубке. Потом тихий голос: "Не забывай откуда ты."',
    choices: [
      { label: 'Ответить: "Кто это?"', effects: { anxiety: 10, mood: -10 }, result: 'Гудки. Номер недоступен. Кто-то знает о тебе.' },
      { label: 'Сбросить и заблокировать', effects: { stability: 5 }, result: 'Нет времени на параноидальные игры. Вперёд.' },
    ],
  },
  {
    id: 'street_busker',
    location: 'street',
    text: 'Мужик играет на гитаре у метро. Печальная мелодия. Шапка для монет пустая.',
    choices: [
      { label: 'Бросить 100₽', effects: { cash: -100, mood: 15, stability: 5 }, result: 'Кивнул. Заиграл что-то светлее. Маленький момент.' },
      { label: 'Встать рядом и зачитать под гитару', effects: { respect: 5, fame: 3, energy: -10, mood: 20 }, result: 'Импровизация. Люди остановились. Аплодисменты. Это и есть музыка.', pathEffect: { music: 3 } },
    ],
  },

  // ═══════════════════════════════════════
  //  КЛУБ (club) — 8 событий
  // ═══════════════════════════════════════

  {
    id: 'club_producer_offer',
    location: 'club',
    text: 'Незнакомый продюсер подходит: "Я слышал твой трек. Хочу предложить контракт. Но условия жёсткие."',
    choices: [
      { label: 'Выслушать условия', effects: { fame: 10, mood: 10, stability: -5 }, result: '50/50 на доходы, эксклюзив на год. Жёстко, но это шанс.', pathEffect: { music: 3 } },
      { label: 'Нет. Сам поднимусь.', effects: { respect: 5, mood: 5, stability: 10 }, result: 'Сам. Без подачек. Долгий путь, но свой.' },
    ],
  },
  {
    id: 'club_mic_fail',
    location: 'club',
    text: 'Ты на сцене. Микрофон вырубился. Зал ждёт. Тишина.',
    choices: [
      { label: 'Читать а капелла', effects: { respect: 15, fame: 8, energy: -15, mood: 20 }, result: 'Без микрофона. Голосом. Зал притих, потом взорвался. Легенда.', pathEffect: { music: 5 } },
      { label: 'Уйти со сцены', effects: { mood: -20, respect: -5 }, result: 'Слабость. Все видели. Этот вечер будет сниться.' },
    ],
  },
  {
    id: 'club_rival',
    location: 'club',
    text: 'Местный MC подходит: "Ты кто такой вообще? Давай баттл. Прямо сейчас."',
    choices: [
      { label: 'Принять вызов', effects: { respect: 10, fame: 5, energy: -15, mood: 15 }, result: 'Жёсткий обмен. Ты не проиграл. Район запомнит.', pathEffect: { music: 3 } },
      { label: '"Я не баттлюсь с ноунеймами"', effects: { respect: -3, mood: 5, stability: 5 }, result: 'Уверенность или трусость? Время покажет.' },
    ],
  },
  {
    id: 'club_drunk_fan',
    location: 'club',
    text: 'Пьяный мужик хватает за руку: "БРАТАН, Я ТВОЙ ФАНАТ! СФОТКАЕМСЯ!"',
    choices: [
      { label: 'Сфоткаться', effects: { fame: 3, mood: 5 }, result: 'Фотка. Обнимашки. Запах перегара. Но фанат — это фанат.' },
      { label: 'Вежливо отстраниться', effects: { stability: 5, mood: -5 }, result: 'Личные границы. Но он выглядел расстроенным.' },
    ],
  },
  {
    id: 'club_spirit_stage',
    location: 'club',
    season: 'spring',
    text: 'Дух шепчет перед выходом на сцену: "Ты лучший тут. Скажи им это. СКАЖИ ВСЕМ."',
    choices: [
      { label: 'Выйти и зажечь на полную', effects: { fame: 10, mood: 25, stability: -15, energy: -20 }, result: 'Мания на сцене — это огонь. Зал в экстазе. Но ты горишь изнутри.', pathEffect: { music: 4 } },
      { label: 'Выйти спокойно, по плану', effects: { stability: 10, fame: 3, mood: 5 }, result: 'Стабильно. Профессионально. Не гениально, но надёжно.' },
    ],
  },
  {
    id: 'club_collab_offer',
    location: 'club',
    text: 'Девушка-певица предлагает фит: "У меня есть припев, тебе бы подошёл."',
    choices: [
      { label: 'Согласиться', effects: { fame: 5, mood: 15, subscribers: 10 }, result: 'Записали за ночь. Химия в музыке. Трек зазвучал по-новому.', pathEffect: { music: 3 } },
      { label: 'Я работаю один', effects: { mood: -5, stability: 5 }, result: 'Одиночка. Но свой стиль — свои правила.' },
    ],
  },
  {
    id: 'club_equipment_stolen',
    location: 'club',
    text: 'Пока ты был на сцене, из рюкзака украли наушники. Дорогие.',
    choices: [
      { label: 'Устроить разборку', effects: { respect: 5, energy: -10, mood: -10 }, result: 'Орал на охрану. Никто ничего не видел. Как обычно.', pathEffect: { chaos: 2 } },
      { label: 'Забить — купишь новые', effects: { mood: -5, stability: 5 }, result: 'Вещи — это вещи. Музыка в голове, а не в наушниках.' },
    ],
  },
  {
    id: 'club_spirit_summer_party',
    location: 'club',
    season: 'summer',
    text: 'Дух нашёптывает: "Возьми ещё одну. И ещё. Ночь длинная. Ты заслужил."',
    choices: [
      { label: 'Оторваться по полной', effects: { mood: 30, health: -10, stability: -20, energy: -15 }, result: 'Утро. Голова раскалывается. Что было вчера? Фотки в телефоне пугают.' },
      { label: 'Домой. Хватит.', effects: { stability: 15, mood: -10 }, result: 'Скучный выбор. Правильный выбор. Утром скажешь себе спасибо.' },
    ],
  },

  // ═══════════════════════════════════════
  //  КАЗИНО (casino) — 5 событий
  // ═══════════════════════════════════════

  {
    id: 'casino_hot_streak',
    location: 'casino',
    text: 'Ты выигрываешь третий раз подряд. Дилер смотрит подозрительно. Охрана подошла ближе.',
    choices: [
      { label: 'Ещё одна ставка — на всё', effects: { cash: [-2000, 3000] as any, mood: 15, stability: -10 }, result: 'Ва-банк. Адреналин. Неважно выиграл или нет — ты это почувствовал.' },
      { label: 'Забрать выигрыш и уйти', effects: { cash: 500, stability: 10 }, result: 'Ушёл в плюсе. Редкость. Запомни это чувство.' },
    ],
  },
  {
    id: 'casino_spirit_gamble',
    location: 'casino',
    text: 'Дух шепчет: "Поставь всё. Я чувствую — сейчас выпадет. Доверься мне."',
    choices: [
      { label: 'Доверяю Духу — ва-банк', effects: { cash: -1000, mood: -20, stability: -15 }, result: 'Проигрыш. Конечно проигрыш. Он НИКОГДА не помогает. Запомни.' },
      { label: '"Ты мне не советчик"', effects: { stability: 15, mood: 5 }, result: 'Дух замолчал. Обиделся? Плевать. Деньги целы.' },
    ],
  },
  {
    id: 'casino_debt_collector',
    location: 'casino',
    text: 'Мужик в костюме подсаживается: "Ты должен одному человеку. Он помнит."',
    choices: [
      { label: '"Не знаю о чём ты"', effects: { stability: -10, anxiety: 15 }, result: 'Ушёл. Но ты знаешь — он вернётся.' },
      { label: '"Сколько?"', effects: { cash: -500, stability: 5, anxiety: -5 }, result: 'Отдал 500. Может, это решит проблему. Может, нет.' },
    ],
  },
  {
    id: 'casino_lucky_charm',
    location: 'casino',
    text: 'Старик за соседним столом проиграл всё. Протягивает тебе монетку: "На удачу. Мне уже не поможет."',
    choices: [
      { label: 'Взять монетку', effects: { mood: 10, stability: 5 }, result: 'Холодная. Тяжёлая. Может, и правда на удачу.' },
      { label: 'Вернуть ему 100₽ на такси', effects: { cash: -100, mood: 15, stability: 10 }, result: '"Спасибо, сынок." Уехал. Ты — нормальный человек. Пока что.' },
    ],
  },
  {
    id: 'casino_cheater',
    location: 'casino',
    text: 'Заметил: парень за столом мухлюет. Дилер не видит.',
    choices: [
      { label: 'Сдать дилеру', effects: { respect: -5, cash: 200, stability: 5 }, result: 'Парня вывели. Дилер кинул фишку — за бдительность.' },
      { label: 'Молчать — не твоё дело', effects: { stability: 5 }, result: 'Не лезь куда не просят. Золотое правило.' },
      { label: 'Шантажировать', effects: { cash: 500, respect: 3, stability: -10 }, result: '"500 или я зову охрану." Заплатил. Грязно, но эффективно.', pathEffect: { chaos: 2 } },
    ],
  },

  // ═══════════════════════════════════════
  //  ДОКТОР (doctor) — 5 событий
  // ═══════════════════════════════════════

  {
    id: 'doctor_wrong_pills',
    location: 'doctor',
    text: 'Аптекарь даёт таблетки. Но упаковка вскрыта. Что-то не так.',
    choices: [
      { label: 'Потребовать новую упаковку', effects: { stability: 10, mood: 5 }, result: 'Принесли новую. Закрытую. Паранойя или осторожность? Неважно — целее будешь.' },
      { label: 'Взять как есть', effects: { health: -5, stability: -5 }, result: 'Что-то не то. Голова кружится. В следующий раз проверяй.' },
    ],
  },
  {
    id: 'doctor_spirit_therapy',
    location: 'doctor',
    text: 'На терапии врач спрашивает: "Расскажите про голос. Что он говорит?" Дух внутри кричит: "МОЛЧИ!"',
    choices: [
      { label: 'Рассказать правду', effects: { stability: 20, anxiety: -15, mood: 10 }, result: 'Впервые сказал вслух. Врач кивнул. "Это важный шаг." Легче.' },
      { label: 'Соврать что голос прошёл', effects: { stability: -5, mood: -10 }, result: 'Дух доволен. Врач записал "прогресс". Все довольны. Никто не выздоровел.' },
    ],
  },
  {
    id: 'doctor_waiting_room',
    location: 'doctor',
    text: 'В очереди — парень. Трясётся. Шепчет что-то. Ты узнаёшь — у него то же самое.',
    choices: [
      { label: 'Заговорить с ним', effects: { mood: 15, stability: 10 }, result: '"Ты тоже слышишь?" Кивнул. Впервые — не один.' },
      { label: 'Молча ждать своей очереди', effects: { stability: 5 }, result: 'Каждый со своим. Но ты его запомнил.' },
    ],
  },
  {
    id: 'doctor_diagnosis',
    location: 'doctor',
    minDay: 30,
    text: 'Врач после обследования: "Я хочу поставить вам диагноз. Это поможет подобрать лечение."',
    choices: [
      { label: 'Согласиться на диагноз', effects: { stability: 20, anxiety: -10, mood: -5 }, result: 'Биполярное расстройство. Теперь у этого есть имя. Почему-то легче.' },
      { label: 'Нет. Я не больной.', effects: { stability: -10, mood: -15, anxiety: 10 }, result: 'Встал и ушёл. Дух смеётся. "Я же говорил — ты нормальный."' },
    ],
  },
  {
    id: 'doctor_spirit_pills',
    location: 'doctor',
    text: 'Дух шепчет пока ты берёшь рецепт: "Эти таблетки убьют меня. А без меня ты никто."',
    choices: [
      { label: 'Взять таблетки', effects: { stability: 15, anxiety: -10, mood: -5 }, result: 'Дух тише. Мир спокойнее. Но и тусклее. Это цена.' },
      { label: 'Выбросить рецепт', effects: { stability: -10, mood: 10 }, result: 'Дух ликует. "Мы — команда." Но ты знаешь что он врёт.' },
    ],
  },

  // ═══════════════════════════════════════
  //  МАРКЕТ (shop) — 5 событий
  // ═══════════════════════════════════════

  {
    id: 'shop_scam',
    location: 'shop',
    text: 'Продавец предлагает "оригинальные AirPods" за 500₽. Коробка мятая.',
    choices: [
      { label: 'Купить — рискнуть', effects: { cash: -500, mood: [-10, 15] as any }, result: 'Работают! Или нет. Китайская рулетка.' },
      { label: 'Не смешно', effects: { stability: 5 }, result: 'Мудрый выбор. В этом районе "оригинал" = палёнка.' },
    ],
  },
  {
    id: 'shop_old_friend',
    location: 'shop',
    text: 'У кассы стоит знакомый со школы. Не виделись лет пять. Он в костюме. Ты — нет.',
    choices: [
      { label: 'Подойти и поздороваться', effects: { mood: 10, stability: -5 }, result: '"Как дела?" "Нормально." Оба соврали. Но приятно было.' },
      { label: 'Отвернуться и уйти', effects: { mood: -15, stability: -5 }, result: 'Стыдно. За себя. За район. За всё.' },
    ],
  },
  {
    id: 'shop_spirit_spend',
    location: 'shop',
    season: 'spring',
    text: 'Дух нашёптывает: "Купи всё. Ты заслужил. Деньги — мусор. ЖИВИ!"',
    choices: [
      { label: 'Шоппинг-терапия', effects: { cash: -2000, mood: 30, stability: -15, respect: 5 }, result: 'Новые шмотки. Новые наушники. Кайф. Завтра пожалеешь.' },
      { label: 'Только необходимое', effects: { stability: 10, mood: -5 }, result: 'Еда. Мыло. Всё. Дух разочарован. Ты — нет.' },
    ],
  },
  {
    id: 'shop_theft_witness',
    location: 'shop',
    text: 'Подросток засунул банку в рюкзак. Продавец отвернулся. Пацан смотрит на тебя — "не сдавай".',
    choices: [
      { label: 'Молча кивнуть', effects: { respect: 3, stability: -5 }, result: 'Сообщник? Нет. Просто промолчал. Район.' },
      { label: 'Негромко: "Положи обратно"', effects: { stability: 10, respect: -2 }, result: 'Пацан зло посмотрел, но положил. Может, ты спас его от первой ходки.' },
    ],
  },
  {
    id: 'shop_expired',
    location: 'shop',
    text: 'Купил еду. Дома заметил — срок годности вчера.',
    choices: [
      { label: 'Сожрать — организм переживёт', effects: { health: -5, mood: -5 }, result: 'Живот бурчит. Но сытый. Район закаляет.' },
      { label: 'Вернуться и устроить скандал', effects: { cash: 300, mood: 10, energy: -10, respect: 2 }, result: 'Продавец вернул деньги. Когда орёшь — слышат.' },
    ],
  },

  // ═══════════════════════════════════════
  //  SPIRIT EVENTS (любая локация) — 10 событий
  // ═══════════════════════════════════════

  {
    id: 'spirit_count',
    location: 'any',
    season: 'winter',
    text: 'Дух считает вслух. "Один. Два. Три." Ты не понимаешь что он считает.',
    choices: [
      { label: 'Спросить "что ты считаешь?"', effects: { anxiety: 20, stability: -10 }, result: '"Дни. До конца." Сердце остановилось на секунду.' },
      { label: 'Игнорировать', effects: { stability: 5 }, result: 'Перестал. Может, просто пугал. Как всегда.' },
    ],
  },
  {
    id: 'spirit_compliment',
    location: 'any',
    season: 'autumn',
    text: 'Дух неожиданно: "Ты сегодня молодец. Правда." Это ловушка?',
    choices: [
      { label: '"Спасибо..." (подозрительно)', effects: { mood: 5, stability: -5, anxiety: 5 }, result: 'Он замолчал. Ты не знаешь что хуже — когда он злой или когда добрый.' },
      { label: '"Чего тебе надо?"', effects: { stability: 5, mood: -5 }, result: '"Ничего. Просто... ничего." И тишина. Странно.' },
    ],
  },
  {
    id: 'spirit_song',
    location: 'any',
    season: 'spring',
    text: 'Дух поёт мелодию в твоей голове. Красивую. Ты никогда её не слышал.',
    choices: [
      { label: 'Записать на телефон — напеть', effects: { mood: 20, stability: -10 }, result: 'Голосовое на 2 минуты. Утром переслушаешь. Гениально или безумие?', pathEffect: { music: 3 } },
      { label: 'Выкинуть из головы', effects: { stability: 10, mood: -10 }, result: 'Мелодия ушла. Навсегда. Может, это была лучшая песня что ты не написал.' },
    ],
  },
  {
    id: 'spirit_friend',
    location: 'any',
    text: 'Дух тихо: "Ты единственный, кто меня слышит. Знаешь как это — быть невидимым?"',
    choices: [
      { label: '"Ты не настоящий"', effects: { stability: 10 }, result: 'Молчание. Правда — лучшее оружие.' },
      { label: '"...Знаю"', effects: { mood: -10, stability: -5 }, result: 'Он не ответил. Впервые ты почувствовал к нему... жалость?' },
    ],
  },
  {
    id: 'spirit_dare',
    location: 'any',
    text: 'Дух: "Спорим ты не сможешь простоять на краю крыши 10 секунд."',
    choices: [
      { label: '"Пошёл нахер"', effects: { stability: 15, mood: 5 }, result: 'Правильный ответ. Всегда. На любой его "спор".' },
      { label: '...промолчать', effects: { anxiety: 10, stability: -5 }, result: 'Молчание — не отказ. Он это знает. Ты тоже.' },
    ],
  },
  {
    id: 'spirit_memory',
    location: 'any',
    minDay: 20,
    text: 'Дух показывает тебе воспоминание. Детство. Двор. Ты маленький. Кто-то кричит.',
    choices: [
      { label: 'Впустить воспоминание', effects: { mood: -15, stability: -10, anxiety: 10 }, result: 'Крик. Слёзы. Захлопнутая дверь. Ты вспомнил то, что забыл. Больно.' },
      { label: 'Вытолкнуть из головы', effects: { stability: 5, mood: -5 }, result: 'Стена. Не сейчас. Может быть, не сегодня. Может быть, никогда.' },
    ],
  },
  {
    id: 'spirit_deal',
    location: 'any',
    minDay: 50,
    text: 'Дух серьёзно: "Давай договоримся. Я помогаю тебе с музыкой. Ты перестаёшь пить таблетки."',
    choices: [
      { label: 'Принять сделку', effects: { stability: -20, mood: 20 }, result: 'Рукопожатие с голосом в голове. Безумие нового уровня.', pathEffect: { music: 5 } },
      { label: 'Нет сделок с галлюцинациями', effects: { stability: 15, mood: -10 }, result: '"Я так и знал." Дух обиделся. Правильный выбор.' },
    ],
  },
  {
    id: 'spirit_test',
    location: 'any',
    season: 'summer',
    text: 'Жара. Дух шепчет: "Помнишь первую ночь? Красные глаза? Ты ведь не уверен что я галлюцинация."',
    choices: [
      { label: '"Ты — болезнь. Не больше."', effects: { stability: 20, anxiety: -10 }, result: 'Слова как стена. Он бьётся об неё. Ты крепче.' },
      { label: '"А если нет?"', effects: { stability: -15, anxiety: 15, mood: -10 }, result: 'Сомнение. Самое опасное оружие Духа. И ты только что дал ему патроны.' },
    ],
  },
  {
    id: 'spirit_goodbye',
    location: 'any',
    minDay: 100,
    text: 'Дух тихо, почти неслышно: "Однажды я уйду. И тебе станет хуже без меня."',
    choices: [
      { label: '"Обещаешь?"', effects: { mood: 10, stability: 10 }, result: 'Смех. Его или твой? Юмор — тоже защита.' },
      { label: '...', effects: { mood: -5, stability: -5, anxiety: 5 }, result: 'Тишина. Ты подумал — а вдруг он прав?' },
    ],
  },
  {
    id: 'spirit_revelation',
    location: 'any',
    minDay: 200,
    text: 'Дух показывает что-то новое. Не голос. Не шёпот. Образ. Ты видишь себя со стороны. Сломанного. Но живого.',
    choices: [
      { label: 'Принять то что видишь', effects: { stability: 20, mood: 15, anxiety: -15 }, result: 'Впервые ты не боишься его. Впервые вы... рядом. Не враги.' },
      { label: 'Закрыть глаза', effects: { stability: 5, mood: -5 }, result: 'Ещё не время. Может быть, потом.' },
    ],
  },
];

// ========== ROLL FUNCTION ==========

export function rollSituationalEvent(
  location: string,
  day: number,
  season: string,
  stats: Record<string, number>,
): SituationalEvent | null {
  // Filter eligible events
  const eligible = SITUATIONAL_EVENTS.filter(e => {
    // Location match
    if (e.location !== location && e.location !== 'any') return false;
    // Season match
    if (e.season && e.season !== season) return false;
    // Min day
    if (e.minDay && day < e.minDay) return false;
    // Stat condition
    if (e.condition) {
      const val = stats[e.condition.stat || ''] ?? 50;
      if (e.condition.op === 'lt' && val >= (e.condition.value || 0)) return false;
      if (e.condition.op === 'gt' && val <= (e.condition.value || 0)) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  // ~30% chance to trigger per roll
  if (Math.random() > 0.30) return null;

  return eligible[Math.floor(Math.random() * eligible.length)];
}
