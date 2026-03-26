// ============================================
// Duh The Spirit — Core Game Types
// ============================================

// --- Stats ---
export interface Stats {
  health: number;
  energy: number;
  hunger: number;
  mood: number;
  withdrawal: number;
  stability: number;
  adequacy: number;
  anxiety: number;
  trip: number;
  synchronization: number;
}

export type StatKey = keyof Stats;

// --- KPIs ---
export interface KPIs {
  cash: number;
  respect: number;
  fame: number;
  releases: number;
  subscribers: number;
}

export type KPIKey = keyof KPIs;

// --- Paths ---
export interface Paths {
  music: number;
  chaos: number;
  survival: number;
}

export type PathKey = keyof Paths;

// --- Spirit ---
export interface Spirit {
  rage: number;
  trust: number;
}

// --- Neuro ---
export interface NeuroState {
  interfaceLevel: number;
  stability: number;
  maxStability: number;
  corruption: number;
  pests: string[];
  implants: string[];
  shards: string[];
}

// --- Farm ---
export interface GreenhouseSlot {
  seedId: string | null;
  progress: number;
  quality: number;
  health: number;
}

export interface Greenhouse {
  unlocked: boolean;
  activeView: 'mining' | 'greenhouse';
  slots: GreenhouseSlot[];
  waterLevel: number;
  lightLevel: number;
  smellLevel: number;
  carbonFilter: boolean;
}

export interface FarmState {
  lastSync: number;
  coins: number;
  temp: number;
  cryptoRate: number;
  gpus: string[];
  coolers: string[];
  isStrangeDataMining: boolean;
  greenhouse: Greenhouse;
}

// --- Prison ---
export type PrisonRank = 'chort' | 'muzhik' | 'blatnoy' | 'avtoritet';

export interface PrisonCurrency {
  cigarettes: number;
  tea: number;
}

export interface PrisonSentence {
  totalDays: number;
  daysServed: number;
  daysRemaining: number;
}

export interface PrisonState {
  rank: PrisonRank;
  authority: number;
  currency: PrisonCurrency;
  sentence: PrisonSentence;
}

// --- Casino ---
export interface CasinoState {
  unlocked: boolean;
  chips: number;
  casinoLevel: number;
  casinoXP: number;
  dailySpent: number;
  suspicionLevel: number;
  lastResult: unknown | null;
}

// --- Doctor ---
export interface DoctorState {
  adequacy: number;
  trust: number;
  currentMode: string;
  availableModes: string[];
  sessions: number;
  lastSuggestion: string | null;
}

// --- Syndicate ---
export interface SyndicateState {
  active: boolean;
  debt: number;
  nextPaymentDay: number;
  currentPayment: number;
  daysOverdue: number;
  warnings: number;
  totalPaid: number;
}

// --- Home ---
export interface HomeState {
  level: number;
  upgrades: string[];
  cleanliness: number;
}

// --- Quests ---
export interface QuestObjective {
  id: string;
  type: 'action_completed' | 'kpi_reached' | 'stat_reached' | 'items_bought';
  target: number;
  current: number;
  actionId?: string;
  kpi?: string;
  stat?: string;
}

export interface QuestState {
  active: string[];
  completed: string[];
  available: string[];
  /** Tracks action counts: { "questId:objectiveId": count } */
  progress: Record<string, number>;
}

// --- Music ---
export interface MusicTrack {
  id: string;
  name: string;
  quality: number;
  hype: number;
}

export interface MusicState {
  tracks: MusicTrack[];
  currentBeat: string | null;
  currentTopic: string | null;
  fame: number;
}

// --- World ---
export interface WorldMultipliers {
  gpus: number;
  electronics: number;
  club_income: number;
  fame_gain: number;
  pharma: number;
  crypto_rate: number;
}

export interface WorldState {
  activeEvents: string[];
  history: string[];
  multipliers: WorldMultipliers;
}

// --- Log ---
export type LogType = 'good' | 'neutral' | 'danger' | 'info' | 'spirit';

export interface LogEntry {
  text: string;
  type: LogType;
  timestamp: number;
  day: number;
}

// --- Story ---
export interface StoryState {
  seenEvents: Record<string, boolean>;
  firstActionDone: boolean;
}

// --- Stage ---
export interface Stage {
  name: string;
  days: number[];
  checkpoint: boolean;
}

// --- Player Status ---
export type PlayerStatus = 'FREE' | 'PRISON' | 'HOSPITAL';

// ============================================
// FULL GAME STATE
// ============================================
export interface GameState {
  version: string;
  day: number;
  time: number; // minutes 0-1439
  currentStage: number;
  status: PlayerStatus;

  stats: Stats;
  kpis: KPIs;
  paths: Paths;
  spirit: Spirit;
  neuro: NeuroState;
  farm: FarmState;
  prison: PrisonState;
  casino: CasinoState;
  doctor: DoctorState;
  syndicate: SyndicateState;
  home: HomeState;
  quests: QuestState;
  music: MusicState;

  inventory: string[];
  achievements: Record<string, boolean>;
  log: LogEntry[];
  story: StoryState;
  world: WorldState;
  chat: { conversations: Record<string, unknown> };
  npcs: Record<string, { reputation: number }>;

  jailTime?: number;
  stages: Stage[];

  // Daily rewards
  daily: {
    lastClaimDate: string; // ISO date "2026-03-26"
    streak: number;        // consecutive days
    totalLogins: number;
  };
}

// --- Profile ---
export interface Profile {
  id: string;
  telegram_id: string | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  username: string;
  created_at: string;
  last_seen_at: string;
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  username: string;
  telegram_username: string | null;
  cash: number;
  respect: number;
  fame: number;
  day: number;
  last_saved_at: string;
}

export type LeaderboardType = 'respect' | 'fame' | 'cash' | 'subscribers';
