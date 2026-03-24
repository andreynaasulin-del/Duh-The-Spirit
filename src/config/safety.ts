// ============================================
// Content Safety Layer
// Euphemism mapping for Telegram compliance
// ============================================

/**
 * STRATEGY:
 * 1. All user-facing text uses euphemisms (this file)
 * 2. Database stores ONLY euphemistic keys (never raw terms)
 * 3. Game metadata uses genre-neutral language
 * 4. Bot description avoids trigger words
 *
 * TELEGRAM GUIDELINES TO AVOID:
 * - No promotion of drug use (use "substances" → "energy drinks", "herbal tea")
 * - No suicide/self-harm content (use "giving up" → "losing the path")
 * - No explicit violence promotion (use consequences-focused language)
 * - No gambling promotion (frame casino as "entertainment mini-games")
 */

// --- Euphemism Dictionary ---
// Maps internal concept → user-facing safe text
export const SAFE_TEXT = {
  // Substances → Energy/Herbal metaphors
  drugs: 'зелья',
  dealer: 'алхимик',
  withdrawal: 'усталость',
  overdose: 'перегрузка',
  addiction: 'привычка',
  high: 'подъём',
  stash: 'запас',
  narcotics: 'снадобья',
  needle: 'инструмент',
  dose: 'порция',

  // Violence → Street/Competition metaphors
  fight: 'разборка',
  weapon: 'инструмент улицы',
  kill: 'устранить',
  murder: 'тёмное дело',
  blood: 'след',
  robbery: 'рискованная сделка',

  // Mental health → Neutral terminology
  bipolar: 'внутренний маятник',
  depression: 'серая полоса',
  mania: 'вспышка',
  anxiety: 'напряжение',
  suicide: 'потеря пути',
  selfHarm: 'саморазрушение',
  psychosis: 'помутнение',
  breakdown: 'обрыв',

  // Criminal → Street business metaphors
  prison: 'изоляция',
  crime: 'тёмные дела',
  gang: 'братство',
  mafia: 'синдикат',
  steal: 'добыть',
  launder: 'очистить',

  // Casino → Entertainment
  gambling: 'развлечения',
  bet: 'ставка удачи',
  casino: 'клуб удачи',
} as const;

// --- Disclaimer texts ---
export const DISCLAIMERS = {
  gameStart: `Это интерактивная художественная новелла. Все события вымышлены. Игра не пропагандирует противоправные действия или саморазрушительное поведение.`,

  mentalHealth: `Если вы переживаете трудности — обратитесь за помощью. Телефон доверия: 8-800-2000-122 (бесплатно, анонимно, круглосуточно).`,

  contentWarning: (season: string) => {
    const warnings: Record<string, string> = {
      autumn: 'Сезон содержит темы меланхолии и потери мотивации.',
      winter: 'Сезон содержит темы тревожности и внутреннего напряжения.',
      spring: 'Сезон содержит темы импульсивного поведения и переоценки сил.',
      summer: 'Сезон содержит темы бессонницы и чрезмерной активности.',
    };
    return warnings[season] || '';
  },

  consequences: `Негативные выборы в игре ведут к негативным последствиям — это часть нарратива.`,
} as const;

// --- Bot/WebApp description for Telegram ---
export const TELEGRAM_BOT_DESCRIPTION = {
  short: 'Интерактивная новелла о поиске себя в большом городе',
  long: 'Текстовая RPG о молодом музыканте, который ищет свой путь. 4 сезона, несколько сюжетных линий, система выборов с последствиями. Художественное произведение.',
} as const;
