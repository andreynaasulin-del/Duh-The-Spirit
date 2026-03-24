import { z } from 'zod';

export const TelegramAuthSchema = z.object({
  initData: z.string().min(1, 'initData is required'),
});

export const GuestAuthSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long'),
});

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
