import { z } from 'zod';

export const CasinoBetSchema = z.object({
  bet: z.number().int().positive().max(1_000_000),
  clientSeed: z.string().max(64).optional(),
});

export const SlotsBetSchema = CasinoBetSchema.extend({
  isGhostActive: z.boolean().default(false),
});

export const DiceBetSchema = CasinoBetSchema.extend({
  betType: z.enum(['over', 'under', 'even', 'odd']),
});

export const BlackjackDealSchema = CasinoBetSchema;

export const BlackjackActionSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(['hit', 'stand', 'double']),
});

export const CrashBetSchema = CasinoBetSchema;

export const CrashCashoutSchema = z.object({
  sessionId: z.string().uuid(),
  cashoutAt: z.number().positive(),
});

export const RouletteBetSchema = z.object({
  bets: z.array(z.object({
    type: z.enum(['color', 'number', 'parity', 'range']),
    value: z.string(),
    amount: z.number().int().positive(),
  })).min(1).max(10),
  clientSeed: z.string().max(64).optional(),
});

export const ThimblesBetSchema = CasinoBetSchema.extend({
  chosenCup: z.number().int().min(0).max(2),
});

export const ChipExchangeSchema = z.object({
  action: z.enum(['buy', 'sell']),
  amount: z.number().int().positive().max(10_000_000),
});
