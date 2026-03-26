import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('game_states')
      .select('state, version')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No saved state
        return NextResponse.json({ state: null });
      }
      console.error('[Load] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ state: data?.state || null, version: data?.version });
  } catch (error) {
    console.error('[Load] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
