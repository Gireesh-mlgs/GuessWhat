import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { db, initDb } from '@/db';
import { players, users, dailyStreaks, gameSessions, rounds, roundAttempts, challengeParticipants, challenges } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { PLAYER_COOKIE_NAME } from '@/lib/identity/session';

export async function GET() {
  try {
    await initDb();
    const session = await getOrCreatePlayerSession();

    // Get player's past sessions
    const sessions = await db.query.gameSessions.findMany({
      where: eq(gameSessions.playerId, session.playerId),
      orderBy: [desc(gameSessions.startedAt)],
      limit: 20,
    });

    const streak = await db.query.dailyStreaks.findFirst({
      where: eq(dailyStreaks.playerId, session.playerId),
    });

    return NextResponse.json({
      success: true,
      data: {
        playerId: session.playerId,
        kind: session.kind,
        userId: session.userId,
        displayName: session.displayName,
        leaderboardOptIn: session.leaderboardOptIn,
        streak: {
          current: streak?.currentStreak || 0,
          longest: streak?.longestStreak || 0,
          lastCompletedDate: streak?.lastCompletedDate || null,
        },
        recentSessions: sessions.map((s) => ({
          id: s.id,
          mode: s.mode,
          difficultyTier: s.difficultyTier,
          status: s.status,
          score: s.score,
          skipsCount: s.skipsCount,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
        })),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const session = await getOrCreatePlayerSession();
    const body = await req.json().catch(() => ({}));
    const { displayName, leaderboardOptIn } = body;

    let userId = session.userId;
    if (!userId) {
      userId = `user-${crypto.randomUUID()}`;
      await db.insert(users).values({
        id: userId,
        displayName: displayName || 'Sprinter',
        leaderboardOptIn: leaderboardOptIn ? 1 : 0,
        createdAt: Date.now(),
      });

      await db
        .update(players)
        .set({
          userId,
          kind: 'account',
        })
        .where(eq(players.id, session.playerId));
    } else {
      await db
        .update(users)
        .set({
          ...(displayName ? { displayName } : {}),
          ...(typeof leaderboardOptIn === 'boolean' ? { leaderboardOptIn: leaderboardOptIn ? 1 : 0 } : {}),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      success: true,
      data: {
        displayName: displayName || session.displayName,
        leaderboardOptIn: typeof leaderboardOptIn === 'boolean' ? leaderboardOptIn : session.leaderboardOptIn,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await initDb();
    const session = await getOrCreatePlayerSession();

    // Delete the caller's game history in dependency order. Challenge records
    // created by the player remain only as expired, anonymized shells so links
    // cannot expose their former display name or interrupt other participants.
    const playerSessions = await db.query.gameSessions.findMany({
      where: eq(gameSessions.playerId, session.playerId),
    });
    const sessionIds = playerSessions.map((item) => item.id);
    if (sessionIds.length > 0) {
      const sessionRounds = await db.query.rounds.findMany({
        where: inArray(rounds.gameSessionId, sessionIds),
      });
      const roundIds = sessionRounds.map((item) => item.id);
      if (roundIds.length > 0) {
        await db.delete(roundAttempts).where(inArray(roundAttempts.roundId, roundIds));
      }
      await db.delete(rounds).where(inArray(rounds.gameSessionId, sessionIds));
      await db.delete(gameSessions).where(inArray(gameSessions.id, sessionIds));
    }
    await db.delete(challengeParticipants).where(eq(challengeParticipants.playerId, session.playerId));
    await db
      .update(challenges)
      .set({ creatorName: '[Deleted challenger]', status: 'expired', expiresAt: Date.now() })
      .where(eq(challenges.creatorPlayerId, session.playerId));
    await db.delete(dailyStreaks).where(eq(dailyStreaks.playerId, session.playerId));
    if (session.userId) {
      await db.delete(users).where(eq(users.id, session.userId));
    }
    await db.delete(players).where(eq(players.id, session.playerId));
    (await cookies()).delete(PLAYER_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Player data has been permanently deleted.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
