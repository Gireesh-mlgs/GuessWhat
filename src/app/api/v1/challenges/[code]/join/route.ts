import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { joinChallenge } from '@/lib/game/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const session = await getOrCreatePlayerSession();
    const body = await req.json().catch(() => ({}));
    const displayName = body.displayName || session.displayName || 'Sprinter';

    const gameState = await joinChallenge(code, session.playerId, displayName);
    return NextResponse.json({ success: true, data: gameState });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
