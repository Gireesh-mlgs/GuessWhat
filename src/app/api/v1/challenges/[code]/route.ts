import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/db';
import { challenges, challengeParticipants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getOrCreatePlayerSession } from '@/lib/identity/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    await initDb();
    const { code } = await params;
    const session = await getOrCreatePlayerSession();

    const chal = await db.query.challenges.findFirst({
      where: eq(challenges.publicCode, code.toUpperCase()),
    });
    if (!chal) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    }

    // Get participants scoreboard
    const rawParticipants = await db.query.challengeParticipants.findMany({
      where: eq(challengeParticipants.challengeId, chal.id),
    });

    // Sort by total score DESC, then fewer skips ASC, then earlier completion time ASC
    const sortedParticipants = rawParticipants
      .filter((p) => p.completedAt !== null)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.skipsCount !== b.skipsCount) return a.skipsCount - b.skipsCount;
        return (a.completedAt || 0) - (b.completedAt || 0);
      })
      .map((p, index) => ({
        rank: index + 1,
        displayName: p.displayName,
        score: p.score,
        skipsCount: p.skipsCount,
        completedAt: p.completedAt,
        isCurrentPlayer: p.playerId === session.playerId,
      }));

    // Check if current caller has joined / played
    const myParticipant = rawParticipants.find((p) => p.playerId === session.playerId);

    return NextResponse.json({
      success: true,
      data: {
        code: chal.publicCode,
        creatorName: chal.creatorName,
        songCount: chal.songCount,
        difficultyTier: chal.difficultyTier,
        category: chal.category,
        expiresAt: chal.expiresAt,
        isExpired: Date.now() > chal.expiresAt,
        participants: sortedParticipants,
        totalParticipants: rawParticipants.length,
        hasCompleted: !!myParticipant?.completedAt,
        myScore: myParticipant?.score ?? null,
        mySessionId: myParticipant?.sessionId ?? null,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
