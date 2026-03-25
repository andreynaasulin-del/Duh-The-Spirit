/**
 * Path Endings — determine player's fate based on dominant path + stats
 *
 * Checked at end of Season 4 (day 360) or on critical stat thresholds.
 *
 * ENDINGS:
 * 1. РЭПЕР — music path dominant, fame > 100
 * 2. АВТОРИТЕТ — chaos path dominant, respect > 100
 * 3. РАБОТЯГА (NPC) — survival path dominant, stability > 70
 * 4. ПОТЕРЯННЫЙ — stability < 15 or health < 10 at any point
 * 5. ЛЕГЕНДА — music > 50 AND chaos > 30 AND fame > 150 (secret ending)
 */

export interface Ending {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  condition: (state: GameStateSnapshot) => boolean;
  priority: number; // higher = checked first
}

interface GameStateSnapshot {
  day: number;
  paths: { music: number; chaos: number; survival: number };
  kpis: { cash: number; respect: number; fame: number };
  stats: { stability: number; health: number; mood: number; energy: number };
}

export const ENDINGS: Ending[] = [
  // === GAME OVER (highest priority) ===
  {
    id: 'lost',
    title: 'ПОТЕРЯННЫЙ',
    subtitle: 'Район забрал всё',
    description: 'Ты сломался. Стабильность упала до нуля. Район жуёт и не подавится. Может, в следующей жизни...',
    icon: '💀',
    color: '#ff3b3b',
    priority: 100,
    condition: (s) => s.stats.stability <= 5 || s.stats.health <= 5,
  },

  // === SECRET ENDING ===
  {
    id: 'legend',
    title: 'ЛЕГЕНДА РАЙОНА',
    subtitle: 'Между двух миров',
    description: 'Ты нашёл баланс между музыкой и улицей. Тебя уважают все — и студия, и район. Ты — легенда.',
    icon: '👑',
    color: '#ffd700',
    priority: 90,
    condition: (s) => s.paths.music >= 50 && s.paths.chaos >= 30 && s.kpis.fame >= 100 && s.kpis.respect >= 50,
  },

  // === MAIN ENDINGS (checked at day 360) ===
  {
    id: 'rapper',
    title: 'РЭПЕР',
    subtitle: 'Голос поколения',
    description: 'Шэдоу был прав — ты не просто голос. Ты — явление. Альбом разорвал. Гастроли. Подписчики. Свобода.',
    icon: '🎤',
    color: '#00e5ff',
    priority: 50,
    condition: (s) => s.day >= 360 && s.paths.music >= 40 && s.kpis.fame >= 50,
  },

  {
    id: 'boss',
    title: 'АВТОРИТЕТ',
    subtitle: 'Район в кулаке',
    description: 'Зэф ушёл на покой. Теперь ты решаешь кто ходит по этим улицам. Власть пришла ценой покоя.',
    icon: '💀',
    color: '#ff2d55',
    priority: 50,
    condition: (s) => s.day >= 360 && s.paths.chaos >= 40 && s.kpis.respect >= 50,
  },

  {
    id: 'npc',
    title: 'РАБОТЯГА',
    subtitle: 'Обычная жизнь',
    description: 'Ты выжил. Не прославился, не сел. Устроился на работу. Район остался за спиной. Это... тоже победа?',
    icon: '🔧',
    color: '#888888',
    priority: 40,
    condition: (s) => s.day >= 360 && s.paths.survival >= 30 && s.stats.stability >= 50,
  },

  // === FALLBACK ===
  {
    id: 'survivor',
    title: 'ВЫЖИВШИЙ',
    subtitle: 'Ещё один год',
    description: 'Ты не стал ни рэпером, ни авторитетом. Но ты жив. И район не сломал тебя. Пока что.',
    icon: '🌧️',
    color: '#666666',
    priority: 10,
    condition: (s) => s.day >= 360,
  },
];

export function checkEnding(state: GameStateSnapshot): Ending | null {
  // Sort by priority descending, return first matching
  const sorted = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  for (const ending of sorted) {
    if (ending.condition(state)) {
      return ending;
    }
  }
  return null;
}

export function checkGameOver(state: GameStateSnapshot): Ending | null {
  // Only check immediate game-over conditions (not day 360 endings)
  const gameOvers = ENDINGS.filter(e => e.priority >= 100);
  for (const ending of gameOvers) {
    if (ending.condition(state)) {
      return ending;
    }
  }
  return null;
}

/** Get dominant path label */
export function getDominantPath(paths: { music: number; chaos: number; survival: number }): string {
  if (paths.music >= paths.chaos && paths.music >= paths.survival) return 'Музыкант';
  if (paths.chaos >= paths.music && paths.chaos >= paths.survival) return 'Хаос';
  return 'Выживание';
}
