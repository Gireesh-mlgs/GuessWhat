import { db, initDb } from '@/db';
import {
  songs,
  songClips,
  dailyPuzzles,
  dailyPuzzleItems,
  gameSessions,
  rounds,
  roundAttempts,
  challenges,
  challengeItems,
  challengeParticipants,
  dailyStreaks,
} from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { DifficultyTier, calculateRoundScore, REVEAL_SCHEDULE, getMaxSongScore, getMaxDailyScore } from './scoring';
import { matchesNormalized } from './normalizer';
import { PublicRoundState, PublicSessionState } from './types';
import { getTodayUtcDate, getMillisecondsUntilNextUtcMidnight } from './timing';
import crypto from 'node:crypto';

export type { PublicRoundState, PublicSessionState };
export { getTodayUtcDate, getMillisecondsUntilNextUtcMidnight };

export async function getDailyStatus(playerId: string) {
  await initDb();
  const todayUtc = getTodayUtcDate();

  const puzzle = await db.query.dailyPuzzles.findFirst({
    where: eq(dailyPuzzles.puzzleDate, todayUtc),
  });

  const existingSession = await db.query.gameSessions.findFirst({
    where: and(
      eq(gameSessions.playerId, playerId),
      eq(gameSessions.mode, 'daily'),
      eq(gameSessions.dailyPuzzleId, puzzle?.id || `daily-${todayUtc}`)
    ),
  });

  const streak = await db.query.dailyStreaks.findFirst({
    where: eq(dailyStreaks.playerId, playerId),
  });

  return {
    todayUtc,
    hasAvailableDaily: !!puzzle,
    hasStarted: !!existingSession,
    isCompleted: existingSession?.status === 'completed',
    completedScore: existingSession?.score ?? null,
    lockedTier: existingSession?.difficultyTier ?? null,
    sessionId: existingSession?.id ?? null,
    msUntilReset: getMillisecondsUntilNextUtcMidnight(),
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
  };
}

export async function startOrResumeDailySession(playerId: string, difficultyTier: DifficultyTier): Promise<PublicSessionState> {
  await initDb();
  const todayUtc = getTodayUtcDate();
  const puzzleId = `daily-${todayUtc}`;

  // Check if session already exists
  const existingSession = await db.query.gameSessions.findFirst({
    where: and(
      eq(gameSessions.playerId, playerId),
      eq(gameSessions.mode, 'daily'),
      eq(gameSessions.dailyPuzzleId, puzzleId)
    ),
  });

  if (existingSession) {
    return getSessionPublicState(existingSession.id, playerId);
  }

  // Get daily puzzle items
  let items = await db.query.dailyPuzzleItems.findMany({
    where: eq(dailyPuzzleItems.dailyPuzzleId, puzzleId),
    orderBy: [dailyPuzzleItems.position],
  });

  if (items.length === 0) {
    // If today's items haven't been generated, select 5 active songs
    const allSongs = await db.query.songs.findMany({ where: eq(songs.status, 'active') });
    const selected = allSongs.slice(0, 5);
    items = [];
    for (let i = 0; i < selected.length; i++) {
      const s = selected[i];
      const item = {
        id: `dpi-${puzzleId}-${i + 1}`,
        dailyPuzzleId: puzzleId,
        position: i + 1,
        songId: s.id,
        clipId: `clip-${s.id}`,
        difficultyTier: s.difficultyTier,
      };
      await db.insert(dailyPuzzleItems).values(item).onConflictDoNothing();
      items.push(item);
    }
  }

  // Create new session
  const sessionId = `sess-${crypto.randomUUID()}`;
  await db.insert(gameSessions).values({
    id: sessionId,
    playerId,
    mode: 'daily',
    dailyPuzzleId: puzzleId,
    difficultyTier,
    status: 'active',
    score: 0,
    skipsCount: 0,
    startedAt: Date.now(),
  });

  // Create 5 rounds
  for (const item of items) {
    await db.insert(rounds).values({
      id: `rnd-${sessionId}-${item.position}`,
      gameSessionId: sessionId,
      position: item.position,
      songId: item.songId,
      clipId: item.clipId,
      state: 'unresolved',
      attemptCount: 0,
      score: 0,
    });
  }

  return getSessionPublicState(sessionId, playerId);
}

