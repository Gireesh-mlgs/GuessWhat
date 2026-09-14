import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { submitRoundAttempt } from '@/lib/game/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roundId } = await params;
    const session = await getOrCreatePlayerSession();
    const body = await req.json().catch(() => ({}));
    const submittedSongId = body.isSkip ? null : (body.submittedSongId ?? null);

    const result = await submitRoundAttempt(roundId, session.playerId, submittedSongId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
