// ============================================
// Season System — 4 psychological states
// Each cycle = 360 game days (90 per season)
// ============================================

export type SeasonId = 'autumn' | 'winter' | 'spring' | 'summer';

export interface SeasonModifiers {
  // Stat decay rates (multiplier, 1.0 = normal)
  moodDecay: number;
  energyDecay: number;
  anxietyGain: number;
  stabilityDecay: number;

  // KPI multipliers
  musicIncome: number;
  fameGain: number;
  respectGain: number;
  criminalRisk: number;

  // Special mechanics
  panicAttackChance: number; // per-action chance of panic (0-1)
  godModeBoost: number; // stat boost to all positive actions
  insomniaDrain: number; // extra energy drain at night (time > 1320 = after 22:00)
  withdrawalRate: number; // withdrawal growth multiplier
}

export interface SeasonConfig {
  id: SeasonId;
  name: string;
  subtitle: string;
  description: string;
  dayRange: [number, number]; // within a 360-day cycle
  modifiers: SeasonModifiers;
  // Visual theming
  theme: {
    bgGradient: string;
    accentColor: string;
    accentGlow: string;
    hudTint: string;
    moodFilter: string; // CSS filter on main content
  };
}

export const SEASON_CYCLE_DAYS = 360;
export const DAYS_PER_SEASON = 90;

export const SEASONS: Record<SeasonId, SeasonConfig> = {
  autumn: {
    id: 'autumn',
    name: 'Осень',
    subtitle: 'Меланхолия',
    description: 'Мир теряет краски. Всё замедляется. Музыка звучит тише.',
    dayRange: [1, 90],
    modifiers: {
      moodDecay: 1.8,
      energyDecay: 1.2,
      anxietyGain: 1.0,
      stabilityDecay: 1.3,
      musicIncome: 0.7,
      fameGain: 0.8,
      respectGain: 1.0,
      criminalRisk: 0.9,
      panicAttackChance: 0,
      godModeBoost: 0,
      insomniaDrain: 0,
      withdrawalRate: 1.2,
    },
    theme: {
      bgGradient: 'linear-gradient(180deg, #0a0808 0%, #1a0f0a 100%)',
      accentColor: '#c47a3a',
      accentGlow: 'rgba(196, 122, 58, 0.4)',
      hudTint: 'rgba(196, 122, 58, 0.08)',
      moodFilter: 'saturate(0.6) brightness(0.92)',
    },
  },

  winter: {
    id: 'winter',
    name: 'Зима',
    subtitle: 'Тревога',
    description: 'Паника подкрадывается. Каждый шаг — минное поле.',
    dayRange: [91, 180],
    modifiers: {
      moodDecay: 1.4,
      energyDecay: 1.5,
      anxietyGain: 2.0,
      stabilityDecay: 1.8,
      musicIncome: 0.5,
      fameGain: 0.6,
      respectGain: 0.8,
      criminalRisk: 1.3,
      panicAttackChance: 0.15,
      godModeBoost: 0,
      insomniaDrain: 0,
      withdrawalRate: 1.5,
    },
    theme: {
      bgGradient: 'linear-gradient(180deg, #050810 0%, #0a0e1a 100%)',
      accentColor: '#4a7dff',
      accentGlow: 'rgba(74, 125, 255, 0.3)',
      hudTint: 'rgba(74, 125, 255, 0.06)',
      moodFilter: 'saturate(0.4) brightness(0.85) contrast(1.1)',
    },
  },

  spring: {
    id: 'spring',
    name: 'Весна',
    subtitle: 'Мания',
    description: 'God mode. Мозг горит. Идеи фонтаном. Но грань тонка.',
    dayRange: [181, 270],
    modifiers: {
      moodDecay: 0.3,
      energyDecay: 0.5,
      anxietyGain: 0.5,
      stabilityDecay: 2.5,
      musicIncome: 2.0,
      fameGain: 2.0,
      respectGain: 1.5,
      criminalRisk: 1.5,
      panicAttackChance: 0,
      godModeBoost: 1.5,
      insomniaDrain: 0,
      withdrawalRate: 0.5,
    },
    theme: {
      bgGradient: 'linear-gradient(180deg, #0a100a 0%, #0f1a0a 100%)',
      accentColor: '#39ff14',
      accentGlow: 'rgba(57, 255, 20, 0.4)',
      hudTint: 'rgba(57, 255, 20, 0.06)',
      moodFilter: 'saturate(1.4) brightness(1.1)',
    },
  },

  summer: {
    id: 'summer',
    name: 'Лето',
    subtitle: 'Трэп',
    description: 'Бессонные ночи. Студия. Тусовки. Записывай пока горит.',
    dayRange: [271, 360],
    modifiers: {
      moodDecay: 0.8,
      energyDecay: 1.6,
      anxietyGain: 0.8,
      stabilityDecay: 1.0,
      musicIncome: 1.8,
      fameGain: 1.5,
      respectGain: 1.2,
      criminalRisk: 1.1,
      panicAttackChance: 0,
      godModeBoost: 0,
      insomniaDrain: 3, // heavy energy drain after 22:00
      withdrawalRate: 1.0,
    },
    theme: {
      bgGradient: 'linear-gradient(180deg, #0a0a05 0%, #1a150a 100%)',
      accentColor: '#ff2d7b',
      accentGlow: 'rgba(255, 45, 123, 0.4)',
      hudTint: 'rgba(255, 45, 123, 0.06)',
      moodFilter: 'saturate(1.1) brightness(1.0) contrast(1.05)',
    },
  },
};

// --- Helpers ---

export function getCurrentSeason(day: number): SeasonConfig {
  const dayInCycle = ((day - 1) % SEASON_CYCLE_DAYS) + 1;

  if (dayInCycle <= 90) return SEASONS.autumn;
  if (dayInCycle <= 180) return SEASONS.winter;
  if (dayInCycle <= 270) return SEASONS.spring;
  return SEASONS.summer;
}

export function getSeasonProgress(day: number): number {
  const dayInCycle = ((day - 1) % SEASON_CYCLE_DAYS) + 1;
  const seasonStart = Math.floor((dayInCycle - 1) / DAYS_PER_SEASON) * DAYS_PER_SEASON + 1;
  return (dayInCycle - seasonStart) / DAYS_PER_SEASON;
}

export function getCycleNumber(day: number): number {
  return Math.floor((day - 1) / SEASON_CYCLE_DAYS) + 1;
}

export function getDaysUntilNextSeason(day: number): number {
  const dayInCycle = ((day - 1) % SEASON_CYCLE_DAYS) + 1;
  const currentSeasonEnd = Math.ceil(dayInCycle / DAYS_PER_SEASON) * DAYS_PER_SEASON;
  return currentSeasonEnd - dayInCycle + 1;
}

/** Should a panic attack trigger this action? (Winter only) */
export function rollPanicAttack(day: number): boolean {
  const season = getCurrentSeason(day);
  if (season.modifiers.panicAttackChance <= 0) return false;
  return Math.random() < season.modifiers.panicAttackChance;
}

/** Get night insomnia energy drain (Summer, after 22:00) */
export function getInsomniaDrain(day: number, time: number): number {
  const season = getCurrentSeason(day);
  if (season.modifiers.insomniaDrain <= 0) return 0;
  // After 22:00 (1320 minutes) or before 06:00 (360 minutes)
  if (time >= 1320 || time < 360) {
    return season.modifiers.insomniaDrain;
  }
  return 0;
}
