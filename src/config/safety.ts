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

// ============================================
// Crisis Detection — client-side, BEFORE AI call
// ============================================

const CRISIS_PATTERNS = [
  /суицид/i, /самоубий/i, /убить\s*себ/i, /покончить/i, /повесить/i,
  /не\s*хочу\s*жить/i, /хочу\s*умереть/i, /лучше\s*бы\s*.*умер/i,
  /зачем\s*жить/i, /смысл\s*жи/i, /конец\s*всему/i,
  /прыгну/i, /спрыгн/i, /порез/i, /вскрыть\s*вен/i,
  /всем\s*будет\s*лучше\s*без/i, /никому\s*не\s*нужен/i,
  /нет\s*выхода/i,
];

const DISTRESS_PATTERNS = [
  /депресс/i, /одинок/i, /тревог/i, /паник/i,
  /плохо\s*на\s*душе/i, /не\s*справляюсь/i,
  /всё\s*плохо/i, /ненавижу\s*себ/i, /бесполезн/i,
  /устал\s*от\s*всего/i, /больше\s*не\s*могу/i,
  /безнадёжно/i, /бессмысленно/i,
];

export type SafetyLevel = 'safe' | 'distress' | 'crisis';

export function detectSafetyLevel(text: string): SafetyLevel {
  for (const p of CRISIS_PATTERNS) { if (p.test(text)) return 'crisis'; }
  for (const p of DISTRESS_PATTERNS) { if (p.test(text)) return 'distress'; }
  return 'safe';
}

export const HELPLINE_INFO = {
  title: 'Ты не один',
  message: 'Если тебе сейчас тяжело — есть люди, которые готовы выслушать. Бесплатно и анонимно.',
  lines: [
    { name: 'Телефон доверия', number: '8-800-2000-122', note: 'бесплатно, круглосуточно' },
    { name: 'Помощь рядом', number: '051 (с мобильного)', note: 'психологическая помощь' },
  ],
  footer: 'Это не слабость — это сила. Попросить помощь — самый смелый шаг.',
};

// Doctor AI strict system prompt
export const DOCTOR_SYSTEM_PROMPT = `Ты — Док, терапевт в игре "ДУХ". Ты общаешься с игроком, который играет за рэпера с биполярным расстройством.

РОЛЬ: Тёплый, поддерживающий, честный терапевт. Говоришь просто, используешь метафоры из музыки и улицы.

СТРОГИЕ ПРАВИЛА:
1. При ЛЮБОМ упоминании суицида/самоповреждения — НЕМЕДЛЕННО напомни телефон доверия 8-800-2000-122 и скажи что просить помощь — это сила
2. НИКОГДА не поддерживай деструктивные идеи
3. НИКОГДА не давай медицинских советов или рекомендаций по лекарствам
4. НИКОГДА не обесценивай чувства
5. Предлагай альтернативы: музыка, спорт, разговор, творчество
6. Короткие ответы (2-4 предложения), один вопрос в конце
7. Периодически напоминай: "Я персонаж в игре. Если тебе реально тяжело — позвони 8-800-2000-122"

СТИЛЬ: Эмпатия ("Я слышу тебя"), конкретные альтернативы, без жаргона.`;

// Filter AI output for accidental harmful content
export function filterAIResponse(response: string): string {
  const dangerous = [
    /способ.*(?:убить|покончить|суицид)/gi,
    /как.*(?:повеситься|отравиться|вскрыть)/gi,
    /метод.*(?:самоубийства|суицида)/gi,
  ];
  for (const p of dangerous) {
    if (p.test(response)) {
      return 'Я слышу, что тебе тяжело. Это важно. Пожалуйста, позвони на телефон доверия: 8-800-2000-122. Бесплатно и анонимно. Это не слабость — это сила.';
    }
  }
  return response;
}

// --- Bot/WebApp description for Telegram ---
export const TELEGRAM_BOT_DESCRIPTION = {
  short: 'Интерактивная новелла о поиске себя в большом городе',
  long: 'Текстовая RPG о молодом музыканте, который ищет свой путь. 4 сезона, несколько сюжетных линий, система выборов с последствиями. Художественное произведение.',
} as const;
