/**
 * Difficulty System — 3 modes that change how death/arrest works
 *
 * LIGHT: Casual mode. Can't die. Stats floor at 5.
 * MEDIUM: Standard mode. Can die if stability + health both < 5. Respawn with penalty.
 * FROM_STREET: Hardcore. One life. Death = full progress wipe.
 *              Suspicion builds fast. Arrest more likely.
 */

export type DifficultyMode = 'light' | 'medium' | 'from_street';

export interface DifficultyConfig {
  id: DifficultyMode;
  name: string;
  emoji: string;
  subtitle: string;
  description: string;

  // Death mechanics
  canDie: boolean;
  statFloor: number; // minimum stat value (light = 5, others = 0)
  deathRespawn: boolean; // true = respawn with penalty, false = game over

  // Suspicion / arrest
  suspicionGainMultiplier: number; // how fast suspicion builds
  arrestThreshold: number; // suspicion level that triggers arrest

  // Economy
  incomeMultiplier: number;
  priceMultiplier: number;

  // Spirit
  spiritFrequency: number; // multiplier for spirit popup frequency
  spiritAggression: number; // how often spirit suggests dangerous actions

  // Stat decay
  decayMultiplier: number;

  // Prison
  sentenceMultiplier: number; // scales prison sentence length
}

export const DIFFICULTIES: Record<DifficultyMode, DifficultyConfig> = {
  light: {
    id: 'light',
    name: 'LIGHT',
    emoji: '☀️',
    subtitle: 'Для сюжета',
    description: 'Невозможно умереть. Статы не падают ниже 5. Дух появляется редко. Для тех кто хочет пройти сюжет.',
    canDie: false,
    statFloor: 5,
    deathRespawn: false,
    suspicionGainMultiplier: 0.5,
    arrestThreshold: 100, // practically unreachable
    incomeMultiplier: 1.5,
    priceMultiplier: 0.8,
    spiritFrequency: 0.3,
    spiritAggression: 0.2,
    decayMultiplier: 0.5,
    sentenceMultiplier: 0.5,
  },

  medium: {
    id: 'medium',
    name: 'MEDIUM',
    emoji: '⚡',
    subtitle: 'Стандарт',
    description: 'Можно умереть, но не легко. Респаун с потерей 50% кэша. Дух активен. Баланс сюжета и выживания.',
    canDie: true,
    statFloor: 0,
    deathRespawn: true,
    suspicionGainMultiplier: 1.0,
    arrestThreshold: 80,
    incomeMultiplier: 1.0,
    priceMultiplier: 1.0,
    spiritFrequency: 1.0,
    spiritAggression: 0.5,
    decayMultiplier: 1.0,
    sentenceMultiplier: 1.0,
  },

  from_street: {
    id: 'from_street',
    name: 'FROM STREET',
    emoji: '💀',
    subtitle: 'Одна попытка',
    description: 'Хардкор. Одна жизнь. Смерть = потеря ВСЕГО прогресса. Подозрение растёт быстро. Дух агрессивен. Район не прощает.',
    canDie: true,
    statFloor: 0,
    deathRespawn: false, // full wipe
    suspicionGainMultiplier: 2.0,
    arrestThreshold: 60,
    incomeMultiplier: 0.7,
    priceMultiplier: 1.3,
    spiritFrequency: 2.0,
    spiritAggression: 0.8,
    decayMultiplier: 1.5,
    sentenceMultiplier: 1.5,
  },
};

// Actions that increase suspicion
export const SUSPICIOUS_ACTIONS: Record<string, number> = {
  hack_atm: 20,
  alley_fight: 10,
  street_hustle: 5,
  shop_lift: 12,
  start_grow: 8,
  harvest_grow: 10,
};

// What happens at different suspicion levels
export const SUSPICION_LEVELS = [
  { threshold: 0, label: 'Чисто', color: '#39ff14', description: 'Район тебя не замечает' },
  { threshold: 20, label: 'Слухи', color: '#ffeb3b', description: 'О тебе шепчутся' },
  { threshold: 40, label: 'Наблюдение', color: '#ff9800', description: 'За тобой следят' },
  { threshold: 60, label: 'Розыск', color: '#ff5722', description: 'Тебя ищут' },
  { threshold: 80, label: 'Облава', color: '#f44336', description: 'Вопрос времени' },
  { threshold: 95, label: 'АРЕСТ', color: '#ff0000', description: 'Они идут за тобой' },
];

export function getSuspicionLevel(suspicion: number) {
  let current = SUSPICION_LEVELS[0];
  for (const level of SUSPICION_LEVELS) {
    if (suspicion >= level.threshold) current = level;
  }
  return current;
}

/** Check if arrest should trigger */
export function shouldArrest(suspicion: number, difficulty: DifficultyConfig): boolean {
  if (suspicion < difficulty.arrestThreshold) return false;
  // Above threshold: random chance per action, higher suspicion = higher chance
  const chance = (suspicion - difficulty.arrestThreshold) / (100 - difficulty.arrestThreshold);
  return Math.random() < chance;
}

/** Suspicion naturally decays over time */
export function getSuspicionDecay(day: number): number {
  return 2; // -2 per day naturally
}