export async function startUnlimitedSession(playerId: string, difficultyTier: DifficultyTier, category: string): Promise<PublicSessionState> {
  await initDb();
  const allSongs = await db.query.songs.findMany({
    where: eq(songs.status, 'active'),
  });

  let pool = allSongs;
  if (category && category !== 'All') {
    pool = pool.filter((s) => s.genre.toLowerCase() === category.toLowerCase());
  }
  if (pool.length === 0) {
    pool = allSongs;
  }

  // Pick random song
  const chosenSong = pool[Math.floor(Math.random() * pool.length)];
  const sessionId = `unl-${crypto.randomUUID()}`;

  await db.insert(gameSessions).values({
    id: sessionId,
    playerId,
    mode: 'unlimited',
    difficultyTier,
    status: 'active',
    score: 0,
    skipsCount: 0,
    startedAt: Date.now(),
  });

  await db.insert(rounds).values({
    id: `rnd-${sessionId}-1`,
    gameSessionId: sessionId,
    position: 1,
    songId: chosenSong.id,
    clipId: `clip-${chosenSong.id}`,
    state: 'unresolved',
    attemptCount: 0,
    score: 0,
  });

  return getSessionPublicState(sessionId, playerId);
}

export async function nextUnlimitedRound(sessionId: string, playerId: string): Promise<PublicSessionState> {
  await initDb();
  const session = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, sessionId), eq(gameSessions.playerId, playerId)),
  });
  if (!session) throw new Error('Session not found');

  const existingRounds = await db.query.rounds.findMany({
    where: eq(rounds.gameSessionId, sessionId),
    orderBy: [rounds.position],
  });

  const lastRound = existingRounds[existingRounds.length - 1];
  if (lastRound && lastRound.state === 'unresolved') {
    return getSessionPublicState(sessionId, playerId);
  }

  // Exclude songs already played in this session
  const playedSongIds = new Set(existingRounds.map((r) => r.songId));
  const allSongs = await db.query.songs.findMany({ where: eq(songs.status, 'active') });
  let pool = allSongs.filter((s) => !playedSongIds.has(s.id));
  if (pool.length === 0) {
    pool = allSongs;
  }

  const chosenSong = pool[Math.floor(Math.random() * pool.length)];
  const nextPos = existingRounds.length + 1;

  await db.insert(rounds).values({
    id: `rnd-${sessionId}-${nextPos}`,
    gameSessionId: sessionId,
    position: nextPos,
    songId: chosenSong.id,
    clipId: `clip-${chosenSong.id}`,
    state: 'unresolved',
    attemptCount: 0,
    score: 0,
  });

  await db
    .update(gameSessions)
    .set({ status: 'active' })
    .where(eq(gameSessions.id, sessionId));

  return getSessionPublicState(sessionId, playerId);
}

export async function createChallenge(
  playerId: string,
  creatorName: string,
  songCount: number,
  difficultyTier: DifficultyTier,
  category: string
): Promise<{ code: string; challengeId: string }> {
  await initDb();
  let pool = await db.query.songs.findMany({ where: eq(songs.status, 'active') });
  if (category && category !== 'All') {
    const filtered = pool.filter((s) => s.genre.toLowerCase() === category.toLowerCase());
    if (filtered.length >= songCount) pool = filtered;
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(songCount, shuffled.length));

  // Generate unguessable code e.g. SPRINT-9X42
  const randCode = 'SPRINT-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const challengeId = `chal-${crypto.randomUUID()}`;

  await db.insert(challenges).values({
    id: challengeId,
    publicCode: randCode,
    creatorPlayerId: playerId,
    creatorName: creatorName || 'Challenger',
    songCount: selected.length,
    difficultyTier,
    category,
    status: 'active',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    createdAt: Date.now(),
  });

  for (let i = 0; i < selected.length; i++) {
    const s = selected[i];
    await db.insert(challengeItems).values({
      id: `ci-${challengeId}-${i + 1}`,
      challengeId,
      position: i + 1,
      songId: s.id,
      clipId: `clip-${s.id}`,
    });
  }

  return { code: randCode, challengeId };
}

