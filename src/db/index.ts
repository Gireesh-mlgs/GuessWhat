import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'songsprint.db');
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, '/')}`,
});

export const db = drizzle(client, { schema });

// Initialize tables idempotently
let initialized = false;
export async function initDb() {
  if (initialized) return;

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      user_id TEXT,
      merged_into_player_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      leaderboard_opt_in INTEGER NOT NULL DEFAULT 0,
      deleted_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      canonical_title TEXT NOT NULL,
      primary_artist TEXT NOT NULL,
      genre TEXT NOT NULL,
      subgenre TEXT,
      difficulty_tier TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      has_lyrics INTEGER NOT NULL DEFAULT 1,
      metadata_version INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS song_aliases (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      alias_type TEXT NOT NULL,
      normalized_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS song_clips (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      start_ms INTEGER NOT NULL DEFAULT 0,
      max_duration_ms INTEGER NOT NULL DEFAULT 5000,
      fairness_score INTEGER NOT NULL DEFAULT 95,
      review_status TEXT NOT NULL DEFAULT 'approved'
    );

    CREATE TABLE IF NOT EXISTS daily_puzzles (
      id TEXT PRIMARY KEY,
      puzzle_date TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'approved',
      published_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_puzzle_items (
      id TEXT PRIMARY KEY,
      daily_puzzle_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      song_id TEXT NOT NULL,
      clip_id TEXT NOT NULL,
      difficulty_tier TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      daily_puzzle_id TEXT,
      challenge_id TEXT,
      difficulty_tier TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      score INTEGER NOT NULL DEFAULT 0,
      skips_count INTEGER NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      game_session_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      song_id TEXT NOT NULL,
      clip_id TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'unresolved',
      attempt_count INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      solved_at_attempt INTEGER
    );

    CREATE TABLE IF NOT EXISTS round_attempts (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      submitted_song_id TEXT,
      outcome TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      public_code TEXT NOT NULL UNIQUE,
      creator_player_id TEXT NOT NULL,
      creator_name TEXT NOT NULL DEFAULT 'Challenger',
      song_count INTEGER NOT NULL DEFAULT 5,
      difficulty_tier TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'All',
      status TEXT NOT NULL DEFAULT 'active',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_items (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      song_id TEXT NOT NULL,
      clip_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_participants (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      session_id TEXT,
      score INTEGER NOT NULL DEFAULT 0,
      skips_count INTEGER NOT NULL DEFAULT 0,
      joined_at INTEGER NOT NULL,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS daily_streaks (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL UNIQUE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      player_id TEXT NOT NULL,
      mode TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  try {
    await client.execute(`ALTER TABLE songs ADD COLUMN has_lyrics INTEGER NOT NULL DEFAULT 1`);
  } catch {
    // Column already exists
  }

  initialized = true;
}
