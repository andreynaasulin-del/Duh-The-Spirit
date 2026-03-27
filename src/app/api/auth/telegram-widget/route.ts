import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

interface TelegramWidgetData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramWidget(data: TelegramWidgetData): boolean {
  const { hash, ...rest } = data;

  // Create check string: sorted key=value pairs
  const checkString = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // Secret key = SHA256(bot_token)
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  // Check hash matches
  if (hmac !== hash) return false;

  // Check auth_date is not too old (1 hour)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 3600) return false;

  return true;
}

export async function POST(req: Request) {
  try {
    const body: TelegramWidgetData = await req.json();

    // Verify widget data
    if (!verifyTelegramWidget(body)) {
      return NextResponse.json({ error: 'Invalid auth data' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const telegramId = String(body.id);
    const username = body.username || `user_${body.id}`;
    const firstName = body.first_name || 'Player';

    // Check if user exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, username, telegram_id, telegram_username, telegram_first_name')
      .eq('telegram_id', telegramId)
      .single();

    if (existing) {
      // Update last seen
      await supabase
        .from('profiles')
        .update({
          last_seen_at: new Date().toISOString(),
          telegram_username: username,
          telegram_first_name: firstName,
        })
        .eq('id', existing.id);

      return NextResponse.json({
        success: true,
        user: {
          id: existing.id,
          username: existing.username,
          telegram_id: telegramId,
          telegram_username: username,
          telegram_first_name: firstName,
          photo_url: body.photo_url || null,
        },
      });
    }

    // Create new user via Supabase Auth
    const email = `tg_${telegramId}@duhthespirit.app`;
    const password = crypto.randomBytes(32).toString('hex');

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      telegram_id: telegramId,
      telegram_username: username,
      telegram_first_name: firstName,
      username: username,
    });

    if (profileError) {
      // Username might be taken, try with ID suffix
      await supabase.from('profiles').insert({
        id: authData.user.id,
        telegram_id: telegramId,
        telegram_username: username,
        telegram_first_name: firstName,
        username: `${username}_${telegramId.slice(-4)}`,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        username,
        telegram_id: telegramId,
        telegram_username: username,
        telegram_first_name: firstName,
        photo_url: body.photo_url || null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
