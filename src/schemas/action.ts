import { z } from 'zod';

export const GameActionSchema = z.object({
  actionId: z.string().min(1).max(64),
});

export const ShopBuySchema = z.object({
  itemId: z.string().min(1).max(64),
  quantity: z.number().int().positive().max(99).default(1),
});

export const DoctorSessionSchema = z.object({
  type: z.enum(['session', 'detox', 'forced_exit']),
});

export const DoctorMedicationSchema = z.object({
  medicationId: z.string().min(1).max(64),
});

export const FarmBuyGPUSchema = z.object({
  gpuId: z.string().min(1).max(64),
});

export const FarmSellCoinsSchema = z.object({
  amount: z.number().positive(),
});

export const GreenhouseActionSchema = z.object({
  action: z.enum(['plant', 'water', 'light', 'harvest']),
  slotIndex: z.number().int().min(0).max(7),
  seedId: z.string().optional(),
});

export const FarmSyncSchema = z.object({
  clientTimestamp: z.number().positive(),
});
