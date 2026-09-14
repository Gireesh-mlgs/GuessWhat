import { cookies } from 'next/headers';
import { db, initDb } from '@/db';
import { players, users, dailyStreaks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

export const PLAYER_COOKIE_NAME = 'songsprint_player';

export interface PlayerSession {
  playerId: string;
  kind: 'anonymous' | 'account';
  userId?: string;
  displayName: string;
  leaderboardOptIn: boolean;
  currentStreak: number;
}

export async function getOrCreatePlayerSession(): Promise<PlayerSession> {
  await initDb();
  const cookieStore = await cookies();
  let playerId = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

  if (playerId) {
    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (existingPlayer) {
      // Check if merged
      if (existingPlayer.mergedIntoPlayerId) {
        playerId = existingPlayer.mergedIntoPlayerId;
      }

      let displayName = 'Anonymous Sprinter';
      let leaderboardOptIn = false;
      let userId: string | undefined;

      if (existingPlayer.userId) {
        userId = existingPlayer.userId;
        const user = await db.query.users.findFirst({
          where: eq(users.id, existingPlayer.userId),
        });
        if (user) {
          displayName = user.displayName;
          leaderboardOptIn = user.leaderboardOptIn === 1;
        }
      }

      const streak = await db.query.dailyStreaks.findFirst({
        where: eq(dailyStreaks.playerId, playerId),
      });

      return {
        playerId,
        kind: existingPlayer.kind as 'anonymous' | 'account',
        userId,
        displayName,
        leaderboardOptIn,
        currentStreak: streak?.currentStreak || 0,
      };
    }
  }

  // Create new anonymous player
  playerId = `player-${crypto.randomUUID()}`;
  await db.insert(players).values({
    id: playerId,
    kind: 'anonymous',
    createdAt: Date.now(),
  });

  await db.insert(dailyStreaks).values({
    id: `streak-${playerId}`,
    playerId,
    currentStreak: 0,
    longestStreak: 0,
  });

  // Set httpOnly cookie
  cookieStore.set(PLAYER_COOKIE_NAME, playerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });

  return {
    playerId,
    kind: 'anonymous',
    displayName: 'Anonymous Sprinter',
    leaderboardOptIn: false,
    currentStreak: 0,
  };
}
