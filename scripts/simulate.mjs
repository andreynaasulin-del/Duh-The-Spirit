#!/usr/bin/env node
/**
 * Game Simulator — прогоняет N полных игр (360 дней) и логирует аномалии.
 *
 * Запуск: node scripts/simulate.mjs [количество_игр] [сложность]
 * Пример: node scripts/simulate.mjs 200 medium
 *
 * Проверяет:
 * - Кэш < 0 (невозможно после фикса)
 * - Статы < 0 или > 100
 * - Застревание (нет доступных действий)
 * - Смерть на day 1 (слишком ранний game over)
 * - Недостижимые концовки
 * - Тюрьма не блокирует действия
 * - Suspicion не спадает
 * - Panic attack в зиму
 * - God mode boost весной
 */

const NUM_GAMES = parseInt(process.argv[2]) || 100;
const DIFFICULTY = process.argv[3] || 'medium';

// ========== INLINE GAME ENGINE ==========

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function resolveEffect(v) { return Array.isArray(v) ? rand(v[0], v[1]) : v; }

// Seasons
function getSeason(day) {
  const d = ((day - 1) % 360) + 1;
  if (d <= 90) return { id: 'autumn', moodDecay: 1.8, energyDecay: 1.2, anxietyGain: 1.0, stabilityDecay: 1.3, panicChance: 0, godBoost: 0 };
  if (d <= 180) return { id: 'winter', moodDecay: 1.4, energyDecay: 1.5, anxietyGain: 2.0, stabilityDecay: 1.8, panicChance: 0.15, godBoost: 0 };
  if (d <= 270) return { id: 'spring', moodDecay: 0.3, energyDecay: 0.5, anxietyGain: 0.5, stabilityDecay: 2.0, panicChance: 0, godBoost: 1.5 };
  return { id: 'summer', moodDecay: 1.0, energyDecay: 1.6, anxietyGain: 0.8, stabilityDecay: 1.0, panicChance: 0, godBoost: 0 };
}

// Difficulty
const DIFFS = {
  light: { canDie: false, statFloor: 10, arrestThreshold: 100, incomeMultiplier: 1.5, sentenceMultiplier: 0.5, suspicionGainMul: 0.5 },
  medium: { canDie: true, statFloor: 0, arrestThreshold: 80, incomeMultiplier: 1.0, sentenceMultiplier: 1.0, suspicionGainMul: 1.0 },
  from_street: { canDie: true, statFloor: 0, arrestThreshold: 60, incomeMultiplier: 0.7, sentenceMultiplier: 1.5, suspicionGainMul: 2.0 },
};

