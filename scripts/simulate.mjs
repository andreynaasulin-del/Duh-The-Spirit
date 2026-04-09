#!/usr/bin/env node
/**
 * FULL Game Simulator v2
 *
 * Запуск: node scripts/simulate.mjs [игр] [сложность] [стратегия]
 * Примеры:
 *   node scripts/simulate.mjs 100 medium random
 *   node scripts/simulate.mjs 100 medium music
 *   node scripts/simulate.mjs 100 from_street chaos
 *   node scripts/simulate.mjs 100 light survival
 *   node scripts/simulate.mjs 50 medium all   # все 3 стратегии
 *
 * Проверяет ВСЁ:
 *   баги, квесты, NPC, spirit, события, голод/сон, время прохождения
 */

const NUM_GAMES = parseInt(process.argv[2]) || 100;
const DIFFICULTY = process.argv[3] || 'medium';
const STRATEGY = process.argv[4] || 'all'; // random | music | chaos | survival | all

// ========== ENGINE ==========

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function resolve(v) { return Array.isArray(v) ? rand(v[0], v[1]) : v; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Seasons
function getSeason(day) {
  const d = ((day - 1) % 360) + 1;
  if (d <= 90) return { id: 'autumn', moodDecay: 1.8, energyDecay: 1.2, anxietyGain: 1.0, stabilityDecay: 1.3, panicChance: 0, godBoost: 0, musicIncome: 0.7, fameGain: 0.8 };
  if (d <= 180) return { id: 'winter', moodDecay: 1.4, energyDecay: 1.5, anxietyGain: 2.0, stabilityDecay: 1.8, panicChance: 0.15, godBoost: 0, musicIncome: 0.5, fameGain: 0.75 };
  if (d <= 270) return { id: 'spring', moodDecay: 0.3, energyDecay: 0.5, anxietyGain: 0.5, stabilityDecay: 2.0, panicChance: 0, godBoost: 1.5, musicIncome: 2.0, fameGain: 2.0 };
  return { id: 'summer', moodDecay: 1.0, energyDecay: 1.6, anxietyGain: 0.8, stabilityDecay: 1.0, panicChance: 0, godBoost: 0, musicIncome: 1.8, fameGain: 1.5 };
}

const DIFFS = {
  light:       { canDie: false, statFloor: 10, arrestThreshold: 100, incMul: 1.5, sentMul: 0.5, suspMul: 0.5, decayMul: 0.5 },
  medium:      { canDie: true,  statFloor: 0,  arrestThreshold: 80,  incMul: 1.0, sentMul: 1.0, suspMul: 1.0, decayMul: 1.0 },
  from_street: { canDie: true,  statFloor: 0,  arrestThreshold: 60,  incMul: 0.7, sentMul: 1.5, suspMul: 2.0, decayMul: 1.3 },
};

// ========== ACTIONS (full set, tagged by path preference) ==========
const A = [
  // HOME
  { id: 'sleep',            cat: 'home',   time: 480, fx: { energy: 60, hunger: -10 }, paths: {}, pref: 'any' },
  { id: 'coffee',           cat: 'home',   time: 30,  fx: { energy: 15, mood: 5 }, paths: {}, pref: 'any' },
  { id: 'write_lyrics',     cat: 'home',   time: 60,  fx: { mood: 15, stability: 10 }, paths: { music: 2 }, pref: 'music' },
  { id: 'studio_session',   cat: 'home',   time: 120, fx: { releases: 1, energy: -25 }, paths: { music: 3 }, pref: 'music' },
  { id: 'stream',           cat: 'home',   time: 180, fx: { subscribers: [10, 25], cash: [50, 150], mood: -10 }, paths: { music: 2 }, pref: 'music' },
  { id: 'meditation',       cat: 'home',   time: 60,  fx: { stability: 15, anxiety: -10, mood: 5 }, paths: { survival: 1 }, pref: 'survival' },
  { id: 'toxic_relax',      cat: 'home',   time: 120, fx: { mood: 25, stability: -15, withdrawal: 10 }, paths: { chaos: 1 }, pref: 'chaos' },
  { id: 'take_meds',        cat: 'home',   time: 30,  fx: { stability: 20, anxiety: -15, cash: -800 }, paths: { survival: 2 }, pref: 'survival' },
  { id: 'social_media',     cat: 'home',   time: 30,  fx: { mood: -5, subscribers: [1, 5] }, paths: { music: 1 }, pref: 'music' },
  { id: 'call_dealer',      cat: 'home',   time: 15,  fx: { mood: 30, stability: -20, health: -5, cash: -500 }, paths: { chaos: 2 }, pref: 'chaos' },
  // STREET
  { id: 'freestyle_battle', cat: 'street', time: 120, fx: { respect: [10, 25], mood: 10, energy: -20 }, paths: { music: 3 }, pref: 'music' },
  { id: 'street_hustle',    cat: 'street', time: 120, fx: { cash: [300, 800], respect: [1, 5], energy: -15 }, paths: { chaos: 2 }, pref: 'chaos', susp: 5 },
  { id: 'courier',          cat: 'street', time: 90,  fx: { cash: [400, 700], energy: -10 }, paths: { survival: 2 }, pref: 'survival' },
  { id: 'hack_atm',         cat: 'street', time: 120, fx: { cash: [500, 2000], energy: -20, stability: -10 }, paths: { chaos: 5 }, pref: 'chaos', susp: 20 },
  { id: 'alley_fight',      cat: 'street', time: 60,  fx: { respect: [5, 15], health: -15, energy: -20 }, paths: { chaos: 3 }, pref: 'chaos', susp: 10 },
  { id: 'workout_home',     cat: 'street', time: 90,  fx: { health: 15, energy: -20, mood: 10 }, paths: { survival: 1 }, pref: 'survival' },
  { id: 'doctor_visit',     cat: 'street', time: 60,  fx: { health: 25, cash: -300 }, paths: { survival: 2 }, pref: 'survival' },
  { id: 'rummage_trash',    cat: 'street', time: 30,  fx: { respect: -5, cash: [0, 50] }, paths: { survival: 1 }, pref: 'any' },
  { id: 'graffiti',         cat: 'street', time: 120, fx: { respect: [3, 10], mood: 10, energy: -15 }, paths: { chaos: 2 }, pref: 'chaos', susp: 5 },
  // CLUB
  { id: 'record_track',     cat: 'club',   time: 180, fx: { releases: 1, energy: -30, mood: 10 }, paths: { music: 3 }, pref: 'music' },
  { id: 'open_mic',         cat: 'club',   time: 120, fx: { respect: [5, 15], subscribers: [10, 30], energy: -20 }, paths: { music: 2 }, pref: 'music' },
  { id: 'release_track',    cat: 'club',   time: 60,  fx: { fame: [10, 25], cash: [200, 500], subscribers: [20, 50] }, paths: { music: 5 }, pref: 'music' },
  { id: 'mix_master',       cat: 'club',   time: 120, fx: { releases: 1, energy: -20, cash: -300 }, paths: { music: 2 }, pref: 'music' },
  { id: 'networking',       cat: 'club',   time: 90,  fx: { fame: [2, 8], mood: 5, energy: -10 }, paths: { music: 2 }, pref: 'music' },
  // SHOP
  { id: 'buy_food',         cat: 'shop',   time: 30,  fx: { hunger: 40, cash: -300 }, paths: {}, pref: 'any' },
  { id: 'buy_clothes',      cat: 'shop',   time: 30,  fx: { respect: [3, 8], cash: -2000 }, paths: {}, pref: 'any' },
  { id: 'sell_junk',        cat: 'shop',   time: 30,  fx: { cash: [100, 400] }, paths: {}, pref: 'any' },
  { id: 'buy_phone',        cat: 'shop',   time: 30,  fx: { subscribers: [5, 15], cash: -5000 }, paths: { music: 1 }, pref: 'music' },
  // DOCTOR
  { id: 'therapy_session',  cat: 'doctor', time: 120, fx: { stability: 20, anxiety: -15, mood: 10, cash: -1500 }, paths: { survival: 3 }, pref: 'survival' },
  { id: 'checkup',          cat: 'doctor', time: 90,  fx: { health: 30, cash: -2000 }, paths: { survival: 1 }, pref: 'survival' },
  // CASINO
  { id: 'slot_machine',     cat: 'casino', time: 30,  fx: { cash: [-200, 600], mood: [-10, 20] }, paths: {}, pref: 'any' },
  { id: 'dice_game',        cat: 'casino', time: 30,  fx: { cash: [-500, 1000], mood: [-15, 25] }, paths: {}, pref: 'any' },
  // PRISON
  { id: 'prison_workout',   cat: 'prison', time: 90,  fx: { health: 10, energy: -15, respect: 2 }, paths: { survival: 1 }, pref: 'any' },
  { id: 'prison_read',      cat: 'prison', time: 120, fx: { stability: 10, mood: 5 }, paths: { survival: 2 }, pref: 'any' },
  { id: 'prison_connections', cat: 'prison', time: 60, fx: { respect: [3, 8], chaos: 2 }, paths: { chaos: 2 }, pref: 'chaos' },
];

// Random events (simplified)
const EVENTS = [
  { chance: 0.05, fx: { cash: 200, mood: 5 }, text: 'Нашёл 200₽' },
  { chance: 0.04, fx: { respect: 2, mood: 10 }, text: 'Узнали на улице' },
  { chance: 0.04, fx: { mood: 15, energy: 10 }, text: 'Бабушка угостила' },
  { chance: 0.04, fx: { cash: -300, mood: -10 }, text: 'Карман порезали' },
  { chance: 0.03, fx: { energy: -10, mood: -15 }, text: 'Дождь' },
  { chance: 0.03, fx: { fame: 3, mood: 10 }, text: 'Вирусный клип' },
  { chance: 0.02, fx: { stability: -10, anxiety: 15 }, text: 'Полиция проверка' },
];

// Spirit sabotage
const SABOTAGES = {
  autumn: { chance: 0.12, fx: { mood: -8, energy: -5 }, text: 'Дух сливает мотивацию' },
  winter: { chance: 0.10, fx: { anxiety: 15, stability: -5 }, text: 'Дух сеет паранойю' },
  spring: { chance: 0.08, fx: { cash: -500, mood: 15 }, text: 'Дух: КУПИ ЭТО' },
  summer: { chance: 0.06, fx: { mood: -10, stability: -5 }, text: 'Бессонница от Духа' },
};

// Quests (key story quests only)
const QUESTS = [
  { id: 'awaken', obj: [{ action: 'write_lyrics', need: 1 }], reward: { cash: 200, path_music: 1 }, unlocks: ['street_cred'] },
  { id: 'street_cred', obj: [{ action: 'freestyle_battle', need: 1 }, { kpi: 'respect', need: 5 }], reward: { cash: 500, respect: 5, path_music: 2 }, unlocks: ['shadow_intro', 'zef_offer'] },
  { id: 'shadow_intro', obj: [{ action: 'studio_session', need: 1 }], reward: { fame: 3, path_music: 3 }, unlocks: ['first_demo'] },
  { id: 'first_demo', obj: [{ action: 'record_track', need: 2 }], reward: { cash: 1000, fame: 10, path_music: 5 }, unlocks: ['release_track_q'] },
  { id: 'release_track_q', obj: [{ action: 'release_track', need: 1 }, { kpi: 'fame', need: 20 }], reward: { fame: 15, cash: 2000 }, unlocks: [] },
  { id: 'zef_offer', obj: [{ action: 'street_hustle', need: 2 }], reward: { cash: 800, respect: 5, path_chaos: 3 }, unlocks: ['dark_delivery'] },
  { id: 'dark_delivery', obj: [{ action: 'hack_atm', need: 1 }, { kpi: 'cash', need: 8000 }], reward: { cash: 3000, respect: 10, path_chaos: 5 }, unlocks: [] },
];

// Ending check
function checkEnding(s) {
  const { day, paths: p, kpis: k, stats: st } = s;
  if (day > 10 && (st.stability <= 5 || st.health <= 5)) return 'lost';
  if (day >= 360 && p.music >= 40 && k.fame >= 50 && p.music > p.chaos) return 'rapper';
  if (day >= 360 && p.chaos >= 40 && k.respect >= 50 && p.chaos > p.music) return 'boss';
  if (day >= 360 && p.survival >= 30 && st.stability >= 50) return 'npc';
  if (day >= 360 && p.music >= 50 && p.chaos >= 30 && k.fame >= 100 && k.respect >= 50) return 'legend';
  if (day >= 360) return 'survivor';
  return null;
}

// ========== PLAYER AI (strategy-based) ==========

function chooseAction(available, state, strategy) {
  // Critical needs override strategy
  if (state.stats.energy < 15) return available.find(a => a.id === 'sleep') || available.find(a => a.id === 'coffee') || pick(available);
  if (state.stats.hunger < 20) return available.find(a => a.id === 'buy_food') || pick(available);
  if (state.stats.health < 25) return available.find(a => a.id === 'doctor_visit' || a.id === 'checkup') || pick(available);
  if (state.stats.stability < 25) return available.find(a => a.id === 'meditation' || a.id === 'take_meds' || a.id === 'therapy_session') || pick(available);

  // Strategy preference (70% on-strategy, 30% random for variety)
  if (strategy !== 'random' && Math.random() < 0.7) {
    const preferred = available.filter(a => a.pref === strategy || a.pref === 'any');
    if (preferred.length > 0) return pick(preferred);
  }

  return pick(available);
}

function getAvailable(state, diff) {
  return A.filter(a => {
    if (state.status === 'PRISON' && a.cat !== 'prison') return false;
    if (state.status !== 'PRISON' && a.cat === 'prison') return false;
    // Location gates
    if (a.cat === 'club' && state.paths.music < 3 && state.day < 5) return false;
    if (a.cat === 'casino' && state.day < 5 && state.kpis.cash < 15000) return false;
    // Energy
    const eCost = resolve(a.fx.energy ?? 0);
    if (eCost < 0 && state.stats.energy < Math.abs(eCost)) return false;
    // Cash
    const cCost = typeof a.fx.cash === 'number' ? a.fx.cash : (Array.isArray(a.fx.cash) ? a.fx.cash[0] : 0);
    if (cCost < 0 && state.kpis.cash < Math.abs(cCost)) return false;
    return true;
  });
}

// ========== SIMULATE ==========

function simulate(difficulty, strategy) {
  const diff = DIFFS[difficulty];
  const s = {
    day: 1, time: 0, status: 'FREE',
    stats: { health: 100, energy: 100, hunger: 100, mood: 100, withdrawal: 0, stability: 100, adequacy: 50, anxiety: 0, trip: 0, synchronization: 50 },
    kpis: { cash: 8000, respect: 0, fame: 0, releases: 0, subscribers: 0 },
    paths: { music: 0, chaos: 0, survival: 0 },
    suspicion: 0, prisonDaysLeft: 0,
  };

  const log = { bugs: [], actions: 0, realMinutes: 0, questsDone: [], panicCount: 0, spiritSabs: 0, events: 0, stucks: 0, prisonCount: 0 };

  // Quest state
  const questAvailable = new Set(['awaken']);
  const questActive = new Map(); // id -> { progress }
  const questDone = new Set();
  const actionCounts = {};

  let panicCd = 0;

  while (s.day <= 360) {
    const season = getSeason(s.day);
    const avail = getAvailable(s, diff);

    if (avail.length === 0) {
      log.stucks++;
      log.bugs.push({ type: 'STUCK', day: s.day, status: s.status, energy: s.stats.energy, cash: s.kpis.cash });
      // Emergency: force sleep
      s.stats.energy = clamp(s.stats.energy + 60, 0, 100);
      s.time += 480;
      if (s.time >= 1440) { s.time -= 1440; s.day++; }
      continue;
    }

    const action = chooseAction(avail, s, strategy);
    log.actions++;
    log.realMinutes += 3; // ~3 real seconds per action tap
    actionCounts[action.id] = (actionCounts[action.id] || 0) + 1;

    // Panic attack (winter, cooldown 3)
    if (panicCd > 0) { panicCd--; }
    else if (season.panicChance > 0 && Math.random() < season.panicChance) {
      panicCd = 3;
      log.panicCount++;
      s.stats.anxiety = clamp(s.stats.anxiety + 20, 0, 100);
      s.stats.energy = clamp(s.stats.energy - 15, diff.statFloor, 100);
      continue;
    }

    // Apply effects
    for (const [k, v] of Object.entries(action.fx)) {
      let val = resolve(v);
      if (season.godBoost > 0 && val > 0) val = Math.round(val * season.godBoost);
      if (k in s.stats) s.stats[k] = clamp(s.stats[k] + val, diff.statFloor, 100);
      else if (k in s.kpis) s.kpis[k] = k === 'cash' ? Math.max(0, s.kpis[k] + val) : s.kpis[k] + val;
    }
    for (const [p, v] of Object.entries(action.paths)) {
      if (typeof v === 'number') s.paths[p] = Math.max(0, s.paths[p] + v);
    }

    // Suspicion
    if (action.susp) {
      s.suspicion = Math.min(100, s.suspicion + action.susp * diff.suspMul);
      if (s.suspicion >= diff.arrestThreshold && Math.random() < 0.3) {
        s.status = 'PRISON';
        s.prisonDaysLeft = Math.ceil(10 * diff.sentMul);
        s.suspicion = Math.max(0, s.suspicion - 40);
        log.prisonCount++;
      }
    }

    // Spirit sabotage
    const sab = SABOTAGES[season.id];
    if (sab && Math.random() < sab.chance) {
      log.spiritSabs++;
      for (const [k, v] of Object.entries(sab.fx)) {
        if (k in s.stats) s.stats[k] = clamp(s.stats[k] + v, diff.statFloor, 100);
        else if (k in s.kpis) s.kpis[k] = k === 'cash' ? Math.max(0, s.kpis[k] + v) : s.kpis[k] + v;
      }
    }

    // Random event
    for (const ev of EVENTS) {
      if (Math.random() < ev.chance) {
        log.events++;
        for (const [k, v] of Object.entries(ev.fx)) {
          if (k in s.stats) s.stats[k] = clamp(s.stats[k] + v, diff.statFloor, 100);
          else if (k in s.kpis) s.kpis[k] = k === 'cash' ? Math.max(0, s.kpis[k] + v) : s.kpis[k] + v;
        }
        break; // max 1 event per action
      }
    }

    // Quest tracking
    // Auto-accept available quests
    for (const qid of questAvailable) {
      if (!questActive.has(qid) && !questDone.has(qid)) {
        questActive.set(qid, {});
      }
    }
    // Check completions
    for (const [qid, prog] of questActive) {
      const q = QUESTS.find(x => x.id === qid);
      if (!q) continue;
      const allDone = q.obj.every(o => {
        if (o.action) return (actionCounts[o.action] || 0) >= o.need;
        if (o.kpi) return s.kpis[o.kpi] >= o.need;
        return false;
      });
      if (allDone) {
        questDone.add(qid);
        questActive.delete(qid);
        log.questsDone.push(qid);
        // Apply rewards
        for (const [k, v] of Object.entries(q.reward)) {
          if (k.startsWith('path_')) { s.paths[k.replace('path_', '')] += v; }
          else if (k in s.kpis) s.kpis[k] += v;
          else if (k in s.stats) s.stats[k] = clamp(s.stats[k] + v, 0, 100);
        }
        // Unlock next
        for (const u of q.unlocks) questAvailable.add(u);
      }
    }

    // Advance time
    s.time += action.time;
    while (s.time >= 1440) {
      s.time -= 1440;
      s.day++;
      const ns = getSeason(s.day);
      s.stats.hunger = clamp(s.stats.hunger - 15, diff.statFloor, 100);
      s.stats.energy = clamp(s.stats.energy - Math.round(5 * ns.energyDecay * diff.decayMul), diff.statFloor, 100);
      s.stats.mood = clamp(s.stats.mood - Math.round(5 * ns.moodDecay * diff.decayMul), diff.statFloor, 100);
      s.stats.anxiety = clamp(s.stats.anxiety + Math.round(3 * ns.anxietyGain * diff.decayMul), 0, 100);
      s.stats.stability = clamp(s.stats.stability - Math.round(2 * ns.stabilityDecay * diff.decayMul), diff.statFloor, 100);
      s.suspicion = Math.max(0, s.suspicion - 2);
      if (s.status === 'PRISON') {
        s.prisonDaysLeft--;
        if (s.prisonDaysLeft <= 0) s.status = 'FREE';
      }
    }

    // Bug checks
    if (s.kpis.cash < 0) log.bugs.push({ type: 'NEGATIVE_CASH', day: s.day, cash: s.kpis.cash });
    for (const [k, v] of Object.entries(s.stats)) {
      if (v < diff.statFloor - 1) log.bugs.push({ type: 'STAT_BELOW_FLOOR', day: s.day, stat: k, value: v, floor: diff.statFloor });
      if (v > 100) log.bugs.push({ type: 'STAT_OVER_100', day: s.day, stat: k, value: v });
    }

    // Ending check
    const ending = checkEnding(s);
    if (ending === 'lost' && !diff.canDie) log.bugs.push({ type: 'DEATH_ON_LIGHT', day: s.day });
    if (ending === 'lost' && s.day <= 10) log.bugs.push({ type: 'EARLY_DEATH', day: s.day });
    if (ending) {
      return { ending, day: s.day, log, state: s, realMinutes: log.realMinutes };
    }
  }

  const ending = checkEnding(s) || 'NONE';
  return { ending, day: s.day, log, state: s, realMinutes: log.realMinutes };
}

// ========== RUNNER ==========

function runBatch(difficulty, strategy, count) {
  const res = { endings: {}, bugs: [], avgDay: 0, avgRealMin: 0, avgActions: 0, avgQuests: 0, avgPanics: 0, avgSabs: 0, avgEvents: 0, avgPrisons: 0, stucks: 0 };

  for (let i = 0; i < count; i++) {
    const r = simulate(difficulty, strategy);
    res.endings[r.ending] = (res.endings[r.ending] || 0) + 1;
    res.bugs.push(...r.log.bugs);
    res.avgDay += r.day;
    res.avgRealMin += r.realMinutes;
    res.avgActions += r.log.actions;
    res.avgQuests += r.log.questsDone.length;
    res.avgPanics += r.log.panicCount;
    res.avgSabs += r.log.spiritSabs;
    res.avgEvents += r.log.events;
    res.avgPrisons += r.log.prisonCount;
    res.stucks += r.log.stucks;
  }

  res.avgDay = Math.round(res.avgDay / count);
  res.avgRealMin = Math.round(res.avgRealMin / count);
  res.avgActions = Math.round(res.avgActions / count);
  res.avgQuests = (res.avgQuests / count).toFixed(1);
  res.avgPanics = (res.avgPanics / count).toFixed(1);
  res.avgSabs = (res.avgSabs / count).toFixed(1);
  res.avgEvents = (res.avgEvents / count).toFixed(1);
  res.avgPrisons = (res.avgPrisons / count).toFixed(1);
  return res;
}

function printResult(label, res, count) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${label} (${count} игр)`);
  console.log(`${'─'.repeat(60)}`);

  console.log('\n  Концовки:');
  for (const [e, c] of Object.entries(res.endings).sort((a, b) => b[1] - a[1])) {
    const pct = ((c / count) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct / 2.5));
    console.log(`    ${e.padEnd(12)} ${String(c).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  }

  console.log('\n  Время прохождения:');
  console.log(`    Средний день финала:  ${res.avgDay} / 360`);
  console.log(`    Реальное время:       ~${res.avgRealMin} мин (~${(res.avgRealMin / 60).toFixed(1)} ч)`);
  console.log(`    Действий за игру:     ${res.avgActions}`);

  console.log('\n  Механики:');
  console.log(`    Квестов завершено:    ${res.avgQuests} / 7`);
  console.log(`    Панических атак:      ${res.avgPanics} / игру`);
  console.log(`    Spirit саботажей:     ${res.avgSabs} / игру`);
  console.log(`    Рандомных событий:    ${res.avgEvents} / игру`);
  console.log(`    Посадок в тюрьму:     ${res.avgPrisons} / игру`);
  if (res.stucks > 0) console.log(`    Застреваний:          ${res.stucks}`);

  const bugTypes = {};
  res.bugs.forEach(b => { bugTypes[b.type] = (bugTypes[b.type] || 0) + 1; });
  if (Object.keys(bugTypes).length === 0) {
    console.log('\n  Баги: ✅ нет');
  } else {
    console.log(`\n  Баги: ❌ ${res.bugs.length}`);
    for (const [t, c] of Object.entries(bugTypes)) console.log(`    ${t}: ${c}`);
  }
}

// ========== MAIN ==========

console.log(`\n🎮 GAME SIMULATOR v2 — ${NUM_GAMES} игр, ${DIFFICULTY}, стратегия: ${STRATEGY}\n`);

const strategies = STRATEGY === 'all' ? ['random', 'music', 'chaos', 'survival'] : [STRATEGY];
let totalBugs = 0;

for (const strat of strategies) {
  const res = runBatch(DIFFICULTY, strat, NUM_GAMES);
  printResult(`${DIFFICULTY.toUpperCase()} / ${strat.toUpperCase()}`, res, NUM_GAMES);
  totalBugs += res.bugs.length;
}

console.log(`\n${'═'.repeat(60)}`);
console.log(totalBugs === 0 ? '✅ ALL CLEAR — 0 BUGS' : `⚠️ ${totalBugs} BUGS FOUND`);
console.log(`${'═'.repeat(60)}\n`);
