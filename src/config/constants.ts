export const GAME_VERSION = '5.0';

export const GAME_CONFIG = {
  MAX_LOG_ENTRIES: 20,
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  GROW_DAYS_TO_HARVEST: 7,
  SPIRIT_RAGE_UPDATE_INTERVAL: 30000,
  AUTO_SAVE_INTERVAL: 30000,
  TICK_INTERVAL: 1000,
} as const;

export const SPIRIT_STATES = {
  OBSERVING: { rage: 0, state: 'наблюдает', noise: 'спокойный' },
  WHISPERING: { rage: 20, state: 'шепчет', noise: 'нервный' },
  CHAOS: { rage: 50, state: 'в восторге от хаоса', noise: 'на грани рейда' },
} as const;

export const ENDINGS = {
  MUSIC: 'music',
  CHAOS: 'chaos',
  SURVIVAL: 'survival',
  PURE_CHAOS: 'pure_chaos',
  THIN_LINE: 'thin_line',
  TOXIC_MASTER: 'toxic_master',
  NO_DOCTOR: 'no_doctor',
} as const;

export const CASINO_PROGRESSION = {
  LEVELS: {
    1: { name: 'Залетный', maxBet: 100, unlockedGames: ['bones', 'slots'], xpRequired: 0 },
    2: { name: 'Игрок', maxBet: 500, unlockedGames: ['bones', 'slots'], xpRequired: 100 },
    3: { name: 'VIP', maxBet: 5000, unlockedGames: ['bones', 'slots', 'wheel'], xpRequired: 500 },
  },
  XP_PER_BET: 1,
  XP_PER_BIG_WIN: 5,
  RAID_TRIGGER_SUSPICION: 100,
  RAID_CHANCE_AFTER_BIG_WIN: 0.05,
  RAID_BLOCK_DURATION: 5 * 60 * 1000,
} as const;

export const ACHIEVEMENTS = [
  { id: 'first_release', title: 'Первый релиз', description: 'Выпустить первый трек в сеть.' },
  { id: 'street_authority', title: 'Уличный авторитет', description: 'Набрать 100 очков респекта.' },
  { id: 'night_shift', title: 'Ночная смена', description: 'Работать в студии до 04:00 утра.' },
  { id: 'stream_king', title: 'Король стримов', description: 'Провести 5 успешных стримов подряд.' },
  { id: 'quiet_trip', title: 'Тихий трип', description: 'Прожить 3 дня без криминала и шума.' },
  { id: 'casino_whale', title: 'Кит', description: 'Выиграть 5000 фишек за один заход.' },
  { id: 'broke_af', title: 'На мели', description: 'Остаться с 0 кэша и долгами.' },
  { id: 'survivor', title: 'Выживший', description: 'Пережить рейд охраны без потерь.' },
] as const;
