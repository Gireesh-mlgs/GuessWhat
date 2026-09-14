import { NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { getDailyStatus } from '@/lib/game/service';
import { seedDatabase } from '@/db/seed';

export async function GET() {
  try {
    await seedDatabase();
    const session = await getOrCreatePlayerSession();
    const status = await getDailyStatus(session.playerId);

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        player: {
          id: session.playerId,
          displayName: session.displayName,
          leaderboardOptIn: session.leaderboardOptIn,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
