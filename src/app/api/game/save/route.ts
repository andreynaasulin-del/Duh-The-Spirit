import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { GAME_VERSION } from '@/config/constants';

export async function POST(req: NextRequest) {
  try {
    const { userId, state } = await req.json();

    if (!userId || !state) {
      return NextResponse.json({ error: 'Missing userId or state' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('game_states')
      .upsert(
        {
          user_id: userId,
          state,
          version: GAME_VERSION,
          last_saved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[Save] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Save] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
