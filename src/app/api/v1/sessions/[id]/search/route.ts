import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { searchSongsForSession } from '@/lib/game/service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const player = await getOrCreatePlayerSession();
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const results = await searchSongsForSession(sessionId, player.playerId, q);

    return NextResponse.json({ success: true, data: results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