export async function joinChallenge(publicCode: string, playerId: string, displayName: string): Promise<PublicSessionState> {
  await initDb();
  const chal = await db.query.challenges.findFirst({
    where: eq(challenges.publicCode, publicCode.toUpperCase()),
  });
  if (!chal) throw new Error('Challenge not found');
  if (chal.status !== 'active' || chal.expiresAt <= Date.now()) {
    throw new Error('Challenge has expired');
  }

  // Check if participant exists
  const existingPart = await db.query.challengeParticipants.findFirst({
    where: and(eq(challengeParticipants.challengeId, chal.id), eq(challengeParticipants.playerId, playerId)),
  });

  if (existingPart?.sessionId) {
    return getSessionPublicState(existingPart.sessionId, playerId);
  }

  // Create participant session
  const items = await db.query.challengeItems.findMany({
    where: eq(challengeItems.challengeId, chal.id),
    orderBy: [challengeItems.position],
  });

  const sessionId = `chal-sess-${crypto.randomUUID()}`;
  await db.insert(gameSessions).values({
    id: sessionId,
    playerId,
    mode: 'challenge',
    challengeId: chal.id,
    difficultyTier: chal.difficultyTier,
    status: 'active',
    score: 0,
    skipsCount: 0,
    startedAt: Date.now(),
  });

  for (const item of items) {
    await db.insert(rounds).values({
      id: `rnd-${sessionId}-${item.position}`,
      gameSessionId: sessionId,
      position: item.position,
      songId: item.songId,
      clipId: item.clipId,
      state: 'unresolved',
      attemptCount: 0,
      score: 0,
    });
  }

  await db.insert(challengeParticipants).values({
    id: `cp-${chal.id}-${playerId}`,
    challengeId: chal.id,
    playerId,
    displayName: displayName || 'Anonymous Challenger',
    sessionId,
    score: 0,
    skipsCount: 0,
    joinedAt: Date.now(),
  });

  return getSessionPublicState(sessionId, playerId);
}

