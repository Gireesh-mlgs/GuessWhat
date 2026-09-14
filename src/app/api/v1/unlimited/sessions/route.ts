import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { startUnlimitedSession } from '@/lib/game/service';
import { DifficultyTier, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';
import { seedDatabase } from '@/db/seed';

export async function POST(req: NextRequest) {
  try {
    await seedDatabase();
    const session = await getOrCreatePlayerSession();
    const body = await req.json().catch(() => ({}));
    const tier = (body.tier || 'Easy') as DifficultyTier;
    const category = body.category || 'All';

    if (!DIFFICULTY_MULTIPLIERS[tier]) {
      return NextResponse.json({ success: false, error: 'Invalid difficulty tier' }, { status: 400 });
    }

    const gameState = await startUnlimitedSession(session.playerId, tier, category);
    return NextResponse.json({ success: true, data: gameState });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
