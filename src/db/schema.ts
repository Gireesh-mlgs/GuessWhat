import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(), // 'anonymous' | 'account'
  userId: text('user_id'),
  mergedIntoPlayerId: text('merged_into_player_id'),
  createdAt: integer('created_at').notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  leaderboardOptIn: integer('leaderboard_opt_in').notNull().default(0), // 0 or 1
  deletedAt: integer('deleted_at'),
  createdAt: integer('created_at').notNull(),
});

export const songs = sqliteTable('songs', {
  id: text('id').primaryKey(),
  canonicalTitle: text('canonical_title').notNull(),
  primaryArtist: text('primary_artist').notNull(),
  genre: text('genre').notNull(),
  subgenre: text('subgenre'),
  difficultyTier: text('difficulty_tier').notNull(), // 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible'
  status: text('status').notNull().default('active'),
  metadataVersion: integer('metadata_version').notNull().default(1),
});

export const songAliases = sqliteTable('song_aliases', {
  id: text('id').primaryKey(),
  songId: text('song_id').notNull(),
  aliasType: text('alias_type').notNull(), // 'title' | 'artist' | 'misspelling'
  normalizedValue: text('normalized_value').notNull(),
});

export const songClips = sqliteTable('song_clips', {
  id: text('id').primaryKey(),
  songId: text('song_id').notNull(),
  audioUrl: text('audio_url').notNull(),
  startMs: integer('start_ms').notNull().default(0),
  maxDurationMs: integer('max_duration_ms').notNull().default(5000),
  fairnessScore: integer('fairness_score').notNull().default(95),
  reviewStatus: text('review_status').notNull().default('approved'),
});

export const dailyPuzzles = sqliteTable('daily_puzzles', {
  id: text('id').primaryKey(),
  puzzleDate: text('puzzle_date').notNull().unique(), // YYYY-MM-DD UTC
  status: text('status').notNull().default('approved'),
  publishedAt: integer('published_at').notNull(),
});

export const dailyPuzzleItems = sqliteTable('daily_puzzle_items', {
  id: text('id').primaryKey(),
  dailyPuzzleId: text('daily_puzzle_id').notNull(),
  position: integer('position').notNull(), // 1 to 5
  songId: text('song_id').notNull(),
  clipId: text('clip_id').notNull(),
  difficultyTier: text('difficulty_tier').notNull(),
});

export const gameSessions = sqliteTable('game_sessions', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull(),
  mode: text('mode').notNull(), // 'daily' | 'unlimited' | 'challenge'
  dailyPuzzleId: text('daily_puzzle_id'),
  challengeId: text('challenge_id'),
  difficultyTier: text('difficulty_tier').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'abandoned'
  score: integer('score').notNull().default(0),
  skipsCount: integer('skips_count').notNull().default(0),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at'),
});

export const rounds = sqliteTable('rounds', {
  id: text('id').primaryKey(),
  gameSessionId: text('game_session_id').notNull(),
  position: integer('position').notNull(), // 1-based order in session
  songId: text('song_id').notNull(), // Server-authoritative secret!
  clipId: text('clip_id').notNull(),
  state: text('state').notNull().default('unresolved'), // 'unresolved' | 'correct' | 'skipped' | 'exhausted'
  attemptCount: integer('attempt_count').notNull().default(0),
  score: integer('score').notNull().default(0),
  solvedAtAttempt: integer('solved_at_attempt'),
});

export const roundAttempts = sqliteTable('round_attempts', {
  id: text('id').primaryKey(),
  roundId: text('round_id').notNull(),
  attemptNumber: integer('attempt_number').notNull(), // 1 to 5
  submittedSongId: text('submitted_song_id'),
  outcome: text('outcome').notNull(), // 'correct' | 'incorrect' | 'skip'
  createdAt: integer('created_at').notNull(),
});

export const challenges = sqliteTable('challenges', {
  id: text('id').primaryKey(),
  publicCode: text('public_code').notNull().unique(),
  creatorPlayerId: text('creator_player_id').notNull(),
  creatorName: text('creator_name').notNull().default('Challenger'),
  songCount: integer('song_count').notNull().default(5), // 5, 10, 20
  difficultyTier: text('difficulty_tier').notNull(),
  category: text('category').notNull().default('All'),
  status: text('status').notNull().default('active'),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const challengeItems = sqliteTable('challenge_items', {
  id: text('id').primaryKey(),
  challengeId: text('challenge_id').notNull(),
  position: integer('position').notNull(),
  songId: text('song_id').notNull(),
  clipId: text('clip_id').notNull(),
});

export const challengeParticipants = sqliteTable('challenge_participants', {
  id: text('id').primaryKey(),
  challengeId: text('challenge_id').notNull(),
  playerId: text('player_id').notNull(),
  displayName: text('display_name').notNull(),
  sessionId: text('session_id'),
  score: integer('score').notNull().default(0),
  skipsCount: integer('skips_count').notNull().default(0),
  joinedAt: integer('joined_at').notNull(),
  completedAt: integer('completed_at'),
});

export const dailyStreaks = sqliteTable('daily_streaks', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().unique(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastCompletedDate: text('last_completed_date'), // YYYY-MM-DD UTC
});

export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  playerId: text('player_id').notNull(),
  mode: text('mode'),
  metadata: text('metadata'),
  createdAt: integer('created_at').notNull(),
});