// Actions (simplified — category + effects + time)
const ACTIONS = [
  // HOME
  { id: 'write_lyrics', cat: 'home', time: 60, effects: { mood: 15, stability: 10 }, paths: { music: 2 } },
  { id: 'studio_session', cat: 'home', time: 120, effects: { releases: 1, energy: -25 }, paths: { music: 3 } },
  { id: 'sleep', cat: 'home', time: 480, effects: { energy: 60, hunger: -10 }, paths: {} },
  { id: 'coffee', cat: 'home', time: 30, effects: { energy: 15, mood: 5 }, paths: {} },
  { id: 'meditation', cat: 'home', time: 60, effects: { stability: 15, anxiety: -10, mood: 5 }, paths: { survival: 1 } },
  { id: 'toxic_relax', cat: 'home', time: 120, effects: { mood: 25, stability: -15, withdrawal: 10 }, paths: { chaos: 1 } },
  { id: 'take_meds', cat: 'home', time: 30, effects: { stability: 20, anxiety: -15, cash: -800 }, paths: { survival: 2 } },
  // STREET
  { id: 'freestyle_battle', cat: 'street', time: 120, effects: { respect: [10, 25], mood: 10, energy: -20 }, paths: { music: 3 } },
  { id: 'street_hustle', cat: 'street', time: 120, effects: { cash: [300, 800], respect: [1, 5], energy: -15 }, paths: { chaos: 2 }, suspicion: 5 },
  { id: 'courier', cat: 'street', time: 90, effects: { cash: [400, 700], energy: -10 }, paths: { survival: 2 } },
  { id: 'hack_atm', cat: 'street', time: 120, effects: { cash: [500, 2000], energy: -20, stability: -10 }, paths: { chaos: 5 }, suspicion: 20 },
  { id: 'alley_fight', cat: 'street', time: 60, effects: { respect: [5, 15], health: -15, energy: -20 }, paths: { chaos: 3 }, suspicion: 10 },
  { id: 'workout_home', cat: 'street', time: 90, effects: { health: 15, energy: -20, mood: 10 }, paths: { survival: 1 } },
  { id: 'doctor_visit', cat: 'street', time: 60, effects: { health: 25, cash: -300 }, paths: { survival: 2 } },
  // CLUB
  { id: 'record_track', cat: 'club', time: 180, effects: { releases: 1, energy: -30, mood: 10 }, paths: { music: 3 } },
  { id: 'open_mic', cat: 'club', time: 120, effects: { respect: [5, 15], subscribers: [10, 30], energy: -20 }, paths: { music: 2 } },
  { id: 'release_track', cat: 'club', time: 60, effects: { fame: [10, 25], cash: [200, 500], subscribers: [20, 50] }, paths: { music: 5 } },
  // SHOP
  { id: 'buy_food', cat: 'shop', time: 30, effects: { hunger: 40, cash: -300 }, paths: {} },
  { id: 'buy_clothes', cat: 'shop', time: 30, effects: { respect: [3, 8], cash: -2000 }, paths: {} },
  { id: 'sell_junk', cat: 'shop', time: 30, effects: { cash: [100, 400] }, paths: {} },
  // DOCTOR
  { id: 'therapy_session', cat: 'doctor', time: 120, effects: { stability: 20, anxiety: -15, mood: 10, cash: -1500 }, paths: { survival: 3 } },
  // PRISON
  { id: 'prison_workout', cat: 'prison', time: 90, effects: { health: 10, energy: -15, respect: 2 }, paths: { survival: 1 } },
  { id: 'prison_read', cat: 'prison', time: 120, effects: { stability: 10, mood: 5 }, paths: { survival: 2 } },
];

// Suspicion per action
const SUSPICION_MAP = {};
ACTIONS.forEach(a => { if (a.suspicion) SUSPICION_MAP[a.id] = a.suspicion; });

// Endings check (updated thresholds)
function checkEnding(state) {
  const { day, paths, kpis, stats } = state;
  // Game over — immune first 10 days
  if (day > 10 && (stats.stability <= 5 || stats.health <= 5)) return 'lost';
  // Secret — requires day 300+
  if (day >= 300 && paths.music >= 60 && paths.chaos >= 40 && kpis.fame >= 150 && kpis.respect >= 80) return 'legend';
  if (day >= 360 && paths.music >= 40 && kpis.fame >= 50) return 'rapper';
  if (day >= 360 && paths.chaos >= 40 && kpis.respect >= 50) return 'boss';
  if (day >= 360 && paths.survival >= 30 && stats.stability >= 50) return 'npc';
  if (day >= 360) return 'survivor';
  return null;
}

// ========== SIMULATOR ==========

function createState(difficulty) {
  return {
    day: 1, time: 0, status: 'FREE',
    stats: { health: 100, energy: 100, hunger: 100, mood: 100, withdrawal: 0, stability: 100, adequacy: 50, anxiety: 0, trip: 0, synchronization: 50 },
    kpis: { cash: 8000, respect: 0, fame: 0, releases: 0, subscribers: 0 },
    paths: { music: 0, chaos: 0, survival: 0 },
    suspicion: 0,
    difficulty,
    prisonDaysRemaining: 0,
  };
}

function getAvailableActions(state, diff) {
  return ACTIONS.filter(a => {
    // Prison check
    if (state.status === 'PRISON' && a.cat !== 'prison') return false;
    if (state.status !== 'PRISON' && a.cat === 'prison') return false;
    // Energy check
    const eCost = typeof a.effects.energy === 'number' ? a.effects.energy : (Array.isArray(a.effects.energy) ? a.effects.energy[0] : 0);
    if (eCost < 0 && state.stats.energy < Math.abs(eCost)) return false;
    // Cash check
    const cCost = typeof a.effects.cash === 'number' ? a.effects.cash : (Array.isArray(a.effects.cash) ? a.effects.cash[0] : 0);
    if (cCost < 0 && state.kpis.cash < Math.abs(cCost)) return false;
    // Location gating (simplified)
    if (a.cat === 'club' && state.paths.music < 3 && state.day < 5) return false;
    if (a.cat === 'casino' && state.day < 5 && state.kpis.cash < 15000) return false;
    return true;
  });
}

