import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
}

/**
 * Verify Telegram WebApp initData using HMAC-SHA256
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppData(initData: string): TelegramInitData | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  try {
    const encoded = decodeURIComponent(initData);
    const params = new URLSearchParams(encoded);

    const hash = params.get('hash');
    if (!hash) return null;

    // Remove hash from params and sort
    params.delete('hash');
    const entries = Array.from(params.entries());
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    // HMAC verification
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) return null;

    // Check auth_date is not too old (24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    // Parse user data
    const userStr = params.get('user');
    if (!userStr) return null;

    const user: TelegramUser = JSON.parse(userStr);
    if (!user.id) return null;

    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Dev mode bypass for local testing
 */
export function getDevUser(): TelegramInitData {
  return {
    user: {
      id: 999999999,
      first_name: 'Dev',
      username: 'dev_user',
      language_code: 'ru',
    },
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'dev_hash',
  };
}
