import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayerSession } from '@/lib/identity/session';
import { getSessionPublicState } from '@/lib/game/service';
import { generateSpoilerSafeShareText } from '@/lib/share/generator';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const session = await getOrCreatePlayerSession();
    const gameState = await getSessionPublicState(sessionId, session.playerId);

    const origin = req.nextUrl.origin;
    const shareText = generateSpoilerSafeShareText({
      mode: gameState.mode,
      puzzleIdentifier: gameState.challengeCode ? `#${gameState.challengeCode}` : `#${new Date().toISOString().split('T')[0]}`,
      difficultyTier: gameState.difficultyTier,
      score: gameState.score,
      maxScore: gameState.maxPossibleScore,
      rounds: gameState.rounds.map((r) => ({
        position: r.position,
        state: r.state === 'unresolved' ? 'exhausted' : r.state,
        solvedAtAttempt: r.solvedAtAttempt,
      })),
      originUrl: gameState.challengeCode ? `${origin}/challenge/${gameState.challengeCode}` : `${origin}/daily`,
    });

    return NextResponse.json({
      success: true,
      data: {
        shareText,
        score: gameState.score,
        maxScore: gameState.maxPossibleScore,
        mode: gameState.mode,
        roundsSummary: gameState.rounds.map((r) => ({
          position: r.position,
          state: r.state,
          solvedAtAttempt: r.solvedAtAttempt,
        })),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