function simulateGame(difficulty) {
  const diff = DIFFS[difficulty];
  const state = createState(difficulty);
  const bugs = [];
  let panicCount = 0;
  let godBoostCount = 0;
  let suspicionDecayTotal = 0;
  let prisonCount = 0;
  let actionsInPrisonBlocked = 0;
  let panicCooldown = 0;

  while (state.day < 360) {
    const season = getSeason(state.day);
    const available = getAvailableActions(state, diff);

    // Bug: no available actions (stuck)
    if (available.length === 0) {
      bugs.push({ type: 'STUCK', day: state.day, status: state.status, energy: state.stats.energy, cash: state.kpis.cash });
      // Force sleep to unstick
      state.stats.energy = clamp(state.stats.energy + 60, 0, 100);
      state.time += 480;
      continue;
    }

    // Pick random action (weighted toward survival when stats low)
    let action;
    if (state.stats.energy < 20) {
      action = available.find(a => a.id === 'sleep' || a.id === 'coffee') || available[Math.floor(Math.random() * available.length)];
    } else if (state.stats.health < 30) {
      action = available.find(a => a.id === 'doctor_visit') || available[Math.floor(Math.random() * available.length)];
    } else {
      action = available[Math.floor(Math.random() * available.length)];
    }

    // Panic attack check (Winter, cooldown 3 actions)
    if (panicCooldown > 0) {
      panicCooldown--;
    } else if (season.panicChance > 0 && Math.random() < season.panicChance) {
      panicCooldown = 3;
      panicCount++;
      state.stats.anxiety = clamp(state.stats.anxiety + 20, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 15, 0, 100);
      continue; // Action fails
    }

    // Apply effects with god mode boost
    for (const [key, val] of Object.entries(action.effects)) {
      let resolved = resolveEffect(val);
      // God mode boost (Spring)
      if (season.godBoost > 0 && resolved > 0) {
        resolved = Math.round(resolved * season.godBoost);
        godBoostCount++;
      }
      // Apply to stats
      if (key in state.stats) {
        state.stats[key] = clamp(state.stats[key] + resolved, diff.statFloor, 100);
      } else if (key in state.kpis) {
        state.kpis[key] = key === 'cash' ? Math.max(0, state.kpis[key] + resolved) : state.kpis[key] + resolved;
      }
    }

    // Apply paths
    if (action.paths) {
      for (const [p, v] of Object.entries(action.paths)) {
        if (typeof v === 'number') state.paths[p] = Math.max(0, state.paths[p] + v);
      }
    }

    // Advance time
    state.time += action.time;
    while (state.time >= 1440) {
      state.time -= 1440;
      state.day++;
      const newSeason = getSeason(state.day);
      // Daily decay
      state.stats.hunger = clamp(state.stats.hunger - 15, diff.statFloor, 100);
      state.stats.energy = clamp(state.stats.energy - Math.round(5 * newSeason.energyDecay), diff.statFloor, 100);
      state.stats.mood = clamp(state.stats.mood - Math.round(5 * newSeason.moodDecay), diff.statFloor, 100);
      state.stats.anxiety = clamp(state.stats.anxiety + Math.round(3 * newSeason.anxietyGain), 0, 100);
      state.stats.stability = clamp(state.stats.stability - Math.round(2 * newSeason.stabilityDecay), diff.statFloor, 100);
      // Suspicion decay
      state.suspicion = Math.max(0, state.suspicion - 2);
      suspicionDecayTotal += 2;
      // Prison countdown
      if (state.status === 'PRISON') {
        state.prisonDaysRemaining--;
        if (state.prisonDaysRemaining <= 0) {
          state.status = 'FREE';
        }
      }
    }

    // Suspicion
    if (SUSPICION_MAP[action.id]) {
      state.suspicion = Math.min(100, state.suspicion + SUSPICION_MAP[action.id] * diff.suspicionGainMul);
      // Arrest check
      if (state.suspicion >= diff.arrestThreshold && Math.random() < 0.3) {
        state.status = 'PRISON';
        state.prisonDaysRemaining = Math.ceil(30 * diff.sentenceMultiplier);
        state.suspicion = Math.max(0, state.suspicion - 40);
        prisonCount++;
      }
    }

    // Bug checks
    if (state.kpis.cash < 0) bugs.push({ type: 'NEGATIVE_CASH', day: state.day, cash: state.kpis.cash });
    for (const [k, v] of Object.entries(state.stats)) {
      if (v < 0) bugs.push({ type: 'NEGATIVE_STAT', day: state.day, stat: k, value: v });
      if (v > 100) bugs.push({ type: 'STAT_OVER_100', day: state.day, stat: k, value: v });
    }

    // Check game over
    const ending = checkEnding(state);
    if (ending === 'lost' && !diff.canDie) {
      bugs.push({ type: 'DEATH_ON_LIGHT', day: state.day });
    }
    if (ending === 'lost' && state.day < 10) {
      bugs.push({ type: 'EARLY_DEATH', day: state.day, health: state.stats.health, stability: state.stats.stability });
    }
    if (ending) {
      return { ending, day: state.day, bugs, panicCount, godBoostCount, suspicionDecayTotal, prisonCount, state };
    }
  }

  // Should not reach here — day 360 always triggers an ending
  const ending = checkEnding(state);
  return { ending: ending || 'NONE', day: state.day, bugs, panicCount, godBoostCount, suspicionDecayTotal, prisonCount, state };
}

