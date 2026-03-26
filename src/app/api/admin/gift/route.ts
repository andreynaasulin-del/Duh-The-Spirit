import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Only these Telegram IDs can send gifts
const ADMIN_IDS = ['7984904430'];

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, targetTelegramId, amount, message } = body;

    // Verify admin
    if (!adminId || !ADMIN_IDS.includes(String(adminId))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!targetTelegramId || !amount || amount <= 0 || amount > 1000000) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find target user by telegram_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, telegram_id')
      .eq('telegram_id', String(targetTelegramId))
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current game state
    const { data: gameState } = await supabase
      .from('game_states')
      .select('state')
      .eq('user_id', profile.id)
      .single();

    if (gameState?.state) {
      // Update cash in game state
      const state = gameState.state as Record<string, unknown>;
      const kpis = state.kpis as Record<string, number> || {};
      kpis.cash = (kpis.cash || 0) + amount;
      state.kpis = kpis;

      await supabase
        .from('game_states')
        .update({ state, last_saved_at: new Date().toISOString() })
        .eq('user_id', profile.id);
    }

    // Send notification to user via bot
    if (BOT_TOKEN) {
      const giftMessage = message || `🎁 Тебе подарок от создателя Duh The Spirit!\n\n💰 +${amount.toLocaleString('ru')}₽ на игровой счёт\n\nОткрой игру чтобы забрать!`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetTelegramId,
          text: giftMessage,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              { text: '🎮 Открыть игру', web_app: { url: 'https://www.duhthespirit.app/' } },
            ]],
          },
        }),
      });
    }

    return NextResponse.json({
      success: true,
      gift: {
        to: profile.username,
        telegram_id: targetTelegramId,
        amount,
      },
    });
  } catch (error) {
    console.error('Gift error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
