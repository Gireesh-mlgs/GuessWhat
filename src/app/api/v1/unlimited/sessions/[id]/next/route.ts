import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { nextUnlimitedRound } from '@/lib/game/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const session = await getOrCreatePlayerSession();
    const gameState = await nextUnlimitedRound(sessionId, session.playerId);

    return NextResponse.json({ success: true, data: gameState });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