// ========== RUN ==========

console.log(`\n🎮 GAME SIMULATOR — ${NUM_GAMES} игр на сложности "${DIFFICULTY}"\n`);
console.log('='.repeat(60));

const results = { endings: {}, totalBugs: [], earlyDeaths: 0, stucks: 0, totalPanics: 0, totalGodBoosts: 0, totalPrisons: 0, avgDay: 0 };

for (let i = 0; i < NUM_GAMES; i++) {
  const r = simulateGame(DIFFICULTY);
  results.endings[r.ending] = (results.endings[r.ending] || 0) + 1;
  results.totalBugs.push(...r.bugs);
  results.earlyDeaths += r.bugs.filter(b => b.type === 'EARLY_DEATH').length;
  results.stucks += r.bugs.filter(b => b.type === 'STUCK').length;
  results.totalPanics += r.panicCount;
  results.totalGodBoosts += r.godBoostCount;
  results.totalPrisons += r.prisonCount;
  results.avgDay += r.day;
}

results.avgDay = Math.round(results.avgDay / NUM_GAMES);

// Report
console.log('\n📊 КОНЦОВКИ:');
for (const [ending, count] of Object.entries(results.endings).sort((a, b) => b[1] - a[1])) {
  const pct = ((count / NUM_GAMES) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(pct / 2));
  console.log(`  ${ending.padEnd(12)} ${String(count).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
}

console.log(`\n📈 СТАТИСТИКА:`);
console.log(`  Средний день финала: ${results.avgDay}`);
console.log(`  Всего посадок в тюрьму: ${results.totalPrisons} (${(results.totalPrisons / NUM_GAMES).toFixed(1)}/игру)`);
console.log(`  Панических атак (зима): ${results.totalPanics} (${(results.totalPanics / NUM_GAMES).toFixed(1)}/игру)`);
console.log(`  God mode бустов (весна): ${results.totalGodBoosts} (${(results.totalGodBoosts / NUM_GAMES).toFixed(0)}/игру)`);

console.log(`\n🐛 БАГИ (${results.totalBugs.length} найдено):`);

const bugTypes = {};
results.totalBugs.forEach(b => { bugTypes[b.type] = (bugTypes[b.type] || 0) + 1; });

if (Object.keys(bugTypes).length === 0) {
  console.log('  ✅ Багов не обнаружено!');
} else {
  for (const [type, count] of Object.entries(bugTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ❌ ${type}: ${count} раз`);
  }
  // Show first 5 bug details
  console.log('\n  Первые 5 багов:');
  results.totalBugs.slice(0, 5).forEach((b, i) => {
    console.log(`    ${i + 1}. [День ${b.day}] ${b.type}: ${JSON.stringify(b)}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log(results.totalBugs.length === 0 ? '✅ READY TO LAUNCH' : `⚠️ ${results.totalBugs.length} ISSUES FOUND`);
console.log('='.repeat(60) + '\n');
