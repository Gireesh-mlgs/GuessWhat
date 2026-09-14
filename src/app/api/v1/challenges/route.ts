import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { createChallenge } from '@/lib/game/service';
import { DifficultyTier, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';
import { seedDatabase } from '@/db/seed';

export async function POST(req: NextRequest) {
  try {
    await seedDatabase();
    const session = await getOrCreatePlayerSession();
    const body = await req.json().catch(() => ({}));
    const songCount = Number(body.songCount) || 5;
    const tier = (body.tier || 'Medium') as DifficultyTier;
    const category = body.category || 'All';
    const creatorName = body.creatorName || session.displayName || 'Challenger';

    if (![5, 10, 20].includes(songCount)) {
      return NextResponse.json({ success: false, error: 'Song count must be 5, 10, or 20' }, { status: 400 });
    }
    if (!DIFFICULTY_MULTIPLIERS[tier]) {
      return NextResponse.json({ success: false, error: 'Invalid difficulty tier' }, { status: 400 });
    }

    const result = await createChallenge(session.playerId, creatorName, songCount, tier, category);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
