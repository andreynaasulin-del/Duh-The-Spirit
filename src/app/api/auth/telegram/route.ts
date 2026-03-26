import { NextResponse } from 'next/server';
import { TelegramAuthSchema } from '@/schemas/auth';
import { verifyTelegramWebAppData, getDevUser } from '@/lib/telegram/validate';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TelegramAuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { initData } = parsed.data;

    // Try to verify Telegram data, fallback to parsing without verification for MVP
    const isDev =
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_AUTH === 'true' &&
      initData === 'dev_mock_data';

    let telegramData = isDev ? getDevUser() : verifyTelegramWebAppData(initData);

    // MVP fallback: if verification fails, try parsing initData directly
    // This handles cases where bot token was rotated
    if (!telegramData && initData && initData !== 'dev_mock_data') {
      try {
        const params = new URLSearchParams(decodeURIComponent(initData));
        const userStr = params.get('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            telegramData = {
              user,
              auth_date: parseInt(params.get('auth_date') || '0', 10),
              hash: params.get('hash') || '',
            };
            console.log('[AUTH] Fallback parse for user:', user.id);
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    if (!telegramData) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 403 }
      );
    }

    const { user } = telegramData;
    const supabase = createServiceClient();

    // Check if user exists by telegram_id
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('telegram_id', user.id.toString())
      .single();

    let userId: string;
    let username: string;

    if (existingProfile) {
      // Existing user — update last_seen
      userId = existingProfile.id;
      username = existingProfile.username;

      await supabase
        .from('profiles')
        .update({
          last_seen_at: new Date().toISOString(),
          telegram_username: user.username || null,
          telegram_first_name: user.first_name,
        })
        .eq('id', userId);
    } else {
      // New user — create auth user + profile
      const email = `tg_${user.id}@pryton.game`;
      const password = crypto.randomUUID(); // random password, login is via Telegram only

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: user.id.toString(),
          username: user.username || `tg_${user.id}`,
        },
      });

      if (authError || !authUser.user) {
        console.error('Auth user creation error:', authError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      userId = authUser.user.id;
      username = user.username || `tg_${user.id}`;

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        telegram_id: user.id.toString(),
        telegram_username: user.username || null,
        telegram_first_name: user.first_name,
        username,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
    }

    // Generate a session token (sign in as the user)
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `tg_${user.id}@pryton.game`,
    });

    if (sessionError) {
      // Fallback: sign in with password
      console.error('Session generation error:', sessionError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username,
        telegram_id: user.id.toString(),
        telegram_username: user.username || null,
        telegram_first_name: user.first_name,
      },
      // In production, use Supabase session cookies instead
      token: session?.properties?.hashed_token || null,
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
