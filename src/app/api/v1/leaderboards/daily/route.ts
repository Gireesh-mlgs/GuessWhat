import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/db';
import { gameSessions, players, users, dailyPuzzles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTodayUtcDate } from '@/lib/game/service';
import { seedDatabase } from '@/db/seed';

export async function GET(req: NextRequest) {
  try {
    await seedDatabase();
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') || getTodayUtcDate();
    const puzzleId = `daily-${date}`;

    // Get completed daily sessions for this puzzle
    const completedSessions = await db.query.gameSessions.findMany({
      where: and(
        eq(gameSessions.mode, 'daily'),
        eq(gameSessions.dailyPuzzleId, puzzleId),
        eq(gameSessions.status, 'completed')
      ),
    });

    const playerIds = completedSessions.map((s) => s.playerId);
    if (playerIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          entries: [],
          totalCompleted: 0,
        },
      });
    }

    // Join with players and users
    const playerRecords = await db.query.players.findMany();
    const userRecords = await db.query.users.findMany();

    const playerMap = new Map(playerRecords.map((p) => [p.id, p]));
    const userMap = new Map(userRecords.map((u) => [u.id, u]));

    // Filter to only opted-in users!
    const eligibleEntries = [];
    for (const session of completedSessions) {
      const player = playerMap.get(session.playerId);
      if (!player || !player.userId) continue;

      const user = userMap.get(player.userId);
      if (!user || user.leaderboardOptIn !== 1) continue;

      eligibleEntries.push({
        sessionId: session.id,
        displayName: user.displayName,
        score: session.score,
        skipsCount: session.skipsCount,
        difficultyTier: session.difficultyTier,
        completedAt: session.completedAt || session.startedAt,
      });
    }

    // Sort by: total score DESC, fewer skips ASC, earlier verified completion ASC
    eligibleEntries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.skipsCount !== b.skipsCount) return a.skipsCount - b.skipsCount;
      return (a.completedAt || 0) - (b.completedAt || 0);
    });

    const ranked = eligibleEntries.map((e, index) => ({
      rank: index + 1,
      ...e,
    }));

    return NextResponse.json({
      success: true,
      data: {
        date,
        entries: ranked,
        totalCompleted: completedSessions.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