export async function submitRoundAttempt(
  roundId: string,
  playerId: string,
  submittedSongId: string | null
): Promise<{ round: PublicRoundState; session: PublicSessionState }> {
  await initDb();
  const round = await db.query.rounds.findFirst({
    where: eq(rounds.id, roundId),
  });
  if (!round) throw new Error('Round not found');

  const session = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, round.gameSessionId), eq(gameSessions.playerId, playerId)),
  });
  if (!session) throw new Error('Session unauthorized');
  if (session.status === 'completed') throw new Error('Session already completed');
  if (round.state !== 'unresolved') throw new Error('Round already resolved');

  const attemptNumber = round.attemptCount + 1;
  const isSkip = submittedSongId === null;
  const isMatch = !isSkip && submittedSongId === round.songId;

  let outcome: 'correct' | 'incorrect' | 'skip' = 'incorrect';
  let nextState: 'unresolved' | 'correct' | 'skipped' | 'exhausted' = 'unresolved';
  let roundScore = 0;
  let solvedAt: number | null = null;

  if (isSkip) {
    outcome = 'skip';
    if (attemptNumber >= 5) {
      nextState = 'skipped';
      roundScore = 0;
    } else {
      nextState = 'unresolved';
    }
  } else if (isMatch) {
    outcome = 'correct';
    nextState = 'correct';
    solvedAt = attemptNumber;
    roundScore = calculateRoundScore(attemptNumber, session.difficultyTier as DifficultyTier, 'correct');
  } else {
    outcome = 'incorrect';
    if (attemptNumber >= 5) {
      nextState = 'exhausted';
      roundScore = 0;
    } else {
      nextState = 'unresolved';
    }
  }

  // Record attempt
  await db.insert(roundAttempts).values({
    id: `att-${round.id}-${attemptNumber}`,
    roundId: round.id,
    attemptNumber,
    submittedSongId: submittedSongId || null,
    outcome,
    createdAt: Date.now(),
  });

  // Update round
  await db
    .update(rounds)
    .set({
      attemptCount: attemptNumber,
      state: nextState,
      score: roundScore,
      solvedAtAttempt: solvedAt,
    })
    .where(eq(rounds.id, round.id));

  // Check if session completed
  const allSessionRounds = await db.query.rounds.findMany({
    where: eq(rounds.gameSessionId, session.id),
  });

  const updatedRounds = allSessionRounds.map((r) => (r.id === round.id ? { ...r, state: nextState, score: roundScore } : r));
  const isSessionDone = updatedRounds.every((r) => r.state !== 'unresolved');

  let newTotalScore = session.score;
  const newSkips = session.skipsCount + (isSkip ? 1 : 0);

  if (isSessionDone) {
    newTotalScore = updatedRounds.reduce((acc, r) => acc + r.score, 0);
    const completedAt = Date.now();

    await db
      .update(gameSessions)
      .set({
        status: 'completed',
        score: newTotalScore,
        skipsCount: newSkips,
        completedAt,
      })
      .where(eq(gameSessions.id, session.id));

    // Update Daily Streak if Daily mode
    if (session.mode === 'daily') {
      await updateDailyStreak(playerId);
    }

    // Update Challenge Participant if Challenge mode
    if (session.mode === 'challenge' && session.challengeId) {
      await db
        .update(challengeParticipants)
        .set({
          score: newTotalScore,
          skipsCount: newSkips,
          completedAt,
        })
        .where(
          and(
            eq(challengeParticipants.challengeId, session.challengeId),
            eq(challengeParticipants.playerId, playerId)
          )
        );
    }
  } else {
    // Increment score if resolved
    if (roundScore > 0 || isSkip) {
      newTotalScore = updatedRounds.reduce((acc, r) => acc + r.score, 0);
      await db
        .update(gameSessions)
        .set({
          score: newTotalScore,
          skipsCount: newSkips,
        })
        .where(eq(gameSessions.id, session.id));
    }
  }

  const publicSession = await getSessionPublicState(session.id, playerId);
  const publicRound = publicSession.rounds.find((r) => r.id === round.id)!;
  return { round: publicRound, session: publicSession };
}

async function updateDailyStreak(playerId: string) {
  const todayUtc = getTodayUtcDate();
  const streak = await db.query.dailyStreaks.findFirst({
    where: eq(dailyStreaks.playerId, playerId),
  });

  if (!streak) {
    await db.insert(dailyStreaks).values({
      id: `streak-${playerId}`,
      playerId,
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: todayUtc,
    });
    return;
  }

  if (streak.lastCompletedDate === todayUtc) {
    // Already counted today
    return;
  }

  // Calculate day difference
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayUtc = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (streak.lastCompletedDate === yesterdayUtc) {
    newStreak = streak.currentStreak + 1;
  }

  const longest = Math.max(streak.longestStreak, newStreak);
  await db
    .update(dailyStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: longest,
      lastCompletedDate: todayUtc,
    })
    .where(eq(dailyStreaks.playerId, playerId));
}

