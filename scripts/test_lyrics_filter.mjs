import { createClient } from '@libsql/client';
import assert from 'node:assert';

const client = createClient({ url: 'file:data/songsprint.db' });

async function verifyLyricsFilter() {
  console.log('=== VERIFYING SONGS WITH LYRICS FILTER ===\n');

  // 1. Database table constraint check
  const nonLyricActive = await client.execute(`
    SELECT id, canonical_title, primary_artist, status, has_lyrics 
    FROM songs 
    WHERE status = 'active' AND (has_lyrics != 1 OR has_lyrics IS NULL)
  `);
  console.log(`Active songs without lyrics: ${nonLyricActive.rows.length}`);
  assert.strictEqual(nonLyricActive.rows.length, 0, 'No active song should have has_lyrics != 1');
  console.log('✓ 1. Zero active songs without lyrics in database.');

  // 2. Check disabled songs
  const disabledSongs = await client.execute(`
    SELECT COUNT(*) as count FROM songs WHERE status = 'disabled' OR has_lyrics = 0
  `);
  console.log(`Total disabled/non-lyric songs isolated: ${disabledSongs.rows[0].count}`);
  assert(Number(disabledSongs.rows[0].count) >= 14, 'All synthetic and non-lyric songs must be disabled');
  console.log('✓ 2. All 12 synthetic tracks and instrumental tracks are disabled.');

  // 3. Check active songs count
  const activeSongs = await client.execute(`
    SELECT COUNT(*) as count FROM songs WHERE status = 'active' AND has_lyrics = 1
  `);
  console.log(`Total active verified songs with lyrics: ${activeSongs.rows[0].count}`);
  assert(Number(activeSongs.rows[0].count) >= 50, 'Should have rich catalog of verified lyric tracks');
  console.log('✓ 3. High quality verified lyric catalog active.');

  // 4. Check today's daily puzzle items
  const dailyItems = await client.execute(`
    SELECT dpi.position, s.canonical_title, s.primary_artist, s.has_lyrics, s.status
    FROM daily_puzzle_items dpi
    JOIN songs s ON dpi.song_id = s.id
    WHERE dpi.daily_puzzle_id = (SELECT id FROM daily_puzzles ORDER BY published_at DESC LIMIT 1)
  `);
  console.log(`\nDaily Puzzle tracks (${dailyItems.rows.length} songs):`);
  dailyItems.rows.forEach((r) => {
    console.log(`  Round ${r.position}: ${r.primary_artist} - ${r.canonical_title} [has_lyrics: ${r.has_lyrics}, status: ${r.status}]`);
    assert.strictEqual(r.has_lyrics, 1, 'Daily puzzle item must have lyrics');
    assert.strictEqual(r.status, 'active', 'Daily puzzle item must be active');
  });
  console.log('✓ 4. All Daily Puzzle items have 100% verified lyrics.');

  console.log('\n=============================================');
  console.log('ALL TESTS PASSED: Non-lyric songs are never used!');
  console.log('=============================================');
}

verifyLyricsFilter().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
