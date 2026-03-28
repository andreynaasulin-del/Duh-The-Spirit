import { z } from 'zod';

const stat = z.number().min(-10).max(110); // slight buffer for floating point

export const StatsSchema = z.object({
  health: stat,
  energy: stat,
  hunger: stat,
  mood: stat,
  withdrawal: stat,
  stability: stat,
  adequacy: stat,
  anxiety: stat,
  trip: stat,
  synchronization: stat,
});

export const KPIsSchema = z.object({
  cash: z.number().min(-100000), // can go into debt via syndicate
  respect: z.number().min(0),
  fame: z.number().min(0),
  releases: z.number().min(0),
  subscribers: z.number().min(0),
});

export const PathsSchema = z.object({
  music: z.number().min(0),
  chaos: z.number().min(0),
  survival: z.number().min(0),
});

export const SpiritSchema = z.object({
  rage: z.number().min(0).max(100),
  trust: z.number().min(0).max(100),
});

export const NeuroSchema = z.object({
  interfaceLevel: z.number().min(0),
  stability: z.number(),
  maxStability: z.number().min(0).max(100),
  corruption: z.number().min(0),
  pests: z.array(z.string()),
  implants: z.array(z.string()),
  shards: z.array(z.string()),
});

export const GreenhouseSlotSchema = z.object({
  seedId: z.string().nullable(),
  progress: z.number().min(0).max(200),
  quality: z.number().min(0).max(100),
  health: z.number().min(0).max(100),
});

export const GreenhouseSchema = z.object({
  unlocked: z.boolean(),
  activeView: z.enum(['mining', 'greenhouse']),
  slots: z.array(GreenhouseSlotSchema).max(8),
  waterLevel: z.number().min(0).max(100),
  lightLevel: z.number().min(0).max(100),
  smellLevel: z.number().min(0).max(100),
  carbonFilter: z.boolean(),
});

export const FarmSchema = z.object({
  lastSync: z.number(),
  coins: z.number().min(0),
  temp: z.number().min(0).max(100),
  cryptoRate: z.number().min(0),
  gpus: z.array(z.string()).max(12),
  coolers: z.array(z.string()).max(8),
  isStrangeDataMining: z.boolean(),
  greenhouse: GreenhouseSchema,
});

export const PrisonSchema = z.object({
  rank: z.enum(['chort', 'muzhik', 'blatnoy', 'avtoritet']),
  authority: z.number().min(0),
  currency: z.object({
    cigarettes: z.number().min(0),
    tea: z.number().min(0),
  }),
  sentence: z.object({
    totalDays: z.number().min(0),
    daysServed: z.number().min(0),
    daysRemaining: z.number().min(0),
  }),
});

export const CasinoSchema = z.object({
  unlocked: z.boolean(),
  chips: z.number().min(0),
  casinoLevel: z.number().min(1).max(3),
  casinoXP: z.number().min(0),
  dailySpent: z.number().min(0),
  suspicionLevel: z.number().min(0).max(100),
  lastResult: z.unknown().nullable(),
});

export const DoctorSchema = z.object({
  adequacy: z.number(),
  trust: z.number(),
  currentMode: z.string(),
  availableModes: z.array(z.string()),
  sessions: z.number().min(0),
  lastSuggestion: z.string().nullable(),
});

export const SyndicateSchema = z.object({
  active: z.boolean(),
  debt: z.number().min(0),
  nextPaymentDay: z.number().min(0),
  currentPayment: z.number().min(0),
  daysOverdue: z.number().min(0),
  warnings: z.number().min(0),
  totalPaid: z.number().min(0),
});

export const HomeSchema = z.object({
  level: z.number().min(0),
  upgrades: z.array(z.string()),
  cleanliness: z.number().min(0).max(100),
});

export const QuestStateSchema = z.object({
  active: z.array(z.string()),
  completed: z.array(z.string()),
  available: z.array(z.string()),
});

export const MusicSchema = z.object({
  tracks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quality: z.number(),
    hype: z.number(),
  })),
  currentBeat: z.string().nullable(),
  currentTopic: z.string().nullable(),
  fame: z.number().min(0),
});

export const LogEntrySchema = z.object({
  text: z.string(),
  type: z.enum(['good', 'neutral', 'danger', 'info', 'spirit']),
  timestamp: z.number(),
  day: z.number(),
});

export const WorldSchema = z.object({
  activeEvents: z.array(z.string()),
  history: z.array(z.string()),
  multipliers: z.object({
    gpus: z.number(),
    electronics: z.number(),
    club_income: z.number(),
    fame_gain: z.number(),
    pharma: z.number(),
    crypto_rate: z.number(),
  }),
});

export const GameStateSchema = z.object({
  version: z.string(),
  day: z.number().min(1).max(99999),
  time: z.number().min(0).max(1439),
  currentStage: z.number().min(0),
  status: z.enum(['FREE', 'PRISON', 'HOSPITAL', 'ARRESTED']),

  stats: StatsSchema,
  kpis: KPIsSchema,
  paths: PathsSchema,
  spirit: SpiritSchema,
  neuro: NeuroSchema,
  farm: FarmSchema,
  prison: PrisonSchema,
  casino: CasinoSchema,
  doctor: DoctorSchema,
  syndicate: SyndicateSchema,
  home: HomeSchema,
  quests: QuestStateSchema,
  music: MusicSchema,

  inventory: z.array(z.string()).max(200),
  achievements: z.record(z.string(), z.boolean()),
  log: z.array(LogEntrySchema).max(100),
  story: z.object({
    seenEvents: z.record(z.string(), z.boolean()),
    firstActionDone: z.boolean(),
  }),
  world: WorldSchema,
  chat: z.object({
    conversations: z.record(z.string(), z.unknown()),
  }),
  npcs: z.record(z.string(), z.object({
    reputation: z.number(),
  })),

  jailTime: z.number().min(0).optional(),
  stages: z.array(z.object({
    name: z.string(),
    days: z.array(z.number()),
    checkpoint: z.boolean(),
  })),
});

// Max serialized state size: 100KB
export const MAX_STATE_SIZE = 100_000;

export function validateGameState(state: unknown) {
  const json = JSON.stringify(state);
  if (json.length > MAX_STATE_SIZE) {
    return { success: false as const, error: 'Game state too large' };
  }
  return GameStateSchema.safeParse(state);
}