export async function getSessionPublicState(sessionId: string, playerId: string): Promise<PublicSessionState> {
  await initDb();
  const session = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, sessionId), eq(gameSessions.playerId, playerId)),
  });
  if (!session) throw new Error('Session not found or unauthorized');

  const sessionRounds = await db.query.rounds.findMany({
    where: eq(rounds.gameSessionId, sessionId),
    orderBy: [rounds.position],
  });

  const clipIds = sessionRounds.map((r) => r.clipId);
  const clips = await db.query.songClips.findMany({
    where: inArray(songClips.id, clipIds),
  });
  const clipMap = new Map(clips.map((c) => [c.id, c]));

  // Find active round index
  let activeRoundIndex = sessionRounds.findIndex((r) => r.state === 'unresolved');
  if (activeRoundIndex === -1) activeRoundIndex = sessionRounds.length - 1;

  const publicRounds: PublicRoundState[] = [];

  for (let i = 0; i < sessionRounds.length; i++) {
    const r = sessionRounds[i];
    const clip = clipMap.get(r.clipId);
    const isResolved = r.state !== 'unresolved';

    // Current playable duration depends on attemptCount
    const currentOpp = Math.min(5, r.attemptCount + 1);
    const oppConfig = REVEAL_SCHEDULE.find((s) => s.opportunity === currentOpp) || REVEAL_SCHEDULE[0];

    let correctAnswer = null;
    if (isResolved) {
      // ONLY reveal answer if round has been resolved!
      const song = await db.query.songs.findFirst({ where: eq(songs.id, r.songId) });
      if (song) {
        correctAnswer = {
          songId: song.id,
          canonicalTitle: song.canonicalTitle,
          primaryArtist: song.primaryArtist,
        };
      }
    }

    publicRounds.push({
      id: r.id,
      position: r.position,
      state: r.state as 'unresolved' | 'correct' | 'skipped' | 'exhausted',
      attemptCount: r.attemptCount,
      currentOpportunity: currentOpp,
      currentDurationMs: oppConfig.durationMs,
      score: r.score,
      solvedAtAttempt: r.solvedAtAttempt,
      audioUrl: clip?.audioUrl || '',
      startMs: clip?.startMs || 0,
      correctAnswer,
    });
  }

  let challengeCode: string | undefined;
  if (session.challengeId) {
    const chal = await db.query.challenges.findFirst({ where: eq(challenges.id, session.challengeId) });
    challengeCode = chal?.publicCode;
  }

  const maxPossible =
    session.mode === 'daily'
      ? getMaxDailyScore(session.difficultyTier as DifficultyTier)
      : publicRounds.length * getMaxSongScore(session.difficultyTier as DifficultyTier);

  return {
    id: session.id,
    mode: session.mode as 'daily' | 'unlimited' | 'challenge',
    difficultyTier: session.difficultyTier as DifficultyTier,
    status: session.status as 'active' | 'completed' | 'abandoned',
    score: session.score,
    skipsCount: session.skipsCount,
    maxPossibleScore: maxPossible,
    rounds: publicRounds,
    activeRoundIndex: Math.max(0, activeRoundIndex),
    completedAt: session.completedAt,
    challengeCode,
  };
}

export async function searchSongs(query: string) {
  await initDb();
  if (!query || query.trim().length < 1) return [];

  const allSongs = await db.query.songs.findMany({
    where: eq(songs.status, 'active'),
  });

  const matching = allSongs.filter(
    (s) => matchesNormalized(s.canonicalTitle, query) || matchesNormalized(s.primaryArtist, query)
  );

  return matching.slice(0, 8).map((s) => ({
    id: s.id,
    canonicalTitle: s.canonicalTitle,
    primaryArtist: s.primaryArtist,
    genre: s.genre,
  }));
}

/** Search only after proving ownership of an active game session. */
export async function searchSongsForSession(sessionId: string, playerId: string, query: string) {
  await initDb();
  const session = await db.query.gameSessions.findFirst({
    where: and(eq(gameSessions.id, sessionId), eq(gameSessions.playerId, playerId)),
  });
  if (!session || session.status !== 'active') {
    throw new Error('Active game session not found');
  }
  return searchSongs(query);
}
