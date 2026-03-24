/**
 * Referral system via Telegram deep linking.
 *
 * Flow:
 * 1. User gets link: t.me/BotUsername?start=ref_<telegramId>
 * 2. New user opens bot → bot sends WebApp with ?startapp=ref_<telegramId>
 * 3. WebApp reads startapp param → stores referrer
 * 4. On auth, referrer gets bonus
 *
 * Rewards:
 * - Referrer: +500₽ cash, +5 respect
 * - New user: +300₽ cash (welcome bonus)
 */

const BOT_USERNAME = 'PrytonGameBot'; // Replace with actual bot username

export const REFERRAL_REWARDS = {
  referrer: { cash: 500, respect: 5 },
  newUser: { cash: 300 },
} as const;

export function generateReferralLink(telegramId: string | number): string {
  return `https://t.me/${BOT_USERNAME}?start=ref_${telegramId}`;
}

export function parseReferralCode(startParam: string | null): string | null {
  if (!startParam) return null;
  const match = startParam.match(/^ref_(\d+)$/);
  return match ? match[1] : null;
}

export function getReferralFromTelegram(): string | null {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  // Telegram passes start_param via initDataUnsafe
  const startParam = tg.initDataUnsafe?.start_param ?? null;
  return parseReferralCode(startParam);
}

export function getShareText(): string {
  return 'Залетай в ДУХ — игра про рэпера из гетто. Выбирай свой путь.';
}
